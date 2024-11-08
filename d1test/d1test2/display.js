document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload-photo', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        document.getElementById('response').textContent = result.message;
    } catch (error) {
        document.getElementById('response').textContent = 'Upload failed';
    }
});
