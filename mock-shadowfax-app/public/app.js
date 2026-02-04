// API Base URL
const API_BASE = '';

// State
let orders = [];
let selectedOrder = null;

// Status progression map
const STATUS_FLOW = {
    'CREATED': 'ALLOTTED',
    'ALLOTTED': 'ACCEPTED',
    'ACCEPTED': 'ARRIVED',
    'ARRIVED': 'COLLECTED',
    'COLLECTED': 'ARRIVED_AT_CUSTOMER_DOORSTEP',
    'ARRIVED_AT_CUSTOMER_DOORSTEP': 'DELIVERED'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    // Auto-refresh every 5 seconds
    setInterval(fetchOrders, 5000);
});

// Fetch all orders
async function fetchOrders() {
    try {
        const response = await fetch(`${API_BASE}/api/orders`);
        const data = await response.json();
        orders = data.orders || [];
        renderOrders();
        updateStats();
    } catch (error) {
        console.error('Failed to fetch orders:', error);
    }
}

// Render orders grid
function renderOrders() {
    const emptyState = document.getElementById('emptyState');
    const ordersContainer = document.getElementById('ordersContainer');
    const ordersGrid = document.getElementById('ordersGrid');

    if (orders.length === 0) {
        emptyState.style.display = 'block';
        ordersContainer.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    ordersContainer.style.display = 'block';

    ordersGrid.innerHTML = orders.map(order => `
        <div class="order-card" onclick="openOrderModal('${order.shadowfax_id}')">
            <div class="order-header">
                <div class="order-id">${order.client_order_id}</div>
                <div class="status-badge status-${order.status}">${order.status}</div>
            </div>
            
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Shadowfax ID</span>
                    <span class="detail-value">${order.shadowfax_id.substring(0, 20)}...</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Pickup</span>
                    <span class="detail-value">${order.pickup_details?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Drop</span>
                    <span class="detail-value">${order.drop_details?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Created</span>
                    <span class="detail-value">${formatTime(order.created_at)}</span>
                </div>
                ${order.rider_details ? `
                <div class="detail-row">
                    <span class="detail-label">Rider</span>
                    <span class="detail-value">${order.rider_details.name}</span>
                </div>
                ` : ''}
            </div>

            <div class="order-actions" onclick="event.stopPropagation()">
                ${renderActionButtons(order)}
            </div>
        </div>
    `).join('');
}

// Render action buttons based on status
function renderActionButtons(order) {
    const buttons = [];

    // Accept Order (CREATED -> ALLOTTED)
    if (order.status === 'CREATED') {
        buttons.push(`
            <button class="btn btn-primary" onclick="assignRider('${order.shadowfax_id}')">
                👤 Accept & Assign Rider
            </button>
        `);
    }

    // Progress to next status
    if (STATUS_FLOW[order.status]) {
        const nextStatus = STATUS_FLOW[order.status];
        const label = getStatusLabel(nextStatus);
        buttons.push(`
            <button class="btn btn-secondary" onclick="updateStatus('${order.shadowfax_id}', '${nextStatus}')">
                ${label}
            </button>
        `);
    }

    // Cancel button (if not delivered/cancelled)
    if (!['DELIVERED', 'CANCELLED'].includes(order.status)) {
        buttons.push(`
            <button class="btn btn-danger" onclick="cancelOrder('${order.shadowfax_id}')">
                🚫 Cancel
            </button>
        `);
    }

    return buttons.join('');
}

// Get friendly status label
function getStatusLabel(status) {
    const labels = {
        'ALLOTTED': '✅ Assign Rider',
        'ACCEPTED': '👍 Mark Accepted',
        'ARRIVED': '📍 Mark Arrived at Store',
        'COLLECTED': '📦 Mark Picked Up',
        'ARRIVED_AT_CUSTOMER_DOORSTEP': '🚪 At Customer Door',
        'DELIVERED': '✅ Mark Delivered',
        'RTS_INITIATED': '🔄 Initiate RTS',
        'RTS_COMPLETED': '✅ Complete RTS'
    };
    return labels[status] || status;
}

// Assign rider to order
async function assignRider(orderId) {
    try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/assign-rider`, {
            method: 'POST'
        });
        
        if (response.ok) {
            console.log('✅ Rider assigned');
            await fetchOrders();
        }
    } catch (error) {
        console.error('Failed to assign rider:', error);
        alert('Failed to assign rider');
    }
}

// Update order status
async function updateStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            console.log(`✅ Status updated to ${newStatus}`);
            await fetchOrders();
        }
    } catch (error) {
        console.error('Failed to update status:', error);
        alert('Failed to update status');
    }
}

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const order = orders.find(o => o.shadowfax_id === orderId);
        const response = await fetch(`${API_BASE}/order/cancel/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: orderId,
                cancellation_reason: 'Cancelled via dashboard'
            })
        });
        
        if (response.ok) {
            console.log('✅ Order cancelled');
            await fetchOrders();
        }
    } catch (error) {
        console.error('Failed to cancel order:', error);
        alert('Failed to cancel order');
    }
}

// Open order detail modal
function openOrderModal(orderId) {
    const order = orders.find(o => o.shadowfax_id === orderId);
    if (!order) return;

    selectedOrder = order;
    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="info-section">
            <h3>Order Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Client Order ID</span>
                    <span class="info-value">${order.client_order_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Shadowfax ID</span>
                    <span class="info-value">${order.shadowfax_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value">
                        <span class="status-badge status-${order.status}">${order.status}</span>
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Created At</span>
                    <span class="info-value">${formatDateTime(order.created_at)}</span>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3>Pickup Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Name</span>
                    <span class="info-value">${order.pickup_details?.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Contact</span>
                    <span class="info-value">${order.pickup_details?.contact_number || 'N/A'}</span>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                    <span class="info-label">Address</span>
                    <span class="info-value">${order.pickup_details?.address || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3>Drop Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Name</span>
                    <span class="info-value">${order.drop_details?.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Contact</span>
                    <span class="info-value">${order.drop_details?.contact_number || 'N/A'}</span>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                    <span class="info-label">Address</span>
                    <span class="info-value">${order.drop_details?.address || 'N/A'}</span>
                </div>
            </div>
        </div>

        ${order.rider_details ? `
        <div class="info-section">
            <h3>Rider Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Name</span>
                    <span class="info-value">${order.rider_details.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Contact</span>
                    <span class="info-value">${order.rider_details.contact_number}</span>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="info-section">
            <h3>Order History</h3>
            <div class="history-timeline">
                ${order.history.map(item => `
                    <div class="history-item">
                        <div class="history-status">${item.status}</div>
                        <div class="history-time">${formatDateTime(item.timestamp)}</div>
                        ${item.note ? `<div class="history-note">${item.note}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
    selectedOrder = null;
}

// Update stats
function updateStats() {
    const total = orders.length;
    const active = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('activeOrders').textContent = active;
    document.getElementById('deliveredOrders').textContent = delivered;
}

// Format time (relative)
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Format date time
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Close modal on outside click
document.getElementById('orderModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'orderModal') {
        closeModal();
    }
});
