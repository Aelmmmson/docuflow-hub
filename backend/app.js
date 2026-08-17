//IMPORTS
require("dotenv").config();

const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const credentials = require("./middleware/credentials");
const corsOptions = require("./middleware/corsOption");



const http = require("http");
const { initWebSocketServer } = require("./websocket");

//create express app and get port for connection
const app = express(); //create express app
const port = process.env.PORT || 8088; //port for serve
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(cookieParser());

//base route for the app
// console.log("API URL:", "/v1/api/dms");
app.use("/v1/api/dms", require("./routes/routes"));

//server connection with HTTP & WebSockets
const server = http.createServer(app);
initWebSocketServer(server);

server.listen(port, () => {
	console.log(`DocuFlow API & WebSockets server listening on port ${port}`);
});
