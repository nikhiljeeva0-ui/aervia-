/* 
 * AERVIA - Customer Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // --- Elements ---
    const orderForm = document.getElementById('orderForm');
    const serviceSelect = document.getElementById('serviceType');
    const prioritySelect = document.getElementById('priority');
    const weightInput = document.getElementById('weight');

    // Summary Card Elements
    const summaryService = document.getElementById('summaryService');
    const summaryWeight = document.getElementById('summaryWeight');
    const summaryPriority = document.getElementById('summaryPriority');
    const summaryTime = document.getElementById('summaryTime');
    const estCostDisplay = document.getElementById('estCost');

    // Steps & Confirmation
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const confirmationCard = document.getElementById('confirmationCard');
    const confirmId = document.getElementById('confirmId');

    // Pricing & Time Config
    const SERVICES = {
        'Medical': { basePrice: 20, baseTime: 15 },
        'Campus': { basePrice: 5, baseTime: 20 },
        'Emergency': { basePrice: 50, baseTime: 10 },
        'Parcel': { basePrice: 10, baseTime: 30 }
    };

    const WEIGHT_PRICE_PER_KG = 5; // $5 per kg

    // Auto-Calculate Function
    function updateEstimates() {
        const serviceType = serviceSelect.value;
        const weight = parseFloat(weightInput.value) || 0;
        const priority = prioritySelect.value;

        // Update Summary Basics
        summaryService.textContent = serviceType || '--';
        summaryWeight.textContent = weight > 0 ? `${weight} kg` : '0 kg';
        summaryPriority.textContent = priority;

        if (!serviceType) {
            estCostDisplay.textContent = '$0.00';
            summaryTime.textContent = '-- mins';
            step2.classList.remove('active'); // Step 2 inactive
            return;
        }

        // Activate Step 2 (Review) logic
        step2.classList.add('active');

        const serviceData = SERVICES[serviceType];

        // Cost Calculation
        let totalCost = serviceData.basePrice + (weight * WEIGHT_PRICE_PER_KG);
        if (priority === 'Emergency') {
            totalCost *= 1.5;
        }

        // Time Calculation
        let estTime = serviceData.baseTime;
        if (priority === 'Emergency') {
            estTime = Math.max(5, estTime - 5);
        }

        estCostDisplay.textContent = `$${totalCost.toFixed(2)}`;
        summaryTime.textContent = `~${estTime} mins`;
    }

    // Event Listeners for Live Updates
    serviceSelect.addEventListener('change', updateEstimates);
    prioritySelect.addEventListener('change', updateEstimates);
    weightInput.addEventListener('input', updateEstimates);

    // Form Submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Create Order Object
        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            customerName: document.getElementById('customerName').value,
            phone: document.getElementById('phone').value,
            service: serviceSelect.value,
            priority: prioritySelect.value,
            pickup: document.getElementById('pickup').value,
            delivery: document.getElementById('delivery').value,
            weight: document.getElementById('weight').value,
            cost: estCostDisplay.textContent,
            status: 'Pending',
            timestamp: new Date().toISOString()
        };

        // Save
        saveOrder(newOrder);

        // --- UI Updates for Success ---

        // 1. Hide Form, Show Confirmation
        orderForm.style.display = 'none';
        confirmationCard.style.display = 'block';
        confirmId.textContent = newOrder.id;

        // 2. Update Steps
        document.getElementById('step1').classList.add('completed'); // Details done
        step2.classList.add('completed'); // Review done
        step3.classList.add('active'); // Done active

        // Scroll to confirmation if on mobile
        if (window.innerWidth < 768) {
            confirmationCard.scrollIntoView({ behavior: 'smooth' });
        }
    });

    function saveOrder(order) {
        const orders = JSON.parse(localStorage.getItem('aervia_orders')) || [];
        orders.unshift(order);
        localStorage.setItem('aervia_orders', JSON.stringify(orders));
    }
});
