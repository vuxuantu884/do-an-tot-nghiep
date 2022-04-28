import { Button, Dropdown, Menu } from "antd";
import UrlConfig from "config/url.config";
import React from "react";
import { Link } from "react-router-dom";
import { StyledComponent } from "./styles";
import iconReturn from "assets/icon/return.svg";
import { OrderModel } from "model/order/order.model";
import { isOrderFromPOS } from "utils/AppUtils";

type PropTypes = {
  orderDetail: OrderModel;
};

function ButtonCreateOrderReturn(props: PropTypes): JSX.Element | null {
  const { orderDetail } = props;

  if (!orderDetail.id) {
    return null;
  }
  const menu = (
    <Menu>
      <Menu.Item key="menu11h">
        <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderDetail.id}&type=online`}>
          Trả lại chuyển hàng
        </Link>
      </Menu.Item>
      <Menu.Item key="menu12h">
        <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderDetail.id}&type=offline`}>
          Trả lại tại quầy
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <StyledComponent>
      {isOrderFromPOS(orderDetail) ? (
        <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderDetail.id}&type=offline`}>
          <img src={iconReturn} alt="" width={20} title="Đổi trả hàng" />
        </Link>
      ) : (
        <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
          <Button
            type="text"
            icon={<img src={iconReturn} alt="" width={20} title="Đổi trả hàng" />}
          ></Button>
        </Dropdown>
      )}
    </StyledComponent>
  );
}

export default ButtonCreateOrderReturn;
