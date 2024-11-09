// ログイン処理
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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

// モーダル操作
const modal = document.getElementById('registerModal');
const registerButton = document.getElementById('registerButton');
const closeButton = document.getElementsByClassName('close')[0];

registerButton.onclick = () => modal.style.display = 'block';
closeButton.onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

// 新規登録処理
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
