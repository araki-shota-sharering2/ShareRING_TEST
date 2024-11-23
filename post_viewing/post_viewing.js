document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");

    async function fetchPosts() {
        try {
            const response = await fetch("/post-viewing-handler", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const posts = await response.json();
                posts.forEach((post) => {
                    // メインタイムライン投稿
                    const postItem = document.createElement("div");
                    postItem.classList.add("timeline-item");
                    postItem.innerHTML = `
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
                    timeline.appendChild(postItem);

                    // プレビューアイコン
                    const previewItem = document.createElement("img");
                    previewItem.src = post.image_url;
                    previewSlider.appendChild(previewItem);
                });
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    fetchPosts();
});
