import { Row } from "antd";
import React, { useState } from "react";
import { StyledComponent } from "./styled";
import WorkShiftSelect from "../../WorkShiftSelect";
import WorkShiftFooter from "../../WorkShiftFooter";
import { WeeksShiftModel } from "screens/work-shift/work-shift-helper";

type Props = {
  visible?: boolean;
  onCancel?: () => void;
};
const AddVMSetup: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;
  const [weeksShift, setWeeksShift] = useState<WeeksShiftModel[]>([]);
  if (!visible) return <></>;
  return (
    <StyledComponent>
      <Row className="sort-receptionist-header">
        <p className="text-sort-receptionist">Chọn thời gian sắp xếp cho nhân viên VM instore</p>
        <p className="text-sort-receptionist text-sort-receptionist-border">
          Từ 2 nhân viên trở lên hệ thống sẽ tự động phân phối luân phiên
        </p>
      </Row>
      <WorkShiftSelect weeksShift={weeksShift} selectedWeeksShift={setWeeksShift} />
      {/* <WorkShiftFooter onCancel={onCancel} /> */}
    </StyledComponent>
  );
};

export default AddVMSetup;
