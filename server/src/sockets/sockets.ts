import { Server, Socket } from "socket.io";

/**
 * Registers methods to socket.io server passed in constructors.
 * All methods will be registered unless it is prefixed with "_".
 */
export abstract class SocketHandler {
  constructor(protected readonly server: Server) {
    const ignoredMethods: string[] = ["constructor"];

    const prototype = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (name) => typeof prototype[name] === "function"
    );

    methodNames.forEach((methodName) => {
      if (methodName.startsWith("_")) return;
      if (ignoredMethods.includes(methodName)) return;

      this.server.on(methodName, prototype[methodName]);
    });
  }
  abstract connection(socket: Socket): void;
}
