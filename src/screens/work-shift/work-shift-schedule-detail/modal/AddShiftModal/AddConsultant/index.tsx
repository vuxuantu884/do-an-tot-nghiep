import { Button, Row } from "antd";
import React from "react";
import { StyledComponent } from "./styled";
import { ArrowLeftOutlined } from "@ant-design/icons";

type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const AddConsultant: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;
  if (!visible) return <></>;
  return (
    <StyledComponent>
      <Row className="employee-header">
        <p className="employee-header-text">Chọn phương án sắp xếp nhân viên</p>
      </Row>
      <Row className="employee-content">
        <div className="employee-content-row employee-content-bottom">
          <Button block type="primary" className="button-deep-purple">
            Phương án 1: Ưu tiên số giờ làm việc cho các nhân sự hạng cao hơn
          </Button>
          <Button block type="primary" className="button-deep-purple">
            Phương án 2: Ghép đôi các nhân sự giỏi/khá-chưa đạt
          </Button>
          <Button block type="primary" className="button-deep-purple">
            Phương án 3: Chia đều số giờ làm việc có điều kiện cho các nhân viên
          </Button>
        </div>
      </Row>
      <Row className="employee-footer">
        <Button
          onClick={onCancel}
          icon={<ArrowLeftOutlined />}
          type="text"
          title="Trở lại"
        ></Button>
      </Row>
    </StyledComponent>
  );
};
export default AddConsultant;
