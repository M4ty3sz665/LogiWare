async function handleRegister() {
    const userData = {
        name: document.getElementById('regUser').value, // Backend ezt 'name'-ként várja
        password: document.getElementById('regPass').value,
        email: document.getElementById('regEmail').value,
        phone: "06301234567", // Itt adj hozzá egy alap értéket vagy inputot
        role: document.getElementById('regRole').value,
        admin: false
    };

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    alert(result.message);
    if (response.ok) window.location.href = 'login.html';
}