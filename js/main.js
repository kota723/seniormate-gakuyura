/**
 * Senior Mate's Backstage - Main Logic
 * Fetches data from MicroCMS and renders content.
 */

// MicroCMS Settings
const SERVICE_DOMAIN = "seniormate1"; // Updated Service ID
const API_KEY = "5NktcNmkaRcjELDE8KN0krYXRWgu7x2mCO3U"; // Updated API Key
const API_ENDPOINT = "blog";

// Global variable to store all posts for filtering
let allPosts = [];

document.addEventListener('DOMContentLoaded', async () => {

    // Check if we are on the Index Page or Blog List Page
    const postListContainer = document.getElementById('post-list');
    if (postListContainer) {
        await renderPostList(postListContainer);
        setupCategoryFilters(postListContainer);

        // Add resize listener to update layout/counts on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                renderPostList(postListContainer, currentCategory);
            }, 200);
        });
    }

    // Check if we are on the Article Detail Page
    const articleContainer = document.getElementById('article-container');
    if (articleContainer) {
        await renderArticleDetail(articleContainer);
    }
});

/**
 * Fetches the list of blog posts from MicroCMS.
 */
async function fetchPosts(limit = 100) {
    try {
        const response = await fetch(`https://${SERVICE_DOMAIN}.microcms.io/api/v1/${API_ENDPOINT}?limit=${limit}`, {
            headers: {
                "X-MICROCMS-API-KEY": API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.contents;
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return null;
    }
}

/**
 * Fetches a single article by ID.
 */
async function fetchPostById(id) {
    try {
        const response = await fetch(`https://${SERVICE_DOMAIN}.microcms.io/api/v1/${API_ENDPOINT}/${id}`, {
            headers: {
                "X-MICROCMS-API-KEY": API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch post:", error);
        return null;
    }
}

/**
 * Renders the list of blog posts into the container.
 * @param {HTMLElement} container 
 */
/**
 * Renders the list of blog posts into the container.
 * @param {HTMLElement} container 
 * @param {string} filterCategory - Category to filter by ('all', 'preparation', 'thoughts')
 */
// Pagination State
let displayedItems = 6;
let currentCategory = 'all';

async function renderPostList(container, filterCategory = 'all') {
    // Reset limit if category changed
    if (filterCategory !== currentCategory) {
        displayedItems = 6;
        currentCategory = filterCategory;
    }

    container.innerHTML = '<p class="text-center">読み込んでいます...</p>';

    const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    // On index page, always show fixed 4 items, no load more
    const limit = isIndex ? 4 : 100;

    // Fetch posts only if we don't have them yet
    if (allPosts.length === 0) {
        const posts = await fetchPosts(100); // Always fetch many to support filtering client-side
        if (!posts || posts.length === 0) {
            if (typeof BLOG_POSTS !== 'undefined') {
                console.log("Using Mock Data fallback");
                renderMockPostList(container, isIndex);
                return;
            }
            container.innerHTML = '<p class="text-center">記事がまだありません。</p>';
            return;
        }
        allPosts = posts;
    }

    // Filter posts based on category
    let postsToRender = allPosts;
    if (filterCategory !== 'all') {
        postsToRender = allPosts.filter(post => {
            if (!post.category || post.category.length === 0) return false;
            const categoryValue = post.category[0];
            if (filterCategory === 'preparation') return categoryValue === 'preparation' || categoryValue === '準備';
            if (filterCategory === 'thoughts') return categoryValue === 'thoughts' || categoryValue === '感想';
            if (filterCategory === 'qanda') return categoryValue === '質問集vol.1';
            return false;
        });
    }

    if (postsToRender.length === 0) {
        container.innerHTML = '<p class="text-center">該当する記事がありません。</p>';
        return;
    }

    // Pagination Logic
    const isMobile = window.innerWidth <= 768;
    // On Index: Mobile=4, Desktop=3. On Blog Page: use displayedItems (initially 6, increases)
    const showCount = isIndex ? (isMobile ? 2 : 3) : displayedItems;

    const visiblePosts = postsToRender.slice(0, showCount);
    const hasMore = postsToRender.length > showCount;

    let html = '';
    visiblePosts.forEach(post => {
        // ... (Existing Rendering Logic) ...
        // Image Handling (1:1 Aspect Ratio enforced by CSS .card-img-wrapper)
        let imagePart;
        if (post.image && post.image.url) {
            imagePart = `<img src="${post.image.url}?w=500&h=500&fit=crop" class="card-img" alt="${post.title}">`;
        } else {
            imagePart = `<div class="card-img-placeholder">${post.emoji || '📄'}</div>`;
        }

        // Dates
        const dateDisplay = post.published_date ? new Date(post.published_date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
            : new Date(post.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

        // Categories & Badges
        const category = post.category && post.category.length ? post.category[0] : null;
        let catName = '', badgeClass = '';

        if (category === 'preparation' || category === '準備') { catName = '準備'; badgeClass = 'badge-preparation'; }
        else if (category === 'thoughts' || category === '感想') { catName = '感想'; badgeClass = 'badge-thoughts'; }
        else if (category === '質問集vol.1') { catName = '質問集vol.1'; badgeClass = 'badge-qanda'; }

        const badgeHtml = catName ? `<span class="category-badge ${badgeClass}">${catName}</span>` : '';

        // Author
        const authorInfo = post.author_info || '';
        const authorName = post.name || '';

        html += `
        <article class="card new-card-layout">
            <a href="article.html?id=${post.id}">
                <div class="card-img-wrapper">
                    ${imagePart}
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="card-date">${dateDisplay}</span>
                        ${badgeHtml}
                    </div>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-author-name">${authorName}</p>
                    <p class="card-author-info">${authorInfo}</p>
                </div>
            </a>
        </article>
        `;
    });

    container.innerHTML = html;

    // Append Load More Button if needed
    if (!isIndex && hasMore) {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'load-more-container';
        const btn = document.createElement('button');
        btn.className = 'load-more-btn';
        btn.innerText = 'もっと見る';
        btn.onclick = () => {
            displayedItems += 6;
            renderPostList(container, currentCategory);
        };
        btnContainer.appendChild(btn);
        container.parentNode.appendChild(btnContainer);
        // Note: We append to parent because 'container' is a grid. 
        // Wait, current structure is <div id="post-list" class="grid">. 
        // Appending div to a grid container might mess up layout unless it spans full width.
        // Better: Append INSIDE container but style it to span all columns? 
        // Or append OUTSIDE container.
        // Let's check HTML. <div class="container"><h2...> <div id="post-list" class="grid">...</div> <div class="text-center btn..."></div></div>

        // Actually, renderPostList clears innerHTML. If I append outside, I need to manage it.
        // Let's modify logic: 
        // 1. Clear OLD button if exists outside.
        const existingBtn = container.parentNode.querySelector('.load-more-container');
        if (existingBtn) existingBtn.remove();

        container.parentNode.insertBefore(btnContainer, container.nextSibling);
    } else {
        // Remove button if no more items
        const existingBtn = container.parentNode.querySelector('.load-more-container');
        if (existingBtn) existingBtn.remove();
    }
}

// Back to Top Button Injection
document.addEventListener('DOMContentLoaded', () => {
    const bttBtn = document.createElement('button');
    bttBtn.className = 'back-to-top-btn';
    bttBtn.innerHTML = '↑';
    bttBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(bttBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            bttBtn.classList.add('visible');
        } else {
            bttBtn.classList.remove('visible');
        }
    });
});

// Renders a single article based on URL query parameter ?id=...
async function renderArticleDetail(container) {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        container.innerHTML = '<p class="text-center">記事IDが指定されていません。</p>';
        return;
    }

    const post = await fetchPostById(postId);

    if (!post) {
        // Fallback to mock
        if (typeof BLOG_POSTS !== 'undefined') {
            const mock = BLOG_POSTS.find(p => p.id === postId);
            if (mock) {
                renderMockArticleDetail(container, mock);
                return;
            }
        }
        container.innerHTML = '<p class="text-center">記事が見つかりませんでした。</p>';
        return;
    }

    document.title = `${post.title} | シニアメイトの楽屋裏`;

    const dateDisplay = post.published_date ? new Date(post.published_date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
        : new Date(post.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

    // Category Badge
    const category = post.category && post.category.length ? post.category[0] : null;
    let catName = '';
    let badgeClass = '';

    if (category === 'preparation' || category === '準備') {
        catName = '準備';
        badgeClass = 'badge-preparation';
    } else if (category === 'thoughts' || category === '感想') {
        catName = '感想';
        badgeClass = 'badge-thoughts';
    } else if (category === '質問集vol.1') {
        catName = '質問集vol.1';
        badgeClass = 'badge-qanda';
    }

    const badgeHtml = catName ? `<span class="category-badge ${badgeClass}">${catName}</span>` : '';

    // Reverted to Original Layout (Standard Blog Post)
    // Displaying author info with a link to member profile in a mobile-friendly way
    const authorLink = post.name ? `
        <div class="post-author-wrapper">
            <span class="post-author-text">${post.author_info || ''} ${post.name}</span>
            <a href="members.html?name=${encodeURIComponent(post.name)}" class="author-profile-link">
               この人の他の記事を見る
            </a>
        </div>
    ` : `<span class="post-author-text">${post.author_info || '匿名'}</span>`;

    // Image
    let imagePart = '';
    if (post.image && post.image.url) {
        imagePart = `<img src="${post.image.url}" alt="${post.title}">`;
    }

    const html = `
    <article class="blog-post">
        <header class="post-header">
            <div class="post-meta-container">
                <span class="post-date">${dateDisplay}</span>
                ${badgeHtml ? `<span class="meta-separator">|</span>${badgeHtml}` : ''}
            </div>
            
            ${authorLink}
            
            <h1 class="post-title">${post.title}</h1>
        </header>

        <div class="post-image">
            ${imagePart}
        </div>

        <div class="post-content" style="line-height: 2; font-size: 1.05rem;">
            ${post.content}
        </div>

        <div class="post-footer" style="margin-top: 64px; text-align: center;">
            <a href="blog.html" class="btn btn-outline">一覧に戻る</a>
        </div>
    </article>
    `;

    container.innerHTML = html;
}

// Utility: Strip HTML for excerpt
function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

// Setup category filter buttons
function setupCategoryFilters(container) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) return; // Not on blog page

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Get filter value and re-render
            const filter = this.getAttribute('data-filter');
            renderPostList(container, filter);
        });
    });
}


// --- Legacy Mock Functions for Fallback ---

function renderMockPostList(container, isIndex) {
    const postsToRender = isIndex ? BLOG_POSTS.slice(0, 3) : BLOG_POSTS;
    let html = '';
    postsToRender.forEach(post => {
        let imagePart;
        if (post.image && !post.image.includes('mock_')) {
            imagePart = `<img src="${post.image}" class="card-img" alt="${post.title}">`;
        } else {
            imagePart = `<div class="card-img">${post.emoji || '📄'}</div>`;
        }
        html += `
        <article class="card">
            <a href="article.html?id=${post.id}">
                ${imagePart}
                <div class="card-content">
                    <span class="card-date">${post.published_date}</span>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-excerpt">${post.summary}</p>
                </div>
            </a>
        </article>`;
    });
    container.innerHTML = html;
}

function renderMockArticleDetail(container, post) {
    document.title = `${post.title} | シニアメイトの楽屋裏`;
    let imagePart;
    if (post.image && !post.image.includes('mock_')) {
        imagePart = `<img src="${post.image}" alt="${post.title}">`;
    } else {
        imagePart = `<div style="background-color: #eee; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 3rem;">${post.emoji || '📄'}</div>`;
    }
    const html = `
    <article class="blog-post" style="max-width: 800px; margin: 0 auto;">
        <header class="post-header" style="margin-bottom: 32px; text-align: center;">
            <div style="color: #666; font-size: 0.9rem; margin-bottom: 8px;">
                <span class="post-date">${post.published_date}</span>
                <span style="margin: 0 10px;">|</span>
                <span class="post-author">${post.author_info}</span>
            </div>
            <h1 class="post-title" style="font-size: 2rem; color: #6BAF92; margin-top: 8px;">${post.title}</h1>
        </header>
        <div class="post-image" style="margin-bottom: 40px;">
            ${imagePart}
        </div>
        <div class="post-content" style="line-height: 2; font-size: 1.05rem;">
            ${post.content}
        </div>
        <div class="post-footer" style="margin-top: 64px; text-align: center;">
            <a href="blog.html" class="btn btn-outline">一覧に戻る</a>
        </div>
    </article>`;
    container.innerHTML = html;
}
