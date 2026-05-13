// post-loader.js
// posts.json의 "file" 필드(assets/{slug}.html)를 fetch해서
// post.html의 #post-content에 직접 삽입합니다.
// 게시물 내부의 <style> 태그도 함께 추출하여 적용합니다.

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const file = urlParams.get('file');

  if (!file) {
    document.getElementById('post-content').innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
    return;
  }

  try {
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

    const postRes = await fetch(file);
    if (!postRes.ok) throw new Error(`파일 로드 실패: ${file}`);
    const html = await postRes.text();

    // 1. <style> 태그 추출 및 적용
    const styleMatch = html.match(/<style[^>]*>([\s\S]*)<\/style>/i);
    if (styleMatch) {
      const styleEl = document.createElement('style');
      styleEl.textContent = styleMatch[1];
      document.head.appendChild(styleEl);
    }

    // 2. <body> 내용 추출 및 삽입
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : html;
    document.getElementById('post-content').innerHTML = content;

  } catch (error) {
    console.error('게시글 로드 실패:', error);
    document.getElementById('post-content').innerHTML =
      '<p>게시글을 불러오는데 실패했습니다.</p>';
  }

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

const CATEGORY_LABELS = {
  'Case Study':      'Case Study',
  'Data Report':     'Data Report',
  'Supplement Guide': 'Supplement Guide',
  'Note':            'Note'
};