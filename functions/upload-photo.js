document.getElementById('insert-photo-form').addEventListener('submit', async (event) => {
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
