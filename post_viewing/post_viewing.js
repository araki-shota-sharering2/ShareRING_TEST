document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentPage = 1;

    // 投稿を取得
    async function fetchPosts() {
        try {
            const response = await fetch("/post-viewing-handler?page=1", {
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

    // 現在の投稿を表示
    function displayPosts() {
        timeline.innerHTML = "";
        if (posts.length > 0) {
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
                </div>`;
        } else {
            timeline.innerHTML = "<p>投稿がありません。</p>";
        }
    }

    // プレビューアイコンを表示
    function displayPreviewIcons() {
        previewSlider.innerHTML = "";
        posts.forEach((post, index) => {
            const previewItem = document.createElement("img");
            previewItem.src = post.image_url;
            previewItem.alt = "投稿プレビュー";
            previewItem.dataset.index = index;
            if (index === currentPage - 1) {
                previewItem.classList.add("active");
            }
            previewItem.addEventListener("click", () => {
                switchToPost(index);
            });
            previewSlider.appendChild(previewItem);
        });
    }

    // 投稿切り替え
    function switchToPost(index) {
        currentPage = index + 1;
        displayPosts();
        displayPreviewIcons();
    }

    // スワイプイベント追加
    function addSwipeEvents() {
        let startX = 0;

        timeline.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        });

        timeline.addEventListener("touchend", (e) => {
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

    // 初期化
    await fetchPosts();
    addSwipeEvents();
});
