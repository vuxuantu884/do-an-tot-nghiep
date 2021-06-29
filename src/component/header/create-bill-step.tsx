import { Steps } from "antd";
import {
  CheckOutlined,
} from "@ant-design/icons";

const { Step } = Steps;
const CreateBillStep: React.FC = () => {
  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <Steps progressDot={progressDot} size="small" current={0}>
      <Steps.Step title="Đặt hàng" description="01/01/2021 19:00" />
      <Steps.Step title="Xác nhận" />
      <Steps.Step title="Đóng gói" />
      <Steps.Step title="Xuất kho" />
      <Steps.Step title="Hoàn thành" />
    </Steps>
  );
};

export default CreateBillStep;
