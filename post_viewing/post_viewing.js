document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentPage = 1;
    let startX = 0; // スワイプ開始位置

    // 投稿データ取得
    async function fetchPosts() {
        try {
            const response = await fetch(`/post-viewing-handler`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                posts = await response.json();
                displayPosts();
                displayPreviewIcons();
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    // 投稿表示
    function displayPosts() {
        timeline.innerHTML = "";
        if (posts.length === 0) {
            timeline.innerHTML = "<p>投稿が見つかりません</p>";
            return;
        }

        const post = posts[currentPage - 1];
        timeline.innerHTML = `
            <div class="post-frame" style="border-color: ${post.ring_color || "#4e5c94"};">
                <img src="${post.image_url}" alt="投稿画像">
            </div>
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

    // プレビュー表示
    function displayPreviewIcons() {
        previewSlider.innerHTML = "";
        posts.forEach((post, index) => {
            const previewItem = document.createElement("img");
            previewItem.src = post.image_url;
            previewItem.alt = "投稿プレビュー";
            previewItem.dataset.index = index;

            if (index === currentPage - 1) previewItem.classList.add("active");

            previewItem.addEventListener("click", () => {
                currentPage = index + 1;
                displayPosts();
                updateActivePreview(index);
            });

            previewSlider.appendChild(previewItem);
        });
    }

    // プレビューの選択状態を更新
    function updateActivePreview(activeIndex) {
        document.querySelectorAll(".preview-slider img").forEach((img, index) => {
            img.classList.toggle("active", index === activeIndex);
        });
    }

    // スワイプ開始位置を記録
    timeline.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    // スワイプ終了位置を記録して投稿を切り替える
    timeline.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (diff > 50 && currentPage > 1) {
            // スワイプ右: 前の投稿
            currentPage--;
            displayPosts();
            updateActivePreview(currentPage - 1);
        } else if (diff < -50 && currentPage < posts.length) {
            // スワイプ左: 次の投稿
            currentPage++;
            displayPosts();
            updateActivePreview(currentPage - 1);
        }
    });

    // 初期データ取得
    fetchPosts();
});
