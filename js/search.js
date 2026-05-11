// app.js와 충돌 방지를 위해 즉시 실행 함수(IIFE) 사용
(function() {
    let localPosts = [];
    let activeTag = null;
    
    // app.js에서 데이터 로드 완료 시 이벤트 수신
    document.addEventListener('postsLoaded', (e) => {
        localPosts = e.detail;
        extractAndRenderTags(localPosts);
        setupSearch();
    });

    function extractAndRenderTags(posts) {
        const tagsContainer = document.getElementById('tags-container');
        if (!tagsContainer) return;
        
        const tagsSet = new Set();
        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        tagsContainer.innerHTML = `
            <button class="tag-btn active" data-tag="all">전체</button>
        `;

        Array.from(tagsSet).sort().forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'tag-btn';
            btn.textContent = tag;
            btn.dataset.tag = tag;
            tagsContainer.appendChild(btn);
        });

        // 태그 클릭 이벤트
        tagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-btn')) {
                // 활성 상태 변경
                document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const tag = e.target.dataset.tag;
                activeTag = tag === 'all' ? null : tag;
                filterPosts();
            }
        });
    }

    function setupSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            filterPosts(e.target.value);
        });
    }

    function filterPosts(query = '') {
        const searchInput = document.getElementById('search-input');
        const searchTerm = (query || (searchInput ? searchInput.value : '')).toLowerCase();
        
        const filteredPosts = localPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                                  post.excerpt.toLowerCase().includes(searchTerm);
            const matchesTag = activeTag ? (post.tags && post.tags.includes(activeTag)) : true;
            
            return matchesSearch && matchesTag;
        });

        // 전역 함수 renderPosts 호출 (app.js에 정의됨)
        if (typeof renderPosts === 'function') {
            renderPosts(filteredPosts);
        }
    }
})();
