/**
 * Senior Mate's Backstage - Members Directory
 * Fetches member data from MicroCMS and renders profile cards.
 */

// MicroCMS Settings
const SERVICE_DOMAIN = "seniormate1";
const API_KEY = "5NktcNmkaRcjELDE8KN0krYXRWgu7x2mCO3U";
const MEMBERS_ENDPOINT = "member";

// Mock data for fallback
const MOCK_MEMBERS = [
    {
        id: "member001",
        name: "さくら",
        photo: { url: "images/IMG_02.JPG" },
        branch_info: "関東支部 千葉地区 大学2年生",
        birth_year: "2004年生まれ",
        senior_history: "1年",
        hobbies: "読書、カフェ巡り",
        message: "みんなと一緒に活動できて楽しいです！",
        Instagram: "https://www.instagram.com/labo_seniormate/",
        display_order: 1
    },
    {
        id: "member002",
        name: "ゆうき",
        photo: null,
        branch_info: "関東支部 東京地区 高3",
        birth_year: "2006年生まれ",
        senior_history: "2年",
        hobbies: "音楽鑑賞、ギター",
        message: "新しい仲間と出会えるのが楽しみです。",
        Instagram: "https://www.instagram.com/labo_seniormate/",
        display_order: 2
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    const memberListContainer = document.getElementById('member-list');
    if (memberListContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const memberName = urlParams.get('name');

        if (memberName) {
            await renderMemberDetail(memberListContainer, memberName);
        } else {
            await renderMemberList(memberListContainer);
        }
    }
});

/**
 * Fetches the list of members from MicroCMS.
 */
