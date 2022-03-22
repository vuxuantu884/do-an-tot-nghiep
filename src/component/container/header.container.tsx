import { Layout, Button, Badge, Avatar, Dropdown, Menu, Space } from "antd";
import logo from "assets/img/logo.svg";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { AccountResponse } from "model/account/account.model";
import { RiNotification2Line, RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "domain/actions/auth/auth.action";
import { StyledComponent } from "./header.container.styles";
import { RootReducerType } from "../../model/reducers/RootReducerType";
import logoDev from "assets/img/yody-logo-dev.svg";
import logoUat from "assets/img/yody-logo-uat.svg";

type HeaderContainerProps = {
  onCollapse: () => void;
  account?: AccountResponse | null;
};

const HeaderContainer: React.FC<HeaderContainerProps> = (
  props: HeaderContainerProps
) => {
  const user_id = useSelector(
    (state: RootReducerType) => state.userReducer.account?.user_id
  );
  const dispatch = useDispatch();

  const Logo = () => {
    if (window.location.host.startsWith("dev") || window.location.host.startsWith("localhost")) {
      return <img src={logoDev} alt="logo-mt-dev" />;
    } else if (window.location.host.startsWith("uat")) {
      return <img src={logoUat} alt="logo-mt-uat" />;
    } else {
      return <img src={logo} alt="logo-mt-prod" />;
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="info">
        <Link to={`${UrlConfig.ACCOUNTS}/me`}>
          <span>Thông tin tài khoản</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="info">
        <Link to={`${UrlConfig.ACCOUNTS}/me/update-password`}>
          <span>Đổi mật khẩu</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <Link onClick={() => dispatch(logoutAction(user_id))} to="#" type="text">
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
            <div className="logo-header">
            <Logo/>
            </div>
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
                <div className="sider-user-info yody-text-ellipsis">
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
