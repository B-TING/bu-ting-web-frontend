# AGENTS.md

이 레포는 부산 지역 특화 여행 계획 웹 서비스를 개발하는 프로젝트입니다.
AI 에이전트(Claude Code, Codex 등)는 작업 전 이 문서를 먼저 확인해야 합니다.

## 프로젝트 개요

초기 개발 단계에서는 다음을 우선합니다.

- 안정적인 프로젝트 구조 설계
- 지역/장소/일정 도메인 모델 정리
- 클라이언트 상태와 서버 상태 분리
- 추후 지도, 장소 API, 일정 추천 로직을 붙일 수 있는 구조 확보
- 다국어(i18n) 대응 구조 유지

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- next-intl 기반 다국어(`[locale]` 세그먼트)

## 작업 경계 (Ownership boundaries)

- 이 저장소는 `CODEOWNERS`로 경로별 담당자가 지정되어 있습니다.
- 파일 수정 전, 해당 경로가 내 담당인지 `CODEOWNERS`를 먼저 확인합니다.
- 내 담당 밖 경로는 **읽기만** 하고 수정하지 않습니다.
  수정이 필요하면 코드를 직접 바꾸지 말고 "이 파일에 X 변경이 필요하다"고 사용자에게 보고합니다.
- 공용 파일(`package.json`, `tsconfig.json`, 공통 설정, `types/`의 공통 타입,
  `i18n/`, `messages/` 등)은 단독 수정 금지 → 반드시 계획 제시 후 PR로만 진행합니다.
- `CODEOWNERS`는 강제(머지 차단)이고, 이 문서의 규칙은 예방(사전 안내)입니다.
  둘이 충돌하면 `CODEOWNERS` + branch protection이 우선입니다.

## 타입 규칙

- **`any` 사용 금지.** 퍼블리싱(마크업/스타일)만 진행하는 경우에도 `any`로 때우지 않습니다.
- 필요한 타입은 `types/` 폴더에 정의하고 import해서 사용합니다.
  - 여러 곳에서 쓰는 공통 타입 → `types/`
  - 특정 페이지 안에서만 쓰는 좁은 타입은 해당 페이지 폴더 안에 두어도 되지만,
    도메인 데이터 형태(장소, 일정, 지역 등)는 `types/`에 정의합니다.
- API 응답 타입은 반드시 명시합니다. 응답 구조가 불확실하면 임시 `any` 대신
  `unknown` + 좁히기(narrowing)를 쓰거나, 사용자에게 스펙을 확인합니다.

## 컴포넌트 배치 규칙

이 프로젝트는 **도메인 폴더(features) 방식이 아니라, 페이지 옆에 컴포넌트를 두는
co-location 방식**을 사용합니다. GoF 디자인 패턴(팩토리, 옵저버 등) 자체를 금지하는
것이 아니라, `features/` 같은 도메인 계층 분리 아키텍처를 쓰지 않는다는 의미입니다.

컴포넌트를 어디에 둘지는 아래 순서로 판단합니다 (자세한 예시는 아래
"폴더 구조 원칙" 섹션 참고).

1. 한 페이지에서만 쓰는가? → 그 페이지 폴더 안 `components/`
2. 2곳 이상에서 쓰이지만, 그 페이지들이 전부 같은 최상위 라우트(도메인) 밑에
   있는가? → 그 라우트 자신의 `components/` (예: `app/[locale]/trips/components/`)
3. 서로 다른 최상위 라우트가 공유하거나 특정 라우트에 종속되지 않는 전역
   컴포넌트인가? → 루트 `components/` (shadcn/ui 포함)

⚠️ "2곳 이상에서 쓰인다 = 무조건 루트로 승격"이 아닙니다. 2번과 3번을 구분하지
않으면 `/auth/login`, `/auth/sign-up`처럼 같은 도메인 안에서만 공유하는
컴포넌트까지 루트로 잘못 올리게 됩니다.

### 파일 이름 규칙

- 컴포넌트 파일은 컴포넌트명과 일치하도록 PascalCase를 사용합니다. 예: `OAuthLoginPanel.tsx`, `OnboardingHeader.tsx`
- 컴포넌트가 아닌 파일(훅, 유틸, store, 타입, 상수, API 함수 등)은 kebab-case를 사용합니다. 예: `api-client.ts`, `use-trip-query.ts`
- 기존에 kebab-case로 작성된 컴포넌트 파일은 레거시로 보고, 수정 시점에 PascalCase로 점진적으로 정리합니다.

### ⚠️ features 폴더 (레거시, 사용 금지)

- 루트의 `features/` 폴더는 프로젝트 초기에 실수로 생성된 레거시입니다.
- **앞으로 작성되는 코드는 `features/`에 넣지 않습니다.**
- 새 도메인 폴더(`features/xxx`)를 만들거나, 도메인별로 UI/hook/util을 분리하는
  구조를 새로 도입하지 않습니다.
