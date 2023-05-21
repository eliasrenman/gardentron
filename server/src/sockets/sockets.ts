import io, { Server, Socket } from "socket.io";

export abstract class SocketHandler {
  constructor(private readonly server: Server) {
    const ignoredMethods = ["connection"];

    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function" && !ignoredMethods.includes(key)) {
        this.server.on(key, value);
      }
    }
  }

  abstract connection(socket: Socket): void;
}
