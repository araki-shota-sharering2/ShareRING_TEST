document.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.querySelector(".timeline");
    const prevButton = document.querySelector("#prev-button");
    const nextButton = document.querySelector("#next-button");
    const modal = document.querySelector("#modal");
    const modalImage = document.querySelector("#modal-image");
    const modalCaption = document.querySelector("#modal-caption");
    const deletePostButton = document.querySelector("#delete-post");
    const closeModalButton = document.querySelector("#modal-close");

    let currentPage = 1;
    let currentPostId = null;

    // 投稿データを取得してタイムラインに描画する
    const fetchPosts = async (page) => {
        try {
            timelineContainer.innerHTML = ''; // タイムラインをリセット

            const response = await fetch(`/myring-handler?page=${page}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const posts = await response.json();
                renderTimeline(posts);

                // ページングボタンの有効/無効を切り替え
                prevButton.disabled = page === 1;
                nextButton.disabled = posts.length < 10;
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    };

    // タイムラインを描画
    const renderTimeline = (posts) => {
        posts.forEach((post) => {
            const timelineItem = createTimelineItem(post);
            timelineContainer.appendChild(timelineItem);
        });
    };

    // タイムラインアイテムを生成
    const createTimelineItem = (post) => {
        const timelineItem = document.createElement("div");
        timelineItem.classList.add("timeline-item");

        timelineItem.innerHTML = `
            <div class="timeline-marker" style="border-color: ${post.ring_color || "#cccccc"};">
                <img src="${post.image_url}" alt="投稿画像" data-post-id="${post.post_id}">
            </div>
            <div class="timeline-content">
                <p class="timeline-title">${post.caption || "キャプションなし"}</p>
                <p class="timeline-address">${post.address || "住所情報なし"}</p>
                <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
            </div>
        `;

        // モーダルを開くクリックイベントを追加
        timelineItem.querySelector("img").addEventListener("click", () => {
            openModal(post.post_id, post.image_url, post.caption);
        });

        return timelineItem;
    };

    // モーダルを開く
    const openModal = (postId, imageUrl, caption) => {
        currentPostId = postId;
        modalImage.src = imageUrl;
        modalCaption.textContent = caption || "キャプションなし";
        modal.style.display = "flex";
    };

    // モーダルを閉じる
    closeModalButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // 投稿を削除する
    const deletePost = async () => {
        if (!confirm("この投稿を削除してもよろしいですか？")) return;

        try {
            const response = await fetch(`/functions/myring-delete-handler`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ postId: currentPostId }),
            });

            if (response.ok) {
                alert("投稿が削除されました");
                modal.style.display = "none";
                fetchPosts(currentPage); // 現在のページを再取得
            } else {
                alert("削除に失敗しました");
                console.error("投稿削除エラー:", await response.json());
            }
        } catch (error) {
            console.error("削除エラー:", error);
            alert("削除中にエラーが発生しました");
        }
    };

    // ページング機能
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPosts(currentPage);
        }
    });

    nextButton.addEventListener("click", () => {
        currentPage++;
        fetchPosts(currentPage);
    });

    // 削除ボタンにイベントリスナーを設定
    deletePostButton.addEventListener("click", deletePost);

    // 初期データを取得
    fetchPosts(currentPage);
});
