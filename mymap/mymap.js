let map;

async function initMap() {
  try {
    const response = await fetch('/mymap-handler');
    if (!response.ok) throw new Error('Failed to fetch map data');

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

      marker.addListener('click', () => showPostDetails(post));
    });
  } catch (error) {
    console.error("Error loading map:", error.message);
  }
}

function showPostDetails(post) {
  const detailsPanel = document.getElementById('details-panel');
  const detailsImage = document.getElementById('details-image');
  const postCaption = document.getElementById('post-caption');
  const postDate = document.getElementById('post-date');

  detailsImage.src = post.image_url;
  postCaption.textContent = `キャプション: ${post.caption || 'なし'}`;
  postDate.textContent = `投稿日: ${new Date(post.created_at).toLocaleString()}`;
  detailsPanel.classList.remove('hidden');
}

document.getElementById('close-details').addEventListener('click', () => {
  document.getElementById('details-panel').classList.add('hidden');
});

initMap();
