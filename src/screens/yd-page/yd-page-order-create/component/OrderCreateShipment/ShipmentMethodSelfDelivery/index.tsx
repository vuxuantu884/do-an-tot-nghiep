import { Col, Form, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { AccountResponse } from "model/account/account.model";
import React from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  totalAmountCustomerNeedToPay: number;
  levelOrder?: number;
  isCancelValidateDelivery: boolean;
  listShippers: AccountResponse[] | null;
  setShippingFeeInformedToCustomer: (value: number) => void;
  renderButtonCreateActionHtml: () => JSX.Element | null;
};
function ShipmentMethodSelfDelivery(props: PropType) {
  const {
    levelOrder = 0,
    totalAmountCustomerNeedToPay,
    isCancelValidateDelivery,
    listShippers,
    setShippingFeeInformedToCustomer,
    renderButtonCreateActionHtml,
  } = props;
  return (
    <StyledComponent>
      <div>
        <Row gutter={24}>
            <Col span={24}>
            <Form.Item
              label="ĐT giao hàng"
              name="shipper_code"
              rules={
                // khi lưu nháp không validate
                !isCancelValidateDelivery
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
                style={{width: "100%"}}
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
                {listShippers?.map((item, index) => (
                  <CustomSelect.Option
                    style={{width: "100%"}}
                    key={index.toString()}
                    value={item.code}
                  >
                    {`${item.full_name} - ${item.phone}`}
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
                  totalAmountCustomerNeedToPay && totalAmountCustomerNeedToPay > 0
                    ? totalAmountCustomerNeedToPay
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
            <Form.Item
              name="shipping_fee_paid_to_three_pls"
              label="Phí ship trả ĐT"
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
                onChange={(value) => {
                  if (value) {
                    setShippingFeeInformedToCustomer(value);
                  } else {
                    setShippingFeeInformedToCustomer(0);
                  }
                }}
                disabled={levelOrder > 3}
              />
            </Form.Item>
          </Col>
        </Row>
        {renderButtonCreateActionHtml && renderButtonCreateActionHtml()}
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodSelfDelivery;
