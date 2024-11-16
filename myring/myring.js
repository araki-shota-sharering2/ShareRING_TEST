document.addEventListener('DOMContentLoaded', async () => {
    const postContainer = document.getElementById('post-container');

    try {
        const response = await fetch('/functions/myring-handler');
        if (!response.ok) {
            throw new Error('投稿データの取得に失敗しました');
        }

        const posts = await response.json();
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';

            const imgElement = document.createElement('img');
            imgElement.src = post.image_url;
            imgElement.style.borderColor = post.ring_color;

            const captionElement = document.createElement('div');
            captionElement.className = 'caption';
            captionElement.textContent = post.caption || 'No Caption';

            postElement.appendChild(imgElement);
            postElement.appendChild(captionElement);
            postContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('エラー:', error);
        postContainer.textContent = '投稿の表示に失敗しました。';
    }
});
