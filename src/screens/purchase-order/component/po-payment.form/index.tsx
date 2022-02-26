import {
  CheckCircleOutlined,
  EditOutlined,
  MinusCircleOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Progress,
  Row,
  Space,
  Tag,
  Timeline
} from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ModalConfirmProps } from "component/modal/ModalConfirm";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { PoPaymentUpdateAction } from "domain/actions/po/po-payment.action";
import { PoUpdateFinancialStatusAction } from "domain/actions/po/po.action";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import React, { lazy, useCallback, useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { formatCurrency } from "utils/AppUtils";
import {
  PoFinancialStatus,
  PoPaymentMethod,
  PoPaymentStatus,
  POStatus,
  ProcumentStatus
} from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

const ModalConfirm = lazy(() => import("component/modal/ModalConfirm"))
const PaymentModal = lazy(() => import("screens/purchase-order/modal/payment.modal"))

type POPaymentFormProps = {
  poId: number;
  loadDetail: (poId: number, isLoading: boolean, isSuggest: boolean) => void;
  poData: PurchaseOrder;
  isSuggest: boolean;
  setSuggest: (isSuggest: boolean) => void;
  setVisiblePaymentModal : (value: boolean) => void;
  isVisiblePaymentModal : boolean;
  paymentItem: PurchasePayments|undefined,
  setPaymentItem: (paymentItem: PurchasePayments|undefined) => void;
  initValue: any,
  setInitValue: (initValue: any) => void
};
const POPaymentForm: React.FC<POPaymentFormProps> = (
  props: POPaymentFormProps
) => {
 const {isVisiblePaymentModal, setVisiblePaymentModal, paymentItem, setPaymentItem, initValue, setInitValue}=props
  const dispatch = useDispatch();
  // const [isVisiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [isConfirmPayment, setConfirmPayment] = useState<boolean>(false);
  const [indexPaymentItem, setIndexPaymentItem] = useState<string>("");
  const [loadingApproval, setLoaddingApproval] = useState<any>({});
  const { poData } = props;
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });



  const CancelPaymentModal = () => {
    setVisiblePaymentModal(false);
  };
  const OkPaymentModal = useCallback(
    (isReload: boolean) => {
      setVisiblePaymentModal(false);
      if (isReload) {
        props.loadDetail(props.poId, false, false);
      }
    },
    [props, setVisiblePaymentModal]
  );

  const updateCallback = useCallback(
    (result: PurchasePayments | null) => {
      if (result !== null && result !== undefined) {
        showSuccess("cập nhật dữ liệu thành công");
        props.loadDetail(props.poId, false, false);
      }
    },
    [props]
  );

  const updateFinancialStatusCallback = useCallback(
    (result: PurchaseOrder | null) => {
      if (result !== null && result !== undefined) {
        showSuccess("cập nhật dữ liệu thành công");
        props.loadDetail(props.poId, false, false);
      }
    },
    [props]
  );

  const finishPayment = useCallback(() => {
    setConfirmPayment(true);
  }, []);

  const onApprovalPayment = useCallback(
    (item: PurchasePayments) => {
      if (item.id) {
        const newLoadings = { ...loadingApproval };
        newLoadings[item.id] = true;
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
  }, [setPaymentItem, setVisiblePaymentModal]);

  const editPayment = useCallback((item: PurchasePayments, index: number) => {
    setPaymentItem(item);
    setIndexPaymentItem(index.toString());
    setVisiblePaymentModal(true);
  }, [setPaymentItem, setVisiblePaymentModal]);

  const onDeletePayment = useCallback(() => {
    setIndexPaymentItem("");
  }, []);

  useEffect(() => {
    if (poData) {
      if (poData.receive_status === ProcumentStatus.FINISHED) {
        if (props.isSuggest && poData.total_payment < poData.total_paid) {
          props.setSuggest(false);
          setModalConfirm({
            visible: true,
            subTitle:
              "Bạn có xác nhận tạo yêu cầu thanh toán chênh lệch hay không?",
            title: "Tổng tiền thanh toán lớn giá trị nhập kho thực tế",
            onCancel: () => {
              setModalConfirm({ visible: false });
            },
            onOk: () => {
              setModalConfirm({ visible: false });
              setInitValue({
                is_refund: true,
                amount: poData.total_paid - poData.total_payment,
              });
              setVisiblePaymentModal(true);
            },
          });
        }
      }
    }
  }, [poData, props, setInitValue, setVisiblePaymentModal]);

  return (
    <StyledComponent>
      <Card
        className="po-form margin-top-20"
        title={
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
              let dotClassName = "icon-dot";
              if (financial_status === PoFinancialStatus.PARTIAL_PAID) {
                statusName = "Thanh toán 1 phần";
                className += " po-tag-warning";
                dotClassName += " partial";
              }
              if (
                financial_status === PoFinancialStatus.CANCELLED ||
                financial_status === PoFinancialStatus.FINISHED ||
                financial_status === PoFinancialStatus.PAID
              ) {
                statusName = "Đã thanh toán";
                className += " po-tag-success";
                dotClassName += " success";
              }
              return (
                <Space>
                  <div className={dotClassName} style={{ fontSize: 8 }} />
                  <div className="d-flex">
                    <span className="title-card">THANH TOÁN</span>
                  </div>{" "}
                  <Tag className={className}>{statusName}</Tag>
                </Space>
              );
            }}
          </Form.Item>
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
              let status = getFieldValue(POField.status);
              let checkStatus =
                financial_status !== PoFinancialStatus.CANCELLED &&
                financial_status !== PoFinancialStatus.PAID &&
                financial_status !== PoFinancialStatus.FINISHED;
              if(status === POStatus.CANCELLED) {
                checkStatus = false;
              }
              return (
                checkStatus && (
                  <AuthWrapper
                    acceptPermissions={[PurchaseOrderPermission.payments_create]}
                  >
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
                  </AuthWrapper>
                )
              );
            }}
          </Form.Item>
        }
      >
        <Form.Item hidden noStyle name={POField.financial_status}>
          <Input />
        </Form.Item>
        <div>
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
                        prev[POField.total_payment] !==
                          current[POField.total_payment]
                      }
                    >
                      {({ getFieldValue }) => {
                        let total_paid = getFieldValue(POField.total_paid);
                        let total_payment = getFieldValue(
                          POField.total_payment
                        );
                        let percent = 0;
                        if (total_paid && total_payment) {
                          percent = Math.round(
                            (total_paid / total_payment) * 100
                          );
                        }

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
                        prev[POField.total_payment] !==
                          current[POField.total_payment]
                      }
                    >
                      {({ getFieldValue }) => {
                        let total_paid = getFieldValue(POField.total_paid);
                        let total_payment = getFieldValue(
                          POField.total_payment
                        );
                        return formatCurrency(
                          Math.round(total_payment - total_paid)
                        );
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
                                      {item.is_refund
                                        ? "Yêu cầu hoàn tiền"
                                        : "Yêu cầu thanh toán"}{" "}
                                      : <br />
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
                                {item.status === PoPaymentStatus.PAID ? (
                                  <Col md={8}>
                                    <div className="timeline__status">
                                      <CheckCircleOutlined style={{fontSize: "18px"}} />{" "}
                                      Đã duyệt
                                    </div>
                                    <div>
                                      Duyệt thanh toán <br />
                                      <strong>
                                        {ConvertUtcToLocalDate(item.updated_date)}
                                      </strong>
                                    </div>
                                  </Col>
                                ) : item.status !== PoPaymentStatus.CANCELLED ? (
                                  <Col md={8}>
                                    <div className="timeline__groupButtons">
                                      <AuthWrapper
                                        acceptPermissions={[
                                          PurchaseOrderPermission.payments_update,
                                        ]}
                                      >
                                        <Button onClick={() => editPayment(item, index)}>
                                          <EditOutlined style={{fontSize: "18px"}} /> Sửa
                                        </Button>

                                        <Button
                                          type="primary"
                                          onClick={() => onApprovalPayment(item)}
                                          loading={
                                            item.id ? loadingApproval[item.id] : false
                                          }
                                        >
                                          <CheckCircleOutlined
                                            style={{fontSize: "18px"}}
                                          />{" "}
                                          Duyệt
                                        </Button>
                                      </AuthWrapper>
                                    </div>
                                  </Col>
                                ) : (
                                  <Col md={8}>
                                    <div className="timeline__status">
                                      <MinusCircleOutlined
                                        style={{
                                          fontSize: "18px",
                                          color: "#E24343",
                                        }}
                                      />{" "}
                                      <div style={{color: "#E24343"}}>Đã hủy</div>
                                    </div>
                                    <div>
                                      Hủy thanh toán <br />
                                      <strong>
                                        {ConvertUtcToLocalDate(item.updated_date)}
                                      </strong>
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
            prev[POField.financial_status] !==
              current[POField.financial_status] ||
            prev[POField.receive_status] !== current[POField.receive_status]
          }
        >
          {({ getFieldValue }) => {
            let payments: Array<PurchasePayments> = getFieldValue(
              POField.payments
            );
            let financial_status = getFieldValue(POField.financial_status);
            let receive_status = getFieldValue(POField.receive_status);
            return (
              payments &&
              payments.length > 0 &&
              receive_status === ProcumentStatus.FINISHED &&
              financial_status !== PoFinancialStatus.CANCELLED &&
              financial_status !== PoFinancialStatus.PAID &&
              financial_status !== PoFinancialStatus.FINISHED && (
                <AuthWrapper
                  acceptPermissions={[PurchaseOrderPermission.payments_finish]}
                >
                  <div className="card__footer">
                    <Button
                      onClick={finishPayment}
                      className="create-button-custom ant-btn-outline fixed-button"
                    >
                      Kết thúc thanh toán
                    </Button>
                  </div>
                </AuthWrapper>
              )
            );
          }}
        </Form.Item>
      </Card>

      <Form.Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev[POField.total_paid] !== current[POField.total_paid] ||
          prev[POField.total_payment] !== current[POField.total_payment]
        }
      >
        {({ getFieldValue }) => {
          let total_paid = getFieldValue(POField.total_paid);
          let total_payment = getFieldValue(POField.total_payment);
          let remainPayment = total_payment - total_paid;
          return (
            <PaymentModal
              initValue={initValue}
              poData={poData}
              visible={isVisiblePaymentModal}
              onOk={OkPaymentModal}
              onCancel={CancelPaymentModal}
              purchasePayment={paymentItem}
              poId={props.poId}
              remainPayment={remainPayment}
              deletePayment={onDeletePayment}
              indexPaymentItem={indexPaymentItem}
            />
          );
        }}
      </Form.Item>
      <ModalConfirm {...modalConfirm} />
      <ModalConfirm
        onCancel={() => {
          setConfirmPayment(false);
        }}
        onOk={() => {
          setConfirmPayment(false);
          dispatch(
            PoUpdateFinancialStatusAction(
              props.poId,
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
