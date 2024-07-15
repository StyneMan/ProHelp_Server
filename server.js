// import dot from "dotenv";
// dot.config();
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const connect = require("./database/conn.js");
const router = require("./router/route.js");
const { Server } = require("socket.io");
const WebSockets = require("./utils/websocket.js");

const app = express();
const port = 8082;

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny")); 
app.disable("x-powered-by"); // less hackers know about our stack

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, PATCH, DELETE");
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

/** HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json({ message: "Welcome to ProHelp" });
});

require("./router/route.js")(app);

const httpServer = http.createServer(app);
global.io = new Server(httpServer, { cors: { origin: "*" } });

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
