document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentPage = 1;
    const itemsPerPage = 8; // 1ページあたりの投稿数
    const maxVisiblePreviews = 8;

    // 投稿を取得してプレビューアイコンを生成
    async function fetchPosts(page) {
        try {
            const response = await fetch(`/post-viewing-handler?page=${page}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                posts = data;
                displayPosts();
                displayPreviewIcons();
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    // 投稿詳細を表示
    function displayPosts() {
        timeline.innerHTML = "";
        if (posts.length === 0) {
            timeline.innerHTML = "<p>投稿が見つかりません</p>";
            return;
        }

        const post = posts[currentPage - 1];
        timeline.innerHTML = `
            <img src="${post.image_url}" alt="投稿画像">
            <div class="post-details">
                <div class="post-title">
                    <span>${post.username || "匿名ユーザー"}</span>
                    <span>${post.address || "場所情報なし"}</span>
                </div>
                <p class="post-comment">${post.caption || "コメントなし"}</p>
                <p class="post-location">投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                <div class="buttons">
                    <button>
                        <img src="/assets/icons/navigation.svg" alt="ナビアイコン">ここへ行く
                    </button>
                    <button>
                        <img src="/assets/icons/like.svg" alt="いいねアイコン">いいね
                    </button>
                    <button>
                        <img src="/assets/icons/save.svg" alt="保存アイコン">Keep
                    </button>
                </div>
            </div>
        `;
    }

    // プレビューアイコンを表示
    function displayPreviewIcons() {
        previewSlider.innerHTML = "";
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + maxVisiblePreviews, posts.length);

        for (let i = startIndex; i < endIndex; i++) {
            const previewItem = document.createElement("img");
            previewItem.src = posts[i].image_url;
            previewItem.alt = "投稿プレビュー";
            previewItem.dataset.index = i;

            if (i === currentPage - 1) previewItem.classList.add("active");

            previewItem.addEventListener("click", () => {
                switchToPost(i);
            });

            previewSlider.appendChild(previewItem);
        }
    }

    // 特定の投稿を表示
    function switchToPost(index) {
        document.querySelectorAll(".preview-slider img").forEach((img) => {
            img.classList.remove("active");
        });
        document.querySelector(`[data-index='${index}']`).classList.add("active");
        currentPage = index + 1;
        displayPosts();
    }

    // スワイプイベントの追加
    function addSwipeEvents() {
        let startX = 0;

        previewSlider.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        });

        previewSlider.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;

            if (diff > 50 && currentPage > 1) {
                currentPage--;
                displayPosts();
                displayPreviewIcons();
            } else if (diff < -50 && currentPage < posts.length) {
                currentPage++;
                displayPosts();
                displayPreviewIcons();
            }
        });
    }

    fetchPosts(1); // 初期ロード
    addSwipeEvents();
});
