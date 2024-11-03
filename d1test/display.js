document.addEventListener('DOMContentLoaded', async () => {
    const photoContainer = document.getElementById('photo-container');

    try {
        const response = await fetch('/photos');
        if (!response.ok) {
            throw new Error('画像の取得に失敗しました');
        }

        const photos = await response.json();
        photos.forEach(photo => {
            const div = document.createElement('div');
            div.classList.add('photo-item');
            div.innerHTML = `<img src="${photo.blog}" alt="Uploaded Image"> <button data-id="${photo.id}">削除</button>`;
            photoContainer.appendChild(div);

            // 削除ボタンのイベントリスナー
            div.querySelector('button').addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                try {
                    const deleteResponse = await fetch('/photos', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id }),
                    });
                    if (deleteResponse.ok) {
                        e.target.parentElement.remove();
                        alert('画像を削除しました');
                    } else {
                        throw new Error('画像の削除に失敗しました');
                    }
                } catch (error) {
                    alert(`エラー: ${error.message}`);
                }
            });
        });
    } catch (error) {
        photoContainer.textContent = `エラー: ${error.message}`;
    }
});
