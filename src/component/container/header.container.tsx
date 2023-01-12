import { Avatar, Button, Dropdown, Layout, Menu, Space } from "antd";
import gopyIcon from "assets/icon/gop-y.svg";
import hotlineIcon from "assets/icon/hotline.svg";
import yodyAppIcon from "assets/icon/yody-app.svg";
import devEnvMarkup from "assets/img/dev-env-markup.png";
import gapoIcon from "assets/img/gapo_icon.png";
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
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootReducerType } from "../../model/reducers/RootReducerType";
import { StyledComponent } from "./header.container.styles";

type HeaderContainerProps = {
  onCollapse: () => void;
  isShowHeader: boolean;
  setIsShowHeader: (value: boolean) => void;
};

const UNICORN_HOTLINE = "0888 464 258";
const UNICORN_GAPO_URL = "https://www.gapowork.vn/group/unicorn";
const FEEDBACK_FORM_URL = "https://forms.gle/zCgBGA7Th7MDNNL58";
const OTHER_YODY_PLATFORMS_URL = "https://yody.io";

const HeaderContainer: React.FC<HeaderContainerProps> = (props: HeaderContainerProps) => {
  const user_id = useSelector((state: RootReducerType) => state.userReducer.account?.user_id);
  const myName = useSelector((state: RootReducerType) => state.userReducer.account?.full_name);

  const dispatch = useDispatch();
  const [isShowBtnDD, setIsShowBtnDD] = useState<boolean>(true);
  const [firstCharName, setFirstCharName] = useState<string>("");

  useEffect(() => {
    if (window.location.pathname.indexOf("YDpage") < 0 && window.location.pathname.indexOf("social") < 0) {
      setIsShowBtnDD(false);
      props.setIsShowHeader(true);
    }
  }, [props]);

  useEffect(() => {
    if (myName) {
      setFirstCharName(myName.charAt(0));
    }
  }, [myName]);

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
            <div className="support">
              <a href={`tel:${UNICORN_HOTLINE}`} className="support-link">
                <img className="support-icon" src={hotlineIcon} alt="hotline" />
                <span className="hotline">
                  {"Hotline: "}
                  <span className="phone-number">{UNICORN_HOTLINE}</span>
                </span>
              </a>

              <a
                href={UNICORN_GAPO_URL}
                target={"_blank"}
                rel="noreferrer"
                className="support-link"
              >
                <img className="support-icon" src={gapoIcon} alt="gapo" />
                <span className="support-content"> {"Nhóm hỗ trợ Gapo"}</span>
              </a>

              <a
                href={FEEDBACK_FORM_URL}
                target={"_blank"}
                rel="noreferrer"
                className="support-link"
              >
                <img className="support-icon" src={gopyIcon} alt="gop y" />
                <span className="support-content"> {"Góp ý"}</span>
              </a>

              <a
                href={OTHER_YODY_PLATFORMS_URL}
                target={"_blank"}
                rel="noreferrer"
                className="support-link"
              >
                <img className="support-icon" src={yodyAppIcon} alt="gapo" />
                <span className="support-content">Ứng dụng khác </span>
              </a>
            </div>

            <Dropdown
              className="layout-user"
              trigger={["click"]}
              placement="bottomRight"
              overlay={userMenu}
            >
              <div className="ant-layout-sider-user">
                <Avatar size={36} className="avatar">
                  {firstCharName}
                </Avatar>
                <div className="sider-user-info text-ellipsis">{myName}</div>
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
