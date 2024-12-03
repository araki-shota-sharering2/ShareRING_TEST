document.addEventListener("DOMContentLoaded", async () => {
    const keepList = document.querySelector(".keep-list");

    async function fetchKeeps() {
        try {
            const response = await fetch("/functions/mykeep-handler", { method: "GET" });
            if (response.ok) {
                const posts = await response.json();
                displayKeeps(posts);
            } else {
                console.error("キープ投稿の取得に失敗しました");
            }
        } catch (error) {
            console.error("キープ投稿の取得中にエラーが発生しました:", error);
        }
    }

    function displayKeeps(posts) {
        posts.forEach((post) => {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            postFrame.innerHTML = `
                <img src="${post.image_url}" alt="投稿画像">
                <p>${post.caption || "コメントなし"}</p>
                <p>投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                <p>場所: ${post.address || "不明"}</p>
            `;
            keepList.appendChild(postFrame);
        });
    }

    await fetchKeeps();
});
