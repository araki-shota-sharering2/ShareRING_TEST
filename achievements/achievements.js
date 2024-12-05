document.addEventListener('DOMContentLoaded', async () => {
    const awardsContainer = document.getElementById('awards-container');

    try {
        // ユーザーIDを取得
        const userId = await getUserId();

        // サーバーからアチーブメントデータを取得
        const awardsData = await fetch('/achievements-handler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        }).then(res => res.json());

        // アチーブメントカードを生成
        awardsData.forEach((award, index) => {
            const awardCard = document.createElement('div');
            awardCard.classList.add('award-card');
            if (!award.achieved_at) {
                awardCard.classList.add('locked');
            }

            awardCard.innerHTML = `
                <img src="${award.image_url || '/default-image.png'}" alt="${award.name}">
                <h3>${award.name}</h3>
                <p>${award.description}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(award.progress / award.goal) * 100}%"></div>
                </div>
            `;
            awardsContainer.appendChild(awardCard);

            // 3つごとに改行
            if ((index + 1) % 3 === 0) {
                const lineBreak = document.createElement('div');
                lineBreak.style.width = '100%';
                awardsContainer.appendChild(lineBreak);
            }
        });
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
});

async function getUserId() {
    try {
        const response = await fetch('/session-handler');
        const data = await response.json();
        return data.user_id;
    } catch (error) {
        console.error('Error fetching user ID:', error);
        throw error;
    }
}
