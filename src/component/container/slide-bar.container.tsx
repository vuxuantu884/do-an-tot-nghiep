import { Button, Dropdown, Layout, Menu } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import logo from 'assets/img/logo.svg';
import { Link } from 'react-router-dom';
import arrow from 'assets/img/arrow.svg';
import logout from 'assets/img/logout.svg';
import menu from 'routes/menu';
import { findCurrentRoute } from 'utils/AppUtils';
import { DownOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootReducerType } from 'model/reducers/RootReducerType';
import {logoutAction} from 'domain/actions/account/auth.action';


type SlidebarContainerProps = {
  path: string
}
const { Sider, Header } = Layout;
const SlidebarContainer: React.FC<SlidebarContainerProps> = (props: SlidebarContainerProps) => {
  const { path } = props;
  let account = useSelector((state: RootReducerType) => state.userReducer.account)
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
  const [collapsed, setCollapsed] = useState(false);
  const onCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);
  const name = useMemo(() => {
    if(account === null) {
      return '';
    }
    return account?.full_name
  }, [account]);
  const width = useMemo(() => collapsed ? 35 : 90, [collapsed]);
  const userMenu = (
    <Menu>
      <Menu.Item key="logout">
        <Link to="#" onClick={() => dispatch(logoutAction())} type="text">
          <img src={logout} style={{marginRight: 10}} alt="" />
          <span>Đăng xuất</span>
        </Link>
      </Menu.Item>
    </Menu>
  );
  return (
    <Sider
      collapsed={collapsed}
      width={250}
      style={{
        height: '100vh',
      }}>
      <Header className="header-left" style={{ paddingLeft: 25, paddingRight: 25, backgroundColor: '#fff' }}>
        <Link className="brand-link" to="/">
          <img src={logo} style={{ width: width }} alt="Yody" className={collapsed ? 'zoom-in' : undefined} />
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
      <div className="view-avatar">
        <Dropdown trigger={['click']} placement={collapsed ? 'topCenter' : 'topLeft'} overlay={userMenu} >
          <Link to="#" className="menu-info" >
            <img className="avatar" src="https://scontent.fhph1-2.fna.fbcdn.net/v/t1.6435-9/56949224_288371682061828_6967061974932783104_n.jpg?_nc_cat=105&ccb=1-3&_nc_sid=8bfeb9&_nc_ohc=dI-Ql5l_WycAX-WPTcH&_nc_ht=scontent.fhph1-2.fna&oh=5ef29c2cdaaa3c2d63e21bf3b162d87b&oe=60D0400C" alt="" />
            {!collapsed && (
              <React.Fragment>
                <div className="right-avatar">
                  <span className="t-name">{name}</span>
                  <span className="t-position">NV Bán Hàng</span>
                </div>
                <DownOutlined color="#737373" />
              </React.Fragment>
            )}
          </Link>
        </Dropdown>
      </div>
    </Sider>
  )
}

export default SlidebarContainer;
