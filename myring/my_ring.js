document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/functions/my_ring-handler.js", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("投稿データを取得できませんでした");
        }

        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error("エラー:", error);
        alert("投稿データの読み込み中にエラーが発生しました");
    }
});

function displayPosts(posts) {
    const postsList = document.getElementById("postsList");
    postsList.innerHTML = "";

    posts.forEach(post => {
        const listItem = document.createElement("li");
        listItem.classList.add("post-item");

        listItem.innerHTML = `
            <img src="${post.image_url}" alt="投稿画像">
            <div class="info">
                <h2>${post.caption || "キャプションなし"}</h2>
                <p>${post.address || "住所情報なし"}</p>
                <small>投稿日: ${new Date(post.created_at).toLocaleString()}</small>
            </div>
        `;

        postsList.appendChild(listItem);
    });
}
