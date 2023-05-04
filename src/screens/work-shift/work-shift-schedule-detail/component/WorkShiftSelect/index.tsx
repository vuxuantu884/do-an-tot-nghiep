import { Button, Checkbox, Row } from "antd";
import { StyledComponent } from "./styled";
import { InfoCircleFilled } from "@ant-design/icons";
const SHIFTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const WEEKS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
type Props = {};

const WorkShiftSelect: React.FC<Props> = (props: Props) => {
  return (
    <StyledComponent>
      <Row className="work-shift-select">
        <div className="work-shift-select-Card-header">
          <div className="work-shift-select-Card-header-left yellow-gold">
            <InfoCircleFilled className="yellow-gold" /> Nhấn vào thứ và ca để chọn - bỏ chọn thời
            gian làm việc
          </div>
          <div className="work-shift-select-Card-header-right">
            <Checkbox>Chọn tất cả</Checkbox>
          </div>
        </div>
        {WEEKS.map((value, index) => (
          <div className="work-shift-select-Card" key={index}>
            <div className="work-shift-select-Card-left">
              <Button block className="button-gray">
                {value}
              </Button>
            </div>
            <div className="work-shift-select-Card-right">
              {SHIFTS.map((value, index) => (
                <Button size="small" key={index} className="dark-grey">
                  Ca {value}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </Row>
    </StyledComponent>
  );
};
export default WorkShiftSelect;
