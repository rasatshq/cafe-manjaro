// ================= ELEMENT =================
const cartToggle = document.getElementById("cart-toggle");
const cartModal = document.getElementById("cart-modal");
const closeModal = document.querySelector(".close-modal");
const cartItemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const cartCountEl = document.getElementById("cart-count");
const checkoutBtn = document.getElementById("checkout-btn");

const invoiceModal = document.getElementById("invoice-modal");
const invoiceDetail = document.getElementById("invoice-detail");

const customerNameInput = document.getElementById("customer-name");
const tableNumberInput = document.getElementById("table-number");

// ================= DATA =================
let cart = [];

// ================= OPEN / CLOSE MODAL =================
cartToggle.onclick = () => {
  cartModal.style.display = "flex";
};

closeModal.onclick = () => {
  cartModal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = "none";
  }
};

// ================= ADD TO CART =================
document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);

    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
      existingItem.qty++;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    renderCart();
  });
});

// ================= RENDER CART =================
function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    count += item.qty;

    cartItemsEl.innerHTML += `
      <li>
        <div>
          <strong>${item.name}</strong><br>
          Rp ${item.price.toLocaleString("id-ID")}
        </div>
        <div class="qty-control">
          <button onclick="changeQty(${index}, -1)">➖</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${index}, 1)">➕</button>
        </div>
      </li>
    `;
  });

  totalPriceEl.textContent = total.toLocaleString("id-ID");
  cartCountEl.textContent = count;
}

// ================= CHANGE QTY =================
window.changeQty = (index, value) => {
  cart[index].qty += value;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  renderCart();
};

// ================= CHECKOUT (VALIDASI) =================
checkoutBtn.onclick = () => {
  const customerName = customerNameInput.value.trim();
  const tableNumber = tableNumberInput.value.trim();

  if (!customerName || !tableNumber) {
    alert("Nama dan Nomor Meja wajib diisi!");
    return;
  }

  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  generateInvoice(customerName, tableNumber);
};

// ================= INVOICE + QR =================
function generateInvoice(customerName, tableNumber) {
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;
  });

  // KIRIM KE PHP SETELAH TOTAL ADA
  fetch("save_order.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: customerName,
      table_number: tableNumber,
      total: total,
      items: cart,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Response PHP:", data);
    })
    .catch((err) => console.error(err));

  // TAMPILKAN INVOICE
  cartModal.style.display = "none";
  invoiceModal.style.display = "flex";

  let html = `
    <p><strong>Nama:</strong> ${customerName}</p>
    <p><strong>Meja:</strong> ${tableNumber}</p>
    <hr><ul>
  `;

  cart.forEach((item) => {
    html += `<li>${item.name} x${item.qty}</li>`;
  });

  html += `</ul><h3>Total: Rp ${total.toLocaleString("id-ID")}</h3>`;
  invoiceDetail.innerHTML = html;

  document.getElementById("qrcode").innerHTML = "";
  new QRCode("qrcode", {
    text: `Cafe Manjaro | Total Rp ${total}`,
    width: 180,
    height: 180,
  });
}
