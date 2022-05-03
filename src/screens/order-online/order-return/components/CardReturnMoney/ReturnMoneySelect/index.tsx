import { Button, Col, Form, Input, Row, Select } from "antd";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { formatCurrency } from "utils/AppUtils";
import { PaymentMethodCode } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  totalAmountCustomerNeedToPay: number;
  isShowButtonReturnMoney: boolean;
  listPaymentMethods: PaymentMethodResponse[];
  handleReturnMoney: () => void;
};

/**
 * input: totalAmountCustomerNeedToPay
 * output: setReturnMoneyType, setReturnMoneyMethod
 */
function ReturnMoneySelect(props: PropTypes) {
  /**
   * payment method bỏ tiêu điểm và qr pay
   */
  const exceptMethods = [
    PaymentMethodCode.QR_CODE,
    PaymentMethodCode.POINT,
  ];

  const {
    totalAmountCustomerNeedToPay,
    isShowButtonReturnMoney,
    listPaymentMethods,
    handleReturnMoney,
  } = props;

  console.log('listPaymentMethods', listPaymentMethods)

  let listPaymentMethodsResult = listPaymentMethods.filter((single) => {
    return !exceptMethods.includes(single.code);
  });

  return (
    <StyledComponent>
      <div className="returnMoney 2">
        <Form.List name="returnMoneyField">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <div key={field.key}>
                    <Row gutter={30}>
                      <Col span={12}>
                        <Form.Item
                          label="Phương thức thanh toán"
                          name={[index, "returnMoneyMethod"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn phương thức thanh toán!",
                            },
                          ]}
                        >
                          <Select
                            style={{ width: "100%" }}
                            placeholder="Chọn hình thức thanh toán"
                            notFoundContent="Không tìm thấy hình thức thanh toán"
                          >
                            {listPaymentMethodsResult &&
                              listPaymentMethodsResult.map((single) => {
                                return (
                                  <Select.Option value={single.id} key={single.id}>
                                    {single.name}
                                  </Select.Option>
                                );
                              })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <div className="ant-row ant-form-item">
                          <div className="ant-col ant-form-item-label">Số tiền</div>
                          <Input
                            value={
                              totalAmountCustomerNeedToPay < 0
                                ? formatCurrency(Math.abs(totalAmountCustomerNeedToPay))
                                : 0
                            }
                            disabled
                            style={{ color: "inherit", background: "#fff" }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Nội dung"
                          name={[index, "returnMoneyNote"]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Nội dung" />
                        </Form.Item>
                      </Col>
                      {isShowButtonReturnMoney && (
                        <Col span={12}>
                          <Button
                            className="btnReturnMoney"
                            onClick={() => {
                              handleReturnMoney();
                            }}
                          >
                            Xác nhận hoàn tiền
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </div>
                ))}
              </div>
            );
          }}
        </Form.List>
      </div>
    </StyledComponent>
  );
}

export default ReturnMoneySelect;
