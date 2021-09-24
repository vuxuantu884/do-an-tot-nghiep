import { Button, Card, Col, Form, Input, Row, Select, Timeline } from "antd";
import { POField } from "model/purchase-order/po-field";
import React, { useCallback, useState } from "react";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { AiOutlinePlus } from "react-icons/ai";
import POCreatePaymentModal from "../../modal/POCreatePayment";
import { PoPaymentMethod } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { formatCurrency } from "utils/AppUtils";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { POPaymentConditionsFormStyled } from "./styles";

type POPaymentConditionsFormProps = {
  listPayment: Array<PoPaymentConditions>;
  isEdit: Boolean;
  formMain?: any;
};
const POPaymentConditionsForm: React.FC<POPaymentConditionsFormProps> = (
  props: POPaymentConditionsFormProps
) => {
  const { isEdit, formMain, listPayment } = props;
  const [isVisiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [paymentsData, setPaymentsData] = useState<Array<PurchasePayments>>([]);
  const [paymentItem, setPaymentItem] = useState<PurchasePayments>();
  const [indexPurchasePayment, setIndexPurchasePayment] = useState('');

  const ShowPaymentModal = useCallback(() => {
    setPaymentItem(undefined);
    setVisiblePaymentModal(true);
  }, []);

  const CancelPaymentModal = () => {
    setVisiblePaymentModal(false);
  };

  const deletePayment = (index: number) => {
    const newPaymentsData = [...paymentsData];
    newPaymentsData?.splice(index,1);
    setPaymentsData(newPaymentsData);
    formMain.setFieldsValue({
      payments: newPaymentsData,
    });
  }
  
  const editPayment = useCallback((item: PurchasePayments, index:number) => {
    setIndexPurchasePayment(index.toString());
    setPaymentItem(item);
    setVisiblePaymentModal(true);
  }, []);

  const onChangeDataPayments = (dataPayments: Array<PurchasePayments>) => {
    setPaymentsData(dataPayments);
    formMain.setFieldsValue({
      payments: dataPayments,
    })
  }
  
  if (!isEdit) {
    return (
      <POPaymentConditionsFormStyled>
        <Card
          className="po-form margin-top-20"
          title={
            <div className="d-flex">
              <span className="title-card">THANH TOÁN</span>
            </div>
          }
          extra={
            <Button
              onClick={ShowPaymentModal}
              style={{
                alignItems: "center",
                display: "flex",
              }}
              icon={<AiOutlinePlus size={16} />}
              type="primary"
              className="create-button-custom ant-btn-outline fixed-button"
            >
              Tạo thanh toán
            </Button>
          }
        >
          <div className="padding-20">
            <Row gutter={50}>
              <Col span={24} md={10}>
                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn điều khoản thanh toán",
                    },
                  ]}
                  name={POField.payment_condition_id}
                  label="Điều khoản thanh toán"
                >
                  <Select placeholder="Chọn điều khoản thanh toán">
                    {listPayment?.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.note}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24} md={10}>
                <Form.Item name={POField.payment_note} label="Diễn giải">
                  <Input.TextArea maxLength={255} placeholder="Nhập diễn giải" />
                </Form.Item>
              </Col>
            </Row>

            <Timeline>
              {paymentsData?.map((item, index) => (
                <Timeline.Item key={index}>
                  <Row gutter={24}>
                    <Col md={8}>
                      <div className="timeline__colTitle">
                        <h3 className="po-payment-row-title">
                          {item.payment_method_code ===
                          PoPaymentMethod.BANK_TRANSFER
                            ? "Chuyển khoản"
                            : "Tiền mặt"}
                        </h3>
                        <div>
                          Yêu cầu thanh toán: <br />
                          <strong>
                            {ConvertUtcToLocalDate(
                              item.transaction_date,
                              "DD/MM/YYYY"
                            )}{" "}
                          </strong>{" "}
                        </div>
                      </div>
                    </Col>
                    <Col md={8}>
                      {" "}
                      <strong className="po-payment-row-title">
                        {item.amount ? formatCurrency(item.amount) : ""}
                      </strong>
                    </Col>
                    <Col md={8}>
                      <div className="timeline__groupButtons">
                        <Button onClick={() => editPayment(item, index)}>
                          <EditOutlined /> Sửa
                        </Button>
                        <Button
                          danger
                          onClick={() => deletePayment(index)}
                        >
                          <DeleteOutlined />{" "}
                          Xoá
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
          <POCreatePaymentModal
            visible={isVisiblePaymentModal}
            formMain={formMain}
            purchasePayment={paymentItem}
            indexPurchasePayment={indexPurchasePayment}
            onCancel={CancelPaymentModal}
            onChangeDataPayments={onChangeDataPayments}
            remainPayment={formMain.getFieldValue(POField.total)}
          />
        </Card>
      </POPaymentConditionsFormStyled>
    );
  }
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">THANH TOÁN</span>
        </div>
      }
    >
      <div className="padding-20">
        <Row gutter={50}>
          <Col span={24} md={10}>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.payment_condition_id] !==
                current[POField.payment_condition_id]
              }
            >
              {({ getFieldValue }) => {
                let store = getFieldValue(POField.payment_condition_name);
                return (
                  <div>
                    Điều khoản thanh toán: <strong>{store}</strong>
                  </div>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={24} md={10}>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.payment_note] !== current[POField.payment_note]
              }
            >
              {({ getFieldValue }) => {
                let store = getFieldValue(POField.payment_note);
                return (
                  <div>
                    Diễn giải: <strong>{store}</strong>
                  </div>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default POPaymentConditionsForm;
