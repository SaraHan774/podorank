import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Socket } from 'socket.io-client';
import type { GameRound, Room, Position } from '@podorank/shared';

import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  PBRMaterial,
  Mesh,
  ShadowGenerator,
  GlowLayer,
  Animation,
  CubicEase,
  DynamicTexture,
} from '@babylonjs/core';

interface GameCanvas3DProps {
  round: GameRound;
  room: Room;
  socket: Socket;
  timeLeft: number;
}

// 게임 상수
const WORLD_SIZE = 50; // 더 넓은 필드 (20명 수용)
const GRAPE_RADIUS = 0.4;
const MOVE_SPEED = 1.2;
const WINE_SELECTION_RADIUS = 5; // 와인 선택 반경 (넓게)

// 플로팅 라벨 생성 함수 - 크고 잘 보이게
function createFloatingLabel(scene: Scene, text: string): Mesh {
  const charWidth = 0.5;
  const planeWidth = Math.max(4, text.length * charWidth + 1.5);
  const planeHeight = 1.8;

  const labelPlane = MeshBuilder.CreatePlane('floatingLabel', {
    width: planeWidth,
    height: planeHeight,
  }, scene);

  const textureResolution = 512;
  const dynamicTexture = new DynamicTexture('labelTexture', {
    width: textureResolution * (planeWidth / planeHeight),
    height: textureResolution,
  }, scene);

  const ctx = dynamicTexture.getContext() as CanvasRenderingContext2D;

  // 배경 (둥근 사각형 - 와인색)
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const radius = 40;

  // 그림자 효과
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;

  // 와인색 배경
  ctx.fillStyle = '#8B1538';
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(w - radius, 0);
  ctx.quadraticCurveTo(w, 0, w, radius);
  ctx.lineTo(w, h - radius);
  ctx.quadraticCurveTo(w, h, w - radius, h);
  ctx.lineTo(radius, h);
  ctx.quadraticCurveTo(0, h, 0, h - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // 금색 테두리
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 12;
  ctx.stroke();

  // 내부 테두리
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 텍스트 (흰색, 크게)
  const fontSize = Math.min(180, 600 / text.length);
  ctx.font = `bold ${fontSize}px Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 텍스트 그림자
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillText(text, w / 2, h / 2);

  dynamicTexture.update();

  const labelMat = new StandardMaterial('floatingLabelMat', scene);
  labelMat.diffuseTexture = dynamicTexture;
  labelMat.emissiveTexture = dynamicTexture;
  labelMat.emissiveColor = Color3.White().scale(0.5);
  labelMat.specularColor = Color3.Black();
  labelMat.backFaceCulling = false;
  labelMat.useAlphaFromDiffuseTexture = true;
  dynamicTexture.hasAlpha = true;

  labelPlane.material = labelMat;
  labelPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

  return labelPlane;
}

// 색상 팔레트 (20명)
const PLAYER_COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#E879F9', '#FBBF24', '#22C55E', '#0EA5E9',
  '#F43F5E', '#8B5CF6', '#A855F7', '#D946EF', '#2DD4BF',
];

interface OtherPlayerState {
  mesh: Mesh | null;
  targetPosition: Vector3;
  selectedWineId: number | null;
  nickname: string;
  color: string;
}

export default function GameCanvas3D({ round, room, socket, timeLeft }: GameCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const playerMeshRef = useRef<Mesh | null>(null);
  const otherPlayersRef = useRef<Map<string, OtherPlayerState>>(new Map());
  const wineBottlesRef = useRef<Map<number, Mesh>>(new Map());

  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [myPosition, setMyPosition] = useState<Vector3>(new Vector3(0, GRAPE_RADIUS, WORLD_SIZE / 2 - 3));

  // 와인 위치 계산 (화면 중앙 근처에 배치)
  const getWinePositions = useCallback((count: number): Vector3[] => {
    const spacing = Math.min(12, (WORLD_SIZE - 16) / count);
    const totalWidth = spacing * (count - 1);
    const startX = -totalWidth / 2;

    return Array.from({ length: count }, (_, i) => {
      const x = startX + spacing * i;
      // 약간 지그재그로 배치
      const z = -5 + (i % 2 === 0 ? 0 : 3);
      return new Vector3(x, 0, z);
    });
  }, []);

  // 포도 캐릭터 생성
  const createGrapeCharacter = useCallback((
    scene: Scene,
    color: string,
    isMe: boolean,
    shadowGenerator?: ShadowGenerator
  ): Mesh => {
    const radius = isMe ? GRAPE_RADIUS : GRAPE_RADIUS * 0.85;

    // 몸통 (구)
    const body = MeshBuilder.CreateSphere('grapeBody', {
      diameter: radius * 2,
      segments: 32,
    }, scene);

    const bodyMat = new PBRMaterial('grapeMat', scene);
    bodyMat.albedoColor = Color3.FromHexString(color);
    bodyMat.metallic = 0.1;
    bodyMat.roughness = 0.6;
    bodyMat.emissiveColor = Color3.FromHexString(color).scale(isMe ? 0.15 : 0.05);
    body.material = bodyMat;

    // 눈 (흰자)
    const eyeWhiteL = MeshBuilder.CreateSphere('eyeL', { diameter: radius * 0.4, segments: 16 }, scene);
    const eyeWhiteR = MeshBuilder.CreateSphere('eyeR', { diameter: radius * 0.4, segments: 16 }, scene);

    const eyeWhiteMat = new StandardMaterial('eyeWhiteMat', scene);
    eyeWhiteMat.diffuseColor = Color3.White();
    eyeWhiteMat.specularColor = Color3.White();
    eyeWhiteL.material = eyeWhiteMat;
    eyeWhiteR.material = eyeWhiteMat;

    eyeWhiteL.position = new Vector3(-radius * 0.3, radius * 0.2, -radius * 0.7);
    eyeWhiteR.position = new Vector3(radius * 0.3, radius * 0.2, -radius * 0.7);
    eyeWhiteL.parent = body;
    eyeWhiteR.parent = body;

    // 눈동자
    const pupilL = MeshBuilder.CreateSphere('pupilL', { diameter: radius * 0.2, segments: 12 }, scene);
    const pupilR = MeshBuilder.CreateSphere('pupilR', { diameter: radius * 0.2, segments: 12 }, scene);

    const pupilMat = new StandardMaterial('pupilMat', scene);
    pupilMat.diffuseColor = Color3.Black();
    pupilL.material = pupilMat;
    pupilR.material = pupilMat;

    pupilL.position = new Vector3(0, 0, -radius * 0.15);
    pupilR.position = new Vector3(0, 0, -radius * 0.15);
    pupilL.parent = eyeWhiteL;
    pupilR.parent = eyeWhiteR;

    // 꼭지 (포도 줄기)
    const stem = MeshBuilder.CreateCylinder('stem', {
      height: radius * 0.5,
      diameterTop: radius * 0.1,
      diameterBottom: radius * 0.2,
    }, scene);

    const stemMat = new StandardMaterial('stemMat', scene);
    stemMat.diffuseColor = Color3.FromHexString('#228B22');
    stem.material = stemMat;
    stem.position = new Vector3(0, radius + radius * 0.2, 0);
    stem.parent = body;

    // 잎
    const leaf = MeshBuilder.CreateDisc('leaf', { radius: radius * 0.4, tessellation: 8 }, scene);
    const leafMat = new StandardMaterial('leafMat', scene);
    leafMat.diffuseColor = Color3.FromHexString('#32CD32');
    leafMat.backFaceCulling = false;
    leaf.material = leafMat;
    leaf.position = new Vector3(radius * 0.3, radius + radius * 0.35, 0);
    leaf.rotation = new Vector3(Math.PI / 4, 0, Math.PI / 6);
    leaf.parent = body;

    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(body);
    }

    return body;
  }, []);

  // 와인병 생성 (보르도 스타일 - 리얼한 버전)
  const createWineBottle = useCallback((
    scene: Scene,
    position: Vector3,
    name: string,
    shadowGenerator?: ShadowGenerator
  ): Mesh => {
    const root = new Mesh('wineRoot', scene);
    root.position = new Vector3(position.x, 0, position.z);

    // 스케일 (더 크게)
    const scale = 1.3;

    // 병 바닥 (펀트 - 와인병 바닥의 오목한 부분)
    const base = MeshBuilder.CreateCylinder('base', {
      height: 0.15 * scale,
      diameterTop: 0.9 * scale,
      diameterBottom: 0.85 * scale,
      tessellation: 32,
    }, scene);
    base.position.y = 0.075 * scale;
    base.parent = root;

    // 병 몸통 (메인 바디 - 넓은 부분)
    const bodyMain = MeshBuilder.CreateCylinder('bodyMain', {
      height: 2.2 * scale,
      diameterTop: 0.85 * scale,
      diameterBottom: 0.9 * scale,
      tessellation: 32,
    }, scene);
    bodyMain.position.y = 1.25 * scale;
    bodyMain.parent = root;

    // 어깨 (숄더 - 부드럽게 좁아지는 부분)
    const shoulder = MeshBuilder.CreateCylinder('shoulder', {
      height: 0.5 * scale,
      diameterTop: 0.4 * scale,
      diameterBottom: 0.85 * scale,
      tessellation: 32,
    }, scene);
    shoulder.position.y = 2.6 * scale;
    shoulder.parent = root;

    // 병목 (긴 목)
    const neck = MeshBuilder.CreateCylinder('neck', {
      height: 1.2 * scale,
      diameterTop: 0.32 * scale,
      diameterBottom: 0.4 * scale,
      tessellation: 24,
    }, scene);
    neck.position.y = 3.45 * scale;
    neck.parent = root;

    // 병목 상단 (립 - 두꺼운 테두리)
    const lip = MeshBuilder.CreateCylinder('lip', {
      height: 0.15 * scale,
      diameterTop: 0.38 * scale,
      diameterBottom: 0.32 * scale,
      tessellation: 24,
    }, scene);
    lip.position.y = 4.125 * scale;
    lip.parent = root;

    // 와인병 유리 재질 (깊은 초록색)
    const glassMat = new PBRMaterial('glassMat', scene);
    glassMat.albedoColor = Color3.FromHexString('#0a2818');
    glassMat.metallic = 0.05;
    glassMat.roughness = 0.08;
    glassMat.alpha = 0.88;
    glassMat.indexOfRefraction = 1.5;
    glassMat.subSurface.isRefractionEnabled = true;
    glassMat.subSurface.refractionIntensity = 0.8;
    glassMat.subSurface.tintColor = Color3.FromHexString('#0a2818');

    base.material = glassMat;
    bodyMain.material = glassMat;
    shoulder.material = glassMat;
    neck.material = glassMat;
    lip.material = glassMat;

    // 포일 캡 (상단)
    const foilTop = MeshBuilder.CreateCylinder('foilTop', {
      height: 0.08 * scale,
      diameter: 0.4 * scale,
      tessellation: 24,
    }, scene);
    foilTop.position.y = 4.24 * scale;
    foilTop.parent = root;

    const foilSide = MeshBuilder.CreateCylinder('foilSide', {
      height: 0.5 * scale,
      diameterTop: 0.4 * scale,
      diameterBottom: 0.42 * scale,
      tessellation: 24,
    }, scene);
    foilSide.position.y = 3.95 * scale;
    foilSide.parent = root;

    const foilMat = new PBRMaterial('foilMat', scene);
    foilMat.albedoColor = Color3.FromHexString('#722F37');
    foilMat.metallic = 0.9;
    foilMat.roughness = 0.2;
    foilTop.material = foilMat;
    foilSide.material = foilMat;

    // 라벨 (큰 크림색 라벨)
    const labelWidth = 0.7 * scale;
    const labelHeight = 1.0 * scale;
    const label = MeshBuilder.CreatePlane('label', { width: labelWidth, height: labelHeight }, scene);

    // 라벨 텍스처 (다이나믹)
    const labelTexture = new DynamicTexture('bottleLabelTex', { width: 256, height: 384 }, scene);
    const lctx = labelTexture.getContext() as CanvasRenderingContext2D;

    // 라벨 배경
    lctx.fillStyle = '#FFFEF5';
    lctx.fillRect(0, 0, 256, 384);

    // 테두리
    lctx.strokeStyle = '#D4AF37';
    lctx.lineWidth = 8;
    lctx.strokeRect(10, 10, 236, 364);

    // 장식 라인
    lctx.strokeStyle = '#8B0000';
    lctx.lineWidth = 2;
    lctx.strokeRect(20, 20, 216, 344);

    // 와인 이름 (작게, 라벨에)
    const labelFontSize = Math.min(36, 200 / name.length);
    lctx.font = `bold ${labelFontSize}px Georgia, serif`;
    lctx.fillStyle = '#1a1a1a';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillText(name.substring(0, 12), 128, 192);

    // 장식 텍스트
    lctx.font = '14px Georgia, serif';
    lctx.fillStyle = '#666';
    lctx.fillText('PRODUCT OF', 128, 100);
    lctx.fillText('FINE WINE', 128, 280);

    labelTexture.update();

    const labelMat = new StandardMaterial('labelMat', scene);
    labelMat.diffuseTexture = labelTexture;
    labelMat.emissiveColor = Color3.White().scale(0.1);
    labelMat.specularColor = Color3.Black();
    labelMat.backFaceCulling = false;
    label.material = labelMat;
    label.position = new Vector3(0, 1.5 * scale, -0.46 * scale);
    label.parent = root;

    // 플로팅 이름 라벨 (와인병 위 - 크게)
    const nameLabel = createFloatingLabel(scene, name);
    nameLabel.position = new Vector3(0, 6.5, 0);
    nameLabel.parent = root;

    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(bodyMain);
      shadowGenerator.addShadowCaster(shoulder);
      shadowGenerator.addShadowCaster(neck);
    }

    root.metadata = { name, selected: false };
    return root;
  }, []);

  // 씬 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 엔진 생성
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    // 씬 생성
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.53, 0.81, 0.92, 1); // 하늘색
    sceneRef.current = scene;

    // 카메라 (아이소메트릭 뷰) - 넓은 필드용
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3.2, // 조금 더 위에서
      45, // 더 멀리서
      new Vector3(0, 0, 0),
      scene
    );
    camera.lowerRadiusLimit = 25;
    camera.upperRadiusLimit = 60;
    camera.lowerBetaLimit = 0.3;
    camera.upperBetaLimit = Math.PI / 2.5;

    // 환경광
    const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;
    hemiLight.diffuse = Color3.FromHexString('#FFFAF0');
    hemiLight.groundColor = Color3.FromHexString('#87CEEB');

    // 태양광 (그림자용)
    const sunLight = new DirectionalLight('sunLight', new Vector3(-1, -2, -1), scene);
    sunLight.intensity = 0.8;
    sunLight.diffuse = Color3.FromHexString('#FFF8DC');
    sunLight.position = new Vector3(10, 20, 10);

    // 그림자
    const shadowGenerator = new ShadowGenerator(2048, sunLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    shadowGenerator.darkness = 0.3;

    // 글로우 효과
    const glowLayer = new GlowLayer('glow', scene, {
      mainTextureFixedSize: 512,
      blurKernelSize: 64,
    });
    glowLayer.intensity = 0.5;

    // 바닥 (잔디)
    const ground = MeshBuilder.CreateGround('ground', {
      width: WORLD_SIZE,
      height: WORLD_SIZE,
      subdivisions: 32,
    }, scene);

    const groundMat = new PBRMaterial('groundMat', scene);
    groundMat.albedoColor = Color3.FromHexString('#4ADE80');
    groundMat.metallic = 0;
    groundMat.roughness = 0.9;
    ground.material = groundMat;
    ground.receiveShadows = true;

    // 잔디 경계 (약간 어두운 테두리)
    const borderMat = new StandardMaterial('borderMat', scene);
    borderMat.diffuseColor = Color3.FromHexString('#22C55E');

    for (let i = 0; i < 4; i++) {
      const border = MeshBuilder.CreateBox('border' + i, {
        width: i % 2 === 0 ? WORLD_SIZE : 0.3,
        height: 0.2,
        depth: i % 2 === 0 ? 0.3 : WORLD_SIZE,
      }, scene);
      border.material = borderMat;
      border.position = new Vector3(
        i === 1 ? WORLD_SIZE / 2 : i === 3 ? -WORLD_SIZE / 2 : 0,
        0.1,
        i === 0 ? -WORLD_SIZE / 2 : i === 2 ? WORLD_SIZE / 2 : 0
      );
    }

    // 내 포도 캐릭터 생성
    const myColorIndex = room.participants.findIndex(p => p.playerId === socket.id);
    const myColor = PLAYER_COLORS[myColorIndex >= 0 ? myColorIndex % PLAYER_COLORS.length : 0];
    const playerMesh = createGrapeCharacter(scene, myColor, true, shadowGenerator);
    playerMesh.position = myPosition.clone();
    playerMeshRef.current = playerMesh;

    // 와인병 및 선택 영역 생성
    const winePositions = getWinePositions(round.wines.length);
    round.wines.forEach((wine, index) => {
      const pos = winePositions[index];

      // 선택 영역 (바닥 원형)
      const selectionZone = MeshBuilder.CreateDisc('zone_' + wine.id, {
        radius: WINE_SELECTION_RADIUS,
        tessellation: 48,
      }, scene);
      selectionZone.rotation.x = Math.PI / 2;
      selectionZone.position = new Vector3(pos.x, 0.02, pos.z);

      const zoneMat = new StandardMaterial('zoneMat_' + wine.id, scene);
      zoneMat.diffuseColor = Color3.FromHexString('#10B981');
      zoneMat.alpha = 0.15;
      zoneMat.emissiveColor = Color3.FromHexString('#10B981').scale(0.3);
      zoneMat.backFaceCulling = false;
      selectionZone.material = zoneMat;

      // 선택 영역 테두리
      const zoneBorder = MeshBuilder.CreateTorus('zoneBorder_' + wine.id, {
        diameter: WINE_SELECTION_RADIUS * 2,
        thickness: 0.08,
        tessellation: 48,
      }, scene);
      zoneBorder.rotation.x = Math.PI / 2;
      zoneBorder.position = new Vector3(pos.x, 0.05, pos.z);

      const borderMat2 = new StandardMaterial('borderMat_' + wine.id, scene);
      borderMat2.diffuseColor = Color3.FromHexString('#10B981');
      borderMat2.emissiveColor = Color3.FromHexString('#10B981').scale(0.5);
      zoneBorder.material = borderMat2;

      // 와인병
      const bottle = createWineBottle(scene, pos, wine.name, shadowGenerator);
      wineBottlesRef.current.set(wine.id, bottle);
    });

    // 카메라 타겟 설정
    camera.setTarget(new Vector3(0, 1, 0));

    // 렌더 루프
    engine.runRenderLoop(() => {
      // 다른 플레이어 위치 보간
      otherPlayersRef.current.forEach((playerState) => {
        if (playerState.mesh) {
          playerState.mesh.position = Vector3.Lerp(
            playerState.mesh.position,
            playerState.targetPosition,
            0.15
          );
        }
      });

      scene.render();
    });

    // 리사이즈 대응
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [round.wines, room.participants, socket.id, createGrapeCharacter, createWineBottle, getWinePositions]);

  // 캐릭터 이동
  const movePlayer = useCallback((dx: number, dz: number) => {
    if (!playerMeshRef.current) return;

    const newX = Math.max(-WORLD_SIZE / 2 + 1, Math.min(WORLD_SIZE / 2 - 1, playerMeshRef.current.position.x + dx));
    const newZ = Math.max(-WORLD_SIZE / 2 + 1, Math.min(WORLD_SIZE / 2 - 1, playerMeshRef.current.position.z + dz));

    // 부드러운 이동 애니메이션
    const scene = sceneRef.current;
    if (scene) {
      Animation.CreateAndStartAnimation(
        'moveAnim',
        playerMeshRef.current,
        'position',
        60,
        8,
        playerMeshRef.current.position,
        new Vector3(newX, GRAPE_RADIUS, newZ),
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        new CubicEase()
      );

      // 이동 방향으로 약간 회전
      if (dx !== 0 || dz !== 0) {
        const targetRotation = Math.atan2(dx, dz);
        Animation.CreateAndStartAnimation(
          'rotateAnim',
          playerMeshRef.current,
          'rotation.y',
          60,
          8,
          playerMeshRef.current.rotation.y,
          targetRotation,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
          new CubicEase()
        );
      }
    }

    setMyPosition(new Vector3(newX, GRAPE_RADIUS, newZ));
  }, []);

  // 소켓 이벤트: 내 위치 전송
  useEffect(() => {
    socket.emit('move-character', {
      roomId: room.roomId,
      position: { x: myPosition.x, y: myPosition.z }, // 2D 좌표로 변환
    });

    // 와인 선택 체크
    const winePositions = getWinePositions(round.wines.length);
    let nearestWine: number | null = null;
    let minDist = WINE_SELECTION_RADIUS; // 넓은 선택 영역

    winePositions.forEach((wPos, index) => {
      const dist = Math.sqrt(
        Math.pow(myPosition.x - wPos.x, 2) + Math.pow(myPosition.z - wPos.z, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearestWine = round.wines[index].id;
      }
    });

    // 와인병 하이라이트 업데이트
    wineBottlesRef.current.forEach((bottle, wineId) => {
      const isSelected = wineId === nearestWine;
      // 자식 메쉬들의 재질 업데이트
      bottle.getChildMeshes().forEach((child) => {
        if (child.material && child.material instanceof PBRMaterial) {
          const mat = child.material as PBRMaterial;
          if (child.name.includes('body') || child.name.includes('neck') || child.name === 'lip') {
            mat.emissiveColor = isSelected
              ? Color3.FromHexString('#10B981').scale(0.4)
              : Color3.Black();
          }
        }
      });
    });

    if (nearestWine !== selectedWineId) {
      setSelectedWineId(nearestWine);
      if (nearestWine !== null) {
        socket.emit('select-wine', { roomId: room.roomId, wineId: nearestWine });
      }
    }
  }, [myPosition, socket, room.roomId, selectedWineId, round.wines, getWinePositions]);

  // 소켓 이벤트: 다른 플레이어 위치/선택 수신
  useEffect(() => {
    const handleCharacterMove = (data: { playerId: string; position: Position }) => {
      if (data.playerId === socket.id) return;

      const scene = sceneRef.current;
      if (!scene) return;

      let playerState = otherPlayersRef.current.get(data.playerId);

      if (!playerState) {
        const player = room.participants.find(p => p.playerId === data.playerId);
        if (!player) return;

        const colorIndex = room.participants.findIndex(p => p.playerId === data.playerId);
        const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
        const mesh = createGrapeCharacter(scene, color, false);
        mesh.position = new Vector3(data.position.x, GRAPE_RADIUS * 0.85, data.position.y);

        playerState = {
          mesh,
          targetPosition: new Vector3(data.position.x, GRAPE_RADIUS * 0.85, data.position.y),
          selectedWineId: null,
          nickname: player.nickname,
          color,
        };
        otherPlayersRef.current.set(data.playerId, playerState);
      } else {
        playerState.targetPosition = new Vector3(data.position.x, GRAPE_RADIUS * 0.85, data.position.y);
      }
    };

    const handleSelectionUpdate = (data: { playerId: string; wineId: number }) => {
      const playerState = otherPlayersRef.current.get(data.playerId);
      if (playerState) {
        playerState.selectedWineId = data.wineId;
      }
    };

    socket.on('character-move', handleCharacterMove);
    socket.on('selection-update', handleSelectionUpdate);

    return () => {
      socket.off('character-move', handleCharacterMove);
      socket.off('selection-update', handleSelectionUpdate);
    };
  }, [socket, room.participants, createGrapeCharacter]);

  // 키보드 입력
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(0, -MOVE_SPEED);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(0, MOVE_SPEED);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(-MOVE_SPEED, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(MOVE_SPEED, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // 타이머 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* 3D 캔버스 (풀스크린) */}
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
      />

      {/* 오버레이 UI */}
      {/* 상단 정보 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        {/* 타이머 */}
        <div className={`
          px-6 py-3 rounded-2xl shadow-lg backdrop-blur
          ${timeLeft <= 5 ? 'bg-red-500/90 animate-pulse' : 'bg-white/90'}
        `}>
          <span className={`text-3xl font-bold font-mono ${timeLeft <= 5 ? 'text-white' : 'text-neutral-800'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* 라운드 정보 */}
        <div className="px-4 py-2 bg-white/90 rounded-xl shadow-lg backdrop-blur">
          <span className="text-lg font-semibold text-primary-700">
            Round {round.roundNum} / 6
          </span>
        </div>
      </div>

      {/* 선택한 와인 표시 */}
      {selectedWineId !== null && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-6 py-3 bg-emerald-500 rounded-full shadow-lg">
            <span className="text-white font-semibold text-lg">
              ✓ {round.wines.find(w => w.id === selectedWineId)?.name}
            </span>
          </div>
        </div>
      )}

      {/* 원형 조이스틱 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <CircularJoystick onMove={(dx, dz) => movePlayer(dx * MOVE_SPEED, dz * MOVE_SPEED)} />
      </div>

      {/* 플레이어 수 */}
      <div className="absolute bottom-8 right-4 pointer-events-none">
        <div className="px-4 py-2 bg-white/90 rounded-xl shadow-lg backdrop-blur">
          <span className="text-sm text-neutral-600">
            👥 {room.participants.length}명
          </span>
        </div>
      </div>

    </div>
  );
}

