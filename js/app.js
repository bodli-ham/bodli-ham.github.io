// app.js — bodli's Blog
// posts.json의 "file" 필드(assets/{slug}.html)를 기준으로 카드 렌더링.
// title 필드에 포함된 [태그]가 글 목록에 그대로 노출됨.
// 카테고리 필터는 URL ?category= 쿼리로 작동.
// 네비 표시명은 한글(CATEGORY_LABELS)로 변환 > 영문 그대로 사용.

const CATEGORY_LABELS = {
  'Case Study':       'Case Study',
  'Data Report':      'Data Report',
  'Trend Note':       'Trend Note',
  'Supplement Guide': 'Supplement Guide',
  'Note':             'Note'
};

let allPosts = [];

async function loadPosts() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('posts.json을 불러올 수 없습니다.');
    allPosts = await response.json();

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    const filtered = category
      ? allPosts.filter(post => post.category === category)
      : allPosts;

    renderPosts(filtered);
    renderCategoryNav(category);

    document.dispatchEvent(new CustomEvent('postsLoaded', { detail: allPosts }));
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    document.getElementById('posts-list').innerHTML =
      '<p>게시글을 불러오는데 실패했습니다.</p>';
  }
}

function renderPosts(posts) {
  const postsList = document.getElementById('posts-list');
  postsList.innerHTML = '';

  if (posts.length === 0) {
    postsList.innerHTML = '<p>게시글이 없습니다.</p>';
    return;
  }

  posts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'post-card';

    const tagsHtml = post.tags && post.tags.length > 0
      ? `<div class="tags-container" style="margin-bottom:0;">
           ${post.tags.map(tag =>
             `<span class="tag-btn" style="pointer-events:none; padding:0.2rem 0.5rem; font-size:0.75rem;">${tag}</span>`
           ).join('')}
         </div>`
      : '';

    const categoryLabel = post.category
      ? CATEGORY_LABELS[post.category] || post.category
      : '';

    // title 필드에 [태그]가 이미 포함되어 있으므로 그대로 사용
    const postLink = `post.html?file=${encodeURIComponent(post.file)}`;

    article.innerHTML = `
      <h2><a href="${postLink}">${post.title}</a></h2>
      <div class="meta">
        <span>${post.date}</span>
        ${categoryLabel ? `<span class="category">${categoryLabel}</span>` : ''}
      </div>
      <p class="excerpt">${post.summary || post.excerpt || ''}</p>
      ${tagsHtml}
    `;

    postsList.appendChild(article);
  });
}

function renderCategoryNav(activeCategory) {
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    const isActive = tab.dataset.category === (activeCategory || '');
    tab.classList.toggle('active', isActive);
  });
}

if (document.getElementById('posts-list')) {
  loadPosts();
}