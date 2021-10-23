import { Steps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { OrderResponse } from "model/response/order/order.response";
import "./create-bill-step.scss";

type StepStatusProps = {
  status?: string | null | undefined;
  orderDetail?: OrderResponse | null;
};

const CreateBillStep: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const { orderDetail } = props;
  const formatDate = "DD/MM/YY - HH:mm";
  const [currentStep, setCurrentStep] = useState(0);
  const point = useCallback(() => {
    switch (props.status) {
      case "draff":
        setCurrentStep(0);
        break;
      case "finalized":
        const confirmDraftOrderSubStatusId = 1;
        if (orderDetail) {
          if (
            orderDetail.sub_status_id === confirmDraftOrderSubStatusId ||
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
      default:
        return 0;
    }
  }, [orderDetail, props.status]);

  useEffect(() => {
    point();
  }, [point, props.status]);

  const progressDot = (dot: any, { status, index }: any) => (
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
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].created_date &&
          moment(props.orderDetail?.fulfillments[0].created_date).format(formatDate)
        }
      />
      <Steps.Step
        title="Đóng gói"
        description={
          props.orderDetail &&
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].packed_on &&
          moment(props.orderDetail?.fulfillments[0].packed_on).format(formatDate)
        }
        className={
          !(
            props.orderDetail &&
            props.orderDetail?.fulfillments &&
            props.orderDetail?.fulfillments.length > 0 &&
            props.orderDetail?.fulfillments[0].packed_on
          ) && props.status === "cancelled"
            ? "inactive"
            : ""
        }
      />
      <Steps.Step
        title="Xuất kho"
        description={
          props.orderDetail &&
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].export_on &&
          moment(props.orderDetail?.fulfillments[0].export_on).format(formatDate)
        }
        className={
          !(
            props.orderDetail &&
            props.orderDetail?.fulfillments &&
            props.orderDetail?.fulfillments.length > 0 &&
            props.orderDetail?.fulfillments[0].export_on
          ) && props.status === "cancelled"
            ? "inactive"
            : ""
        }
      />
      <Steps.Step
        title={!(props.status === "cancelled") ? "Hoàn thành" : "Huỷ đơn"}
        description={
          props.orderDetail &&
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].shipped_on &&
          moment(props.orderDetail?.fulfillments[0].shipped_on).format(formatDate)
        }
        className={props.status === "cancelled" ? "cancelled" : ""}
      />
    </Steps>
  );
};

export default CreateBillStep;
