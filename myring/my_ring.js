document.addEventListener("DOMContentLoaded", async () => {
    const timelineContainer = document.querySelector(".timeline");

    // 星の背景を追加
    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.top = Math.random() * 100 + "vh";
        star.style.left = Math.random() * 100 + "vw";
        star.style.animationDuration = Math.random() * 2 + 1 + "s";
        document.body.appendChild(star);
    }

    try {
        const response = await fetch('/myring-handler', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const posts = await response.json();

            // 最新の投稿順に並び替え
            posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            posts.forEach((post) => {
                const ringColor = post.ring_color || "#cccccc"; // デフォルトリングカラー

                const timelineItem = document.createElement("div");
                timelineItem.classList.add("timeline-item");

                timelineItem.innerHTML = `
                    <div class="timeline-marker" style="border-color: ${ringColor};">
                        <img src="${post.image_url}" alt="投稿画像">
                    </div>
                    <div class="timeline-content">
                        <p class="timeline-title">${post.caption || "キャプションなし"}</p>
                        <p class="timeline-address">${post.address || "住所情報なし"}</p>
                        <p class="timeline-date">${new Date(post.created_at).toLocaleString()}</p>
                    </div>
                `;

                timelineContainer.appendChild(timelineItem);
            });
        } else {
            console.error("投稿データの取得に失敗しました");
            timelineContainer.textContent = "投稿データの取得に失敗しました。";
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        timelineContainer.textContent = "エラーが発生しました。";
    }
});
