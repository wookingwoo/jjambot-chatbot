# jjambot (짬봇)

짬봇 카카오톡 챗봇의 스킬 서버. 카카오 i 오픈빌더가 사용자 발화를 스킬 요청으로 전달하면, 이 서버가 응답 JSON을 만들어 돌려준다.

## github

- jjambot: https://github.com/wookingwoo/jjambot
- jjambot-chatbot: https://github.com/wookingwoo/jjambot-chatbot
- jjambot-crawler: https://github.com/wookingwoo/jjambot-crawler
- jjambot-GiGAGenie: https://github.com/wookingwoo/jjambot-GiGAGenie

## 스택

- Node.js + TypeScript
- [Hono](https://hono.dev) — 웹 프레임워크
- [Zod](https://zod.dev) — 카카오 스킬 요청/응답 스키마 검증
- Supabase(Postgres) — [jjambot-crawler](https://github.com/wookingwoo/jjambot-crawler)가 채우는 `meals` 테이블을 그대로 조회하고, 사용자별 상태는 이 저장소가 관리하는 `users` 테이블에 저장한다 (같은 Supabase 프로젝트).

## 구조

```
src/
  kakao/
    schema.ts     # 스킬 요청/응답 Zod 스키마
    builders.ts    # simpleText, quickReply 등 응답 빌더
  repo/
    users.ts       # users 테이블 CRUD
    meals.ts        # meals 테이블 조회
  middleware/
    skillAuth.ts     # /skill/* 토큰 검증
  skills/
    ping.ts             # 스킬 예시 (오픈빌더 스킬 URL 1개 = 파일 1개)
    menu.ts             # 메뉴 조회
    corpsList.ts         # 부대 코드 목록
    corpsChange.ts        # 부대 변경
    allergyToggle.ts       # 알러지 표시 on/off
    dateChangeSkill.ts      # 입대일/전역일 변경 공통 로직
    joinDateChange.ts        # 입대일 변경 (위 공통 로직 사용)
    dischargeDateChange.ts    # 전역일 변경 (위 공통 로직 사용)
    calculateDate.ts           # 전역일 D-day / 복무 진행률 계산
  corps.ts         # 부대 코드 ↔ 국방부 API service 코드 매핑
  dates.ts          # 날짜 파싱/계산 유틸
  config.ts          # 환경변수
  supabase.ts         # Supabase 클라이언트
  app.ts               # Hono 앱, 라우트 등록
  index.ts              # 서버 진입점
migrations/
  0001_create_users.sql
tests/
```

새 스킬을 추가하려면 `src/skills/`에 파일을 만들고 `src/app.ts`에 라우트로 등록한 뒤, 오픈빌더 관리자센터에서 해당 URL로 스킬을 등록한다.

## 스킬 목록

모든 `/skill/*` URL은 `SKILL_SECRET` 값을 `X-Skill-Secret` 헤더로 요구한다 (아래 "인증" 참고). 오픈빌더 스킬 등록 화면의 "헤더 이름"/"헤더 값" 필드에 각각 `X-Skill-Secret`, `<SKILL_SECRET 값>`을 입력한다.

| 스킬 | URL | 설명 | 파라미터 |
|---|---|---|---|
| 메뉴 조회 | `/skill/menu` | 저장된 부대의 식단 조회 | `sys_date` (`sys.date` 엔티티, 선택, 기본값 오늘), `meal_type0`~`meal_type3` (`meal_type` 엔티티 그룹, 선택, "아침"/"점심"/"저녁"/"부식"(특식·간식 동의어) 중 없으면 조식·중식·석식 전체) |
| 부대 목록 | `/skill/corps/list` | 설정 가능한 부대 코드 안내 | - |
| 부대 변경 | `/skill/corps/change` | 부대 코드 저장 | `corps` (없으면 발화 텍스트에서 자동 인식) |
| 알러지 표시 토글 | `/skill/allergy/toggle` | 식단의 알러지 표시 on/off | - |
| 입대일 변경 | `/skill/join-date/change` | 입대일 저장 | `sys_date` (`sys.date` 엔티티, 없으면 발화 텍스트에서 자동 인식) |
| 전역일 변경 | `/skill/discharge-date/change` | 전역일 저장 | `sys_date` (`sys.date` 엔티티, 없으면 발화 텍스트에서 자동 인식) |
| 전역일 계산 | `/skill/calculate-date` | 전역일까지 D-day, 복무 진행률 안내 | - |

사용자 식별은 카카오가 요청마다 보내주는 `userRequest.user.id`(botUserKey) 기준이며, 첫 요청 시 `users` 테이블에 행이 자동 생성된다.

## 인증

오픈빌더 스킬 등록 화면의 "헤더 이름"/"헤더 값" 필드로 `X-Skill-Secret: <SKILL_SECRET 값>` 헤더를 붙여서 검증한다. `/health`는 예외 (Docker 헬스체크용, 토큰 없이 접근 가능). 헤더가 없거나 틀리면 `401`을 반환한다.

## 로컬 개발

```bash
npm install
cp .env.example .env   # SUPABASE_SERVICE_ROLE_KEY, SKILL_SECRET 채우기
npm run dev
```

## 테스트 / 타입체크

```bash
npm test
npm run typecheck
```

테스트는 `src/repo/*`를 모킹해서 실제 DB 없이 동작한다.

## DB

Supabase SQL Editor(또는 `psql`)에서 `migrations/0001_create_users.sql`을 실행해 `users` 테이블을 만든다. `meals` 테이블은 crawler가 이미 만들어둔 것을 그대로 읽기만 한다.

## Postman으로 테스트

`postman/jjambot.postman_collection.json`을 Postman에 Import하면 위 스킬 전부(+ 헬스체크)가 요청으로 등록된다.

1. Postman → Import → 해당 파일 선택
2. 컬렉션 → Variables 탭에서 `baseUrl`(기본 `http://localhost:8000`), `skillToken`(`.env`의 `SKILL_SECRET` 값) 채우기
3. `testUserId`는 모든 요청이 공유하는 테스트용 유저 id (기본값 그대로 써도 됨, 테스트 끝나면 Supabase `users` 테이블에서 해당 행 지우면 됨)

## Docker로 배포 (Raspberry Pi 등)

```bash
cp .env.example .env   # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SKILL_SECRET 채우기 (전부 필수)
docker compose up -d --build
```

Supabase 값을 채우지 않으면 컨테이너가 기동 시 바로 에러를 내고 종료한다 (fail fast). `node:22-alpine` 베이스 이미지는 공식 멀티 아키텍처 이미지라 Pi에서 그대로 `docker compose up --build`하면 Pi의 아키텍처(arm64 등)에 맞게 네이티브로 빌드된다 — 별도 크로스 빌드가 필요 없다.

스킬 서버는 카카오 요구사항상 **공인 도메인 + HTTPS**로 노출되어야 하므로, Pi 앞단에 리버스 프록시(Caddy, nginx 등)나 Cloudflare Tunnel 같은 걸 별도로 둬야 한다 (이 저장소 범위 밖).

## 참고

- [카카오 i 오픈빌더 스킬 가이드](https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide)
- [응답 타입별 JSON 포맷](https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format)
- [콜백 개발 가이드](https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/ai_chatbot_callback_guide)
