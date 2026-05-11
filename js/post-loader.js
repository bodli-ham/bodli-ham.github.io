async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');

    if (!fileName) {
        document.getElementById('post-content').innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
        return;
    }

    try {
        const response = await fetch(`pages/${fileName}`);
        if (!response.ok) {
            throw new Error('게시글을 불러올 수 없습니다.');
        }
        
        let content = await response.text();
        
        // UTF-8 BOM 제거
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }

        parseAndRender(content);
        loadGiscus();

    } catch (error) {
        console.error('게시글 로드 실패:', error);
        document.getElementById('post-content').innerHTML = '<p>게시글을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function parseAndRender(content) {
    // Front Matter 파싱
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    let metadata = {};
    let markdownContent = content;

    if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1];
        markdownContent = frontMatterMatch[2];

        const lines = frontMatter.split(/\r?\n/);
        lines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();

                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
                    try {
                        value = JSON.parse(value);
                    } catch {
                        value = value.slice(1, -1).split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
                    }
                }

                metadata[key] = value;
            }
        });
    }

    // 메타데이터 렌더링
    document.getElementById('post-title').textContent = metadata.title || '제목 없음';
    document.getElementById('post-date').textContent = metadata.date || '';
    if (metadata.category) {
        document.getElementById('post-category').textContent = metadata.category;
    }

    if (metadata.tags && Array.isArray(metadata.tags)) {
        const tagsContainer = document.getElementById('post-tags');
        metadata.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'category'; // 스타일 재사용
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    }

    // 마크다운 렌더링
    document.getElementById('post-content').innerHTML = marked.parse(markdownContent);
    
    // 코드 하이라이팅 적용
    if (window.Prism) {
        Prism.highlightAll();
    }
}

function loadGiscus() {
    const container = document.querySelector('.giscus-container');
    if (!container) return;
    
    // 기존 스크립트 제거
    container.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'bodli/bodli.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // 수정 필요
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // 수정 필요
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    
    // 현재 테마에 맞게 Giscus 테마 설정
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    script.setAttribute('data-theme', currentTheme);
    
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
}

// 테마 변경 시 Giscus 테마도 업데이트
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const iframe = document.querySelector('iframe.giscus-frame');
            if (iframe) {
                iframe.contentWindow.postMessage(
                    { giscus: { setConfig: { theme: currentTheme } } },
                    'https://giscus.app'
                );
            }
        }
    });
});

observer.observe(document.documentElement, { attributes: true });

// 포스트 페이지일 경우에만 로드
if (document.getElementById('post-content')) {
    loadPost();
}