// 원형 조이스틱 컴포넌트
function CircularJoystick({ onMove }: { onMove: (dx: number, dz: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [activeDirection, setActiveDirection] = useState<string | null>(null);

  const OUTER_RADIUS = 70;
  const INNER_RADIUS = 28;
  const DEAD_ZONE = 15;

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = OUTER_RADIUS - INNER_RADIUS;

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }

    setKnobPosition({ x: dx, y: dy });

    // 방향 결정 (4방향) - 화면 기준으로 정확하게
    if (distance > DEAD_ZONE) {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      let direction: string;

      if (absY > absX) {
        // 수직 방향이 더 강함
        direction = dy < 0 ? 'up' : 'down';
      } else {
        // 수평 방향이 더 강함
        direction = dx < 0 ? 'left' : 'right';
      }

      setActiveDirection(direction);
    } else {
      setActiveDirection(null);
    }
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    handleMove(clientX, clientY);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    setActiveDirection(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [isDragging, handleMove]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  // 활성 방향에 따라 이동
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (activeDirection && isDragging) {
      const moveByDirection = () => {
        switch (activeDirection) {
          case 'up':
            onMove(0, -1);
            break;
          case 'down':
            onMove(0, 1);
            break;
          case 'left':
            onMove(-1, 0);
            break;
          case 'right':
            onMove(1, 0);
            break;
        }
      };

      moveByDirection();
      intervalRef.current = setInterval(moveByDirection, 80);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeDirection, isDragging, onMove]);

  // 전역 이벤트 처리
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      handleMove(clientX, clientY);
    };

    const handleGlobalEnd = () => {
      if (isDragging) handleEnd();
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('touchend', handleGlobalEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onMouseDown={onMouseDown}
      className="relative select-none"
      style={{
        width: OUTER_RADIUS * 2,
        height: OUTER_RADIUS * 2,
        touchAction: 'none',
      }}
    >
      {/* 외부 링 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.5)',
        }}
      />

      {/* 4방향 섹션 - 직관적으로 */}
      <svg className="absolute inset-0" viewBox="0 0 140 140">
        {/* 위 */}
        <path
          d="M 70 70 L 30 30 A 60 60 0 0 1 110 30 Z"
          fill={activeDirection === 'up' ? '#A91E2D' : '#3a3a3a'}
          className="transition-colors duration-100"
        />
        {/* 오른쪽 */}
        <path
          d="M 70 70 L 110 30 A 60 60 0 0 1 110 110 Z"
          fill={activeDirection === 'right' ? '#A91E2D' : '#3a3a3a'}
          className="transition-colors duration-100"
        />
        {/* 아래 */}
        <path
          d="M 70 70 L 110 110 A 60 60 0 0 1 30 110 Z"
          fill={activeDirection === 'down' ? '#A91E2D' : '#3a3a3a'}
          className="transition-colors duration-100"
        />
        {/* 왼쪽 */}
        <path
          d="M 70 70 L 30 110 A 60 60 0 0 1 30 30 Z"
          fill={activeDirection === 'left' ? '#A91E2D' : '#3a3a3a'}
          className="transition-colors duration-100"
        />
        {/* 중앙 원 (섹션 분리용) */}
        <circle cx="70" cy="70" r="25" fill="#2a2a2a" />
      </svg>

      {/* 방향 아이콘 */}
      <div className="absolute inset-0 pointer-events-none">
        <ChevronUp
          className={`absolute left-1/2 -translate-x-1/2 top-3 w-5 h-5 transition-colors ${
            activeDirection === 'up' ? 'text-white' : 'text-neutral-500'
          }`}
        />
        <ChevronDown
          className={`absolute left-1/2 -translate-x-1/2 bottom-3 w-5 h-5 transition-colors ${
            activeDirection === 'down' ? 'text-white' : 'text-neutral-500'
          }`}
        />
        <ChevronLeft
          className={`absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 transition-colors ${
            activeDirection === 'left' ? 'text-white' : 'text-neutral-500'
          }`}
        />
        <ChevronRight
          className={`absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5 transition-colors ${
            activeDirection === 'right' ? 'text-white' : 'text-neutral-500'
          }`}
        />
      </div>

      {/* 중앙 노브 */}
      <div
        className="absolute rounded-full shadow-lg transition-transform duration-75"
        style={{
          width: INNER_RADIUS * 2,
          height: INNER_RADIUS * 2,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
          background: 'radial-gradient(circle at 30% 30%, #5a5a5a, #2a2a2a)',
          boxShadow: isDragging
            ? '0 0 20px rgba(169, 30, 45, 0.6), 0 4px 12px rgba(0,0,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
          border: '2px solid #1a1a1a',
        }}
      />
    </div>
  );
}
