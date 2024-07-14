// import dot from "dotenv";
// dot.config();
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const connect = require("./database/conn.js");
const router = require("./router/route.js");
const { Server } = require("socket.io");
const WebSockets = require("./utils/websocket.js");

const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny")); 
app.disable("x-powered-by"); // less hackers know about our stack

const port = 8082;

/** HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json({ message: "Welcome to ProHelp" });
});


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

require("./router/route.js")(app);

const httpServer = http.createServer(app);
global.io = new Server(httpServer, { cors: { origin: "*" } });


// app.use("*", (req, res) => {
//   return res.status(404).json({
//     success: false,
//     message: "API endpoint doesnt exist",
//   });
// });


/** Create socket connection */
global.io.on("connection", WebSockets.connection);


/** start server only when we have valid connection */
connect()
  .then(() => {
    try {
      httpServer.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
      });
    } catch (error) {
      console.log("Cannot connect to the server");
    }
  })
  .catch((error) => {
    console.log("Invalid database connection...!", error);
  });
