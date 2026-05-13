
블로그 게시물의 작성 룰 파악하여 agent md 파일에 적용
삼전우 게시물 업로드
자동화 스킬로 분석 테스트 해보기



# 폴더 구조
Desktop/
├── analysis-auto-skills/              ← 에이전트 A 윈도우 연결
│   └── .agents/
│       └── rules/
│           └── SKILL.md              ← 분석·초안 전용 룰
│
└── gravity_blog/                      ← 에이전트 B 윈도우 연결
    └── bodli-ham.github.io/
        ├── .agents/
        │   └── rules/
        │       └── blog-rules.md     ← 게시·HTML 변환 전용 룰
        ├── assets/                   ← 게시 확정 HTML (최종본)
        │   ├── msg-optimization.html
        │   └── pmf-vitc.html
        ├── css/
        │   ├── prism.css
        │   └── style.css             ← .cat-tab 스타일 추가 필요
        ├── docs/                     ← 운영 노트 (사용자 전용)
        │   └── actionplan.md
        ├── images/                   ← 모든 이미지 (코랩 저장 파일 여기에)
        ├── js/
        │   ├── app.js                ← 교체 필요
        │   ├── post-loader.js        ← 교체 필요
        │   ├── search.js
        │   └── theme.js
        ├── pages/
        │   ├── drafts/               ← 에이전트 B 초안 출력 위치 (새로 생성)
        │   └── wip/                  ← 스타일 수정 중 (새로 생성)
        ├── .nojekyll
        ├── index.html                ← 네비 교체 필요
        ├── post.html                 ← 네비 교체 필요
        └── posts.json                ← 마이그레이션 필요


# 에이전트 운영 설계 흐름
사용자: 주제 결정
  예) "비타민C 권장량은 왜 1000mg일까?"
        ↓
┌────────────────────────────────────────┐
│  에이전트 A  (analysis-auto-skills)    │
│  SKILL.md 적용                         │
│                                        │
│  · 카테고리 판단                       │
│    (직접 경험 → Case Study             │
│     웹 검색·데이터 → Data Report 등)  │
│  · 웹 리서치 + 데이터 분석            │
│  · 코랩 코드 생성 (필요 시)           │
│  · 인계서 출력                        │
└────────────────────────────────────────┘
        ↓ 코랩 실행 필요 시
   [Google Colab]
   에이전트 A 코드 실행
   차트 저장 → images/ 폴더에 넣기
        ↓ 인계서 복사 → 에이전트 B 윈도우에 붙여넣기
┌────────────────────────────────────────┐
│  에이전트 B  (gravity_blog)            │
│  blog-rules.md 적용                    │
│                                        │
│  · 인계서 → pages/drafts/{slug}.html  │
│  · posts.json 항목 출력               │
│  · 체크리스트 자동 보고               │
└────────────────────────────────────────┘
        ↓
사용자: 로컬에서 pages/drafts/{slug}.html 열어서 미리보기
        ↓ 확인 완료
pages/drafts/{slug}.html → assets/{slug}.html 로 이동
posts.json 업데이트 (file 경로 = assets/{slug}.html)
        ↓
git add . && git commit -m "Add: {slug}" && git push


