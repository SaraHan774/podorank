# Wine Game App - Design System & Claude Prompting Guide

당신이 제공한 "Design Sense 가이드"를 Wine Game App 개발에 적용하기 위한 구조화된 프롬프트와 디자인 원칙들.

---

## Part 1: Design System Lock-in (디자인 토큰 정의)

### 1.1 기본 원칙
**Wine Game App은 게임화된 대시보드이므로:**
- 명확한 위계 (게임 화면 vs 통계)
- 실시간 피드백 (타이머, 포도알 이동)
- 직관적 조작성 (모바일 터치 중심)
- 와인의 "감정"을 담은 따뜻한 톤

---

### 1.2 Design Tokens (Claude에게 제공할 기본 값들)

```
🎨 COLOR SYSTEM

Primary (게임 강조)
├─ Primary-900: #5C1D1F (와인색 진함)
├─ Primary-700: #A91E2D (와인색)
└─ Primary-500: #D94455 (밝은 와인색)

Success (선택 완료)
├─ Success-500: #10B981 (초록)
└─ Success-400: #6EE7B7 (밝은 초록)

Neutral (배경, 텍스트)
├─ Neutral-50: #FAFAFA (거의 흰색)
├─ Neutral-100: #F3F4F6 (밝은 회색)
├─ Neutral-500: #6B7280 (중간 회색)
├─ Neutral-700: #374151 (어두운 회색)
└─ Neutral-900: #111827 (거의 검은색)

Accent (와인병, 특수 강조)
├─ Wine-Gold: #D4AF37 (와인 라벨 금색)
└─ Wine-Purple: #6B3FA0 (포도 색상)

Semantic (상태)
├─ Error: #EF4444 (빨강)
├─ Warning: #F59E0B (주황)
└─ Info: #3B82F6 (파랑)


📏 TYPOGRAPHY SCALE (Tailwind 기준)

Headlines (게임 화면)
├─ H1: text-5xl (3.75rem), font-bold, line-height 1.1
│   용도: 게임 제목 ("Round 1/6")
├─ H2: text-3xl (1.875rem), font-bold, line-height 1.2
│   용도: 섹션 제목 ("와인별 통계")
└─ H3: text-xl (1.25rem), font-semibold, line-height 1.4
    용도: 카드 제목 ("라스피네타 깜페 2005")

Body (일반 텍스트)
├─ Body-LG: text-lg (1.125rem), font-normal, line-height 1.6
│   용도: 설명 텍스트
├─ Body: text-base (1rem), font-normal, line-height 1.6
│   용도: 주 텍스트
└─ Body-SM: text-sm (0.875rem), font-normal, line-height 1.5
    용도: 보조 텍스트 (선택 횟수 등)

Action (버튼, 레이블)
├─ Action-LG: text-lg, font-semibold
│   용도: 큰 버튼 ("라운드 시작")
├─ Action: text-base, font-semibold
│   용도: 일반 버튼
└─ Action-SM: text-sm, font-semibold
    용도: 작은 버튼 ("공유")


🎯 SPACING SCALE (Tailwind 기준)

Base Unit: 4px × N

├─ XS: 4px (gap-1)
├─ SM: 8px (gap-2)
├─ MD: 16px (gap-4)
├─ LG: 24px (gap-6)
├─ XL: 32px (gap-8)
├─ 2XL: 48px (gap-12)
└─ 3XL: 64px (gap-16)

Rules:
- 게임 화면: 요소 간 최소 MD(16px)
- 카드 내부 padding: LG(24px)
- 섹션 간격: XL(32px)
- 버튼 padding: SM(8px) vertical, MD(16px) horizontal


🔲 BORDER RADIUS

├─ None: 0px (직각, 사용 최소)
├─ SM: 4px (작은 요소, 입력창)
├─ MD: 8px (카드, 버튼)
├─ LG: 12px (큰 컴포넌트)
└─ Full: 9999px (포도알, 아바타)


💫 SHADOWS

├─ None: 없음 (플랫 디자인)
├─ SM: 0 1px 2px rgba(0,0,0,0.05) (미묘한 깊이)
├─ MD: 0 4px 6px rgba(0,0,0,0.1) (카드)
├─ LG: 0 10px 15px rgba(0,0,0,0.1) (모달, 호버)
└─ XL: 0 20px 25px rgba(0,0,0,0.1) (드래그)


🎮 COMPONENT TOKENS

Buttons:
├─ Primary: bg-primary-700, text-white, rounded-md, px-4 py-2
├─ Secondary: bg-neutral-100, text-neutral-900, rounded-md, px-4 py-2
└─ Disabled: opacity-50, cursor-not-allowed

Cards:
├─ Container: bg-white, rounded-lg, shadow-md, p-6
├─ Border: border-1 border-neutral-200
└─ Hover: shadow-lg, scale-up-102

Inputs:
├─ Base: bg-white, border-1 border-neutral-300, rounded-sm, px-3 py-2
├─ Focus: border-primary-500, ring-2 ring-primary-200
└─ Error: border-error-500, ring-2 ring-error-200
```

