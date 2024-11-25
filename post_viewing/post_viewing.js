document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
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
                    displayPreviewIcons(newPosts);
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

            // RINGカラーを設定
            const ring = document.createElement("div");
            ring.className = "ring";
            ring.style.borderColor = post.ring_color || "#394575";

            postFrame.innerHTML = `
                <img src="${post.image_url}" alt="投稿画像">
                <div class="post-details">
                    <div class="user-info">
                        <img class="user-avatar" src="${post.profile_image || '/assets/images/default-avatar.png'}" alt="ユーザー画像">
                        <p>${post.username || "匿名ユーザー"}</p>
                    </div>
                    <p>${post.caption || "コメントなし"}</p>
                    <p>投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                </div>
            `;
            postFrame.appendChild(ring);
            timeline.appendChild(postFrame);
        });
    }

    function displayPreviewIcons(newPosts) {
        newPosts.forEach((post, index) => {
            const previewItem = document.createElement("img");
            previewItem.src = post.image_url;
            previewItem.alt = "投稿プレビュー";
            previewItem.dataset.index = posts.length - newPosts.length + index;

            previewItem.addEventListener("click", () => {
                const scrollPosition = timeline.children[previewItem.dataset.index].offsetLeft;
                timeline.scrollTo({ left: scrollPosition, behavior: "smooth" });
            });

            previewSlider.appendChild(previewItem);
        });
    }

    timeline.addEventListener("scroll", () => {
        if (
            timeline.scrollLeft + timeline.clientWidth >=
            timeline.scrollWidth - 50
        ) {
            fetchPosts();
        }
    });

    await fetchPosts();
});
