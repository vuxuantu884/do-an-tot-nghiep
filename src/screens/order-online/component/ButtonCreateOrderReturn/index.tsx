import { Button, Dropdown, Menu } from "antd";
import iconReturn from "assets/icon/return.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { OrderModel } from "model/order/order.model";
import { CustomerOrderHistoryResponse } from "model/response/order/order.response";
import { Link } from "react-router-dom";
import { isOrderFromPOS } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderDetail: OrderModel | CustomerOrderHistoryResponse;
};

function ButtonCreateOrderReturn(props: PropTypes): JSX.Element | null {
  const { orderDetail } = props;

  if (!orderDetail.id) {
    return null;
  }
  const menu = (
    <Menu>
      <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.orders_return_online]} passThrough>
        {(isPassed: boolean) => (
          <Menu.Item
            key="menu11h"
            disabled={!isPassed}
            title={!isPassed ? "Tài khoản không được cấp quyền trả lại chuyển hàng online" : ""}
          >
            <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderDetail.id}&type=online`}>
              Trả lại chuyển hàng
            </Link>
          </Menu.Item>
        )}
      </AuthWrapper>
      <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.orders_return_at_the_store]} passThrough>
        {(isPassed: boolean) => (
          <Menu.Item
            key="menu12h"
            disabled={!isPassed}
            title={!isPassed ? "Tài khoản không được cấp quyền trả tại quầy online" : ""}
          >
            <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderDetail.id}&type=offline`}>
              Trả lại tại quầy
            </Link>
          </Menu.Item>
        )}
      </AuthWrapper>
    </Menu>
  );

  return (
    <StyledComponent>
      {isOrderFromPOS(orderDetail) ? (
        <AuthWrapper acceptPermissions={[ORDER_PERMISSIONS.orders_return_offline]} passThrough>
          {(isPassed: boolean) =>
            isPassed ? (
              <Link to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${orderDetail.id}&type=offline`}>
                <img src={iconReturn} alt="" width={20} title={"Đổi trả hàng"} />
              </Link>
            ) : (
              <img
                src={iconReturn}
                alt=""
                width={20}
                title={"Tài khoản không được cấp quyền đổi trả offline"}
                style={{ opacity: 0.5 }}
              />
            )
          }
        </AuthWrapper>
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