---

## Part 2: Design Laws (규칙)

### 2.1 계층 구조 (Visual Hierarchy)

```
Level 1 - 즉시 인지 (가장 중요)
├─ 타이머 (상단 중앙, 크고 빨강)
├─ 현재 라운드 (상단, H1)
└─ 주 CTA 버튼 (하단, 큼)

Level 2 - 2차 정보 (중요)
├─ 선택 와인들 (큰 이미지, 명확한 배치)
├─ 플레이어 포도알 (실시간, 움직임)
└─ 다른 플레이어의 선택 결과

Level 3 - 보조 정보
├─ 라운드 카운터 (작은 텍스트)
├─ 참가자 수
└─ 탈퇴 버튼
```

**적용 원칙:**
- 게임 진행 중: 타이머와 선택지가 70% 이상의 시각적 비중
- 통계 화면: 와인 이름과 선택 인원이 가장 크고 명확
- 버튼은 절대 같은 크기가 아님 (Primary >> Secondary >> Tertiary)

---

### 2.2 공백 (Whitespace)

```
게임 화면 레이아웃:
┌─────────────────────────────────┐
│  타이머                 Round 1/6  │  (상단 padding: XL)
│                                   │
│         [선택지 와인 1]            │
│                                   │  (중앙 간격: 2XL)
│    🟡 🟢 🔵 (포도알들)           │
│                                   │  (간격: XL)
│         [선택지 와인 2]            │
│                                   │  (하단 padding: LG)
│  [조이스틱 컨트롤]                 │
└─────────────────────────────────┘

Rules:
- 게임 화면은 최소한 50% 여백 (압박감 제거)
- 카드 내부는 padding: LG(24px) 이상
- 텍스트는 절대 화면 끝에 닿지 않음 (최소 SM 마진)
```

---

### 2.3 명확성 (Clarity)

```
Text Rules:
- 버튼 라벨: 2-3단어 ("라운드 시작" O, "다음 라운드를 시작합니다" X)
- 와인 이름: 최대 30글자 표시 (길면 말줄임)
- 설명 텍스트: 한 줄 max 60자 (모바일 기준)
- 숫자는 항상 명확 (예: "4명" vs "사람들")

Visual Clarity:
- 선택 와인은 항상 2개 이상, 5개 이하
- 포도알은 겹치지 않게 배치
- 비활성 요소는 opacity 50% 이상 (완전 invisible X)
```

---

### 2.4 접근성 (Accessibility)

