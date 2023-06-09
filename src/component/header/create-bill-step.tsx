import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { isOrderFromPOS } from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { FulfillmentStatus } from "utils/FulfillmentStatus.constant";
import { getFulfillmentActive, isFulfillmentReturned } from "utils/fulfillmentUtils";
import { isDeliveryOrderReturned } from "utils/OrderUtils";
import "./create-bill-step.scss";

type StepStatusProps = {
  status?: string | null | undefined;
  orderDetail?: OrderResponse | null;
};

const CreateBillStep: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const { orderDetail } = props;
  const formatDate = DATE_FORMAT.fullDate;
  const [currentStep, setCurrentStep] = useState(0);
  const fulfillments = useMemo(() => {
    return getFulfillmentActive(orderDetail?.fulfillments);
  }, [orderDetail?.fulfillments]);

  // console.log("fulfillments",fulfillments)

  const renderStepFinalizedDescription = () => {
    if (!orderDetail) {
      return null;
    }
    if (isOrderFromPOS(orderDetail) && orderDetail?.finished_on) {
      return moment(orderDetail.finished_on).format(formatDate);
    }
    let result = undefined;
    if (props.orderDetail && props.orderDetail.finalized_on) {
      result = moment(props.orderDetail.finalized_on).format(formatDate);
    }
    return result;
  };

  const renderStepPackedDescription = () => {
    if (!orderDetail) {
      return null;
    }
    if (isOrderFromPOS(orderDetail) && orderDetail?.finished_on) {
      return moment(orderDetail.finished_on).format(formatDate);
    }
    let result = undefined;
    if (fulfillments) {
      if (orderDetail?.status !== OrderStatus.CANCELLED) {
        if (
          !(
            fulfillments.status === FulFillmentStatus.CANCELLED ||
            fulfillments.status === FulFillmentStatus.RETURNING ||
            fulfillments.status === FulFillmentStatus.RETURNED
          )
        ) {
          result = fulfillments.packed_on
            ? moment(fulfillments.packed_on).format(formatDate)
            : undefined;
        }
      } else if (isFulfillmentReturned(fulfillments)) {
        result = fulfillments.packed_on
          ? moment(fulfillments.packed_on).format(formatDate)
          : undefined;
      }
    }
    return result;
  };

  const renderStepShippingDescription = () => {
    if (!orderDetail) {
      return null;
    }
    if (isOrderFromPOS(orderDetail) && orderDetail?.finished_on) {
      return moment(orderDetail.finished_on).format(formatDate);
    }
    let result = undefined;
    if (fulfillments) {
      if (orderDetail?.status !== OrderStatus.CANCELLED) {
        if (
          !(
            fulfillments.status === FulFillmentStatus.CANCELLED ||
            fulfillments.status === FulFillmentStatus.RETURNING ||
            fulfillments.status === FulFillmentStatus.RETURNED
          )
        ) {
          result = fulfillments.export_on
            ? moment(fulfillments.export_on).format(formatDate)
            : undefined;
        }
      } else if (isFulfillmentReturned(fulfillments)) {
        result = fulfillments.export_on
          ? moment(fulfillments.export_on).format(formatDate)
          : undefined;
      }
    }
    return result;
  };

  const renderStepFinishDescription = () => {
    if (!orderDetail) {
      return null;
    }
    if (isOrderFromPOS(orderDetail) && orderDetail?.finished_on) {
      return moment(orderDetail.finished_on).format(formatDate);
    }
    if (fulfillments && fulfillments.shipped_on) {
      return moment(fulfillments.shipped_on).format(formatDate);
    }
    if (orderDetail?.status === OrderStatus.CANCELLED && orderDetail?.cancelled_on) {
      return moment(props.orderDetail?.cancelled_on).format(formatDate);
    }
    if (isDeliveryOrderReturned(orderDetail?.fulfillments) && orderDetail?.fulfillments) {
      let fulfillmentFind = orderDetail?.fulfillments.find(
        (p) =>
          p.status === FulFillmentStatus.CANCELLED &&
          p.return_status === FulFillmentStatus.RETURNED &&
          p.status_before_cancellation === FulFillmentStatus.SHIPPING,
      );
      return moment(fulfillmentFind?.receive_cancellation_on).format(formatDate);
    }
    return undefined;
  };

  useEffect(() => {
    if (!orderDetail) {
      return;
    }
    switch (props.status) {
      case "draff":
        setCurrentStep(0);
        break;
      case "finalized":
        // const confirmDraftOrderSubStatusId = 1;
        if (orderDetail) {
          setCurrentStep(1);
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
      case "finished":
      case "cancelled":
        setCurrentStep(4);
        break;
      default:
        break;
    }
  }, [orderDetail, props.status]);

  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  // console.log("currentStep",props.status)
  // console.log("currentStep",currentStep)

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
        className="draft"
      />
      <Steps.Step title="Đang giao dịch" description={renderStepFinalizedDescription()} />
      <Steps.Step
        title="Đóng gói"
        description={renderStepPackedDescription()}
        className={
          !(
            props.orderDetail &&
            fulfillments &&
            fulfillments?.packed_on &&
            fulfillments.status !== FulfillmentStatus.RETURNED &&
            fulfillments.status !== FulfillmentStatus.CANCELLED &&
            fulfillments.status !== FulfillmentStatus.RETURNING
          ) &&
          orderDetail?.status === OrderStatus.CANCELLED &&
          !(fulfillments && isFulfillmentReturned(fulfillments))
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
            fulfillments.export_on &&
            fulfillments.status !== FulfillmentStatus.RETURNED &&
            fulfillments.status !== FulfillmentStatus.CANCELLED &&
            fulfillments.status !== FulfillmentStatus.RETURNING
          ) &&
          orderDetail?.status === OrderStatus.CANCELLED &&
          !(fulfillments && isFulfillmentReturned(fulfillments))
            ? "inactive"
            : ""
        }
      />
      <Steps.Step
        //title={!(orderDetail?.status === OrderStatus.CANCELLED) ? orderDetail?.status === OrderStatus.COMPLETED ? "Hoàn thành" : isDeliveryOrderReturned(orderDetail?.fulfillments)?"Đã hoàn": "Thành công" : "Huỷ đơn"}
        title={
          orderDetail?.status === OrderStatus.COMPLETED
            ? "Hoàn thành"
            : fulfillments && isFulfillmentReturned(fulfillments)
            ? "Đã hoàn"
            : orderDetail?.status === OrderStatus.CANCELLED
            ? "Huỷ đơn"
            : "Thành công"
        }
        description={renderStepFinishDescription()}
        className={
          orderDetail?.status === OrderStatus.CANCELLED &&
          fulfillments &&
          isFulfillmentReturned(fulfillments)
            ? "returned"
            : orderDetail?.status === OrderStatus.CANCELLED
            ? "cancelled"
            : ""
        }
      />
    </Steps>
  );
};

export default CreateBillStep;
