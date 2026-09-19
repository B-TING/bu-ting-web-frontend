# 구역 이벤트 관리자 페이지

## 최신 관리자 API 계약

첨부한 기존 Admin API와 이번 확정 정책을 통합한 **[EVENT-ADMIN-API.md](./EVENT-ADMIN-API.md)**를 백엔드 전달 기준으로 사용한다. 아래 초기 인수인계의 요약보다 통합 수정안이 우선한다. contentId 참조·관리자 좌표 수정, 재제출 이력, 별도 보상 확정, 수동 동점 선정, 정보 수집 완료 기록과 감사 이력 API를 보완했다.

## 구현과 실행

- 작업 브랜치: `feat/event-admin`.
- `npm run dev` → `http://localhost:3000/admin/events`. `/ko/admin/events`는 기존 locale 정책에 따라 이 경로로 이동한다.
- 로테이션 생성·편집, 4개 구역 미션 배정, 여러 선택 장소 등록, 예시 이미지 로컬 미리보기, 사진 승인·반려, 보상·정산, 칭호 기준, 통계·작업 이력을 구현했다.
- 샘플 전용 프런트엔드다. 실제 사용자 정보, 관리자 인증, 서버 저장, 실제 이메일·보상 지급을 연결하지 않았다. 새로고침하면 초기화된다. 샘플 경로에 운영 데이터를 넣으면 안 된다.
- `EventAdmin`은 화면 상태, `lib/event-admin.ts`는 순수 운영 규칙, `lib/event-admin-demo.ts`는 합성 데이터이다. 관광지 검색은 기존 `api/place-api.ts`를 재사용하고 새 `api/event-admin-places.ts`와 TanStack Query 훅에서 응답을 검증한다. 선택한 관광지 참조와 좌표만 미션 폼 초안에 복사한다.
- 서버 API가 없으므로 존재하지 않는 관리자 엔드포인트를 호출하거나 기존 여행 데이터를 변경하지 않는다.

## 확정 정책 반영

1. 회차당 서로 다른 4개 구역. 구역당 미션 하나, 미션당 선택 장소 여러 개.
2. 동일 사용자·회차·구역에 참여 건 하나. 다른 구역 참여 허용.
3. 반려 후 기존 참여 건 아래 새 제출 이력 추가. 다른 선택 장소에서 재촬영 가능.
4. 시작 시각 포함, 종료 시각 제외. 신규 제출·재제출·좋아요 모두 회차 종료에 마감.
5. 종료 후 남은 검수 가능. 종료 후 반려된 건은 재제출 불가.
6. 사진 승인과 기본/특별 보상 확정을 분리. 기본 보상 지급 완료 이후에도 Top N 선정·특별 보상을 별도로 진행할 수 있다.
7. Top N은 구역 미션별 마감 좋아요 기준. 동점 후보는 운영자 수동 선택, 인원 초과 차단.
8. 신고 대상은 보류. 최종 검수 사유 기록 후 보류 해제, 지급 일정 조건을 충족해야 처리 가능.
9. 기본 보상은 확정→지급 완료 기록. 특별 보상은 확정→안내 메일 기록→정보 수집 완료 기록→발송 완료 기록.
10. 긴급 회차/구역 취소는 기존 참여·사진·성공을 삭제하지 않는다. 미션 변경에도 제출 당시 조건·좌표·반경 및 기본 보상 스냅샷 보존.
11. 칭호 1/3/7회는 초기 예시. 증가하는 양의 정수 기준과 칭호명 편집 가능. 실제 칭호 발급/대표 장착은 서버 연동 대상이다.

샘플 시계는 열린 화면에서 상태를 계산하고 마감 좋아요를 동결한다. 앱이 닫힌 상태에서도 실행되는 운영 스케줄러나 서버 시각 검증을 구현한 것은 아니다.

## 기존 API 검토 결과 (2026-09-06)

조직: https://github.com/B-TING

검토 기준:

- 백엔드 `dev`: `6b081b7165236cf83d54c96bcdbfac4da22ebca1`
- 백엔드 `feature/zone-event-submit`: `6e8a5ed5bc828b0912e17f680f2f04483d92b124`
- 배포 명세: https://api.buting.store/docs/openapi3.yaml

