import { Server } from "socket.io";
import { registerSockets } from "./sockets";
import { registerCronjobs } from "./cron";

export async function startServer() {
  const port = 3000 || process.env.HTTP_PORT;
  const io = new Server({});

  registerSockets(io);
  registerCronjobs();

  io.listen(port);
}
