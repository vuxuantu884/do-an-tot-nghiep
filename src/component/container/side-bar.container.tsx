import { Layout, Menu, Tooltip } from "antd";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import menu from "routes/menu";
import { findCurrentRoute } from "utils/AppUtils";
import { Scrollbars } from "react-custom-scrollbars";

type SidebarContainerProps = {
  path: string;
  collapsed: boolean;
};
const { Sider } = Layout;
const SidebarContainer: React.FC<SidebarContainerProps> = (
  props: SidebarContainerProps
) => {
  const { path, collapsed } = props;
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
    <Sider collapsed={collapsed} collapsedWidth={60} width={240} style={{zIndex: 2}}>
      <Scrollbars autoHide>
        <Menu
          defaultOpenKeys={collapsed ? [] : defaultOpenKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          mode="inline"
          style={{borderRight: 'none'}}
        >
          {menu.map((route) => {
            if (route.subMenu.length > 0) {
              return (
                <Menu.SubMenu
                  icon={
                    <i
                      className={route.icon}
                      style={{ fontSize: 24, marginRight: 10 }}
                    />
                  }
                  title={route.title}
                  key={route.key}
                >
                  {route.subMenu.map((item) => {
                    if (
                      item.subMenu.length > 0 &&
                      item.showMenuThird === true
                    ) {
                      return (
                        <Menu.SubMenu
                          icon={
                            <i
                              className={item.icon}
                              style={{ fontSize: 8, marginRight: 0 }}
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
                                  style={{ fontSize: 8, marginRight: 0 }}
                                />
                              }
                              key={item2.key}
                            >
                              <Link to={item2.path}>{item2.title}</Link>
                            </Menu.Item>
                          ))}
                        </Menu.SubMenu>
                      );
                    }
                    return (
                      <Menu.Item
                        icon={
                          <i
                            className={item.icon}
                            style={{ fontSize: 8, marginRight: 0 }}
                          />
                        }
                        key={item.key}
                      >
                        {<Link to={item.path} title={item.subTitle || item.title}>{item.title}</Link>}
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
              <Menu.Item
                onClick={() => {
                  if (!route.isShow) {
                    window.location.href = route.path;
                  }
                }}
                icon={
                  <i
                    className={route.icon}
                    style={{ fontSize: 24, marginRight: 10 }}
                  />
                }
                key={route.key}
              >
                {route.isShow ? (
                  <Link to={route.path}>{route.title}</Link>
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
