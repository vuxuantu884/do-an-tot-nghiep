import { Layout, Button, Badge, Avatar, Dropdown, Menu, Space } from "antd";
import logo from "assets/img/logo.svg";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { AccountResponse } from "model/account/account.model";
import { RiNotification2Line, RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { logoutAction } from "domain/actions/auth/auth.action";
import { StyledComponent } from "./header.container.styles";

type HeaderContainerProps = {
  onCollapse: () => void;
  account?: AccountResponse | null;
};

const HeaderContainer: React.FC<HeaderContainerProps> = (
  props: HeaderContainerProps
) => {
  const dispatch = useDispatch();
  const userMenu = (
    <Menu>
      <Menu.Item key="info">
        <Link to="#" type="text">
          <span>Thông tin tài khoản</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="info">
        <Link to={`${UrlConfig.ACCOUNTS}/me/update-password`}>
          <span>Đổi mật khẩu</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <Link onClick={() => dispatch(logoutAction())} to="#" type="text">
          <span>Đăng xuất</span>
        </Link>
      </Menu.Item>
    </Menu>
  );
  return (
    <StyledComponent>
      <Layout.Header>
        <div className="ant-layout-header-left">
          <Link to={UrlConfig.HOME}>
            <img src={logo} alt="" />
          </Link>
          <div className="header-right">
            <Button
              onClick={props.onCollapse}
              className="button-menu-collapse"
              icon={<FiMenu color={"black"} size={20} />}
            />
          </div>
        </div>
        <div className="ant-layout-header-right">
          <Space size={15}>
            <Badge count={0} className="buttonNotifyWrapper">
              <Button
                color={"#222222"}
                className="button-notify"
                icon={<RiNotification2Line />}
              />
            </Badge>
            <Dropdown
              className="layout-user"
              trigger={["click"]}
              placement="bottomRight"
              overlay={userMenu}
            >
              <div className="ant-layout-sider-user">
                <Avatar src="" size={36} />
                <div className="sider-user-info">
                  {props.account?.full_name}
                </div>
                <RiArrowDropDownLine size={25} color="#737373" />
              </div>
            </Dropdown>
          </Space>
        </div>
      </Layout.Header>
    </StyledComponent>
  );
};

export default HeaderContainer;
