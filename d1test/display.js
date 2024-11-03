document.addEventListener('DOMContentLoaded', async () => {
    const dataContainer = document.getElementById('data-container');
    const insertForm = document.getElementById('insert-form');
    const photoForm = document.getElementById('photo-form');
    const photoContainer = document.getElementById('photo-container');

    // データ取得
    try {
        const response = await fetch('/');
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const data = await response.json();
        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('data-item');
            div.textContent = `ID: ${item.id}, Name: ${item.name}`;
            dataContainer.appendChild(div);
        });
    } catch (error) {
        dataContainer.textContent = `エラー: ${error.message}`;
    }

    // 挿入フォームの送信イベント
    insertForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (response.ok) {
                alert('データを挿入しました');
                location.reload(); // ページをリロードして更新
            } else {
                throw new Error('挿入に失敗しました');
            }
        } catch (error) {
            alert(`エラー: ${error.message}`);
        }
    });

    // 画像投稿フォームの送信イベント
    photoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('photo-title').value;
        const file = document.getElementById('photo-file').files[0];

        if (!file) {
            alert('画像を選択してください');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);

        try {
            const response = await fetch('/upload-photo', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                alert('画像を投稿しました');
                location.reload(); // ページをリロードして更新
            } else {
                throw new Error('画像の投稿に失敗しました');
            }
        } catch (error) {
            alert(`エラー: ${error.message}`);
        }
    });

    // 画像表示の取得
    try {
        const response = await fetch('/photos');
        if (!response.ok) {
            throw new Error('画像の取得に失敗しました');
        }

        const photos = await response.json();
        photos.forEach(photo => {
            const div = document.createElement('div');
            div.classList.add('photo-item');
            div.innerHTML = `<h3>${photo.title}</h3><img src="${photo.url}" alt="${photo.title}">`;
            photoContainer.appendChild(div);
        });
    } catch (error) {
        photoContainer.textContent = `エラー: ${error.message}`;
    }
});
