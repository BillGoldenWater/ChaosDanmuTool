import Koa from "koa";
import KoaStatic from "koa-static";
import { Server } from "http";

export class KoaServer {
  static app: Koa;
  static server: Server;
  static root: string;
  static port: number;

  static init(root: string, port: number): void {
    this.root = root;
    this.port = port;
    this.app = new Koa();
  }

  static run(): void {
    this.close();
    this.app.use(KoaStatic(this.root));
    this.server = this.app.listen(this.port);
  }

  static close(): void {
    if (this.server) {
      this.server.close();
    }
  }
}
