document.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    const modal = document.querySelector("#modal");
    const modalImage = document.querySelector("#modal-image");
    const modalCaption = document.querySelector("#modal-caption");
    // const deletePostButton = document.querySelector("#delete-post"); // 削除ボタン

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

            // ページングボタンの状態を更新
            updatePaginationButtons();
        } catch (error) {
            console.error("投稿データ取得中にエラーが発生しました:", error);
        }
    };

    // 指定されたページを描画
    const renderPage = (page) => {
        timelineContainer.innerHTML = ''; // タイムラインをクリア
        const startIndex = (page - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const pagePosts = totalPosts.slice(startIndex, endIndex); // ページ内の投稿を取得

        pagePosts.forEach((post) => {
            const timelineItem = createTimelineItem(post);
            timelineContainer.appendChild(timelineItem);
        });
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
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage * postsPerPage >= totalPosts.length;
    };

    // ページングイベント
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage); // 前のページを表示
            updatePaginationButtons();
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage * postsPerPage < totalPosts.length) {
            currentPage++;
            renderPage(currentPage); // 次のページを表示
            updatePaginationButtons();
        }
    });

    // 初期データを取得
    fetchPosts();
});
