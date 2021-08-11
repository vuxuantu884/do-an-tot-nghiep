import { DatePicker, Row, Col, Button } from "antd";
import moment, { Moment } from "moment";
import { CSSProperties, Fragment, ReactNode, useCallback } from "react";
import { DATE_FORMAT } from "utils/DateUtils";
import { SettingOutlined } from "@ant-design/icons";
import _ from "lodash";

const { RangePicker } = DatePicker;

type CustomRangepickerProps = {
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

const StyledButton = ({ children, className, onClick }: BtnProps) => {
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
  let from = moment().subtract(distance, unit).startOf(unit),
    to = moment().subtract(distance, unit).endOf(unit);
  return [from.utc().format(), to.utc().format()];
};

const CustomRangepicker: React.FC<CustomRangepickerProps> = (
  props: CustomRangepickerProps
) => {
  const { value, onChange, style } = props;
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
        onChange={(dates, dateStrings) => {
          let from = null,
            to = null;
          if (dates && dates.length > 0) {
            from = dates[0] ? dates[0].startOf("day").utc().format() : null;
            to = dates[1] ? dates[1].endOf("day").utc().format() : null;
          }
          onChange && onChange([from, to]);
        }}
        format={DATE_FORMAT.DDMMYYY}
      />
    </Fragment>
  );
};

export default CustomRangepicker;
