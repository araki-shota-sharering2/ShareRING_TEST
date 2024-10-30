const apiKey = '9b28e55e1ae27eecbf9ff7abd481851a';

document.addEventListener("DOMContentLoaded", function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('city-name').textContent = "位置情報がサポートされていません。";
    }
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeather(lat, lon);
}

function showError(error) {
    document.getElementById('city-name').textContent = `位置情報を取得できません: ${error.message}`;
}

function fetchWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => console.error('エラー:', error));
}

function displayWeather(data) {
    if (data.cod === 200) {
        const now = new Date();
        document.getElementById('date').textContent = now.toLocaleDateString("ja-JP", { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('time').textContent = `更新: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        document.getElementById('city-name').textContent = data.name;
        document.getElementById('temperature').textContent = `${data.main.temp}°C`;
        document.getElementById('description').textContent = `${data.weather[0].description}`;
        document.getElementById('humidity').textContent = `湿度: ${data.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `風速: ${data.wind.speed} m/s`;
        document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    } else {
        document.getElementById('city-name').textContent = '天気情報を取得できません';
    }
}
