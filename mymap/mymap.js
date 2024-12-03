let map;

async function initMap() {
  try {
    const response = await fetch('/mymap-handler'); // ハンドラーからデータを取得
    if (!response.ok) throw new Error('Failed to fetch map data');

    const posts = await response.json();

    if (!posts.length) {
      alert('投稿が見つかりませんでした。');
      return;
    }

    // 初期の地図の中心を最初の投稿に設定
    const center = { lat: posts[0].location.lat, lng: posts[0].location.lng };
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: center,
    });

    // 各投稿を地図上に表示
    posts.forEach(post => {
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

// 地図を初期化
initMap();
