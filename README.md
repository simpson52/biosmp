# 바이오매스 공헌이익 시뮬레이터

## 1. 프로젝트 개요

발전소의 시간별 SMP(계통한계가격) 변화에 따른 수익(공헌이익)을 시뮬레이션하는 단일 페이지 웹 애플리케이션입니다.

### 기술 스택
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn UI
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Persistence**: Local Storage

### 디자인 시스템
- **Material Design + Fluent Design Hybrid**
- 깔끔하고 미니멀한 현대적 디자인 (Toss 스타일 참고)
- 상세 가이드라인: `.cursorrules` 파일 참조

## 2. 프로젝트 구조

### 2.1 화면 구성

#### 네비게이션 바
- 좌측: CI 로고 + 시스템 이름 ("바이오매스 공헌이익 시뮬레이터")
- 중앙: 탭 네비게이션 (대시보드 | 시뮬레이션 | 설정)
- 고정 위치 (sticky top)

#### 대시보드 탭
- **요약 카드 섹션**: 93MW, 80MW, 65MW 출력별 시간당 수익 및 공헌이익 표시
- **감발 임계값 카드 섹션**: 자동 계산된 감발 임계값 표시
  - 80MW = 65MW 공헌이익 지점
  - 80MW 공헌이익 = 0 지점
  - 65MW 공헌이익 = 0 지점

#### 설정 탭
- **수익 비교 분석 테이블 편집**
  - 각 인자에 대한 계산식 또는 고정값을 편집할 수 있는 기능
  - 사용자 입력값과 계산값을 섹션별로 분리하여 표시
  - 한 줄에 5개씩 블록 형태로 표시 (반응형: 모바일 1열, 태블릿 2-3열, 데스크톱 5열)
  - 블록 클릭 시 아래에 편집 카드 표시
  - 계산식 입력 시 변수 시각적 강조 (빨간색 텍스트, 회색 배경)
  - 변수 자동완성 및 예상 결과 표시 기능

#### 시뮬레이션 탭
- **상단: 입력 및 시뮬레이션 제어**
  - 주요 입력값 (노란색 배경)
  - 감발 임계값 자동 계산 표시 (읽기 전용)
  - 결과 요약 카드 (93MW/80MW/65MW 시간당 수익)
  
- **중단: 메인 분석 테이블**
  - 3개 행 (93MW, 80MW, 65MW)
  - 실시간 계산 및 표시
  - 송전효율, 소내소비율 수정 가능 (노란색 배경)
  - "더보기" 버튼: 93MW ~ 65MW까지 1MW 단위 상세 분석 모달
  
- **하단: 시간대별 SMP 가격 변동 추이**
  - 날짜별 24시간 SMP 가격 표시
  - 감발 기준 설정 기능
  - 요일별 색상 구분 (토요일: 파란색, 일요일: 빨간색)
  - 매뉴얼/전력거래소 탭 전환 기능
  
- **최하단: 2열 카드 섹션**
  - **왼쪽: 공헌이익 비교 차트**
    - Y축: 공헌이익 (백만원), X축: SMP (원/kWh)
    - 출력 레벨별 공헌이익 곡선 (65MW, 80MW, 93MW 기본값)
    - 교차점 표시 및 우위 구간 표시
    - 출력 레벨 편집 기능 (65~95MW, 복수 선택)
  - **오른쪽: 감발 요약 테이블**
    - 감발 기준가격 이하 연속 6시간 이상 구간 감지
    - 가장 긴 구간 우선 선택
    - 감발 평균 SMP, 감발시간, 시간당 수익, 총 금액 계산

### 2.2 컴포넌트 구조

프로젝트는 **FSD (Feature-Sliced Design)** 아키텍처를 따릅니다. 주요 컴포넌트는 `features/` 디렉토리에 모듈화되어 있으며, `components/` 디렉토리는 하위 호환성을 위한 re-export를 제공합니다.

#### 주요 컴포넌트 (Features)

```
features/
├── formula-editor/              # 계산식 텍스트 편집기
│   ├── ui/                      # UI 컴포넌트 (7개)
│   ├── model/                   # Custom Hooks (4개)
│   └── lib/                     # 유틸리티 함수 (4개)
├── contribution-profit-chart/   # 공헌이익 비교 차트
│   ├── ui/                      # UI 컴포넌트 (4개)
│   └── lib/                     # 유틸리티 함수 (6개)
├── intuitive-formula-editor/    # 직관적 계산식 편집기
│   ├── ui/                      # UI 컴포넌트 (7개)
│   └── model/                   # Custom Hooks (1개)
├── smp-price-table/             # SMP 가격 테이블
│   ├── ui/                      # UI 컴포넌트 (4개)
│   ├── model/                   # Custom Hooks (1개)
│   └── lib/                     # 유틸리티 함수 (2개)
├── analysis-table/              # 분석 테이블
│   ├── ui/                      # UI 컴포넌트 (3개)
│   └── constants/               # 상수 정의
└── formula-block-builder/       # 계산식 블록 빌더
    ├── ui/                      # UI 컴포넌트 (4개)
    └── lib/                     # 유틸리티 함수 (2개)
```

#### 공유 리소스

```
shared/
└── formula/                     # 계산식 관련 공유 로직
    ├── field-definitions.ts      # 필드 정의
    └── default-value-calculator.ts # 기본값 계산
```

