import { Layout, Menu } from "antd";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import menu from "routes/menu";
import { findCurrentRoute } from "utils/AppUtils";
import { Scrollbars } from "react-custom-scrollbars";

type SlidebarContainerProps = {
  path: string;
  collapsed: boolean;
};
const { Sider } = Layout;
const SlidebarContainer: React.FC<SlidebarContainerProps> = (
  props: SlidebarContainerProps
) => {
  const { path, collapsed } = props;
  let currentRoute = useMemo(() => findCurrentRoute(menu, path), [path]);
  const defaultSelectedKeys = [];
  if (currentRoute.current != null) {
    defaultSelectedKeys.push(currentRoute.current);
  }
  const defaultOpenKeys = [];
  if (currentRoute.subMenu != null) {
    defaultOpenKeys.push(currentRoute.subMenu);
  }

  return (
    <Sider collapsed={collapsed} collapsedWidth={60} width={240}>
      <Scrollbars autoHide>
        <Menu
          defaultOpenKeys={collapsed ? [] : defaultOpenKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          mode="inline"
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
                        <Link to={item.path} title={item.subTitle}>
                          {item.title}
                        </Link>
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

export default SlidebarContainer;
