const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
orderId: String,
items: String,
total: Number,
status: { type: String, default: "Pending" },
time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
