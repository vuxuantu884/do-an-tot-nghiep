import { Steps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { OrderResponse } from "model/response/order/order.response";

type StepStatusProps = {
  status?: string | null | undefined;
  orderDetail: OrderResponse | null;
};

const CreateBillStep: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const point = useCallback(() => {
    switch (props.status) {
      case "draff":
        setCurrentStep(0);
        break;
      case "finalized":
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
        setCurrentStep(4);
        break;
      default:
        return 0;
    }
  }, [props.status]);

  useEffect(() => {
    point();
  }, [point, props.status]);

  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <Steps progressDot={progressDot} size="small" current={currentStep}>
      <Steps.Step
        title="Đặt hàng"
        // description={moment(props.orderDetail?.created_date).format(
        //   "DD/MM/YYYY HH:mm"
        // )}
      />
      <Steps.Step
        title="Xác nhận"
        description={
          props.orderDetail &&
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].created_date &&
          moment(props.orderDetail?.fulfillments[0].created_date).format(
            "DD/MM/YYYY HH:mm"
          )
        }
      />
      <Steps.Step
        title="Đóng gói"
        description={
          props.orderDetail &&
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].packed_on &&
          moment(props.orderDetail?.fulfillments[0].packed_on).format(
            "DD/MM/YYYY HH:mm"
          )
        }
      />
      <Steps.Step
        title="Xuất kho"
        description={
          props.orderDetail &&
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].export_on &&
          moment(props.orderDetail?.fulfillments[0].export_on).format(
            "DD/MM/YYYY HH:mm"
          )
        }
      />
      <Steps.Step
        title="Hoàn thành"
        description={
          props.orderDetail &&
          props.orderDetail?.fulfillments &&
          props.orderDetail?.fulfillments.length > 0 &&
          props.orderDetail?.fulfillments[0].shipped_on &&
          moment(props.orderDetail?.fulfillments[0].shipped_on).format(
            "DD/MM/YYYY HH:mm"
          )
        }
      />
    </Steps>
  );
};

export default CreateBillStep;
