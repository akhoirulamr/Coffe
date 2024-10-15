document.addEventListener('alpine:init', () => {
  Alpine.data('products', () => ({
    items: [
      { id: 1, name: 'Robusta', img: '4.jpg', price: 20000 },
      { id: 2, name: 'Torabika', img: 'image 3.jpg', price: 20500 },
      { id: 3, name: 'Nescafe', img: 'image 7.jpg', price: 30500 },
      { id: 4, name: 'Dalgona', img: 'image 8.jpg', price: 50000 },
      { id: 5, name: 'Opang', img: 'image 9.jpg', price: 10000 },
    ],
  }));

  Alpine.store('cart', {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // Cek barang yang sama
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika sudah ada, sama barang atau tidak
        this.items = this.items.map((item) => {
          // jika barang beda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sama
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += newItem.price;
            return item;
          }
        });
      }
      console.log(this.total);
    },
    remove(id) {
      // ambil itemnya
      const cartItem = this.items.find((item) => item, id === id);

      // jika item dari satu
      if (cartItem.quantity > 1) {
        this.items = this.items.map((item) => {
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// form validation

const checkOutButton = document.querySelector('.checkout-button');
checkOutButton.disabled = true;

const form = document.querySelector('#checkoutForm');
form.addEventListener('keyup', function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkOutButton.classList.remove('disabled');
      checkOutButton.classList.add('disabled');
    } else {
      return false;
    }
  }
  checkOutButton.disabled = false;
  checkOutButton.classList.remove('disabled');
});

// kirim data checkout

checkOutButton.addEventListener('click', async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMessage(objData);
  // window.open('http://wa.me/6285886613539?text=' + encodeURIComponent(message));

  // minta transaction token

  try {
    const response = await fetch('php/placeOrder.php', {
      method: 'POST',
      body: data,
    });
    const token = await response.text();
    // console.log(token);

    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// pesan WA

const formatMessage = (obj) => {
  return `Data Customer
      Nama: ${obj.name}
      Email: ${obj.email}
      No HP: ${obj.phone}
      Data Pesanan
      ${JSON.parse(obj.items).map((item) => `${item.name}(${item.quantity} X ${rupiah(item.total)})\n`)}
      TOTAL: ${rupiah(obj.total)}
      Terima kasih.`;
};

// Konversi Rupiah

const rupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};
