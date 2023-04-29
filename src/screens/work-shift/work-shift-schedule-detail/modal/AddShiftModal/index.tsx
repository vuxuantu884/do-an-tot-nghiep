import { Button, Modal, Row } from "antd";
import React, { useState } from "react";
import { StyledComponent } from "./styled";
import AddConsultant from "./AddConsultant";
import AddReceptionist from "./AddReceptionist";
import AddEmployeeReception from "./AddEmployeeReception";
import { InfoCircleFilled } from "@ant-design/icons";

type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const AddShiftModal: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;
  const [visibleAddConsultant, setVisibleAddConsultant] = useState(false);
  const [visibleAddReceptionist, setVisibleAddReceptionist] = useState(false);
  const [visibleAddEmployeeReception, setAddEmployeeReception] = useState(false);

  const onBackHome = () => {
    setVisibleAddConsultant(false);
    setVisibleAddReceptionist(false);
    setAddEmployeeReception(false);
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
          <Button type="primary" className="button-deep-purple">
            Cửa hàng trưởng
          </Button>
          <Button
            type="primary"
            className="button-deep-purple"
            onClick={() => setVisibleAddConsultant(true)}
          >
            Chuyên viên tư vấn
          </Button>
          <Button type="primary" className="button-deep-purple">
            Chuyên viên thu ngân
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
          <Button type="primary" className="button-deep-purple">
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
        setVisibleAddConsultant(false);
        setVisibleAddReceptionist(false);
      }}
      footer={null}
      width={700}
    >
      {!visibleAddConsultant && !visibleAddReceptionist && !visibleAddEmployeeReception && (
        <Content />
      )}
      <AddConsultant visible={visibleAddConsultant} onCancel={onBackHome} />
      <AddReceptionist visible={visibleAddReceptionist} onCancel={onBackHome} />
      <AddEmployeeReception visible={visibleAddEmployeeReception} onCancel={onBackHome} />
    </Modal>
  );
};

export default AddShiftModal;
