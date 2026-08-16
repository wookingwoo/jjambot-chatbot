# jjambot

카카오톡 챗봇 짬봇의 스킬 서버(Node.js + TypeScript + Hono). 한국에서만 운영되는 서비스라 문서(README 등)는 한글로 작성한다.

## Commit messages

- [Conventional Commits](https://www.conventionalcommits.org/) 형식 사용: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:` 등 prefix + 명령형 설명.
- 영어로 작성.

## 구조

- `src/kakao/`: 카카오 스킬 요청/응답 스펙 (Zod 스키마 + 응답 빌더). 신규 응답 타입 추가 시 `schema.ts`/`builders.ts`에 둔다.
- `src/skills/`: 스킬 하나당 파일 하나. 각 파일은 오픈빌더 관리자센터에 등록하는 스킬 URL(`/skill/<name>`)과 1:1 대응한다.
- 스킬 서버는 5초 안에 응답해야 한다. 오래 걸리는 작업은 `callbackAck()`로 즉시 응답한 뒤 `userRequest.callbackUrl`로 결과를 POST한다.
