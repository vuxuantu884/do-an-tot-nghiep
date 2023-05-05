import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Row } from "antd";
import React from "react";
import { StyledComponent } from "./styled";
type Props = {
  onBackHome?: () => void;
};
const WorkShiftFooter: React.FC<Props> = (props: Props) => {
  const { onBackHome: onCancel } = props;
  return (
    <StyledComponent>
      <Row className="sort-receptionist-footer">
        <Button
          onClick={onCancel}
          icon={<ArrowLeftOutlined />}
          type="text"
          title="Trở lại"
        ></Button>
        <Button type="primary" className="btn-confirm">
          Lưu
        </Button>
      </Row>
    </StyledComponent>
  );
};

export default WorkShiftFooter;
