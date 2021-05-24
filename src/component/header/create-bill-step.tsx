import { Steps } from "antd";


const { Step } = Steps;
const CreateBillStep: React.FC = () => {
  return (
    <Steps progressDot>
      <Step title="Đặt hàng" />
      <Step title="Xác nhận" />
      <Step title="Đóng gói" />
      <Step title="Xuất kho" />
      <Step title="Hoàn thành" />
    </Steps>
  )
}

export default CreateBillStep;