#### 레거시 컴포넌트 (하위 호환성)

```
components/
├── Navigation.tsx              # 네비게이션 바 (탭 전환)
├── Dashboard.tsx               # 대시보드 탭 컨텐츠
├── Simulation.tsx              # 시뮬레이션 탭 컨텐츠
├── Settings.tsx                # 설정 페이지
├── AnalysisTableEditor.tsx     # 수익 비교 분석 테이블 편집기
├── TextFormulaEditor.tsx       # → features/formula-editor (re-export)
├── IntuitiveFormulaEditor.tsx  # → features/intuitive-formula-editor (re-export)
├── InputSection.tsx             # 입력 섹션 (주요 입력값, 요약 카드)
├── AnalysisTable.tsx           # → features/analysis-table (re-export)
├── DetailedAnalysisModal.tsx   # 상세 분석 모달 (93MW~65MW 1MW 단위)
├── SMPPriceTable.tsx           # → features/smp-price-table (re-export)
├── ContributionProfitChart.tsx # → features/contribution-profit-chart (re-export)
├── CurtailmentSummary.tsx      # 감발 요약 테이블
└── ui/                         # Shadcn UI 컴포넌트
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── radio-group.tsx
    ├── select.tsx
    ├── table.tsx
    └── textarea.tsx
```

