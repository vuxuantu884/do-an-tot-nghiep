import { Button, Modal, Row } from "antd";
import React, { useState, useCallback } from "react";
import { StyledComponent } from "./styled";
import AddReceptionist from "./AddReceptionist";
import AddEmployeeReception from "./AddEmployeeReception";
import { InfoCircleFilled } from "@ant-design/icons";
import AddVMSetup from "./AddVMSetup";
import { WorkShiftCellRequest } from "model/work-shift/work-shift.model";
import { SHIFT_ROLE } from "screens/work-shift/work-shift-helper";
import WorkShiftFooter from "../WorkShiftFooter";

type Props = {
  visible?: boolean;
  onCancel?: () => void;
  onOK: (request: WorkShiftCellRequest) => void;
};
const AddShiftModal: React.FC<Props> = (props: Props) => {
  const { visible, onCancel, onOK } = props;
  const [visibleAddReceptionist, setVisibleAddReceptionist] = useState(false);
  const [visibleAddEmployeeReception, setAddEmployeeReception] = useState(false);
  const [visibleAddVMSetup, setVisibleAddVMSetup] = useState(false);
  const isHomeModal = !visibleAddReceptionist && !visibleAddEmployeeReception && !visibleAddVMSetup;

  const handleClearData = () => {};

  const onBackHome = () => {
    handleClearData();
    setVisibleAddReceptionist(false);
    setAddEmployeeReception(false);
    setVisibleAddVMSetup(false);
  };

  const Content: React.FC = () => (
    <StyledComponent>
      <Row className="shift-location-selector-header">
        <p className="shift-location-selector-header-text">Chọn vị trí bạn muốn xếp ca</p>
        <p className="shift-location-selector-header-text shift-location-selector-header-text-border">
          <InfoCircleFilled className="yellow-gold pd-r-5" />
          Bạn cần phân ca cho các vị trí khác trước khi phân ca cho chuyên gia tư vấn.
        </p>
      </Row>
      <Row className="shift-location-selector">
        <div className="shift-location-selector-row shift-location-selector-bottom">
          <Button
            type="primary"
            className="button-deep-purple"
            onClick={() =>
              onOK({
                role: SHIFT_ROLE.MANAGER.key,
              })
            }
          >
            {SHIFT_ROLE.MANAGER.value}
          </Button>
          <Button
            type="primary"
            className="button-deep-purple"
            onClick={() => onOK({ role: SHIFT_ROLE.CONSULTANT.key })}
          >
            {SHIFT_ROLE.CONSULTANT.value}
          </Button>
          <Button
            type="primary"
            className="button-deep-purple"
            onClick={() => onOK({ role: SHIFT_ROLE.CASHIER.key })}
          >
            {SHIFT_ROLE.CASHIER.value}
          </Button>
        </div>
        <div className="shift-location-selector-row">
          <Button
            type="primary"
            className="button-deep-purple"
            onClick={() => setVisibleAddReceptionist(true)}
          >
            Nhân viên kho
          </Button>
          <Button
            type="primary"
            className="button-deep-purple"
            onClick={() => setAddEmployeeReception(true)}
          >
            Nhân viên tiếp đón
          </Button>
          <Button
            type="primary"
            className="button-deep-purple"
            onClick={() => setVisibleAddVMSetup(true)}
          >
            Setup cửa hàng
          </Button>
        </div>
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
      footer={!isHomeModal ? <WorkShiftFooter onBackHome={onBackHome} /> : null}
      width={700}
    >
      {isHomeModal && <Content />}
      <AddReceptionist visible={visibleAddReceptionist} onCancel={onBackHome} />
      <AddEmployeeReception visible={visibleAddEmployeeReception} onCancel={onBackHome} />
      <AddVMSetup visible={visibleAddVMSetup} onCancel={onBackHome} />
    </Modal>
  );
};

export default AddShiftModal;
