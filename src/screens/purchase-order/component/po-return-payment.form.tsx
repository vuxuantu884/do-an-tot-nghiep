import { Form, FormInstance, Card, Row, Col, Radio, Input, Checkbox } from "antd";
import { Fragment, useState, useEffect } from "react";
import NumberInput from "component/custom/number-input.custom";
import { PoPaymentMethod, PoPaymentStatus } from "utils/Constants";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import CustomDatepicker from "component/custom/date-picker.custom";
import { POField } from "model/purchase-order/po-field";
import EmptyPlaceholder from "./EmptyPlaceholder";
import moment from "moment";

type POReturnPaymentFormProps = {
  formMain: FormInstance;
  totalReturn: number;
  totalVat: number;
};

const { Item, List } = Form;

const POReturnPaymentForm: React.FC<POReturnPaymentFormProps> = (
  props: POReturnPaymentFormProps,
) => {
  const { formMain, totalReturn, totalVat } = props;
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
    if (showPayment) {
      formMain.setFieldsValue({
        payments: [
          {
            payment_method_code: null,
            transaction_date: null,
            amount: totalReturn + totalVat,
            reference: null,
            note: null,
            status: PoPaymentStatus.REFUND,
            is_refund: true,
          },
        ],
      });
    }
  }, [formMain, showPayment, totalReturn, totalVat]);

  useEffect(() => {
    formMain.setFieldsValue({
      payments: [
        {
          payment_method_code: null,
          transaction_date: null,
          amount: null,
          reference: null,
          note: null,
          is_refund: true,
          status: PoPaymentStatus.REFUND,
        },
      ],
    });
  }, [formMain]);

  return (
    <Card
      className="po-form margin-top-20 margin-bottom-20"
      title={
        <div className="d-flex">
          <span className="title-card">Nhà cung cấp hoàn tiền</span>
        </div>
      }
      extra={
        <Item
          style={{ display: "inline", verticalAlign: "middle" }}
          shouldUpdate={(prev, current) => prev[POField.total_paid] !== current[POField.total_paid]}
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
      <Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev[POField.total_paid] !== current[POField.total_paid] ||
          prev[POField.total] !== current[POField.total] ||
          prev[POField.payment_condition_name] !== current[POField.payment_condition_name] ||
          prev[POField.payment_note] !== current[POField.payment_note]
        }
      >
        {({ getFieldValue }) => {
          const total_paid = getFieldValue(POField.total_paid);
          if (total_paid && total_paid > 0) {
            return (
              <Fragment>
                {showPayment && (
                  <div>
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
                                      message: "Vui lòng chọn phương thức thanh toán",
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
                                    <Radio value={PoPaymentMethod.CASH} key={PoPaymentMethod.CASH}>
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
                                    disableDate={(date) => date <= moment().startOf("days")}
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
                                      message: "Vui lòng nhập số tiền thanh toán",
                                    },
                                  ]}
                                >
                                  <NumberInput
                                    format={(a: string) => formatCurrency(a)}
                                    replace={(a: string) => replaceFormatString(a)}
                                    min={0}
                                    placeholder="Nhập số tiền cần thanh toán"
                                  />
                                </Item>
                              </Col>
                              <Col xs={24} lg={12}>
                                <Item name={[field.name, "reference"]} label="Số tham chiếu">
                                  <Input
                                    placeholder="Nhập số tham chiếu"
                                    disabled={disabledRef}
                                    maxLength={255}
                                  />
                                </Item>
                              </Col>
                              <Col xs={24} lg={24}>
                                <Item name={[field.name, "note"]} label="Ghi chú">
                                  <Input maxLength={255} placeholder="Nhập ghi chú" />
                                </Item>
                              </Col>
                            </Fragment>
                          ))
                        }
                      </List>
                    </Row>
                  </div>
                )}
              </Fragment>
            );
          } else return <EmptyPlaceholder text="Không có thanh toán để hoàn trả" />;
        }}
      </Item>
    </Card>
  );
};
export default POReturnPaymentForm;
