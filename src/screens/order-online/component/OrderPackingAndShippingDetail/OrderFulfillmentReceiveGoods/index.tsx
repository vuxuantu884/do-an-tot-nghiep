import { Alert, Button, Form, FormInstance, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import ModalConfirm from "component/modal/ModalConfirm";
import { AccountStoreResponse } from "model/account/account.model";
import { FulFillmentResponse } from "model/response/order/order.response";
import React, { useState } from "react";
import { FulFillmentStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  fulfillment: FulFillmentResponse;
  goodsReturnCallback: (id: number | null) => void;
  currentStores?: AccountStoreResponse[];
  isShowReceiveProductConfirmModal: boolean;
  setIsShowReceiveProductConfirmModal: (value: boolean) => void;
  form: FormInstance<any>;
};

function OrderFulfillmentReceiveGoods(props: PropTypes) {
  const {
    fulfillment,
    goodsReturnCallback,
    currentStores,
    isShowReceiveProductConfirmModal,
    setIsShowReceiveProductConfirmModal,
    form,
  } = props;

  let initStoreName = currentStores?.length === 1 ? currentStores[0].store : "";

  const [storeName, setStoreName] = useState(initStoreName);

  const checkIfShowReceiveGoodsButton = (fulfillment: FulFillmentResponse) => {
    return fulfillment.return_status === FulFillmentStatus.RETURNING;
  };

  if (!checkIfShowReceiveGoodsButton(fulfillment)) {
    return null;
  }

  return (
    <StyledComponent>
      <div className="buttonReceiveGoodsWrapper">
        <div className="buttonReceiveGoodsWrapper__content">
          <Form.Item
            name="ffm_receive_return_store_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn kho cửa hàng!",
              },
            ]}
          >
            <CustomSelect
              showSearch
              allowClear
              placeholder="Chọn cửa hàng"
              notFoundContent="Không tìm kho cửa hàng"
              onChange={(value, option: any) => {
                if (option && option.children) {
                  setStoreName(option.children);
                }
              }}
            >
              {(currentStores || []).map((item, index) => (
                <Select.Option key={index} value={item.store_id || 0}>
                  {item.store}
                </Select.Option>
              ))}
            </CustomSelect>
          </Form.Item>
          <Button
            key={fulfillment.id}
            type="primary"
            className="ant-btn-outline fixed-button text-right"
            onClick={() => {
              form.validateFields(["ffm_receive_return_store_id"]).then(() => {
                setIsShowReceiveProductConfirmModal(true);
              });
            }}
          >
            Nhận hàng
          </Button>
        </div>
      </div>
      <Alert
        message={
          <StyledComponent>
            <div className="warningWrapper">
              Lưu ý : Nếu bạn đã nhận hàng từ hãng vận chuyển hãy chọn đúng kho để cộng lại về kho
            </div>
          </StyledComponent>
        }
        type="warning"
        closable
      />
      <ModalConfirm
        visible={isShowReceiveProductConfirmModal}
        onOk={() => {
          setIsShowReceiveProductConfirmModal(false);
          goodsReturnCallback(fulfillment.id);
        }}
        onCancel={() => setIsShowReceiveProductConfirmModal(false)}
        title={`Bạn có chắc chắn nhận hàng về kho ${storeName}`}
        subTitle={
          <span>Tồn kho sẽ được cộng về kho {storeName}! Vui lòng cân nhắc trước khi đồng ý!</span>
        }
      />
    </StyledComponent>
  );
}

export default OrderFulfillmentReceiveGoods;
