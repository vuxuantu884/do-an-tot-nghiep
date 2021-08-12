import {
  CheckCircleOutlined,
  EditOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Progress,
  Row,
  Space,
  Tag,
  Timeline,
} from "antd";
import ModalConfirm from "component/modal/ModalConfirm";
import { PoPaymentUpdateAction } from "domain/actions/po/po-payment.action";
import { PoUpdateFinancialStatusAction } from "domain/actions/po/po.action";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import React, { useCallback, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import PaymentModal from "screens/purchase-order/modal/payment.modal";
import { formatCurrency } from "utils/AppUtils";
import {
  PoFinancialStatus,
  PoPaymentMethod,
  PoPaymentStatus,
} from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type POPaymentFormProps = {
  poId: number;
  loadDetail: (poId: number, isLoading: boolean) => void;
};
const POPaymentForm: React.FC<POPaymentFormProps> = (
  props: POPaymentFormProps
) => {
  const dispatch = useDispatch();
  const [isVisiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [isConfirmPayment, setConfirmPayment] = useState<boolean>(false);
  const [paymentItem, setPaymentItem] = useState<PurchasePayments>();
  const [loadingApproval, setLoaddingApproval] = useState<Array<boolean>>([]);

  const CancelPaymentModal = useCallback(() => {
    setVisiblePaymentModal(false);
  }, []);
  const OkPaymentModal = useCallback(
    (isReload: boolean) => {
      setVisiblePaymentModal(false);
      if (isReload) {
        props.loadDetail(props.poId, false);
      }
    },
    [props]
  );

  const updateCallback = useCallback(
    (result: PurchasePayments | null) => {
      if (result !== null && result !== undefined) {
        showSuccess("cập nhật dữ liệu thành công");
        props.loadDetail(props.poId, false);
      }
    },
    [props]
  );

  const updateFinancialStatusCallback = useCallback(
    (result: PurchaseOrder | null) => {
      if (result !== null && result !== undefined) {
        showSuccess("cập nhật dữ liệu thành công");
        props.loadDetail(props.poId, false);
      }
    },
    [props]
  );

  const finishPayment = useCallback(() => {
    setConfirmPayment(true);
  }, []);

  const onApprovalPayment = useCallback(
    (item: PurchasePayments, index: number) => {
      if (item.id) {
        const newLoadings = [...loadingApproval];
        newLoadings[index] = true;
        setLoaddingApproval(newLoadings);
        let newItem = { ...item };
        newItem.status = PoPaymentStatus.PAID;
        dispatch(
          PoPaymentUpdateAction(props.poId, item.id, newItem, updateCallback)
        );
      }
    },
    [dispatch, loadingApproval, props.poId, updateCallback]
  );
  const ShowPaymentModal = useCallback(() => {
    setPaymentItem(undefined);
    setVisiblePaymentModal(true);
  }, []);

  const editPayment = useCallback((item: PurchasePayments) => {
    setPaymentItem(item);
    setVisiblePaymentModal(true);
  }, []);
  return (
    <StyledComponent>
      <Card
        className="po-form margin-top-20"
        title={
          <Space>
            <div className="d-flex">
              <span className="title-card">THANH TOÁN</span>
            </div>{" "}
            {/* <Tag
              className="po-tag  orders-tag-default"
              style={{
                backgroundColor: "rgba(102, 102, 102, 0.1)",
                color: "rgb(102, 102, 102)",
              }}
            >
              Chưa thanh toán
            </Tag> */}
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.financial_status] !==
                current[POField.financial_status]
              }
            >
              {({ getFieldValue }) => {
                let financial_status = getFieldValue(POField.financial_status);
                let statusName = "Chưa thanh toán";
                let className = "po-tag";
                if (financial_status === PoFinancialStatus.PARTIAL_PAID) {
                  statusName = "Thanh toán 1 phần";
                  className += " po-tag-warning";
                }
                if (
                  financial_status === PoFinancialStatus.CANCELLED ||
                  financial_status === PoFinancialStatus.FINISHED ||
                  financial_status === PoFinancialStatus.PAID
                ) {
                  statusName = "Đã thanh toán";
                  className += " po-tag-success";
                }
                return <Tag className={className}>{statusName}</Tag>;
              }}
            </Form.Item>
          </Space>
        }
        extra={
          // <Button onClick={ShowPaymentModal}>
          //   <PlusOutlined style={{ fontSize: "18px" }} />
          //   Tạo thanh toán
          // </Button>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev[POField.financial_status] !==
              current[POField.financial_status]
            }
          >
            {({ getFieldValue }) => {
              let financial_status = getFieldValue(POField.financial_status);
              let checkStatus =
                financial_status !== PoFinancialStatus.CANCELLED &&
                financial_status !== PoFinancialStatus.PAID &&
                financial_status !== PoFinancialStatus.FINISHED;

              return (
                checkStatus && (
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
              );
            }}
          </Form.Item>
        }
      >
        <div className="padding-20">
          <div className="card__section shortInformation">
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
          </div>
          <div className="card__section checkOut">
            <Row gutter={24}>
              <Col md={14}>
                {/* <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item> */}
                <div className="checkOut__column checkOut__progress">
                  <div className="checkOut__progress-bar">
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, current) =>
                        prev[POField.total_paid] !==
                          current[POField.total_paid] ||
                        prev[POField.total] !== current[POField.total]
                      }
                    >
                      {({ getFieldValue }) => {
                        let total_paid = getFieldValue(POField.total_paid);
                        let total = getFieldValue(POField.total);
                        let percent = 0;
                        if (total_paid && total) {
                          percent = Math.round((total_paid / total) * 100);
                        }

                        debugger;
                        return (
                          <div>
                            <Progress
                              type="line"
                              percent={percent}
                              showInfo={false}
                              strokeWidth={21}
                              strokeColor="#B2B2E4"
                              trailColor="#ECEFFA"
                            />
                            <div className="checkOut__progress-bar__value">
                              <span> Thanh toán : {percent} %</span>
                            </div>
                          </div>
                        );
                      }}
                    </Form.Item>
                  </div>
                  <div className="checkOut__progress-text">
                    <CheckCircleOutlined
                      style={{ fontSize: "16px", color: "#27AE60" }}
                    />
                    Đã thanh toán:{" "}
                    <strong>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, current) =>
                          prev[POField.total_paid] !==
                          current[POField.total_paid]
                        }
                      >
                        {({ getFieldValue }) => {
                          let total_paid = getFieldValue(POField.total_paid);
                          return total_paid ? formatCurrency(total_paid) : 0;
                        }}
                      </Form.Item>
                    </strong>
                  </div>
                </div>
              </Col>
              <Col md={10}>
                <div className="checkOut__column">
                  <MinusCircleOutlined
                    style={{ fontSize: "16px", color: "#E24343" }}
                  />
                  Còn phải trả:{" "}
                  <strong style={{ color: "#E24343" }}>
                    {" "}
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, current) =>
                        prev[POField.total_paid] !==
                          current[POField.total_paid] ||
                        prev[POField.total] !== current[POField.total]
                      }
                    >
                      {({ getFieldValue }) => {
                        let total_paid = getFieldValue(POField.total_paid);
                        let total = getFieldValue(POField.total);
                        return formatCurrency(total - total_paid);
                      }}
                    </Form.Item>
                  </strong>
                </div>
              </Col>
            </Row>
          </div>
          <div className="card__section timeline">
            <Row gutter={24}>
              <Col md={24}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, current) =>
                    prev[POField.payments] !== current[POField.payments]
                  }
                >
                  {({ getFieldValue }) => {
                    let payments: Array<PurchasePayments> = getFieldValue(
                      POField.payments
                    );

                    return (
                      payments && (
                        <Timeline>
                          {payments.map((item, index) => (
                            <Timeline.Item
                              key={item.id}
                              className={
                                item.status === PoPaymentStatus.PAID
                                  ? "timeline__isFinished"
                                  : ""
                              }
                            >
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
                                      ? formatCurrency(item.amount)
                                      : ""}
                                  </strong>
                                </Col>
                                {item.status === PoPaymentStatus.PAID ? (
                                  <Col md={8}>
                                    <div className="timeline__status">
                                      <CheckCircleOutlined
                                        style={{ fontSize: "18px" }}
                                      />{" "}
                                      Đã duyệt
                                    </div>
                                    <div>
                                      Duyệt thanh toán <br />
                                      <strong>
                                        {ConvertUtcToLocalDate(
                                          item.updated_date
                                        )}
                                      </strong>
                                    </div>
                                  </Col>
                                ) : (
                                  <Col md={8}>
                                    <div className="timeline__groupButtons">
                                      <Button onClick={() => editPayment(item)}>
                                        <EditOutlined
                                          style={{ fontSize: "18px" }}
                                        />{" "}
                                        Sửa
                                      </Button>
                                      <Button
                                        type="primary"
                                        onClick={() =>
                                          onApprovalPayment(item, index)
                                        }
                                        loading={loadingApproval[index]}
                                      >
                                        <CheckCircleOutlined
                                          style={{ fontSize: "18px" }}
                                        />{" "}
                                        Duyệt
                                      </Button>
                                    </div>
                                  </Col>
                                )}
                              </Row>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      )
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.payments] !== current[POField.payments] ||
            prev[POField.financial_status] !== current[POField.financial_status]
          }
        >
          {({ getFieldValue }) => {
            let payments: Array<PurchasePayments> = getFieldValue(
              POField.payments
            );
            let financial_status = getFieldValue(POField.financial_status);
            debugger;
            return (
              payments &&
              payments.length > 0 &&
              financial_status !== PoFinancialStatus.CANCELLED &&
              financial_status !== PoFinancialStatus.PAID &&
              financial_status !== PoFinancialStatus.FINISHED && (
                <div className="card__footer">
                  <Button
                    onClick={finishPayment}
                    className="create-button-custom ant-btn-outline fixed-button"
                  >
                    Kết thúc thanh toán
                  </Button>
                </div>
              )
            );
          }}
        </Form.Item>
      </Card>

      <PaymentModal
        visible={isVisiblePaymentModal}
        onOk={OkPaymentModal}
        onCancel={CancelPaymentModal}
        purchasePayment={paymentItem}
        poId={props.poId}
      />
      <ModalConfirm
        onCancel={() => {
          setConfirmPayment(false);
        }}
        onOk={() => {
          setConfirmPayment(false);
          dispatch(
            PoUpdateFinancialStatusAction(
              props.poId,
              PoFinancialStatus.FINISHED,
              updateFinancialStatusCallback
            )
          );
        }}
        okText="Đồng ý"
        cancelText="Hủy"
        title="Bạn có chắc chắn muốn kết thúc thanh toán không?"
        subTitle="Sau khi kết thúc đơn hàng sẽ ghi nhận đã thanh toán đủ"
        visible={isConfirmPayment}
      />
    </StyledComponent>
  );
};

export default POPaymentForm;
