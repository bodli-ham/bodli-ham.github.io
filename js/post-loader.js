// post-loader.js — bodli's Blog
// posts.json의 "file" 필드(assets/{slug}.html)를 fetch해서
// post.html의 #post-content에 직접 삽입합니다.
//
// [구조]
// post.html의 .post-header는 숨기고,
// assets/*.html 내부의 HERO 섹션이 타이틀 역할을 합니다.
// 브라우저 탭 타이틀(<title>)만 posts.json으로 업데이트합니다.

const CATEGORY_LABELS = {
  'Case Study':       '케이스 스터디',
  'Data Report':      '데이터 리포트',
  'Trend Note':       '트렌드 노트',
  'Supplement Guide': '건강 가이드',
  'Note':             '노트'
};

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const file = urlParams.get('file');

  // post-header 숨김 — assets/html의 HERO가 타이틀 역할 담당
  const postHeader = document.querySelector('.post-header');
  if (postHeader) postHeader.style.display = 'none';

  if (!file) {
    const el = document.getElementById('post-content');
    if (el) el.innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
    return;
  }

  try {
    // 1. posts.json → 브라우저 탭 타이틀 업데이트
    const metaRes = await fetch('posts.json');
    const posts = await metaRes.json();
    const post = posts.find(p => p.file === file);

    if (post) {
      // [태그] 제거 후 순수 제목만 탭에 표시
      const pureTitle = post.title.replace(/^\[[^\]]+\]\s*/, '');
      document.title = `${pureTitle} — bodli's Blog`;
    }

    // 2. assets/html 파일 fetch
    const postRes = await fetch(file);
    if (!postRes.ok) throw new Error(`파일 로드 실패: ${file}`);
    const html = await postRes.text();

    // Google Fonts 링크 주입 (assets/html 폰트가 post.html에서도 로드)
    const fontMatch = html.match(/<link[^>]+fonts\.googleapis[^>]+>/gi);
    if (fontMatch) {
      fontMatch.forEach(linkTag => {
        if (!document.querySelector('link[href*="fonts.googleapis"]')) {
          const div = document.createElement('div');
          div.innerHTML = linkTag;
          document.head.appendChild(div.firstChild);
        }
      });
    }

    // <style> 블록을 head에 주입 (CSS 변수·컴포넌트 스타일 적용)
    const styleMatches = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
    if (styleMatches) {
      styleMatches.forEach(styleBlock => {
        const div = document.createElement('div');
        div.innerHTML = styleBlock;
        document.head.appendChild(div.firstChild);
      });
    }

    // <body> 내용만 추출해서 #post-content에 삽입
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : html;

    const contentEl = document.getElementById('post-content');
    if (contentEl) contentEl.innerHTML = content;

  } catch (error) {
    console.error('게시글 로드 실패:', error);
    const el = document.getElementById('post-content');
    if (el) el.innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
  }

  // 연도 업데이트
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});