- 기존 `features/` 코드를 옮기는 것은 Level 2 이상 작업으로 취급하고,
  사용자 승인 후에만 진행합니다.

## 상태 관리 원칙

### TanStack Query 사용 대상

- 서버에서 받아오는 데이터
- 장소 목록
- 여행 일정 데이터
- API 응답 캐싱
- 로딩/에러/재요청 처리가 필요한 데이터

### Zustand 사용 대상

- 사용자가 선택한 여행 조건
- 현재 선택된 지역
- 일정 생성 단계
- 모달/필터/탭 등 UI 상태
- 여러 컴포넌트에서 공유되는 클라이언트 상태

### 금지

- 서버 데이터를 Zustand에 무분별하게 복사하지 않음
- 단일 컴포넌트에서만 쓰는 상태를 전역 store로 만들지 않음
- API 호출 로직을 UI 컴포넌트에 직접 강하게 결합하지 않음

## 폴더 구조 원칙

현재 구조는 다음과 같습니다. (다국어 대응을 위해 `app/[locale]` 세그먼트 사용)

```txt
app/
  [locale]/
    ai-helpdesk/
    auth/
      components/            # /auth 하위 페이지끼리 공유 (login, sign-up)
      callback/[provider]/
        components/          # 이 페이지 전용 컴포넌트
      login/
      sign-up/
    festivals/
    language/
      components/            # 이 페이지 전용 컴포넌트
    luggage/
    my/
      components/            # 이 페이지 전용 컴포넌트
      preferences/
        components/          # 이 페이지 전용 컴포넌트
    onboarding/
      components/            # 이 페이지 전용 컴포넌트
    sos/
    stays/
    stories/
    trips/
      components/            # /trips 하위 페이지끼리 공유 (trips, [tripId]/*, new/*)
    layout.tsx
    page.tsx                 # 홈 페이지
  layout.tsx
  globals.css
api/                  # 백엔드 REST API를 호출하는 fetch 함수
components/           # 서로 다른 라우트(도메인)끼리 공유하거나, 라우트에 종속되지 않는 전역 컴포넌트
  onboarding/         # /onboarding과 /my/preferences처럼 서로 다른 라우트가 공유
constants/            # React/상태와 무관한 고정 데이터 (질문 목록, 카드 데이터 등)
hooks/                # 여러 곳에서 재사용하는 커스텀 훅 (TanStack Query 훅 등)
i18n/                 # request.ts, routing.ts 등 다국어 설정
lib/                  # api-client.ts, utils.ts 등 공통 유틸/설정, 도메인 로직(oauth, 온보딩 프로필 변환 등)
messages/             # 언어별 번역 리소스
public/
stores/               # Zustand store
types/                # 공통 타입
```

규칙:

- **한 페이지에서만 쓰는 컴포넌트** → 그 페이지 폴더 안 `components/`
  - 예: `feature-highlight.tsx`는 `/onboarding` 페이지에서만 쓰이므로
    `app/[locale]/onboarding/components/`
- **같은 최상위 라우트(도메인)의 하위 페이지끼리 공유하는 컴포넌트** → 그 도메인
  자신의 `components/` (루트 `components/`로 올리지 않는다)
  - 판단 기준: 사용하는 페이지들을 전부 감싸는 **가장 가까운 공통 상위 라우트
    폴더**가 있는가? 있다면 거기 `components/`에 둔다.
  - 예: `TripTabHeader`는 `/trips`, `/trips/[tripId]/budget`,
    `/trips/[tripId]/records`, `/trips/[tripId]/itinerary`에서 쓰이는데,
    전부 `/trips` 밑이므로 → `app/[locale]/trips/components/`
  - 예: `oauth-login-panel`은 `/auth/login`, `/auth/sign-up`에서 쓰이는데
    둘 다 `/auth` 밑이므로 → `app/[locale]/auth/components/`
- **서로 다른 최상위 라우트가 공유하거나, 특정 라우트에 종속되지 않는
  전역 컴포넌트** → 루트 `components/`
  - 예: `onboarding-header`, `preference-question`은 `/onboarding`과
    `/my/preferences`가 같이 쓰는데, 이 둘은 서로 다른 최상위 라우트라
    공통 상위 폴더가 없다 → `components/onboarding/`
  - 예: `Header`, `Footer`, `Landing`, `NavigationSidebar`는 특정 라우트의
    하위 페이지 관계가 아니라 앱 전역 쉘(shell) 성격이라 지금 실제로는
    홈 페이지 하나에서만 import되고 있어도 루트 `components/`에 둔다.
  - shadcn/ui 기반 컴포넌트(`components/ui/`)도 항상 여기 규칙을 따른다.

  ⚠️ **자주 하는 실수**: "2곳 이상에서 쓰인다 = 무조건 루트 `components/`로 승격"이
  아니다. 반드시 "그 2곳 이상이 같은 최상위 라우트 밑에 있는가"부터 확인한다.
  같은 라우트 밑이면 그 라우트 자신의 `components/`에 두고, 완전히 다른 라우트일
  때만 루트로 올린다. (실제로 `oauth-login-panel`을 이 확인 없이 루트
  `components/auth/`로 잘못 올렸다가 다시 `app/[locale]/auth/components/`로
  되돌린 적이 있다.)

