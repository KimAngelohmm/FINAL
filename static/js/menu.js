document.addEventListener('DOMContentLoaded', function() {
    // Define all variables at the top
    const categoryButtons = document.querySelectorAll('.category-button');
    const menuItemsContainer = document.querySelector('.menu-items-container');
    const featuredHeading = document.querySelector('.featured-heading');
    const searchInput = document.querySelector('.search-box input');
    const searchIcon = document.querySelector('.search-icon');
    
    // Cart state
    let cart = [];
    
    // Menu data
    const allMenuItemsData = [
        { name: "FB4", details: "1 Jumbo Litson Manok 6 BBQ 1 Bangus Pork/Chicken Sisig kare kare dish 6 Plain Rice Softdrinks 1.5L", price: "₱1000.00", category: "Featured-menu", image: "assets/images/jumbow.jpg" },
        { name: "HALO HALO SPECIAL", details: "SERVED WITH SPECIAL TOPPINGS", price: "₱110.00", category: "Featured-menu", image: "assets/images/halohalospecial.jpg" },
        { name: "JUMBO SIZE", details: "LITSON MANOK", price: "₱231.00", category: "Featured-menu", image: "assets/images/litson_manok.jpg" },
        { name: "V3", details: "GOOD FOR 20 PERSONS", price: "₱1100.00", category: "Featured-menu", image: "assets/images/valenciana.jpg" }, 
        { name: "REGULAR LECHON", details: "25 KILOS", price: "₱5400.00", category: "Featured-menu", image: "assets/images/LIEMPOWW.jpg" },
        { name: "FB6", details: "1 Jumbo Litson Manok 10 BBQ 1 Crispy pata 1 Bangus Pork/Chicken Sisig Kare-Kare Dish Chopsuey Dish Mixed seafood Pancit 10 Plain Rice Softdrinks 1.5L", price: "₱1850.00", category: "Family-treats", image: "assets/images/jumbow.jpg" },           
        { name: "C4", details: "1 QUARTER LITSON MANOK CHOPSUEY GARLIC RICE SOFTDRINKS (MISMO)", price: "₱125.00", category: "Featured-menu", image: "assets/images/c4.jpg" },
        
        //Combo meal    
        { name: "C1", details: "1 PC. BBQ 1 PC. VALENCIANA SOFTDRINKS(MISMO)", price: "₱120.00", category: "combo-meal", image: "assets/images/c1.jpg" },
        { name: "C2", details: "1 PC. BBQ 1 PC. VALENCIANA CHOPSUEY SOFTDRINKS(MISMO)", price: "₱120.00", category: "combo-meal", image: "assets/images/c2.png" },
        { name: "C3", details: "1 QUARTER LITSON MANOK 1 PC. BBQ  GARLIC RICE SOFTDRINKS(MISMO)", price: "₱120.00", category: "combo-meal", image: "assets/images/c3.png" },
        { name: "C4", details: "1 QUARTER LITSON MANOK CHOPSUEY GARLIC RICE SOFTDRINKS (MISMO)", price: "₱125.00", category: "combo-meal", image: "assets/images/c4.jpg" },
        
        // SILOG items
        { name: "LONGSILOG", details: "LONGGANISA EGG FRIED RICE", price: "₱80.00", category: "silog", image: "assets/images/longsilog.jpg" },
        { name: "PORKSILOG", details: "PORKCHOP EGG FRIED RICE", price: "₱90.00", category: "silog", image: "assets/images/porksilog.jpg" },
        { name: "HOTSILOG", details: "HOTDOG EGG FRIED RICE", price: "₱75.00", category: "silog", image: "assets/images/hotsilog.jpg" },
        { name: "TAPSILOG", details: "BEEF TAPA EGG FRIED RICE", price: "₱90.00", category: "silog", image: "assets/images/tapsilog.jpg" },
        { name: "CORNSILOG", details: "CORNED BEEF >EGG FRIED RICE", price: "₱75.00", category: "silog", image: "assets/images/cornsilog.jpg" },
        { name: "MALINGSILOG", details: "MALING EGG FRIED RICE", price: "₱75.00", category: "silog", image: "assets/images/malingsilog.jpg" },
        { name: "HAMSILOG", details: "HAM EGG FRIED RICE", price: "₱75.00", category: "silog", image: "assets/images/hamsilog.jpg" },
        { name: "LIEMPOSILOG", details: "LIEMPO EGG FRIED RICE", price: "₱110.00", category: "silog", image: "assets/images/liemposilog.jpg" },
        { name: "CHICKSILOG", details: "CHICKEN EGG FRIED RICE", price: "₱95.00", category: "silog", image: "assets/images/chicksilog.jpg" },
        
        // DRINKS items
        { name: "BUKO JUICE IN GLASS", details: "BUKO JUICE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks", image: "assets/images/coconut-inglass.jpg" },
        { name: "BUKO JUICE IN COCONUT SHELL", details: "BUKO JUICE SERVED IN COCONUT SHELL", price: "₱60.00", category: "drinks", image: "assets/images/coconut-shell.jpg" },
        { name: "ICED TEA IN GLASS", details: "ICED TEA SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks", image: "assets/images/iced_teaglass.jpg" },
        { name: "ICED TEA IN PITCHER", details: "ICED TEA SERVED IN PITCHER", price: "₱100.00", category: "drinks", image: "assets/images/pitcher_icedtea.jpg" },
        { name: "CUCUMBER LEMONADE IN GLASS", details: "CUCUMBER LEMONADE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks", image: "assets/images/cucumber_inglass.jpg" },
        { name: "CUCUMBER LEMONADE IN PITCHER", details: "CUCUMBER LEMONADE SERVED IN PITCHER", price: "₱110.00", category: "drinks", image: "assets/images/in_pitchercucumber.jpg" },
        { name: "BLUE LEMONADE IN GLASS", details: "BLUE LEMONADE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks", image: "assets/images/bluelemonade_glass.jpg" },
        { name: "BLUE LEMONADE IN PITCHER", details: "BLUE LEMONADE SERVED IN PITCHER", price: "₱110.00", category: "drinks", image: "assets/images/bluelemonade_pitcher.jpg" },
        { name: "PINK LEMONADE IN GLASS", details: "PINK LEMONADE SERVED IN DRINKING GLASS", price: "₱35.00", category: "drinks", image: "assets/images/pink-lemonadeglass.jpg" },
        { name: "FRUIT SHAKE IN GLASS", details: "FRUIT SHAKE SERVED IN DRINKING GLASS", price: "₱70.00", category: "drinks", image: "assets/images/fruitshake.jpg" },
        { name: "BUKO PANDAN SHAKE", details: "BUKO PANDAN SHAKE SERVED IN DRINKING GLASS", price: "₱70.00", category: "drinks", image: "assets/images/bukopandandessert.jpg" },
        
        // DESSERT items
        { name: "HALO HALO WITH ICE CREAM", details: "SERVED WITH WITH ICE CREAM", price: "₱65.00", category: "dessert", image: "assets/images/halohalowithicecream.jpg" },
        { name: "HALO HALO SPECIAL", details: "SERVED WITH SPECIAL TOPPINGS", price: "₱110.00", category: "dessert", image: "assets/images/halohalospecial.jpg" },
        { name: "BUKO PANDAN", details: "1 SERVING", price: "₱110.00", category: "dessert", image: "assets/images/bukopandandessert.jpg" },
        { name: "FRUIT SALAD", details: "1 SERVING", price: "₱110.00", category: "dessert", image: "assets/images/fruitsalaad.jpg" },
        
        // SIZZLING MEAL items
        { name: "CHICKEN SISIG", details:"SERVED IN HOT PLATE", price: "₱85.00", category: "sizzling-meal", image: "assets/images/chickensisig.jpg" },
        { name: "PORK SISIG", details:"SERVED IN HOT PLATE", price: "₱85.00", category: "sizzling-meal", image: "assets/images/porksisig.jpg" },
        { name: "LIEMPO", details:"SERVED IN HOT PLATE", price: "₱110.00", category: "sizzling-meal", image: "assets/images/liempo.jpg" },
        { name: "PORKCHOP", details:"HOT PLATE", price: "₱90.00", category: "sizzling-meal", image: "assets/images/SIZZLING-PORKCHOP.jpg" },
        { name: "TENDERLOIN", details:"SERVED IN HOT PLATE", price: "₱135.00", category: "sizzling-meal", image: "assets/images/tenderloin.jpg" },
        { name: "TANIGUE", details:"SERVED IN HOT PLATE", price:"₱115.00", category: "sizzling-meal", image: "assets/images/tanigue.jpg" },
        
        // OTHER MEALS items
        { name: "CHOPSUEY WITH RICE", details: "GOOD FOR 2 TO 3 PERSONS", price: "₱130.00", category: "other-meals", image: "assets/images/chop 2-3.jpg" },
        { name: "CHOPSUEY WITH RICE", details: "GOOD FOR 6 TO 8 PERSONS", price: "₱250.00", category: "other-meals", image: "assets/images/chop 6-8.jpg" },
        { name: "KARE KARE WITH RICE", details: "SOLO", price: "₱100.00", category: "other-meals", image: "assets/images/kare kare.jpg" },
        { name: "KARE KARE WITH RICE", details: "GOOD FOR 2 TO 3 PERSONS", price: "₱160.00", category: "other-meals", image: "assets/images/kare kare 2-3.jpg" },
        { name: "KARE KARE WITH RICE", details: "GOOD FOR 6 TO 8 PERSONS", price: "₱310.00", category: "other-meals", image: "assets/images/kare kare 6-8.jpg" },
        
        // LITSONG MANOK items
        { name: "JUMBO SIZE", details: "LITSON MANOK", price: "₱231.00", category: "litsong-manok", image: "assets/images/litson_manok.jpg" },
        { name: "HALF JUMBO", details: "LITSON MANOK", price: "₱121.00", category: "litsong-manok", image: "assets/images/half jumbo.jpg" },
        
        // LECHON BABOY items
        { name: "LIEMPO", details: "LECHON BABOY", price: "₱110.00", category: "lechon-baboy", image: "assets/images/LIEMPOWW.jpg" },
        
        // VALENCIANA items
        { name: "VALENCIANA", details: "GOOD FOR 2 TO 3 PERSONS", price: "₱160.00", category: "Valenciana", image: "assets/images/valenciana.jpg" }
    ];
    
    // Display initial category
    displayMenuItems('Featured-menu');
    
    // Set up event listeners for category buttons
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            categoryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            displayMenuItems(category);
        });
    });

    // Set up search functionality
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMenu();
        }
    });
    
    searchIcon.addEventListener('click', searchMenu);
    
    // Set up cart popup functionality
    document.querySelector('.my-cart').addEventListener('click', function() {
        showCartPopup();
    });
    
    document.getElementById('cancelBtn').addEventListener('click', hideCartPopup);
    document.getElementById('saveBtn').addEventListener('click', hideCartPopup);
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        hideCartPopup();
        // Add checkout functionality here
        alert('Proceeding to checkout...');
    });
    
    // Add event listeners for add to cart buttons
    menuItemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-button')) {
            const card = e.target.closest('.menu-item-card');
            const name = card.querySelector('.item-code').textContent;
            const price = card.querySelector('.item-price').textContent;
            addToCart(name, price);
        }
    });

    // Function to display menu items
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
            
            // Default image path for items without specific images
            const imagePath = item.image ? 
                `/static/${item.image}` : 
                '/static/assets/images/litson_manok.jpg';
            
            menuItemCard.innerHTML = `
                <div class="item-code">${item.name}</div>
                <div class="item-image">
                    <img src="${imagePath}" alt="${item.name}" onerror="this.src='/static/assets/images/litson_manok.jpg'">
                </div>
                <div class="item-details">${item.details || ''}</div>
                <div class="item-price">${item.price}</div>
                <button class="add-to-cart-button">ADD TO CART</button>
            `;
            menuItemsContainer.appendChild(menuItemCard);
        });
    }

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
                
                // Highlight the image with a glow effect
                const imgContainer = card.querySelector('.item-image');
                if (imgContainer) {
                    imgContainer.style.boxShadow = 'inset 0 0 20px rgba(255, 102, 0, 0.5)';
                }
                
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
        document.getElementById('cartTotal').textContent = `Total: ₱${total.toFixed(2)}`;
        
        // Add event listeners for quantity changes
        document.querySelectorAll('.cart-item input').forEach(input => {
            input.addEventListener('change', function() {
                const idx = parseInt(this.dataset.idx);
                const newQty = parseInt(this.value);
                if (newQty > 0) {
                    cart[idx].qty = newQty;
                    renderCart();
                } else {
                    this.value = 1; // Reset to 1 if invalid
                }
            });
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.cart-item .remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.remove);
                cart.splice(idx, 1);
                renderCart();
            });
        });
    }
});