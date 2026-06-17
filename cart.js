document.addEventListener("DOMContentLoaded", () => {
    // Inject cart modal HTML
    const cartHTML = `
    <div id="cart-modal" class="fixed inset-0 bg-black/50 z-[100] hidden flex justify-end">
        <div class="bg-surface-container w-full max-w-md h-full flex flex-col p-6 shadow-2xl translate-x-full transition-transform duration-300 overflow-y-auto" id="cart-drawer">
            <div class="flex justify-between items-center mb-8">
                <h2 class="font-headline-md text-on-surface">Your Bag</h2>
                <button id="close-cart" class="text-zinc-400 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div id="cart-items" class="flex-grow flex flex-col gap-4 overflow-y-auto">
                <!-- Cart items will be injected here -->
            </div>
            <div class="mt-8 border-t border-outline-variant pt-6">
                <div class="flex justify-between mb-6 font-label-lg text-on-surface">
                    <span>Total</span>
                    <span id="cart-total">R0.00</span>
                </div>
                <button id="checkout-whatsapp" class="w-full py-4 bg-primary text-on-primary-fixed font-label-lg uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    Checkout on WhatsApp
                </button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', cartHTML);

    const cartModal = document.getElementById('cart-modal');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-whatsapp');
    
    // Find cart icons
    const cartIcons = document.querySelectorAll('.material-symbols-outlined');
    cartIcons.forEach(icon => {
        if (icon.textContent.trim() === 'shopping_bag' || icon.getAttribute('data-icon') === 'shopping_bag') {
            icon.classList.add('cursor-pointer');
            icon.addEventListener('click', openCart);
        }
    });

    closeCartBtn.addEventListener('click', closeCart);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeCart();
    });

    let cart = JSON.parse(localStorage.getItem('ubuhle_cart') || '[]');

    function saveCart() {
        localStorage.setItem('ubuhle_cart', JSON.stringify(cart));
    }

    function openCart() {
        renderCart();
        cartModal.classList.remove('hidden');
        setTimeout(() => cartDrawer.classList.remove('translate-x-full'), 10);
    }

    function closeCart() {
        cartDrawer.classList.add('translate-x-full');
        setTimeout(() => cartModal.classList.add('hidden'), 300);
    }

    function formatPrice(price) {
        return 'R' + parseFloat(price).toFixed(2);
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-zinc-500 text-center mt-10 font-body-md">Your bag is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                cartItemsContainer.innerHTML += `
                    <div class="flex gap-4 items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                        <div class="flex-grow">
                            <h4 class="font-label-lg text-on-surface">${item.name}</h4>
                            <p class="font-label-sm text-primary mt-1">${formatPrice(item.price)} x ${item.quantity}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center border border-outline-variant rounded">
                                <button class="px-2 text-zinc-400 hover:text-white" onclick="window.updateCartQuantity(${index}, -1)">-</button>
                                <span class="font-label-sm px-2">${item.quantity}</span>
                                <button class="px-2 text-zinc-400 hover:text-white" onclick="window.updateCartQuantity(${index}, 1)">+</button>
                            </div>
                            <button class="text-error hover:opacity-80" onclick="window.removeFromCart(${index})">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        cartTotalEl.textContent = formatPrice(total);
    }

    window.updateCartQuantity = (index, delta) => {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        renderCart();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    };

    // Attach Add to Bag listeners
    const addButtons = document.querySelectorAll('button');
    addButtons.forEach(btn => {
        if (btn.textContent.trim().toLowerCase() === 'add to bag') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Find product details
                let container = btn.closest('.group') || btn.closest('.grid') || btn.parentElement.parentElement;
                
                let nameEl = container.querySelector('h3 a') || container.querySelector('h1') || container.querySelector('h3');
                let priceEl = container.querySelector('p.text-primary') || container.querySelector('p.text-zinc-500') || container.querySelector('.text-headline-md');
                
                if (!nameEl) return;
                
                let name = nameEl.textContent.trim();
                let priceText = priceEl ? priceEl.textContent.trim() : "0";
                let price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

                let existing = cart.find(i => i.name === name);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ name, price, quantity: 1 });
                }
                saveCart();
                openCart();
            });
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        let text = "Hi, I would like to place an order for the following items:\n\n";
        let total = 0;
        cart.forEach(item => {
            text += `- ${item.name} (x${item.quantity}): ${formatPrice(item.price * item.quantity)}\n`;
            total += item.price * item.quantity;
        });
        text += `\nTotal: ${formatPrice(total)}\n\nPlease assist me with the checkout process.`;
        
        const phone = "27611103073";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });
});
