/* 
 * AERVIA - Admin Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const ordersTable = document.getElementById('ordersTable');
    const ordersBody = document.getElementById('ordersBody');
    const emptyState = document.getElementById('emptyState');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Init
    loadOrders();

    // --- Core Functions ---

    function loadOrders() {
        const orders = JSON.parse(localStorage.getItem('aervia_orders')) || [];
        renderTable(orders);
    }

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

    window.updateOrderStatus = function (id, newStatus) {
        const orders = JSON.parse(localStorage.getItem('aervia_orders')) || [];
        const orderIndex = orders.findIndex(o => o.id === id);

        if (orderIndex > -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('aervia_orders', JSON.stringify(orders));
            loadOrders(); // Re-render to update badge color
        }
    };

    window.deleteOrder = function (id) {
        if (!confirm('Are you sure you want to delete this order?')) return;

        let orders = JSON.parse(localStorage.getItem('aervia_orders')) || [];
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('aervia_orders', JSON.stringify(orders));
        loadOrders();
    };

    // --- Global Actions ---

    clearAllBtn.addEventListener('click', () => {
        if (confirm('WARNING: This will delete ALL orders. Continue?')) {
            localStorage.removeItem('aervia_orders');
            loadOrders();
        }
    });

    // Auto-refresh every 30 seconds to simulate real-time dashboard
    setInterval(loadOrders, 30000);
});
