import { Button, Checkbox, Row } from "antd";
import { StyledComponent } from "./styled";
import { InfoCircleFilled } from "@ant-design/icons";
import { WeeksShiftModel } from "screens/work-shift/work-shift-helper";
import { useCallback } from "react";
import _ from "lodash";
const SHIFTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const WEEKS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
type Props = {
  weeksShift: WeeksShiftModel[];
  selectedWeeksShift?: (w: WeeksShiftModel[]) => void;
};

const WorkShiftSelect: React.FC<Props> = (props: Props) => {
  const { weeksShift, selectedWeeksShift } = props;
  console.log(weeksShift);
  const handleSelectedAllWeeks = useCallback(
    (_v: boolean) => {
      console.log(_v);
      if (_v) {
        const _weeksShift = WEEKS.map((w) => ({
          week: w,
          shift: SHIFTS,
        }));

        selectedWeeksShift && selectedWeeksShift(_weeksShift);
      } else {
        selectedWeeksShift && selectedWeeksShift([]);
      }
    },
    [selectedWeeksShift],
  );

  const handleSelectedWeeks = useCallback(
    (week: string) => {
      let _weeksShift = _.cloneDeep(weeksShift);
      const weekIndex = _weeksShift.findIndex((w) => w.week === week);
      //trường hợp không gửi shift
      if (weekIndex !== -1) {
        _weeksShift.splice(weekIndex, 1); // xóa luôn week nếu đã tồn tại
      } else {
        _weeksShift.push({
          week: week,
          shift: SHIFTS,
        });
        //thêm toàn bộ shift vào week
      }

      selectedWeeksShift && selectedWeeksShift(_weeksShift);
    },
    [selectedWeeksShift, weeksShift],
  );

  const handleSelectedWeeksShift = useCallback(
    (week: string, shift: number) => {
      let _weeksShift = _.cloneDeep(weeksShift);

      if (_weeksShift.some((w) => w.week === week)) {
        //kiểm tra đã có week chưa
        const weekIndex = _weeksShift.findIndex((w) => w.week === week);
        const _shift = _weeksShift[weekIndex].shift;
        if (_shift.includes(shift)) {
          // ca đã được chọn rồi thì bỏ tích
          const shiftIndex = _shift.findIndex((s) => s === shift);
          _shift.splice(shiftIndex, 1);
          if (_shift.length === 0) {
            _weeksShift.splice(weekIndex, 1); //nếu tất cả ca bị bỏ thì xóa luôn week đi kèm
          }
        } else {
          _shift.push(shift); //ca chưa được chọn thì tích xanh
        }
      } else {
        //cả shift và week không tồn tại thì push hết không cần check
        _weeksShift.push({
          week: week,
          shift: [shift],
        });
      }

      selectedWeeksShift && selectedWeeksShift(_weeksShift);
    },
    [selectedWeeksShift, weeksShift],
  );

  return (
    <StyledComponent>
      <Row className="work-shift-select">
        <div className="work-shift-select-Card-header">
          <div className="work-shift-select-Card-header-left yellow-gold">
            <InfoCircleFilled className="yellow-gold" /> Nhấn vào thứ và ca để chọn - bỏ chọn thời
            gian làm việc
          </div>
          <div className="work-shift-select-Card-header-right">
            <Checkbox
              onChange={(e) => {
                handleSelectedAllWeeks(e.target.checked);
              }}
            >
              Chọn tất cả
            </Checkbox>
          </div>
        </div>
        {WEEKS.map((week, index) => {
          const shiftActive = weeksShift?.find((p) => p.week === week)?.shift || [];
          return (
            <div className="work-shift-select-Card" key={index}>
              <div className="work-shift-select-Card-left">
                <Button
                  block
                  className={shiftActive.length !== 0 ? "button-gray" : undefined}
                  onClick={() => handleSelectedWeeks(week)}
                >
                  {week}
                </Button>
              </div>
              <div className="work-shift-select-Card-right">
                {SHIFTS.map((shift, index) => (
                  <Button
                    size="small"
                    key={index}
                    className={shiftActive.includes(shift) ? "button-gray" : "dark-grey"}
                    onClick={() => handleSelectedWeeksShift(week, shift)}
                  >
                    Ca {shift}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </Row>
    </StyledComponent>
  );
};
export default WorkShiftSelect;
