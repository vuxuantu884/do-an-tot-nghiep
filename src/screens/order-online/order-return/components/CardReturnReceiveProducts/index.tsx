import { Button, Card, Checkbox, Form, FormInstance, Select, Tag } from "antd";
import CustomSelect from "component/custom/select.custom";
import ModalConfirm from "component/modal/ModalConfirm";
import { StoreResponse } from "model/core/store.model";
import { OrderResponse } from "model/response/order/order.response";
import React, { useEffect, useRef, useState } from "react";
import { isOrderFromPOS } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  isDetailPage?: boolean;
  isReceivedReturnProducts: boolean;
  handleReceivedReturnProductsToStore: () => void;
  currentStores: StoreResponse[] | undefined;
  isShowReceiveProductConfirmModal: boolean;
  setIsReceivedReturnProducts?: (value: boolean) => void;
  setIsShowReceiveProductConfirmModal: (value: boolean) => void;
  form: FormInstance<any>;
  receivedStoreName?: string;
  OrderDetail: OrderResponse | null;
  defaultReceiveReturnStore?: StoreResponse;
};
function CardReturnReceiveProducts(props: PropTypes) {
  const {
    isDetailPage,
    isReceivedReturnProducts,
    handleReceivedReturnProductsToStore,
    currentStores,
    isShowReceiveProductConfirmModal,
    setIsReceivedReturnProducts,
    setIsShowReceiveProductConfirmModal,
    form,
    receivedStoreName,
    OrderDetail,
    defaultReceiveReturnStore,
  } = props;

  const [storeName, setStoreName] = useState<string | undefined>("");

  const okButtonRef = useRef<any>();

  console.log("defaultReceiveReturnStore", defaultReceiveReturnStore);

  const renderCardTitle = () => {
    return (
      <React.Fragment>
        Nhận hàng
        {isReceivedReturnProducts && (
          <Tag className="orders-tag" color="success">
            Đã nhận hàng
          </Tag>
        )}
      </React.Fragment>
    );
  };
  const renderCardExtra = () => {
    if (isDetailPage) {
      if (!isReceivedReturnProducts && isOrderFromPOS(OrderDetail)) {
        return (
          <div className="actionReturn">
            <Button
              onClick={(e) => {
                handleReceivedReturnProductsToStore();
              }}
            >
              Nhận hàng
            </Button>
          </div>
        );
      } else {
        return null;
      }
    }
    return (
      <div className="checkIfReturned">
        <Checkbox
          onChange={(e) => {
            // handleReceivedReturnProductsToStore(e.target.checked);
            setIsReceivedReturnProducts && setIsReceivedReturnProducts(e.target.checked);
          }}
          defaultChecked={isReceivedReturnProducts}
        >
          Đã nhận hàng trả lại
        </Checkbox>
        {isDetailPage && <Button>Nhận hàng</Button>}
      </div>
    );
  };

  const onOk = () => {
    setIsShowReceiveProductConfirmModal(false);
    handleReceivedReturnProductsToStore();
  };

  const onCancel = () => {
    setIsShowReceiveProductConfirmModal(false);
  };

  const mainRender = () => {
    if (isDetailPage && !isReceivedReturnProducts) {
      return (
        <React.Fragment>
          <Card
            title={renderCardTitle()}
            extra={renderCardExtra()}
            className={`receiveProductCard ${isOrderFromPOS(OrderDetail) ? "noBodyCard" : ""}`}
          >
            {!isOrderFromPOS(OrderDetail) && (
              <React.Fragment>
                <div className="receiveProductCard__content">
                  <Form.Item
                    name="orderReturn_receive_return_store_id"
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
                    type="primary"
                    onClick={() => {
                      form.validateFields(["orderReturn_receive_return_store_id"]).then(() => {
                        setIsShowReceiveProductConfirmModal(true);
                      });
                    }}
                  >
                    Nhận hàng trả về kho
                  </Button>
                </div>
                <ModalConfirm
                  onOk={onOk}
                  onCancel={onCancel}
                  visible={isShowReceiveProductConfirmModal}
                  title={`Bạn có chắc chắn nhận hàng về kho ${storeName}`}
                  subTitle={
                    <span>
                      Tồn kho sẽ được cộng về kho {storeName}! Vui lòng cân nhắc trước khi đồng ý!
                    </span>
                  }
                  footer={
                    <React.Fragment>
                      <Button
                        type="primary"
                        id="orderReturn_receive_return_store_button"
                        ref={okButtonRef}
                        onClick={() => {
                          onOk();
                        }}
                      >
                        OK
                      </Button>
                      <Button
                        onClick={() => {
                          onCancel();
                        }}
                      >
                        Hủy
                      </Button>
                    </React.Fragment>
                  }
                />
              </React.Fragment>
            )}
          </Card>
        </React.Fragment>
      );
    }
    return (
      <Card
        title={
          !isDetailPage ? (
            "Nhận hàng"
          ) : (
            <span>
              Đã nhận hàng trả lại
              {receivedStoreName && <span> - {receivedStoreName}</span>}
            </span>
          )
        }
        extra={renderCardExtra()}
        className="noBodyCard"
      />
    );
  };

  useEffect(() => {
    if (isShowReceiveProductConfirmModal) {
      setTimeout(() => {
        if (okButtonRef.current) {
          okButtonRef.current.focus();
        }
      }, 300);
    }
  }, [isShowReceiveProductConfirmModal]);

  useEffect(() => {
    setStoreName(defaultReceiveReturnStore?.name);
  }, [defaultReceiveReturnStore?.name]);

  return <StyledComponent>{mainRender()}</StyledComponent>;
}

export default CardReturnReceiveProducts;
