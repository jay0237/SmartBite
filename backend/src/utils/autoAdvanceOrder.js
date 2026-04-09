const Order = require("../models/Order");

const STATUS_FLOW = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];

// Delays in milliseconds for each stage transition
// Total = 5 minutes (300,000ms)
const DELAYS = [
    60 * 1000,   // Confirmed  → Preparing       (1 min)
    120 * 1000,  // Preparing  → Out for Delivery (2 min)
    120 * 1000,  // Out for Delivery → Delivered  (2 min)
];

/**
 * Auto-advances an order through all stages ending at Delivered.
 * Called once after an order is created.
 */
const autoAdvanceOrder = (orderId) => {
    let cumulativeDelay = 0;

    // Start from index 1 (skip "Confirmed" which is already done)
    for (let i = 1; i < STATUS_FLOW.length; i++) {
        cumulativeDelay += DELAYS[i - 1];
        const targetStatus = STATUS_FLOW[i];
        const stepIndex = i;

        setTimeout(async () => {
            try {
                const order = await Order.findById(orderId);
                if (!order || order.status === "Cancelled") return;

                order.status = targetStatus;
                order.timeline = STATUS_FLOW.map((step, idx) => ({
                    step,
                    done: idx <= stepIndex,
                    time: idx <= stepIndex
                        ? (order.timeline[idx]?.time || new Date().toLocaleTimeString())
                        : "",
                }));

                await order.save();
                console.log(`📦 Order ${orderId} → ${targetStatus}`);
            } catch (err) {
                console.error(`Auto-advance error for ${orderId}:`, err.message);
            }
        }, cumulativeDelay);
    }
};

module.exports = autoAdvanceOrder;
