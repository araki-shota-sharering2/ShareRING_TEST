document.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");

    let currentPage = 1;
    let totalPosts = []; // 全投稿データ
    const postsPerPage = 10; // 1ページあたりの投稿数

    // 投稿データを取得して描画
    const fetchPosts = async () => {
        try {
            timelineContainer.innerHTML = ''; // タイムラインをクリア

            const response = await fetch(`/myring-handler`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("投稿データ取得エラー:", errorText);
                return;
            }

            totalPosts = await response.json(); // 全投稿データを取得
            renderPage(currentPage); // 現在のページを表示
            updatePaginationButtons();
        } catch (error) {
            console.error("投稿データ取得中にエラーが発生しました:", error);
        }
    };

    // 指定されたページを描画
    const renderPage = (page) => {
        timelineContainer.innerHTML = ''; // タイムラインをクリア
        const startIndex = (page - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, totalPosts.length); // 終了インデックスの範囲チェック
        const pagePosts = totalPosts.slice(startIndex, endIndex); // ページ内の投稿を取得

        // ページに投稿データを描画
        pagePosts.forEach((post) => {
            const timelineItem = createTimelineItem(post);
            timelineContainer.appendChild(timelineItem);
        });

        // ページングボタンの状態を更新
        updatePaginationButtons();
    };

    // タイムラインアイテムを生成
    const createTimelineItem = (post) => {
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

        return timelineItem;
    };

    // ページングボタンの状態を更新
    const updatePaginationButtons = () => {
        prevButton.disabled = currentPage === 1; // 最初のページでは「前へ」を無効化
        nextButton.disabled = currentPage * postsPerPage >= totalPosts.length; // 最終ページでは「次へ」を無効化
    };

    // ページングイベント
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage); // 前のページを表示
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage * postsPerPage < totalPosts.length) {
            currentPage++;
            renderPage(currentPage); // 次のページを表示
        }
    });

    // 初期データを取得
    fetchPosts();
});
