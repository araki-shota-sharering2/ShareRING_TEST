document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const ring = document.querySelector(".ring");
    let posts = [];
    let currentPage = 0;

    async function fetchPosts() {
        try {
            const response = await fetch(`/post-viewing-handler`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                posts = data;
                displayPost();
                displayRingIcons();
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    }

    function displayPost() {
        if (posts.length === 0) {
            timeline.innerHTML = "<p>投稿が見つかりません</p>";
            return;
        }

        const post = posts[currentPage];
        timeline.innerHTML = `
            <img src="${post.image_url}" alt="投稿画像">
            <div class="post-details">
                <h3>${post.username || "匿名ユーザー"}</h3>
                <p>${post.caption || "コメントなし"}</p>
                <p>${post.address || "場所情報なし"}</p>
            </div>
        `;
    }

    function displayRingIcons() {
        ring.innerHTML = "";
        posts.forEach((post, index) => {
            const img = document.createElement("img");
            img.src = post.image_url;
            img.dataset.index = index;

            if (index === currentPage) img.classList.add("active");

            img.addEventListener("click", () => {
                currentPage = index;
                displayPost();
                document.querySelectorAll(".ring img").forEach((el) => el.classList.remove("active"));
                img.classList.add("active");
            });

            ring.appendChild(img);
        });
    }

    fetchPosts();
});
