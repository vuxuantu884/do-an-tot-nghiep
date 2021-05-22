import React from 'react';
export interface RouteMenu {
  path: string,
  exact: boolean,
  title: string,
  isShow: boolean,
  subMenu: Array<RouteMenu>,
  header: React.ReactNode | null
  icon: string,
  key: string,
  isShowCreate: boolean,
  pathCreate: string,
  component: React.ReactNode;
}