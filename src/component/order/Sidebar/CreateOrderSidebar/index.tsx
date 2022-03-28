import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, FormInstance, Input } from "antd";
import CustomInputTags from "component/custom/custom-input-tags";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import { OrderResponse, OrderSubStatusResponse } from "model/response/order/order.response";
import React, { useState } from "react";
import SidebarOrderHistory from "screens/yd-page/yd-page-order-create/component/CreateOrderSidebar/SidebarOrderHistory";
import CreateOrderSidebarOrderInformation from "../CreateOrderSidebarOrderInformation";
import { StyledComponent } from "./styles";

type PropType = {
  form: FormInstance<any>;
  tags: string;
  levelOrder?: number;
  storeId?: number | null;
  updateOrder?: boolean;
  customerId?: number | undefined;
  orderDetail?: OrderResponse | null;
  listOrderSubStatus?: OrderSubStatusResponse[];
  onChangeTag: (value: []) => void;
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
function CreateOrderSidebar(props: PropType): JSX.Element {
  const {onChangeTag, tags, customerId, orderDetail, listOrderSubStatus, form, storeId, updateOrder} =
    props;

  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);

  const handleUpdateSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  return (
    <StyledComponent>
      <CreateOrderSidebarOrderInformation form={form} orderDetail={orderDetail} storeId={storeId} updateOrder={updateOrder} />
      {listOrderSubStatus && (
        <SubStatusOrder
          subStatusCode={orderDetail?.sub_status_code}
          status={orderDetail?.status}
          orderId={orderDetail?.id}
          fulfillments={orderDetail?.fulfillments}
          handleUpdateSubStatus={handleUpdateSubStatus}
          setReload={() => {}}
          OrderDetailAllFulfillment={orderDetail}
        />
      )}
      <Card title="THÔNG TIN BỔ SUNG">
        <Form.Item name="customer_note" label="Ghi chú của khách">
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "80px"}}
          />
        </Form.Item>
        <Form.Item
          name="note"
          label="Ghi chú nội bộ"
          tooltip={{
            title: "Thêm thông tin ghi chú chăm sóc khách hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "80px"}}
          />
        </Form.Item>
        <Form.Item
          label="Nhãn"
          tooltip={{
            title: "Thêm từ khóa để tiện lọc đơn hàng",
            icon: <InfoCircleOutlined />,
          }}
          // name="tags"
        >
          <CustomInputTags onChangeTag={onChangeTag} tags={tags} />
        </Form.Item>
      </Card>
			{customerId && (
				<SidebarOrderHistory customerId={customerId} />
			)}
    </StyledComponent>
  );
};

export default CreateOrderSidebar;
