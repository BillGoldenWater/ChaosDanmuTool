/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface PageInfo<C> {
  id: string;
  icon: unknown;
  name: string;
  description?: string;
  component?: C;
}

export class PageManager<C> {
  pages: PageInfo<C>[];

  constructor(pages: PageInfo<C>[]) {
    this.pages = pages;
  }

  getPages(): PageInfo<C>[] {
    return this.pages;
  }

  getPage(id: string): PageInfo<C> {
    return this.pages.find((info) => info.id === id);
  }
}
