import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
// import { FulFillmentStatus } from "utils/Constants";
import "./create-bill-step.scss";

type StepStatusProps = {
  status?: string | null | undefined;
  orderDetail?: OrderResponse | null;
};

const CreateBillStep: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const {orderDetail} = props;
  const formatDate = "DD/MM/YY - HH:mm";
  const [currentStep, setCurrentStep] = useState(0);
  
  const fulfillments = useMemo(() => {
    return orderDetail?.fulfillments?.sort((a, b) => b.id - a.id)
  }, [orderDetail?.fulfillments])

  const renderStepPackedDescription = () => {
    let result = undefined;
    if (fulfillments && fulfillments?.length > 0) {
      if (orderDetail?.status !== OrderStatus.CANCELLED) {
        if (fulfillments[0].status !== FulFillmentStatus.CANCELLED &&
          fulfillments[0].status !== FulFillmentStatus.RETURNING &&
          fulfillments[0].status !== FulFillmentStatus.RETURNED) {
            result = fulfillments[0].packed_on ? moment(fulfillments[0].packed_on).format(formatDate) : undefined;
          }
      }
    }
    return result;
  };

  const renderStepShippingDescription = () => {
    let result = undefined;
    if (fulfillments && fulfillments?.length > 0) {
      if (orderDetail?.status !== OrderStatus.CANCELLED) {
        if (fulfillments[0].status !== FulFillmentStatus.CANCELLED &&
          fulfillments[0].status !== FulFillmentStatus.RETURNING &&
          fulfillments[0].status !== FulFillmentStatus.RETURNED) {
            result = fulfillments[0].export_on ? moment(fulfillments[0].export_on).format(formatDate) : undefined;
          }
      }
    }
    return result;
  };

  useEffect(() => {
    switch (props.status) {
      case "draff":
        setCurrentStep(0);
        break;
      case "finalized":
        // const confirmDraftOrderSubStatusId = 1;
        if (orderDetail) {
          if (
            // orderDetail.sub_status_id === confirmDraftOrderSubStatusId ||
            (orderDetail.payments && orderDetail.payments?.length > 0) ||
            (orderDetail.fulfillments && orderDetail.fulfillments?.length > 0)
          ) {
            setCurrentStep(1);
          }
        }
        break;
      case "picked":
        setCurrentStep(1);
        break;
      case "packed":
        setCurrentStep(2);
        break;
      case "shipping":
        setCurrentStep(3);
        break;
      case "shipped":
      case "cancelled":
        setCurrentStep(4);
        break;
      default: break;
    }
  }, [orderDetail, props.status]);

  const progressDot = (dot: any, {status, index}: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <Steps
      progressDot={progressDot}
      size="small"
      current={currentStep}
      className="create-bill-step"
    >
      <Steps.Step
        title="Đặt hàng"
        description={
          orderDetail ? moment(props.orderDetail?.created_date).format(formatDate) : null
        }
      />
      <Steps.Step
        title="Xác nhận"
        description={
          props.orderDetail &&
          fulfillments &&
          fulfillments.length > 0 &&
          fulfillments[0].created_date &&
          moment(fulfillments[0].created_date).format(formatDate)
        }
        className={
          !(
            props.orderDetail &&
            fulfillments &&
            fulfillments.length > 0
          )
            ? "inactive"
            : ""
        }
      />
      <Steps.Step
        title="Đóng gói"
        description={renderStepPackedDescription()}
        className={
          !(
            props.orderDetail &&
            fulfillments &&
            fulfillments.length > 0 &&
            fulfillments[0].packed_on &&
            fulfillments[0].status !== "returned"
          ) && orderDetail?.status === "cancelled"
            ? "inactive"
            : ""
        }
      />
      <Steps.Step
        title="Xuất kho"
        description={renderStepShippingDescription()}
        className={
          !(
            props.orderDetail &&
            fulfillments &&
            fulfillments.length > 0 &&
            fulfillments[0].export_on
          ) && orderDetail?.status === "cancelled"
            ? "inactive"
            : ""
        }
      />
      <Steps.Step
        title={!(orderDetail?.status === "cancelled") ? "Hoàn thành" : "Huỷ đơn"}
        description={
          props.orderDetail &&
          ((fulfillments &&
            fulfillments.length > 0 &&
            fulfillments[0].shipped_on &&
            moment(fulfillments[0].shipped_on).format(formatDate)) ||
            (orderDetail?.status === "cancelled" &&
              props.orderDetail?.cancelled_on &&
              moment(props.orderDetail?.cancelled_on).format(formatDate)))
        }
        className={orderDetail?.status === "cancelled" ? "cancelled" : ""}
      />
    </Steps>
  );
};

export default CreateBillStep;
