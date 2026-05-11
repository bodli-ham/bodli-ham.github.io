async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');

    if (!fileName) {
        document.getElementById('post-content').innerHTML = '<p>寃뚯떆湲??李얠쓣 ???놁뒿?덈떎.</p>';
        return;
    }

    try {
        const response = await fetch(`pages/${fileName}`);
        if (!response.ok) {
            throw new Error('寃뚯떆湲??遺덈윭?????놁뒿?덈떎.');
        }
        
        let content = await response.text();
        
        // UTF-8 BOM ?쒓굅
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }

        parseAndRender(content);
        loadGiscus();

    } catch (error) {
        console.error('寃뚯떆湲 濡쒕뱶 ?ㅽ뙣:', error);
        document.getElementById('post-content').innerHTML = '<p>寃뚯떆湲??遺덈윭?ㅻ뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.</p>';
    }
}

function parseAndRender(content) {
    // Front Matter ?뚯떛
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

    // 硫뷀??곗씠???뚮뜑留?
    document.getElementById('post-title').textContent = metadata.title || '?쒕ぉ ?놁쓬';
    document.getElementById('post-date').textContent = metadata.date || '';
    if (metadata.category) {
        document.getElementById('post-category').textContent = metadata.category;
    }

    if (metadata.tags && Array.isArray(metadata.tags)) {
        const tagsContainer = document.getElementById('post-tags');
        metadata.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'category'; // ?ㅽ????ъ궗??
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    }

    // 留덊겕?ㅼ슫 ?뚮뜑留?
    document.getElementById('post-content').innerHTML = marked.parse(markdownContent);
    
    // 肄붾뱶 ?섏씠?쇱씠???곸슜
    if (window.Prism) {
        Prism.highlightAll();
    }
}

function loadGiscus() {
    const container = document.querySelector('.giscus-container');
    if (!container) return;
    
    // 湲곗〈 ?ㅽ겕由쏀듃 ?쒓굅
    container.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'bodli-ham/bodli-ham.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // ?섏젙 ?꾩슂
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // ?섏젙 ?꾩슂
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    
    // ?꾩옱 ?뚮쭏??留욊쾶 Giscus ?뚮쭏 ?ㅼ젙
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    script.setAttribute('data-theme', currentTheme);
    
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
}

// ?뚮쭏 蹂寃???Giscus ?뚮쭏???낅뜲?댄듃
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

// ?ъ뒪???섏씠吏??寃쎌슦?먮쭔 濡쒕뱶
if (document.getElementById('post-content')) {
    loadPost();
}
