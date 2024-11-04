document.addEventListener('DOMContentLoaded', async () => {
    const photoContainer = document.getElementById('photo-container');

    try {
        const response = await fetch('/');
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const { photo } = await response.json();
        photo.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('photo-item');
            div.innerHTML = `<img src="${item.url}" alt="Uploaded Image"> <button data-id="${item.id}">削除</button>`;
            photoContainer.appendChild(div);

            div.querySelector('button').addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                try {
                    const deleteResponse = await fetch('/', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ table: 'photo', id }),
                    });
                    if (deleteResponse.ok) {
                        e.target.parentElement.remove();
                        alert('画像を削除しました');
                    } else {
                        throw new Error('削除に失敗しました');
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
