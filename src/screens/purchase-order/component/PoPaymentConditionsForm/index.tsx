import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select, Timeline } from "antd";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { POField } from "model/purchase-order/po-field";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import React, { useCallback, useEffect, useState, lazy } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { formatCurrency } from "utils/AppUtils";
import { PoPaymentMethod } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { POPaymentConditionsFormStyled } from "./styles";

const POCreatePaymentModal = lazy(() => import("../../modal/POCreatePayment"))

type POPaymentConditionsFormProps = {
  listPayment: Array<PoPaymentConditions>;
  isEdit: Boolean;
  isEditDetail?: Boolean;
  formMain?: any;
  poDataPayments?: Array<PurchasePayments>;
  formMainEdit?: any;
};

export const TYPE_PAYMENTS = {
  EDIT_IN_CREATE: "EDIT_IN_CREATE",
  EDIT_IN_DRAFT: "EDIT_IN_DRAFT",
};
const POPaymentConditionsForm: React.FC<POPaymentConditionsFormProps> = (
  props: POPaymentConditionsFormProps
) => {
  const {
    isEdit,
    formMain,
    listPayment,
    poDataPayments,
    formMainEdit,
    isEditDetail,
  } = props;

  const [isVisiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [paymentsData, setPaymentsData] = useState<Array<PurchasePayments>>([]);
  const [paymentsDataDraft, setPaymentsDataDraft] = useState<
    Array<PurchasePayments>
  >([]);
  const [paymentItem, setPaymentItem] = useState<PurchasePayments>();
  const [indexPurchasePayment, setIndexPurchasePayment] = useState("");

  const ShowPaymentModal = useCallback(() => {
    setPaymentItem(undefined);
    setVisiblePaymentModal(true);
    setIndexPurchasePayment("");
  }, []);

  const CancelPaymentModal = () => {
    setVisiblePaymentModal(false);
  };

  const deletePayment = (index: number) => {
    switch (isEdit) {
      case true:
        const newPaymentsDataDraft = [...paymentsDataDraft];
        newPaymentsDataDraft?.splice(index, 1);
        setPaymentsDataDraft(newPaymentsDataDraft);
        formMainEdit.setFieldsValue({
          payments: newPaymentsDataDraft,
        });
        setVisiblePaymentModal(false);
        break;
      default:
        const newPaymentsData = [...paymentsData];
        newPaymentsData?.splice(index, 1);
        setPaymentsData(newPaymentsData);
        formMain.setFieldsValue({
          payments: newPaymentsData,
        });
        setVisiblePaymentModal(false);
        break;
    }
  };

  const editPayment = useCallback((item: PurchasePayments, index: number) => {
    setIndexPurchasePayment(index.toString());
    setPaymentItem(item);
    setVisiblePaymentModal(true);
  }, []);

  const onChangeDataPayments = (dataPayments: Array<PurchasePayments>) => {
    switch (isEdit) {
      case true:
        setPaymentsDataDraft(dataPayments);
        formMainEdit.setFieldsValue({
          payments: dataPayments,
        });

        break;
      default:
        setPaymentsData(dataPayments);
        formMain.setFieldsValue({
          payments: dataPayments,
        });
        break;
    }
  };

  useEffect(() => {
    poDataPayments && setPaymentsDataDraft(poDataPayments);
  }, [poDataPayments]);
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
              className="create-button-custom ant-btn-outline fixed-button"
            >
              Tạo thanh toán
            </Button>
          }
        >
          <div>
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
                  <Input.TextArea
                    maxLength={255}
                    placeholder="Nhập diễn giải"
                  />
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
                            )}
                          </strong>
                        </div>
                      </div>
                    </Col>
                    <Col md={8}>
                      <strong className="po-payment-row-title">
                        {item.amount
                          ? formatCurrency(Math.round(item.amount))
                          : 0}
                      </strong>
                    </Col>
                    <Col md={8}>
                      <div className="timeline__groupButtons">
                        <Button onClick={() => editPayment(item, index)}>
                          <EditOutlined /> Sửa
                        </Button>
                        <Button danger onClick={() => deletePayment(index)}>
                          <DeleteOutlined /> Xoá
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
          {
            isVisiblePaymentModal && (
              <POCreatePaymentModal
                visible={isVisiblePaymentModal}
                isEditPage={isEdit}
                formMain={formMain}
                deletePayment={deletePayment}
                purchasePayment={paymentItem}
                indexPurchasePayment={indexPurchasePayment}
                onCancel={CancelPaymentModal}
                onChangeDataPayments={onChangeDataPayments}
                remainPayment={formMain.getFieldValue(POField.total)}
              />
            )
          }
        </Card>
      </POPaymentConditionsFormStyled>
    );
  }
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
          {isEdit && !isEditDetail ? (
            <Row gutter={24} className="margin-bottom-40">
              <Col md={12}>
                {/* <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item> */}
                <div className="shortInformation__column">
                  <span className="text-field margin-right-10">
                    Điều khoản thanh toán:
                  </span>
                  <span>
                    {" "}
                    <strong className="po-payment-row-title">
                      <Form.Item
                        name={POField.payment_condition_id}
                        noStyle
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, current) =>
                          prev[POField.payment_condition_name] !==
                          current[POField.payment_condition_name]
                        }
                      >
                        {({ getFieldValue }) => {
                          let payment_condition_name = getFieldValue(
                            POField.payment_condition_name
                          );
                          return payment_condition_name;
                        }}
                      </Form.Item>
                    </strong>
                  </span>
                </div>
              </Col>
              <Col md={12}>
                <div className="shortInformation__column">
                  <span className="text-field margin-right-10">Diễn giải:</span>
                  <span>
                    <Form.Item name={POField.payment_note} noStyle hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, current) =>
                        prev[POField.payment_note] !==
                        current[POField.payment_note]
                      }
                    >
                      {({ getFieldValue }) => {
                        let payment_note = getFieldValue(POField.payment_note);
                        return payment_note;
                      }}
                    </Form.Item>
                  </span>
                </div>
              </Col>
            </Row>
          ) : (
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
                  <Input.TextArea
                    maxLength={255}
                    placeholder="Nhập diễn giải"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Timeline>
            {paymentsDataDraft?.map((item, index) => (
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
                      {item.amount
                        ? formatCurrency(Math.round(item.amount))
                        : ""}
                    </strong>
                  </Col>
                  <Col md={8}>
                    <div className="timeline__groupButtons">
                      <Button onClick={() => editPayment(item, index)}>
                        <EditOutlined /> Sửa
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
          isEditPage={isEdit}
          formMain={formMainEdit}
          purchasePayment={paymentItem}
          indexPurchasePayment={indexPurchasePayment}
          onCancel={CancelPaymentModal}
          onChangeDataPayments={onChangeDataPayments}
          remainPayment={formMainEdit.getFieldValue(POField.total)}
          deletePayment={deletePayment}
        />
      </Card>
    </POPaymentConditionsFormStyled>
  );
};

export default POPaymentConditionsForm;
