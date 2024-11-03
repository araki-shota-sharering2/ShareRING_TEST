document.addEventListener('DOMContentLoaded', async () => {
    const photoForm = document.getElementById('photo-form');
    const photoContainer = document.getElementById('photo-container');

    // 画像投稿フォームの送信イベント
    photoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('photo-id').value;
        const file = document.getElementById('photo-file').files[0];

        if (!file) {
            alert('画像を選択してください');
            return;
        }

        console.log('ID:', id);
        console.log('File selected:', file);

        const formData = new FormData();
        formData.append('id', id);
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
                console.error('Image upload failed:', response);
                throw new Error('画像の投稿に失敗しました');
            }
        } catch (error) {
            console.error('Error during image upload:', error);
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
            div.innerHTML = `<img src="data:image/jpeg;base64,${photo.blog}" alt="Uploaded Image"> <button data-id="${photo.id}">削除</button>`;
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