### 재사용할 수 있는 기존 기능

| 기능        | 확인한 내용                                                     | 활용                                                                                                                                   |
| ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 로그인      | `/api/v1/auth/oauth/login`, `/api/v1/users/me`                  | 기존 로그인 기반 사용. 관리자용 로그인 체계를 새로 만들 필요는 없음                                                                    |
| 권한 역할   | UserRole의 USER, ADMIN, MANAGER                                 | 역할은 존재하지만 관리자 엔드포인트의 서버 권한 검사를 추가해야 함                                                                     |
| 장소        | `/api/v1/places/search`, `/api/v1/places/{contentId}/detail` 등 | 검색 API 연결 완료. contentId·이름·원본 좌표를 가져오고 타겟 좌표만 수정                                                               |
| 파일        | `/api/v1/files`                                                 | 예시·제출 이미지 업로드 재사용. FormData를 기존 JSON apiRequest에 그대로 넘기면 Content-Type이 잘못될 수 있어 별도 multipart 호출 필요 |
| 이벤트 기반 | feature 브랜치의 활성/상세 조회, 참여, 사진 제출                | 새 도메인을 처음부터 만들기보다 기존 서비스를 확장                                                                                     |
| 보상 기반   | feature 브랜치의 RewardService, 포인트 잔액·원장, 배지          | 수동 확정 API에서 기존 지급 로직 재사용 가능                                                                                           |

### 이벤트 feature 브랜치에서 실제 확인한 것

- `ZoneEventController`: 활성 이벤트 및 상세 조회.
- `ZoneEventParticipationController`: 참여 시작 및 사진 제출.
- `ZoneEventSubmitService`: `zone-event.review.mode` 기본값 AUTO. AUTO는 즉시 성공+기본 보상, MANUAL/HYBRID는 UNDER_REVIEW 전환.
- MANUAL 모드 기반은 재사용 가능하지만 관리자 승인·반려·보상 별도 확정 엔드포인트는 확인되지 않음.
- 현재 타겟 조회는 `findByEvent_Id`로 단일 타겟. 여러 선택 장소 지원 확장 필요.
- 제출은 JOINED 상태만 허용. 반려 후 같은 참여 건에 재제출 및 제출 이력 확장 필요.
- 참여 제한은 열린 참여 중복과 성공 횟수 기준. 이번 확정 정책인 사용자·회차·구역 한 건과 다르므로 수정 필요.
- submit 서비스에서 상태 ACTIVE는 확인하지만 해당 메서드 내 시간 경계 검사는 확인되지 않음. 서버 시간 기준 종료 시각 검증 필요.
- `dev` SecurityConfig에는 관리자 경로 전용 역할 제한이 확인되지 않음. 프런트엔드에서 메뉴를 숨기는 것으로 대체할 수 없음.
- 여행기 좋아요는 travelRecordId에 귀속되어 이벤트 참여 좋아요/회차 마감 순위로 조합할 수 없음.

소스:

- https://github.com/B-TING/bu-ting-backend/blob/6e8a5ed5bc828b0912e17f680f2f04483d92b124/src/main/java/com/butingbe/domain/zoneevent/service/ZoneEventSubmitService.java
- https://github.com/B-TING/bu-ting-backend/blob/6e8a5ed5bc828b0912e17f680f2f04483d92b124/src/main/java/com/butingbe/domain/zoneevent/service/ZoneEventParticipationService.java
- https://github.com/B-TING/bu-ting-backend/blob/6b081b7165236cf83d54c96bcdbfac4da22ebca1/src/main/java/com/butingbe/domain/user/entity/UserRole.java
- https://github.com/B-TING/bu-ting-backend/blob/6b081b7165236cf83d54c96bcdbfac4da22ebca1/src/main/java/com/butingbe/global/config/SecurityConfig.java

## 백엔드 연결 계약 제안 — 아직 존재하는 API가 아님

