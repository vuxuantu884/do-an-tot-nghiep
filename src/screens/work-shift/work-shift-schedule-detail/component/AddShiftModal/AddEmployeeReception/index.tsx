import { Button, Radio, RadioChangeEvent, Row, Space } from "antd";
import React, { useState } from "react";
import { StyledComponent } from "./styled";
import { ArrowLeftOutlined } from "@ant-design/icons";

const SHIFTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const WEEKS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
type Props = { visible?: boolean; onCancel?: () => void };
const AddEmployeeReception: React.FC<Props> = (props: Props) => {
  const { visible, onCancel } = props;

  const [shiftSelection, setShiftSelection] = useState();

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
          <Space direction="vertical">
            <Radio value={1} className="dark-charcoal ">
              Tự động phân ca vào giờ cao điểm
            </Radio>
            <Radio value={2} className="dark-charcoal ">
              Phân ca thủ công
            </Radio>
          </Space>
        </Radio.Group>
      </Row>
      <Row className="employee-reception-content">
        <div className="employee-reception-content-Card-header">
          <div className="employee-reception-content-Card-header-left" style={{ width: "86px" }}>
            Thứ
          </div>
          <div
            className="employee-reception-content-Card-header-right"
            style={{ width: "calc(100% - 86px)" }}
          >
            Ca làm việc
          </div>
        </div>
        {WEEKS.map((value, index) => (
          <div className="employee-reception-content-Card" key={index}>
            <div className="employee-reception-content-Card-left">
              <Button block className="button-gray">
                {value}
              </Button>
            </div>
            <div className="employee-reception-content-Card-right">
              {SHIFTS.map((value, index) => (
                <Button size="small" key={index} className="dark-grey">
                  Ca {value}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </Row>
      <Row className="employee-reception-footer">
        <Button
          onClick={onCancel}
          icon={<ArrowLeftOutlined />}
          type="text"
          title="Trở lại"
        ></Button>
        <Button type="primary" className="btn-confirm">
          Xác nhận
        </Button>
      </Row>
    </StyledComponent>
  );
};

export default AddEmployeeReception;
