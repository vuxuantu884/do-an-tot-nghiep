import { Steps } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
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
  const { status } = props;
  const formatDate = "DD/MM/YY - HH:mm";
  const [currentStep, setCurrentStep] = useState(0);
  const point = useCallback(() => {
    switch (status) {
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
      case STATUS_INVENTORY_TRANSFER.CANCELED.status:
        setCurrentStep(4);
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
      {(status === "process") && <CheckOutlined />}
      {(status === "error") && <CloseOutlined style={{ fontSize: '16px', color: '#fff' }} />}
    </div>
  );

  const CreateDate = props.inventoryTransferDetail?.created_date ? moment(props.inventoryTransferDetail?.created_date).format(formatDate) : '';
  const TransferDate = props.inventoryTransferDetail?.transfer_date ? moment(props.inventoryTransferDetail?.transfer_date).format(formatDate) : '';
  const PendingDate = props.inventoryTransferDetail?.pending_date ? moment(props.inventoryTransferDetail?.pending_date).format(formatDate) : '';
  const ReceiveDate = props.inventoryTransferDetail?.receive_date ? moment(props.inventoryTransferDetail?.receive_date).format(formatDate) : '';
  const CanceledDate = props.inventoryTransferDetail?.cancel_date ? moment(props.inventoryTransferDetail?.cancel_date).format(formatDate) : '';
  

  return (
    <StyledWrapper>
      <Steps
        progressDot={progressDot}
        size="small"
        current={currentStep}
        className="inventory-transfer-step"
      >
        {
          props.status === "canceled" ? (
            <>
              <Steps.Step
                status="process"
                title="Xin Hàng"
              />
              <Steps.Step
                status="process"
                title="Chờ chuyển"
              />
              <Steps.Step
                status="process"
                title="Đang chuyển"
              />
              <Steps.Step
                status="process"
                title="Chờ xử lý"
              />
              <Steps.Step
                status="error"
                title="Huỷ phiếu"
                description={CanceledDate}
              />
            </>
          ) : (
            <>
              <Steps.Step
                title="Xin Hàng"
                description={CreateDate}
              />
              <Steps.Step
                title="Chờ chuyển"
                description={CreateDate}
              />
              <Steps.Step
                title="Đang chuyển"
                description={TransferDate}
              />
              <Steps.Step
                title="Chờ xử lý"
                description={PendingDate}
              />
              <Steps.Step
                title="Đã nhập"
                description={ReceiveDate}
              />
            </>
          )
        }
      </Steps>
    </StyledWrapper>
  );
};

export default InventoryStep;
