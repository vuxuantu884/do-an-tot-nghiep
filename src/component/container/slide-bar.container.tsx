import { Avatar, Dropdown, Layout, Menu } from "antd";
import React, { useCallback, useMemo } from "react";
import logo from "assets/img/logo.svg";
import { Link } from "react-router-dom";
import logout from "assets/img/logout.svg";
import menu from "routes/menu";
import { findCurrentRoute } from "utils/AppUtils";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { logoutAction } from "domain/actions/auth/auth.action";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Scrollbars } from "react-custom-scrollbars";

type SlidebarContainerProps = {
  path: string;
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
};
const { Sider } = Layout;
const SlidebarContainer: React.FC<SlidebarContainerProps> = (
  props: SlidebarContainerProps
) => {
  const { path, setCollapsed, collapsed } = props;
  let account = useSelector(
    (state: RootReducerType) => state.userReducer.account
  );
  let currentRoute = useMemo(() => findCurrentRoute(menu, path), [path]);
  const dispatch = useDispatch();
  const defaultSelectedKeys = [];
  if (currentRoute.current != null) {
    defaultSelectedKeys.push(currentRoute.current);
  }
  const defaultOpenKeys = [];
  if (currentRoute.subMenu != null) {
    defaultOpenKeys.push(currentRoute.subMenu);
  }
  const onCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);
  const name = useMemo(() => {
    if (account === null) {
      return "";
    }
    return account?.full_name;
  }, [account]);
  const userMenu = (
    <Menu>
      <Menu.Item key="logout">
        <Link to="#" onClick={() => dispatch(logoutAction())} type="text">
          <img src={logout} style={{ marginRight: 10 }} alt="" />
          <span>Đăng xuất</span>
        </Link>
      </Menu.Item>
    </Menu>
  );
  return (
    <Sider collapsed={collapsed} width={270} theme="light">
      <div className="logo">
        <img src={logo} alt="Yody" />
      </div>
      <button className="btn-collapsed" onClick={onCollapse}>
        <span className="anticon">
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </span>
      </button>
      <Scrollbars style={{ height: 'calc(100% - 85px)' }} autoHide>
        <Menu
          defaultOpenKeys={collapsed? [] : defaultOpenKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          className="yody-menu"
          mode="inline"
        >
          {menu.map((route) => {
            if (route.subMenu.length > 0) {
              return (
                <Menu.SubMenu
                  icon={
                    <i
                      className={route.icon}
                      style={{ fontSize: 24, marginRight: 10}}
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
                            style={{ fontSize: 8, marginRight: 10 }}
                          />
                        }
                        key={item.key}
                      >
                        <Link to={item.path}>{item.title}</Link>
                      </Menu.Item>
                    );
                  })}
                </Menu.SubMenu>
              );
            }
            return (
              <Menu.Item
                icon={
                  <i
                    className={route.icon}
                    style={{ fontSize: 24, marginRight: 10 }}
                  />
                }
                key={route.key}
              >
                <Link to={route.path}>{route.title}</Link>
              </Menu.Item>
            );
          })}
        </Menu>
      </Scrollbars>
      <Dropdown
        trigger={["click"]}
        placement={collapsed ? "topCenter" : "topLeft"}
        overlay={userMenu}
      >
        <div className="ant-layout-sider-user">
          <Avatar
            src="https://scontent.fhph1-2.fna.fbcdn.net/v/t1.6435-9/56949224_288371682061828_6967061974932783104_n.jpg?_nc_cat=105&ccb=1-3&_nc_sid=8bfeb9&_nc_ohc=dI-Ql5l_WycAX-WPTcH&_nc_ht=scontent.fhph1-2.fna&oh=5ef29c2cdaaa3c2d63e21bf3b162d87b&oe=60D0400C"
            size={40}
          />
          <div className="sider-user-info">
            <p>{name}</p>
            <b>NV Bán hàng</b>
          </div>
          <span className="sider-user-info-icon">
            <FiChevronDown />
          </span>
        </div>
      </Dropdown>
    </Sider>
  );
};

export default SlidebarContainer;
