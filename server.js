const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Order = require("./models/Order");
const Product = require("./models/Product");

app.use(express.json());

mongoose.connect("mongodb+srv://zooviUser:Zoovi%4012345@cluster0.zwwxqti.mongodb.net/?appName=Cluster0")

// HOME
app.get("/",(req,res)=>{
res.send("Zoovi Shop Running ✔");
});

// ORDER
app.post("/order", async (req,res)=>{

let orderId = Date.now().toString();

let order = new Order({
orderId,
items: req.body.items,
total: req.body.total
});

await order.save();

res.json({success:true, orderId});
});

// STOCK
app.post("/reduce-stock", async (req,res)=>{

await Product.updateOne(
{name:req.body.name},
{$inc:{stock:-1}}
);

res.json({success:true});
});

// ANALYTICS
app.get("/analytics",(req,res)=>{

res.json({
orders: 0,
revenue: 0,
profit: 0
});

});

// LOGIN
app.post("/login",(req,res)=>{

if(req.body.username==="admin" && req.body.password==="1234"){
return res.json({token:"demo-token"});
}

res.json({error:"Invalid login"});
});

app.listen(5000,()=>{
console.log("Server running on 5000");
});
