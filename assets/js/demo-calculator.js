/**
   DIGISTACK POS SIMULATOR & ROI CALCULATOR LOGIC
**/

// --- 1. DATA PRODUK SIMULATOR ---
const POS_DATA = {
    fnb: {
        name: "Cafe & Resto (F&B)",
        categories: ["Semua", "Minuman", "Makanan", "Dessert"],
        items: [
            { id: "f1", name: "Kopi Susu Gula Aren", price: 18000, cat: "Minuman", icon: "fa-mug-hot", bg: "#92400e" },
            { id: "f2", name: "Caramel Macchiato", price: 25000, cat: "Minuman", icon: "fa-glass-water", bg: "#d97706" },
            { id: "f3", name: "Matcha Latte", price: 22000, cat: "Minuman", icon: "fa-leaf", bg: "#15803d" },
            { id: "f4", name: "Butter Croissant", price: 20000, cat: "Dessert", icon: "fa-bread-slice", bg: "#b45309" },
            { id: "f5", name: "Truffle Fries", price: 24000, cat: "Makanan", icon: "fa-bowl-food", bg: "#ea580c" },
            { id: "f6", name: "Spaghetti Carbonara", price: 38000, cat: "Makanan", icon: "fa-utensils", bg: "#e11d48" },
            { id: "f7", name: "Waffle Ice Cream", price: 26000, cat: "Dessert", icon: "fa-ice-cream", bg: "#ec4899" },
            { id: "f8", name: "Ice Lychee Tea", price: 18000, cat: "Minuman", icon: "fa-wine-glass", bg: "#0284c7" }
        ]
    },
    retail: {
        name: "Retail & Fashion Toko",
        categories: ["Semua", "Pakaian", "Aksesoris", "Bawahan"],
        items: [
            { id: "r1", name: "Kaos Polos Heavyweight", price: 85000, cat: "Pakaian", icon: "fa-shirt", bg: "#0284c7" },
            { id: "r2", name: "Kemeja Flanel Tartan", price: 135000, cat: "Pakaian", icon: "fa-vest", bg: "#b91c1c" },
            { id: "r3", name: "Celana Chino Slimfit", price: 160000, cat: "Bawahan", icon: "fa-socks", bg: "#475569" },
            { id: "r4", name: "Tote Bag Canvas", price: 45000, cat: "Aksesoris", icon: "fa-bag-shopping", bg: "#059669" },
            { id: "r5", name: "Topi Baseball Vintage", price: 55000, cat: "Aksesoris", icon: "fa-hat-cowboy", bg: "#7c3aed" },
            { id: "r6", name: "Kaos Kaki 3in1 Pack", price: 30000, cat: "Aksesoris", icon: "fa-box", bg: "#d97706" }
        ]
    }
};

let currentMode = "fnb";
let currentCategory = "Semua";
let currentCart = {}; // { id: qty }

function formatRupiah(num) {
    return "Rp " + Number(num).toLocaleString('id-ID');
}

// --- 2. POS SIMULATOR FUNCTIONS ---
function openPosDemoModal(mode = "fnb") {
    currentMode = mode;
    currentCategory = "Semua";
    const modal = document.getElementById("posModalOverlay");
    if (!modal) return;
    
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    
    // Set active button
    document.querySelectorAll(".pos-mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
    });

    renderPosCategories();
    renderPosProducts();
    updatePosCart();
}

function closePosDemoModal() {
    const modal = document.getElementById("posModalOverlay");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    closePosReceipt();
}

function switchPosMode(mode) {
    currentMode = mode;
    currentCategory = "Semua";
    currentCart = {};
    
    document.querySelectorAll(".pos-mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
    });

    renderPosCategories();
    renderPosProducts();
    updatePosCart();
    closePosReceipt();
}

function renderPosCategories() {
    const catBar = document.getElementById("posCategoryBar");
    if (!catBar) return;
    const cats = POS_DATA[currentMode].categories;
    catBar.innerHTML = cats.map(c => `
        <button class="pos-cat-pill ${c === currentCategory ? 'active' : ''}" onclick="filterPosCategory('${c}')">
            ${c}
        </button>
    `).join('');
}

