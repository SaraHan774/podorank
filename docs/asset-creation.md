# Wine Game App - 애셋 제작 가이드

당신의 상황: 혼자, 빠르게, 저렴하게 → **AI + 무료 리소스 + 코드 기반** 조합이 최적.

---

## 1️⃣ 필요한 애셋 리스트

### 게임 구성요소

```
🟡 포도알 캐릭터 (6-20개)
├─ 색상: 최소 10가지 (빨강, 파랑, 노랑, 초록, 보라, 주황, 분홍, 갈색, 회색, 검정)
├─ 크기: 32x32px ~ 64x64px
├─ 상태: 기본 + 호버 (2개 상태)
└─ 형식: PNG 투명 or SVG

🍾 와인병 이미지
├─ 기본: 5개 (각 와인마다 1개)
├─ 크기: 200x300px (또는 240x360px)
├─ 배경: 투명 권장
└─ 형식: PNG 투명 or SVG

🎨 UI 요소
├─ 버튼 배경 (선택사항, Tailwind로 충분)
├─ 카드 배경
├─ 타이머 배경 (선택사항)
└─ 게임 배경 (단색 또는 그라데이션)

🔧 아이콘 (30개 이상)
├─ 설정, 공유, 나가기, 플레이, 정지
├─ 사용자, 통계, 다운로드, 새로고침
└─ 경고, 성공, 오류 상태

🎬 애니메이션/효과
├─ 포도알 이동 (코드로 처리)
├─ 타이머 카운트다운 (코드)
├─ 선택 완료 이펙트 (파티클 또는 SVG)
└─ 라운드 시작 트랜지션

📝 텍스트 에셋
├─ 와인 이름 (당신이 입력)
├─ 라운드 설명
└─ 안내 메시지
```

---

## 2️⃣ 옵션별 비교 및 추천

### Option A: 100% 코드 기반 (포도알)

**방법:** Claude/ChatGPT로 SVG 생성

**장점:**
- 비용 $0
- 색상 자유롭게 변경 가능
- 반응형 (크기 조정 쉬움)
- 애니메이션 통합 가능

**단점:**
- 정교한 디자인 어려움 (심플한 모양만)
- 초기 설정 시간

**예시 - 포도알 SVG:**
```jsx
<svg width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <style>{`
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .grape { animation: bounce 0.8s infinite; }
    `}</style>
  </defs>
  <circle cx="32" cy="32" r="28" fill="#FF5733" />
  <circle cx="28" cy="28" r="6" fill="#FFFFFF" opacity="0.3" />
</svg>
```

**추천 사용:** ✅ 포도알 (심플, 조정 많음)

---

### Option B: AI 이미지 생성 (와인병, 배경)

**방법:** Midjourney, DALL-E 3, Stable Diffusion

**장점:**
- 빠름 (1-2분)
- 사실적 이미지 가능
- 배경도 생성 가능

**단점:**
- 비용: Midjourney ($10-20/월), DALL-E ($0.015-0.04/이미지)
- 저작권 확인 필요
- 일관성 유지 어려움

**프롬프트 예시:**

```
와인병 이미지 (Midjourney 스타일)
"A elegant wine bottle labeled 'Laspiñeta Campé 2005', 
gold and red label, on white background, studio lighting, 
high detail, 3D render, transparent background, 
minimal, modern design, 8k"
```

**추천 사용:** ✅ 와인병 (5개만 필요, 가성비 좋음)

**비용:** 5개 와인 × $0.02-0.04 = $0.10-0.20 (매우 저렴)

---

### Option C: 무료 Stock Photo + 편집

**방법:** Unsplash, Pexels, Pixabay에서 와인병 검색 → 배경 제거

**장점:**
- 비용 $0
- 사진 기반 (자연스러움)
- 다양한 와인 스타일 가능

**단점:**
- 배경 제거 필요 (Remove.bg 사용)
- 일관성 확보 어려움
- 시간 소모

**추천 사용:** ✅ 초기 프로토타입 (빠르게 시작)

---

### Option D: 아이콘 라이브러리

**방법:** Lucide React, Heroicons (무료, React 통합)

**장점:**
- 비용 $0
- React 컴포넌트 (즉시 사용)
- 일관성 자동 보장
- 30+ 아이콘 기본 포함

**단점:**
- 커스텀 아이콘 불가능 (원하는 게 없으면)

**추천 사용:** ✅ 모든 UI 아이콘 (버튼, 네비게이션)