```
Color Contrast:
- 텍스트 on 배경: 최소 4.5:1 (WCAG AA)
- Primary-700 on White: ✓ 충분
- Neutral-500 on White: X 부족 (본문은 Neutral-700 이상)

Touch Targets:
- 모든 버튼: 최소 44x44px (Apple HIG)
- 포도알: 최소 32x32px (겹쳐도 스코어링됨)

Motion:
- 애니메이션 < 300ms (즉각적 피드백)
- prefers-reduced-motion 존중
```

---

## Part 3: Iterative Critique Loop

### 3.1 Claude에게 주는 기본 Critique Rubric

```
각 화면을 만든 후, Claude에게 다음과 같이 요청:

"위 UI를 다음 기준으로 자체 평가해줘:

1. Visual Hierarchy (계층 구조)
   ├─ 가장 중요한 요소(타이머)가 가장 크고 명확한가?
   ├─ 같은 중요도의 요소들이 같은 크기/색상/위치를 가졌는가?
   └─ 스캔 순서가 자연스러운가 (위 → 아래, 좌 → 우)?

2. Contrast & Emphasis (명암과 강조)
   ├─ 배경과 텍스트의 명도 차이가 충분한가?
   ├─ 주 CTA 버튼이 다른 버튼들보다 눈에 띄는가?
   └─ 비활성 요소가 시각적으로 구분되는가?

3. Spacing & Balance (간격과 균형)
   ├─ 요소 간 간격이 일관성 있는가?
   ├─ 화면이 한쪽으로 쏠려 있지 않은가?
   └─ 여백이 충분해서 압박감이 없는가?

4. Clarity (명확성)
   ├─ 텍스트는 간결한가 (3단어 이하)?
   ├─ 동작 결과가 명확한가?
   └─ 오류 상태가 잘 표시되는가?

5. Mobile-First (모바일 우선)
   ├─ 터치 대상이 최소 44x44px인가?
   ├─ 화면이 세로 방향으로 최적화됐는가?
   └─ 스크롤이 최소화됐는가?

6. Accessibility (접근성)
   ├─ 색상 대비가 WCAG AA 이상인가?
   ├─ 포커스 상태가 명확한가?
   └─ 스크린 리더 호환성이 있는가?"
```

### 3.2 개선 사이클 프롬프트

```
"위 평가 결과에서 가장 심각한 문제 3가지를 골라서:

1. 문제를 명확히 설명
2. 왜 문제인지 원칙 하나를 인용
3. 해결책을 코드로 제시 (Tailwind 클래스)

예:
Problem #1: 타이머 텍스트가 너무 작음
Reason: Visual Hierarchy - 가장 중요한 정보가 가장 크게 표시돼야 함
Fix: text-3xl → text-5xl, font-bold 추가, 색상을 primary-700로 변경
```

---

## Part 4: Component Gallery (일관성 유지)

### 4.1 Gallery 페이지 구조 (`/ui` 또는 `/components` 라우트)

```
Wine Game App Component Gallery

📌 Buttons
├─ Primary Button
│  ├─ Default: "라운드 시작"
│  ├─ Hover: 약간 어두워짐
│  ├─ Active: shadow 증가
│  └─ Disabled: opacity 50%
├─ Secondary Button
│  ├─ Default: "공유"
│  └─ Hover: bg 변경
└─ Icon Button
   ├─ Default: 설정 아이콘
   └─ Hover: scale 증가

🍇 Cards
├─ Wine Card
│  ├─ Image + Title + Stats
│  ├─ Default: shadow-md
│  └─ Hover: shadow-lg
├─ Player Stats Card
│  ├─ Avatar + Name + Selection Count
│  └─ Different background color options
└─ Round Result Card
   ├─ Round Number + Selections
   └─ Compact layout

⏱️ Game State
├─ Timer: 30, 25, 10, 5초 상태 표시
├─ Loading State: 스핀 애니메이션
├─ Error State: 빨간 테두리, 에러 메시지
└─ Empty State: 아무도 선택 안 함

🎯 Interactive Elements
├─ Toggle Switch (음소거 등)
├─ Input Field (닉네임)
├─ Selection Radio (와인 선택)
└─ Modal (정말 나가시겠습니까?)

🍇 Popovers & Alerts
├─ Success: "선택됨!"
├─ Warning: "시간이 거의 없습니다"
├─ Error: "연결이 끊겼습니다"
└─ Info: "3명이 같은 와인을 선택했습니다"
```

