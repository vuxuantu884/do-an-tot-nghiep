import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

export interface POStepProps {
  status?: string;
  order_date?: string|null,
};


const POStep: React.FC<POStepProps> = (props: POStepProps) => {
  const {order_date} = props;
  console.log(order_date);
  return (
    <Steps
      progressDot={(dot: any, { status, index }: any) => (
        <div className="ant-steps-icon-dot">
          {(status === "process" || status === "finish") && <CheckOutlined />}
        </div>
      )}
      size="small"
      current={0}
    >
      <Steps.Step title="Đặt hàng" description={order_date !== null && ConvertUtcToLocalDate(order_date) } />
      <Steps.Step title="Xác nhận" />
      <Steps.Step title="Phiếu nháp" />
      <Steps.Step title="Nhập kho" />
      <Steps.Step title="Hoàn thành" />
    </Steps>
  );
};

export default POStep;
