import { Button, Dropdown, Menu } from "antd";
import UrlConfig from "config/url.config";
import React from "react";
import { Link } from "react-router-dom";
import { StyledComponent } from "./styles";
import iconReturn from "assets/icon/return.svg";

type PropTypes = {
  orderId: number | null;
};

function ButtonCreateOrderReturn(props: PropTypes): JSX.Element | null {
  const { orderId } = props;

  if (!orderId) {
    return null;
  }
  const menu = (
    <Menu>
      <Menu.Item key="menu11h">
        <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderId}&type=online`}>
          Trả lại chuyển hàng
        </Link>
      </Menu.Item>
      <Menu.Item key="menu12h">
        <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderId}&type=offline`}>
          Trả lại tại quầy
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <StyledComponent>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
        <Button
          type="text"
          icon={<img src={iconReturn} alt="" width={20} title="Đổi trả hàng" />}
        ></Button>
      </Dropdown>
    </StyledComponent>
  );
}

export default ButtonCreateOrderReturn;
