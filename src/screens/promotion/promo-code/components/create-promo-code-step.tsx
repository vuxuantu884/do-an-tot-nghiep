import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { useState } from "react";
import "./create-promo-code-step.scss";

type StepStatusProps = {
  step:number
};

const CreatePromoCodeStep: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const {step} = props;

  const progressDot = (dot: any, {status, index}: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <Steps
      progressDot={progressDot}
      size="small"
      current={step}
      className="create-bill-step"
    >
      <Steps.Step
        title="Thêm mới đợt phát hành"
      />
      <Steps.Step
        title="Thêm mã giảm giá"
      />
      <Steps.Step
        title="Hoàn thành"
      />
    </Steps>
  );
};

export default CreatePromoCodeStep;
