import { DatePicker, Row, Col, Button } from "antd";
import moment, { Moment } from "moment";
import { CSSProperties, Fragment, ReactNode, useMemo } from "react";
import { DATE_FORMAT, getDateFromNow } from "utils/DateUtils";
import { SettingOutlined } from "@ant-design/icons";
import _ from "lodash";

const { RangePicker } = DatePicker;

type CustomRangePickerProps = {
  value?: Array<string | null>;
  onChange?: (dates: Array<string | null> | undefined) => void;
  style?: CSSProperties;
  placeholder?: string;
  className?: string;
  disableDate?: (date: Moment) => boolean;
  showTime?: boolean;
};

type BtnProps = {
  children?: ReactNode;
  className?: string;
  onClick?: (value: any | undefined) => void;
};

export const StyledButton = ({ children, className, onClick }: BtnProps) => {
  return (
    <Button
      className={className}
      onClick={onClick}
      type="default"
      style={{ width: "100%", textAlign: "center", padding: 0 }}
    >
      {children}
    </Button>
  );
};

const getRange = (distance: number, unit: "day" | "month" | "week") => {
  let dateFrom = getDateFromNow(distance, unit),
    dateTo = getDateFromNow(distance, unit);

  let searchUnit: any = unit;
  if (searchUnit === "week") searchUnit = "isoWeek";
  let from = dateFrom.startOf(searchUnit),
    to = dateTo.endOf(searchUnit);
  return [from.startOf(unit).utc(true).format(), to.endOf(unit).utc(true).format()];
};

const CustomRangePicker: React.FC<CustomRangePickerProps> = (
  props: CustomRangePickerProps
) => {
  const { value, onChange, style } = props;
  const convertValue: [Moment, Moment] | undefined = useMemo(() => {
    if (
      _.isEqual(getRange(1, "day"), value) ||
      _.isEqual(getRange(0, "day"), value) ||
      _.isEqual(getRange(1, "week"), value) ||
      _.isEqual(getRange(0, "week"), value) ||
      _.isEqual(getRange(1, "month"), value) ||
      _.isEqual(getRange(0, "month"), value)
    ) {
      return [moment(value?.[0]).utc(), moment(value?.[1]).utc()];
    }
    if (value && value.length > 0) {
      const from = value[0],
        to = value[1];
      return [moment(from), moment(to).utc(true)];
    }
    return undefined;
  }, [value]);
  return (
    <Fragment>
      <Row gutter={[5, 5]}>
        <Col span="8">
          <StyledButton
            className={_.isEqual(getRange(1, "day"), value) ? "active" : ""}
            onClick={() => {
              let [start, end] = getRange(1, "day");
              onChange && onChange([start, end]);
            }}
          >
            Hôm qua
          </StyledButton>
        </Col>
        <Col span="8">
          <StyledButton
            className={_.isEqual(getRange(0, "day"), value) ? "active" : ""}
            onClick={() => {
              let [start, end] = getRange(0, "day");
              onChange && onChange([start, end]);
            }}
          >
            Hôm nay
          </StyledButton>
        </Col>
        <Col span="8">
          <StyledButton
            className={_.isEqual(getRange(0, "week"), value) ? "active" : ""}
            onClick={() => {
              let [start, end] = getRange(0, "week");
              onChange && onChange([start, end]);
            }}
          >
            Tuần này
          </StyledButton>
        </Col>
        <Col span="8">
          <StyledButton
            className={_.isEqual(getRange(1, "week"), value) ? "active" : ""}
            onClick={() => {
              let [start, end] = getRange(1, "week");
              onChange && onChange([start, end]);
            }}
          >
            Tuần trước
          </StyledButton>
        </Col>
        <Col span="8">
          <StyledButton
            className={_.isEqual(getRange(0, "month"), value) ? "active" : ""}
            onClick={() => {
              let [start, end] = getRange(0, "month");
              onChange && onChange([start, end]);
            }}
          >
            Tháng này
          </StyledButton>
        </Col>
        <Col span="8">
          <StyledButton
            className={_.isEqual(getRange(1, "month"), value) ? "active" : ""}
            onClick={() => {
              let [start, end] = getRange(1, "month");
              onChange && onChange([start, end]);
            }}
          >
            Tháng trước
          </StyledButton>
        </Col>
      </Row>
      <div style={{ margin: "12px 0" }}>
        <SettingOutlined style={{ margin: "0 5px 0" }} />
        Tùy chọn khoảng thời gian tạo
      </div>
      <RangePicker
        style={{ ...style, width: "100%" }}
        disabledDate={props.disableDate}
        className={props.className}
        value={convertValue}
        onChange={(dates, dateStrings) => {
          let from = null,
            to = null;
          if (dates === null) {
            onChange && onChange(undefined);
            return;
          }
          if (dates && dates.length > 0) {
            from = dates[0] ? dates[0].startOf("day").utc(true).format() : null;
            to = dates[1] ? dates[1].endOf("day").utc(true).format() : null;
          }
          onChange && onChange([from, to]);
        }}
        format={DATE_FORMAT.DDMMYYY}
      />
    </Fragment>
  );
};

export default CustomRangePicker;