function filterPosCategory(cat) {
    currentCategory = cat;
    renderPosCategories();
    renderPosProducts();
}

function renderPosProducts() {
    const grid = document.getElementById("posProductsGrid");
    if (!grid) return;
    const items = POS_DATA[currentMode].items.filter(item => {
        return currentCategory === "Semua" || item.cat === currentCategory;
    });

    grid.innerHTML = items.map(item => `
        <div class="pos-item-card" onclick="addToPosCart('${item.id}')">
            <div>
                <div class="pos-item-icon" style="background: ${item.bg};">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="pos-item-name">${item.name}</div>
            </div>
            <div class="pos-item-price">${formatRupiah(item.price)}</div>
        </div>
    `).join('');
}

function addToPosCart(id) {
    currentCart[id] = (currentCart[id] || 0) + 1;
    updatePosCart();
}

function changePosQty(id, delta) {
    if (!currentCart[id]) return;
    currentCart[id] += delta;
    if (currentCart[id] <= 0) {
        delete currentCart[id];
    }
    updatePosCart();
}

function clearPosCart() {
    currentCart = {};
    updatePosCart();
}

function updatePosCart() {
    const list = document.getElementById("posCartList");
    const countBadge = document.getElementById("posCartCount");
    const subtotalEl = document.getElementById("posSubtotalVal");
    const taxEl = document.getElementById("posTaxVal");
    const grandEl = document.getElementById("posGrandTotalVal");
    const payBtn = document.getElementById("posPayBtn");

    if (!list) return;

    const allItems = [...POS_DATA.fnb.items, ...POS_DATA.retail.items];
    const itemMap = Object.fromEntries(allItems.map(i => [i.id, i]));

    let subtotal = 0;
    let totalItems = 0;
    const entries = Object.entries(currentCart);

    if (entries.length === 0) {
        list.innerHTML = `
            <div class="pos-empty-cart">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Keranjang masih kosong.<br>Klik menu produk di sebelah kiri untuk simulasi transaksi.</p>
            </div>
        `;
        if (countBadge) countBadge.textContent = "0";
        if (subtotalEl) subtotalEl.textContent = "Rp 0";
        if (taxEl) taxEl.textContent = "Rp 0";
        if (grandEl) grandEl.textContent = "Rp 0";
        if (payBtn) payBtn.disabled = true;
        return;
    }

    list.innerHTML = entries.map(([id, qty]) => {
        const item = itemMap[id];
        if (!item) return '';
        const lineTotal = item.price * qty;
        subtotal += lineTotal;
        totalItems += qty;

        return `
            <div class="pos-cart-item">
                <div class="pos-cart-item-info">
                    <span class="pos-cart-item-name">${item.name}</span>
                    <span class="pos-cart-item-price">${qty}x @ ${formatRupiah(item.price)} = <strong>${formatRupiah(lineTotal)}</strong></span>
                </div>
                <div class="pos-qty-controls">
                    <button class="pos-qty-btn" onclick="changePosQty('${id}', -1)">-</button>
                    <span class="pos-qty-val">${qty}</span>
                    <button class="pos-qty-btn" onclick="changePosQty('${id}', 1)">+</button>
                </div>
            </div>
        `;
    }).join('');

    const tax = Math.round(subtotal * 0.1); // PB1/PPN 10%
    const grandTotal = subtotal + tax;

    if (countBadge) countBadge.textContent = String(totalItems);
    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (taxEl) taxEl.textContent = formatRupiah(tax);
    if (grandEl) grandEl.textContent = formatRupiah(grandTotal);
    if (payBtn) payBtn.disabled = false;
}

