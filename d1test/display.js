document.addEventListener('DOMContentLoaded', async () => {
    const dataContainer = document.getElementById('data-container');
    const insertForm = document.getElementById('insert-form');

    try {
        const response = await fetch('/');
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const data = await response.json();
        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('data-item');
            div.innerHTML = `ID: ${item.id}, Name: ${item.name} <button data-id="${item.id}">削除</button>`;
            dataContainer.appendChild(div);

            // 削除ボタンのイベントリスナー
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
                        alert('データを削除しました');
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
});
