async function handleLogin() {
    const name = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('token', data.token); // Ezt küldjük majd a fejlécben
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'mainPage.html';
    } else {
        alert(data.message);
    }
}