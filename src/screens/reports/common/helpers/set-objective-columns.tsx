import { CheckOutlined, CloseOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Popover } from "antd";
import { ColumnGroupType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import NumberInput from "component/custom/number-input.custom";
import { KeyDriverDataSourceType } from "model/report";
import moment from "moment";
import { Link } from "react-router-dom";
import { formatCurrency, parseLocaleNumber, replaceFormatString } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { kdOffNeedLowValue, kdOnNeedLowValue } from "../constant/kd-need-low-value";
import {
  showDashOnDailyActualKD,
  showDashOnMonthlyForecastedKD,
  showDashOnMonthlyForecastedProgressKD,
  showDashOnMonthlyTargetKD,
} from "../constant/offline-report-kd";
import { showDashOnDailyTargetKD } from "../constant/online-report-kd";
import { KDReportDirection } from "../enums/kd-report-direction";
import { isPastDate } from "./handle-time-on-kd";
import { saveTargetHorizontalReport } from "./save-target-horizontal-report";
import { saveMonthTargetKeyDriver } from "./save-target-kd";

type VerifyCellProps = {
  row: KeyDriverDataSourceType;
  children: any;
  value: number;
  type?: "display" | "edit";
};

export interface KDTableHeader {
  departmentKey: string;
  department: string;
  columnIndex: number;
  departmentDrillingLevel: number;
  className: string;
  link: string;
  direction?: KDReportDirection;
  viewDay?: string; // DATE_FORMAT.DDMMYYY
  viewDate?: string; // DATE_FORMAT.YYYYMMDD
}

const setNativeValue = (element: any, value: any) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter?.call(element, value);
  } else {
    valueSetter?.call(element, value);
  }
};

const inputTargetDefaultProps: any = {
  className: "input-number",
  format: (value?: string) => formatCurrency(value || 0),
  replace: (a: string) => replaceFormatString(a),
  min: 0,
  // onFocus: handleFocusInput,
  keyboard: false,
  // isChangeAfterBlur: true,
};

function VerifyCell(props: VerifyCellProps) {
  const { row, children, value, type = "display" } = props;
  if (["OF.HS.S1.01", "OF.SP.S1.01"].includes(row.key) || row.key?.endsWith(".L")) {
    return <></>;
  } else if (!value && typeof value !== "number" && type === "display") {
    return <div>-</div>;
  } else {
    return <div className="overflow-wrap-normal">{children}</div>;
  }
}

