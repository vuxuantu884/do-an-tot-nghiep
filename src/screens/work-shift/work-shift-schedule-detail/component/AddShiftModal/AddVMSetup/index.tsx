import { Row } from "antd";
import React from "react";
import { StyledComponent } from "./styled";
import WorkShiftSelect from "../../WorkShiftSelect";
import WorkShiftFooter from "../../WorkShiftFooter";

type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const AddVMSetup: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;

  if (!visible) return <></>;
  return (
    <StyledComponent>
      <Row className="sort-receptionist-header">
        <p className="text-sort-receptionist">
          Chọn thời gian sắp xếp cho nhân viên setup cửa hàng (VM)
        </p>
        <p className="text-sort-receptionist text-sort-receptionist-border">
          Từ 2 nhân viên trở lên hệ thống sẽ tự động phân phối luân phiên
        </p>
      </Row>
      <WorkShiftSelect />
      <WorkShiftFooter onCancel={onCancel} />
    </StyledComponent>
  );
};

export default AddVMSetup;
