import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Socket } from 'socket.io-client';
import type { GameRound, Room, Position, Player } from '@podorank/shared';
import { Timer } from './ui';

interface GameCanvasProps {
  round: GameRound;
  room: Room;
  socket: Socket;
  timeLeft: number;
}

// 아이소메트릭 캔버스 크기
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

// 게임 월드 크기 (논리적 좌표)
const WORLD_WIDTH = 600;
const WORLD_HEIGHT = 400;

// 디자인 시스템 색상
const COLORS = {
  primary: '#A91E2D',
  primaryLight: '#D94455',
  primaryDark: '#5C1D1F',
  success: '#10B981',
  successLight: '#6EE7B7',
  neutral50: '#FAFAFA',
  neutral200: '#E5E7EB',
  neutral400: '#9CA3AF',
  neutral700: '#374151',
  gold: '#D4AF37',
  grass: '#86EFAC',
  grassDark: '#4ADE80',
  sky: '#E0F2FE',
};

// 플레이어 색상 팔레트 (20명)
const PLAYER_COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#E879F9', '#FBBF24', '#22C55E', '#0EA5E9',
  '#F43F5E', '#8B5CF6', '#A855F7', '#D946EF', '#2DD4BF',
];

// 다른 플레이어들의 위치 상태
interface OtherPlayer extends Player {
  position: Position;
  targetPosition: Position;
  selectedWineId: number | null;
}