const getMonthlyTargetColumn = (kdTableHeader: KDTableHeader, dispatch: any) => {
  const { departmentKey, columnIndex, departmentDrillingLevel, direction, viewDay } = kdTableHeader;
  return {
    title: () => {
      return (
        <Popover
          content={
            <div style={{ width: 200 }}>Mục tiêu tháng của chỉ số, người dùng nhập hàng tháng</div>
          }
          title="Mục tiêu tháng"
          placement="bottom"
        >
          Mục tiêu tháng
        </Popover>
      );
    },
    width: 110,
    align: "right",
    dataIndex: `${departmentKey}_monthly_target`,
    className: "input-cell",
    render: (text: any, record: KeyDriverDataSourceType, index: number) => {
      // const inputId = getInputTargetId(index, columnIndex * 2, PREFIX_CELL_TABLE);
      const inputId = `${record[`${departmentKey}_key`] || record.key}-${record.title}-${index}-${
        columnIndex * 2 + 1
      }-month-target`;
      let newValue = text ? Number(text) : 0;
      let clickCancel = false;
      return showDashOnMonthlyTargetKD.includes(record[`${departmentKey}_key`] || record.key) ? (
        <span>- </span>
      ) : (
        <VerifyCell row={record} value={text} type="edit">
          <div style={{ position: "relative" }}>
            <NumberInput
              id={inputId}
              value={newValue}
              onPressEnter={(e: any) => {
                const input: any = document.getElementById(inputId);
                input.blur();
              }}
              onFocus={(e) => {
                document.getElementById(`${inputId}-action`)?.removeAttribute("hidden");
              }}
              onBlur={(e) => {
                setTimeout(() => {
                  const input: any = document.getElementById(inputId);
                  const value = input.value
                    ? parseLocaleNumber(input.value)
                    : parseLocaleNumber(newValue);
                  console.log("value, newValue", value, newValue);

                  if (!clickCancel && value !== newValue) {
                    newValue = value;
                    if (direction === KDReportDirection.Horizontal) {
                      saveTargetHorizontalReport(
                        { total: value, currentValue: parseLocaleNumber(newValue) },
                        record,
                        inputId,
                        dispatch,
                        departmentKey,
                      );
                    } else {
                      saveMonthTargetKeyDriver(
                        { total: value },
                        record,
                        departmentDrillingLevel,
                        departmentKey,
                        inputId,
                        dispatch,
                        parseLocaleNumber(newValue),
                        `day${viewDay?.toString().padStart(2, "0")}`,
                      );
                    }
                  } else {
                    clickCancel = false;
                  }
                  document.getElementById(`${inputId}-action`)?.setAttribute("hidden", "false");
                }, 100);
              }}
              onKeyDown={(e: any) => {
                // if (e.shiftKey) {
                //   handleMoveFocusInput(
                //     index,
                //     columnIndex * 2 + 1,
                //     PREFIX_CELL_TABLE,
                //     e.key,
                //   );
                // }
                if (e.key === "Escape") {
                  const event = new Event("input", { bubbles: true });
                  const input: any = document.getElementById(inputId);
                  setNativeValue(input, newValue);
                  input.dispatchEvent(event);
                  input.blur();
                }
              }}
              suffix={(record[`${departmentKey}_unit`] || record.unit) === "percent" ? "%" : null}
              {...inputTargetDefaultProps}
            />
            <div
              id={`${inputId}-action`}
              hidden
              style={{
                display: "flex",
                justifyContent: "flex-end",
                position: "absolute",
                zIndex: 1,
                paddingTop: "2px",
                right: 0,
              }}
            >
              <Button
                size="small"
                icon={<CloseOutlined />}
                className="btn-cancel-input"
                onClick={(e) => {
                  clickCancel = true;
                  const event = new Event("input", { bubbles: true });
                  const input: any = document.getElementById(inputId);
                  setNativeValue(input, newValue);
                  input.dispatchEvent(event);
                  input.blur();
                }}
              />
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                className="btn-ok-input"
                onClick={(e) => {
                  const input: any = document.getElementById(inputId);
                  input.blur();
                }}
              />
            </div>
          </div>
        </VerifyCell>
      );
    },
  };
};

const getMonthlyActualColumn = (departmentKey: string, direction: KDReportDirection) => {
  return {
    title: () => {
      return (
        <Popover
          content={
            <div style={{ width: 200 }}>
              <div>Lọc hôm nay: Dữ liệu từ đầu tháng đến hết hôm qua.</div>
              <div>Lọc ngày quá khứ: Dữ liệu từ đầu tháng đến ngày được chọn.</div>
            </div>
          }
          title="Luỹ kế"
          placement="bottom"
        >
          Luỹ kế
        </Popover>
      );
    },
    width: 45,
    align: "right",
    dataIndex: `${departmentKey}_monthly_actual`,
    className: "non-input-cell",
    render: (text: any, record: KeyDriverDataSourceType) => {
      return (
        <div className={record[`${departmentKey}_monthly_actual_color`]}>
          <VerifyCell row={record} value={text}>
            {formatCurrency(text)}
            {(record[`${departmentKey}_unit`] || record.unit) === "percent" ? "%" : ""}
          </VerifyCell>
        </div>
      );
    },
    sorter: direction === "h" ? true : false,
  };
};

