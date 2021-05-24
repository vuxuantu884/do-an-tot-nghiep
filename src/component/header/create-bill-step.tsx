import { Steps } from "antd";


const { Step } = Steps;
const CreateBillStep: React.FC = () => {
  return (
    <Steps progressDot>
      <Step title="first step" />
      <Step title="second step" />
      <Step title="third step" />
    </Steps>
  )
}

export default CreateBillStep;