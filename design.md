# Design System Documentation (Toss Style)

## 1. Core Philosophy (핵심 철학)
- **Extreme Minimalism**: 불필요한 장식(Border, strong Shadow, Gradient)을 제거한다.
- **Content First**: 콘텐츠가 UI보다 강조되어야 한다. 텍스트는 크고 굵게, 이미지는 시원하게 배치한다.
- **Big & Bold Typography**: 정보의 위계는 색상보다는 '크기'와 '두께'로 구분한다.
- **Super Ellipse**: 모든 모서리는 둥글게 처리하여 부드러운 인상을 준다.
- **Interaction**: 사용자의 행동에 즉각적이고 부드럽게 반응한다 (예: 클릭 시 축소 효과).

---

## 2. Color Palette & Usage
*Tailwind CSS 클래스 기준*

### Primary Colors
- **Brand Blue**: `#3182F6` (주요 버튼, 활성화 상태, 링크)
- **Brand Blue Light**: `#E8F3FF` (보조 버튼 배경, 선택된 아이템 배경)

### Backgrounds
- **Base (App Background)**: `#F2F4F6` (아주 연한 회색 - 전체 배경)
- **Surface (Card/Modal)**: `#FFFFFF` (흰색 - 콘텐츠 영역)
- **Input Background**: `#F9FAFB` (테두리 없는 입력창 배경)

### Text & Icons
- **Text Primary**: `#191F28` (제목, 중요 본문 - 완전한 검정이 아님)
- **Text Secondary**: `#4E5968` (부가 설명, 서브 텍스트)
- **Text Tertiary**: `#8B95A1` (비활성 텍스트, 플레이스홀더)
- **Text White**: `#FFFFFF` (유색 버튼 위 텍스트)

### Semantic
- **Error**: `#F04452`
- **Success**: `#3182F6` (브랜드 컬러와 동일하게 가져가는 경향)

---

## 3. Typography Rules
*폰트는 Pretendard 또는 Apple SD Gothic Neo를 기본으로 사용. Letter-spacing은 `-0.02em`~`-0.03em`으로 좁게 설정.*

| Role | Size (px) | Weight | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Display)** | 26px ~ 30px | Bold (700) | `text-[26px] font-bold leading-tight` | 메인 화면 헤드라인 |
| **H2 (Title)** | 22px ~ 24px | Bold (700) | `text-[22px] font-bold leading-snug` | 섹션 타이틀, 모달 제목 |
| **H3 (Subtitle)** | 18px ~ 20px | SemiBold (600) | `text-[18px] font-semibold` | 카드 내부 타이틀 |
| **Body (Main)** | 16px ~ 17px | Medium (500) | `text-[17px] font-medium leading-relaxed` | 일반 본문 |
| **Caption** | 13px ~ 14px | Regular (400) | `text-[14px] text-[#8B95A1]` | 설명 문구, 날짜 |

---

## 4. UI Components Guide (Tailwind CSS)

### A. Layout & Spacing
- **Container**: `max-w-md mx-auto min-h-screen bg-[#F2F4F6]` (모바일 뷰 기준)
- **Section Spacing**: 섹션 간 여백은 넉넉하게 `gap-8` 또는 `my-8`.
- **Inner Padding**: 카드나 컨테이너 내부는 `p-6` (24px) 이상을 기본으로 함.

### B. Cards (List Items)
- **Style**: 테두리 없음, 흰색 배경, 넉넉한 라운딩.
- **Code**: `bg-white rounded-[24px] p-6 shadow-sm`
- **Lists**: 리스트 형태일 경우 배경색 없이 `active:bg-gray-100 rounded-[20px] transition-colors` 적용.

### C. Buttons (CTA)
- **Primary**: 화면 하단에 꽉 차거나 굵은 스타일.
  - `w-full bg-[#3182F6] text-white font-bold text-[17px] py-4 rounded-[18px] active:scale-[0.96] transition-transform`
- **Secondary**: 배경이 연하고 글자가 색상이 있는 스타일.
  - `bg-[#E8F3FF] text-[#3182F6] font-semibold py-3 px-5 rounded-[16px]`
- **Ghost**: 배경 없음.
  - `text-[#4E5968] underline-offset-4 hover:underline`

### D. Inputs (Form)
- **Style**: 테두리(Border)를 사용하지 않고 배경색으로 영역을 구분함.
- **Code**: `w-full bg-[#F9FAFB] text-[#191F28] rounded-[16px] px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 placeholder-[#8B95A1]`
- **Label**: 입력창 바로 위에 작게 배치하지 않고, 입력창 안의 Placeholder나 상단에 굵은 질문 형태로 배치.

### E. Navigation & Modals
- **Bottom Sheet**: 모바일에서 Modal 대신 Bottom Sheet 사용 권장.
  - `fixed bottom-0 w-full bg-white rounded-t-[24px] p-6 pb-10 shadow-lg`
- **Header**: 뒤로가기 버튼과 제목만 있는 심플한 형태. `h-[56px] flex items-center px-4`.

---

## 5. Interaction & Animation
- **Click Feedback**: 클릭 가능한 모든 요소는 눌렀을 때 반응해야 함.
  - `active:scale-95 transition-all duration-200`
- **Page Transition**: 부드럽게 떠오르거나(Fade up) 옆에서 슬라이드(Slide).

## 6. Iconography
- 아이콘은 `Lucide React` 또는 `Heroicons` (Rounded) 사용.
- Stroke width는 `2px`~`2.5px`로 약간 두껍게 설정하여 부드러운 느낌 강조.
- 아이콘 색상은 텍스트 색상(`text-gray-500` 등)을 상속받도록 설정.