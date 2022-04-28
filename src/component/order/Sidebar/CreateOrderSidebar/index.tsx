import { Card, FormInstance } from "antd";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import { OrderResponse, OrderSubStatusResponse } from "model/response/order/order.response";
import React, { useState } from "react";
import SidebarOrderHistory from "screens/yd-page/yd-page-order-create/component/CreateOrderSidebar/SidebarOrderHistory";
import CreateOrderSidebarOrderExtraInformation from "../CreateOrderSidebarOrderExtraInformation/CreateOrderSidebarOrderExtraInformation";
import CreateOrderSidebarOrderInformation from "../CreateOrderSidebarOrderInformation";
import { StyledComponent } from "./styles";

type PropTypes = {
  form: FormInstance<any>;
  tags: string;
  levelOrder?: number;
  storeId?: number | null;
  updateOrder?: boolean;
  customerId?: number | undefined;
  orderDetail?: OrderResponse | null;
  listOrderSubStatus?: OrderSubStatusResponse[];
  onChangeTag: (value: []) => void;
  setReload: (value: boolean) => void;
};

/**
 * sử dụng trong tạo đơn hàng, sửa đơn hàng, clone
 *
 * leverOrder: phân quyền
 *
 * updateOrder: sửa đơn hàng
 *
 * customerId: id khách hàng, để lấy thông tin lịch sử giao dịch
 *
 * orderDetail: chi tiết đơn hàng
 *
 * onChangeTag: xử lý khi thay đổi tag
 */
function CreateOrderSidebar(props: PropTypes): JSX.Element {
  const {
    onChangeTag,
    tags,
    customerId,
    orderDetail,
    listOrderSubStatus,
    form,
    storeId,
    updateOrder,
    setReload,
  } = props;

  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);

  const handleUpdateSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  return (
    <StyledComponent>
      <CreateOrderSidebarOrderInformation
        form={form}
        orderDetail={orderDetail}
        storeId={storeId}
        updateOrder={updateOrder}
      />
      {listOrderSubStatus && (
        <SubStatusOrder
          subStatusCode={orderDetail?.sub_status_code}
          status={orderDetail?.status}
          orderId={orderDetail?.id}
          handleUpdateSubStatus={handleUpdateSubStatus}
          OrderDetailAllFulfillment={orderDetail}
          setReload={setReload}
        />
      )}
      <Card title="THÔNG TIN BỔ SUNG">
        <CreateOrderSidebarOrderExtraInformation onChangeTag={onChangeTag} tags={tags} />
      </Card>
      {customerId && <SidebarOrderHistory customerId={customerId} />}
    </StyledComponent>
  );
}

export default CreateOrderSidebar;