```javascript
import { Share2, Settings, Play, Pause } from 'lucide-react';

<Share2 size={24} /> // 자동 크기 조정
```

---

### Option E: 디자인 도구 (Figma)

**방법:** Figma에서 직접 그려서 내보내기 (SVG/PNG)

**장점:**
- 완벽한 커스터마이징
- 일관성 유지 쉬움
- 재사용 가능

**단점:**
- 학습곡선 있음
- 시간 소모 (디자이너 아니면 오래)

**추천 사용:** ❌ 당신은 할 시간이 없음 (바쁜 일정)

---

### Option F: 애니메이션 라이브러리

**방법:** Framer Motion, React Spring (코드 기반)

**장점:**
- 매끄러운 애니메이션
- 성능 최적화됨
- 게임에 필수

**단점:**
- 별도 학습 필요

**추천 사용:** ✅ 포도알 이동, 타이머 애니메이션

---

## 3️⃣ 최적 조합 (당신의 상황)

### 추천 전략: 하이브리드 (비용 최소, 시간 최소)

```
🟡 포도알 캐릭터
├─ 방법: SVG (Claude로 생성)
├─ 비용: $0
├─ 시간: 30분
└─ 색상: CSS로 동적 변경

🍾 와인병 이미지
├─ 방법: AI 이미지 생성 (DALL-E or Midjourney)
├─ 비용: $1-2 (5개)
├─ 시간: 10-15분
└─ 또는: Remove.bg로 Stock Photo 편집 ($0, +15분)

🔧 모든 UI 아이콘
├─ 방법: Lucide React (무료)
├─ 비용: $0
├─ 시간: 0분 (설치만)
└─ 필요하면: 커스텀 SVG 1-2개

🎨 배경 & UI
├─ 방법: Tailwind CSS 그라데이션
├─ 비용: $0
├─ 시간: 10분
└─ 복잡하면: AI 배경 이미지 1개

💫 애니메이션
├─ 방법: CSS + Framer Motion
├─ 비용: $0
├─ 시간: Phase 4에 진행

총 비용: $1-2
총 시간: 1-2시간
```

---

## 4️⃣ 단계별 구현 가이드

### Step 1: 포도알 SVG 생성 (30분)

**Claude 프롬프트:**

```markdown
React 컴포넌트로 포도알을 만들어줄 수 있어?

요구사항:
- SVG 기반 (확장성)
- 크기: 64x64px, 반응형
- 색상: Props로 받기 (예: color="#FF5733")
- 상태: 2가지 (기본, 선택됨)
- 애니메이션: 기본 bounce 또는 pulse

코드:
```jsx
export function Grape({ color = "#FF5733", selected = false }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      {/* SVG 코드 */}
    </svg>
  );
}
```

- 색상은 자동으로 변경되어야 함
- 아바타처럼 바로 사용 가능하게
```

**결과:** 수초 안에 재사용 가능한 컴포넌트

---

### Step 2: 와인병 이미지 획득 (15분)

#### 옵션 A: DALL-E (추천)

```
OpenAI API 또는 ChatGPT Plus 사용

프롬프트 예:
"Create a wine bottle image for: Laspiñeta Campé 2005
- Style: Elegant, minimalist
- Background: White or transparent
- Focus: Bottle label clearly visible
- Format: High quality 3D render
- Resolution: 1000x1500px"
```

**비용:** $0.02-0.04/이미지

#### 옵션 B: Midjourney

```
프롬프트:
"/imagine prompt: Professional wine bottle 'Laspiñeta'
with red and gold label, studio lighting,
transparent background, 8k quality,
minimal, elegant, modern packaging design --ar 2:3 --no watermark"
```

**비용:** Midjourney 구독 ($10/월) → 월 25개 이미지 가능

#### 옵션 C: Free + Remove.bg (무료)

```
1. Unsplash/Pexels에서 "wine bottle Laspiñeta" 검색
2. Remove.bg에 업로드 (회원가입 후 월 50개 무료)
3. PNG 다운로드
4. Figma나 Photoshop에서 약간 보정 (선택사항)
```

**비용:** $0

**추천:** 초기는 **Option C (무료)**, 나중에 고급으로 **Option A (저렴)**

---

### Step 3: 아이콘 라이브러리 설치 (5분)

```bash
npm install lucide-react
```

**사용:**

```jsx
import { 
  Share2, 
  Settings, 
  Play, 
  Pause,
  Users,
  Award,
  Download
} from 'lucide-react';

export function GameHeader() {
  return (
    <div>
      <Play size={24} /> {/* 자동으로 크기 조정 */}
      <Settings size={20} />
      <Share2 size={20} />
    </div>
  );
}
```

