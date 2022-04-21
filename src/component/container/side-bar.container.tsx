import { Layout, Menu } from "antd";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useMemo } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import menu from "routes/menu";
import { findCurrentRoute } from "utils/AppUtils";
import { checkUserPermission } from "utils/AuthUtil";

type SidebarContainerProps = {
  path: string;
  collapsed: boolean;
};
const { Sider } = Layout;
const SidebarContainer: React.FC<SidebarContainerProps> = (
  props: SidebarContainerProps
) => {
  const { path, collapsed } = props;
  const currentRoles: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer?.permissions
  );

  const checkPermisson = (permission: string[] | undefined) => {

    return permission ? checkUserPermission(permission, currentRoles) : true;
  }
  let currentRoute = useMemo(() => findCurrentRoute(menu, path), [path]);
  let defaultSelectedKeys: Array<string> = [];
  if (currentRoute.current != null) {
    defaultSelectedKeys = [...defaultSelectedKeys, ...currentRoute.current];
  }
  let defaultOpenKeys: Array<string> = [];
  if (currentRoute.subMenu != null) {
    defaultOpenKeys = [...defaultOpenKeys, ...currentRoute.subMenu];
  }
  return (
    <Sider
      collapsed={collapsed}
      collapsedWidth={52}
      width={240}
      style={{ zIndex: 2 }}

    >
      <Scrollbars autoHide>
        <Menu
          defaultOpenKeys={collapsed ? [] : defaultOpenKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          mode="inline"
          style={{ borderRight: "none" }}
        >
          {menu.map((route) => {
            if (route.subMenu.length > 0) {
              return (
                checkPermisson(route.permissions) &&
                <Menu.SubMenu
                  icon={<i className={route.icon} style={{ fontSize: 18 }} />}
                  title={<div title={route.title}>{route.title}</div>}
                  key={route.key}

                >
                  {route.subMenu.map((item) => {
                    if (
                      item.subMenu.length > 0 &&
                      item.showMenuThird === true
                    ) {
                      return (
                        checkPermisson(item.permissions) &&
                        <Menu.SubMenu
                          icon={
                            <i
                              className={item.icon}
                              style={{ fontSize: 6, marginRight: 0, marginLeft: 10 }}
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
                                  style={{ fontSize: 6, marginRight: 0, marginLeft: 38 }}
                                />
                              }
                              key={item2.key}
															title={item2.subTitle || item2.title}
                            >
                              <Link to={item2.path}>{item2.title}</Link>
                            </Menu.Item>
                          ))}
                        </Menu.SubMenu>
                      );
                    }
                    return (
                      checkPermisson(item.permissions) &&
                      <Menu.Item
                        icon={
                          <i
                            className={item.icon}
                            style={{ fontSize: 6, marginRight: 0, marginLeft: 10 }}
                          />
                        }
                        key={item.key}
												title={item.subTitle || item.title}
                      >
                        {
                          !item.fullUrl ? (
                            <Link
                              to={item.path}
                              title={item.subTitle || item.title}
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <a href={item.fullUrl} target="_blank" rel="noreferrer">
                              {item.title}
                            </a>

                          )
                        }
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
                    );
                  })}
                </Menu.SubMenu>
              );
            }
            return (
              checkPermisson(route.permissions) &&
              <Menu.Item
                onClick={() => {
                  if (!route.isShow) {
                    window.location.href = route.path;
                  }
                }}
                icon={<i className={route.icon} style={{ fontSize: 18 }} />}
                key={route.key}
								title={route.subTitle || route.title}
              >
                {route.isShow ? (
                  <Link to={route.path} title={route.subTitle || route.title}>{route.title}</Link>
                ) : (
                  route.title
                )}
              </Menu.Item>
            );
          })}
        </Menu>
      </Scrollbars>
    </Sider>
  );
};

export default SidebarContainer;
