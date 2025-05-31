document.addEventListener('DOMContentLoaded', function() {

    displayMenuItems('Featured-menu');
    

    categoryButtons.forEach(btn => {
        if (btn.dataset.category === 'combo-meal') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});
        const categoryButtons = document.querySelectorAll('.category-button');
        const menuItemsContainer = document.querySelector('.menu-items-container');
        const featuredHeading = document.querySelector('.featured-heading');
        
       
        const allMenuItemsData = [
            

            { name: "FB4", details: "1 Jumbo Litson Manok 6 BBQ 1 Bangus Pork/Chicken Sisig kare kare dish 6 Plain Rice Softdrinks 1.5L", price: "₱1000.00", category: "Featured-menu" },
            { name: "HALO HALO SPECIAL", details: "SERVED WITH SPECIAL TOPPINGS", price: "₱110.00", category: "Featured-menu" },
            { name: "JUMBO SIZE", details: "LITSON MANOK", price: "₱231.00", category: "Featured-menu" },
            { name: "V3",details: "GOOD FOR 20 PERSONS",price: "₱1100.00", category: "Featured-menu" }, 
            { name: "REGULAR LECHON", details: "25 KILOS", price: "₱5400.00", category: "Featured-menu" },
            { name: "FB6", details: "1 Jumbo Litson Manok 10 BBQ 1 Crispy pata 1 Bangus Pork/Chicken Sisig Kare-Kare Dish Chopsuey Dish Mixed seafood Pancit 10 Plain Rice Softdrinks 1.5L", price: "₱1850.00", category: "Family-treats" },           
            { name: "C4", details: "1 QUARTER LITSON MANOK CHOPSUEY GARLIC RICE SOFTDRINKS (MISMO)", price: "₱125.00", category: "Featured-menu" },
            
            //Combo meal    
            { name: "C1", details: "1 PC. BBQ 1 PC. VALENCIANA SOFTDRINKS(MISMO)", price: "₱120.00", category: "combo-meal" },
            { name: "C2", details: "1 PC. BBQ 1 PC. VALENCIANA CHOPSUEY SOFTDRINKS(MISMO)", price: "₱120.00", category: "combo-meal" },
            { name: "C3", details: "1 QUARTER LITSON MANOK 1 PC. BBQ  GARLIC RICE SOFTDRINKS(MISMO)", price: "₱120.00", category: "combo-meal" },
            { name: "C4", details: "1 QUARTER LITSON MANOK CHOPSUEY GARLIC RICE SOFTDRINKS (MISMO)", price: "₱125.00", category: "combo-meal" },
            
            //family treats
             { name: "FB1", details: "1 Jumbo Litson Manok 6 BBQ 1 Bangus Chopsuey Dish 6 Plain Rice Softdrinks 1.5L", price: "₱800.00", category: "Family-treats" },
            { name: "FB2", details: "1 Jumbo Litson Manok 1 liempo 6 BBQ kare kare dish Dish 6 Plain Rice Softdrinks 1.5L", price: "₱880.00", category: "Family-treats" },
            { name: "FB3", details: "1 Jumbo Litson Manok 6 BBQ Pork/Chicken Sisig mixed seafood Chopsuey dish 6 Plain Rice Softdrinks 1.5L", price: "₱990.00", category: "Family-treatsl" },
            { name: "FB4", details: "1 Jumbo Litson Manok 6 BBQ 1 Bangus Pork/Chicken Sisig kare kare dish 6 Plain Rice Softdrinks 1.5L", price: "₱1000.00", category: "Family-treatsl" },
            { name: "FB5", details: "1 Jumbo Litson Manok 10 BBQ 1 Bangus Pork/Chicken Sisig Kare-Kare Dish Chopsuey Dish Pancit 10 Plain Rice Softdrinks 1.5L", price: "₱1550.00", category: "Family-treats" },
            { name: "FB6", details: "1 Jumbo Litson Manok 10 BBQ 1 Crispy pata 1 Bangus Pork/Chicken Sisig Kare-Kare Dish Chopsuey Dish Mixed seafood Pancit 10 Plain Rice Softdrinks 1.5L", price: "₱1850.00", category: "Family-treats" },

        // SILOG items
            { name: "LONGSILOG", details: "LONGGANISA EGG FRIED RICE", price: "₱80.00", category: "silog" },
            { name: "PORKSILOG", details: "PORKCHOP EGG FRIED RICE", price: "₱90.00", category: "silog" },
            { name: "HOTSILOG", details: "HOTDOG EGG FRIED RICE", price: "₱75.00", category: "silog" },
            { name: "TOCILOG", details: "TOCINO EGG FRIED RICE", price: "₱75.00", category: "silog" },
            { name: "CORNSILOG", details: "CORNED BEEF >EGG FRIED RICE", price: "₱75.00", category: "silog" },
            { name: "TAPSILOG", details: "BEEF TAPA EGG FRIED RICE", price: "₱90.00", category: "silog" },
            { name: "MALINGSILOG", details: "MALING EGG FRIED RICE", price: "₱75.00", category: "silog" },
            { name: "HAMSILOG", details: "HAM EGG FRIED RICE", price: "₱75.00", category: "silog" },
            { name: "LIEMPOSILOG", details: "LIEMPO EGG FRIED RICE", price: "₱110.00", category: "silog" },
            { name: "CHICKSILOG", details: "CHICKEN EGG FRIED RICE", price: "₱95.00", category: "silog" },
            { name: "BANGUSSILOG", details: "BANGUS (HALF) EGG FRIED RICE", price: "₱90.00", category: "silog" },
            { name: "BACONSILOG", details: "BACON EGG FRIED RICE", price: "₱80.00", category: "silog" },
            
            // SOUPS items
            { name: "CORN SOUP", details: "1 BOWL", price: "₱75.00", category: "soups" },
            { name: "MUSHROOM SOUP", details: "1 BOWL", price: "₱75.00", category: "soups" },
            { name: "CREAMY ASPARAGUS", details: "1 BOWL", price: "₱85.00", category: "soups" },
            { name: "CRAB & CORN SOUP", details: "1 BOWL", price: "₱85.00", category: "soups" },
            { name: "BULALO", details: "1 BOWL", price: "₱270.00", category: "soups" },
            
            
            // DRINKS items
            { name: "BUKO JUICE IN GLASS", details: "BUKO JUICE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks" },
            { name: "BUKO JUICE IN PITCHER", details: "BUKO JUICE SERVED IN PITCHER", price: "₱100.00", category: "drinks" },
            { name: "BUKO JUICE IN COCONUT SHELL", details: "BUKO JUICE SERVED IN COCONUT SHELL", price: "₱60.00", category: "drinks" },
            { name: "ICED TEA IN GLASS", details: "ICED TEA SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks" },
            { name: "ICED TEA IN PITCHER", details: "ICED TEA SERVED IN PITCHER", price: "₱100.00", category: "drinks" },
            { name: "CUCUMBER LEMONADE IN GLASS ", details: "CUCUMBER LEMONADE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks" },
            { name: "CUCUMBER LEMONADE IN PITCHER ", details: "CUCUMBER LEMONADE SERVED IN PITCHER", price: "₱110.00", category: "drinks" },
            { name: "BLUE LEMONADE IN GLASS", details: "BLUE LEMONADE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks" },
            { name: "BLUE LEMONADE IN PITCHER", details: "BLUE LEMONADE SERVED IN PITCHER", price: "₱110.00", category: "drinks" },
            { name: "PINK LEMONADE IN GLASS", details: "PINK LEMONADE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks" },
            { name: "PINK LEMONADE IN PITCHER", details: "PINK LEMONADE SERVED IN PITCHER", price: "₱100.00", category: "drinks" },
            { name: "SAGO'T GULAMAN IN GLASS", details: "SAGO'T GULAMAN SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks" },
            { name: "SAGO'T GULAMAN IN PITCHER", details: "SAGO'T GULAMAN SERVED IN PITCHER", price: "₱110.00", category: "drinks" },
            { name: "BLACK GULAMAN IN GLASS", details: "BLACK GULAMAN SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks" },
            { name: "BLACK GULAMAN IN PITCHER", details: "BLACK GULAMAN SERVED IN PITCHER", price: "₱110.00", category: "drinks" },
            { name: "FRUIT SHAKE IN GLASS", details: "FRUIT SHAKE SERVED IN DRINKING GLASS", price: "₱70.00", category: "drinks" },
            { name: "BUKO PANDAN SHAKE", details: "BUKO PANDAN SHAKE SERVED IN DRINKING GLASS", price: "₱70.00", category: "drinks" },
            { name: "COKE /ROYAL/SPRITE MISMO", details: "1 BOTTLE OF MISMO SOFTDRINK", price: "₱18.00", category: "drinks" },
            { name: "COKE /ROYAL/SPRITE 12 OZ", details: "1 BOTTLE OF 12 OZ SOFTDRINK", price: "₱25.00", category: "drinks" },
            { name: "COKE /ROYAL/SPRITE KASALO", details: "1 BOTTLE OF KASALO SIZE SOFTDRINK", price: "₱35.00", category: "drinks" },
            { name: "COKE /ROYAL/SPRITE 1.5 LITER", details: "1 BOTTLE OF 1.5 LITERS", price: "₱100.00", category: "drinks" },
            { name: "BOTTLED WATER", details: "1 BOTTLE OF MINERAL WATER", price: "₱20.00", category: "drinks" },
            { name: "PINEAPPLE JUICE IN CAN", details: "1 CAN", price: "₱45.00", category: "drinks" },
            { name: "MINUTE MAID 250ML", details: "1 BOTTLE", price: "₱18.00", category: "drinks" },
            { name: "REAL LEAF", details: "1 BOTTLE", price: "₱25.00", category: "drinks" },
            { name: "COFFEE", details: "1 CUP", price: "₱30.00", category: "drinks" },
            
            // DESSERT items
            { name: "HALO HALO WITH LECHE FLAN", details: "SERVED WITH WITH LECHE FLAN", price: "₱35.00", category: "dessert" },
            { name: "HALO HALO WITH ICE CREAM", details: "SERVED WITH WITH ICE CREAM", price: "₱65.00", category: "dessert" },
            { name: "HALO HALO SPECIAL", details: "SERVED WITH SPECIAL TOPPINGS", price: "₱110.00", category: "dessert" },
            { name: "BUKO PANDAN", details: "1 SERVING", price: "₱110.00", category: "dessert" },
            { name: "FRUIT SALAD", details: "1 SERVING", price: "₱110.00", category: "dessert" },
            { name: "BUKO SALAD IN COCONUT SHELL", details: "1 SERVING ", price: "₱110.00", category: "dessert" },

            // Sample SIZZLING MEAL items - replace with your actual menu
            { name: "SQUABAMA ", details:"SERVED IN HOT PLATE", price: "₱75.00", category: "sizzling-meal" },
            { name: "BEEF SISIG KEBAB", details:"SERVED IN HOT PLATE", price: "₱105.00", category: "sizzling-meal" },
            { name: "CHICKEN SISIG ", details:"SERVED IN HOT PLATE", price: "₱85.00", category: "sizzling-meal" },
             { name: "PORK SISIG", details:"SERVED IN HOT PLATE", price: "₱85.00", category: "sizzling-meal" },
            { name: "LIEMPO", details:"SERVED IN HOT PLATE", price: "₱110.00", category: "sizzling-meal" },
            { name: "PORKCHOP", details:"HOT PLATE", price: "₱90.00", category: "sizzling-meal" },
             { name: "TENDERLOIN", details:"SERVED IN HOT PLATE", price: "₱135.00", category: "sizzling-meal" },
            { name: "TANIGUE", details:"SERVED IN HOT PLATE", price:"₱115.00", category: "sizzling-meal" },
            { name: "PUSIT W/ MAYO OR VEGGIES", details:"SERVED IN HOT PLATE", price: "₱105.00", category: "sizzling-meal" },
            { name: "GAMBAS", details:"SESRVED IN HOT PLATE", price: "₱115.00", category: "sizzling-meal" },
            { name: "BONELESS BANGUS W/ TALONG", details:"SERVED IN HOT PLATE", price: "₱135.00", category: "sizzling-meal" },
            
            
            // Sample SIZZLING DISH items - replace with your actual menu
            { name: "BEEF SISIG KEBAB", details: "SERVED IN HOT PLATE", price: "₱210.00", category: "sizzling-dish" },
            { name: "PORK SISIG", details: "SERVED IN HOT PLATE", price: "₱180.00", category: "sizzling-dish" },
            { name: "CHICKEN SISIG", details: "SERVED IN HOT PLATE", price: "₱180.00", category: "sizzling-dish" },
            { name: "SHRIMP SISIG", details: "SERVED IN HOT PLATE", price: "₱210.00", category: "sizzling-dish" },
            
            // Sample OTHER MEALS items - replace with your actual menu
            { name: "ANY-HAW RICE", details: "GOOD FOR 2 TO 3 PERONS", price: "₱110.00", category: "other-meals" },
            { name: "ANY-HAW RICE", details: "GOOD FOR 5 TO 6 PERSONS", price: "₱210.00", category: "other-meals" },
            { name: "PLAIN RICE", details: "1 PC", price: "₱20.00", category: "other-meals" },
            { name: "GARLIC RICE", details: "1 ORDER", price: "₱25.00", category: "other-meals" },
            { name: "VALENCIANA", details: "1 PC CHICKEN", price: "₱60.00", category: "other-meals" },
            { name: "VALENCIANA", details: "2 PCS CHICKEN", price: "₱85.00", category: "other-meals" },
            { name: "CHOPSUEY WITH RICE", details: "SOLO", price: "₱80.00", category: "other-meals" },
            { name: "CHOPSUEY WITH RICE", details: "GOOD FOR 2 TO 3 PERSONS", price: "₱130.00", category: "other-meals" },
            { name: "CHOPSUEY WITH RICE", details: "GOOD FOR 6 TO 8 PERSONS", price: "₱250.00", category: "other-meals" },
             { name: "KARE KARE WITH RICE", details: "SOLO", price: "₱100.00", category: "other-meals" },
            { name: "KARE KARE WITH RICE", details: "GOOD FOR 2 TO 3 PERSONS", price: "₱160.00", category: "other-meals" },
            { name: "KARE KARE WITH RICE", details: "GOOD FOR 6 TO 8 PERSONS", price: "₱310.00", category: "other-meals" },
            { name: "PINAKBET WITH BAGNET", details: "SOLO", price: "₱150.00", category: "other-meals" },
            { name: "FRIED ITIK", details: "SOLO", price: "₱190.00", category: "other-meals" },
             { name: "CRISPY PATA", details: "1 WHOLE", price: "₱350.00", category: "other-meals" },
            { name: "LECHON KAWALI", details: "SOLO", price: "₱120.00", category: "other-meals" },
            { name: "LECHON PAKSIW", details: "GOOD FOR 1 TO 2 PERSONS", price: "₱85.00", category: "other-meals" },
            { name: "BEEF PARES", details: "SOLO", price: "₱85.00", category: "other-meals" },
             { name: "KILAWIN TANIGUE", details: "SOLO", price: "₱160.00", category: "other-meals" },

            
            // Sample LITSONG MANOK items - replace with your actual menu
            { name: "JUMBO SIZE", details: "LITSON MANOK", price: "₱231.00", category: "litsong-manok" },
            { name: "REGULAR", details: "LITSON MANOK", price: "₱198.00", category: "litsong-manok" },
            { name: "HALF JUMBO", details: "LITSON MANOK", price: "₱121.00", category: "litsong-manok" },
            
            // Sample LECHON BABOY items - replace with your actual menu
            { name: "SMALL LECHON", details: "22 KILOS", price: "₱4900.00", category: "lechon-baboy" },
            { name: "REGULAR LECHON", details: "25 KILOS", price: "₱5400.00", category: "lechon-baboy" },
            { name: "JUMBO LECHON", details: "28 KILOS", price: "₱5900.00", category: "lechon-baboy" },
            { name: "EXTRA JUMBO LECHON", details: "31 KILOS", price: "₱6400.00", category: "lechon-baboy" },
            { name: "SUPER JUMBO LECHON", details: "35 KILOS", price: "₱6900.00", category: "lechon-baboy" },

            // Sample VALENCIANA items - replace with your actual menu
            { name: "V1",details: "GOOD FOR 8 PERSONS" ,price: "₱440.00", category: "Valenciana" },
            { name: "V2",details:"GOOD FOR 12 PERSONS" ,price: "₱660.00", category: "Valenciana" },
            { name: "V3",details: "GOOD FOR 20 PERSONS",price: "₱1100.00", category: "Valenciana" },

            { name: "SINIGANG TANIGUE",details: "1 BOWL" ,price: "₱250.00", category: "Sinigang" },
            { name: "SINIGANG BABOY",details:"1 BOWL" ,price: "₱660.00", category: "Sinigang" },
            { name: "SINIGANG HIPON",details: "1 BOWL",price: "₱250", category: "Sinigang" }
        ];

        // Cart state
        let cart = [];
                

        function displayMenuItems(category) {
            menuItemsContainer.innerHTML = '';
            let filteredItems = [];
            let headingText = '';

            if (category === 'all') {
                filteredItems = allMenuItemsData.slice(0, 12);
                headingText = "FEATURED MEALS";
            } else {
                filteredItems = allMenuItemsData.filter(item => item.category === category);
                headingText = category.toUpperCase().replace(/-/g, ' ');
            }

            featuredHeading.textContent = headingText;

            filteredItems.forEach(item => {
                const menuItemCard = document.createElement('div');
                menuItemCard.classList.add('menu-item-card');
                menuItemCard.innerHTML = `
                    <div class="item-code">${item.name}</div>
                    <div class="item-details">${item.details || ''}</div>
                    <div class="item-price">${item.price}</div>
                    <button class="add-to-cart-button">ADD TO CART</button>
                `;
                menuItemsContainer.appendChild(menuItemCard);
            });
        }

        // Show cart popup when clicking MY CART
        document.querySelector('.my-cart').addEventListener('click', function() {
            showCartPopup();
        });
        //search bar functionality
        // --- SEARCH BAR FUNCTIONALITY ---

const searchInput = document.querySelector('.search-box input');
const searchIcon = document.querySelector('.search-icon');

// Helper: highlight and scroll to item
function highlightAndScrollToItem(itemName) {
    // Remove previous highlights
    document.querySelectorAll('.menu-item-card').forEach(card => {
        card.style.boxShadow = '';
        card.style.border = '1px solid #b71c1c';
        card.style.backgroundColor = '#fff';
    });

    // Find and highlight the card
    const cards = document.querySelectorAll('.menu-item-card');
    let found = false;
    cards.forEach(card => {
        const code = card.querySelector('.item-code').textContent.trim().toLowerCase();
        if (code === itemName.trim().toLowerCase()) {
            card.style.boxShadow = '0 0 0 4px #ff6600, 0 2px 4px rgba(0,0,0,0.658)';
            card.style.border = '4px solid #ff6600';
            card.style.backgroundColor = '#fffbe6';
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true;
        }
    });
    return found;
}

// Main search function
function searchMenu() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Find the first matching item
    const foundItem = allMenuItemsData.find(item =>
        item.name.toLowerCase().includes(query) ||
        (item.details && item.details.toLowerCase().includes(query))
    );

    if (foundItem) {
        // Switch to the item's category
        displayMenuItems(foundItem.category);

        // Set the correct category button as active
        categoryButtons.forEach(btn => {
            if (btn.dataset.category === foundItem.category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Wait for DOM update, then highlight
        setTimeout(() => {
            highlightAndScrollToItem(foundItem.name);
        }, 50);
    } else {
        // Optionally, show a "not found" message
        featuredHeading.textContent = "No item found for: " + searchInput.value;
        menuItemsContainer.innerHTML = '';
    }
}

        // Search on icon click or Enter key
        searchIcon.addEventListener('click', searchMenu);
        searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchMenu();
});
        
        // Add to cart functionality
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('add-to-cart-button')) {
                const card = e.target.closest('.menu-item-card');
                const itemName = card.querySelector('.item-code').textContent;
                const itemPrice = card.querySelector('.item-price').textContent;
                
                addToCart(itemName, itemPrice);
                
                e.target.textContent = "ADDED!";
                setTimeout(() => {
                    e.target.textContent = "ADD TO CART";
                }, 1000);
            }
        });

        function addToCart(name, price) {
            const priceNumber = parseFloat(price.replace('₱', ''));
            const existingItem = cart.find(item => item.name === name);
            
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({
                    name: name,
                    price: priceNumber,
                    qty: 1
                });
            }
            showCartPopup();
        }

        function showCartPopup() {
            renderCart();
            document.getElementById('cartPopupBg').style.display = 'flex';
        }

        function hideCartPopup() {
            document.getElementById('cartPopupBg').style.display = 'none';
        }

        function renderCart() {
            const cartList = document.getElementById('cartList');
            cartList.innerHTML = '';
            
            if (cart.length === 0) {
                cartList.innerHTML = '<em>Your cart is empty.</em>';
                document.getElementById('cartTotal').textContent = '';
                return;
            }
            
            cart.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <span>${item.name}</span>
                    <input type="number" min="1" value="${item.qty}" data-idx="${idx}">
                    <span>₱${(item.price * item.qty).toFixed(2)}</span>
                    <button class="remove-btn" title="Remove" data-remove="${idx}">&times;</button>
                `;
                cartList.appendChild(div);
            });

            const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
            document.getElementById('cartTotal').textContent = 'Total: ₱' + total.toFixed(2);

            cartList.querySelectorAll('input[type="number"]').forEach(input => {
                input.addEventListener('change', function() {
                    const idx = +this.dataset.idx;
                    let val = parseInt(this.value, 10);
                    if (isNaN(val) || val < 1) val = 1;
                    cart[idx].qty = val;
                    renderCart();
                });
            });

            cartList.querySelectorAll('button[data-remove]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = +this.dataset.remove;
                    cart.splice(idx, 1);
                    renderCart();
                });
            });
        }

        // Button event listeners
        document.getElementById('checkoutBtn').onclick = function() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert('Thank you for your order!\n\n' + cart.map(item => `${item.qty} x ${item.name}`).join('\n'));
            cart = [];
            hideCartPopup();
        };

        document.getElementById('saveBtn').onclick = function() {
            hideCartPopup();
        };

        document.getElementById('cancelBtn').onclick = function() {
            hideCartPopup();
        };

        document.getElementById('cartPopupBg').onclick = function(e) {
            if (e.target === this) hideCartPopup();
        };

        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                displayMenuItems(category);
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
            });
        });