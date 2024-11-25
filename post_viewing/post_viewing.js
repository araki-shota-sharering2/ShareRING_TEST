document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    let posts = [];
    let currentPage = 0;
    let isFetching = false;

    async function fetchPosts() {
        if (isFetching) return;
        isFetching = true;

        try {
            const response = await fetch(`/post-viewing-handler?page=${currentPage + 1}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const newPosts = await response.json();
                if (newPosts.length > 0) {
                    posts = [...posts, ...newPosts];
                    displayPosts(newPosts);
                    currentPage++;
                }
                isFetching = false;
            }
        } catch (error) {
            console.error("投稿データ取得エラー:", error);
            isFetching = false;
        }
    }

    function displayPosts(newPosts) {
        newPosts.forEach((post) => {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            const ringColor = post.ring_color || "#FFFFFF";

            postFrame.innerHTML = `
                <img src="${post.image_url}" alt="投稿画像" class="post-image" style="border-color: ${ringColor};">
                <div class="post-details">
                    <div class="user-info">
                        <img class="user-avatar" src="${post.profile_image || '/assets/images/default-avatar.png'}" alt="ユーザー画像">
                        <span>${post.username || "匿名ユーザー"}</span>
                    </div>
                    <p class="post-comment">${post.caption || "コメントなし"}</p>
                    <p class="post-location">投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div class="post-actions">
                    <button class="like-button">いいね</button>
                    <button class="keep-button">Keep</button>
                    <textarea class="comment-box" placeholder="コメントを入力"></textarea>
                </div>
            `;
            timeline.appendChild(postFrame);
        });
    }

    await fetchPosts();
});
