document.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    const modal = document.querySelector("#modal");
    const modalImage = document.querySelector("#modal-image");
    const modalCaption = document.querySelector("#modal-caption");
    // const deletePostButton = document.querySelector("#delete-post"); // 削除ボタン

    let currentPage = 1;

    // 投稿データを取得して描画
    const fetchPosts = async (page) => {
        try {
            timelineContainer.innerHTML = ''; // タイムラインをクリア

            // ページ指定を無効化して全投稿を取得
            const response = await fetch(`/myring-handler`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("投稿データ取得エラー:", errorText);
                return;
            }

            const posts = await response.json();
            renderTimeline(posts);

            // ページングボタンは常に有効化
            prevButton.disabled = false;
            nextButton.disabled = false;
        } catch (error) {
            console.error("投稿データ取得中にエラーが発生しました:", error);
        }
    };

    // タイムラインを描画
    const renderTimeline = (posts) => {
        posts.forEach((post) => {
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

    // ページングイベント（現在の動作は常に全投稿を表示）
    prevButton.addEventListener("click", () => {
        console.log("前のページボタンがクリックされました");
    });

    nextButton.addEventListener("click", () => {
        console.log("次のページボタンがクリックされました");
    });

    // 初期データを取得
    fetchPosts(currentPage);
});
