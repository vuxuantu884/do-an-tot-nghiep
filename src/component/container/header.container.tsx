import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space, Tooltip } from "antd";
import hotlineIcon from "assets/icon/hotline.svg";
import youtubeIcon from "assets/icon/youtube-icon.svg";
import devEnvMarkup from "assets/img/dev-env-markup.png";
import gapoIcon from "assets/img/gapo_icon.png";
import gopyIcon from "assets/icon/gop-y.svg";
import logo from "assets/img/logo.svg";
import uatEnvMarkup from "assets/img/uat-env-markup.png";
import logoDev from "assets/img/yody-logo-dev.svg";
import logoUat from "assets/img/yody-logo-uat.svg";
import { AppConfig } from "config/app.config";
import UrlConfig, { AccountUrl } from "config/url.config";
import { logoutAction } from "domain/actions/auth/auth.action";
import React, { useEffect, useState } from "react";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine, RiNotification2Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootReducerType } from "../../model/reducers/RootReducerType";
import { StyledComponent } from "./header.container.styles";
type HeaderContainerProps = {
  onCollapse: () => void;
  isShowHeader: boolean;
  setIsShowHeader: (value: boolean) => void;
};

const hotlineNumber = "0888 464 258";
const youtubeUrl = "https://www.youtube.com/channel/UCVgds2lhgxftOxEtQJooKKQ/playlists";
const gapoUrl = "https://www.gapowork.vn/group/unicorn";
const gopyUrl = "https://forms.gle/zCgBGA7Th7MDNNL58";

const HeaderContainer: React.FC<HeaderContainerProps> = (props: HeaderContainerProps) => {
  const user_id = useSelector((state: RootReducerType) => state.userReducer.account?.user_id);
  const myFullname = useSelector((state: RootReducerType) => state.userReducer.account?.full_name);

  const dispatch = useDispatch();
  const [isShowBtnDD, setIsShowBtnDD] = useState<boolean>(true);
  const [isTabletMobileScreen, setIsTabletMobileScreen] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const [firstCharName, setFirstCharName] = useState<string>("");

  useEffect(() => {
    if (window.location.pathname.indexOf("YDpage") < 0) {
      setIsShowBtnDD(false);
      props.setIsShowHeader(true);
    }
  }, [props]);

  useEffect(() => {
    if (myFullname) {
      setFirstCharName(myFullname.charAt(0));
    }
  }, [myFullname]);

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

  const callHotlineSupport = () => {
    window.location.href = `tel:${hotlineNumber}`;
  };

  window.onresize = () => {
    setScreenWidth(window.innerWidth);
  };

  useEffect(() => {
    if (
      screenWidth < 900 ||
      ((AppConfig.ENV === "DEV" || AppConfig.ENV === "UAT") && screenWidth < 1100)
    ) {
      setIsTabletMobileScreen(true);
    } else {
      setIsTabletMobileScreen(false);
    }
  }, [screenWidth]);

  return (
    <StyledComponent>
      <Layout.Header className={props.isShowHeader ? "show" : "hide"}>
        <div className="ant-layout-header-left">
          <Link to={UrlConfig.HOME}>
            <div className="logo-header">
              <Logo />
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
            <DevAndUatMarkup />
          </div>
          <Space size={24}>
            {isTabletMobileScreen ? (
              <span>
                <img
                  onClick={callHotlineSupport}
                  style={{ marginRight: 10 }}
                  src={hotlineIcon}
                  alt="hotline"
                />
              </span>
            ) : (
              <div className="support">
                <Tooltip
                  title="Click để gọi hỗ trợ"
                  color="blue"
                  placement="bottom"
                  className="support-link"
                >
                  <img className="support-icon" src={hotlineIcon} alt="hotline" />
                  <span>
                    {"Hotline: "}
                    <a href={`tel:${hotlineNumber}`} className="phone-number">
                      {hotlineNumber}
                    </a>
                  </span>
                </Tooltip>

                <a href={youtubeUrl} className="support-link" target={"_blank"} rel="noreferrer">
                  <img className="support-icon" src={youtubeIcon} alt="Youtube" />
                  {"Unicorn Channel »"}
                </a>
                <a href={gapoUrl} target={"_blank"} rel="noreferrer" className="support-link">
                  <img className="support-icon" src={gapoIcon} alt="gapo" />
                  {"Nhóm hỗ trợ Gapo »"}
                </a>

                <a href={gopyUrl} target={"_blank"} rel="noreferrer" className="support-link">
                  <img className="support-icon" src={gopyIcon} alt="gop y" />
                  {"Góp ý »"}
                </a>
              </div>
            )}

            <Badge count={0} className="notify-badge">
              <Button color={"#222222"} className="button-notify" icon={<RiNotification2Line />} />
            </Badge>
            <Dropdown
              className="layout-user"
              trigger={["click"]}
              placement="bottomRight"
              overlay={userMenu}
            >
              <div className="ant-layout-sider-user">
                <Avatar src="" size={36} className="avatar">
                  {firstCharName}
                </Avatar>
                <div className="sider-user-info yody-text-ellipsis">{myFullname}</div>
                <RiArrowDropDownLine size={25} color="#737373" />
              </div>
            </Dropdown>
          </Space>
        </div>
        {isShowBtnDD && (
          <div className="drop-down-button">
            <Button
              onClick={() => props.setIsShowHeader(!props.isShowHeader)}
              className="button-menu-collapse"
              icon={
                props.isShowHeader ? (
                  <AiOutlineCaretUp color={"black"} size={20} />
                ) : (
                  <AiOutlineCaretDown color={"black"} size={20} />
                )
              }
            />
          </div>
        )}
      </Layout.Header>
    </StyledComponent>
  );
};

export default HeaderContainer;
