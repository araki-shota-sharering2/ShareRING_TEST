document.addEventListener('DOMContentLoaded', async () => {
    const awardsContainer = document.getElementById('awards-container');
    
    try {
        // ユーザーIDを取得
        const userId = await getUserId();
        
        // アチーブメントデータを取得
        const awardsData = await fetch('/functions/achievements-handler.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        }).then(res => res.json());

        // アチーブメントカードを生成
        awardsData.forEach(award => {
            const awardCard = document.createElement('div');
            awardCard.classList.add('award-card');
            if (award.achieved_at === null) awardCard.classList.add('locked');

            awardCard.innerHTML = `
                <img src="${award.image_url}" alt="${award.name}">
                <h3>${award.name}</h3>
                <p>${award.description}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${award.progress / award.goal * 100}%"></div>
                </div>
            `;
            awardsContainer.appendChild(awardCard);
        });
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
});

// 修正されたgetUserId関数
async function getUserId() {
    try {
        const response = await fetch('/session-handler.js');
        const data = await response.json();
        return data.user_id;
    } catch (error) {
        console.error('Error fetching user ID:', error);
        throw error;
    }
}
