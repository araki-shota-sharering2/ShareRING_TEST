document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];

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
                        document.querySelectorAll(".preview-slider img").forEach((img) => {
                            img.classList.remove("active");
                        });
                        previewItem.classList.add("active");
                        displayPost(index);
                    });

                    previewSlider.appendChild(previewItem);
                });
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
                <button>ここへ行く</button>
                <button>いいね</button>
                <button>Keep</button>
            </div>
        `;
    }

    fetchPosts();
});
