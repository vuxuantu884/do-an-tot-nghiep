import { Col, Form, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { OrderCreateContext } from "contexts/order-online/order-create-context";
import { AccountResponse } from "model/account/account.model";
import React, { useContext } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  shipper: AccountResponse[] | null;
  setShippingFeeInformedCustomer: (value: number | null) => void;
  levelOrder?: number;
};
function ShipmentMethodSelfDelivery(props: PropType) {
  const { shipper, setShippingFeeInformedCustomer, levelOrder = 0 } = props;

  const createOrderContextData = useContext(OrderCreateContext);
  const totalAmountCustomerNeedToPayShipper =
    createOrderContextData?.price.totalAmountCustomerNeedToPay;

  return (
    <StyledComponent>
      <div>
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item
              label="Đối tác giao hàng"
              name="shipper_code"
              rules={
                // khi lưu nháp không validate
                !createOrderContextData?.buttonSave.isSaveDraft
                  ? [
                      {
                        required: true,
                        message: "Vui lòng chọn đối tác giao hàng",
                      },
                    ]
                  : undefined
              }
            >
              <CustomSelect
                className="select-with-search"
                showSearch
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: "100%" }}
                placeholder="Chọn đối tác giao hàng"
                filterOption={(input, option) => {
                  if (option) {
                    return (
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    );
                  }
                  return false;
                }}
                disabled={levelOrder > 3}
              >
                {shipper?.map((item, index) => (
                  <CustomSelect.Option
                    style={{ width: "100%" }}
                    key={index.toString()}
                    value={item.code}
                  >
                    {`${item.full_name} - ${item.mobile}`}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Form.Item>

            {/* {paymentMethod === PaymentMethodOption.COD && ( */}
            <Form.Item label="Tiền thu hộ">
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  totalAmountCustomerNeedToPayShipper &&
                  totalAmountCustomerNeedToPayShipper > 0
                    ? totalAmountCustomerNeedToPayShipper
                    : 0
                }
                style={{
                  textAlign: "right",
                  width: "100%",
                  color: "#222222",
                }}
                maxLength={999999999999}
                minLength={0}
                disabled={levelOrder > 3}
              />
            </Form.Item>
            {/* )} */}
          </Col>
          <Col md={12}>
            <Form.Item
              name="shipping_fee_paid_to_three_pls"
              label="Phí ship trả đối tác giao hàng"
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                style={{
                  textAlign: "right",
                  width: "100%",
                  color: "#222222",
                }}
                maxLength={15}
                minLength={0}
                disabled={levelOrder > 3}
              />
            </Form.Item>
            <Form.Item
              name="shipping_fee_informed_to_customer"
              label="Phí ship báo khách"
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                style={{
                  textAlign: "right",
                  width: "100%",
                  color: "#222222",
                }}
                maxLength={15}
                minLength={0}
                onChange={setShippingFeeInformedCustomer}
                disabled={levelOrder > 3}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodSelfDelivery;
