import { Radio, RadioChangeEvent, Row, Space } from "antd";
import React, { useState } from "react";
import { StyledComponent } from "./styled";
import WorkShiftSelect from "../../WorkShiftSelect";
import WorkShiftFooter from "../../WorkShiftFooter";
import { EnumShiftAssigner } from "screens/work-shift/work-shift-helper";

type Props = { visible?: boolean; onCancel?: () => void };
const AddEmployeeReception: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;

  const [shiftSelection, setShiftSelection] = useState(EnumShiftAssigner.auto);

  const handleShiftSelectionChange = (e: RadioChangeEvent) => {
    setShiftSelection(e.target.value);
  };

  if (!visible) return <></>;
  return (
    <StyledComponent>
      <Row className="employee-reception-header">
        <p className="employee-reception-header-text">
          Chọn thời gian sắp xếp cho chuyên gia tiếp đón
        </p>
        <p className="employee-reception-header-text employee-reception-header-text-border">
          Từ 2 nhân viên trở lên hệ thống sẽ tự động phân phối luân phiên
        </p>
      </Row>
      <Row className="employee-reception-selected-shift">
        <Radio.Group onChange={handleShiftSelectionChange} value={shiftSelection}>
          <Space direction="horizontal" size={"large"}>
            <Radio value={EnumShiftAssigner.auto} className="dark-charcoal ">
              Tự động phân ca vào giờ cao điểm
            </Radio>
            <Radio value={EnumShiftAssigner.manual} className="dark-charcoal ">
              Phân ca thủ công
            </Radio>
          </Space>
        </Radio.Group>
      </Row>
      {shiftSelection === EnumShiftAssigner.manual && <WorkShiftSelect />}
      <WorkShiftFooter onCancel={onCancel} />
    </StyledComponent>
  );
};

export default AddEmployeeReception;
