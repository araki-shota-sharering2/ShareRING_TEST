document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentPage = 1;
    let totalLoadedPages = 0;
    let startX = 0;
    let isFetching = false;

    // 投稿データ取得
    async function fetchPosts(page) {
        if (isFetching) return;
        isFetching = true;

        try {
            const response = await fetch(`/post-viewing-handler?page=${page}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const newPosts = await response.json();
                posts = [...posts, ...newPosts];
                totalLoadedPages = page;
                displayPreviewIcons(newPosts);
                isFetching = false;

                if (newPosts.length === 0) {
                    console.log("すべての投稿が読み込まれました。");
                }
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    // 投稿表示
    function displayPosts() {
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
                    <div class="user-info">
                        <img class="user-avatar" src="${post.profile_image || '/assets/images/default-avatar.png'}" alt="ユーザー画像">
                        <span>${post.username || "匿名ユーザー"}</span>
                    </div>
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
    function displayPreviewIcons(newPosts) {
        newPosts.forEach((post, index) => {
            const previewItem = document.createElement("img");
            previewItem.src = post.image_url;
            previewItem.alt = "投稿プレビュー";
            previewItem.dataset.index = posts.length - newPosts.length + index;

            if (index === currentPage - 1) previewItem.classList.add("active");

            previewItem.addEventListener("click", () => {
                currentPage = Number(previewItem.dataset.index) + 1;
                displayPosts();
                updateActivePreview(currentPage - 1);
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

    // スクロールイベント監視
    previewSlider.addEventListener("scroll", () => {
        if (
            previewSlider.scrollLeft + previewSlider.clientWidth >=
            previewSlider.scrollWidth - 50
        ) {
            fetchPosts(totalLoadedPages + 1);
        }
    });

    // 初期ロード
    await fetchPosts(1);
    displayPosts();
});
