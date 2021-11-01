import { Steps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { StyledWrapper } from "screens/inventory/DetailTicket/components/InventoryTransferStep/styles";
import { InventoryAdjustmentDetailItem } from "model/inventoryadjustment";
import { STATUS_INVENTORY_ADJUSTMENT } from "screens/inventory-adjustment/ListInventoryAdjustment/constants";
import {  DATE_FORMAT } from "utils/DateUtils";

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

  const createDate = inventoryAdjustmentDetail?.created_date ? moment(inventoryAdjustmentDetail.created_date).format(formatDate) : '';
  const audited_date = inventoryAdjustmentDetail?.audited_date ? moment(inventoryAdjustmentDetail.audited_date).format(formatDate) : '';
  const adjusted_date = inventoryAdjustmentDetail?.adjusted_date ? moment(inventoryAdjustmentDetail.adjusted_date).format(formatDate) : '';

  return (
    <StyledWrapper>
      <Steps
        progressDot={progressDot}
        size="small"
        current={currentStep}
        className="inventory-transfer-step"
      >
        <Steps.Step
          title="Kế hoạch"
          description={createDate}
        />
        <Steps.Step
          title="Kiểm kho"
          description={audited_date}
        />
        <Steps.Step
          title="Đã cân tồn"
          description={adjusted_date}
        />
      </Steps>
    </StyledWrapper>
  );
};

export default InventoryAdjustmentTimeLine;
