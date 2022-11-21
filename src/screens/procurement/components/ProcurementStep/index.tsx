import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { ProcurementStatus } from "utils/Constants";
import { useEffect, useState } from "react";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { PRStyledComponent } from "./style";

const statusToStep = {
  [ProcurementStatus.draft]: 0,
  [ProcurementStatus.not_received]: 1,
  [ProcurementStatus.received]: 2,
  [ProcurementStatus.cancelled]: 3,
};

const STEP_LIST = [
  {
    title: "Nháp",
    step: ProcurementStatus.draft,
  },
  {
    title: "Đã duyệt",
    step: ProcurementStatus.not_received,
  },
  {
    title: "Đã nhận",
    step: ProcurementStatus.received,
  },
];
export interface PRStepProps {
  procurementData: PurchaseProcument | any;
}

const PRStep: React.FC<PRStepProps> = (props: PRStepProps) => {
  const { procurementData } = props;
  const {
    created_date,
    activated_date,
    stock_in_date,
    cancelled_date,
    status: prStatus,
  } = procurementData;
  const [stepStatusNumber, setStepStatusNumber] = useState<number>(0);

  const getDescription = (step: number) => {
    switch (step) {
      case statusToStep[ProcurementStatus.draft]:
        if (stepStatusNumber >= 0 && created_date) return ConvertUtcToLocalDate(created_date);
        return null;
      case statusToStep[ProcurementStatus.not_received]:
        if (stepStatusNumber >= statusToStep[ProcurementStatus.not_received] && activated_date) {
          return ConvertUtcToLocalDate(activated_date);
        } else {
          return null;
        }
      case statusToStep[ProcurementStatus.received]:
        if (stepStatusNumber >= statusToStep[ProcurementStatus.received] && stock_in_date) {
          return ConvertUtcToLocalDate(stock_in_date);
        } else {
          return null;
        }
      default:
        if (stepStatusNumber === statusToStep[ProcurementStatus.cancelled] && cancelled_date) {
          return ConvertUtcToLocalDate(cancelled_date);
        } else {
          return null;
        }
    }
  };

  const getLastStepName = () => {
    const currentStep = statusToStep[prStatus];
    switch (currentStep) {
      // case statusToStep[ProcurementStatus.received]:
      //   return "Đã nhận";
      case statusToStep[ProcurementStatus.cancelled]:
        return "Đã huỷ";
      default:
        return "Đã hủy";
    }
  };

  const getClassName = (step: number) => {
    if (stepStatusNumber === statusToStep[ProcurementStatus.cancelled]) {
      switch (step) {
        case statusToStep[ProcurementStatus.draft]:
          return "";
        case statusToStep[ProcurementStatus.not_received]:
          return activated_date ? "" : "inactive";
        case statusToStep[ProcurementStatus.received]:
          return stock_in_date ? "" : "inactive";
        default:
          return "";
      }
    } else {
      return "";
    }
  };

  useEffect(() => {
    setStepStatusNumber(statusToStep[prStatus]);
  }, [prStatus]);

  return (
    <PRStyledComponent>
      <Steps
        className="pr-step"
        progressDot={(dot: any, { status, index }: any) => (
          <div className="ant-steps-icon-dot">
            {(status === "process" || status === "finish") && <CheckOutlined />}
          </div>
        )}
        size="small"
        current={stepStatusNumber}
      >
        {STEP_LIST.map(({ step, title }, index) => (
          <Steps.Step
            key={index}
            title={title}
            description={getDescription(statusToStep[step])}
            className={getClassName(statusToStep[step])}
          />
        ))}
        <Steps.Step
          className={
            statusToStep[prStatus] === statusToStep[ProcurementStatus.cancelled] ? "cancelled" : ""
          }
          title={getLastStepName()}
          description={getDescription(statusToStep[ProcurementStatus.cancelled])}
        />
      </Steps>
    </PRStyledComponent>
  );
};

export default PRStep;
