import { Steps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { StyledWrapper } from "./styles";
import { InventoryTransferDetailItem } from "model/inventory/transfer";
import { STATUS_INVENTORY_TRANSFER } from "screens/inventory/ListTicket/constants";

type StepStatusProps = {
  status?: string | null | undefined;
  inventoryTransferDetail?: InventoryTransferDetailItem | null;
};

const InventoryStep: React.FC<StepStatusProps> = (props: StepStatusProps) => {
  const { inventoryTransferDetail } = props;
  const formatDate = "DD/MM/YY - HH:mm";
  const [currentStep, setCurrentStep] = useState(0);
  const point = useCallback(() => {
    switch (inventoryTransferDetail?.status) {
      case STATUS_INVENTORY_TRANSFER.CONFIRM.status:
        setCurrentStep(1);
        break;
      case STATUS_INVENTORY_TRANSFER.TRANSFERRING.status:
        setCurrentStep(2);
        break;
      case STATUS_INVENTORY_TRANSFER.PENDING.status:
        setCurrentStep(3);
        break;
      case STATUS_INVENTORY_TRANSFER.RECEIVED.status:
        setCurrentStep(4);
        break;
      default:
        return 0;
    }
  }, [inventoryTransferDetail?.status]);

  useEffect(() => {
    point();
  }, [point, props.status]);

  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <StyledWrapper>
      <Steps
        progressDot={progressDot}
        size="small"
        current={currentStep}
        className="inventory-transfer-step"
      >
        <Steps.Step
          title="Xin Hàng"
          description={moment(props.inventoryTransferDetail?.created_date).format(formatDate)}
        />
        <Steps.Step
          title="Chờ chuyển"
          description={moment(props.inventoryTransferDetail?.created_date).format(formatDate)}
        />
        <Steps.Step
          title="Đang chuyển"
          description={
            ""
          }
          className={
            ""
          }
        />
        <Steps.Step
          title="Chờ xử lý"
          
          description={
            ""
          }
          className={
            ""
          }
        />
        <Steps.Step
          title={!(props.status === "cancelled") ? "Đã nhập" : "Huỷ phiếu"}
          
          description={
            ""
          }
          className={
            ""
          }
        />
      </Steps>
    </StyledWrapper>
  );
};

export default InventoryStep;