**유지 규칙:**
- 매 스크린 UI 추가 때마다 Gallery에 추가
- Gallery는 문서로 취급 (변경 이력 추적)
- 새로운 상태 추가되면 Gallery에서 먼저 확인

---

## Part 5: Real-World Layout Translation

### 5.1 참고 할 앱 구조

```
📱 Wine Game App이 참고할 구조

From Pikmin Bloom (위치 기반 게임):
- "Hero section: 큰 캐릭터 이미지 + 주변 상황 표시"
  → Wine Game: 큰 포도알들 + 와인병 배치

From Vivino (소셜 와인 앱):
- "와인 카드: 이미지 + 이름 + 평점 + 댓글 수"
  → Wine Game Stats: 와인 이미지 + 이름 + 선택 인원

From Apple Music (실시간 재생):
- "위: 재생 정보 고정, 아래: 스크롤 가능 내용"
  → Wine Game: 위 타이머 고정, 아래 포도알/와인 스크롤

From Venmo (송금 앱):
- "기본: 친구 목록(주 정보), 상세 탭: 거래 내역"
  → Wine Game: 기본 게임, 상세 탭 통계
```

---

## Part 6: Claude Prompts (실제로 사용할 프롬프트들)

### 6.1 초기 화면 생성 프롬프트

```markdown
다음 디자인 토큰과 규칙을 사용해서 Wine Game App의 GameRoom 화면을 만들어줘.

## 디자인 토큰
- Primary Color: #A91E2D (와인색)
- Neutral-50: #FAFAFA, Neutral-700: #374151
- Typography: H1 (text-5xl bold), Body (text-base)
- Spacing: MD(16px), LG(24px), XL(32px)
- Shadow: card = shadow-md, hover = shadow-lg
- Button padding: px-4 py-2, rounded-md

## 레이아웃 규칙
- 게임 화면: 50% 이상 여백 (압박감 X)
- 타이머는 상단 중앙, H1 크기, primary 색상
- 선택 와인은 명확한 이미지 (최소 120x160px)
- 포도알들은 화면 중앙, 겹치지 않게 배치
- 터치 대상: 최소 44x44px

## 계층 구조
1. 타이머 (가장 큼, 가장 빨강)
2. 라운드 정보 (H2 크기)
3. 선택 와인 (이미지 + 라벨)
4. 포도알 캐릭터들 (실시간)
5. 조이스틱 (하단)

React + Tailwind로 코드를 작성하고, 이 화면을 다음 기준으로 자체 평가해줘:

1. **Visual Hierarchy**: 타이머가 가장 강조됐는가?
2. **Contrast**: 배경 대비가 충분한가? (WCAG AA 이상)
3. **Spacing**: 요소 간 간격이 MD 이상인가?
4. **Clarity**: 텍스트가 간결한가 (3단어 이하)?
5. **Mobile**: 터치 대상이 44x44px 이상인가?

평가 후, 가장 문제가 있는 부분 3가지를 명시하고, 각각에 대해:
- 문제가 무엇인지
- 어떤 디자인 원칙을 위반했는지
- 구체적인 코드 수정안

을 제시해줘.
```

### 6.2 통계 화면 생성 프롬프트

