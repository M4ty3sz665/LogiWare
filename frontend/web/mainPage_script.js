document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Felhasználói adatok kiírása
    document.getElementById('displayUserName').textContent = user.name;
    document.getElementById('displayUserRole').textContent = user.role;
    
    loadInventory();
});

async function loadInventory() {
    const token = localStorage.getItem('token');
    
    // A Backend ProductRoutes-ból kérjük le a valódi adatokat
    const response = await fetch('/product', {
        headers: { 'Authorization': token }
    });

    const products = await response.json();
    renderTable(products);
}

function renderTable(products) {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';

    products.forEach(p => {
        tableBody.innerHTML += `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td class="text-secondary">${p.product_code}</td>
                <td><span class="badge bg-success">${p.qty} db</span></td>
                <td>${p.loc || 'Nincs megadva'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">🗑️</button>
                </td>
            </tr>`;
    });
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}