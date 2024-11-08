document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // サーバーにログインリクエストを送信
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (result.success) {
        window.location.href = '/home';
    } else {
        document.getElementById('loginMessage').textContent = result.message || 'ログインに失敗しました';
    }
});
