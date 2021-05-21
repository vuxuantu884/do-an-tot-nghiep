import { Button, Layout, Menu } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import logo from 'assets/img/logo.svg';
import { Link } from 'react-router-dom';
import arrow from 'assets/img/arrow.svg';
import menu from 'routes/menu';
import { findCurrentRoute } from 'utils/AppUtils';


type SlidebarContainerProps = {
  path: string
}
const {Sider, Header} = Layout;
const SlidebarContainer: React.FC<SlidebarContainerProps> = (props: SlidebarContainerProps) => {
  const {path} = props;
  let currentRoute = useMemo(() => findCurrentRoute(menu, path), [path]);
  const defaultSelectedKeys = [];
  if (currentRoute.current != null) {
    defaultSelectedKeys.push(currentRoute.current);
  }
  const defaultOpenKeys = [];
  if (currentRoute.subMenu != null) {
    defaultOpenKeys.push(currentRoute.subMenu);
  }
  const [collapsed, setCollapsed] = useState(false);
  const onCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);
  const width = useMemo(()=> collapsed ? 35: 90, [collapsed]);
  return (
    <Sider 
      collapsed={collapsed}
      width={256}
      style={{
        height: '100vh',
      }}>
      <Header className="header-left" style={{ paddingLeft: 25, paddingRight: 25, backgroundColor: '#fff' }}>
        <Link className="brand-link" to="/">
          <img src={logo} style={{width: width}} alt="Yody" className={collapsed ? 'zoom-in' : undefined} />
        </Link>
        <Button onClick={onCollapse} className="button-collspae">
          <img src={arrow} alt="collsape-menu" />
        </Button>
      </Header>
      <Menu 
        defaultOpenKeys={defaultOpenKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        className="yody-menu"
        mode="inline">
         {menu.map((route) => {
          if (route.subMenu.length > 0) {
            return (
              <Menu.SubMenu icon={<i className={route.icon} style={{ fontSize: 24, marginRight: 16 }} />} title={route.title} key={route.key}>
                {route.subMenu.map((item) => {
                  return (
                    <Menu.Item icon={<i className={item.icon} style={{ fontSize: 8, marginRight: 16 }} />} key={item.key}>
                      <Link to={item.path}>{item.title}</Link>
                    </Menu.Item>
                  );
                })}
              </Menu.SubMenu>
            );
          }
          return (
            <Menu.Item icon={<i className={route.icon} style={{ fontSize: 24, marginRight: 16 }} />} key={route.key}>
              <Link to={route.path}>{route.title}</Link>
            </Menu.Item>
          );
        })}
      </Menu>
    </Sider>
  )
}

export default SlidebarContainer;
