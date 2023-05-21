import { Server } from "socket.io";
import { MoistureSocket } from "./moisture.socket";

export function registerSockets(server: Server) {
  new MoistureSocket(server);
}
