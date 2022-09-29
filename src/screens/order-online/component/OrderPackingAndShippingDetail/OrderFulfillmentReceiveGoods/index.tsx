import { Alert, Button, Form, FormInstance, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import ModalConfirm from "component/modal/ModalConfirm";
import { StoreResponse } from "model/core/store.model";
import { FulFillmentResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { FulFillmentStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  fulfillment: FulFillmentResponse;
  goodsReturnCallback: (id: number | null) => void;
  currentStores?: StoreResponse[];
  isShowReceiveProductConfirmModal: boolean;
  setIsShowReceiveProductConfirmModal: (value: boolean) => void;
  form: FormInstance<any>;
  defaultReceiveReturnStore?: StoreResponse;
};

function OrderFulfillmentReceiveGoods(props: PropTypes) {
  const {
    fulfillment,
    goodsReturnCallback,
    currentStores,
    isShowReceiveProductConfirmModal,
    setIsShowReceiveProductConfirmModal,
    form,
    defaultReceiveReturnStore,
  } = props;

  const [storeName, setStoreName] = useState<string | undefined>("");

  console.log("defaultReceiveReturnStore", defaultReceiveReturnStore);

  const checkIfShowReceiveGoodsButton = (fulfillment: FulFillmentResponse) => {
    return fulfillment.return_status === FulFillmentStatus.RETURNING;
  };

  useEffect(() => {
    setStoreName(defaultReceiveReturnStore?.name);
  }, [defaultReceiveReturnStore?.name]);

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
                <Select.Option key={index} value={item.id || 0}>
                  {item.name}
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
