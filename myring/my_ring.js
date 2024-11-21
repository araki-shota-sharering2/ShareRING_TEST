document.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    let currentPage = 1;
    let totalPosts = [];
    const postsPerPage = 10;

    // 投稿データを取得して描画
    const fetchPosts = async () => {
        try {
            const response = await fetch(`/myring-handler`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error("投稿データ取得エラー:", await response.text());
                return;
            }

            totalPosts = await response.json();
            renderPage(currentPage);
            updatePaginationButtons();
        } catch (error) {
            console.error("投稿データ取得中にエラーが発生しました:", error);
        }
    };

    // ページ描画
    const renderPage = (page) => {
        timelineContainer.innerHTML = '';
        const startIndex = (page - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, totalPosts.length);
        const pagePosts = totalPosts.slice(startIndex, endIndex);

        pagePosts.forEach((post) => {
            const timelineItem = document.createElement("div");
            timelineItem.classList.add("timeline-item");
            timelineItem.innerHTML = `
                <div class="timeline-marker" style="border-color: ${post.ring_color || "#cccccc"};">
                    <img src="${post.image_url}" alt="投稿画像">
                </div>
                <div class="timeline-content">
                    <p class="timeline-title">${post.caption || "キャプションなし"}</p>
                    <p class="timeline-address">${post.address || "住所情報なし"}</p>
                    <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
                </div>
            `;
            timelineContainer.appendChild(timelineItem);
        });

        updatePaginationButtons();
    };

    // ページングボタンの状態更新
    const updatePaginationButtons = () => {
        const totalPages = Math.ceil(totalPosts.length / postsPerPage);
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        // デバッグ用ログ
        console.log(`Current Page: ${currentPage}`);
        console.log(`Total Pages: ${totalPages}`);
        console.log("Prev Button Disabled:", prevButton.disabled);
        console.log("Next Button Disabled:", nextButton.disabled);
    };

    // ボタンクリックイベント
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });

    nextButton.addEventListener("click", () => {
        const totalPages = Math.ceil(totalPosts.length / postsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
        }
    });

    // 初期化
    fetchPosts();
});
