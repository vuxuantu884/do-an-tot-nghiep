import { Button, Form, FormInstance } from "antd";
import moment from "moment";
import CustomDatepicker from "./new-date-picker.custom";
import { SwapRightOutlined } from "@ant-design/icons";
import { useCallback } from "react";

type CustomDateRangePickerProps = {
  fieldNameFrom: string;
  fieldNameTo: string;
  // onChange?: (value: string | undefined) => void;
  activeButton: string;
  setActiveButton: (value: string) => void;
  format?: string;
  formRef?: React.RefObject<FormInstance<any>>;
  showTime?: boolean;
};

const CustomRangeDatePicker: React.FC<CustomDateRangePickerProps> = (
  props: CustomDateRangePickerProps,
) => {
  const {
    fieldNameFrom,
    fieldNameTo,
    format = "DD-MM-YYYY",
    activeButton,
    setActiveButton,
    formRef,
    showTime,
  } = props;

  const clickOptionDate = useCallback(
    (value) => {
      let minValue = null;
      let maxValue = null;
      switch (value) {
        case "today":
          minValue = moment().startOf("day").format(format);
          maxValue = moment().endOf("day").format(format);
          break;
        case "yesterday":
          minValue = moment().startOf("day").subtract(1, "days").format(format);
          maxValue = moment().endOf("day").subtract(1, "days").format(format);
          break;
        case "thisweek":
          minValue = moment().startOf("week").format(format);
          maxValue = moment().endOf("week").format(format);
          break;
        case "lastweek":
          minValue = moment().subtract(1, "weeks").startOf("week").format(format);
          maxValue = moment().subtract(1, "weeks").endOf("week").format(format);
          break;
        case "thismonth":
          minValue = moment().startOf("month").format(format);
          maxValue = moment().endOf("month").format(format);
          break;
        case "lastmonth":
          minValue = moment().subtract(1, "months").startOf("month").format(format);
          maxValue = moment().subtract(1, "months").endOf("month").format(format);
          break;
        default:
          break;
      }
      if (activeButton === value) {
        setActiveButton("");
        formRef?.current?.setFieldsValue({
          [fieldNameFrom]: undefined,
          [fieldNameTo]: undefined,
        });
      } else {
        setActiveButton(value);
        formRef?.current?.setFieldsValue({
          [fieldNameFrom]: moment(minValue, format).format(format),
          [fieldNameTo]: moment(maxValue, format).format(format),
        });
      }
    },
    [activeButton, fieldNameFrom, fieldNameTo, formRef, format, setActiveButton],
  );

  const onChangeDate = useCallback(() => {
    let value: any = {};
    setActiveButton("");
    value = formRef?.current?.getFieldsValue([fieldNameFrom, fieldNameTo]);
    if (
      value[fieldNameFrom] &&
      value[fieldNameTo] &&
      +moment(value[fieldNameFrom], format) > +moment(value[fieldNameTo], format)
    ) {
      formRef?.current?.setFields([
        {
          name: fieldNameFrom,
          errors: ["Khoảng thời gian chưa chính xác"],
        },
        {
          name: fieldNameTo,
          errors: [""],
        },
      ]);
    } else {
      formRef?.current?.setFields([
        {
          name: fieldNameFrom,
          errors: undefined,
        },
        {
          name: fieldNameTo,
          errors: undefined,
        },
      ]);
    }
  }, [fieldNameFrom, fieldNameTo, formRef, format, setActiveButton]);

  return (
    <div>
      <div className="date-option">
        <Button
          onClick={() => clickOptionDate("yesterday")}
          className={activeButton === "yesterday" ? "active" : "deactive"}
        >
          Hôm qua
        </Button>
        <Button
          onClick={() => clickOptionDate("today")}
          className={activeButton === "today" ? "active" : "deactive"}
        >
          Hôm nay
        </Button>
        <Button
          onClick={() => clickOptionDate("thisweek")}
          className={activeButton === "thisweek" ? "active" : "deactive"}
        >
          Tuần này
        </Button>
      </div>
      <div className="date-option">
        <Button
          onClick={() => clickOptionDate("lastweek")}
          className={activeButton === "lastweek" ? "active" : "deactive"}
        >
          Tuần trước
        </Button>
        <Button
          onClick={() => clickOptionDate("thismonth")}
          className={activeButton === "thismonth" ? "active" : "deactive"}
        >
          Tháng này
        </Button>
        <Button
          onClick={() => clickOptionDate("lastmonth")}
          className={activeButton === "lastmonth" ? "active" : "deactive"}
        >
          Tháng trước
        </Button>
      </div>
      <div className="date-range">
        <Form.Item name={fieldNameFrom} style={{ width: "45%", marginBottom: 0 }}>
          <CustomDatepicker
            format={format}
            placeholder="Từ ngày"
            style={{ width: "100%" }}
            onChange={() => onChangeDate()}
            showTime={showTime}
          />
        </Form.Item>
        <div className="swap-right-icon">
          <SwapRightOutlined />
        </div>
        <Form.Item name={fieldNameTo} style={{ width: "45%", marginBottom: 0 }}>
          <CustomDatepicker
            format={format}
            placeholder="Đến ngày"
            style={{ width: "100%" }}
            onChange={() => onChangeDate()}
            showTime={showTime}
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default CustomRangeDatePicker;
