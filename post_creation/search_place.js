document.addEventListener("DOMContentLoaded", () => {
    initMap();

    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", handleSearch);
});

let userLocation;

function initMap() {
    const locationDisplay = document.getElementById("currentLocation");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                locationDisplay.textContent = "";

                const spots = await findNearbyPlaces(userLocation);
                displaySpots(spots, userLocation);
            },
            (error) => {
                locationDisplay.textContent = "現在地を取得できませんでした";
                console.error("位置情報の取得に失敗しました", error);
            }
        );
    } else {
        locationDisplay.textContent = "ブラウザが位置情報サービスに対応していません";
    }
}

async function findNearbyPlaces(location, keyword = null) {
    return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(document.createElement("div"));
        const request = {
            location: location,
            radius: 200,
            keyword: keyword,
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else {
                reject(`Nearby Searchに失敗しました: ${status}`);
            }
        });
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
}

function displaySpots(spots, userLocation) {
    const spotsList = document.getElementById("spotsList");
    spotsList.innerHTML = "";

    spots.forEach((spot) => {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            spot.geometry.location.lat(),
            spot.geometry.location.lng()
        );

        const listItem = document.createElement("li");
        listItem.classList.add("spot-item");
        listItem.onclick = () => selectSpot(spot);

        const iconType = getIconType(spot.types);

        listItem.innerHTML = `
            <img src="/assets/images/post_creation/${iconType}.svg" alt="icon">
            <div class="info">
                <h2>${spot.name}</h2>
                <p>${spot.vicinity}</p>
            </div>
            <span class="distance">${distance.toFixed(0)} m</span>
        `;

        spotsList.appendChild(listItem);
    });
}

function handleSearch() {
    const keyword = document.getElementById("searchInput").value;
    if (keyword) {
        findNearbyPlaces(userLocation, keyword)
            .then((spots) => displaySpots(spots, userLocation))
            .catch((error) => console.error(error));
    }
}

function selectSpot(spot) {
    const selectedLocation = {
        name: spot.name,
        latitude: spot.geometry.location.lat(),
        longitude: spot.geometry.location.lng(),
    };

    localStorage.setItem("selectedLocation", JSON.stringify(selectedLocation));
    window.location.href = "/post_creation/post_creation.html";
}

function getIconType(types) {
    const typeMapping = {
        restaurant: "restaurant",
        cafe: "cafe",
        park: "park",
        museum: "museum",
        hospital: "hospital",
        store: "store",
        shopping_mall: "shopping_mall",
        supermarket: "supermarket",
        train_station: "train_station",
        bus_station: "bus_station",
        airport: "airport",
    };

    for (const type of types) {
        if (typeMapping[type]) {
            return typeMapping[type];
        }
    }

    return "default";
}