export default function GameCanvas({ round, room, socket, timeLeft }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // 내 위치 (월드 좌표)
  const [myPosition, setMyPosition] = useState<Position>({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 80 });
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);

  // 다른 플레이어들
  const [otherPlayers, setOtherPlayers] = useState<Map<string, OtherPlayer>>(new Map());

  // 와인 위치 계산
  const winePositions = getWinePositions(round.wines.length);

  // 월드 좌표 → 아이소메트릭 스크린 좌표 변환
  const worldToScreen = useCallback((worldX: number, worldY: number): Position => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = 180;

    // 월드 중심 기준으로 변환
    const relX = worldX - WORLD_WIDTH / 2;
    const relY = worldY - WORLD_HEIGHT / 2;

    // 아이소메트릭 변환
    const screenX = centerX + relX * 0.8;
    const screenY = centerY + relY * 0.5 + relX * 0.1;

    return { x: screenX, y: screenY };
  }, []);

  // 포도 이동
  const moveGrape = useCallback((dx: number, dy: number) => {
    setMyPosition((prev) => {
      const newX = Math.max(50, Math.min(WORLD_WIDTH - 50, prev.x + dx));
      const newY = Math.max(50, Math.min(WORLD_HEIGHT - 50, prev.y + dy));
      return { x: newX, y: newY };
    });
  }, []);

  // 소켓 이벤트: 내 위치 전송 & 와인 선택
  useEffect(() => {
    socket.emit('move-character', { roomId: room.roomId, position: myPosition });

    const nearWine = findNearestWine(myPosition, winePositions, round.wines);
    if (nearWine !== selectedWineId) {
      setSelectedWineId(nearWine);
      if (nearWine !== null) {
        socket.emit('select-wine', { roomId: room.roomId, wineId: nearWine });
      }
    }
  }, [myPosition, socket, room.roomId, selectedWineId, winePositions, round.wines]);

  // 소켓 이벤트: 다른 플레이어 위치 수신
  useEffect(() => {
    const handleCharacterMove = (data: { playerId: string; position: Position }) => {
      setOtherPlayers((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(data.playerId);
        const player = room.participants.find(p => p.playerId === data.playerId);

        if (player && data.playerId !== socket.id) {
          updated.set(data.playerId, {
            ...player,
            position: existing?.position || data.position,
            targetPosition: data.position,
            selectedWineId: existing?.selectedWineId || null,
          });
        }
        return updated;
      });
    };

    const handleSelectionUpdate = (data: { playerId: string; wineId: number }) => {
      setOtherPlayers((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(data.playerId);
        if (existing) {
          updated.set(data.playerId, { ...existing, selectedWineId: data.wineId });
        }
        return updated;
      });
    };

    socket.on('character-move', handleCharacterMove);
    socket.on('selection-update', handleSelectionUpdate);

    return () => {
      socket.off('character-move', handleCharacterMove);
      socket.off('selection-update', handleSelectionUpdate);
    };
  }, [socket, room.participants]);

  // 키보드 입력
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const MOVE_SPEED = 25;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          moveGrape(0, -MOVE_SPEED);
          break;
        case 'ArrowDown':
        case 's':
          moveGrape(0, MOVE_SPEED);
          break;
        case 'ArrowLeft':
        case 'a':
          moveGrape(-MOVE_SPEED, 0);
          break;
        case 'ArrowRight':
        case 'd':
          moveGrape(MOVE_SPEED, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveGrape]);

  // 캔버스 렌더링 (애니메이션 루프)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 배경 그라데이션 (하늘)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(0.5, '#E0F7FA');
      skyGradient.addColorStop(1, '#C8E6C9');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 잔디 평면 그리기
      drawGrassPlane(ctx, worldToScreen);

      // 모든 렌더링 대상 수집 (Y 정렬을 위해)
      const renderables: Array<{ y: number; render: () => void }> = [];

      // 와인병 추가
      round.wines.forEach((wine, index) => {
        const wPos = winePositions[index];
        const screenPos = worldToScreen(wPos.x, wPos.y);
        const isSelected = selectedWineId === wine.id;

        // 다른 플레이어가 선택한 와인인지 확인
        const selectedByOthers = Array.from(otherPlayers.values())
          .filter(p => p.selectedWineId === wine.id)
          .length;

        renderables.push({
          y: wPos.y,
          render: () => drawWineBottle3D(ctx, screenPos.x, screenPos.y, wine.name, isSelected, selectedByOthers),
        });
      });

      // 다른 플레이어들 추가
      otherPlayers.forEach((player, playerId) => {
        // 부드러운 보간
        const lerp = 0.15;
        player.position.x += (player.targetPosition.x - player.position.x) * lerp;
        player.position.y += (player.targetPosition.y - player.position.y) * lerp;

        const screenPos = worldToScreen(player.position.x, player.position.y);
        const colorIndex = room.participants.findIndex(p => p.playerId === playerId);

        renderables.push({
          y: player.position.y,
          render: () => drawGrape3D(ctx, screenPos.x, screenPos.y, PLAYER_COLORS[colorIndex % PLAYER_COLORS.length], player.nickname, false),
        });
      });

      // 내 캐릭터 추가
      const myScreenPos = worldToScreen(myPosition.x, myPosition.y);
      const myColorIndex = room.participants.findIndex(p => p.playerId === socket.id);
      const myPlayer = room.participants.find(p => p.playerId === socket.id);

      renderables.push({
        y: myPosition.y,
        render: () => drawGrape3D(ctx, myScreenPos.x, myScreenPos.y, PLAYER_COLORS[myColorIndex % PLAYER_COLORS.length], myPlayer?.nickname || '', true),
      });

      // Y 좌표로 정렬 후 렌더링 (뒤에서 앞으로)
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((r) => r.render());

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [myPosition, otherPlayers, round.wines, winePositions, selectedWineId, worldToScreen, room.participants, socket.id]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* 상단 영역 - 타이머 + 라운드 */}
      <div className="flex-shrink-0 flex flex-col items-center pt-sm pb-xs">
        <Timer seconds={timeLeft} maxSeconds={round.duration} />
        <p className="mt-xs text-body-sm text-neutral-500">
          Round {round.roundNum} / 6
        </p>
      </div>

      {/* 캔버스 영역 */}
      <div className="flex-1 flex items-center justify-center px-sm overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl shadow-lg max-w-full max-h-full"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* 현재 선택 표시 */}
      <div className="flex-shrink-0 h-10 flex items-center justify-center">
        {selectedWineId !== null && (
          <div className="px-md py-xs bg-success-500 rounded-full shadow-md">
            <span className="text-body-sm font-semibold text-white">
              ✓ {round.wines.find((w) => w.id === selectedWineId)?.name}
            </span>
          </div>
        )}
      </div>

      {/* 플로팅 조이스틱 */}
      <div className="flex-shrink-0 pb-md pt-xs px-md">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-sm mx-auto max-w-[180px]">
          <div className="grid grid-cols-3 gap-xs">
            <div />
            <JoystickButton onPress={() => moveGrape(0, -30)} icon={<ChevronUp size={20} />} />
            <div />
            <JoystickButton onPress={() => moveGrape(-30, 0)} icon={<ChevronLeft size={20} />} />
            <JoystickButton onPress={() => moveGrape(0, 30)} icon={<ChevronDown size={20} />} />
            <JoystickButton onPress={() => moveGrape(30, 0)} icon={<ChevronRight size={20} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 조이스틱 버튼
function JoystickButton({ onPress, icon }: { onPress: () => void; icon: React.ReactNode }) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onPress();
    intervalRef.current = setInterval(onPress, 100);
  }, [onPress]);

  const endPress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <button
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      className="
        w-12 h-12
        bg-primary-700 hover:bg-primary-800 active:bg-primary-900 active:scale-95
        text-white rounded-xl
        flex items-center justify-center
        transition-all duration-75
        shadow-md
        select-none
      "
      style={{ touchAction: 'manipulation' }}
    >
      {icon}
    </button>
  );
}

