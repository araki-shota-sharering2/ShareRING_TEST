let map, marker, currentPosition;

document.addEventListener("DOMContentLoaded", async () => {
    const mapElement = document.getElementById("map");

    // Initialize Google Map
    map = new google.maps.Map(mapElement, {
        center: { lat: 35.6895, lng: 139.6917 }, // Default center: Tokyo
        zoom: 14,
    });

    // Get current position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            currentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            map.setCenter(currentPosition);

            // Add draggable marker
            marker = new google.maps.Marker({
                position: currentPosition,
                map: map,
                draggable: true,
            });
        });
    }

    // Load health info
    loadHealthInfo();

    // Save health info
    document.getElementById("health-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const height = parseFloat(document.getElementById("height").value);
        const weight = parseFloat(document.getElementById("weight").value);

        const response = await fetch("/save_health_info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ height, weight }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Health info saved!");
        } else {
            alert("Error saving health info: " + data.message);
        }
    });

    // Calculate distance and calories
    document.getElementById("calculate-button").addEventListener("click", async () => {
        if (!marker) {
            alert("Marker is not set!");
            return;
        }

        const destination = marker.getPosition();
        const origin = currentPosition;

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat()},${destination.lng()}&key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8`
        );

        const data = await response.json();
        if (data.rows[0].elements[0].status === "OK") {
            const distance = data.rows[0].elements[0].distance.value / 1000; // km
            const activityType = "walking"; // Example: static type

            const calorieResponse = await fetch("/calculate_calories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ distance, activityType }),
            });

            const calorieData = await calorieResponse.json();
            if (calorieResponse.ok) {
                document.getElementById("result").innerHTML = `
                    <p>Distance: ${distance.toFixed(2)} km</p>
                    <p>Calories Burned: ${calorieData.caloriesBurned} kcal</p>
                `;
            } else {
                document.getElementById("result").innerHTML = `<p>Error: ${calorieData.message}</p>`;
            }
        } else {
            document.getElementById("result").innerHTML = `<p>Could not calculate distance.</p>`;
        }
    });
});

// Load user health info
async function loadHealthInfo() {
    const response = await fetch("/get_health_info");
    if (response.ok) {
        const { height, weight } = await response.json();
        document.getElementById("height").value = height || "";
        document.getElementById("weight").value = weight || "";
    }
}
