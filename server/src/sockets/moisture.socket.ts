import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketHandler } from "./sockets";
import { emitter } from "../eventemitter";
import { prisma } from "../prisma";

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

  public getMoisture() {
    return prisma.moistureValue.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        id: true,
        name: true,
        value: true,
      },
    });
  }
}
