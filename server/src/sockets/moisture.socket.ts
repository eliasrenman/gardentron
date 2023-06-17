import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketHandler } from "./sockets";
import { emitter } from "../eventemitter";
import { prisma } from "../prisma";

export class MoistureSocket extends SocketHandler {
  constructor(server: Server) {
    super(server);

    this.server.on("getMoisture", this.getMoisture);
    this.server.on("getAllMoistures", this.getAllMoistures);

    emitter.on("moisture.updated", (...rows: any) => {
      console.log("Moisture updated event listener called");
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

  public getAllMoistures() {
    return prisma.moistureValue.findMany({
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
