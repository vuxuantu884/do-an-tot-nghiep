import { CheckOutlined } from "@ant-design/icons"
import { Steps } from "antd"

type POStepProps = {
  status: string,
}

const POStep: React.FC<POStepProps> = (props: POStepProps) => {
  return (
    <Steps
          progressDot={(dot: any, { status, index }: any) => (
            <div className="ant-steps-icon-dot">
              {(status === "process" || status === "finish") && (
                <CheckOutlined />
              )}
            </div>
          )}
          size="small"
          current={0}
        >
          <Steps.Step title="Đặt hàng" />
          <Steps.Step title="Xác nhận" />
          <Steps.Step title="Phiếu nháp" />
          <Steps.Step title="Nhập kho" />
          <Steps.Step title="Hoàn thành" />
        </Steps>
  )
}

export default POStep;