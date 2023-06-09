import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select, Timeline } from "antd";
import Item from "antd/lib/list/Item";
import NumberInput from "component/custom/number-input.custom";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { POField } from "model/purchase-order/po-field";
import { enumConvertDate, PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useState, lazy } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { formatCurrency } from "utils/AppUtils";
import { PoPaymentMethod, POStatus } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { POPaymentConditionsFormStyled } from "./styles";

const { Option } = Select;
const POCreatePaymentModal = lazy(() => import("../../modal/POCreatePayment"));

type POPaymentConditionsFormProps = {
  listPayment?: Array<PoPaymentConditions>;
  isEdit: Boolean;
  isEditDetail?: Boolean;
  formMain?: any;
  poDataPayments?: Array<PurchasePayments>;
  formMainEdit?: any;
  poData?: PurchaseOrder;
};

export const TYPE_PAYMENTS = {
  EDIT_IN_CREATE: "EDIT_IN_CREATE",
  EDIT_IN_DRAFT: "EDIT_IN_DRAFT",
};
const POPaymentConditionsForm: React.FC<POPaymentConditionsFormProps> = (
  props: POPaymentConditionsFormProps,
) => {
  const { isEdit, formMain, poDataPayments, formMainEdit, isEditDetail, poData } = props;

  const [isVisiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [paymentsData, setPaymentsData] = useState<Array<PurchasePayments>>([]);
  const [paymentsDataDraft, setPaymentsDataDraft] = useState<Array<PurchasePayments>>([]);
  const [paymentItem, setPaymentItem] = useState<PurchasePayments>();
  const [indexPurchasePayment, setIndexPurchasePayment] = useState("");
  const [remainPayment, setRemainPayment] = useState<number>(0);
  const isEditPaymentCondition =
    poData?.status === POStatus.DRAFT || poData?.status === POStatus.WAITING_APPROVAL;

  const date_unit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.date_unit);
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

  const convertDate = (date: enumConvertDate) => {
    switch (date) {
      case enumConvertDate.DAY:
        return "Ngày";
      case enumConvertDate.MONTH:
        return "Tháng";
      case enumConvertDate.YEAR:
        return "Năm";
      default:
        return "";
    }
  };

  useEffect(() => {
    poDataPayments && setPaymentsDataDraft(poDataPayments);
    return () => {
      setPaymentsDataDraft([]);
    };
  }, [formMainEdit, poDataPayments]);

  useEffect(() => {
    const totalPayment = poData?.total_payment ?? 0;
    const totalPaid = poData?.total_paid ?? 0;
    const remainPayment = totalPayment - totalPaid;
    setRemainPayment(remainPayment);
  }, [poData]);
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
            poData && (
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
            )
          }
        >
          <div>
            <StyledRow>
              <Col span={6} style={{ paddingRight: "0px", minWidth: "290px" }}>
                <Form.Item label="Điều khoản thanh toán">
                  <Input.Group className="ip-group" compact>
                    <Form.Item name="payment_condition_id" noStyle>
                      <NumberInput
                        isFloat
                        style={{ width: "70%" }}
                        placeholder="Nhập điều khoản thanh toán"
                      />
                    </Form.Item>
                    <Form.Item name="payment_condition_name" noStyle>
                      <Select
                        className="selector-group"
                        defaultActiveFirstOption
                        style={{ width: "30%" }}
                      >
                        {date_unit?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </StyledRow>
            <Row gutter={50}>
              <Col span={30} md={15}>
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
                          {item.payment_method_code === PoPaymentMethod.BANK_TRANSFER
                            ? "Chuyển khoản"
                            : "Tiền mặt"}
                        </h3>
                        <div>
                          Yêu cầu thanh toán: <br />
                          <strong>
                            {ConvertUtcToLocalDate(item.transaction_date, "DD/MM/YYYY")}
                          </strong>
                        </div>
                      </div>
                    </Col>
                    <Col md={8}>
                      <strong className="po-payment-row-title">
                        {item.amount ? formatCurrency(Math.round(item.amount)) : 0}
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
          {isVisiblePaymentModal && (
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
          )}
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
          isEditDetail && (
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
          )
        }
      >
        <div className="padding-20">
          {!isEditDetail && isEditPaymentCondition ? (
            <>
              <Row gutter={24}>
                <Col md={12}>
                  <div className="shortInformation__column">
                    <span className="text-field margin-right-10">Điều khoản thanh toán:</span>
                    <span>
                      {" "}
                      <strong className="po-payment-row-title">
                        <Form.Item name={POField.payment_condition_id} noStyle hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, current) =>
                            prev[POField.payment_condition_id] !==
                              current[POField.payment_condition_id] ||
                            prev[POField.payment_condition_name] !==
                              current[POField.payment_condition_name]
                          }
                        >
                          {({ getFieldValue }) => {
                            const payment_condition_name =
                              (getFieldValue(POField.payment_condition_id) || "") +
                              " " +
                              convertDate(getFieldValue(POField.payment_condition_name));
                            return payment_condition_name;
                          }}
                        </Form.Item>
                      </strong>
                    </span>
                  </div>
                </Col>
              </Row>
              <Row gutter={24}>
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
                          prev[POField.payment_note] !== current[POField.payment_note]
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
            </>
          ) : (
            <>
              <StyledRow>
                <Col span={6} style={{ paddingRight: "0px", minWidth: "290px" }}>
                  <Form.Item label="Điều khoản thanh toán">
                    <Input.Group className="ip-group" compact>
                      <Form.Item name="payment_condition_id" noStyle>
                        <NumberInput
                          isFloat
                          style={{ width: "70%" }}
                          placeholder="Nhập điều khoản thanh toán"
                        />
                      </Form.Item>
                      <Form.Item name="payment_condition_name" noStyle>
                        <Select
                          className="selector-group"
                          defaultActiveFirstOption
                          style={{ width: "30%" }}
                        >
                          {date_unit?.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
              </StyledRow>
              <Row gutter={50}>
                <Col span={30} md={15}>
                  <Form.Item name={POField.payment_note} label="Diễn giải">
                    <Input.TextArea maxLength={255} placeholder="Nhập diễn giải" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Timeline>
            {paymentsDataDraft?.map((item, index) => (
              <Timeline.Item key={index}>
                <Row gutter={24}>
                  <Col md={8}>
                    <div className="timeline__colTitle">
                      <h3 className="po-payment-row-title">
                        {item.payment_method_code === PoPaymentMethod.BANK_TRANSFER
                          ? "Chuyển khoản"
                          : "Tiền mặt"}
                      </h3>
                      <div>
                        Yêu cầu thanh toán: <br />
                        <strong>
                          {ConvertUtcToLocalDate(item.transaction_date, "DD/MM/YYYY")}{" "}
                        </strong>{" "}
                      </div>
                    </div>
                  </Col>
                  <Col md={8}>
                    {" "}
                    <strong className="po-payment-row-title">
                      {item.amount ? formatCurrency(Math.round(item.amount)) : ""}
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
          remainPayment={remainPayment}
          deletePayment={deletePayment}
        />
      </Card>
    </POPaymentConditionsFormStyled>
  );
};

const StyledRow = styled(Row)`
  .ant-select.selector-group.ant-select-single.ant-select-show-arrow {
    width: 85px !important;
  }
  .ant-form-item-control {
    height: 38px !important;
  }
`;

export default POPaymentConditionsForm;
