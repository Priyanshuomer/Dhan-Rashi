const express = require("express");
const path = require("path");
const mongo = require("mongoose");
const cookieparser = require("cookie-parser");
const {createServer} = require("http");

const {route} = require("./routes/userRoutes.js");
const routeTxn = require("./routes/txnRoutes.js");
const routeMsg = require("./routes/msgRoutes.js");


const {checkUserAuthentication} = require("./middlewares/token.js");

require('dotenv').config();

const PORT = process.env.PORT || 8500;
const app = express();





console.log(`http://localhost:${PORT}/user/`);

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.resolve("./public")));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());  // For JSON data

app.set("view engine","ejs");
app.set("views", path.resolve("./views"));


mongo.connect(process.env.DB_URL || "abcd")
.then( () => {console.log("Database connected successfully")});






app.use(cookieparser());
app.use(checkUserAuthentication("uid"));

app.use("/user",route);
app.use("/transactions",routeTxn);
app.use("/messages",routeMsg);

app.listen(PORT,() => {console.log(`Server started at ${PORT}`)});


