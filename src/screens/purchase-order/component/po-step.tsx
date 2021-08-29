import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { useMemo } from "react";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { POStatus } from "utils/Constants";
import { POUtils } from "utils/POUtils";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";

const statusToStep = {
  [POStatus.DRAFT]: -1,
  [POStatus.ORDER]: 0,
  [POStatus.FINALIZED]: 1,
  [POStatus.PROCUREMENT_DRAFT]: 2,
  [POStatus.PROCUREMENT_RECEIVED]: 3,
  [POStatus.COMPLETED]: 4,
  [POStatus.FINISHED]: 5,
  [POStatus.CANCELLED]: 6,
};
export interface POStepProps {
  poData?: PurchaseOrder;
}

const POStep: React.FC<POStepProps> = (props: POStepProps) => {
  const { poData } = props;
  const {
    order_date,
    procurements,
    activated_date,
    completed_date,
    cancelled_date,
  } = poData || {};
  const combineStatus = useMemo(() => {
    if (poData) return POUtils.combinePOStatus(poData);
    return POStatus.DRAFT;
  }, [poData]);

  const getDescription = (step: number) => {
    let currentStep = statusToStep[combineStatus];
    switch (step) {
      case 0:
        if (currentStep >= 0 && order_date !== null)
          return ConvertUtcToLocalDate(order_date);
        return null;
      case 1:
        if (currentStep >= 1 && activated_date !== null)
          return ConvertUtcToLocalDate(activated_date);
        return null;
      case 2:
        if (currentStep >= 2 && activated_date)
          return ConvertUtcToLocalDate(activated_date);
        return null;
      case 3:
        let date =
          procurements &&
          procurements.length > 0 &&
          procurements[procurements.length - 1].updated_date;
        if (currentStep >= 3 && date) return ConvertUtcToLocalDate(date);
        return null;
      case 4:
        if (currentStep >= 4) {
          if (
            currentStep === statusToStep[POStatus.CANCELLED] &&
            cancelled_date
          ) {
            return ConvertUtcToLocalDate(cancelled_date);
          } else if (completed_date) {
            return ConvertUtcToLocalDate(completed_date);
          }
        }
        return null;
    }
  };

  return (
    <Steps
      progressDot={(dot: any, { status, index }: any) => (
        <div className="ant-steps-icon-dot">
          {(status === "process" || status === "finish") && <CheckOutlined />}
        </div>
      )}
      size="small"
      current={statusToStep[combineStatus]}
    >
      <Steps.Step title="Đặt hàng" description={getDescription(0)} />
      <Steps.Step title="Xác nhận" description={getDescription(1)} />
      <Steps.Step title="Phiếu nháp" description={getDescription(2)} />
      <Steps.Step title="Nhập kho" description={getDescription(3)} />
      <Steps.Step
        title={
          statusToStep[combineStatus] === 4
            ? "Kết thúc"
            : statusToStep[combineStatus] === 5
            ? "Hoàn thành"
            : "Hủy"
        }
        description={getDescription(4)}
      />
    </Steps>
  );
};

export default POStep;
