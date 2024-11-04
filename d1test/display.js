document.addEventListener('DOMContentLoaded', async () => {
    const dataContainer = document.getElementById('data-container');
    const photoForm = document.getElementById('insert-photo-form');
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
                        body: JSON.stringify({ id }),
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
        dataContainer.textContent = `エラー: ${error.message}`;
    }

    photoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('photo-id').value;
        const file = document.getElementById('photo-file').files[0];

        if (!file) {
            alert('画像を選択してください');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload-photo', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Photo-ID': id
                }
            });
            if (response.ok) {
                alert('画像を投稿しました');
                location.reload();
            } else {
                throw new Error('画像の投稿に失敗しました');
            }
        } catch (error) {
            alert(`エラー: ${error.message}`);
        }
    });
});