**추가 필요 아이콘:**
- 설정, 공유, 나가기 → Lucide에 이미 있음
- 포도 아이콘 → 없음 (직접 SVG 또는 이모지 🍇)
- 와인잔 아이콘 → 없음 (이모지 🍷 사용)

---

### Step 4: 배경 & 색상 (20분)

#### 게임 배경 (Tailwind로 충분)

```jsx
// GameRoom.jsx
export default function GameRoom() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      {/* 게임 콘텐츠 */}
    </div>
  );
}
```

#### 와인병 배경 제거 필수

```bash
# Remove.bg 온라인 사용 (권장)
1. https://www.remove.bg 방문
2. 와인병 이미지 업로드
3. PNG 다운로드
4. /public/wines/ 폴더에 저장

또는:

# Figma로 자동 배경 제거
1. Figma에서 Remove Background 플러그인
2. 이미지 투명화
3. SVG 또는 PNG 내보내기
```

---

### Step 5: 와인병 React 컴포넌트화 (20분)

```jsx
// components/WineBottle.jsx
export function WineBottle({ name, image, selected = false }) {
  return (
    <div className={`relative transition-all ${selected ? 'scale-105 shadow-lg' : ''}`}>
      <img 
        src={image} 
        alt={name}
        className="w-32 h-48 object-contain"
      />
      <p className="text-center text-sm font-semibold mt-2 truncate">
        {name}
      </p>
      {selected && (
        <div className="absolute inset-0 ring-2 ring-success-500 rounded-lg" />
      )}
    </div>
  );
}
```

---

## 5️⃣ 파일 구조 및 관리

```
wine-game-app/
├─ frontend/
│  ├─ public/
│  │  ├─ wines/
│  │  │  ├─ laspiñeta.png
│  │  │  ├─ chardonnay.png
│  │  │  ├─ moscato.png
│  │  │  ├─ riesling.png
│  │  │  └─ nero-davola.png
│  │  ├─ backgrounds/
│  │  │  └─ game-bg.jpg (선택사항)
│  │  └─ favicon.ico (와인잔 이모지)
│  │
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ Grape.jsx         (포도알 SVG)
│  │  │  ├─ WineBottle.jsx    (와인병 이미지)
│  │  │  ├─ GameIcons.jsx     (Lucide 아이콘들)
│  │  │  └─ ... 기타
│  │  │
│  │  └─ assets/
│  │     └─ svg/
│  │        ├─ grape.svg      (혹시 모를 백업)
│  │        └─ particles.svg  (파티클 이펙트)
│  │
│  └─ package.json (lucide-react 포함)
```

---

## 6️⃣ 실전 타이밍

### Phase 1-2 (기본 게임, 통계)

```
✅ 필수 애셋
├─ Lucide 아이콘 (설치만)
├─ 포도알 SVG (Claude 생성)
├─ 와인병 이미지 5개 (임시로 Stock Photo 사용)
└─ Tailwind 배경

⏭️ 나중에
└─ 고급 애니메이션, 3D 와인병
```

**비용:** $0-1 (Stock Photo만 제거하면 $0)

---

### Phase 3 (QR, 마스터 기능)

```
✅ 추가 애셋
├─ QR 코드 생성 (라이브러리, 무료)
└─ 모달 배경

⏭️ 여전히 나중에
└─ 파티클 이펙트
```

---

### Phase 4 (포도알 그래픽)

```
✅ 최종 애셋
├─ 포도알 애니메이션 (Framer Motion)
├─ 와인병 최종 이미지 (Midjourney $20)
├─ 파티클 이펙트 SVG (Claude 생성)
└─ 효과음 (Freesound.org, 무료)

필요하면
└─ 3D 와인병 모델 (Babylon.js로 렌더링)
```

---

## 7️⃣ 구체적 Claude 프롬프트들

### 프롬프트 1: 포도알 SVG 생성

```markdown
와인 게임의 포도알 캐릭터를 React SVG 컴포넌트로 만들어줘.

요구사항:
- 크기: 64x64px (유동적으로 조정 가능)
- 모양: 동그란 포도 알갱이 (반투명 하이라이트 있음)
- 색상: Props로 받기 (예: color="#FF5733")
- 상태 2가지:
  ├─ 기본: 그냥 포도알
  └─ 선택됨: 테두리 또는 빛남 효과
- 애니메이션: bounce 또는 pulse (CSS animation)

코드 형태:
\`\`\`jsx
export function Grape({ 
  color = "#FF5733", 
  size = 64,
  selected = false,
  animated = false 
}) {
  // SVG 반환
}
\`\`\`

- 모든 색상이 잘 보이도록 (밝은 색, 어두운 색 모두)
- 하이라이트는 흰색 투명도 30%
- 애니메이션은 @keyframes로 CSS animation 사용
```

