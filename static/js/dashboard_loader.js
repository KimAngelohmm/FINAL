/**
 * Dashboard Loader
 * A utility for loading dashboard data from the backend and updating dashboard UI
 */

class DashboardLoader {
    constructor(dashboardType) {
        this.dashboardType = dashboardType;
        this.loadingIndicator = null;
        this.refreshInterval = null;
        this.lastLoadTime = null;
    }

    /**
     * Initialize the dashboard loader
     * @param {Object} options - Configuration options
     * @param {Number} options.refreshInterval - Auto-refresh interval in milliseconds (0 to disable)
     * @param {Boolean} options.showLoadingIndicator - Whether to show loading indicator
     */
    init(options = {}) {
        const defaults = {
            refreshInterval: 60000, // 1 minute
            showLoadingIndicator: true
        };
        
        const config = { ...defaults, ...options };
        
        if (config.showLoadingIndicator) {
            this.createLoadingIndicator();
        }
        
        // Initial load
        this.loadDashboardData();
        
        // Setup auto-refresh if enabled
        if (config.refreshInterval > 0) {
            this.setupAutoRefresh(config.refreshInterval);
        }
        
        // Setup refresh toggle if it exists
        const refreshToggle = document.getElementById('autoRefresh');
        if (refreshToggle) {
            refreshToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setupAutoRefresh(config.refreshInterval);
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
        
        // Setup refresh button if it exists
        const refreshButton = document.querySelector('[data-refresh="dashboard"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }
    }
    
    /**
     * Create a loading indicator element
     */
    createLoadingIndicator() {
        const existingIndicator = document.getElementById('dashboard-loading-indicator');
        if (existingIndicator) {
            this.loadingIndicator = existingIndicator;
            return;
        }
        
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.id = 'dashboard-loading-indicator';
        this.loadingIndicator.className = 'position-fixed top-0 start-0 w-100 bg-primary text-white text-center py-1';
        this.loadingIndicator.style.zIndex = '1050';
        this.loadingIndicator.style.transform = 'translateY(-100%)';
        this.loadingIndicator.style.transition = 'transform 0.3s ease-in-out';
        this.loadingIndicator.innerHTML = 'Loading dashboard data...';
        
        document.body.appendChild(this.loadingIndicator);
    }
    
    /**
     * Show the loading indicator
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.transform = 'translateY(0)';
        }
    }
    
    /**
     * Hide the loading indicator
     */
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.transform = 'translateY(-100%)';
        }
    }
    
    /**
     * Set up auto-refresh
     * @param {Number} interval - Refresh interval in milliseconds
     */
    setupAutoRefresh(interval) {
        this.stopAutoRefresh(); // Clear any existing interval
        
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, interval);
        
