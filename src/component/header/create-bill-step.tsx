import { Steps } from "antd";
import {
  CheckOutlined,
} from "@ant-design/icons";
import moment from "moment";

const CreateBillStep: React.FC = () => {
  let now = moment().format("DD/MM/YYYY HH:MM");

  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <Steps progressDot={progressDot} size="small" current={0}>
      <Steps.Step title="Đặt hàng" description={now} />
      <Steps.Step title="Xác nhận" />
      <Steps.Step title="Đóng gói" />
      <Steps.Step title="Xuất kho" />
      <Steps.Step title="Hoàn thành" />
    </Steps>
  );
};

export default CreateBillStep;