const getMonthlyProgressColumn = (departmentKey: string, direction: KDReportDirection) => {
  return {
    title: () => {
      return (
        <Popover
          content={<div style={{ width: 200 }}>= Luỹ kế/Mục tiêu tháng</div>}
          title="Tỷ lệ"
          placement="bottom"
        >
          Tỷ lệ
        </Popover>
      );
    },
    width: 40,
    align: "right",
    dataIndex: `${departmentKey}_monthly_progress`,
    className: "non-input-cell",
    render: (text: any, record: KeyDriverDataSourceType) => {
      return (
        <div className={record[`${departmentKey}_monthly_progress_color`]}>
          <VerifyCell row={record} value={text}>
            {`${text}%`}
          </VerifyCell>
        </div>
      );
    },
    sorter: direction === KDReportDirection.Horizontal ? true : false,
  };
};

const getMonthlyForecastedColumn = (departmentKey: string) => {
  return {
    title: () => {
      return (
        <Popover
          content={
            <div style={{ width: 200 }}>
              <div>Lọc hôm nay: =Lũy kế/(Ngày được chọn - 1) * Số ngày trong tháng.</div>
              <div>Lọc ngày quá khứ: =Lũy kế/Ngày được chọn * Số ngày trong tháng.</div>
            </div>
          }
          title="Dự kiến đạt"
          placement="bottom"
        >
          Dự kiến đạt
        </Popover>
      );
    },
    width: 80,
    align: "right",
    dataIndex: `${departmentKey}_monthly_forecasted`,
    className: "non-input-cell",
    render: (text: any, record: KeyDriverDataSourceType, index: number) => {
      return showDashOnMonthlyForecastedKD.includes(
        record[`${departmentKey}_key`] || record.key,
      ) ? (
        <span>-</span>
      ) : (
        <div
          className={
            text
              ? (
                  [...kdOffNeedLowValue, ...kdOnNeedLowValue].includes(
                    record[`${departmentKey}_key`] || record.key,
                  )
                    ? Number(text) - record[`${departmentKey}_monthly_target`] <= 0
                    : Number(text) - record[`${departmentKey}_monthly_target`] >= 0
                )
                ? "background-green"
                : "background-red"
              : ""
          }
        >
          <VerifyCell row={record} value={text}>
            {formatCurrency(text)}
            {(record[`${departmentKey}_unit`] || record.unit) === "percent" ? "%" : ""}
          </VerifyCell>
        </div>
      );
    },
  };
};

const getMonthlyForecastedProgressColumn = (departmentKey: string) => {
  return {
    title: () => {
      return (
        <Popover
          content={<div style={{ width: 200 }}>= Dự kiến đạt/Mục tiêu tháng</div>}
          title="Tỷ lệ"
          placement="bottom"
        >
          Tỷ lệ
        </Popover>
      );
    },
    width: 40,
    align: "right",
    dataIndex: `${departmentKey}_monthly_forecasted_progress`,
    className: "non-input-cell",
    render: (text: any, record: KeyDriverDataSourceType) => {
      return showDashOnMonthlyForecastedProgressKD.includes(
        record[`${departmentKey}_key`] || record.key,
      ) ? (
        <span>-</span>
      ) : (
        <div
          className={
            text
              ? (
                  [...kdOffNeedLowValue, ...kdOnNeedLowValue].includes(
                    record[`${departmentKey}_key`] || record.key,
                  )
                    ? text <= 100
                    : text >= 100
                )
                ? "background-green"
                : "background-red"
              : ""
          }
        >
          <VerifyCell row={record} value={text}>
            {text ? `${text}%` : "-"}
          </VerifyCell>
        </div>
      );
    },
  };
};