// 잔디 평면 그리기
function drawGrassPlane(ctx: CanvasRenderingContext2D, worldToScreen: (x: number, y: number) => Position) {
  const corners = [
    worldToScreen(0, 0),
    worldToScreen(WORLD_WIDTH, 0),
    worldToScreen(WORLD_WIDTH, WORLD_HEIGHT),
    worldToScreen(0, WORLD_HEIGHT),
  ];

  // 잔디 그라데이션
  const gradient = ctx.createLinearGradient(0, corners[0].y, 0, corners[2].y);
  gradient.addColorStop(0, '#86EFAC');
  gradient.addColorStop(0.5, '#4ADE80');
  gradient.addColorStop(1, '#22C55E');

  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  corners.forEach((c) => ctx.lineTo(c.x, c.y));
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // 잔디 패턴 (점선)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const y = (WORLD_HEIGHT / 10) * i;
    const start = worldToScreen(0, y);
    const end = worldToScreen(WORLD_WIDTH, y);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  for (let i = 0; i <= 10; i++) {
    const x = (WORLD_WIDTH / 10) * i;
    const start = worldToScreen(x, 0);
    const end = worldToScreen(x, WORLD_HEIGHT);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
}

// 3D 스타일 와인병
function drawWineBottle3D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  isMySelection: boolean,
  othersCount: number
) {
  const scale = 1.2;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 45, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 선택 시 글로우
  if (isMySelection) {
    ctx.shadowColor = COLORS.success;
    ctx.shadowBlur = 25;
  }

  const bottleColor = isMySelection ? COLORS.success : COLORS.primary;
  const labelColor = isMySelection ? COLORS.successLight : COLORS.gold;

  // 병 몸통
  ctx.fillStyle = bottleColor;

  // 병목
  ctx.beginPath();
  ctx.roundRect(-5, -55, 10, 22, 3);
  ctx.fill();

  // 코르크
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.roundRect(-4, -62, 8, 10, 2);
  ctx.fill();

  // 병 어깨 & 몸통
  ctx.fillStyle = bottleColor;
  ctx.beginPath();
  ctx.moveTo(-5, -33);
  ctx.quadraticCurveTo(-5, -25, -16, -18);
  ctx.lineTo(-16, 38);
  ctx.quadraticCurveTo(-16, 42, -12, 42);
  ctx.lineTo(12, 42);
  ctx.quadraticCurveTo(16, 42, 16, 38);
  ctx.lineTo(16, -18);
  ctx.quadraticCurveTo(5, -25, 5, -33);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  // 라벨
  ctx.fillStyle = labelColor;
  ctx.beginPath();
  ctx.roundRect(-12, -5, 24, 32, 3);
  ctx.fill();

  // 라벨 디테일
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.roundRect(-8, 2, 16, 4, 1);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.roundRect(-6, 10, 12, 3, 1);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-5, 16, 10, 3, 1);
  ctx.fill();

  // 병 하이라이트
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.roundRect(-14, -12, 4, 48, 2);
  ctx.fill();

  // 와인 이름
  ctx.fillStyle = COLORS.neutral700;
  ctx.font = 'bold 11px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const displayName = name.length > 10 ? name.slice(0, 9) + '…' : name;
  ctx.fillText(displayName, 0, 50);

  // 선택한 플레이어 수 표시
  if (othersCount > 0 || isMySelection) {
    const total = othersCount + (isMySelection ? 1 : 0);
    ctx.fillStyle = COLORS.primary;
    ctx.beginPath();
    ctx.arc(18, -50, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), 18, -50);
  }

  ctx.restore();
}

