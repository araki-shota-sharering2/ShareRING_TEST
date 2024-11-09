document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login-handler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert('ログイン成功');
            window.location.href = '/home/home.html';  // ログイン後の遷移先
        } else {
            alert('ログイン失敗: ' + result.message);
        }
    } catch (error) {
        console.error('エラー:', error);
        alert('ログイン中にエラーが発生しました');
    }
});
