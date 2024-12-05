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
        let rowDiv = null;
        awardsData.forEach((award, index) => {
            // 新しい行を作成（3つ目のカード後に改行）
            if (index % 3 === 0) {
                rowDiv = document.createElement('div');
                rowDiv.classList.add('row');
                awardsContainer.appendChild(rowDiv);
            }

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
            rowDiv.appendChild(awardCard);
        });

        // スマホ向けに横並び幅を調整
        adjustCardLayout();

        // 画面サイズ変更時にレイアウトを再調整
        window.addEventListener('resize', adjustCardLayout);

    } catch (error) {
        console.error('Error loading achievements:', error);
    }
});

// ユーザーIDを取得
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

// 横並びのカード幅を調整（スマホ対応）
function adjustCardLayout() {
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        const cards = row.querySelectorAll('.award-card');
        const rowWidth = row.offsetWidth;

        // 3列固定でカード幅を計算
        const cardWidth = `${100 / 3 - 2}%`; // カード間の余白を考慮
        cards.forEach(card => {
            card.style.width = cardWidth;
            card.style.margin = '1%'; // カード間の余白を確保
        });
    });
}
