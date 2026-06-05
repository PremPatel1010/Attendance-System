import app from "./src/app.js";
import jwt from "jsonwebtoken";
import http from "http";
import { WebSocketServer } from "ws";
import { handleMessage } from "./src/websocket/handler.js";
import User from "./src/models/User.model.js";

const PORT = 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const token = url.searchParams.get("token");
  
  console.log(token);

  if (!token) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: { message: "Unauthorized or invalid token" },
      }),
    );
    ws.close();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name email role");
    ws.user = { userId: user.id, role: user.role };
  } catch (error) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: { message: "Unauthorized or invalid token" },
      }),
    );
    ws.close();
    return;
  }

  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw);
      handleMessage(ws, wss, message);
    } catch (error) {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "Invalid message format" },
        }),
      );
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is runnning on PORT ${PORT}`);
});