        console.log(`Auto-refresh set up with interval: ${interval}ms`);
    }
    
    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('Auto-refresh stopped');
        }
    }
    
    /**
     * Load dashboard data from the backend
     */
    async loadDashboardData() {
        try {
            this.showLoading();
            
            const endpoint = `/backend/dashboard/load_${this.dashboardType}_dashboard`;
            console.log(`Loading data from: ${endpoint}`);
            
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load dashboard data');
            }
            
            const data = await response.json();
            this.updateDashboard(data);
            
            this.lastLoadTime = new Date();
            this.hideLoading();
            
            // Show last updated time if the element exists
            const lastUpdatedElement = document.getElementById('last-updated-time');
            if (lastUpdatedElement) {
                const formattedTime = this.lastLoadTime.toLocaleTimeString();
                lastUpdatedElement.textContent = `Last updated: ${formattedTime}`;
            }
            
            return data;
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.hideLoading();
            
            // Show error message
            const errorElement = document.getElementById('dashboard-error-message');
            if (errorElement) {
                errorElement.textContent = `Error: ${error.message}`;
                errorElement.style.display = 'block';
                
                // Hide after 5 seconds
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 5000);
            }
            
            return null;
        }
    }
    
    /**
     * Update dashboard UI with the loaded data
     * This is implemented differently for each dashboard type
     * @param {Object} data - Dashboard data from backend
     */
    updateDashboard(data) {
        switch (this.dashboardType) {
            case 'customer':
                this.updateCustomerDashboard(data);
                break;
            case 'admin':
                this.updateAdminDashboard(data);
                break;
            case 'kitchen':
                this.updateKitchenDashboard(data);
                break;
            case 'delivery':
                this.updateDeliveryDashboard(data);
                break;
            default:
                console.error(`Unknown dashboard type: ${this.dashboardType}`);
        }
    }
    
    /**
     * Update customer dashboard with data
     * @param {Object} data - Customer dashboard data
     */
    updateCustomerDashboard(data) {
        // Update user name
        if (data.user_data && data.user_data.name) {
            const customerName = document.getElementById('customerName');
            if (customerName) {
                customerName.textContent = data.user_data.name;
            }
        }
        
        // Update active orders
        if (data.active_orders) {
            const activeOrdersTable = document.getElementById('activeOrdersTable');
            if (activeOrdersTable) {
                activeOrdersTable.innerHTML = '';
                
                if (data.active_orders.length === 0) {
                    activeOrdersTable.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center">No active orders</td>
                        </tr>
                    `;
                } else {
                    data.active_orders.forEach(order => {
                        const orderDate = new Date(order.order_date).toLocaleString();
                        const statusClass = this.getStatusClass(order.status);
                        
                        activeOrdersTable.innerHTML += `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${orderDate}</td>
                                <td>₱${order.total_amount.toFixed(2)}</td>
                                <td><span class="order-status ${statusClass}">${order.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails(${order.id})">View</button>
                                </td>
                            </tr>
                        `;
                    });
                }
            }
        }
        
        // Update recent orders
        if (data.recent_orders) {
            const recentOrdersTable = document.getElementById('recentOrdersTable');
            if (recentOrdersTable) {
                recentOrdersTable.innerHTML = '';
                
                if (data.recent_orders.length === 0) {
                    recentOrdersTable.innerHTML = `
                        <tr>
                            <td colspan="3" class="text-center">No order history</td>
                        </tr>
                    `;
                } else {
                    data.recent_orders.forEach(order => {
                        const orderDate = new Date(order.order_date).toLocaleDateString();
                        const statusClass = this.getStatusClass(order.status);
                        
                        recentOrdersTable.innerHTML += `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${orderDate}</td>
                                <td><span class="order-status ${statusClass}">${order.status}</span></td>
                            </tr>
                        `;
                    });
                }
            }
        }
        
        // Update favorite items
        if (data.favorite_items) {
            const favoriteItemsList = document.getElementById('favoriteItemsList');
            if (favoriteItemsList) {
                favoriteItemsList.innerHTML = '';
                
                if (data.favorite_items.length === 0) {
                    favoriteItemsList.innerHTML = `
                        <li class="list-group-item text-center">No favorite items yet</li>
                    `;
                } else {
                    data.favorite_items.forEach(item => {
                        favoriteItemsList.innerHTML += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${item.name}
                                <button class="btn btn-sm btn-primary" onclick="orderAgain('${item.name}')">Order Again</button>
                            </li>
                        `;
                    });
                }
            }
        }
    }
    
    /**
     * Update admin dashboard with data
     * @param {Object} data - Admin dashboard data
     */
    updateAdminDashboard(data) {
        // Update stats cards
        if (data.order_stats) {
            document.querySelector('.card-title:contains("Total Orders") + h2').textContent = 
                data.order_stats.total_orders.toLocaleString();
            document.querySelector('.card-title:contains("Revenue") + h2').textContent = 
                `₱${data.order_stats.total_revenue.toFixed(2)}`;
            document.querySelector('.card-title:contains("Users") + h2').textContent = 
                data.user_count.toLocaleString();
            document.querySelector('.card-title:contains("Pending Orders") + h2').textContent = 
                data.order_stats.pending_orders.toLocaleString();
            
            // Update percentages in card footers
            document.querySelector('.card-title:contains("Total Orders")').closest('.card-body').nextElementSibling.querySelector('small').textContent = 
                `Up ${data.order_stats.order_change_percent}% from last week`;
            document.querySelector('.card-title:contains("Revenue")').closest('.card-body').nextElementSibling.querySelector('small').textContent = 
                `Up ${data.order_stats.revenue_change_percent}% from last week`;
        }
        
        // Update recent orders table
        if (data.recent_orders) {
            const recentOrdersTable = document.getElementById('recentOrdersTable');
            if (recentOrdersTable) {
                recentOrdersTable.innerHTML = '';
                
                data.recent_orders.forEach(order => {
                    const orderDate = new Date(order.order_date).toLocaleString();
                    const statusBadgeClass = this.getStatusBadgeClass(order.status);
                    
                    recentOrdersTable.innerHTML += `
                        <tr>
                            <td>#${order.id}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <img src="https://via.placeholder.com/40" alt="Avatar" class="user-avatar me-2">
                                    <span>${order.customer_name}</span>
                                </div>
                            </td>
                            <td>${orderDate}</td>
                            <td>₱${order.total_amount.toFixed(2)}</td>
                            <td><span class="badge ${statusBadgeClass}">${order.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewOrder(${order.id})"><i class="bi bi-eye"></i></button>
                                ${order.status === 'pending' ? `
                                <button class="btn btn-sm btn-outline-success me-1" onclick="approveOrder(${order.id})"><i class="bi bi-check-lg"></i></button>
                                <button class="btn btn-sm btn-outline-danger" onclick="cancelOrder(${order.id})"><i class="bi bi-x-lg"></i></button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                });
            }
        }
        
        // Update popular items list
        if (data.popular_items) {
            const popularItemsContainer = document.querySelector('.card-header:contains("Popular Menu Items")').closest('.card').querySelector('.card-body ul');
            if (popularItemsContainer) {
                popularItemsContainer.innerHTML = '';
                
                data.popular_items.forEach(item => {
                    popularItemsContainer.innerHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">${item.name}</h6>
                                <small class="text-muted">${item.category}</small>
                            </div>
                            <div>
                                <span class="badge bg-success rounded-pill">${item.order_count} orders</span>
                            </div>
                        </li>
                    `;
                });
            }
        }
        
        // Update staff performance table
        if (data.staff_performance) {
            const staffTableBody = document.querySelector('.card-header:contains("Staff Performance")').closest('.card').querySelector('tbody');
            if (staffTableBody) {
                staffTableBody.innerHTML = '';
                
                data.staff_performance.forEach(staff => {
                    const rating = parseFloat(staff.avg_rating) || 0;
                    
                    let stars = '';
                    for (let i = 1; i <= 5; i++) {
                        if (i <= Math.floor(rating)) {
                            stars += '<i class="bi bi-star-fill text-warning"></i>';
                        } else if (i - 0.5 <= rating) {
                            stars += '<i class="bi bi-star-half text-warning"></i>';
                        } else {
                            stars += '<i class="bi bi-star text-warning"></i>';
                        }
                    }
                    
                    staffTableBody.innerHTML += `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <img src="https://via.placeholder.com/40" alt="Avatar" class="user-avatar me-2">
                                    <span>${staff.name}</span>
                                </div>
                            </td>
                            <td>${staff.role}</td>
                            <td>${staff.order_count}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="me-2">${rating.toFixed(1)}</div>
                                    <div>${stars}</div>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
        }
    }
    
    /**
     * Update kitchen dashboard with data
     * @param {Object} data - Kitchen dashboard data
     */
    updateKitchenDashboard(data) {
        // Update stats cards
        if (data.order_stats) {
            document.querySelector('.card-title:contains("Pending Orders") + .d-flex h3').textContent = 
                data.order_stats.pending_orders;
            document.querySelector('.card-title:contains("In Progress") + .d-flex h3').textContent = 
                data.order_stats.in_progress_orders;
            document.querySelector('.card-title:contains("Ready for Pickup") + .d-flex h3').textContent = 
                data.order_stats.ready_orders;
            document.querySelector('.card-title:contains("Completed Today") + .d-flex h3').textContent = 
                data.order_stats.completed_today;
        }
        
        // Update order queue
        if (data.order_queue) {
            const orderQueueContainer = document.querySelector('.card-header:contains("Current Order Queue")').closest('.card').querySelector('.card-body .row:nth-child(2)');
            if (orderQueueContainer) {
                orderQueueContainer.innerHTML = '';
                
                if (data.order_queue.length === 0) {
                    orderQueueContainer.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <h4>No orders in queue</h4>
                            <p class="text-muted">All caught up! The order queue is empty.</p>
                        </div>
                    `;
                } else {
                    data.order_queue.forEach(order => {
                        // Format date
                        const orderDate = new Date(order.order_date).toLocaleTimeString();
                        
                        // Determine badge type
                        let badgeClass = 'bg-primary';
                        if (order.type === 'dine-in') badgeClass = 'bg-danger';
                        if (order.type === 'take-out') badgeClass = 'bg-warning';
                        if (order.type === 'delivery') badgeClass = 'bg-info';
                        
                        // Determine status badge
                        let statusBadge = 'badge-pending';
                        if (order.status === 'preparing') statusBadge = 'badge-preparing';
                        if (order.status === 'ready') statusBadge = 'badge-ready';
                        
                        // Format items
                        let itemsHtml = '';
                        if (order.items && order.items.length > 0) {
                            order.items.forEach(item => {
                                let specialInstr = '';
                                if (item.special_instructions) {
                                    specialInstr = `<small class="text-muted">(${item.special_instructions})</small>`;
                                }
                                itemsHtml += `<li>${item.quantity} × ${item.name} ${specialInstr}</li>`;
                            });
                        }
                        
                        // Determine button
                        let actionButton = '';
                        if (order.status === 'pending') {
                            actionButton = `<button class="btn btn-success" onclick="startPreparing(${order.id})">Start Preparing</button>`;
                        } else if (order.status === 'preparing') {
                            actionButton = `<button class="btn btn-primary" onclick="markAsReady(${order.id})">Mark as Ready</button>`;
                        }
                        
                        orderQueueContainer.innerHTML += `
                            <div class="col-md-6 col-xl-4 mb-3">
                                <div class="card order-card priority-${order.priority} h-100">
                                    <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">Order #${order.id}</h6>
                                        <span class="badge ${badgeClass}">${order.type}</span>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between mb-3">
                                            <div class="timer text-${order.priority === 'high' ? 'danger' : (order.priority === 'medium' ? 'warning' : 'success')}">
                                                <i class="bi bi-stopwatch me-1"></i> ${order.wait_time}:00
                                            </div>
                                            <div class="status-badge ${statusBadge}">${order.status}</div>
                                        </div>
                                        <div class="mb-3">
                                            <small class="text-muted">${order.type === 'dine-in' ? 'Table: ' : 'Customer: '}</small>
                                            <strong>${order.type === 'dine-in' ? 'Table ' + order.table_number : order.customer_name}</strong>
                                        </div>
                                        <h6 class="mb-2">Items:</h6>
                                        <ul class="list-unstyled order-items">
                                            ${itemsHtml}
                                        </ul>
                                        <div class="text-muted mb-3">
                                            <small>Ordered at: ${orderDate}</small>
                                        </div>
                                        <div class="d-grid gap-2">
                                            ${actionButton}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
            }
        }
        
        // Update inventory alerts
        if (data.inventory_alerts) {
            const inventoryTable = document.querySelector('.card-header:contains("Inventory Alerts")').closest('.card').querySelector('tbody');
            if (inventoryTable) {
                inventoryTable.innerHTML = '';
                
                if (data.inventory_alerts.length === 0) {
                    inventoryTable.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center">No inventory alerts</td>
                        </tr>
                    `;
                } else {
                    data.inventory_alerts.forEach(item => {
                        const badgeClass = item.status === 'critical' ? 'bg-danger' : 'bg-warning';
                        
                        inventoryTable.innerHTML += `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.current_stock} kg</td>
                                <td>${item.threshold} kg</td>
                                <td><span class="badge ${badgeClass}">${item.status}</span></td>
                            </tr>
                        `;
                    });
                }
            }
        }
    }
    
    /**
     * Update delivery dashboard with data
     * @param {Object} data - Delivery dashboard data
     */
    updateDeliveryDashboard(data) {
        // Update driver name
        if (data.user_data && data.user_data.name) {
            const driverName = document.getElementById('driverName');
            if (driverName) {
                driverName.textContent = data.user_data.name;
            }
        }
        
        // Update stats cards
        if (data.delivery_stats) {
            document.querySelector('.card-title:contains("Today\'s Deliveries") + h2').textContent = 
                data.delivery_stats.total_deliveries;
            document.querySelector('.card-title:contains("Completed") + h2').textContent = 
                data.delivery_stats.completed_deliveries;
            document.querySelector('.card-title:contains("In Progress") + h2').textContent = 
                data.delivery_stats.in_progress;
            document.querySelector('.card-title:contains("New Orders") + h2').textContent = 
                data.delivery_stats.new_orders;
        }
        
        // Update current deliveries
        if (data.current_deliveries) {
            const deliveriesContainer = document.querySelector('.card-header:contains("Current Deliveries")').closest('.card').querySelector('.card-body');
            if (deliveriesContainer) {
                deliveriesContainer.innerHTML = '';
                
                if (data.current_deliveries.length === 0) {
                    deliveriesContainer.innerHTML = `
                        <div class="text-center py-5">
                            <h4>No current deliveries</h4>
                            <p class="text-muted">You don't have any active deliveries at the moment.</p>
                        </div>
                    `;
                } else {
                    data.current_deliveries.forEach(delivery => {
                        const orderDate = new Date(delivery.order_date).toLocaleTimeString();
                        
                        // Determine badge and buttons based on status
                        let badgeClass = 'bg-primary';
                        let badgeText = 'New Order';
                        let actionButtons = '';
                        
                        if (delivery.delivery_status === 'new') {
                            badgeClass = 'bg-primary';
                            badgeText = 'New Order';
                            actionButtons = `
                                <button class="btn btn-outline-secondary">View Details</button>
                                <button class="btn btn-primary">Accept Delivery</button>
                            `;
                        } else if (delivery.delivery_status === 'picked') {
                            badgeClass = 'bg-warning';
                            badgeText = 'Picked Up';
                            actionButtons = `
                                <button class="btn btn-outline-secondary">View Details</button>
                                <button class="btn btn-info">Start Delivery</button>
                            `;
                        } else if (delivery.delivery_status === 'delivering') {
                            badgeClass = 'bg-info';
                            badgeText = 'In Transit';
                            
                            // Add a progress bar for in-transit orders
                            const progressBar = `
                                <div class="progress mb-3" style="height: 10px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 65%" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            `;
                            
                            actionButtons = `
                                <button class="btn btn-outline-secondary">Navigation</button>
                                <button class="btn btn-success">Mark Delivered</button>
                            `;
                        }
                        
                        let deliveryHTML = `
                            <div class="card delivery-card status-${delivery.delivery_status} mb-3">
                                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0">Order #${delivery.id}</h6>
                                    <span class="badge ${badgeClass} badge-lg">${badgeText}</span>
                                </div>
                                <div class="card-body">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <p><strong>Customer:</strong> ${delivery.customer_name}</p>
                                            <p><strong>Phone:</strong> ${delivery.phone}</p>
                                            <p><strong>Address:</strong> ${delivery.delivery_address}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <p><strong>${delivery.delivery_status === 'picked' ? 'Pickup Time:' : (delivery.delivery_status === 'delivering' ? 'ETA:' : 'Time:')}</strong> ${delivery.delivery_status === 'delivering' ? (delivery.estimated_delivery_time || '15 minutes') : orderDate}</p>
                                            <p><strong>Items:</strong> ${delivery.item_count}</p>
                                            <p><strong>Payment:</strong> ${delivery.payment_method === 'cash' ? 'Cash on delivery' : 'Already paid'}</p>
                                        </div>
                                    </div>
                                    ${delivery.delivery_status === 'delivering' ? `
                                    <div class="progress mb-3" style="height: 10px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 65%" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    ` : ''}
                                    <div class="d-flex justify-content-between">
                                        ${actionButtons}
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        deliveriesContainer.innerHTML += deliveryHTML;
                    });
                }
            }
        }
        
        // Update today's summary
        if (data.summary) {
            const summaryContainer = document.querySelector('.card-header:contains("Today\'s Summary")').closest('.card').querySelector('.card-body');
            if (summaryContainer) {
                // Handle potential null values
                const totalDistance = data.summary.total_distance || 0;
                const totalOrders = data.summary.total_orders || 0;
                const avgDeliveryTime = data.summary.avg_delivery_time || 0;
                const cashCollected = data.summary.cash_collected || 0;
                const avgRating = data.summary.avg_rating || 0;
                
                // Generate star rating HTML
                let stars = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= Math.floor(avgRating)) {
                        stars += '<i class="bi bi-star-fill text-warning"></i>';
                    } else if (i - 0.5 <= avgRating) {
                        stars += '<i class="bi bi-star-half text-warning"></i>';
                    } else {
                        stars += '<i class="bi bi-star text-warning"></i>';
                    }
                }
                
                summaryContainer.innerHTML = `
                    <div class="mb-3 d-flex justify-content-between align-items-center">
                        <div>Total Distance</div>
                        <div><strong>${totalDistance.toFixed(1)} km</strong></div>
                    </div>
                    <div class="mb-3 d-flex justify-content-between align-items-center">
                        <div>Total Orders</div>
                        <div><strong>${totalOrders}</strong></div>
                    </div>
                    <div class="mb-3 d-flex justify-content-between align-items-center">
                        <div>Average Delivery Time</div>
                        <div><strong>${avgDeliveryTime.toFixed(0)} min</strong></div>
                    </div>
                    <div class="mb-3 d-flex justify-content-between align-items-center">
                        <div>Cash Collected</div>
                        <div><strong>₱${cashCollected.toFixed(2)}</strong></div>
                    </div>
                    <div class="mb-3 d-flex justify-content-between align-items-center">
                        <div>Rating</div>
                        <div>
                            <strong>${avgRating.toFixed(1)}</strong>
                            ${stars}
                        </div>
                    </div>
                `;
            }
        }
        
        // Update route data
        if (data.route_data) {
            const routeContainer = document.querySelector('.card-header:contains("Optimized Route")').closest('.card').querySelector('.card-body');
            if (routeContainer) {
                // Generate HTML for route stops
                let routeHTML = `
                    <div class="mb-2">
                        <div class="d-flex align-items-center">
                            <span class="route-dot dot-start"></span>
                            <span><strong>Restaurant</strong> (Starting Point)</span>
                        </div>
                        <div class="route-line"></div>
                    </div>
                `;
                
                // Total distance and time
                let totalDistance = 0;
                
                if (data.route_data.length === 0) {
                    routeHTML += `
                        <div class="text-center py-3">
                            <p class="text-muted">No deliveries to show in the route</p>
                        </div>
                    `;
                } else {
                    data.route_data.forEach((stop, index) => {
                        totalDistance += parseFloat(stop.delivery_distance || 0);
                        
                        routeHTML += `
                            <div class="mb-2">
                                <div class="d-flex align-items-center">
                                    <span class="route-dot dot-stop"></span>
                                    <span><strong>Order #${stop.id}</strong> - ${stop.delivery_address}</span>
                                </div>
                                ${index < data.route_data.length - 1 ? '<div class="route-line"></div>' : ''}
                            </div>
                        `;
                    });
                }
                
                // Add return to restaurant
                routeHTML += `
                    <div>
                        <div class="d-flex align-items-center">
                            <span class="route-dot dot-end"></span>
                            <span><strong>Restaurant</strong> (Return)</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-between mb-2">
                            <div>Total Distance:</div>
                            <div><strong>${totalDistance.toFixed(1)} km</strong></div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <div>Estimated Time:</div>
                            <div><strong>${Math.round(totalDistance * 5 + 5)} minutes</strong></div>
                        </div>
                    </div>
                    <div class="mt-3 d-grid">
                        <button class="btn btn-outline-primary">
                            <i class="bi bi-map me-1"></i> Open in Maps
                        </button>
                    </div>
                `;
                
                routeContainer.innerHTML = routeHTML;
            }
        }
    }
    
    /**
     * Get CSS class for order status display
     * @param {String} status - Order status
     * @returns {String} CSS class
     */
    getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'preparing':
                return 'status-preparing';
            case 'ready':
                return 'status-ready';
            case 'completed':
            case 'delivered':
                return 'status-delivered';
            default:
                return '';
        }
    }
    
    /**
     * Get Bootstrap badge class for status
     * @param {String} status - Order status
     * @returns {String} Badge CSS class
     */
    getStatusBadgeClass(status) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-warning';
            case 'preparing':
            case 'processing':
                return 'bg-primary';
            case 'ready':
                return 'bg-info';
            case 'completed':
            case 'delivered':
                return 'bg-success';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }
}

// Helper function to find elements by text content
if (!document.querySelector.toString().includes('contains')) {
    Element.prototype.querySelector = function(selector) {
        if (selector.includes(':contains')) {
            const containsText = selector.match(/:contains\(['"](.+)['"]\)/)[1];
            const elements = Array.from(this.querySelectorAll(selector.replace(/:contains\([^)]+\)/, '')));
            return elements.find(el => el.textContent.includes(containsText)) || null;
        } else {
            return Document.prototype.querySelector.call(this, selector);
        }
    };
} 