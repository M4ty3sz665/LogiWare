// Globális modal változók
let productModal, orderModal;

document.addEventListener('DOMContentLoaded', () => {
    // Felhasználói infók beállítása a localStorage-ból
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = user.role;
    }

    // Modalok inicializálása
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    orderModal = new bootstrap.Modal(document.getElementById('orderModal'));

    // Kezdő adatok betöltése
    loadInventory();
});

// --- NAVIGÁCIÓ ---
function showSection(section) {
    const inv = document.getElementById('section-inventory');
    const ord = document.getElementById('section-orders');
    const btnInv = document.getElementById('btn-inventory');
    const btnOrd = document.getElementById('btn-orders');

    if (section === 'inventory') {
        inv.style.display = 'block';
        ord.style.display = 'none';
        btnInv.classList.add('active');
        btnOrd.classList.remove('active');
        loadInventory();
    } else {
        inv.style.display = 'none';
        ord.style.display = 'block';
        btnInv.classList.remove('active');
        btnOrd.classList.add('active');
        loadOrders();
    }
}

// --- KÉSZLET KEZELÉS ---
async function loadInventory() {
    const response = await fetch('/product', {
        headers: { 'Authorization': localStorage.getItem('token') }
    });
    const products = await response.json();
    const table = document.getElementById('inventoryTable');
    table.innerHTML = '';

    products.forEach(p => {
        table.innerHTML += `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.product_code}</td>
                <td>${p.price_net.toLocaleString()} Ft</td>
                <td><span class="badge ${p.qty < 5 ? 'bg-danger' : 'bg-success'}">${p.qty} db</span></td>
                <td>${p.loc || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function openProductModal() {
    productModal.show();
}

async function saveProduct() {
    const data = {
        name: document.getElementById('pName').value,
        product_code: document.getElementById('pCode').value,
        price_net: parseInt(document.getElementById('pPrice').value),
        price_gross: parseInt(document.getElementById('pPrice').value) * 1.27, // Egyszerűsített bruttó
        qty: parseInt(document.getElementById('pQty').value),
        loc: document.getElementById('pLoc').value
    };

    const response = await fetch('/product', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        productModal.hide();
        loadInventory();
    } else {
        alert("Hiba történt a mentés során.");
    }
}

async function deleteProduct(id) {
    if (!confirm("Biztosan törlöd a terméket?")) return;
    await fetch(`/product/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': localStorage.getItem('token') }
    });
    loadInventory();
}

// --- RENDELÉS KEZELÉS ---
async function openOrderModal() {
    const token = localStorage.getItem('token');
    
    // Cégek betöltése a legördülőbe
    const cRes = await fetch('/clientcompany', { headers: { 'Authorization': token }});
    const clients = await cRes.json();
    document.getElementById('oClient').innerHTML = clients.map(c => `<option value="${c.id}">${c.company_name}</option>`).join('');

    // Termékek betöltése a legördülőbe
    const pRes = await fetch('/product', { headers: { 'Authorization': token }});
    const products = await pRes.json();
    document.getElementById('oProduct').innerHTML = products.map(p => `<option value="${p.id}">${p.name} (${p.qty} db raktáron)</option>`).join('');

    orderModal.show();
}

async function submitOrder() {
    const data = {
        company_id: document.getElementById('oClient').value,
        due_date: document.getElementById('oDeadline').value,
        payment_method: document.getElementById('oPayment').value,
        items: [{
            product_id: document.getElementById('oProduct').value,
            amount: parseInt(document.getElementById('oAmount').value)
        }]
    };

    const response = await fetch('/order', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
        alert("Rendelés rögzítve, készlet levonva!");
        orderModal.hide();
        loadInventory();
    } else {
        alert("Hiba: " + result.message);
    }
}

async function loadOrders() {
    const response = await fetch('/order', {
        headers: { 'Authorization': localStorage.getItem('token') }
    });
    const orders = await response.json();
    const table = document.getElementById('ordersTable');
    table.innerHTML = '';

    orders.forEach(o => {
        table.innerHTML += `
            <tr>
                <td>#${o.id}</td>
                <td>Cég ID: ${o.company_id}</td>
                <td>${o.due_date}</td>
                <td>${o.payment_method}</td>
                <td><span class="badge bg-info">${o.status}</span></td>
            </tr>
        `;
    });
}

// --- KIJELENTKEZÉS ---
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}