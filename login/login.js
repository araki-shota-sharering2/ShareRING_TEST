document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            document.getElementById('registerMessage').textContent = '登録が完了しました。ログインしてください。';
            modal.style.display = 'none';
        } else {
            document.getElementById('registerMessage').textContent = result.message || '登録に失敗しました';
        }
    } catch (error) {
        console.error(error);
        document.getElementById('registerMessage').textContent = '登録時にエラーが発生しました。';
    }
});
