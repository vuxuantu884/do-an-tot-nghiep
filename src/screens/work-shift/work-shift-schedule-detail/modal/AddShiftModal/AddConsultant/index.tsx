import { Button, Row } from "antd";
import React from "react";
import { StyledComponent } from "./styled";

type Props = {
  visible?: boolean;
};
const AddConsultantModal: React.FC<Props> = (props: Props) => {
  const { visible } = props;
  if (!visible) return <></>;
  return (
    <StyledComponent>
      <Row>
        <p className="text-sort-employee">Chọn phương án sắp xếp nhân viên</p>
      </Row>
      <Row className="sort-employee">
        <div className="sort-employee-row sort-employee-bottom">
          <Button block type="primary">
            Phương án 1: Ưu tiên số giờ làm việc cho các nhân sự hạng cao hơn
          </Button>
          <Button block type="primary">
            Phương án 2: Ghép đôi các nhân sự giỏi/khá-chưa đạt
          </Button>
          <Button block type="primary">
            Phương án 3: Chia đều số giờ làm việc có điều kiện cho các nhân viên
          </Button>
        </div>
      </Row>
    </StyledComponent>
  );
};
export default AddConsultantModal;