| 필요한 작업         | 계약에 포함할 내용                                                                     |
| ------------------- | -------------------------------------------------------------------------------------- |
| 관리자 권한 확인    | 기존 로그인 주체 기반 ADMIN/MANAGER 권한, 401/403 구분                                 |
| 회차·미션 CRUD      | 시간대 KST 입력→ISO UTC, 정확히 4구역, 장소 배열, 좌표·반경·파일키, revision           |
| 스케줄·긴급 운영    | 서버 시계/스케줄러, 구역/회차 취소 사유, 기존 이력 보존, 설정 변경 스냅샷              |
| 전체 참여·검수 조회 | 필터·페이지네이션, 업로드 사진 접근 URL, 제출 시각·GPS·타겟 스냅샷, 재제출 이력        |
| 승인·반려           | submissionId, 기대 상태/revision, 사유, 운영자, 처리 시각; 승인 시 보상 자동 지급 금지 |
| 순위·수상자         | 회차 종료 스냅샷, 구역별 순위, 동점 후보·선정 근거, 정산 잠금                          |
| 신고                | 신고 이력, 보류/해제 및 최종 판정 사유, 반려/실격 정책                                 |
| 기본·특별 보상      | 별도 지급 건, 지급 일정, 최종 확정·실제 지급 원장, 중복 방지 키, 동시 요청 잠금        |
| 안내·배송 기록      | 이메일 발송/정보 수집/실제 발송 시각, 실패·재시도; 메일 발송과 실제 지급 완료 구분     |
| 칭호                | 구역별 단계 정의, 승인 누적 집계, 발급·장착, 기준 변경의 소급 여부                     |

실제 연결 시 API 계층은 루트 `api/`, 서버 조회·변경은 TanStack Query로 연결한다. unknown 응답을 좁혀 명시적인 타입으로 변환한다. 수정/정산은 서버에서 재검증하고 원자적으로 처리해야 한다.

## 추가 정책·연동 범위

- 관광지 검색·페이지 이동·오류/재시도, contentId 참조, 원본/수정 좌표 분리와 원본 복원, 외부 지도 확인을 구현했다. 지도 안의 핀 편집은 후속이다. 관광지 마스터 좌표는 변경하지 않는다.
- 기존 샘플 미션은 검증된 실제 contentId가 없어 빈 참조로 표시한다. 샘플을 수정·저장할 때 각 선택 장소를 실제 검색 결과에 연결해야 한다. 임의 가짜 contentId를 API에 보내지 않는다.
- 2026-09-06 실서버 직접 조회에서 해운대 검색 HTTP 200과 contentId·좌표를 확인했다. 일부 요청은 내부 오류였다. localhost:3001 브라우저 검색은 `Failed to fetch`여서 CORS·접속 환경 확인 후 화면에서 실제 선택까지 재검증해야 한다. 응답 변환·장소 선택·좌표 보존 로직은 자동 테스트로 확인했다.
- 쿠폰 개별 재고·월 예산, 실제 앨범·신고 접수, 실제 칭호 발급·장착, 자동 메일 발송은 이번 샘플에서 구현하지 않음.
- 기본 포인트·배지의 실제 반영과 특별 보상 배송은 별개. 개인정보는 이 샘플 UI에 수집·저장하지 않는다.
- 새로 들어온 신고 때문에 기존 수상 순위를 바꾸는 경우, 이미 확정된 수상자·보상의 처리 정책은 서버 정산 잠금 설계에서 정해야 한다.
- 공용 `types/`, `lib/`에는 새 이벤트 전용 파일만 추가했다. 공용 설정·기존 다른 담당 파일은 수정하지 않았다. CODEOWNERS 공동 리뷰와 PR 절차를 거쳐 병합해야 한다. 아직 원격 PR/커밋은 생성하지 않았다.

## 검증

```powershell
node --test tests/event-admin.test.mjs
npx tsc --noEmit --incremental false
$eventLintFiles = @(Get-ChildItem -LiteralPath 'app/[locale]/admin/events' -Recurse -Filter '*.tsx' | ForEach-Object { $_.FullName })
node node_modules/eslint/bin/eslint.js @eventLintFiles types/event-admin.ts constants/event-admin.ts lib/event-admin.ts lib/event-admin-demo.ts tests/event-admin.test.mjs
```

브라우저 수동 검증: 샘플 사진 반려 사유 필수, 승인 후 목록 갱신, 기본/특별 보상 분리, 회차·미션 폼과 반응형 화면을 확인한다.
