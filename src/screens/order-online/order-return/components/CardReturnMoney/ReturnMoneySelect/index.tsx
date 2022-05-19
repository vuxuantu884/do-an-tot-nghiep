import { Button, Col, Form, Input, Row, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
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

  // const [initialReturnAmount, setInitialReturnAmount] = useState(0)

  // console.log('initialReturnAmount', initialReturnAmount)

  // useEffect(() => {
  //   let result = totalAmountCustomerNeedToPay < 0
  //   ? (Math.ceil(Math.abs(totalAmountCustomerNeedToPay)))
  //   : 0
  //   setInitialReturnAmount(result)

  // }, [totalAmountCustomerNeedToPay])
  

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
                                  <Select.Option value={single.code} key={single.code}>
                                    {single.name}
                                  </Select.Option>
                                );
                              })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Số tiền"
                          name={[index, "returnMoneyAmount"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số tiền!",
                            },
                          ]}
                        >
                          <NumberInput
                            format={(a: string) => formatCurrency(a)}
                            replace={(a: string) => replaceFormatString(a)}
                            style={{
                              textAlign: "right",
                              width: "100%",
                              fontWeight: 500,
                              color: "#222222",
                            }}
                            maxLength={14}
                            minLength={0}
                            // value={initialReturnAmount}
                            // onChange={(value) => {
                            //   // setInitialReturnAmount(value || 0);
                            // }}
                          />
                        </Form.Item>
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
