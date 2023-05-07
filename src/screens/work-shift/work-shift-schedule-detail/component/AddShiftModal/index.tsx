import { Button, Modal, Row, Tooltip, Typography } from "antd";
import React, { useState, useCallback } from "react";
import { StyledComponent } from "./styled";
import AddReceptionist from "./AddReceptionist";
import AddEmployeeReception from "./AddEmployeeReception";
import { InfoCircleFilled } from "@ant-design/icons";
import AddVMSetup from "./AddVMSetup";
import { WorkShiftCellRequest } from "model/work-shift/work-shift.model";
import { SHIFT_ROLE } from "screens/work-shift/work-shift-helper";
import WorkShiftFooter from "../WorkShiftFooter";
const { Text, Link } = Typography;
type Props = {
  visible?: boolean;
  onCancel?: () => void;
  onOK: (request: WorkShiftCellRequest) => void;
};
const AddShiftModal: React.FC<Props> = (props: Props) => {
  const { visible, onCancel, onOK } = props;
  const [keyModal, setKeyModal] = useState<string>("");

  const handleClearData = () => {};

  const onBackHome = () => {
    handleClearData();
    setKeyModal("");
  };

  const Content: React.FC = () => (
    <StyledComponent>
      <Row className="shift-location-selector-header">
        <p className="shift-location-selector-header-text shift-location-selector-header-text-border">
          Hệ thống sẽ cài đặt phân ca cho các vị trí vào ngày hôm sau.
        </p>
        <p className="shift-location-selector-header-text shift-location-selector-header-text-border">
          Các vị trí setup cửa hàng, nhân viên kho, nhân viên tiếp đón cần cài đặt lần lượt.
        </p>
      </Row>
      <Row className="shift-location-selector">
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Text className="dark-blue">
              {`${SHIFT_ROLE.MANAGER.value} `}
              <Tooltip title="Phân ca trong các giờ cao điểm trong ngày">
                <InfoCircleFilled className="yellow-gold" />
              </Tooltip>
            </Text>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Button
              size="small"
              className="dark-blue"
              onClick={() =>
                onOK({
                  role: SHIFT_ROLE.MANAGER.key,
                })
              }
            >
              Thêm ca làm
            </Button>
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Text className="dark-blue">
              {`${SHIFT_ROLE.CONSULTANT.value} `}
              <Tooltip title="Phân ca bắt cặp nhân sự giỏi/ khá với chưa đạt và số giờ giỏi/khá nhỉnh hơn so với chưa đạt">
                <InfoCircleFilled className="yellow-gold" />
              </Tooltip>
            </Text>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Button
              size="small"
              className="dark-blue"
              onClick={() => onOK({ role: SHIFT_ROLE.CONSULTANT.key })}
            >
              Thêm ca làm
            </Button>
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Text className="dark-blue">
              {`${SHIFT_ROLE.CASHIER.value} `}
              <Tooltip title="Phân ca trong các giờ cao điểm trong ngày">
                <InfoCircleFilled className="yellow-gold" />
              </Tooltip>
            </Text>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Button
              size="small"
              className="dark-blue"
              onClick={() => onOK({ role: SHIFT_ROLE.CASHIER.key })}
            >
              Thêm ca làm
            </Button>
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Text className="dark-blue"> VM instore</Text>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Button
              size="small"
              className="dark-blue"
              onClick={() => setKeyModal(SHIFT_ROLE.VM.key)}
            >
              Cài đặt ca làm việc
            </Button>
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Text className="dark-blue">Nhân viên kho</Text>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Button
              size="small"
              className="dark-blue"
              onClick={() => setKeyModal(SHIFT_ROLE.WAREHOUSE.key)}
            >
              Cài đặt ca làm việc
            </Button>
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Text className="dark-blue"> Nhân viên tiếp đón</Text>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Button
              size="small"
              className="dark-blue"
              onClick={() => setKeyModal(SHIFT_ROLE.RECEPTION.key)}
            >
              Cài đặt ca làm việc
            </Button>
          </div>
        </Row>
      </Row>
    </StyledComponent>
  );
  return (
    <Modal
      title="Thêm ca làm cho các vị trí"
      visible={visible}
      onCancel={() => {
        onCancel && onCancel();
        onBackHome();
      }}
      footer={keyModal ? <WorkShiftFooter onBackHome={onBackHome} /> : null}
      width={700}
    >
      {!keyModal && <Content />}
      <AddReceptionist visible={keyModal === SHIFT_ROLE.WAREHOUSE.key} onCancel={onBackHome} />
      <AddEmployeeReception visible={keyModal === SHIFT_ROLE.RECEPTION.key} onCancel={onBackHome} />
      <AddVMSetup visible={keyModal === SHIFT_ROLE.VM.key} onCancel={onBackHome} />
    </Modal>
  );
};

export default AddShiftModal;
