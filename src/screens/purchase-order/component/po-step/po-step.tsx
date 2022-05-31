import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { POStatus, ProcumentStatus } from "utils/Constants";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import "./po-step.style.scss"
import { useEffect, useMemo, useState } from "react";

const FINISHED_RECEIVING = "FINISHED_RECEIVING"; // trạng thái kết thúc nhập kho, trên PO không có trạng thái này, để đây để hiển thị trạng thái thôi

const statusToStep = {
  [POStatus.DRAFT]: 0,
  [POStatus.WAITING_APPROVAL]: 1,
  [POStatus.FINALIZED]: 2,
  [POStatus.STORED]: 3,
  [FINISHED_RECEIVING]: 4,
  [POStatus.COMPLETED]: 5,
  [POStatus.FINISHED]: 6,
  [POStatus.CANCELLED]: 7,
};

const STEP_LIST = [
  {
    title: "Đặt hàng",
    step: POStatus.DRAFT
  },
  {
    title: "Chờ duyệt",
    step: POStatus.WAITING_APPROVAL
  },
  {
    title: "Đã duyệt",
    step: POStatus.FINALIZED
  },
  {
    title: "Nhập kho",
    step: POStatus.STORED
  },
  {
    title: "Kết thúc nhập",
    step: FINISHED_RECEIVING
  }
]
export interface POStepProps {
  poData: PurchaseOrder | any;
}

const POStep: React.FC<POStepProps> = (props: POStepProps) => {
  const { poData } = props;
  const {
    order_date,
    procurements,
    activated_date,
    completed_date,
    cancelled_date,
    status: poStatus,
    receipt_quantity,
    receive_status,
    receive_finished_date,
    waiting_approval_date
  } = poData;
  const [stepStatusNumber, setStepStatusNumber] = useState<number>(0);

  const isFinishedReceiving = useMemo(() => {
    return poStatus === POStatus.STORED && receive_status === ProcumentStatus.FINISHED;
  }, [poStatus, receive_status]);

  const getDescription = (step: number) => {
    const updatedProcurementDate = Array.isArray(procurements) && procurements.length > 0 ? procurements[procurements.length - 1].updated_date : null;

    switch (step) {
      case statusToStep[POStatus.DRAFT]:
        if (stepStatusNumber >= 0 && order_date)
          return ConvertUtcToLocalDate(order_date);
        return null;
      case statusToStep[POStatus.WAITING_APPROVAL]:
        if (stepStatusNumber >= statusToStep[POStatus.WAITING_APPROVAL] && waiting_approval_date) {
          return ConvertUtcToLocalDate(waiting_approval_date);
        } else {
          return null;
        }
      case statusToStep[POStatus.FINALIZED]:
        if (
          stepStatusNumber >= statusToStep[POStatus.FINALIZED] &&
          activated_date !== null
        ) {
          return ConvertUtcToLocalDate(activated_date);
        } else {
          return null;
        }
      case statusToStep[POStatus.STORED]:
        if (stepStatusNumber >= statusToStep[POStatus.STORED] && updatedProcurementDate && receipt_quantity > 0)
          return ConvertUtcToLocalDate(updatedProcurementDate);
        return null;
      case statusToStep[FINISHED_RECEIVING]:
        if (stepStatusNumber >= statusToStep[FINISHED_RECEIVING] && receive_finished_date)
          return ConvertUtcToLocalDate(receive_finished_date);
        return null;
      default:
        if (
          stepStatusNumber === statusToStep[POStatus.CANCELLED] &&
          cancelled_date
        ) {
          return ConvertUtcToLocalDate(cancelled_date);
        } else if (completed_date) {
          return ConvertUtcToLocalDate(completed_date);
        } else {
          return null;
        }
    }
  };

  const getLastStepName = () => {
    const currentStep = statusToStep[poStatus];
    switch (currentStep) {
      case statusToStep[POStatus.FINISHED]:
        return "Kết thúc";
      case statusToStep[POStatus.CANCELLED]:
        return "Huỷ";
      default:
        return "Hoàn thành";
    }
  };

  const getClassName = (step: number) => {

    if (stepStatusNumber === statusToStep[POStatus.CANCELLED]) {
      switch (step) {
        case statusToStep[POStatus.DRAFT]:
          return ''
        case statusToStep[POStatus.WAITING_APPROVAL]:
          return waiting_approval_date ? '' : 'inactive'
        case statusToStep[POStatus.FINALIZED]:
          if (activated_date === null) {
            return 'inactive'
          } else {
            return '';
          }
        case statusToStep[POStatus.STORED]:
          if (receipt_quantity > 0) {
            return '';
          } else {
            return 'inactive'
          }
        case statusToStep[FINISHED_RECEIVING]:
          return receive_finished_date ? '' : 'inactive'
        default:
          return '';
      }
    } else {
      return '';
    }
  };

  useEffect(() => {
    if (isFinishedReceiving) {
      setStepStatusNumber(statusToStep[FINISHED_RECEIVING])
    } else {
      setStepStatusNumber(statusToStep[poStatus])
    }
  }, [isFinishedReceiving, poStatus])

  return (
    <Steps
      progressDot={(dot: any, { status, index }: any) => (
        <div className="ant-steps-icon-dot">
          {(status === "process" || status === "finish") && <CheckOutlined />}
        </div>
      )}
      className="po-step"
      size="small"
      current={stepStatusNumber}
    >
      {STEP_LIST.map(({ step, title }, index) => <Steps.Step
        key={index}
        title={title}
        description={getDescription(statusToStep[step])}
        className={getClassName(statusToStep[step])}
      />)}
      <Steps.Step
        className={statusToStep[poStatus] === statusToStep[POStatus.CANCELLED] ? "cancelled" : ""}
        title={getLastStepName()}
        description={getDescription(statusToStep[POStatus.FINISHED])}
      />
    </Steps>
  );
};

export default POStep;
