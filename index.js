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

const PORT = process.env.PORT;
const app = express();





console.log(`http://localhost:${PORT}/user/login`);

app.use(express.urlencoded({ extended: true }));  // For form data
app.use(express.json());  // For JSON data

app.set("view engine","ejs");
app.set("views", path.resolve("./views"));


mongo.connect(process.env.DB_URL)
.then( () => {console.log("Database connected successfully")});


// const httpServer = createServer(app);
// const io = new Server(httpServer);

// io.on("connection", (socket) => {
//     console.log("A user connected");
  
//     socket.on("disconnect", () => {
//       console.log("A user disconnected");
//     });
//   });






app.use(cookieparser());
app.use(checkUserAuthentication("uid"));

app.use("/user",route);
app.use("/transactions",routeTxn);
app.use("/messages",routeMsg);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT,() => {console.log(`Server started at ${PORT}`)});


