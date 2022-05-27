import React, {useEffect, useState} from "react";
import { Layout, Button, Badge, Avatar, Dropdown, Menu, Space, Tooltip } from "antd";
import logo from "assets/img/logo.svg";
import UrlConfig, { AccountUrl } from "config/url.config";
import { Link } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { RiNotification2Line, RiArrowDropDownLine } from "react-icons/ri";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "domain/actions/auth/auth.action";
import { StyledComponent } from "./header.container.styles";
import { RootReducerType } from "../../model/reducers/RootReducerType";
import logoDev from "assets/img/yody-logo-dev.svg";
import logoUat from "assets/img/yody-logo-uat.svg";
import devEnvMarkup from "assets/img/dev-env-markup.png";
import uatEnvMarkup from "assets/img/uat-env-markup.png";
import hotlineIcon from "assets/icon/hotline.svg";
import { AppConfig } from "config/app.config";

type HeaderContainerProps = {
  onCollapse: () => void;
	isShowHeader: boolean;
	setIsShowHeader: (value: boolean) => void;
};

const hotlineNumber = "0888 464 258";
const supportLink = "https://rd.zapps.vn/detail/1034167903642421755?id=d1838e6d3228db768239&pageId=317413297&zl3rd=815789662550058820";

const HeaderContainer: React.FC<HeaderContainerProps> = (
  props: HeaderContainerProps
) => {
  const user_id = useSelector(
    (state: RootReducerType) => state.userReducer.account?.user_id
  );
  const myFullname = useSelector((state: RootReducerType) => state.userReducer.account?.full_name);

  const dispatch = useDispatch();
  const [isShowBtnDD, setIsShowBtnDD] = useState<boolean>(true);
  const [isTabletMobileScreen, setIsTabletMobileScreen] = useState<boolean>(false);

  useEffect(() => {
    if(window.location.pathname.indexOf('YDpage') < 0) {
			setIsShowBtnDD(false)
			props.setIsShowHeader(true)
		}
  }, [props]);

  const Logo = () => {
    if (AppConfig.ENV === "DEV") {
      return <img src={logoDev} alt="logo-mt-dev" />;
    } else if (AppConfig.ENV === "UAT") {
      return <img src={logoUat} alt="logo-mt-uat" />;
    } else {
      return <img src={logo} alt="logo-mt-prod" />;
    }
  };

  const DevAndUatMarkup = () => {
    if (AppConfig.ENV === "DEV") {
      return <img src={devEnvMarkup} alt="logo-dev" />;
    } else if (AppConfig.ENV === "UAT") {
      return <img src={uatEnvMarkup} alt="logo-uat" />;
    } else {
      return <></>;
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
        <Link to={`${AccountUrl.UPDATE_PASSWORD}`}>
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

  const linkToSupportPage = () => {
    window.open(supportLink, "_blank");
  };

  const  callHotlineSupport= () => {
    window.location.href=`tel:${hotlineNumber}`;
  };

  useEffect(() => {
    if (window.innerWidth <= 900 )  {
      setIsTabletMobileScreen(true);
    }
  }, []);


  return (
    <StyledComponent>
      <Layout.Header className={props.isShowHeader ? 'show' : 'hide'}>
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
          <div className="markup-env">
            <DevAndUatMarkup/>
          </div>
          <Space size={15}>
            {isTabletMobileScreen ?
              <span>
                <img onClick={callHotlineSupport} style={{ marginRight: 10 }} src={hotlineIcon} alt="hotline" />
              </span>
              :
              <>
                <div className="hotline-info">
                  <img style={{ marginRight: 5 }} src={hotlineIcon} alt="hotline" />
                  <span>
                    {"Hotline: "}
                    <Tooltip title="Click để gọi hỗ trợ" color="blue" placement="bottom">
                      <span className="phone-number" onClick={callHotlineSupport}>{hotlineNumber}</span>
                    </Tooltip>
                  </span>
                </div>
                <span className="support-link" onClick={linkToSupportPage}>{"Hướng dẫn gửi yêu cầu »"}</span>
              </>
            }

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
                  {myFullname}
                </div>
                <RiArrowDropDownLine size={25} color="#737373" />
              </div>
            </Dropdown>
          </Space>
        </div>
				{isShowBtnDD && 
					<div className="drop-down-button">
						<Button
							onClick={() => props.setIsShowHeader(!props.isShowHeader)}
							className="button-menu-collapse"
							icon={
								props.isShowHeader ? <AiOutlineCaretUp color={"black"} size={20} /> : <AiOutlineCaretDown color={"black"} size={20} />
							}
						/>
					</div>
				}
      </Layout.Header>
    </StyledComponent>
  );
};

export default HeaderContainer;
