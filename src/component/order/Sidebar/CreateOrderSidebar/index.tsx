import { Card, FormInstance } from "antd";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import SideBarOrderSpecial from "component/order/special-order/SideBarOrderSpecial";
import { StoreResponse } from "model/core/store.model";
import { OrderPageTypeModel } from "model/order/order.model";
import {
  SpecialOrderModel,
  SpecialOrderResponseModel,
  SpecialOrderType,
} from "model/order/special-order.model";
import { OrderResponse, OrderSubStatusResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import React, { useState } from "react";
import SidebarOrderHistory from "screens/yd-page/yd-page-order-create/component/CreateOrderSidebar/SidebarOrderHistory";
import { EnumOrderType } from "utils/Constants";
import CreateOrderSidebarOrderExtraInformation from "../CreateOrderSidebarOrderExtraInformation";
import CreateOrderSidebarOrderInformation from "../CreateOrderSidebarOrderInformation";
import { StyledComponent } from "./styles";

type PropTypes = {
  form: FormInstance<any>;
  specialOrderForm: FormInstance<any>;
  specialOrder?: SpecialOrderResponseModel;
  tags: string;
  levelOrder?: number;
  storeId?: number | null;
  updateOrder?: boolean;
  customerId?: number | undefined;
  orderDetail?: OrderResponse | null;
  listOrderSubStatus?: OrderSubStatusResponse[];
  onChangeTag: (value: []) => void;
  setReload: (value: boolean) => void;
  promotionTitle: string;
  setPromotionTitle: (value: string) => void;
  defaultReceiveReturnStore?: StoreResponse;
  handleCreateOrUpdateSpecialOrder: (params: SpecialOrderModel) => Promise<void>;
  orderPageType: OrderPageTypeModel;
  setIsSpecialOrderEcommerce?: (v: boolean) => void;
  orderSource?: SourceResponse | null;
  orderType?: string;
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
    specialOrderForm,
    specialOrder,
    storeId,
    updateOrder,
    setReload,
    promotionTitle,
    setPromotionTitle,
    defaultReceiveReturnStore,
    handleCreateOrUpdateSpecialOrder,
    orderPageType,
    setIsSpecialOrderEcommerce,
    orderSource,
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
        orderSource={orderSource}
      />
      {listOrderSubStatus && (
        <SubStatusOrder
          subStatusCode={orderDetail?.sub_status_code}
          orderId={orderDetail?.id}
          handleUpdateSubStatus={handleUpdateSubStatus}
          OrderDetailAllFulfillment={orderDetail}
          setReload={updateOrder ? () => {} : setReload} // update thì ko load lại
          isDisableUpdate={updateOrder} // update thì ko cho thay đổi subStatus
          defaultReceiveReturnStore={defaultReceiveReturnStore}
        />
      )}
      {props.orderType !== EnumOrderType.b2b && (
        <SideBarOrderSpecial
          handleCreateOrUpdateSpecialOrder={handleCreateOrUpdateSpecialOrder}
          handleDeleteSpecialOrder={() => {}}
          specialOrderView={SpecialOrderType.update}
          setSpecialOrderView={() => {}}
          defaultSpecialType={undefined}
          orderPageType={orderPageType}
          form={specialOrderForm}
          specialOrder={specialOrder || orderDetail?.special_order}
          setIsSpecialOrderEcommerce={setIsSpecialOrderEcommerce}
        />
      )}

      <Card title="THÔNG TIN BỔ SUNG">
        <CreateOrderSidebarOrderExtraInformation
          onChangeTag={onChangeTag}
          tags={tags}
          promotionTitle={promotionTitle}
          setPromotionTitle={setPromotionTitle}
        />
      </Card>
      {customerId && <SidebarOrderHistory customerId={customerId} />}
    </StyledComponent>
  );
}

export default CreateOrderSidebar;
