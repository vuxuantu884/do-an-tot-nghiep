import { Col, Row, Form } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { AccountResponse } from "model/account/account.model";
import React from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { PaymentMethodOption } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropType = {
  amount: number;
  shipper: AccountResponse[] | null;
  paymentMethod: number;
  shippingFeeCustomer: number | null;
  discountValue: number | null;
  setShippingFeeInformedCustomer: (value: number | null) => void;
  totalAmountReturnProducts?: number;
};
function ShipmentMethodSelfDelivery(props: PropType) {
  const {
    amount,
    shipper,
    paymentMethod,
    shippingFeeCustomer,
    discountValue,
    totalAmountReturnProducts,
    setShippingFeeInformedCustomer,
  } = props;

  const totalAmountCustomerNeedToPayShipper = () => {
    return (
      amount +
      (shippingFeeCustomer ? shippingFeeCustomer : 0) -
      (discountValue ? discountValue : 0) -
      (totalAmountReturnProducts ? totalAmountReturnProducts : 0)
    );
  };

  return (
    <StyledComponent>
      <div>
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item
              label="Đối tác giao hàng"
              name="shipper_code"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn đối tác giao hàng",
                },
              ]}
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
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    );
                  }
                  return false;
                }}
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

            {paymentMethod === PaymentMethodOption.COD && (
              <Form.Item label="Tiền thu hộ 2">
                <NumberInput
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  placeholder="0"
                  value={
                    totalAmountCustomerNeedToPayShipper() > 0
                      ? totalAmountCustomerNeedToPayShipper()
                      : 0
                  }
                  style={{
                    textAlign: "right",
                    width: "100%",
                    color: "#222222",
                  }}
                  maxLength={999999999999}
                  minLength={0}
                />
              </Form.Item>
            )}
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
              />
            </Form.Item>
            <Form.Item
              name="shipping_fee_informed_to_customer"
              label="Phí ship báo khách 33"
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
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodSelfDelivery;
