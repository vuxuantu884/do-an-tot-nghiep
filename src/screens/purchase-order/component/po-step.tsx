import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { useMemo } from "react";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { POStatus, ProcumentStatus, PoFinancialStatus } from "utils/Constants";
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
};
export interface POStepProps {
  poData?: PurchaseOrder;
}

const POStep: React.FC<POStepProps> = (props: POStepProps) => {
  const { poData } = props;
  const {
    order_date,
    receive_status,
    financial_status,
    receipt_quantity,
    planned_quantity,
    status,
    procurements,
    activated_date,
    completed_date,
  } = poData || {};
  /**
   * trang thai PO = trang thai nhap kho + trang thai thanh toan
   * 0: dat hang, 1: xac nhan, 2: phieu nhap, 3: nhap kho, 4: hoan thanh
   */
  const combineStatus = useMemo(() => {
    if (status === POStatus.DRAFT) return POStatus.DRAFT;
    if (!receive_status) return POStatus.ORDER;
    if (
      [ProcumentStatus.NOT_RECEIVED, ProcumentStatus.PARTIAL_RECEIVED].includes(
        receive_status
      )
    ) {
      let totalOrdered = 0;
      procurements &&
        procurements.map((procurementItem) => {
          totalOrdered += POUtils.totalQuantityProcument(
            procurementItem.procurement_items
          );
        });

      if (planned_quantity && totalOrdered >= planned_quantity)
        return POStatus.PROCUREMENT_DRAFT;
      else return POStatus.FINALIZED;
    }
    if (receive_status === ProcumentStatus.RECEIVED) {
      return POStatus.PROCUREMENT_RECEIVED;
    }
    if (receive_status === ProcumentStatus.FINISHED) {
      if (financial_status === PoFinancialStatus.PAID) {
        if (!receipt_quantity || !planned_quantity)
          return POStatus.PROCUREMENT_RECEIVED;
        if (receipt_quantity >= planned_quantity) return POStatus.COMPLETED;
        else return POStatus.FINISHED;
      } else return POStatus.PROCUREMENT_RECEIVED;
    }
    return POStatus.DRAFT;
  }, [
    status,
    receive_status,
    financial_status,
    receipt_quantity,
    planned_quantity,
    procurements,
  ]);

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
        if (currentStep >= 4 && activated_date)
          return ConvertUtcToLocalDate(completed_date);
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
        title={statusToStep[combineStatus] === 5 ? "Kết thúc" : "Hoàn thành"}
        description={getDescription(4)}
      />
    </Steps>
  );
};

export default POStep;