- `api`: 백엔드를 호출하는 클라이언트 fetch 함수만. Next.js의 `app/api`(Route Handler)와는 무관하므로 혼동하지 않도록 루트에 별도로 둔다.
- `constants`: React 훅/상태가 아닌 순수 상수·설정 데이터
- `hooks`: 여러 컴포넌트/페이지에서 재사용하는 커스텀 훅
- `stores`: Zustand store
- `types`: 공통 타입 (any 대신 여기 정의)
- `lib`: 외부 라이브러리 설정, 공통 유틸, API 클라이언트, React에 의존하지 않는 도메인 로직(변환/검증 함수 등)
- `i18n` / `messages`: 다국어 설정과 번역 리소스 (공용 → 단독 수정 금지)
- `features`: 레거시. 신규 코드 추가 금지. 현재 `features/trip`만 남아있고 별도 작업으로 이관 예정.

공통 판단 기준:

- **컴포넌트**: 한 페이지 전용이면 그 페이지 `components/`, 같은 최상위 라우트의
  하위 페이지끼리 공유하면 그 라우트 자신의 `components/`, 서로 다른 최상위
  라우트가 공유하거나 라우트 무관 전역이면 루트 `components/`.
- **그 외(hooks/lib/constants/api/types/stores)**: 라우트와 직접 매핑되는
  개념이 아니므로 페이지 전용 좁은 타입(타입 규칙 참고)을 제외하면 항상 루트
  종류별 폴더에 둔다. 몇 곳에서 쓰이는지는 상관없다.

## 작업 분류

### Level 0 — 단순 수정

예시: 오타 수정, 스타일 일부 수정, 텍스트 변경, 작은 컴포넌트 수정

규칙:

- 바로 수정 가능
- 변경 파일과 이유를 간단히 설명

### Level 1 — 일반 기능 구현

예시: 입력 폼 추가, 카드 UI 구현, Zustand store 추가, TanStack Query hook 추가, 페이지 단위 UI 구현

규칙:

- 구현 전 간단한 계획 제시
- 사용자 승인 후 수정
- 완료 후 실행/검증 방법 안내

### Level 2 — 구조 변경 또는 리팩토링

예시: 폴더 구조 변경, 상태 관리 구조 변경, API 계층 분리, 도메인 모델 재설계, 공통 컴포넌트 구조 변경, `features/` 코드 이전

규칙:

- 반드시 계획 먼저 작성
- 변경 범위, 영향도, 대안을 설명
- 사용자 승인 전 파일 수정 금지

### Level 3 — 대규모 설계 변경

예시: 전체 아키텍처 변경, 지도/추천/일정 생성 로직 설계, 외부 API 연동 구조 설계, 인증/저장소/DB 구조 설계, 다국어 구조 변경

규칙:

- 바로 구현하지 않음
- 문제 정의 → 대안 → 선택 기준 → 작업 단위 순서로 정리
- 사용자 승인 후 task 단위로 진행

## 커밋 규칙

### 형식

```txt
<type>: <한 줄 요약>

<선택: 본문 — 왜 이렇게 했는가>
```

### type

- `feat` — 새 기능
- `fix` — 버그 수정
- `refactor` — 동작 변경 없이 구조 개선
- `test` — 테스트 추가/수정
- `docs` — 문서만 변경
- `chore` — 빌드·설정·메타
- `perf` — 성능 개선
- `style` — 포맷·공백·세미콜론

### 규칙

- 1 task = 1 commit
- 무관한 변경을 한 커밋에 섞지 않음
- 리팩토링과 기능 추가를 같은 커밋에 묶지 않음

### 금지

- `main` 직접 커밋
- `--no-verify`로 훅 우회
- 테스트 없는 기능 커밋
- 의미 없는 `update`, `fix`, `WIP` 커밋 메시지

## 기본 작업 흐름

1. 사용자 요청 확인
2. 작업 경계(`CODEOWNERS`) 확인 — 내 담당 경로인지
3. 작업 Level 분류
4. Level 1 이상이면 간단한 계획 제시
5. 사용자 승인 후 구현
6. 변경 파일과 이유 설명
7. 실행 또는 검증 방법 안내
8. 필요한 경우 커밋 메시지 제안

## AI 에이전트 역할

- Claude: 일상적인 코드 작성, UI 구현, 작은 리팩토링, 문서 정리
- Codex: 복잡한 로직 분석, 대규모 리팩토링, 구조적 문제 진단

자동 라우팅은 하지 않으며, 사용자가 명시한 도구를 우선합니다.