> **참고**: FSD 구조에 대한 상세 가이드라인은 [6.4 아키텍처 원칙: FSD](#64-아키텍처-원칙-fsd-feature-sliced-design) 섹션을 참조하세요.

### 2.3 상태 관리

**Context API** (`contexts/AppContext.tsx`)
- `inputParameters`: 기준 SMP, 연료 단가 등
- `curtailmentThresholds`: 감발 임계값 (자동 계산)
- `plantRowInputs`: 출력별 송전효율, 소내소비율
- `hourlySMPData`: 시간대별 SMP 가격 데이터 (매뉴얼)
- `currentSMPData`: 현재 표시 중인 SMP 데이터 (매뉴얼 또는 전력거래소)
- `exchangeSMPData`: 전력거래소에서 불러온 SMP 데이터
- `currentDataSource`: 현재 데이터 소스 ("manual" | "exchange")
- `calculationSettings`: 계산식 편집 설정 (각 인자별 계산식 또는 고정값)

**로컬 스토리지**
- 모든 상태 자동 저장/복원
- 브라우저 새로고침 시에도 데이터 유지

## 3. 핵심 계산 공식

### 3.1 고정 상수
- WC 연료사용량: 700 (톤/일)
- REC 가격: 63 (원)
- 상수 860: kcal/kWh 변환 계수
- 운영일수: 316일 (365 - 49)
- 수전료 기본값: 1,158,000 (원)

### 3.2 계산 순서 및 공식

1. **송전량(MWh/h)** = 출력 * (1 - 소내소비율)
   - 시간당 송전량 (일일 값은 * 24)

2. **발전효율(%)** = 송전효율 / (1 - 소내소비율)

3. **PKS 연료사용량(톤/일)** = (출력 / 발전효율 * 860 * 24 - (700 * WC단위열량)) / PKS단위열량

4. **WC 혼소율(%)** = (700 * WC단위열량) / (PKS연료사용량 * PKS단위열량 + 700 * WC단위열량)

5. **PKS 발전단가(원/kWh)** = PKS단위가격 / PKS단위열량 * 860 / 송전효율 / 1000

6. **WC 발전단가(원/kWh)** = WC단위가격 / WC단위열량 * 860 / 송전효율 / 1000

7. **약품비(원/kWh)**
   - IF (출력 == 93): 7.6
   - ELSE: (93 / 출력) * 7.6 * 0.95
   - *주의: 큰 수가 분자에 위치 (93/80, 93/65)*
   - *로직: 이전 행 참조 대신 기준값 93을 활용하여 계산*

8. **수전요금(원/kWh)** = 1,158,000 / (송전량[시간당] * 24 * 316)

9. **매출_전력(백만원)** = (SMP * 출력 * (1 - 소내소비율) * 1000 / 1000 * 24) / 1000000
   - *MW를 kW로 변환: * 1000*

10. **매출_REC(백만원)** = (63 * 출력 * (1 - 소내소비율) * 1000 / 1000 * 24) / 1000000

11. **매출_계(백만원)** = 매출_전력 + 매출_REC

12. **비용_연료비(백만원)** = (PKS연료사용량 * PKS단위가격 + 700 * WC단위가격) / 1000000

13. **비용_약품비(백만원)** = (출력 * (1 - 소내소비율) * 약품비단가 * 1000 / 1000 * 24) / 1000000

14. **비용_수전료(백만원)** = (출력 * (1 - 소내소비율) * 수전요금단가 * 1000 / 1000 * 24) / 1000000

15. **공헌이익(백만원/일)** = 매출_계 - (비용_연료비 + 비용_약품비 + 비용_수전료)

16. **시간당 기대수익(만원)** = 공헌이익(백만원/일) / 24 * 10

### 3.3 감발 임계값 자동 계산

감발 임계값은 사용자 입력이 아닌 **자동 계산**됩니다:

1. **80MW 공헌이익 = 0 지점** (`threshold80MW`)
   - 80MW 출력 시 공헌이익이 0이 되는 SMP 가격
   - 이 가격 이하에서는 80MW 운전 시 수익이 없음

2. **80MW = 65MW 공헌이익 지점** (`threshold65MW`)
   - 80MW와 65MW의 공헌이익이 같아지는 SMP 가격
   - 이 가격 이하에서는 65MW 운전이 더 유리함

3. **65MW 공헌이익 = 0 지점** (`thresholdStop`)
   - 65MW 출력 시 공헌이익이 0이 되는 SMP 가격
   - 이 가격 이하에서는 정지(미운영)를 고려해야 함 (기동요금 고려)

**계산 함수**: `calculateCurtailmentThresholds()` (`lib/calculations.ts`)

**감발 시간 판정 로직:**
- 각 시간대별 SMP 값을 감발 임계값과 비교
- IF (SMP ≤ 80MW 감발 임계값 AND SMP > 65MW 감발 임계값) THEN 감발시간 카운트 (80MW 운전)
- IF (SMP ≤ 65MW 감발 임계값 AND SMP > 정지 임계값) THEN 감발시간 카운트 (65MW 운전)
- IF (SMP ≤ 정지 임계값) THEN 감발시간 카운트 (정지, 기동요금 고려)

## 4. 주요 기능

### 4.0 계산식 편집 기능
- **수익 비교 분석 테이블 편집**
  - 각 인자에 대한 계산식 또는 고정값을 편집할 수 있는 기능
  - 설정 페이지에서 "수익 비교 분석 테이블 편집" 선택
  - 사용자 입력값과 계산값을 섹션별로 분리하여 표시
  - 한 줄에 5개씩 블록 형태로 표시 (반응형: 모바일 1열, 태블릿 2-3열, 데스크톱 5열)
  - 블록 클릭 시 아래에 편집 카드 표시 (전체 너비로 확장)
  - 기본 공식이 자동으로 입력 필드에 표시됨 (변수 블록 형태)
- **계산식 입력 편집기**
  - 한글 변수명으로 계산식 입력 가능
  - 변수 시각적 강조: 빨간색 텍스트와 회색 배경의 둥근 사각형으로 표시
  - 변수는 단일, 불가분의 개체로 처리 (부분 편집 불가)
  - 변수 자동완성: 한글 변수명 입력 시 자동완성 드롭다운 표시
    - 입력 필드 바로 아래에 상대적으로 배치
    - 화살표 키로 이동, Enter/Tab 키로 선택
    - 최대 10개까지 표시
  - 계산식 예상 결과: 입력한 계산식의 예상 결과를 실시간으로 계산하여 표시
    - 계산식 입력 필드와 동일한 디자인으로 통일
    - 93MW 기준으로 계산된 예상 결과 제공
    - 계산 오류 시 안내 메시지 표시
  - 모드 선택: 계산식(왼쪽) / 고정값(오른쪽) 순서로 배치
  - 변수 값 태그: 입력한 계산식에 사용된 변수의 실제 값을 태그 형태로 표시
    - 형식: "변수명 값 단위"
    - 93MW 기준으로 계산된 값 표시
- **변수 매핑 시스템**
  - 영문 변수명을 한글 비즈니스 용어로 자동 변환
  - 카테고리별 변수 그룹화
    - 사용자 입력 값: 출력, SMP 가격, 송전효율, 소내소비율, PKS 단위열량, WC 단위열량, PKS 단위가격, WC 단위가격
    - 계산 값: 발전효율, 송전량, PKS 연료사용량, WC 혼소율, PKS 발전단가, WC 발전단가, 총 발전단가, 약품비, 수전요금, 매출 전력량, 매출 REC, 매출 계, 비용 연료비, 비용 약품비, 비용 수전료, 시간당 수익
    - 고정 값: WC 연료사용량
  - 변수 설명 및 단위 정보 제공
  - 사용 가능한 변수 가이드: 카테고리별로 그룹화하여 표시

### 4.1 실시간 계산
- 기준 SMP 변경 시 즉시 모든 수치 재계산
- 송전효율, 소내소비율 수정 시 해당 행만 재계산
- 모든 계산은 `useMemo`로 최적화

### 4.2 숫자 포맷팅
- **천 단위 구분 쉼표**: 모든 숫자에 자동 적용 (예: 1,000)
- **입력 필드**: 사용자 입력 시에도 자동 포맷팅
- **표시 단위**:
  - 금액: 백만원 (소수점 1자리)
  - 시간당 수익: 만원 (소수점 1자리)
  - 단가: 원 (소수점 1자리)
  - 효율: % (소수점 2자리)

### 4.3 상세 분석 모달
- "더보기" 버튼 클릭 시 모달 표시
- 93MW ~ 65MW까지 1MW 단위 분석
- 93MW, 80MW, 65MW는 기준값으로 강조 표시
- 중간 값은 선형 보간(Linear Interpolation)으로 계산

### 4.4 시간대별 SMP 가격 변동 추이
- 날짜별 24시간 SMP 가격 표시
- 감발 기준 설정 기능 (기본값: 80 원/kWh)
- 감발 기준 이하 가격은 빨간색 배경으로 강조
- 요일별 색상 구분 (토요일: 파란색, 일요일: 빨간색)
- 가로 스크롤 없이 24시간 모두 표시
- 매뉴얼/전력거래소 탭 전환 기능
- 대시보드에서 읽기 전용 모드로 표시

### 4.5 공헌이익 비교 차트
- Y축: 공헌이익 (백만원), X축: SMP (원/kWh)
- 출력 레벨별 공헌이익 곡선 표시 (기본: 65MW, 80MW, 93MW)
- 출력 레벨 편집 기능 (65~95MW, 복수 선택 가능)
- 교차점 표시: 흰색 원 + 검은 테두리, 큰 SMP 값 표시
- 우위 구간 가로 그래프 (숫자 선 형태)
  - 각 출력 레벨별 우위 구간을 색상으로 구분하여 시각화
  - 눈금 및 레이블 표시 (0, 25, 50, 75, 100, 125, 150)
  - 막대 그래프 내부에 출력 레벨 레이블 표시
  - 색상: 93MW(검은색), 80MW(빨간색), 65MW(파란색), 정지(회색)
- 정지 구간 표시: 모든 출력 레벨의 공헌이익이 0 이하인 구간
- 범례: 색상 아이콘 + 숫자 범위만 표시 (예: "0 ~ 34 원/kWh"), 가운데 정렬, 여러 줄 표시
- 선형 보간: 65MW, 80MW, 93MW 사이의 출력 레벨은 보간 계산

### 4.6 감발 요약 테이블
- 감발 기준가격 이하 연속 6시간 이상 구간 자동 감지
- 가장 긴 구간 우선 선택 (동일 길이 시 전날 24시와 오늘 1시가 모두 기준 이하인 구간 우선)
- 감발 평균 SMP 계산 (연속 6시간 이상 구간만 집계)
  - **감발 평균 SMP(원/kWh)**: SUM(감발 시간대의 SMP 값) / 감발 시간대 개수
  - 감발 조건에 해당하는 시간대의 SMP 값들의 평균
- 감발시간, 시간당 수익, 총 금액 계산
  - **감발 시간당 수익(만원)**: 감발 평균 SMP를 기준 SMP로 사용하여 해당 출력(80MW 또는 65MW)의 시간당 기대수익 계산
    - 감발 평균 SMP가 80MW 임계값 이하이면 80MW 기준으로 계산
    - 감발 평균 SMP가 65MW 임계값 이하이면 65MW 기준으로 계산
  - **감발 총 금액(만원)**: 감발시간 × 감발 시간당 수익
- 매뉴얼/전력거래소 탭 전환에 따른 동적 데이터 표시
- 단위 표시: 시간당 수익 및 총 금액은 "만원" 단위
- 계산 기준 안내: 사용자 이해를 위한 명확한 설명 제공

### 4.7 시각적 피드백
- **입력 필드 구분**
  - 사용자가 입력 가능한 변수(SMP, 효율, 단가 등): 노란색 배경 (#FFF9E6)
  - 계산된 값: 흰색이나 회색 배경으로 구분
- **공헌이익**: 양수(녹색), 음수(빨간색)
- **매출**: 녹색 강조
- **비용**: 빨간색 강조
- **감발 조건**: 빨간색 배경 (#fcb1b1)
  - 시간대별 SMP 가격 테이블에서 감발 기준 이하 가격 셀 강조
  - 감발 요약 테이블의 중요 수치(감발시간, 총 금액 등)는 노란색 배경으로 강조 가능

## 5. 데이터 구조

### 5.1 타입 정의 (`types/index.ts`)

```typescript
// 출력 레벨
type OutputLevel = 93 | 80 | 65;

// 입력 파라미터
interface InputParameters {
  baseSMP: number;              // 기준 SMP (원/kWh)
  pksCalorificValue: number;    // PKS 단위열량 (kcal/kg)
  wcCalorificValue: number;     // WC 단위열량 (kcal/kg)
  pksUnitPrice: number;         // PKS 단위가격 (원/톤)
  wcUnitPrice: number;          // WC 단위가격 (원/톤)
}

// 감발 임계값 (자동 계산)
interface CurtailmentThresholds {
  threshold80MW: number;       // 80MW 공헌이익 = 0 지점
  threshold65MW: number;        // 80MW = 65MW 공헌이익 지점
  thresholdStop: number;        // 65MW 공헌이익 = 0 지점
}

// 발전소 행별 입력값
interface PlantRowInput {
  transmissionEfficiency: number;  // 송전효율 (%)
  internalConsumptionRate: number;  // 소내소비율 (%)
}

// 날짜별 시간대별 SMP 가격 데이터
interface DailySMPData {
  date: string;                // 날짜 (YYYY-MM-DD)
  hourlyPrices: number[];      // 24시간 SMP 가격 배열
}

// 시간대별 SMP 가격 변동 추이 데이터
interface HourlySMPData {
  dailyData: DailySMPData[];
}

// 데이터 소스 타입
type DataSource = "manual" | "exchange";
```

### 5.2 기본값

**입력 파라미터**
- 기준 SMP: 150 원/kWh
- PKS 단위열량: 4,000 kcal/kg
- WC 단위열량: 3,750 kcal/kg
- PKS 단위가격: 223,000 원/톤
- WC 단위가격: 49,000 원/톤

**발전소 행별 입력값**
- 93MW: 송전효율 30.4%, 소내소비율 8.4%
- 80MW: 송전효율 30.23%, 소내소비율 8.7%
- 65MW: 송전효율 29.35%, 소내소비율 10.5%

**시간대별 SMP 데이터**
- 기본 3일간 샘플 데이터 포함 (2024-12-13, 2024-12-14, 2024-12-15)

## 6. 개발 가이드

### 6.1 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
# 프로젝트 루트에 .env.local 파일을 생성하고 다음 내용을 추가:
# NEXT_PUBLIC_DATA_GO_KR_SERVICE_KEY=your_service_key_here
# 
# 공공데이터포털(https://www.data.go.kr)에서 발급받은 서비스 키를 입력하세요.

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 6.1.1 환경 변수 설정

전력거래소 API를 사용하려면 공공데이터포털 서비스 키가 필요합니다:

1. **공공데이터포털에서 서비스 키 발급**
   - https://www.data.go.kr 접속
   - "한국전력거래소_시간별 SMP 및 전력수급예측" API 검색
   - 서비스 신청 후 인증키 발급

2. **.env.local 파일 생성**
   ```bash
   # 프로젝트 루트에 .env.local 파일 생성
   NEXT_PUBLIC_DATA_GO_KR_SERVICE_KEY=발급받은_서비스_키
   ```

3. **개발 서버 재시작**
   ```bash
   # 환경 변수 변경 후 반드시 개발 서버를 재시작해야 합니다
   npm run dev
   ```

**주의사항:**
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- 환경 변수 이름은 정확히 `NEXT_PUBLIC_DATA_GO_KR_SERVICE_KEY`여야 합니다
- `NEXT_PUBLIC_` 접두사가 있어야 클라이언트 사이드에서 접근 가능합니다

### 6.2 주요 라이브러리

- **Next.js 14**: App Router 사용
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Shadcn UI**: 컴포넌트 라이브러리
- **Lucide React**: 아이콘
- **Radix UI**: 접근성 기반 UI 프리미티브

### 6.3 코드 구조

프로젝트는 **FSD (Feature-Sliced Design)** 아키텍처를 따릅니다.

```
cursor_biosmp/
├── app/
│   ├── globals.css          # 전역 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 메인 페이지
├── components/              # React 컴포넌트 (레거시 호환용 re-export)
│   ├── TextFormulaEditor.tsx      # → features/formula-editor
│   ├── ContributionProfitChart.tsx # → features/contribution-profit-chart
│   ├── IntuitiveFormulaEditor.tsx  # → features/intuitive-formula-editor
│   ├── SMPPriceTable.tsx          # → features/smp-price-table
│   ├── AnalysisTable.tsx           # → features/analysis-table
│   └── FormulaBlockBuilder.tsx     # → features/formula-block-builder
├── features/                # Feature-Sliced Design: 기능별 모듈
│   ├── formula-editor/      # 계산식 텍스트 편집기
│   │   ├── ui/              # UI 컴포넌트
│   │   ├── model/           # Custom Hooks (상태 관리)
│   │   ├── lib/             # 유틸리티 함수
│   │   ├── types.ts         # 타입 정의
│   │   ├── constants.ts     # 상수
│   │   └── index.ts         # Public API
│   ├── contribution-profit-chart/  # 공헌이익 비교 차트
│   ├── intuitive-formula-editor/   # 직관적 계산식 편집기
│   ├── smp-price-table/            # SMP 가격 테이블
│   ├── analysis-table/             # 분석 테이블
│   └── formula-block-builder/      # 계산식 블록 빌더
├── shared/                  # 공유 리소스
│   └── formula/             # 계산식 관련 공유 로직
│       ├── field-definitions.ts    # 필드 정의
│       └── default-value-calculator.ts # 기본값 계산
├── contexts/                # Context API
│   └── AppContext.tsx       # 전역 상태 관리
├── lib/                     # 전역 유틸리티
│   ├── calculations.ts      # 계산 로직
│   ├── formatters.ts        # 숫자 포맷팅
│   ├── formula-evaluator.ts # 계산식 평가기
│   ├── storage.ts           # 로컬 스토리지
│   ├── utils.ts             # 유틸리티 함수
│   └── variable-mapper.ts   # 변수 매핑 (한글 변수명 변환)
├── types/
│   └── index.ts             # TypeScript 타입 정의
├── public/
│   └── images/
│       └── ci-logo.svg      # CI 로고
├── .cursorrules             # 디자인 가이드라인
├── tailwind.config.ts       # Tailwind 설정
└── package.json
```

### 6.4 아키텍처 원칙: FSD (Feature-Sliced Design)

프로젝트는 **Feature-Sliced Design** 아키텍처를 따릅니다. 각 기능(feature)은 독립적인 모듈로 구성되며, 명확한 레이어 구조를 가집니다.

#### 6.4.1 디렉토리 구조

각 feature는 다음 레이어로 구성됩니다:

```
features/{feature-name}/
├── ui/              # UI 컴포넌트 (순수 React 컴포넌트)
├── model/           # 비즈니스 로직 (Custom Hooks, 상태 관리)
├── lib/             # 유틸리티 함수 (도메인 로직)
├── api/             # API 호출 (필요시)
├── types.ts         # 타입 정의
├── constants.ts     # 상수
└── index.ts         # Public API (외부 노출 인터페이스)
```

#### 6.4.2 레이어별 역할

- **`ui/`**: 순수 UI 컴포넌트
  - 재사용 가능한 서브 컴포넌트
  - 50줄 이상의 UI 블록은 별도 파일로 분리
  - Props를 통한 데이터 전달만 수행

- **`model/`**: 비즈니스 로직 및 상태 관리
  - Custom Hooks (`use{Name}.ts`)
  - `useState`, `useEffect` 등 상태 관리 로직
  - 비즈니스 규칙 및 계산 로직

- **`lib/`**: 유틸리티 함수
  - 순수 함수 (Pure Functions)
  - 도메인 특화 로직
  - 재사용 가능한 헬퍼 함수

- **`api/`**: 외부 API 호출 (필요시)
  - API 클라이언트
  - 데이터 페칭 로직

- **`types.ts`**: 타입 정의
  - Interface, Type 정의
  - Feature 전용 타입

- **`constants.ts`**: 상수
  - 하드코딩된 값
  - 설정값

- **`index.ts`**: Public API
  - 외부에서 사용할 컴포넌트/함수만 export
  - 내부 구현 세부사항은 숨김

#### 6.4.3 공유 리소스 (`shared/`)

여러 feature에서 공유되는 로직은 `shared/` 디렉토리에 배치합니다.

```
shared/
└── formula/         # 계산식 관련 공유 로직
    ├── field-definitions.ts      # 필드 정의 (여러 컴포넌트에서 사용)
    └── default-value-calculator.ts # 기본값 계산 로직
```

### 6.5 리팩토링 가이드라인

#### 6.5.1 Safe Refactoring 원칙

리팩토링은 **기능 변경 없이 구조만 개선**하는 것을 원칙으로 합니다.

- ✅ **허용**: 파일 분리, 함수 추출, 네이밍 개선, 타입 추가
- ❌ **금지**: 로직 변경, 기능 추가/삭제, 동작 방식 변경

#### 6.5.2 파일 분리 기준

대형 컴포넌트를 리팩토링할 때 다음 기준을 따릅니다:

1. **Custom Hooks 분리** (`model/use{Name}.ts`)
   - `useState`, `useEffect` 등 상태 관리 로직
   - 비즈니스 로직 및 계산
   - 50줄 이상의 로직 블록

2. **서브 컴포넌트 분리** (`ui/{Name}.tsx`)
   - 50줄 이상의 UI 블록
   - 재사용 가능한 UI 단위
   - 명확한 책임을 가진 UI 섹션

3. **타입 정의 분리** (`types.ts`)
   - Interface, Type 정의
   - Props 타입
   - 도메인 모델

4. **상수 분리** (`constants.ts`)
   - 하드코딩된 값
   - 설정값
   - 매직 넘버/문자열

5. **유틸리티 함수 분리** (`lib/{name}.ts`)
   - 순수 함수 (Pure Functions)
   - 도메인 독립적인 로직
   - 재사용 가능한 헬퍼

#### 6.5.3 Clean Code 원칙

1. **Early Return**
   - 중첩된 if-else 제거
   - 가드 클로즈 패턴 활용

2. **SRP (Single Responsibility Principle)**
   - 각 함수/컴포넌트는 단일 책임만 수행
   - 하나의 함수는 하나의 일만 처리

3. **명확한 네이밍**
   - 변수/함수명은 의도를 명확히 표현
   - 약어 사용 최소화
   - 한글 주석으로 비즈니스 로직 설명

4. **성능 최적화**
   - `useMemo`: 계산 비용이 큰 값 메모이제이션
   - `useCallback`: 함수 재생성 방지
   - 불필요한 re-render 방지

#### 6.5.4 하위 호환성 유지

기존 `components/` 디렉토리의 컴포넌트는 **re-export**로 유지하여 하위 호환성을 보장합니다.

```typescript
// components/TextFormulaEditor.tsx
// Re-export from FSD structure
export { TextFormulaEditor } from "@/features/formula-editor";
export type { TextFormulaEditorProps } from "@/features/formula-editor";
```

이를 통해:
- 기존 import 경로 유지
- 점진적 마이그레이션 가능
- Breaking change 방지

#### 6.5.5 리팩토링 체크리스트

대형 컴포넌트 리팩토링 시 다음을 확인합니다:

- [ ] 기능 변경 없음 (Safe Refactoring)
- [ ] Custom Hooks로 상태 관리 로직 분리
- [ ] 50줄 이상 UI 블록은 서브 컴포넌트로 분리
- [ ] 타입 정의는 `types.ts`로 분리
- [ ] 상수는 `constants.ts`로 분리
- [ ] 유틸리티 함수는 `lib/`로 분리
- [ ] `index.ts`에 Public API만 export
- [ ] 기존 `components/` 경로에 re-export 추가
- [ ] 린터 오류 없음
- [ ] 타입 안정성 확인

## 7. 주요 변경 이력

### v0.2.4 (최신)
- ✅ **FSD (Feature-Sliced Design) 아키텍처 전면 적용**
  - 대형 컴포넌트를 FSD 구조로 리팩토링
  - `features/` 디렉토리에 기능별 모듈 구성
    - `formula-editor/`: 계산식 텍스트 편집기 (7개 lib, 4개 hooks, 7개 UI)
    - `contribution-profit-chart/`: 공헌이익 비교 차트 (6개 lib, 4개 UI)
    - `intuitive-formula-editor/`: 직관적 계산식 편집기 (1개 lib, 1개 hook, 7개 UI)
    - `smp-price-table/`: SMP 가격 테이블 (2개 lib, 1개 hook, 4개 UI)
    - `analysis-table/`: 분석 테이블 (1개 constants, 3개 UI)
    - `formula-block-builder/`: 계산식 블록 빌더 (2개 lib, 4개 UI)
  - `shared/formula/` 공유 리소스 생성
    - `field-definitions.ts`: 필드 정의 중앙화
    - `default-value-calculator.ts`: 기본값 계산 로직 공유
  - Safe Refactoring 원칙 준수 (기능 변경 없이 구조만 개선)
  - 하위 호환성 유지 (기존 `components/` 경로 re-export)
  - Clean Code 원칙 적용 (Early Return, SRP, 명확한 네이밍)
  - 모든 feature에 Public API (`index.ts`) 정의
  - 린터 오류 없음, 타입 안정성 확보

### v0.2.3
- ✅ **계산식 편집 기능 UI/UX 개선**
  - 변수 자동완성 방식 개선
    - `/` 키 대신 한글 변수명 입력 시 자동완성 드롭다운 표시
    - 입력 필드 바로 아래에 상대적으로 배치하여 위치 개선
    - 화살표 키로 이동, Enter/Tab 키로 선택 가능
  - 모드 선택 순서 변경
    - 계산식(왼쪽) / 고정값(오른쪽) 순서로 배치 (기본 모드가 계산식이므로)
  - 예상 결과 카드 디자인 개선
    - 계산식 입력 필드와 동일한 디자인으로 통일
    - 배경색: `bg-[#F9FAFB]` (연한 회색)
    - Border-radius: `rounded-[16px]`
    - 텍스트 크기: `text-[17px] font-medium` (입력 필드와 동일)
    - Shadow 제거로 미니멀한 디자인
  - 변수 카테고리 재구성
    - 사용자 입력 값: 출력, SMP 가격, 송전효율, 소내소비율, PKS 단위열량, WC 단위열량, PKS 단위가격, WC 단위가격
    - 계산 값: 발전효율, 송전량, PKS 연료사용량, WC 혼소율, PKS 발전단가, WC 발전단가, 총 발전단가, 약품비, 수전요금, 매출 전력량, 매출 REC, 매출 계, 비용 연료비, 비용 약품비, 비용 수전료, 시간당 수익
    - 고정 값: WC 연료사용량
  - 변수 값 태그 표시 기능 추가
    - 입력한 계산식에 사용된 변수의 실제 값을 태그 형태로 표시
    - 형식: "변수명 값 단위"
    - 93MW 기준으로 계산된 값 실시간 표시
  - 기본 공식 자동 표시
    - 편집 모달 열기 시 기본 공식이 변수 블록 형태로 자동 입력됨
    - 사용자가 바로 수정 가능한 상태로 표시

### v0.2.2
- ✅ **수익 비교 분석 테이블 편집 기능 개선**
  - 계산식 편집 UI 개선
    - 각 필드를 작은 블록 형태로 표시 (한 줄에 5개씩)
    - 블록 클릭 시 아래에 편집 카드 표시
    - 사용자 입력값과 계산값을 섹션별로 분리 구분
  - 계산식 입력 시 변수 시각적 강조
    - 변수를 빨간색 텍스트와 회색 배경의 둥근 사각형으로 표시
    - 변수임을 명확히 구분할 수 있도록 시각적 피드백 제공
  - 변수 선택 모달 위치 개선
    - 입력 필드 바로 아래에 상대적으로 배치
    - 이상한 위치에 표시되던 문제 해결
  - 계산식 예상 결과 표시 기능 추가
    - 입력한 계산식의 예상 결과를 실시간으로 계산하여 표시
    - 기본값(93MW 기준)으로 계산된 예상 결과 제공
    - 계산 오류 시 안내 메시지 표시
- ✅ **코드 품질 개선**
  - SonarQube 경고 대부분 수정
    - String.raw 사용으로 이스케이프 문자 처리 개선
    - replaceAll 사용으로 코드 일관성 향상
    - globalThis 사용으로 브라우저 호환성 개선
    - 함수 중첩 깊이 감소 (별도 함수로 추출)
    - Array index key 개선 (고유 key 생성)
  - 접근성 개선 (aria-label, aria-multiline 추가)

### v0.2.1
- ✅ **공헌이익 비교 차트 개선**
  - 우위 구간 가로 그래프 추가 (숫자 선 형태)
    - 각 출력 레벨별 우위 구간을 색상으로 구분하여 시각화
    - 눈금 및 레이블 표시 (0, 25, 50, 75, 100, 125, 150)
    - 막대 그래프 내부에 출력 레벨 레이블 표시
  - 정지 구간 추가
    - 모든 출력 레벨의 공헌이익이 0 이하인 구간을 "정지"로 표시
    - 회색(#8B95A1)으로 구분하여 표시
    - 정지 구간의 끝점 자동 계산
  - 막대 그래프 색상 복원
    - 93MW: 검은색 (#191F28)
    - 80MW: 빨간색 (#F04452)
    - 65MW: 파란색 (#3182F6)
    - 정지: 회색 (#8B95A1)
  - 범례 개선
    - 여러 줄 표시 (가로 스크롤 제거)
    - 간소화: 색상 아이콘 + 숫자 범위만 표시 (예: "0 ~ 34 원/kWh")
    - 가운데 정렬
  - 편집 모달 버튼 스타일 개선
    - 취소 버튼: 텍스트 링크 스타일 (호버 시 밑줄)
    - 저장 버튼: Primary 버튼 스타일 (최소 너비 120px)
- ✅ **감발 요약 테이블 문구 개선**
  - 설명 문구 간소화 및 명확화
  - "전날 24시와 오늘 1시가 모두 기준 이하인 구간을 우선 선택합니다"로 변경

### v0.2.0
- ✅ **Toss 스타일 디자인 시스템 전면 개편**
  - 모든 컴포넌트에 Toss 디자인 시스템 적용
  - Typography: Pretendard 폰트, 큰 글씨, 볼드체
  - Color Palette: Toss 브랜드 컬러 적용 (#3182F6, #F04452, #191F28 등)
  - Border Radius: Super ellipse (24px, 20px, 18px, 16px)
  - Shadow: 단순화된 그림자 시스템
- ✅ **공헌이익 비교 차트 추가** (`ContributionProfitChart`)
  - Y축: 공헌이익 (백만원), X축: SMP (원/kWh)
  - 65MW, 80MW, 93MW 출력별 공헌이익 곡선 표시
  - 교차점 표시 (흰색 원 + 검은 테두리, 큰 SMP 값 표시)
  - 출력 레벨 편집 기능 (65~95MW, 복수 선택 가능)
  - 우위 구간 표시 (어떤 출력이 가장 수익성이 높은지)
- ✅ **감발 요약 테이블 추가** (`CurtailmentSummary`)
  - 감발 기준가격 이하 연속 6시간 이상 구간 감지
  - 가장 긴 구간 우선 선택 (동일 길이 시 전날 연속 구간 우선)
  - 감발 평균 SMP, 감발시간, 시간당 수익, 총 금액 계산
  - 매뉴얼/전력거래소 탭 전환에 따른 동적 데이터 표시
  - 단위 표시 (만원)
- ✅ **대시보드 개선**
  - 시간대별 SMP 가격 변동 추이 테이블 추가 (읽기 전용)
  - 시뮬레이션 탭과 동일한 데이터 소스 사용
  - 매뉴얼/전력거래소 탭 전환 기능
- ✅ **데이터 소스 관리 개선**
  - `AppContext`에 `exchangeSMPData`, `currentDataSource` 추가
  - 매뉴얼/전력거래소 데이터 분리 관리
  - 시뮬레이션 탭과 대시보드 탭 간 데이터 동기화
- ✅ **UI 개선**
  - 편집 모달 버튼 스타일 개선 (취소: 텍스트 링크 스타일, 저장: Primary 버튼)
    - DialogFooter 제거, 커스텀 div로 교체
    - 취소 버튼: 텍스트 링크 스타일 (호버 시 밑줄)
    - 저장 버튼: 최소 너비 120px, Primary 버튼 스타일
    - 간격 및 정렬 개선 (gap-4, items-center)
  - 모든 테이블 헤더에 `whitespace-nowrap` 적용 (줄바꿈 방지)
  - PKS/WC 연료사용량(톤) 컬럼 추가
  - Toss 스타일 일관성 적용
  - 린터 경고 해결 (sortedSelectedOutputs useMemo 최적화)

### v0.1.0
- ✅ Next.js App Router 기반 프로젝트 구성
- ✅ Material Design + Fluent Design Hybrid 디자인 시스템 적용
- ✅ 네비게이션 바 및 탭 구조 (대시보드/시뮬레이션)
- ✅ 실시간 수익 계산 기능
- ✅ 감발 임계값 자동 계산 기능
- ✅ 상세 분석 모달 (93MW~65MW 1MW 단위)
- ✅ 시간대별 SMP 가격 변동 추이 테이블
- ✅ 숫자 포맷팅 (천 단위 구분 쉼표)
- ✅ 로컬 스토리지 데이터 영속성
- ✅ CI 로고 통합

### 주요 개선사항
- 계산 정확도 향상 (약품비, 수전료 공식 수정)
- UI/UX 개선 (테이블 가독성, 컴팩트한 레이아웃)
- 성능 최적화 (useMemo 활용)
- 타입 안정성 강화 (TypeScript)

## 8. 향후 개선 사항

- [ ] 날짜 추가/삭제 기능 (SMP 가격 테이블)
- [ ] 시간대별 SMP 가격 수정 기능
- [ ] 데이터 내보내기/가져오기 (CSV/Excel)
- [ ] 차트 시각화 (시간대별 SMP 변화)
- [x] 감발 요약 계산기 (우측 패널) - ✅ v0.2.0 완료
- [x] 공헌이익 비교 차트 - ✅ v0.2.0 완료
- [x] 계산식 편집 기능 - ✅ v0.2.2 완료
- [ ] 반응형 디자인 개선 (모바일 대응)

## 9. 참고 자료

- **디자인 가이드라인**: `.cursorrules` 파일 참조
- **계산 공식 상세**: `lib/calculations.ts` 주석 참조
- **타입 정의**: `types/index.ts` 참조

---

**프로젝트명**: 바이오매스 공헌이익 시뮬레이터  
**버전**: 0.2.4  
**최종 업데이트**: 2024년 12월
