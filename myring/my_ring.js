document.addEventListener("DOMContentLoaded", () => {
    loadUserPosts();
});

async function loadUserPosts() {
    const response = await fetch("/functions/my_ring-handler");
    if (response.ok) {
        const posts = await response.json();
        displayPosts(posts);
    } else {
        console.error("投稿の読み込みに失敗しました");
    }
}

function displayPosts(posts) {
    const postList = document.getElementById("postList");
    postList.innerHTML = "";

    posts.forEach((post) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <img src="${post.image_url}" alt="投稿画像" style="border-color: ${post.ring_color}">
            <button class="deleteButton" data-id="${post.post_id}">&times;</button>
        `;
        postList.appendChild(listItem);

        const deleteButton = listItem.querySelector(".deleteButton");
        deleteButton.addEventListener("click", () => deletePost(post.post_id));
    });
}

async function deletePost(postId) {
    if (!confirm("この投稿を削除してもよろしいですか？")) return;

    const response = await fetch(`/functions/my_ring-handler`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
    });

    if (response.ok) {
        alert("投稿を削除しました");
        loadUserPosts();
    } else {
        console.error("投稿の削除に失敗しました");
    }
}
