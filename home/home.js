document.addEventListener("DOMContentLoaded", function() {
    console.log("ホーム画面が読み込まれました");

    // 現在のURLに基づいてフッターリンクを強調
    const path = window.location.pathname;
    const footerLinks = document.querySelectorAll("footer a");

    footerLinks.forEach(link => {
        if (link.getAttribute("href") === path) {
            link.classList.add("active");
        }
    });
});
