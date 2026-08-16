# jjambot (짬봇)

짬봇 카카오톡 챗봇의 스킬 서버. 카카오 i 오픈빌더가 사용자 발화를 스킬 요청으로 전달하면, 이 서버가 응답 JSON을 만들어 돌려준다.

## github

- jjambot-website: https://github.com/wookingwoo/jjambot-website
- jjambot-chatbot: https://github.com/wookingwoo/jjambot
- jjambot-crawler: https://github.com/wookingwoo/jjambot-crawler
- jjambot-GiGAGenie: https://github.com/wookingwoo/jjambot-GiGAGenie

## 스택

- Node.js + TypeScript
- [Hono](https://hono.dev) — 웹 프레임워크
- [Zod](https://zod.dev) — 카카오 스킬 요청/응답 스키마 검증

## 구조

```
src/
  kakao/
    schema.ts     # 스킬 요청/응답 Zod 스키마
    builders.ts    # simpleText, quickReply 등 응답 빌더
  skills/
    ping.ts        # 스킬 예시 (오픈빌더 스킬 URL 1개 = 파일 1개)
  app.ts           # Hono 앱, 라우트 등록
  index.ts         # 서버 진입점
tests/
  ping.test.ts
```

새 스킬을 추가하려면 `src/skills/`에 파일을 만들고 `src/app.ts`에 라우트로 등록한 뒤, 오픈빌더 관리자센터에서 해당 URL(`https://<host>/skill/<name>`)로 스킬을 등록한다.

## 로컬 개발

```bash
npm install
npm run dev
```

## 테스트 / 타입체크

```bash
npm test
npm run typecheck
```

## Docker로 배포 (Raspberry Pi 등)

```bash
docker compose up -d --build
```

`.env.example`을 복사해 `.env`를 만들고 필요한 값을 채운다. 스킬 서버는 카카오 요구사항상 **공인 도메인 + HTTPS**로 노출되어야 하므로, Pi 앞단에 리버스 프록시(Caddy, nginx 등)나 Cloudflare Tunnel 같은 걸 별도로 둬야 한다 (이 저장소 범위 밖).

## 참고

- [카카오 i 오픈빌더 스킬 가이드](https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide)
- [응답 타입별 JSON 포맷](https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format)
- [콜백 개발 가이드](https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/ai_chatbot_callback_guide)
