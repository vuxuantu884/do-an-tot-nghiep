import { DatePicker, Row, Col, Button } from "antd";
import moment, { Moment } from "moment";
import { CSSProperties, Fragment, ReactNode } from "react";
import { SettingOutlined } from "@ant-design/icons";
import { isUndefinedOrNull } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";

const { RangePicker } = DatePicker;

type CustomRangepickerProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  style?: CSSProperties;
  placeholder?: string;
  className?: string;
  disableDate?: (date: Moment) => boolean;
  showTime?: boolean;
};

type BtnProps = {
  children?: ReactNode;
  onClick?: (value: any | undefined) => void;
};

const StyledButton = ({ children, onClick }: BtnProps) => {
  return (
    <Button
      onClick={onClick}
      type="default"
      style={{ width: "100%", textAlign: "center", padding: 0 }}
    >
      {children}
    </Button>
  );
};

const CustomRangepicker: React.FC<CustomRangepickerProps> = (
  props: CustomRangepickerProps
) => {
  const { value, onChange, style, showTime } = props;
  return (
    <Fragment>
      <Row gutter={[5, 5]}>
        <Col span="8">
          <StyledButton>Hôm qua</StyledButton>
        </Col>
        <Col span="8">
          <StyledButton>Hôm nay</StyledButton>
        </Col>
        <Col span="8">
          <StyledButton>Tuần này</StyledButton>
        </Col>
        <Col span="8">
          <StyledButton>Tuần trước</StyledButton>
        </Col>
        <Col span="8">
          <StyledButton>Tháng này</StyledButton>
        </Col>
        <Col span="8">
          <StyledButton>Tháng trước</StyledButton>
        </Col>
      </Row>
      <div style={{ margin: "12px 0" }}>
        <SettingOutlined style={{ margin: "0 5px 0" }} />
        Tùy chọn khoảng thời gian tạo
      </div>
      <RangePicker
        style={{ ...style, width: "100%" }}
        showTime={showTime}
        //   value={!isUndefinedOrNull(value) ? moment(value) : undefined}
        onCalendarChange={(dates, dateStrings, info) => {
          // onChange && onChange(v?.utc().format());
        }}
        disabledDate={props.disableDate}
        className={props.className}
        format={DATE_FORMAT.DDMMYYY}
      />
    </Fragment>
  );
};

export default CustomRangepicker;
