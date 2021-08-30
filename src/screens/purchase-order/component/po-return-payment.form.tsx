import {
  Form,
  FormInstance,
  Card,
  Row,
  Col,
  Radio,
  Input,
  Checkbox,
} from "antd";
import { Fragment, useState, useEffect } from "react";
import POProgressView from "./po-progress-view";
import NumberInput from "component/custom/number-input.custom";
import { CheckCircleOutlined } from "@ant-design/icons";
import { PoPaymentMethod, PoPaymentStatus } from "utils/Constants";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import CustomDatepicker from "component/custom/date-picker.custom";
import { POField } from "model/purchase-order/po-field";

import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import EmptyPlaceholder from "./EmptyPlaceholder";
import moment from "moment";

type POReturnPaymentFormProps = {
  formMain: FormInstance;
};

const { Item, List } = Form;

const POReturnPaymentForm: React.FC<POReturnPaymentFormProps> = (
  props: POReturnPaymentFormProps
) => {
  const { formMain } = props;
  const [payments, setPayments] = useState<Array<PurchasePayments>>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [disabledRef, setDisabledRef] = useState(false);
  const onChangePaymentMethod = (e: any) => {
    if (e.target.value === PoPaymentMethod.BANK_TRANSFER) {
      setDisabledRef(false);
    } else {
      formMain.setFieldsValue({ reference: "" });
      setDisabledRef(true);
    }
  };

  useEffect(() => {
    formMain.setFieldsValue({
      payments: [
        {
          payment_method_code: null,
          transaction_date: null,
          amount: null,
          reference: null,
          note: null,
          status: PoPaymentStatus.REFUND,
        },
      ],
    });
  }, [formMain]);

  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">Nhà cung cấp hoàn tiền</span>
        </div>
      }
      extra={
        <Item
          style={{ display: "inline", verticalAlign: "middle" }}
          shouldUpdate={(prev, current) =>
            prev[POField.total_paid] !== current[POField.total_paid]
          }
        >
          {({ getFieldValue }) => {
            let total_paid = getFieldValue(POField.total_paid);
            if (total_paid && total_paid > 0)
              return (
                <Checkbox
                  checked={showPayment}
                  disabled={!total_paid}
                  onChange={(e) => setShowPayment(e.target.checked)}
                >
                  Yêu cầu nhà cung cấp hoàn tiền
                </Checkbox>
              );
          }}
        </Item>
      }
    >
      <div className="padding-20">
        <Item
          shouldUpdate={(prev, current) =>
            prev[POField.total_paid] !== current[POField.total_paid] ||
            prev[POField.total] !== current[POField.total] ||
            prev[POField.payment_condition_name] !==
              current[POField.payment_condition_name] ||
            prev[POField.payment_note] !== current[POField.payment_note]
          }
        >
          {({ getFieldValue }) => {
            const total_paid = getFieldValue(POField.total_paid);
            const payment_condition_name = getFieldValue(
              POField.payment_condition_name
            );
            const payment_note = getFieldValue(POField.payment_note);
            if (total_paid && total_paid > 0) {
              return (
                <Fragment>
                  <Row>
                    <Col span={12}>
                      Kho nhận hàng: <strong>{payment_condition_name}</strong>
                    </Col>
                    <Col span={12}>
                      Diễn giải: <strong>{payment_note}</strong>
                    </Col>
                  </Row>
                  <Item
                    shouldUpdate={(prev, current) =>
                      prev[POField.total_paid] !==
                        current[POField.total_paid] ||
                      prev[POField.total] !== current[POField.total]
                    }
                  >
                    {({ getFieldValue }) => {
                      let total_paid = getFieldValue(POField.total_paid);
                      let total = getFieldValue(POField.total);
                      return (
                        <POProgressView
                          remainTitle={"Còn phải trả"}
                          receivedTitle={"ĐÃ NHẬN"}
                          received={total_paid}
                          total={total}
                          extra={
                            <div>
                              <CheckCircleOutlined
                                style={{
                                  fontSize: "16px",
                                  color: "#27AE60",
                                  marginRight: 4,
                                }}
                              />
                              Đã thanh toán: <strong>{total_paid}</strong>
                            </div>
                          }
                        />
                      );
                    }}
                  </Item>
                  {showPayment && (
                    <Row gutter={24} className="margin-top-20">
                      <List name="payments">
                        {(fields) =>
                          fields.map((field) => (
                            <Fragment key={field.key}>
                              <Col xs={24} lg={12}>
                                <Item
                                  rules={[
                                    {
                                      required: true,
                                      message:
                                        "Vui lòng chọn phương thức thanh toán",
                                    },
                                  ]}
                                  label="Phương thức thanh toán"
                                  name={[field.name, "payment_method_code"]}
                                >
                                  <Radio.Group onChange={onChangePaymentMethod}>
                                    <Radio
                                      value={PoPaymentMethod.BANK_TRANSFER}
                                      key={PoPaymentMethod.BANK_TRANSFER}
                                    >
                                      Chuyển khoản
                                    </Radio>
                                    <Radio
                                      value={PoPaymentMethod.CASH}
                                      key={PoPaymentMethod.CASH}
                                    >
                                      Tiền mặt
                                    </Radio>
                                  </Radio.Group>
                                </Item>
                              </Col>
                              <Col xs={24} lg={12}>
                                <Item
                                  name={[field.name, "transaction_date"]}
                                  label="Ngày thanh toán"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng nhập ngày thanh toán",
                                    },
                                  ]}
                                >
                                  <CustomDatepicker
                                    disableDate={(date) =>
                                      date <= moment().startOf("days")
                                    }
                                    style={{ width: "100%" }}
                                    placeholder="dd/mm/yyyy"
                                  />
                                </Item>
                              </Col>
                              <Col xs={24} lg={12}>
                                <Item
                                  name={[field.name, "amount"]}
                                  label="Số tiền thanh toán"
                                  rules={[
                                    {
                                      required: true,
                                      message:
                                        "Vui lòng nhập số tiền thanh toán",
                                    },
                                  ]}
                                >
                                  <NumberInput
                                    format={(a: string) => formatCurrency(a)}
                                    replace={(a: string) =>
                                      replaceFormatString(a)
                                    }
                                    min={0}
                                    default={0}
                                    placeholder="Nhập số tiền cần thanh toán"
                                  />
                                </Item>
                              </Col>
                              <Col xs={24} lg={12}>
                                <Item
                                  name={[field.name, "reference"]}
                                  label="Số tham chiếu"
                                >
                                  <Input
                                    placeholder="Nhập số tham chiếu"
                                    disabled={disabledRef}
                                    maxLength={255}
                                  />
                                </Item>
                              </Col>
                              <Col xs={24} lg={24}>
                                <Item
                                  name={[field.name, "note"]}
                                  label="Ghi chú"
                                >
                                  <Input
                                    maxLength={255}
                                    placeholder="Nhập ghi chú"
                                  />
                                </Item>
                              </Col>
                            </Fragment>
                          ))
                        }
                      </List>
                    </Row>
                  )}
                </Fragment>
              );
            } else
              return (
                <EmptyPlaceholder text="Không có thanh toán để hoàn trả" />
              );
          }}
        </Item>
      </div>
    </Card>
  );
};
export default POReturnPaymentForm;
