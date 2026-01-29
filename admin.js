/* 
 * AERVIA - Admin Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const ordersTable = document.getElementById('ordersTable');
    const ordersBody = document.getElementById('ordersBody');
    const emptyState = document.getElementById('emptyState');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Init - Listen for real-time updates
    const API_URL = 'https://jsonblob.com/api/jsonBlob/019c0af1-888d-7f81-87f3-a43eacec6c19';

    // 1. Cloud Polling (Replacing Firebase Realtime)
    async function loadCloudOrders() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.orders) syncOrders(data.orders);
        } catch (e) {
            console.error("Cloud fetch error:", e);
        }
    }

    // Initial Load & Loop
    loadCloudOrders();
    setInterval(loadCloudOrders, 3000); // Check every 3 seconds

    function syncOrders(data) {
        const orders = data ? Object.values(data) : [];
        // Sort by timestamp descending (newest first)
        orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        renderTable(orders);
    }

    // --- Core Functions ---

    function renderTable(orders) {
        ordersBody.innerHTML = ''; // Clear current

        if (orders.length === 0) {
            ordersTable.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        ordersTable.style.display = 'table';
        emptyState.style.display = 'none';

        orders.forEach(order => {
            const tr = document.createElement('tr');

            // Priority Styling
            const isUrgent = order.priority === 'Emergency';
            const priorityBadge = isUrgent ? '<small style="color:red; font-weight:bold;">(URGENT)</small>' : '';

            // Status Badge Class
            const statusClass = `badge-${order.status.toLowerCase()}`;

            tr.innerHTML = `
                <td><small>${order.id}</small></td>
                <td>
                    <div><strong>${order.customerName}</strong></div>
                    <small>${order.phone}</small>
                </td>
                <td>
                    ${order.service}<br>
                    ${priorityBadge}
                </td>
                <td>
                    <small>From:</small> ${order.pickup}<br>
                    <small>To:</small> ${order.delivery}
                </td>
                <td>
                    ${order.weight}kg <br>
                    <strong>${order.cost}</strong>
                </td>
                <td>
                    <span class="badge ${statusClass}">${order.status}</span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px; flex-direction: column;">
                        <select onchange="updateOrderStatus('${order.id}', this.value)" class="form-control" style="padding: 4px; font-size: 0.8rem; width: auto;">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Approved" ${order.status === 'Approved' ? 'selected' : ''}>Approved</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                        <button onclick="deleteOrder('${order.id}')" class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 0.75rem;">Delete</button>
                    </div>
                </td>
            `;
            ordersBody.appendChild(tr);
        });
    }

    // --- Actions (Exposed to Window) ---

    window.updateOrderStatus = async function (id, newStatus) {
        try {
            // 1. Fetch
            const response = await fetch(API_URL);
            const data = await response.json();

            // 2. Modify
            if (data.orders && data.orders[id]) {
                data.orders[id].status = newStatus;

                // 3. Save
                await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                // 4. Update UI
                loadCloudOrders();
            }
        } catch (e) {
            console.error('Update status failed:', e);
        }
    };

    window.deleteOrder = async function (id) {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (data.orders && data.orders[id]) {
                delete data.orders[id];

                await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                loadCloudOrders();
            }
        } catch (e) { console.error('Delete failed:', e); }
    };

    // --- Global Actions ---

    clearAllBtn.addEventListener('click', async () => {
        if (confirm('WARNING: This will delete ALL orders. Continue?')) {
            try {
                // Wipe Cloud Data
                await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders: {} })
                });
                loadCloudOrders();
            } catch (e) { console.error('Clear failed:', e); }
        }
    });
});
