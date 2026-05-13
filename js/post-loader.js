// post-loader.js
// posts.json의 "file" 필드(assets/{slug}.html)를 fetch해서
// post.html의 #post-content에 직접 삽입합니다.
// marked.js / iframe 불필요 — HTML 그대로 렌더링.

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const file = urlParams.get('file'); // 예: assets/msg-optimization.html

  if (!file) {
    document.getElementById('post-content').innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
    return;
  }

  try {
    // 1. posts.json에서 해당 파일의 메타데이터 가져오기
    const metaRes = await fetch('posts.json');
    const posts = await metaRes.json();
    const post = posts.find(p => p.file === file);

    if (post) {
      document.getElementById('post-title').textContent = post.title;
      document.getElementById('post-date').textContent = post.date;

      const categoryEl = document.getElementById('post-category');
      if (categoryEl && post.category) {
        categoryEl.textContent = CATEGORY_LABELS[post.category] || post.category;
      }

      const tagsEl = document.getElementById('post-tags');
      if (tagsEl && post.tags) {
        tagsEl.innerHTML = post.tags
          .map(tag => `<span class="tag-btn">${tag}</span>`)
          .join('');
      }

      document.title = `${post.title} — bodli's Blog`;
    }

    // 2. HTML 파일 직접 fetch → body 내용만 추출해서 삽입
    const postRes = await fetch(file);
    if (!postRes.ok) throw new Error(`파일 로드 실패: ${file}`);
    const html = await postRes.text();

    // <body>...</body> 사이 내용만 추출 (없으면 전체 사용)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : html;

    document.getElementById('post-content').innerHTML = content;

    // 3. assets/ HTML 내부의 상대 경로 이미지 보정
    // assets/에서 images/를 참조할 때 루트 기준으로 작동하므로 별도 처리 불필요
    // (post.html이 루트에 있고 assets/도 루트 하위이므로 경로 일치)

  } catch (error) {
    console.error('게시글 로드 실패:', error);
    document.getElementById('post-content').innerHTML =
      '<p>게시글을 불러오는데 실패했습니다.</p>';
  }

  // 연도 업데이트
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// 카테고리 한글 매핑
const CATEGORY_LABELS = {
  'Case Study':      'Case Study',
  'Data Report':     'Data Report',
  'Supplement Guide': 'Supplement Guide',
  'Note':            'Note'
};