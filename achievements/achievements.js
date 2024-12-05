document.addEventListener('DOMContentLoaded', async () => {
    const awardsContainer = document.getElementById('awards-container');
    const userId = await getUserId(); // ユーザーID取得
    const awardsData = await fetch('/achievements-handler.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
    }).then(res => res.json());

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
});