```markdown
다음 요구사항으로 ResultScreen(게임 종료 후 통계) 화면을 만들어줘.

## 데이터 구조
```javascript
gameSession = {
  wines_info: {
    "1": {
      name: "라스피네타 깜페 2005",
      selected_by: ["가희", "민준", "준호", "지은"]
    },
    "2": { name: "샤르도네 2020", selected_by: [...] }
  },
  player_stats: {
    "가희": {
      selections: [1, 1, 2, 1, 3, 5],
      selection_count: { "1": 3, "2": 1, "3": 1, "5": 1 }
    }
  }
}
```

## UI 요구사항
- 2개 탭: "🍷 와인별 통계" vs "👤 개인별 통계"
- 와인별: 와인 이미지 + 이름 + 선택한 사람 나열
- 개인별: 선택한 와인별 별 표시 (⭐⭐⭐ = 3회)

## 디자인 제약
- 색상: Primary, Neutral, Success만 사용
- Spacing: 카드 내부 padding LG(24px), 카드 간 gap XL(32px)
- 텍스트: 와인 이름은 H3, 선택 인원은 Body-SM
- 접근성: 색상만으로 정보 전달 금지 (텍스트 필수)

만든 후, 다음을 확인해줘:
1. 와인별 화면이 "가로 스크롤"은 아닌가? (모바일에서 세로 스크롤만)
2. 선택 인원이 5명 이상일 때 잘려나가거나 겹치지 않나?
3. 탭 전환이 명확한가? (active 탭이 시각적으로 다른가?)

문제가 있으면 수정해줘.
```

### 6.3 Component Gallery 유지 프롬프트

```markdown
Component Gallery를 만들어줄 수 있어?

이 페이지는 /components 라우트에서 다음을 표시해야 돼:

## 1. Buttons
- Primary Button (4 상태: default, hover, active, disabled)
- Secondary Button
- Icon Button

## 2. Cards
- Wine Card (와인 이미지 + 제목 + 선택 수)
- Player Stats Card (아바타 + 이름 + 통계)

## 3. Game States
- Timer Display (30초, 5초, 종료 상태)
- Loading Spinner
- Error Alert
- Empty State ("아직 선택이 없습니다")

## 4. Inputs
- Text Input (닉네임 입력)
- Wine Selection Radio

각 컴포넌트 옆에 다음 정보를 표시:
- 컴포넌트 이름
- 사용처 (어느 화면에서?)
- Tailwind 클래스 (main classes)
- 접근성 고려사항

레이아웃: 2열 그리드, 각 컴포넌트는 카드로 감싸기, 코드 복사 버튼 포함.
```

### 6.4 반복 개선 프롬프트 (매 화면마다)

```markdown
위 [화면명] UI를 다음 루틴으로 개선해줘:

## Step 1: 자체 평가
위 코드를 다음으로 평가:
- Visual Hierarchy: 가장 중요한 요소가 가장 크고/밝고/강조됐는가?
- Contrast & Readability: 텍스트 대비가 4.5:1 이상인가?
- Spacing Consistency: 모든 gap/padding이 (4, 8, 16, 24, 32, 48, 64)px 중 하나인가?
- Mobile-First: 모든 터치 대상이 44x44px 이상인가?
- Clarity: 한 눈에 동작을 이해할 수 있는가?

## Step 2: 개선안 제시
가장 문제인 3가지를 골라서, 각각:
1. 현재 상태
2. 문제점 (어떤 원칙 위반)
3. 수정 코드 (정확한 Tailwind 클래스)

을 제시해줘.

## Step 3: 적용
위 3가지만 적용해서 수정된 코드를 보여줘. (다른 부분 수정 X)

## Step 4: 마지막 체크
수정 후, "이제 Component Gallery에 추가할 준비가 되었습니까?" 라고 물어봐줘.
```

---

## Part 7: Phase별 프롬프트 템플릿

### 7.1 Phase 1 (기본 게임 루프) - 프롬프트

