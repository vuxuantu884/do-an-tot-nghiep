import { Button, Modal, Row, Space, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { StyledComponent } from "./styled";
import AddConsultant from "./AddConsultant";
import AddReceptionist from "./AddReceptionist";
import AddEmployeeReception from "./AddEmployeeReception";
import { InfoCircleFilled } from "@ant-design/icons";
import AddVMSetup from "./AddVMSetup";
const { Text, Link } = Typography;
type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const AddShiftModal: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;
  const [visibleAddConsultant, setVisibleAddConsultant] = useState(false);
  const [visibleAddReceptionist, setVisibleAddReceptionist] = useState(false);
  const [visibleAddEmployeeReception, setAddEmployeeReception] = useState(false);
  const [visibleAddVMSetup, setVisibleAddVMSetup] = useState(false);

  const isHomeModal =
    !visibleAddConsultant &&
    !visibleAddReceptionist &&
    !visibleAddEmployeeReception &&
    !visibleAddVMSetup;

  const onBackHome = () => {
    setVisibleAddConsultant(false);
    setVisibleAddReceptionist(false);
    setAddEmployeeReception(false);
    setVisibleAddVMSetup(false);
  };

  const Content: React.FC = () => (
    <StyledComponent>
      <Row className="shift-location-selector-header">
        {/* <p className="shift-location-selector-header-text">Chọn vị trí bạn muốn xếp ca</p> */}
        <p className="shift-location-selector-header-text shift-location-selector-header-text-border">
          {/* <InfoCircleFilled className="yellow-gold pd-r-5" /> */}
          Hệ thống sẽ cài đặt phân ca cho các vị trí vào ngày hôm sau.
        </p>
        <p className="shift-location-selector-header-text shift-location-selector-header-text-border">
          Các vị trí setup cửa hàng, nhân viên kho, nhân viên tiếp đón cần cài đặt lần lượt.
        </p>
      </Row>
      <Row className="shift-location-selector">
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Link target="_blank">Cửa hàng trưởng</Link>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <InfoCircleFilled className="yellow-gold" />
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Link target="_blank"> Chuyên gia tư vấn</Link>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <InfoCircleFilled className="yellow-gold" />
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Link target="_blank"> Chuyên viên thu ngân</Link>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Tooltip title="Mô tả cài đặt ca làm cho vị trí">
              <InfoCircleFilled className="yellow-gold" />
            </Tooltip>
          </div>
        </Row>
        <Row className="shift-location-selector-row">
          <div className="shift-location-selector-row-item">
            <Text className="dark-blue"> Setup cửa hàng (VM)</Text>
          </div>
          <div className="shift-location-selector-row-item shift-location-selector-row-icon">
            <Button size="small" className="dark-blue" onClick={() => setVisibleAddVMSetup(true)}>
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
              onClick={() => setVisibleAddReceptionist(true)}
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
              onClick={() => setAddEmployeeReception(true)}
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
      title="Thêm ca làm"
      visible={visible}
      onCancel={() => {
        onCancel && onCancel();
        setVisibleAddConsultant(false);
        setVisibleAddReceptionist(false);
        setVisibleAddVMSetup(false);
      }}
      footer={
        isHomeModal ? (
          <Space>
            <Button>Xác nhận</Button>
          </Space>
        ) : null
      }
      width={700}
    >
      {isHomeModal && <Content />}
      <AddConsultant visible={visibleAddConsultant} onCancel={onBackHome} />
      <AddReceptionist visible={visibleAddReceptionist} onCancel={onBackHome} />
      <AddEmployeeReception visible={visibleAddEmployeeReception} onCancel={onBackHome} />
      <AddVMSetup visible={visibleAddVMSetup} onCancel={onBackHome} />
    </Modal>
  );
};

export default AddShiftModal;
