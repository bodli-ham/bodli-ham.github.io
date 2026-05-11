let allPosts = [];

async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error('posts.json을 불러올 수 없습니다.');
        }
        allPosts = await response.json();
        renderPosts(allPosts);
        
        // 커스텀 이벤트 발생 (search.js에서 사용)
        document.dispatchEvent(new CustomEvent('postsLoaded', { detail: allPosts }));
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        document.getElementById('posts-list').innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
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
            ? `<div class="tags-container" style="margin-bottom: 0;">
                ${post.tags.map(tag => `<span class="tag-btn" style="pointer-events: none; padding: 0.2rem 0.5rem; font-size: 0.75rem;">${tag}</span>`).join('')}
               </div>` 
            : '';

        article.innerHTML = `
            <h2><a href="post.html?file=${encodeURIComponent(post.file)}">${post.title}</a></h2>
            <div class="meta">
                <span>${post.date}</span>
                ${post.category ? `<span class="category">${post.category}</span>` : ''}
            </div>
            <p class="excerpt">${post.excerpt}</p>
            ${tagsHtml}
        `;
        postsList.appendChild(article);
    });
}

// 메인 페이지일 경우에만 게시글 로드
if (document.getElementById('posts-list')) {
    loadPosts();
}
