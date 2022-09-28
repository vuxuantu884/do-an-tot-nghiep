import { Layout, Menu } from "antd";
import { AppConfig } from "config/app.config";
import { RootReducerType } from "model/reducers/RootReducerType";
import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { useSelector } from "react-redux";
import { Link, useRouteMatch } from "react-router-dom";
import menu from "routes/menu";
import { getPath } from "utils/AppUtils";
import { checkUserPermission } from "utils/AuthUtil";

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
  // console.log("routeMatched", routeMatched);
  // console.log("selectedKeys", selectedKeys);
  // const menuAccess = AppConfig.ENV === "PROD" ? menu.filter((p) => p.key !== "tong-ket-ca") : menu;
  return (
    <Sider collapsed={collapsed} collapsedWidth={52} width={240} style={{ zIndex: 2 }}>
      <Scrollbars autoHide>
        <Menu
          defaultOpenKeys={collapsed ? [] : routeMatched}
          defaultSelectedKeys={selectedKeys}
          mode="inline"
          style={{ borderRight: "none" }}
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
                            <Menu.SubMenu
                              icon={
                                <i
                                  className={item.icon}
                                  style={{
                                    fontSize: 6,
                                    marginRight: 0,
                                    marginLeft: 10,
                                    verticalAlign: "middle",
                                  }}
                                />
                              }
                              title={item.title}
                              key={item.key}
                            >
                              {item.subMenu.map((item2) => (
                                <Menu.Item
                                  icon={
                                    <i
                                      className={item.icon}
                                      style={{
                                        fontSize: 6,
                                        marginRight: 0,
                                        marginLeft: 38,
                                        verticalAlign: "middle",
                                      }}
                                    />
                                  }
                                  key={item2.key}
                                >
                                  <Link title={item2.subTitle || item2.title} to={item2.path}>
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
                          <Menu.Item
                            icon={
                              <i
                                className={item.icon}
                                style={{
                                  fontSize: 6,
                                  marginRight: 0,
                                  marginLeft: 10,
                                  verticalAlign: "middle",
                                }}
                              />
                            }
                            key={item.key}
                          >
                            {!item.fullUrl ? (
                              <Link to={item.path} title={item.subTitle || item.title}>
                                {item.title}
                              </Link>
                            ) : (
                              <a href={item.fullUrl} target="_blank" rel="noreferrer">
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
                  {route.isShow ? <Link to={route.path}>{route.title}</Link> : route.title}
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
