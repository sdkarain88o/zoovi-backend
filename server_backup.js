const express = require("express");
const cors = require("cors");

const app = express();

const fs = require("fs");

// 💾 SAVE ORDERS
function saveOrders(data){
fs.writeFileSync("orders.json", JSON.stringify(data,null,2));
}

app.use(cors());
app.use(express.static("public"));

// 🏠 HOME
app.get("/", (req,res)=>{
res.send("Zoovi Shop Running ✔");
});

// GET PRODUCTS
app.get("/products", (req,res)=>{
  res.json(loadProducts());
});

// ADD PRODUCT
app.get("/add", (req,res)=>{
  let products = loadProducts();

  products.push({
    id: products.length + 1,
    name: req.query.name,
    price: Number(req.query.price)
  });

  saveProducts(products);

  res.send("Product Added ✔");
});

// DELETE PRODUCT
app.get("/delete", (req,res)=>{
  let products = loadProducts();
  let id = Number(req.query.id);

  products = products.filter(p => p.id !== id);

  saveProducts(products);

  res.send("Product Deleted ✔");
});

function loadAdmins(){
return JSON.parse(fs.readFileSync("admin.json","utf8"));
}

// 🔐 ADMIN LOGIN
app.get("/login",(req,res)=>{

let pass = req.query.pass;

if(pass === ADMIN_PASS){
res.send("success");
}else{
res.send("fail");
}

});

// 🔐 ADMIN LOGIN API
app.get("/login", (req, res) => {

let user = req.query.user;
let pass = req.query.pass;

if(user === "zoovi" && pass === "1234"){
res.send("OK");
}else{
res.send("FAIL");
}

});

// 🚪 LOGOUT API
app.get("/logout", (req,res)=>{
res.send("OK");
});

// ✏️ EDIT PRODUCT
app.get("/edit", (req,res)=>{

let products = loadProducts();

let id = Number(req.query.id);
let name = req.query.name;
let price = Number(req.query.price);

products = products.map(p => {

if(p.id === id){
return {
id:id,
name:name,
price:price
};
}

return p;

});

saveProducts(products);

res.send("Updated ✔");

});

// 🔐 SIMPLE ADMIN PASSWORD
const ADMIN_PASS = "1234";

app.get("/edit", (req,res)=>{

let products = loadProducts();

let id = Number(req.query.id);
let name = req.query.name;
let price = Number(req.query.price);
let image = req.query.image;

products = products.map(p => {

if(p.id === id){
return {
id:id,
name:name,
price:price,
image:image
};
}

return p;

});

saveProducts(products);

res.send("Updated ✔");

});

// 🧾 PLACE ORDER
app.get("/order",(req,res)=>{

let orders = loadOrders();

let items = req.query.items;
let total = req.query.total;

let newOrder = {
id: Date.now(),
items: items,
total: total,
status: "Confirmed",
payment: "Unpaid",
time: new Date()
};

orders.push(newOrder);
saveOrders(orders);

// WhatsApp
let phone = "923001234567";

let msg = `Order Confirmed\nItems: ${items}\nTotal: Rs ${total}`;

let url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(msg);

console.log(url);

res.send("Order Confirmed ✔");

});

// 🟡 UPDATE ORDER STATUS
app.get("/status", (req,res)=>{

let orders = loadOrders();

let id = Number(req.query.id);
let status = req.query.status;

orders = orders.map(o => {

if(o.id === id){
o.status = status;
}

return o;

});

saveOrders(orders);

res.send("Status Updated ✔");

});

// 💰 REVENUE CALCULATION
app.get("/revenue",(req,res)=>{

let orders = loadOrders();

let total = 0;

orders.forEach(o=>{
total += Number(o.total);
});

res.json({ revenue: total });

});

// ❌ DELETE ORDER
app.get("/delete-order",(req,res)=>{

let orders = loadOrders();

let id = Number(req.query.id);

orders = orders.filter(o => o.id !== id);

saveOrders(orders);

res.send("Order Deleted ✔");

});