function processPosPayment() {
    const grandEl = document.getElementById("posGrandTotalVal");
    const grandTotalText = grandEl ? grandEl.textContent : "Rp 0";
    
    const receiptModal = document.getElementById("posReceiptModal");
    const receiptItems = document.getElementById("posReceiptItems");
    const receiptTotal = document.getElementById("posReceiptTotal");
    const receiptTime = document.getElementById("posReceiptTime");
    const receiptNo = document.getElementById("posReceiptNo");
    const waCta = document.getElementById("posReceiptWaCta");

    const allItems = [...POS_DATA.fnb.items, ...POS_DATA.retail.items];
    const itemMap = Object.fromEntries(allItems.map(i => [i.id, i]));
    const entries = Object.entries(currentCart);

    if (entries.length === 0) return;

    if (receiptNo) receiptNo.textContent = "TRX-" + Math.floor(100000 + Math.random() * 900000);
    if (receiptTime) {
        const now = new Date();
        receiptTime.textContent = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    if (receiptItems) {
        receiptItems.innerHTML = entries.map(([id, qty]) => {
            const item = itemMap[id];
            if (!item) return '';
            return `
                <div class="pos-receipt-row">
                    <span>${item.name} x${qty}</span>
                    <span>${formatRupiah(item.price * qty)}</span>
                </div>
            `;
        }).join('');
    }

    if (receiptTotal) receiptTotal.textContent = grandTotalText;

    if (waCta) {
        const msg = `Halo Digistack, saya baru saja coba Interactive Demo Kasir di web untuk ${POS_DATA[currentMode].name}. Saya tertarik konsultasi pembuatan sistem kasir sekali bayar untuk usaha saya.`;
        waCta.href = `https://wa.me/6282371728447?text=${encodeURIComponent(msg)}`;
    }

    if (receiptModal) {
        receiptModal.classList.add("active");
    }
}

function closePosReceipt() {
    const receiptModal = document.getElementById("posReceiptModal");
    if (receiptModal) receiptModal.classList.remove("active");
}

function resetPosAfterReceipt() {
    closePosReceipt();
    clearPosCart();
}

// --- 3. ROI / SAVINGS CALCULATOR LOGIC ---
function updateCalculator() {
    const outletsInput = document.getElementById("calcOutlets");
    const feeInput = document.getElementById("calcMonthlyFee");

    if (!outletsInput || !feeInput) return;

    const outlets = parseInt(outletsInput.value, 10);
    const monthlyFee = parseInt(feeInput.value, 10);

    // Update Pill Labels
    const outletsVal = document.getElementById("calcOutletsVal");
    const feeVal = document.getElementById("calcMonthlyFeeVal");
    if (outletsVal) outletsVal.textContent = outlets + " Outlet";
    if (feeVal) feeVal.textContent = formatRupiah(monthlyFee) + "/bln";

    // Calculations
    const competitor1Year = outlets * monthlyFee * 12;
    const competitor3Years = competitor1Year * 3;

    // Digistack One-Time (Estimasi: 1.999.000 untuk 1-2 cabang, tambahan lisensi hemat untuk cabang berikutnya)
    const digistackCost = outlets === 1 ? 1999000 : 1999000 + ((outlets - 1) * 750000);
    
    // Savings over 3 years
    const savings3Years = Math.max(competitor3Years - digistackCost, 0);

    // Update UI Elements
    const comp1YEl = document.getElementById("calcComp1Year");
    const comp3YEl = document.getElementById("calcComp3Years");
    const digiCostEl = document.getElementById("calcDigiCost");
    const savingsAmountEl = document.getElementById("calcSavingsAmount");
    const calcCta = document.getElementById("calcCtaLink");

    if (comp1YEl) comp1YEl.textContent = formatRupiah(competitor1Year);
    if (comp3YEl) comp3YEl.textContent = formatRupiah(competitor3Years);
    if (digiCostEl) digiCostEl.textContent = formatRupiah(digistackCost);
    if (savingsAmountEl) savingsAmountEl.textContent = formatRupiah(savings3Years);

    if (calcCta) {
        const msg = `Halo Digistack, saya telah menghitung penghematan dengan ${outlets} cabang di kalkulator website. Saya tertarik beralih ke sistem kasir sekali bayar (hemat ${formatRupiah(savings3Years)}). Boleh info paket dan demonya?`;
        calcCta.href = `https://wa.me/6282371728447?text=${encodeURIComponent(msg)}`;
    }
}

// Inisialisasi saat window dimuat
document.addEventListener("DOMContentLoaded", () => {
    updateCalculator();
});
