import { Steps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { InventoryAdjustmentDetailItem } from "model/inventoryadjustment";
import { STATUS_INVENTORY_ADJUSTMENT } from "screens/inventory-adjustment/ListInventoryAdjustment/constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { STATUS_INVENTORY_ADJUSTMENT_CONSTANTS } from "screens/inventory-adjustment/constants";

type StepStatusProps = {
  status?: string | null | undefined;
  inventoryAdjustmentDetail?: InventoryAdjustmentDetailItem | null;
};

const InventoryAdjustmentTimeLine: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const { status, inventoryAdjustmentDetail } = props;
  const formatDate = DATE_FORMAT.DDMMYY_HHmm;
  const [currentStep, setCurrentStep] = useState(0);

  const point = useCallback(() => {
    switch (status) {
      case STATUS_INVENTORY_ADJUSTMENT.AUDITED.status:
        setCurrentStep(1);
        break;
      case STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status:
        setCurrentStep(2);
        break;
      default:
        return 0;
    }
  }, [status]);

  useEffect(() => {
    point();
  }, [point, props.status]);

  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  const strreateDate = inventoryAdjustmentDetail?.created_date
    ? moment(inventoryAdjustmentDetail.created_date).format(formatDate)
    : "";
  const stradjusted_date = inventoryAdjustmentDetail?.adjusted_date
    ? moment(inventoryAdjustmentDetail.adjusted_date).format(formatDate)
    : "";
  let straudited_date = "";
  if (inventoryAdjustmentDetail?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT) {
    straudited_date = `(${ConvertUtcToLocalDate(
      inventoryAdjustmentDetail.audited_date,
      DATE_FORMAT.DDMMYYY,
    )})`;
  } else if (
    inventoryAdjustmentDetail?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.AUDITED ||
    inventoryAdjustmentDetail?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.ADJUSTED
  ) {
    straudited_date = `${ConvertUtcToLocalDate(
      inventoryAdjustmentDetail.audited_date,
      DATE_FORMAT.DDMMYY_HHmm,
    )}`;
  }

  return (
    <Steps
      progressDot={progressDot}
      size="small"
      current={currentStep}
      className="create-bill-step"
    >
      <Steps.Step title="Kế hoạch" description={strreateDate} />
      <Steps.Step title="Kiểm kho" description={straudited_date} />
      <Steps.Step title="Đã cân tồn" description={stradjusted_date} />
    </Steps>
  );
};

export default InventoryAdjustmentTimeLine;
