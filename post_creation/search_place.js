function displaySpots(spots, userLocation) {
    const spotsList = document.getElementById("spotsList");
    spotsList.innerHTML = "";

    // 現在地を利用したカスタムスポットを追加
    const customSpot = document.createElement("li");
    customSpot.classList.add("spot-item");

    customSpot.innerHTML = `
        <img src="/assets/images/post_creation/default.svg" alt="icon">
        <div class="info">
            <h2>カスタムスポット</h2>
            <p>現在地を利用してスポット名を入力できます</p>
            <input type="text" id="customSpotName" placeholder="スポット名を入力">
        </div>
        <button id="customSpotButton">選択</button>
    `;

    const customButton = customSpot.querySelector("#customSpotButton");
    customButton.onclick = () => {
        const customName = document.getElementById("customSpotName").value.trim();
        if (customName) {
            const selectedLocation = {
                name: customName,
                latitude: userLocation.lat,
                longitude: userLocation.lng,
            };

            localStorage.setItem("selectedLocation", JSON.stringify(selectedLocation));
            window.location.href = "/post_creation/post_creation.html";
        } else {
            alert("スポット名を入力してください！");
        }
    };

    spotsList.appendChild(customSpot);

    // 取得したスポットを表示
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
