import { Steps } from "antd";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { FulFillmentResponse, OrderResponse } from "model/response/order/order.response";
import { FulFillmentStatus } from "utils/Constants";


type StepStatusProps = {
  status?: string | null | undefined;
  fulfillment: FulFillmentResponse | null;
};

const CancelSteps: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const {status, fulfillment} = props;
  const [state, setstate] = useState<number>(1);
  const point = useCallback(() => {
    switch (props.status) {
      case "":
        setstate(0);
        break;
      case "":
        setstate(1);
        break;
      case "":
        setstate(2);
        break;
      default:
        return 0;
    }
  }, [props.status]);
  
  useEffect(() => {
    point();
  }, [point, props.status]);

  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot" >
      {(status === "process" || status === "finish")}
    </div>
  );

  return (
    <Steps progressDot={progressDot} current={state} className="saleorder-cancel-steps">
      <Steps.Step
        title="Ngày tạo"
        description={moment(fulfillment?.created_date).format(
          "DD/MM/YYYY HH:mm"
        )}
      />
      {status === FulFillmentStatus.SHIPPING && <Steps.Step
        title="Ngày hủy"
        description={
          moment(fulfillment?.cancel_date).format(
            "DD/MM/YYYY HH:mm"
          )
        }
      />}
      <Steps.Step
        title="Ngày nhận lại hàng"
        description={
          moment(fulfillment?.cancel_date).format(
            "DD/MM/YYYY HH:mm"
          )
        }
      />
    </Steps>
  );
};

export default CancelSteps;

