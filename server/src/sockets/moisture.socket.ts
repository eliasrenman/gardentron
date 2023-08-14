import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketHandler } from "./sockets";
import { emitter } from "../eventemitter";
import { logger } from "../config";
import { MoistureValueRow, db } from "../db/Databasehandler";

export class MoistureSocket extends SocketHandler {
  constructor(server: Server) {
    super(server);

    this.server.on("getMoisture", this.getMoisture);
    this.server.on("getAllMoistures", this.getAllMoistures);

    emitter.on("moisture.updated", (...rows: MoistureValueRow[]) => {
      logger.info("Moisture updated event listener called");
      server.emit("moisture.updated", rows);
      // enqueue(rows);
    });
  }

  connection(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ): void {
    logger.info("Connection established with moisture handler.");
  }

  public getMoisture() {
    return db.moistureValue.findMany({
      take: 3,
      select: {
        createdAt: true,
        id: true,
        name: true,
        value: true,
      },
    });
  }

  public getAllMoistures() {
    return db.moistureValue.findMany({
      select: {
        createdAt: true,
        id: true,
        name: true,
        value: true,
      },
    });
  }
}