async function fetchMembers() {
    try {
        const response = await fetch(`https://${SERVICE_DOMAIN}.microcms.io/api/v1/${MEMBERS_ENDPOINT}?limit=100`, {
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
        console.error("Failed to fetch members:", error);
        return null;
    }
}

/**
 * Fetches posts authored by a specific member from MicroCMS.
 */
async function fetchPostsByAuthor(authorName) {
    try {
        // We filter by 'name' field in the 'blog' endpoint which matches the member's name (nickname)
        const response = await fetch(`https://${SERVICE_DOMAIN}.microcms.io/api/v1/blog?filters=name[equals]${encodeURIComponent(authorName)}&limit=100`, {
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
        console.error("Failed to fetch posts for author:", error);
        return [];
    }
}

/**
 * Renders the detail view for a specific member.
 */
async function renderMemberDetail(container, name) {
    container.innerHTML = '<p class="text-center">読み込んでいます...</p>';

    // Expand parent container width for detail view
    const parentContainer = container.closest('.container');
    if (parentContainer) {
        parentContainer.style.maxWidth = '1250px';
    }

    let members = await fetchMembers();
    if (!members || members.length === 0) {
        members = MOCK_MEMBERS;
    }

    const member = members.find(m => m.name === name);
    if (!member) {
        container.innerHTML = '<p class="text-center">メンバーが見つかりませんでした。</p><div class="text-center" style="margin-top: 20px;"><a href="members.html" class="btn">一覧に戻る</a></div>';
        return;
    }

    // Centering layout for detail
    container.style.display = 'block';
    container.style.maxWidth = '100%';
    container.style.margin = '32px auto';

    // Header with back button
    let html = `
    <div style="margin-bottom: 30px; padding: 0 10px;">
        <a href="members.html" style="color: #6BAF92; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">←</span> メンバー一覧に戻る
        </a>
    </div>
    `;

    // Render the member card
    html += `<div style="display: flex; justify-content: center; margin-bottom: 50px; padding: 0 10px;">
        ${renderSingleMemberCard(member, true)}
    </div>`;

    container.innerHTML = html;

    // Fetch and render articles
    const posts = await fetchPostsByAuthor(name);

    let postsHtml = `
    <div style="margin-top: 60px; padding: 0 20px;">
        <h2 style="color: #6BAF92; border-bottom: 2px solid #6BAF92; padding-bottom: 15px; margin-bottom: 40px; font-size: 1.8rem; text-align: center;">${name} が書いた記事</h2>
    `;

    if (posts.length === 0) {
        postsHtml += '<p style="text-align: center; color: #666; font-style: italic; margin: 40px 0;">まだ記事がありません。</p>';
    } else {
        postsHtml += '<div id="author-posts-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">';
        posts.forEach(post => {
            const dateStr = post.published_date || post.publishedAt || post.createdAt;
            const date = new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

            // Extract category info
            const category = Array.isArray(post.category) ? post.category[0] : post.category;
            let catLabel = '';
            let badgeClass = '';
            let bgColor = '#6BAF92'; // Default teal

            if (category === 'preparation' || category === '準備') {
                catLabel = '準備';
                badgeClass = 'badge-preparation';
                bgColor = '#F4B084'; // Soft orange
            } else if (category === 'thoughts' || category === '感想') {
                catLabel = '感想';
                badgeClass = 'badge-thoughts';
                bgColor = '#6BAF92'; // Teal
            } else if (category === '質問集vol.1') {
                catLabel = '質問集vol.1';
                badgeClass = 'badge-qanda';
                bgColor = '#E76F51'; // Red-orange (Q&A color)
            }

            postsHtml += `
            <a href="article.html?id=${post.id}" style="text-decoration: none; color: inherit; flex: 0 1 300px; width: 300px; display: block;">
                <div class="new-card-layout" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.3s ease; height: 100%; border: 1px solid #eee;">
                    <div class="card-img-wrapper" style="aspect-ratio: 1/1; overflow: hidden; position: relative;">
                        <img src="${post.image.url}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                        ${catLabel ? `<span class="category-badge ${badgeClass}" style="position: absolute; bottom: 10px; right: 10px; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; color: white; font-weight: bold; background: ${bgColor};">${catLabel}</span>` : ''}
                    </div>
                    <div style="padding: 20px;">
                        <span style="font-size: 0.8rem; color: #999; display: block; margin-bottom: 8px;">${date}</span>
                        <h3 style="font-size: 1.1rem; line-height: 1.5; color: #333; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${post.title}</h3>
                    </div>
                </div>
            </a>
            `;
        });
        postsHtml += '</div>';
    }
    postsHtml += '</div>';

    container.innerHTML += postsHtml;
}

/**
 * Renders the list of member cards into the container.
 */
async function renderMemberList(container) {
    container.innerHTML = '<p class="text-center">読み込んでいます...</p>';

    let members = await fetchMembers();

    // Fallback to mock data if API fails
    if (!members || members.length === 0) {
        console.log("Using Mock Data fallback for members");
        members = MOCK_MEMBERS;
    }

    // Sort by display_order if available
    members.sort((a, b) => (a.display_order || 999) - (b.display_order || 999));

    // Grid layout for list
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center';
    container.style.gap = '20px';
    container.style.marginTop = '32px';
    container.style.maxWidth = '1200px';
    container.style.marginLeft = 'auto';
    container.style.marginRight = 'auto';

    let html = '';
    members.forEach(member => {
        html += renderSingleMemberCard(member, false);
    });

    container.innerHTML = html;
}

/**
 * Generates HTML for a single member card with inline styles for maximum compatibility.
 */
function renderSingleMemberCard(member, isDetail) {
    // Photo handling - size depends on view
    const photoSize = isDetail ? '200px' : '150px';
    const photoFontSize = isDetail ? '6rem' : '4rem';

    let photoHtml;
    if (member.photo && member.photo.url) {
        photoHtml = `<img src="${member.photo.url}" alt="${member.name}" style="width: ${photoSize}; height: ${photoSize}; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">`;
    } else {
        photoHtml = `<div style="width: ${photoSize}; height: ${photoSize}; border-radius: 50%; background-color: rgba(255, 255, 255, 0.3); display: flex; align-items: center; justify-content: center; font-size: ${photoFontSize}; border: 4px solid white;">📷</div>`;
    }

    if (isDetail) {
        // Horizontal Layout for Detail View - Optimized & Polished
        const cardStyle = `
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
            position: relative;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        `;

        return `
        <div class="member-card-detail" style="${cardStyle}">
            <!-- Removed the top green sliver as requested -->
            
            <div class="member-detail-sidebar" style="
                background: linear-gradient(135deg, #6BAF92 0%, #8fc9b5 100%);
                background-color: #6BAF92;
                padding: 40px;
                display: flex;
                flex: 0 0 320px;
                justify-content: center;
                align-items: center;
                min-height: 320px;
            ">
                ${photoHtml}
            </div>
            
            <div class="member-detail-content" style="padding: 40px 50px; flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: flex-start; background: #fff;">
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">
                    <h3 style="font-size: 2.2rem; font-weight: bold; color: #6BAF92; margin: 0;">★ ${member.name}</h3>
                    
                    ${(member.Instagram || member.instagram_url || member.Instagram_url) ? `
                    <a href="${member.Instagram || member.instagram_url || member.Instagram_url}" target="_blank" rel="noopener" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); background-color: #dc2743; border-radius: 8px; color: white; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Instagramを見る">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px;">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                    ` : ''}

                    <div style="display: flex; align-items: baseline; gap: 8px;">
                        <span style="font-size: 1.1rem; color: #666; font-weight: 500;">${member.branch_info || ''}</span>
                        ${member.birth_year ? `<span style="font-size: 1rem; color: #888; font-weight: 400;">/ ${member.birth_year}</span>` : ''}
                    </div>
                </div>
                
                <!-- Main Info Section -->
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <!-- Senior History - Full width for readability -->
                    ${member.senior_history ? `
                    <div style="background-color: #f8f9fa; border-radius: 10px; padding: 24px; border-left: 6px solid #6BAF92; width: 100%; box-sizing: border-box;">
                        <h4 style="font-size: 1rem; font-weight: bold; color: #333; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">シニア歴</h4>
                        <p style="color: #6BAF92; font-weight: bold; font-size: 1.15rem; white-space: pre-wrap; margin: 0; line-height: 1.6;">${member.senior_history}</p>
                    </div>
                    ` : ''}
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 30px; width: 100%;">
                        <!-- Hobbies Section -->
                        ${member.hobbies ? `
                        <div style="flex: 1; min-width: 250px;">
                            <h4 style="font-size: 1rem; font-weight: bold; color: #6BAF92; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.2rem;">🎨</span> 趣味・特技
                            </h4>
                            <div style="padding: 20px; background-color: #fafbfc; border: 1px solid #f0f0f0; border-radius: 10px; height: calc(100% - 32px);">
                                <p style="font-size: 1rem; color: #333; line-height: 1.8; margin: 0; white-space: pre-wrap;">${member.hobbies}</p>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Message Section -->
                        ${member.message ? `
                        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column;">
                            <h4 style="font-size: 1rem; font-weight: bold; color: #6BAF92; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.2rem;">💬</span> ひとこと
                            </h4>
                            <div style="flex: 1; padding: 24px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); background-color: #f0fdf4; border-radius: 14px; font-style: italic; display: flex; align-items: center; justify-content: center; border: 1px dashed #6BAF92;">
                                <p style="color: #333; font-size: 1.1rem; font-weight: 500; line-height: 1.7; margin: 0; white-space: pre-wrap; text-align: center;">「${member.message}」</p>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
        `;
    } else {
        // Vertical Layout for List View
        const cardStyle = `
            flex: 0 1 300px;
            width: 300px;
            max-width: 100%;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 2px solid transparent;
            position: relative;
            text-decoration: none;
            color: inherit;
            display: block;
            transition: transform 0.3s ease;
            cursor: pointer;
        `;

        return `
        <a href="members.html?name=${encodeURIComponent(member.name)}" class="member-card" style="${cardStyle}" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            <div style="
                position: absolute; top: 0; left: 0; right: 0; height: 4px;
                background: linear-gradient(90deg, #6BAF92 0%, #a2d5c6 100%);
                background-color: #6BAF92;
            "></div>
            
            <div style="
                background: linear-gradient(135deg, #6BAF92 0%, #8fc9b5 100%);
                background-color: #6BAF92;
                padding: 32px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px;
            ">
                ${photoHtml}
            </div>
            
            <div style="padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
                    <h3 style="font-size: 1.5rem; font-weight: bold; color: #6BAF92; margin: 0;">★ ${member.name}</h3>
                    ${(member.Instagram || member.instagram_url || member.Instagram_url) ? `
                    <div onclick="event.preventDefault(); event.stopPropagation(); window.open('${member.Instagram || member.instagram_url || member.Instagram_url}', '_blank');" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); background-color: #dc2743; border-radius: 5px; color: white; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" title="Instagramを見る">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </div>
                    ` : ''}
                </div>
                <p style="font-size: 0.9rem; color: #666; text-align: center; margin-bottom: 8px;">${member.branch_info || ''}</p>
                ${member.birth_year ? `<p style="font-size: 0.85rem; color: #888; text-align: center; margin-bottom: 16px;">${member.birth_year}</p>` : ''}
                
                ${member.senior_history ? `
                <div class="member-history" style="background-color: #f8f9fa; border-radius: 8px; padding: 12px; margin: 12px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.8rem;">
                        <span style="font-weight: bold; color: #333; flex-shrink: 0; margin-right: 8px;">シニア歴:</span>
                        <span style="color: #6BAF92; font-weight: bold; white-space: pre-wrap; text-align: right;">${member.senior_history}</span>
                    </div>
                </div>
                ` : ''}
                
                ${member.hobbies ? `
                <div class="member-hobbies" style="margin: 16px 0; padding: 12px; background-color: #fafbfc; border-left: 3px solid #6BAF92; border-radius: 4px;">
                    <h4 style="font-size: 0.9rem; font-weight: bold; color: #6BAF92; margin-bottom: 8px;">趣味・特技</h4>
                    <p style="font-size: 0.9rem; color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${member.hobbies}</p>
                </div>
                ` : ''}
                
                ${member.message ? `
                <div class="member-message" style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #e8f5f1 0%, #d4ebe4 100%); background-color: #e8f5f1; border-radius: 8px; font-style: italic; text-align: center;">
                    <p style="color: #333; font-size: 0.95rem; line-height: 1.6; margin: 0; white-space: pre-wrap;">「${member.message}」</p>
                </div>
                ` : ''}
            </div>
        </a>
        `;
    }
}