// 💰 TOTAL PROFIT CALCULATION
app.get("/profit",(req,res)=>{

let orders = loadOrders();
let products = loadProducts();

let profit = 0;

orders.forEach(order=>{

let items = order.items.split(",");

items.forEach(i=>{

let name = i.split("x")[0].trim();

let product = products.find(p=>p.name === name);

if(product){
profit += (product.price - product.cost);
}

});

});

res.json({ profit: profit });

});

// 📊 MONTHLY REPORT
app.get("/report",(req,res)=>{

let orders = loadOrders();

let month = req.query.month; 
// format: 2026-04

let filtered = orders.filter(o=>{
let d = new Date(o.time);
let m = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
return m === month;
});

let totalSales = 0;

filtered.forEach(o=>{
totalSales += Number(o.total);
});

res.json({
month: month,
orders: filtered.length,
sales: totalSales
});

});

app.get("/login",(req,res)=>{

let username = req.query.username;
let password = req.query.password;

let admins = loadAdmins();

let user = admins.find(a =>
a.username === username && a.password === password
);

if(user){
res.json({
status: "success",
role: user.role
});
}else{
res.json({
status: "fail"
});
}

});

// ➕ ADD NEW ADMIN
app.get("/add-admin",(req,res)=>{

let admins = loadAdmins();

let username = req.query.username;
let password = req.query.password;
let role = req.query.role || "admin";

let exists = admins.find(a => a.username === username);

if(exists){
return res.send("User already exists ❌");
}

admins.push({
username,
password,
role
});

fs.writeFileSync("admin.json", JSON.stringify(admins,null,2));

res.send("Admin Added ✔");

});

// ❌ DELETE ADMIN
app.get("/delete-admin",(req,res)=>{

let admins = loadAdmins();

let username = req.query.username;

admins = admins.filter(a => a.username !== username);

fs.writeFileSync("admin.json", JSON.stringify(admins,null,2));

res.send("Admin Deleted ✔");

});

// ✏️ EDIT ADMIN
app.get("/edit-admin",(req,res)=>{

let admins = loadAdmins();

let username = req.query.username;
let newUsername = req.query.newUsername;
let newPassword = req.query.newPassword;
let newRole = req.query.newRole;

admins = admins.map(a => {

if(a.username === username){
return {
username: newUsername || a.username,
password: newPassword || a.password,
role: newRole || a.role
};
}

return a;

});

fs.writeFileSync("admin.json", JSON.stringify(admins,null,2));

res.send("Admin Updated ✔");

});

// 💳 UPDATE PAYMENT STATUS
app.get("/payment",(req,res)=>{

let orders = loadOrders();

let id = Number(req.query.id);
let payment = req.query.payment; // Paid / Unpaid

orders = orders.map(o => {

if(o.id === id){
o.payment = payment;
}

return o;

});

saveOrders(orders);

res.send("Payment Updated ✔");

});

// 🧾 INVOICE DATA
app.get("/invoice",(req,res)=>{

let orders = loadOrders();

let id = Number(req.query.id);

let order = orders.find(o => o.id === id);

if(!order){
return res.send("Order not found ❌");
}

res.json(order);

});

const PDFDocument = require("pdfkit");

// 🧾 PDF INVOICE DOWNLOAD
app.get("/invoice-pdf",(req,res)=>{

let orders = loadOrders();

let id = Number(req.query.id);

let order = orders.find(o => o.id === id);

if(!order){
return res.send("Order not found ❌");
}

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

const doc = new PDFDocument();

doc.pipe(res);

// 🧾 HEADER
doc.fontSize(20).text("ZOOVI SHOP INVOICE", {align:"center"});
doc.moveDown();

// 🚀 SERVER START
app.listen(5000, ()=>{
console.log("Server running on 5000");
});
