import dot from "dotenv";
dot.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import connect from "./database/conn.js";
import router from "./router/route.js";
import { Server } from "socket.io";
import WebSockets from "./utils/websocket.js";
import { pusher } from "./utils/pusher.js";

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

/** api routes */
app.use("/api", router);

app.use("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint doesnt exist",
  });
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const httpServer = http.createServer(app);
global.io = new Server(httpServer, { cors: { origin: "*" } });


/** Create socket connection */
global.io.on("connection", WebSockets.connection);

pusher.

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
