document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const profileImage = document.getElementById("profile_image").value;

    const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, profileImage })
    });

    const result = await response.json();
    document.getElementById("message").innerText = result.message;
});
