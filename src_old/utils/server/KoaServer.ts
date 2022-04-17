/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Koa from "koa";
import KoaStatic from "koa-static";
import { Server } from "http";

export class KoaServer {
  static app: Koa;
  static server: Server;
  static root: string;

  static init(root: string): void {
    this.root = root;
    this.app = new Koa();
  }

  static run(port: number): void {
    this.close();
    this.app.use(KoaStatic(this.root));
    this.server = this.app.listen(port);
  }

  static close(): void {
    if (this.server) {
      this.server.close();
    }
  }
}
