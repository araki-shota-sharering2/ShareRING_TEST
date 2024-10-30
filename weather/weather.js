const apiKey = '9b28e55e1ae27eecbf9ff7abd481851a'; // OpenWeatherMapのAPIキーをここに入力

document.getElementById('fetch-weather').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        fetchWeather(city);
    }
});

function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => console.error('Error:', error));
}

function displayWeather(data) {
    if (data.cod === 200) {
        document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
        document.getElementById('description').textContent = `Weather: ${data.weather[0].description}`;
        document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    } else {
        document.getElementById('temperature').textContent = 'City not found';
        document.getElementById('description').textContent = '';
        document.getElementById('humidity').textContent = '';
    }
}
// 特定のボタンのイベントリスナーの設定
document.addEventListener("DOMContentLoaded", function() {
    // 必要に応じてJavaScriptで機能を拡張
    console.log("ホーム画面が読み込まれました");
});
