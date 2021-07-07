import { Steps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import { useEffect, useState } from "react";

type StepStatusProps = {
  status?: string | null | undefined;
};

const CreateBillStep: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  let now = moment().format("DD/MM/YYYY HH:MM");
  const [state, setstate] = useState<number>(0);
  const point = () => {
    switch (props.status) {
      case "draff":
        setstate(0);
        break;
      case "finalized":
        setstate(1);
        break;
      case "packed":
        setstate(2);
        break
      case "shipping":
        setstate(3);
        break;
      default:
        return 0;
    }
  };
  useEffect(() => {
    point();
  }, [props.status]);
  


  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <Steps progressDot={progressDot} size="small" current={state}>
      <Steps.Step title="Đặt hàng" description={now} />
      <Steps.Step title="Xác nhận" />
      <Steps.Step title="Đóng gói" />
      <Steps.Step title="Xuất kho" />
      <Steps.Step title="Hoàn thành" />
    </Steps>
  );
};

export default CreateBillStep;
