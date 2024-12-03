let map;

async function initMap() {
    const response = await fetch('/mymap-handler');
    const data = await response.json();

    const center = { lat: data.center.lat, lng: data.center.lng };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: center,
    });

    data.posts.forEach(post => {
        const marker = new google.maps.Marker({
            position: { lat: post.location.lat, lng: post.location.lng },
            map,
            icon: {
                url: post.image_url,
                scaledSize: new google.maps.Size(50, 50),
            },
        });

        marker.addListener('click', () => showPopup(post));
    });
}

function showPopup(post) {
    const popup = document.getElementById('image-popup');
    const popupImage = document.getElementById('popup-image');
    const popupCaption = document.getElementById('popup-caption');
    const popupDate = document.getElementById('popup-date');
    const popupComment = document.getElementById('popup-comment');

    popupImage.src = post.image_url;
    popupCaption.textContent = `Caption: ${post.caption || 'No caption'}`;
    popupDate.textContent = `Date: ${new Date(post.created_at).toLocaleString()}`;
    popupComment.textContent = `Comment: ${post.comment || 'No comment'}`;
    popup.classList.remove('hidden');
}

document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('image-popup').classList.add('hidden');
});

initMap();
