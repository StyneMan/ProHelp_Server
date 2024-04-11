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
// import { pusher } from "./utils/pusher.js";
import Pusher from 'pusher'
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

const pushr = new Pusher({
  appId: "1782638",
  key: "1c215c902be56f87e08f",
  secret: "ff248e804ca4bd09a001",
  cluster: "mt1",
  useTLS: true,
});

// Pusher 
// app.post('/pusher/auth', (req, res) => {
//   // Now authenticate user
//   try {
//     const socketId = req.body?.socket_id;

//   const user = {
//     id: req.body?.id,
//     user_info: {
//       name: `${req.body?.firstname} ${req.body?.lastname}`,
//       email: `${req.body?.email}`
//     },
//   };
//   pushr.trigger('my-channel', 'client-authed', {"message": "Hello Welcome"})
//   const authResponse = pushr.authenticateUser(socketId, user);
//   console.log("PUSHER SIGNI RESP ::: ", authResponse);
//   res.send(authResponse);
//   } catch (error) {
//     console.log("PUSHER AUTH ERROR::: ", error);
//   }
// })


// pushr.get({path: "", params: {}})
// pusher.s //trigger('connect', 'established', {message: 'pusher connection established'});
// const channelPusher = pusher.subscribe('presence-my-channel');
const channelPusher2 = pusher.subscribe('my-channel');

// channelPusher.callbacks.get((val) => console.log("CALLBACK ::: ", val));
// channelPusher.bind('client-message', function(data) {
//   console.log('DATA FROM CLIENT:', data);
// });
channelPusher2.bind('pusher:subscription_succeeded', function(members) {
  console.log('SUCCESSFULLY --- subscribed!');

  channelPusher2.emit('client-from-server', {message: 'FROM SERVER to CLIENT !!!'});
});

channelPusher2.bind('client-from-mobile', function(data) {
  console.log('DATA FROM CLIENT:', data);
});
// 



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