const getDailyTargetColumn = (kdTableHeader: KDTableHeader, dispatch: any) => {
  const { departmentKey, columnIndex, departmentDrillingLevel, direction, viewDate } =
    kdTableHeader;
  return {
    title: () => {
      return (
        <Popover
          content={
            <div style={{ width: 200 }}>
              <div>= (Mục tiêu tháng - Lũy kế) / [Số ngày trong tháng - (Ngày hiện tại - 1)].</div>
              <div>Người dùng có thể sửa mục tiêu ngày.</div>
              <div>{`Xoá mục tiêu ngày đã nhập -> Unicorn sẽ tự tính lại mục tiêu ngày.`}</div>
            </div>
          }
          title="Mục tiêu ngày"
          placement="bottom"
        >
          Mục tiêu ngày
        </Popover>
      );
    },
    width: 100,
    align: "right",
    dataIndex: `${departmentKey}_daily_target`,
    className: "input-cell",
    render: (text: any, record: KeyDriverDataSourceType, index: number) => {
      // const inputId = getInputTargetId(index, columnIndex * 2 + 1, PREFIX_CELL_TABLE);
      const inputId = `${record[`${departmentKey}_key`] || record.key}-${record.title}-${index}-${
        columnIndex * 2 + 1
      }-day-target`;
      let newValue = text ? Number(text) : 0;
      let clickCancel = false;
      return showDashOnDailyTargetKD.includes(record[`${departmentKey}_key`] || record.key) ? (
        <span>- </span>
      ) : (
        <VerifyCell row={record} value={text} type="edit">
          <div style={{ position: "relative" }}>
            <NumberInput
              id={inputId}
              value={newValue}
              onPressEnter={(e: any) => {
                const input: any = document.getElementById(inputId);
                input.blur();
              }}
              disabled={isPastDate(viewDate)}
              onFocus={(e) => {
                document.getElementById(`${inputId}-action`)?.removeAttribute("hidden");
              }}
              onBlur={(e) => {
                setTimeout(() => {
                  const input: any = document.getElementById(inputId);
                  const value = input.value
                    ? parseLocaleNumber(input.value)
                    : parseLocaleNumber(newValue);
                  console.log("value, newValue", value, newValue);

                  if (!clickCancel && value !== newValue) {
                    newValue = value;
                    let targetDay = viewDate
                      ? moment(viewDate as string, DATE_FORMAT.YYYYMMDD).date()
                      : 0;
                    const day =
                      targetDay && targetDay > 0 && targetDay <= 31 ? targetDay : moment().date();
                    if (direction === KDReportDirection.Horizontal) {
                      saveTargetHorizontalReport(
                        {
                          [`day${day.toString().padStart(2, "0")}`]: value,
                          currentValue: parseLocaleNumber(newValue),
                        },
                        record,
                        inputId,
                        dispatch,
                        departmentKey,
                      );
                    } else {
                      saveMonthTargetKeyDriver(
                        { [`day${day.toString().padStart(2, "0")}`]: value },
                        record,
                        departmentDrillingLevel,
                        departmentKey,
                        inputId,
                        dispatch,
                        parseLocaleNumber(newValue),
                        `day${day.toString().padStart(2, "0")}`,
                      );
                    }
                  } else {
                    clickCancel = false;
                  }
                  document.getElementById(`${inputId}-action`)?.setAttribute("hidden", "false");
                }, 100);
              }}
              onKeyDown={(e: any) => {
                // if (e.shiftKey) {
                //   handleMoveFocusInput(
                //     index,
                //     columnIndex * 2 + 1,
                //     PREFIX_CELL_TABLE,
                //     e.key,
                //   );
                // }
                if (e.key === "Escape") {
                  const event = new Event("input", { bubbles: true });
                  const input: any = document.getElementById(inputId);
                  setNativeValue(input, newValue);
                  input.dispatchEvent(event);
                  input.blur();
                }
              }}
              suffix={(record[`${departmentKey}_unit`] || record.unit) === "percent" ? "%" : null}
              {...inputTargetDefaultProps}
            />
            <div
              id={`${inputId}-action`}
              hidden
              style={{
                display: "flex",
                justifyContent: "flex-end",
                position: "absolute",
                zIndex: 1,
                paddingTop: "2px",
                right: 0,
              }}
            >
              <Button
                size="small"
                icon={<CloseOutlined />}
                className="btn-cancel-input"
                onClick={(e) => {
                  clickCancel = true;
                  const event = new Event("input", { bubbles: true });
                  const input: any = document.getElementById(inputId);
                  setNativeValue(input, newValue);
                  input.dispatchEvent(event);
                  input.blur();
                }}
              />
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                className="btn-ok-input"
                onClick={(e) => {
                  const input: any = document.getElementById(inputId);
                  input.blur();
                }}
              />
            </div>
          </div>
        </VerifyCell>
      );
    },
  };
};

