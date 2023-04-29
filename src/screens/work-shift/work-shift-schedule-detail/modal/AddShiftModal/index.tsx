import { Button, Modal, Row } from "antd";
import React, { useState } from "react";
import { StyledComponent } from "./styled";
import AddConsultantModal from "./AddConsultant";
import AddReceptionist from "./AddReceptionist";

type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const AddShiftModal: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;
  const [visibleAddConsultant, setVisibleAddConsultant] = useState(false);
  const [visibleAddReceptionist, setVisibleAddReceptionist] = useState(false);

  const Content: React.FC = () => (
    <StyledComponent>
      <Row>
        <p className="text-shift-location-selector">Chọn vị trí bạn muốn xếp ca</p>
      </Row>
      <Row className="shift-location-selector">
        <div className="shift-location-selector-row shift-location-selector-bottom">
          <Button type="primary">Cửa hàng trưởng</Button>
          <Button type="primary" onClick={() => setVisibleAddConsultant(true)}>
            Chuyên viên tư vấn
          </Button>
          <Button type="primary">Chuyên viên thu ngân</Button>
        </div>
        <div className="shift-location-selector-row">
          <Button type="primary" onClick={() => setVisibleAddReceptionist(true)}>
            Nhân viên kho
          </Button>
          <Button type="primary">Nhân viên tiếp đón</Button>
          <Button type="primary">Setup cửa hàng</Button>
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
      {!visibleAddConsultant && !visibleAddReceptionist && <Content />}
      <AddConsultantModal visible={visibleAddConsultant} />
      <AddReceptionist visible={visibleAddReceptionist} />
    </Modal>
  );
};

export default AddShiftModal;
