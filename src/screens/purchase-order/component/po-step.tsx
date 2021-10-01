import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { POStatus } from "utils/Constants";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";

const statusToStep = {
  [POStatus.DRAFT]: 0,
  [POStatus.FINALIZED]: 1,
  // [POStatus.DRAFTPO]: 2,
  [POStatus.STORED]: 2,
  [POStatus.COMPLETED]: 3,
  [POStatus.FINISHED]: 4,
  [POStatus.CANCELLED]: 5,
};

// DRAFT("draft", "Nháp"), //Đặt hàng
//   FINALIZED("finalized", "Đã xác nhận"), //Xác nhận
//   DRAFTPO("draftpo", "Phiếu nháp"), //Phiếu nháp
//   STORED("stored", "Đã nhập kho"),  //Nhập kho
//   COMPLETED("completed", "Đã hoàn thành"), //Hoàn thành
//   FINISHED("finished", "Đã kết thúc"), //Kết thúc
//   CANCELLED("cancelled", "Đã hủy"); //Hủy
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
  } = poData;
  const getDescription = (step: number) => {
    let currentStep = statusToStep[poStatus];
    let updatedDate =
      procurements &&
      procurements.length > 0 &&
      procurements[procurements.length - 1].updated_date;
    switch (step) {
      case 0:
        if (currentStep >= 0 && order_date !== null)
          return ConvertUtcToLocalDate(order_date);
        return null;
      case 1:
        if (
          currentStep >= statusToStep[POStatus.FINALIZED] &&
          activated_date !== null
        ) {
          return ConvertUtcToLocalDate(activated_date);
        } else if (
          currentStep >= statusToStep[POStatus.FINALIZED] &&
          updatedDate
        ) {
          return ConvertUtcToLocalDate(updatedDate);
        } else {
          return null;
        }
      case 2:
        if (currentStep >= statusToStep[POStatus.STORED] && updatedDate)
          return ConvertUtcToLocalDate(updatedDate);
        return null;
      default:
        if (
          currentStep === statusToStep[POStatus.CANCELLED] &&
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
      case 5:
        return "Kết thúc";
      case 6:
        return "Huỷ";
      default:
        return "Hoàn thành";
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
      current={statusToStep[poStatus]}
    >
      <Steps.Step title="Đặt hàng" description={getDescription(0)} />
      <Steps.Step title="Xác nhận" description={getDescription(1)} />
      <Steps.Step title="Nhập kho" description={getDescription(2)} />
      <Steps.Step title={getLastStepName()} description={getDescription(3)} />
    </Steps>
  );
};

export default POStep;