const getDailyActualColumn = (departmentKey: string, direction: KDReportDirection) => {
  return {
    title: () => {
      return (
        <Popover
          content={<div style={{ width: 200 }}>Dữ liệu ngày hôm nay</div>}
          title="Thực đạt"
          placement="bottom"
        >
          Thực đạt
        </Popover>
      );
    },
    width: 60,
    align: "right",
    dataIndex: `${departmentKey}_daily_actual`,
    className: "non-input-cell",
    render: (text: any, record: KeyDriverDataSourceType, index: number) => {
      return showDashOnDailyActualKD.includes(record[`${departmentKey}_key`] || record.key) ? (
        <span>-</span>
      ) : (
        <div className={record[`${departmentKey}_daily_actual_color`]}>
          <VerifyCell row={record} value={text}>
            {formatCurrency(text)}{" "}
            {(record[`${departmentKey}_unit`] || record.unit) === "percent" ? "%" : ""}
          </VerifyCell>
        </div>
      );
    },
    sorter: direction === KDReportDirection.Horizontal ? true : false,
  };
};

const getDailyProgressColumn = (departmentKey: string) => {
  return {
    title: () => {
      return (
        <Popover
          content={<div style={{ width: 200 }}>= Thực đạt/Mục tiêu ngày</div>}
          title="Tỷ lệ"
          placement="bottom"
        >
          Tỷ lệ
        </Popover>
      );
    },
    width: 40,
    align: "right",
    dataIndex: `${departmentKey}_daily_progress`,
    className: "non-input-cell",
    render: (text: any, record: KeyDriverDataSourceType) => {
      return showDashOnDailyTargetKD.includes(record[`${departmentKey}_key`] || record.key) ? (
        <span>- </span>
      ) : (
        <VerifyCell row={record} value={text}>
          {`${text}%`}
        </VerifyCell>
      );
    },
  };
};

export const setObjectiveColumns = (
  kdTableHeader: KDTableHeader,
  queryString: any,
  history: any,
  dispatch: any,
): ColumnGroupType<any> | ColumnType<any> => {
  const queryParams = queryString.parse(history.location.search);
  const { direction, date: viewDate } = queryParams;
  const day = viewDate
    ? moment(viewDate).format(DATE_FORMAT.DDMMYYY)
    : moment().format(DATE_FORMAT.DDMMYYY);
  const { departmentKey, department, className, link } = kdTableHeader;

  const monthlyTargetColumn: any = getMonthlyTargetColumn(
    { ...kdTableHeader, direction, viewDay: day },
    dispatch,
  );
  const monthlyActualColumn: any = getMonthlyActualColumn(departmentKey, direction);
  const monthlyProgressColumn: any = getMonthlyProgressColumn(departmentKey, direction);
  const monthlyForecastedColumn: any = getMonthlyForecastedColumn(departmentKey);
  const monthlyForecastedProgressColumn: any = getMonthlyForecastedProgressColumn(departmentKey);
  const dailyTargetColumn: any = getDailyTargetColumn(
    { ...kdTableHeader, direction, viewDate },
    dispatch,
  );
  const dailyActualColumn: any = getDailyActualColumn(departmentKey, direction);
  const dailyProgressColumn: any = getDailyProgressColumn(departmentKey);

  return {
    title: link ? (
      <Link to={link}>
        <span>{department}</span>{" "}
        {direction === KDReportDirection.Horizontal ? <RightOutlined /> : ""}
      </Link>
    ) : (
      department
    ),
    className: classnames("department-name", className),
    onHeaderCell: (data: any) => {
      return {
        onClick: () => {
          link && history.push({ search: link });
        },
      };
    },

    children: [
      monthlyTargetColumn,
      monthlyActualColumn,
      monthlyProgressColumn,
      monthlyForecastedColumn,
      monthlyForecastedProgressColumn,
      dailyTargetColumn,
      dailyActualColumn,
      dailyProgressColumn,
    ],
  };
};
