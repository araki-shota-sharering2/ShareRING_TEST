document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch('/register-handler', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert('登録に成功しました！');
        } else {
            alert('登録に失敗しました: ' + result.message);
        }
    } catch (error) {
        console.error('エラー:', error);
        alert('登録中にエラーが発生しました。');
    }
});