```markdown
Wine Game App Phase 1을 시작할 준비가 됐어.

## 개발 목표
기본 게임 루프가 동작하는 상태. 
- 마스터가 라운드 시작 버튼 클릭
- 모든 플레이어가 2개 선택지를 보고, 30초 안에 선택
- 선택 결과 표시

## 디자인 제약 (꼭 지켜야 할 것)
- 색상: Primary #A91E2D, Neutral-50/700만 (다른 색 X)
- Spacing: 16/24/32px만 사용 (임의의 spacing X)
- Typography: H1/Body만 사용 (중간 크기 X)
- Button: 모두 최소 44x44px

## 구현 화면들
1. LoginScreen (닉네임 입력)
2. GameRoom (게임 진행)
   - 타이머 표시
   - 2개 선택지 와인 (버튼 형태 OK, 게임 초기)
   - 선택 결과 표시
3. WaitingScreen (라운드 시작 대기)

각 화면을 위 제약을 지켜서 만들어줘.
```

### 7.2 Phase 4 (포도알 그래픽) - 프롬프트

```markdown
Phase 4: Canvas 기반 포도알 그래픽 구현

## 요구사항
- Canvas에 포도알 렌더링 (원형, 32x32px, 랜덤 색상)
- 조이스틱 (화살표 4방향 or 터치 드래그) 이동
- 와인병 근처(50px) 감지 시 색상 변경 (gray → success-green)
- 실시간 동기화 (Socket.io로 다른 플레이어의 포도알 위치)

## 디자인 제약
- 포도알: 최소 32x32px, 충분히 구분되는 색상
- 배경: Neutral-50
- 와인병: 위치 고정, hover 시 shadow 증가

## 성능
- 60fps 유지 (requestAnimationFrame)
- 15명 이상의 포도알 렌더링 가능

## 구현 후 체크
1. 포도알이 부드럽게 이동하나? (끊김 X)
2. 와인병 근처 감지가 정확한가? (50px 반경)
3. Component Gallery에 "Canvas Game Area" 추가했나?
```

---

## Part 8: 디자인 리뷰 체크리스트

매 화면 완성 후 Claude에게 물어봐야 할 것들:

```
□ Visual Hierarchy
  ├─ 가장 중요한 요소(타이머/선택지)가 가장 크거나 강조되어 있는가?
  ├─ 같은 중요도의 요소가 같은 visual weight를 가졌는가?
  └─ 스캔 순서가 자연스러운가?

□ Color & Contrast
  ├─ 모든 텍스트가 배경과 4.5:1 이상의 명도 차이를 가지는가?
  ├─ Primary 색상이 과용되거나 약하지는 않은가?
  └─ 색상만으로는 정보를 전달하지 않는가 (색맹 고려)?

□ Typography
  ├─ 정의된 scale (H1, Body, Body-SM)만 사용했는가?
  ├─ 한 줄당 최대 60자를 넘지 않는가?
  └─ 행간(line-height)이 1.5 이상인가?

□ Spacing
  ├─ 모든 gap/padding이 4의 배수(4, 8, 16, 24, 32...)인가?
  ├─ 카드 내부 padding이 LG(24px) 이상인가?
  └─ 화면이 한쪽으로 쏠려 있지 않은가?

□ Components
  ├─ 모든 컴포넌트가 Gallery에 등재되어 있는가?
  ├─ 같은 컴포넌트를 여러 곳에서 재사용하고 있는가?
  └─ 상태별(hover, disabled, error) 스타일링이 일관적인가?

□ Mobile
  ├─ 모든 버튼/클릭 대상이 44x44px 이상인가?
  ├─ 세로 방향에서 스크롤이 필요한가? (필요하면 얼마나?)
  └─ 터치 간격(tap target spacing)이 최소 8px 이상인가?

□ Accessibility
  ├─ 포커스 상태(:focus-visible)가 명확한가?
  ├─ 아이콘에 alt text나 aria-label이 있는가?
  └─ 모달이나 중요 팝업이 tabindex와 role을 정의했는가?

□ Consistency
  ├─ 같은 유형의 버튼이 모두 같은 스타일인가?
  ├─ 카드 스타일이 모든 카드에서 일관적인가?
  └─ 이전 화면과 디자인이 일관적인가?
```

