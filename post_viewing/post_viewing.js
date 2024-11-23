document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentIndex = 0;

    // 投稿を取得してプレビューアイコンを生成
    async function fetchPosts() {
        try {
            const response = await fetch("/post-viewing-handler", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                posts = await response.json();
                posts.forEach((post, index) => {
                    // プレビューアイコン
                    const previewItem = document.createElement("img");
                    previewItem.src = post.image_url;
                    previewItem.alt = "投稿プレビュー";
                    previewItem.dataset.index = index;

                    // 初期状態で最初の投稿を選択
                    if (index === 0) {
                        previewItem.classList.add("active");
                        displayPost(index);
                    }

                    previewItem.addEventListener("click", () => {
                        switchToPost(index);
                    });

                    previewSlider.appendChild(previewItem);
                });

                // 最大6つのプレビューアイコンを表示
                limitPreviewIcons();
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    // 指定された投稿を上部に表示
    function displayPost(index) {
        const post = posts[index];
        timeline.innerHTML = `
            <img src="${post.image_url}" alt="投稿画像">
            <div class="user-info">
                <img src="${post.profile_image}" alt="プロフィール画像">
                <p>${post.username}</p>
            </div>
            <p>${post.caption || "コメントなし"}</p>
            <p>${post.address || "住所なし"}</p>
            <div class="buttons">
                <button><img src="/assets/icons/navigation.svg" alt="ナビアイコン">ここへ行く</button>
                <button><img src="/assets/icons/like.svg" alt="いいねアイコン">いいね</button>
                <button><img src="/assets/icons/save.svg" alt="保存アイコン">Keep</button>
            </div>
        `;
    }

    // 投稿を切り替える（アイコンと上部表示の更新）
    function switchToPost(index) {
        document.querySelectorAll(".preview-slider img").forEach((img) => {
            img.classList.remove("active");
        });
        document.querySelector(`[data-index='${index}']`).classList.add("active");
        currentIndex = index;
        displayPost(index);
    }

    // 最大6つのプレビューアイコンを表示する
    function limitPreviewIcons() {
        const icons = document.querySelectorAll(".preview-slider img");
        icons.forEach((icon, index) => {
            icon.style.display = index < 6 ? "block" : "none"; // 最初の6個のみ表示
        });

        previewSlider.addEventListener("scroll", () => {
            const scrollLeft = previewSlider.scrollLeft;
            const iconWidth = icons[0].offsetWidth + 10; // アイコンの幅 + 余白
            const start = Math.floor(scrollLeft / iconWidth);
            icons.forEach((icon, index) => {
                icon.style.display = index >= start && index < start + 6 ? "block" : "none";
            });
        });
    }

    fetchPosts();
});
