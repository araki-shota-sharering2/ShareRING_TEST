document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const previewSlider = document.querySelector(".preview-slider");
    let posts = [];
    let currentPage = 1;
    let totalLoadedPages = 0;
    let isFetching = false;

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
                if (newPosts.length > 0 && currentPage <= posts.length) {
                    displayPosts();
                }
                isFetching = false;
            }
        } catch (error) {
            console.error("投稿データの取得中にエラーが発生しました:", error);
            isFetching = false;
        }
    }

    function displayPosts() {
        const post = posts[currentPage - 1];
        if (!post) return;

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
            </div>
        `;
    }

    function displayPreviewIcons(newPosts) {
        newPosts.forEach((post, index) => {
            const previewItem = document.createElement("img");
            previewItem.src = post.image_url;
            previewItem.alt = "投稿プレビュー";
            previewItem.dataset.index = posts.length - newPosts.length + index;

            if (posts.length - newPosts.length + index === currentPage - 1) {
                previewItem.classList.add("active");
            }

            previewItem.addEventListener("click", () => {
                currentPage = parseInt(previewItem.dataset.index) + 1;
                displayPosts();
                updateActivePreview(currentPage - 1);
            });

            previewSlider.appendChild(previewItem);
        });
    }

    function updateActivePreview(activeIndex) {
        document.querySelectorAll(".preview-slider img").forEach((img, index) => {
            img.classList.toggle("active", index === activeIndex);
        });
    }

    previewSlider.addEventListener("scroll", () => {
        if (
            previewSlider.scrollLeft + previewSlider.clientWidth >=
            previewSlider.scrollWidth - 50
        ) {
            fetchPosts(totalLoadedPages + 1);
        }
    });

    await fetchPosts(1);
});