---

## 요약: 실전 워크플로우

```
1️⃣ 화면 요구사항 → Claude

"이 화면을 만들어줘. 디자인 토큰은 [Part 1]을 따르고, 
레이아웃은 [Part 2]의 규칙을 지켜줘."

2️⃣ Claude 생성 → 자체 평가

Claude가 코드를 만들고 [Part 3]의 Critique Rubric으로 자평가

3️⃣ 문제점 및 개선안 제시

"가장 심각한 3가지 문제를 고르고, 각각의 해결책을 코드로 보여줘"

4️⃣ 수정 적용

위 3가지만 수정 (다른 부분 건드리지 X)

5️⃣ Component Gallery 추가

"이 컴포넌트를 /components 갤러리에 추가해줘"

6️⃣ 체크리스트 검증

[Part 8]의 체크리스트로 최종 확인

→ 다음 화면으로
```

---

## 실제 프롬프트 예시

### 예시 1: 초기 게임 화면

```
다음 디자인 시스템을 따르면서 GameRoom 화면을 React + Tailwind로 만들어줘.

## 디자인 시스템
- Primary: #A91E2D, Neutral: #F3F4F6, #374151
- Spacing: 16px(md), 24px(lg), 32px(xl)
- H1: text-5xl font-bold, Body: text-base
- Buttons: px-4 py-2 rounded-md, min 44x44px

## 화면 요구사항
- 상단: "Round 1/6" (H1, primary 색상)
- 중앙상단: 타이머 "30" (text-5xl, 빨강)
- 중앙: 2개 와인 선택지 (큰 버튼, 아이콘 + 이름)
- 중앙하단: 포도알 6개 (실시간 표시 준비)
- 하단: "선택 완료됨 6/18명" (body-sm)

## 레이아웃
- 중앙 정렬, 50% 여백
- 요소 간 spacing: 24px 이상
- 모바일 세로(375px) 기준

만든 후 자체 평가해줘:
1. 타이머가 가장 크고 빨간가? (H1보다?)
2. 버튼들이 44x44px 이상인가?
3. 색상 대비가 충분한가?

문제 3가지를 지적하고 수정해줘.
```

### 예시 2: 통계 화면

```
ResultScreen을 만들어줄 수 있어? 게임 종료 후 나타나는 화면.

## 데이터
```javascript
session = {
  wines_info: {
    "1": { name: "라스피네타", selected_by: ["가희", "민준", "준호"] },
    "2": { name: "샤르도네", selected_by: ["수진", "은지", "광호"] }
  },
  player_stats: {
    "가희": { selections: [1, 1, 2], selection_count: {"1": 2, "2": 1} }
  }
}
```

## 요구사항
- 2개 탭: "와인별" "개인별"
- 와인별: 와인 이름 + 선택한 사람 (칩 형태)
- 개인별: 이름 + 선택한 와인 (⭐ 반복)
- 색상: Primary + Success만
- Spacing: 카드 24px, 간격 32px

만든 후 체크해줄 게:
1. 선택 인원이 많을 때 (10명+) 말줄임 처리했나?
2. 모바일에서 가로 스크롤은 없나?
3. 탭 전환이 명확한가?
```

---

## 최종 팁

**Claude와 함께 일할 때:**
1. **토큰을 먼저 고정하라** → 그 다음에 화면을 만들어야 한다
2. **자체 평가를 강요하라** → "만들어줘" 하지 말고 "만들고 평가해줘"
3. **작은 수정만** → "3가지만 고쳐줘" (전체 리팩토링 X)
4. **Gallery를 성역으로 만들어라** → 매번 업데이트하면서 일관성 유지
5. **체크리스트를 매번 돌려라** → 습관화하면 디자인 감각이 빨리 정착된다

이렇게 하면 3-4주 안에 **일관성 있고 프로페셔널한** UI가 나온다.