import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketHandler } from "./sockets";
import { emitter } from "../eventemitter";

export class MoistureSocket extends SocketHandler {
  constructor(server: Server) {
    super(server);
    emitter.on("moisture.updated", (...rows: any) => {
      server.emit("moisture.updated", rows);
    });
  }

  connection(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ): void {
    console.log("Connection established with moisture handler.");
  }
}