// 3D 스타일 포도 캐릭터 (피크민 스타일)
function drawGrape3D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  nickname: string,
  isMe: boolean
) {
  const radius = isMe ? 18 : 14;

  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, radius + 5, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 내 캐릭터 글로우
  if (isMe) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
  }

  // 몸통 그라데이션
  const bodyGradient = ctx.createRadialGradient(
    -radius * 0.3, -radius * 0.3, 0,
    0, 0, radius
  );
  bodyGradient.addColorStop(0, lightenColor(color, 40));
  bodyGradient.addColorStop(0.6, color);
  bodyGradient.addColorStop(1, darkenColor(color, 30));

  // 몸통 (타원형 - 더 귀엽게)
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 1.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGradient;
  ctx.fill();

  ctx.shadowBlur = 0;

  // 테두리
  ctx.strokeStyle = darkenColor(color, 40);
  ctx.lineWidth = 2;
  ctx.stroke();

  // 눈 (귀여운 피크민 스타일)
  const eyeY = -radius * 0.15;
  const eyeSpacing = radius * 0.35;

  // 눈 흰자
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(-eyeSpacing, eyeY, radius * 0.25, radius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(eyeSpacing, eyeY, radius * 0.25, radius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 눈동자
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(-eyeSpacing + 1, eyeY + 1, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeSpacing + 1, eyeY + 1, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 눈 하이라이트
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(-eyeSpacing - 1, eyeY - 2, radius * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeSpacing - 1, eyeY - 2, radius * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // 볼터치
  ctx.fillStyle = 'rgba(255,150,150,0.4)';
  ctx.beginPath();
  ctx.ellipse(-eyeSpacing - radius * 0.2, eyeY + radius * 0.4, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(eyeSpacing + radius * 0.2, eyeY + radius * 0.4, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // 꼭지 (포도 줄기)
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.moveTo(0, -radius * 1.1);
  ctx.lineTo(-3, -radius * 1.1 - 8);
  ctx.lineTo(3, -radius * 1.1 - 8);
  ctx.closePath();
  ctx.fill();

  // 작은 잎
  ctx.fillStyle = '#32CD32';
  ctx.beginPath();
  ctx.ellipse(4, -radius * 1.1 - 6, 6, 3, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // 몸통 하이라이트
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-radius * 0.3, -radius * 0.4, radius * 0.35, radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // 닉네임
  if (nickname) {
    ctx.fillStyle = isMe ? color : COLORS.neutral700;
    ctx.font = `${isMe ? 'bold ' : ''}10px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 배경
    const textWidth = ctx.measureText(nickname).width;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 4, radius + 8, textWidth + 8, 14, 4);
    ctx.fill();

    ctx.fillStyle = isMe ? darkenColor(color, 20) : COLORS.neutral700;
    ctx.fillText(nickname, 0, radius + 10);
  }

  ctx.restore();
}

// 색상 밝게
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// 색상 어둡게
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// 와인 위치 (월드 좌표 - 상단에 배치)
function getWinePositions(count: number): Position[] {
  const startY = 60;
  const spacing = WORLD_WIDTH / (count + 1);

  return Array.from({ length: count }, (_, i) => ({
    x: spacing * (i + 1),
    y: startY + (i % 2 === 0 ? 0 : 20), // 지그재그 배치
  }));
}

// 가장 가까운 와인 찾기
function findNearestWine(
  pos: Position,
  winePositions: Position[],
  wines: GameRound['wines']
): number | null {
  const PROXIMITY_THRESHOLD = 70;

  for (let i = 0; i < winePositions.length; i++) {
    const wPos = winePositions[i];
    const distance = Math.sqrt(
      Math.pow(pos.x - wPos.x, 2) + Math.pow(pos.y - wPos.y, 2)
    );
    if (distance < PROXIMITY_THRESHOLD) {
      return wines[i].id;
    }
  }
  return null;
}
