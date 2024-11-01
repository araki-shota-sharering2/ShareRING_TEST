document.addEventListener("DOMContentLoaded", function() {
    const apiKey = '9b28e55e1ae27eecbf9ff7abd481851a'; // OpenWeatherMapのAPIキー
    const googleMapsApiKey = 'AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8'; // Google Maps APIキー

    // 現在の位置情報を取得して天気データを取得する
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('city-name').textContent = "位置情報がサポートされていません。";
    }

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchCurrentWeather(lat, lon);
        fetchWeeklyForecast(lat, lon);
        fetchLocationName(lat, lon);
    }

    function showError(error) {
        document.getElementById('city-name').textContent = `位置情報を取得できません: ${error.message}`;
    }

    function fetchLocationName(lat, lon) {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleMapsApiKey}&language=ja`;

        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === "OK" && data.results[0]) {
                    const addressComponents = data.results[0].address_components;
                    const prefecture = addressComponents.find(component => component.types.includes("administrative_area_level_1"))?.long_name || "";
                    const city = addressComponents.find(component => component.types.includes("locality"))?.long_name || "";
                    document.getElementById('city-name').textContent = `${prefecture} ${city}`;
                } else {
                    document.getElementById('city-name').textContent = '位置情報を取得できません';
                }
            })
            .catch(error => console.error('エラー:', error));
    }

    function fetchCurrentWeather(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

        fetch(url)
            .then(response => response.json())
            .then(data => displayCurrentWeather(data))
            .catch(error => console.error('エラー:', error));
    }

    function displayCurrentWeather(data) {
        if (data.cod === 200) {
            const date = new Date();
            const options = { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'long' };
            document.getElementById('date-time').textContent = `${date.toLocaleDateString("ja-JP", options)} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} 更新`;

            document.getElementById('temperature').textContent = `${data.main.temp}°C`;
            document.getElementById('description').textContent = `天気: ${data.weather[0].description}`;
            document.getElementById('humidity').textContent = `湿度: ${data.main.humidity}%`;
            document.getElementById('wind-speed').textContent = `風速: ${data.wind.speed} m/s`;
            document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        } else {
            document.getElementById('city-name').textContent = '天気情報を取得できません';
        }
    }

    function fetchWeeklyForecast(lat, lon) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => displayWeeklyForecast(data))
            .catch(error => console.error('エラー:', error));
    }

    function displayWeeklyForecast(data) {
        const forecastContainer = document.getElementById('forecast');
        forecastContainer.innerHTML = ''; // 一度クリア

        const days = {};

        // 各日の12:00のデータのみを取得して表示
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString("ja-JP", { weekday: 'short', month: 'numeric', day: 'numeric' });
            const hour = date.getHours();

            if (hour === 12 && !days[day]) {
                days[day] = item;

                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-item');
                forecastItem.innerHTML = `
                    <p>${day}</p>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
                    <p>${item.main.temp}°C</p>
                `;
                forecastContainer.appendChild(forecastItem);
            }
        });
    }

    // 星をランダムに配置
    const body = document.querySelector('body');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        body.appendChild(star);
    }
});
