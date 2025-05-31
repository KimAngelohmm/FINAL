/**
 * Customer UI JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Settings dropdown functionality
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('overlay');
    
    if (settingsBtn && settingsPanel) {
        // Toggle settings panel when settings button is clicked
        settingsBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from bubbling to document
            settingsPanel.classList.toggle('visible');
        });
        
        // Close settings panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!settingsBtn.contains(e.target) && !settingsPanel.contains(e.target)) {
                settingsPanel.classList.remove('visible');
            }
        });
        
        // Profile picture update button
        const updateProfilePicBtn = document.getElementById('updateprofilepic_button');
        if (updateProfilePicBtn) {
            updateProfilePicBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Hide settings panel
                settingsPanel.classList.remove('visible');
                // Show overlay
                overlay.style.display = 'block';
                // Show update profile picture UI
                if (document.getElementById('updateprofilepicUI')) {
                    document.getElementById('updateprofilepicUI').style.display = 'block';
                }
            });
        }
        
        // Edit account button
        const editAccountBtn = document.getElementById('editaccount_button');
        if (editAccountBtn) {
            editAccountBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Hide settings panel
                settingsPanel.classList.remove('visible');
                // Show overlay
                overlay.style.display = 'block';
                // Show edit account UI
                if (document.getElementById('editaccountUI')) {
                    document.getElementById('editaccountUI').style.display = 'block';
                }
            });
        }
        
        // Change password button
        const changePasswordBtn = document.getElementById('changepassword_button');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Hide settings panel
                settingsPanel.classList.remove('visible');
                // Show overlay
                overlay.style.display = 'block';
                // Show change password UI
                if (document.getElementById('updatepasswordUI')) {
                    document.getElementById('updatepasswordUI').style.display = 'block';
                }
            });
        }
    }

    // Close button functionality for floating UIs
    const closeButtons = [
        { btn: 'closeBtn', ui: 'editaccountUI' },
        { btn: 'updatecloseBtn', ui: 'updatepasswordUI' },
        { btn: 'updateprofilepic_closeBtn', ui: 'updateprofilepicUI' }
    ];

    closeButtons.forEach(item => {
        const closeBtn = document.getElementById(item.btn);
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                document.getElementById(item.ui).style.display = 'none';
                overlay.style.display = 'none';
            });
        }
    });

    // Edit account functionality
    const editUpdateBtn = document.getElementById('editupdate');
    if (editUpdateBtn) {
        editUpdateBtn.addEventListener('click', function() {
            const isEditing = this.textContent === 'Edit Account';
            
            // Toggle button text
            this.textContent = isEditing ? 'Save Changes' : 'Edit Account';
            
            // Toggle cancel button visibility
            const cancelBtn = document.getElementById('cancelBtn');
            if (cancelBtn) {
                cancelBtn.style.display = isEditing ? 'inline-block' : 'none';
            }
            
            // Toggle input fields disabled state (except username and position)
            const editableFields = [
                'username_txt',
                'firstname_txt', 
                'middlename_txt', 
                'lastname_txt', 
                'email_txt', 
                'contactnumber_txt'
            ];
            
            editableFields.forEach(field => {
                const inputField = document.getElementById(field);
                if (inputField) {
                    inputField.disabled = !isEditing;
                    if (isEditing) {
                        inputField.classList.remove('custom-disabled');
                    } else {
                        inputField.classList.add('custom-disabled');
                    }
                }
            });
            
            // If saving changes, implement the save logic here
            if (!isEditing) {
                // Here you would make an API call to save the changes
                console.log('Saving account changes');
            }
        });
    }

    // Cancel button for edit account
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // Reset form to original values (would need to fetch from server in real implementation)
            
            // Toggle button text back to Edit
            const editUpdateBtn = document.getElementById('editupdate');
            if (editUpdateBtn) {
                editUpdateBtn.textContent = 'Edit Account';
            }
            
            // Hide cancel button
            this.style.display = 'none';
            
            // Disable all editable fields again
            const editableFields = [
                'username_txt',
                'firstname_txt', 
                'middlename_txt', 
                'lastname_txt', 
                'email_txt', 
                'contactnumber_txt'
            ];
            
            editableFields.forEach(field => {
                const inputField = document.getElementById(field);
                if (inputField) {
                    inputField.disabled = true;
                    inputField.classList.add('custom-disabled');
                }
            });
        });
    }

    // Update password functionality
    const updatePasswordBtn = document.getElementById('updatepassword_staffbtn');
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', function() {
            const oldPassword = document.getElementById('old_password_txt').value;
            const newPassword = document.getElementById('updatepassword_staff').value;
            
            if (!oldPassword || !newPassword) {
                alert('Please fill in all password fields');
                return;
            }
            
            // Here you would make an API call to update the password
            console.log('Updating password');
            
            // For demo purposes, show success message
            alert('Password updated successfully');
            
            // Close the UI
            document.getElementById('updatepasswordUI').style.display = 'none';
            overlay.style.display = 'none';
        });
    }

    // Update profile picture functionality
    const updateProfilePicForm = document.getElementById('updateprofilepic_form');
    if (updateProfilePicForm) {
        updateProfilePicForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('profile_pic_input');
            if (!fileInput.files.length) {
                alert('Please select an image file');
                return;
            }
            
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('profilePic', fileInput.files[0]);
            
            // Show loading state
            const submitBtn = document.getElementById('updateprofilepic_btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
            
            // Send to server
            fetch('/backend/customer/update_profile_picture', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Network response was not ok');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                
                // Update image preview
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Update the preview 
                    document.getElementById('profile_pic_preview').src = e.target.result;
                    
                    // Update the navbar profile pic if it exists
                    const navProfilePic = document.querySelector('.user-profile .profile-pic');
                    if (navProfilePic) {
                        navProfilePic.src = e.target.result;
                    }
                    
                    // Show success message
                    alert('Profile picture updated successfully');
                    
                    // Reset form
                    updateProfilePicForm.reset();
                    
                    // Close the UI after a short delay
                    setTimeout(() => {
                        document.getElementById('updateprofilepicUI').style.display = 'none';
                        document.getElementById('overlay').style.display = 'none';
                    }, 1000);
                };
                
                reader.readAsDataURL(file);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update profile picture. Please try again.');
            })
            .finally(() => {
                // Reset button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    // Cart data structure
    const cart = {
        items: [],
        total: 0,
        
        addItem: function(id, name, price, quantity = 1) {
            const existingItem = this.items.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
                existingItem.subtotal = existingItem.price * existingItem.quantity;
            } else {
                this.items.push({
                    id,
                    name,
                    price,
                    quantity,
                    subtotal: price * quantity
                });
            }
            
            this.updateTotal();
            this.updateBadge();
            this.renderCart();
        },
        
        removeItem: function(id) {
            const index = this.items.findIndex(item => item.id === id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.updateTotal();
                this.updateBadge();
                this.renderCart();
            }
        },
        
        updateQuantity: function(id, quantity) {
            const item = this.items.find(item => item.id === id);
            if (item) {
                item.quantity = quantity;
                item.subtotal = item.price * item.quantity;
                this.updateTotal();
                this.updateBadge();
                this.renderCart();
            }
        },
        
        clearCart: function() {
            this.items = [];
            this.updateTotal();
            this.updateBadge();
            this.renderCart();
        },
        
        updateTotal: function() {
            this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        },
        
        updateBadge: function() {
            const itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
            document.getElementById('cartBadge').textContent = itemCount;
        },
        
        renderCart: function() {
            const cartItemsContainer = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            
            if (!cartItemsContainer || !cartTotal) return;
            
            // Clear existing items
            cartItemsContainer.innerHTML = '';
            
            if (this.items.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="5" class="no-data">Your cart is empty</td>';
                cartItemsContainer.appendChild(emptyRow);
            } else {
                // Add each item
                this.items.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>
                            <button class="qty-btn decrease" data-id="${item.id}">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="qty-btn increase" data-id="${item.id}">+</button>
                        </td>
                        <td>₱${item.price.toFixed(2)}</td>
                        <td>₱${item.subtotal.toFixed(2)}</td>
                        <td>
                            <button class="delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    cartItemsContainer.appendChild(row);
                });
                
                // Set up event listeners for the new buttons
                const decreaseButtons = document.querySelectorAll('.qty-btn.decrease');
                const increaseButtons = document.querySelectorAll('.qty-btn.increase');
                const deleteButtons = document.querySelectorAll('.delete-btn');
                
                decreaseButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-id');
                        const item = this.items.find(item => item.id === id);
                        if (item && item.quantity > 1) {
                            this.updateQuantity(id, item.quantity - 1);
                        }
                    });
                });
                
                increaseButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-id');
                        const item = this.items.find(item => item.id === id);
                        if (item) {
                            this.updateQuantity(id, item.quantity + 1);
                        }
                    });
                });
                
                deleteButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-id');
                        this.removeItem(id);
                    });
                });
            }
            
            // Update total
            cartTotal.textContent = `₱${this.total.toFixed(2)}`;
        }
    };
    
    // Initialize UI elements
    function initializeUI() {
        // Show/Hide About Us UI
        document.getElementById('aboutUsLink').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('aboutUsUI').style.display = 'block';
        });
        
        document.getElementById('closeAboutUsBtn').addEventListener('click', function() {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('aboutUsUI').style.display = 'none';
        });
        
        // Show/Hide Login UI
        document.getElementById('loginLink').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('floatingUI').style.display = 'block';
        });
        
        document.getElementById('closeBtn').addEventListener('click', function() {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('floatingUI').style.display = 'none';
        });
        
        // Show Cart UI when clicking on cart button
        document.getElementById('cartButton').addEventListener('click', function() {
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('myCartUI').style.display = 'block';
            cart.renderCart();
        });
        
        // Hide Cart UI
        document.getElementById('cancelOrderBtn').addEventListener('click', function() {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('myCartUI').style.display = 'none';
        });
        
        // Browse Menu button functionality
        document.getElementById('browseFoodBtn').addEventListener('click', function() {
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('categoriesUI').style.display = 'block';
            loadFoodItems('featured');
        });
        
        // Close Categories UI
        document.getElementById('closeCategoriesBtn').addEventListener('click', function() {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('categoriesUI').style.display = 'none';
        });
        
        // Category cards functionality
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                if (category === 'view-all') {
                    document.getElementById('overlay').style.display = 'block';
                    document.getElementById('categoriesUI').style.display = 'block';
                    loadFoodItems('featured');
                } else {
                    document.getElementById('overlay').style.display = 'block';
                    document.getElementById('categoriesUI').style.display = 'block';
                    
                    // Find the corresponding category button and activate it
                    const categoryBtns = document.querySelectorAll('.category-btn');
                    categoryBtns.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-category') === category) {
                            btn.classList.add('active');
                        }
                    });
                    
                    loadFoodItems(category);
                }
            });
        });
        
        // Category buttons functionality
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Here you would load the food items for the selected category
                const category = this.getAttribute('data-category');
                loadFoodItems(category);
            });
        });
        
        // Add event listener for checkout button
        document.getElementById('checkoutBtn').addEventListener('click', function() {
            if (cart.items.length === 0) {
                alert('Your cart is empty. Please add items before checkout.');
                return;
            }
            
            // Here you would implement the checkout process
            console.log('Proceeding to checkout with items:', cart.items);
            alert('Checkout feature will be implemented soon!');
        });
        
        // Add event listener for save order button
        document.getElementById('saveOrderBtn').addEventListener('click', function() {
            if (cart.items.length === 0) {
                alert('Your cart is empty. Please add items before saving.');
                return;
            }
            
            // Here you would implement the save order process
            console.log('Saving order with items:', cart.items);
            alert('Order saved successfully!');
        });
    }
    
    // Function to load food items for a category
    function loadFoodItems(category) {
        console.log(`Loading items for category: ${category}`);
        const foodItemsContainer = document.getElementById('foodItemsContainer');
        
        // In a real implementation, you would fetch data from the server
        // For now, we'll use mock data
        
        // Clear current items
        foodItemsContainer.innerHTML = '';
        
        // Loading indicator
        foodItemsContainer.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading menu items...</p></div>';
        
        // Simulate API call delay
        setTimeout(() => {
            foodItemsContainer.innerHTML = '';
            
            // Mock data based on category
            let mockItems = [];
            
            switch(category) {
                case 'featured':
                    mockItems = [
                        { id: '1', name: 'Litson Manok', description: 'Delicious roasted chicken with special sauce.', price: 250.00, image: 'sample-food.jpg' },
                        { id: '2', name: 'Pancit Canton', description: 'Stir-fried noodles with vegetables and meat.', price: 120.00, image: 'sample-food.jpg' },
                        { id: '3', name: 'Sisig', description: 'Sizzling pork dish with chili and calamansi.', price: 180.00, image: 'sample-food.jpg' },
                        { id: '4', name: 'Lechon Kawali', description: 'Deep-fried pork belly with crispy skin.', price: 220.00, image: 'sample-food.jpg' }
                    ];
                    break;
                case 'combo':
                    mockItems = [
                        { id: '5', name: 'Combo A', description: 'Chicken with rice and drink.', price: 150.00, image: 'sample-food.jpg' },
                        { id: '6', name: 'Combo B', description: 'Pork with rice and drink.', price: 160.00, image: 'sample-food.jpg' },
                        { id: '7', name: 'Family Combo', description: 'Serves 3-4 people with drinks.', price: 450.00, image: 'sample-food.jpg' }
                    ];
                    break;
                default:
                    mockItems = [
                        { id: '8', name: 'Sample Item', description: 'Sample description for this category.', price: 100.00, image: 'sample-food.jpg' },
                        { id: '9', name: 'Sample Item 2', description: 'Another sample description.', price: 120.00, image: 'sample-food.jpg' }
                    ];
            }
            
            // Create and append food item cards
            mockItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'food-item-card';
                card.innerHTML = `
                    <img src="${item.image ? `{{ url_for('static', filename='assets/images/${item.image}') }}` : `{{ url_for('static', filename='assets/images/placeholder.jpg') }}`}" alt="${item.name}" class="food-item-image">
                    <div class="food-item-name">${item.name}</div>
                    <div class="food-item-description">${item.description}</div>
                    <div class="food-item-price">₱${item.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Add to Cart</button>
                `;
                foodItemsContainer.appendChild(card);
            });
            
            // Add event listeners to the Add to Cart buttons
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const name = this.getAttribute('data-name');
                    const price = parseFloat(this.getAttribute('data-price'));
                    
                    cart.addItem(id, name, price);
                });
            });
            
        }, 800); // Simulated delay of 800ms
    }
    
    // Initialize the UI
    initializeUI();
}); 