---

### 프롬프트 2: 와인병 컴포넌트

```markdown
와인병 이미지를 표시하는 React 컴포넌트를 만들어줘.

Props:
- image: 이미지 경로 (string)
- name: 와인 이름 (string, 최대 30자)
- selected: 선택됨 여부 (boolean)
- onClick: 클릭 핸들러

요구사항:
- 투명 배경 지원 (PNG)
- 호버 시 scale 1.05 + shadow 증가
- 선택됨 시: 테두리 2px 또는 ring 추가
- 와인 이름은 overflow 시 말줄임
- 크기: 기본 128x192px (비율 2:3 유지)
- 트랜지션: smooth (300ms)

Tailwind로 스타일링.
```

---

### 프롬프트 3: 파티클 이펙트

```markdown
선택 완료 시 나타날 파티클 이펙트를 SVG + CSS Animation으로 만들어줘.

요구사항:
- 5-7개의 작은 원이 포도알 위치에서 터져 나옴
- 색상: Primary #A91E2D와 Success #10B981 믹스
- 애니메이션: 0.6초 동안 바깥쪽으로 퍼짐 + fade out
- 반복 가능 (props로 trigger)

예시:
\`\`\`jsx
<ParticleEffect 
  trigger={selected} 
  color="#A91E2D"
  x={100}
  y={100}
/>
\`\`\`

- 성능을 위해 CSS animation 사용
- removeChild로 DOM 정리
```

---

## 8️⃣ 비용 정리

| 항목 | 방법 | 비용 | 시간 | 질 |
|------|------|------|------|-----|
| 포도알 | SVG (Claude) | $0 | 30분 | ⭐⭐⭐⭐ |
| 와인병 | Stock Photo | $0 | 20분 | ⭐⭐⭐ |
| 와인병 고급 | DALL-E | $0.10 | 5분 | ⭐⭐⭐⭐⭐ |
| 아이콘 | Lucide React | $0 | 5분 | ⭐⭐⭐⭐ |
| 배경 | Tailwind | $0 | 10분 | ⭐⭐⭐ |
| 애니메이션 | CSS/Framer | $0 | Phase 4 | ⭐⭐⭐⭐ |
| **총합** | **하이브리드** | **$0-2** | **1-2시간** | **⭐⭐⭐⭐** |

---

## 9️⃣ 실제 구현 체크리스트

### 지금 바로 (Phase 1)

```
□ Lucide React 설치
  npm install lucide-react

□ 포도알 SVG 생성 (Claude)
  → Grape.jsx 파일 생성

□ Stock Photo로 와인병 5개 다운로드
  → /public/wines/ 폴더에 저장
  → Remove.bg로 배경 제거

□ WineBottle.jsx 컴포넌트 작성

□ Tailwind 배경 설정
  → bg-gradient-to-b from-neutral-50 to-neutral-100

□ 게임 화면에서 Grape + WineBottle 렌더링 테스트
```

### Phase 4 (나중에)

```
□ Midjourney로 와인병 고급 이미지 생성 ($20)
  → 기존 Stock Photo 교체

□ Framer Motion 설치
  npm install framer-motion

□ 포도알 이동 애니메이션 (Framer Motion)

□ 파티클 이펙트 SVG (Claude)

□ 효과음 (Freesound.org, 무료)
  → Phase 5 배포 시
```

---

## 🎯 최종 추천

**당신의 상황 (바쁜 일정, 혼자, 저예산):**

```
지금 해야 할 것:
1️⃣ Lucide React 설치 (5분)
2️⃣ Claude로 포도알 SVG 만들기 (30분)
3️⃣ Stock Photo에서 와인병 다운로드 (15분)
4️⃣ Remove.bg로 배경 제거 (10분)
5️⃣ WineBottle.jsx 만들기 (15분)

→ 총 1시간 15분, 비용 $0

나중에 (Phase 4):
- Midjourney로 와인병 업그레이드 ($20, 선택사항)
- Framer Motion으로 애니메이션 고도화
```

이렇게 하면 **품질은 유지하면서 속도는 빠르고, 비용도 최소**다.

시작할 준비 됐어?