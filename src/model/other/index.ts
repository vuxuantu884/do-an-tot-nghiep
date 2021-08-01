import React from "react";
export interface RouteMenu {
  path: string;
  exact: boolean;
  title: string;
  subTitle?: string;
  isShow: boolean;
  subMenu: Array<RouteMenu>;
  header: React.ReactNode | null;
  icon: string;
  key: string;
  type: number;
  pathIgnore?: Array<string>;
  object: any;
  component: React.ReactNode;
}
