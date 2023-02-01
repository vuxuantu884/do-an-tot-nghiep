import { Layout, Menu } from "antd";
import "assets/css/unicorn-menu.less";
import { RootReducerType } from "model/reducers/RootReducerType";
import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { useSelector } from "react-redux";
import { Link, useRouteMatch } from "react-router-dom";
import menu from "routes/menu";
import { getPath } from "utils/AppUtils";
import { checkUserPermission } from "utils/AuthUtil";
import { ANT_PREFIX_CLS } from "utils/Constants";

type SidebarContainerProps = {
  path: string;
  collapsed: boolean;
};
const { Sider } = Layout;
const SidebarContainer: React.FC<SidebarContainerProps> = (props: SidebarContainerProps) => {
  const { collapsed } = props;
  const currentRoles: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer?.permissions,
  );

  const { path: matchPatch } = useRouteMatch();

  const checkPermission = (permission: string[] | undefined) => {
    return permission ? checkUserPermission(permission, currentRoles) : true;
  };

  const routeMatched = getPath(menu, matchPatch);
  const selectedKeys = getPath(
    menu.map((single) => single.subMenu),
    matchPatch,
  );

  return (
    <Sider collapsed={collapsed} collapsedWidth={52} width={240}>
      <Scrollbars autoHide>
        <Menu
          defaultOpenKeys={collapsed ? [] : routeMatched}
          defaultSelectedKeys={selectedKeys}
          mode="inline"
          style={{ borderRight: "none" }}
          className={`${ANT_PREFIX_CLS}-unicorn-menu`}
        >
          {menu.map((route) => {
            if (route.subMenu.length > 0) {
              return (
                checkPermission(route.permissions) && (
                  <Menu.SubMenu
                    icon={<i className={route.icon} style={{ fontSize: 18 }} />}
                    title={<div>{route.title}</div>}
                    key={route.key}
                  >
                    {route.subMenu.map((item) => {
                      if (item.subMenu.length > 0 && item.showMenuThird === true) {
                        return (
                          checkPermission(item.permissions) && (
                            <Menu.SubMenu title={item.title} key={item.key}>
                              {item.subMenu.map((item2) => (
                                <Menu.Item key={item2.key}>
                                  <Link
                                    style={{ color: "inherit" }}
                                    title={item2.subTitle || item2.title}
                                    to={item2.path}
                                  >
                                    {item2.title}
                                  </Link>
                                </Menu.Item>
                              ))}
                            </Menu.SubMenu>
                          )
                        );
                      }
                      return (
                        item.isShow &&
                        checkPermission(item.permissions) && (
                          <Menu.Item key={item.key}>
                            {!item.fullUrl ? (
                              <Link
                                style={{ color: "inherit" }}
                                to={item.path}
                                title={item.subTitle || item.title}
                              >
                                {item.title}
                              </Link>
                            ) : (
                              <a
                                style={{ color: "inherit" }}
                                href={item.fullUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {item.title}
                              </a>
                            )}
                            {/* {item.subTitle ? (
                          <Tooltip
                            title={item.subTitle}
                            color="red"
                            mouseEnterDelay={0}
                            mouseLeaveDelay={0}
                            overlayInnerStyle={{
                              textAlign: "center",
                              padding: "5px 10px",
                            }}
                          >
                            <Link to={item.path} title={item.subTitle}>{item.title}</Link>
                          </Tooltip>
                        ) : (
                          <Link to={item.path}>{item.title}</Link>
                        )} */}
                          </Menu.Item>
                        )
                      );
                    })}
                  </Menu.SubMenu>
                )
              );
            }
            return (
              checkPermission(route.permissions) && (
                <Menu.Item
                  onClick={() => {
                    if (!route.isShow) {
                      window.location.href = route.path;
                    }
                  }}
                  icon={<i className={route.icon} style={{ fontSize: 18 }} />}
                  key={route.key}
                >
                  {route.isShow ? (
                    <Link style={{ color: "inherit" }} to={route.path}>
                      {route.title}
                    </Link>
                  ) : (
                    route.title
                  )}
                </Menu.Item>
              )
            );
          })}
        </Menu>
      </Scrollbars>
    </Sider>
  );
};

export default SidebarContainer;
