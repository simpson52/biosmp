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
- 중앙: 탭 네비게이션 (대시보드 | 시뮬레이션)
- 고정 위치 (sticky top)

#### 대시보드 탭
- **요약 카드 섹션**: 93MW, 80MW, 65MW 출력별 시간당 수익 및 공헌이익 표시
- **감발 임계값 카드 섹션**: 자동 계산된 감발 임계값 표시
  - 80MW = 65MW 공헌이익 지점
  - 80MW 공헌이익 = 0 지점
  - 65MW 공헌이익 = 0 지점

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

### 2.2 컴포넌트 구조

```
components/
├── Navigation.tsx          # 네비게이션 바 (탭 전환)
├── Dashboard.tsx           # 대시보드 탭 컨텐츠
├── Simulation.tsx          # 시뮬레이션 탭 컨텐츠
├── InputSection.tsx        # 입력 섹션 (주요 입력값, 요약 카드)
├── AnalysisTable.tsx       # 수익 비교 분석 테이블
├── DetailedAnalysisModal.tsx  # 상세 분석 모달 (93MW~65MW 1MW 단위)
├── SMPPriceTable.tsx       # 시간대별 SMP 가격 변동 추이 테이블
└── ui/                     # Shadcn UI 컴포넌트
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── table.tsx
    └── textarea.tsx
```

### 2.3 상태 관리

**Context API** (`contexts/AppContext.tsx`)
- `inputParameters`: 기준 SMP, 연료 단가 등
- `curtailmentThresholds`: 감발 임계값 (자동 계산)
- `plantRowInputs`: 출력별 송전효율, 소내소비율
- `hourlySMPData`: 시간대별 SMP 가격 데이터

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

1. **80MW 공헌이익 = 0 지점**
   - 80MW 출력 시 공헌이익이 0이 되는 SMP 가격

2. **80MW = 65MW 공헌이익 지점**
   - 80MW와 65MW의 공헌이익이 같아지는 SMP 가격

3. **65MW 공헌이익 = 0 지점**
   - 65MW 출력 시 공헌이익이 0이 되는 SMP 가격

**계산 함수**: `calculateCurtailmentThresholds()` (`lib/calculations.ts`)

## 4. 주요 기능

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

### 4.5 시각적 피드백
- **입력 필드**: 노란색 배경 (#FFF9E6)
- **공헌이익**: 양수(녹색), 음수(빨간색)
- **매출**: 녹색 강조
- **비용**: 빨간색 강조
- **감발 조건**: 빨간색 배경 (#fcb1b1)

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

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 6.2 주요 라이브러리

- **Next.js 14**: App Router 사용
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Shadcn UI**: 컴포넌트 라이브러리
- **Lucide React**: 아이콘
- **Radix UI**: 접근성 기반 UI 프리미티브

### 6.3 코드 구조

```
cursor_biosmp/
├── app/
│   ├── globals.css          # 전역 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 메인 페이지
├── components/              # React 컴포넌트
├── contexts/                # Context API
│   └── AppContext.tsx       # 전역 상태 관리
├── lib/
│   ├── calculations.ts      # 계산 로직
│   ├── formatters.ts        # 숫자 포맷팅
│   ├── storage.ts           # 로컬 스토리지
│   └── utils.ts             # 유틸리티 함수
├── types/
│   └── index.ts             # TypeScript 타입 정의
├── public/
│   └── images/
│       └── ci-logo.svg      # CI 로고
├── .cursorrules             # 디자인 가이드라인
├── tailwind.config.ts       # Tailwind 설정
└── package.json
```

## 7. 주요 변경 이력

### v0.1.0 (현재)
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
- [ ] 감발 요약 계산기 (우측 패널)
- [ ] 반응형 디자인 개선 (모바일 대응)

## 9. 참고 자료

- **디자인 가이드라인**: `.cursorrules` 파일 참조
- **계산 공식 상세**: `lib/calculations.ts` 주석 참조
- **타입 정의**: `types/index.ts` 참조

---

**프로젝트명**: 바이오매스 공헌이익 시뮬레이터  
**버전**: 0.1.0  
**최종 업데이트**: 2024년
