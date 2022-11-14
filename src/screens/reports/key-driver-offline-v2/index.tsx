/* eslint-disable eqeqeq */
import { CheckOutlined, CloseOutlined, RightOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Popover, Select, Table } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import ContentContainer from "component/container/content.container";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import ModalSettingColumnData from "component/table/ModalSettingColumnData";
import { HttpStatus } from "config/http-status.config";
// import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import { KeyDriverDataSourceType, KeyDriverDimension, LocalStorageKey } from "model/report";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import { getKeyDriverOnlineApi } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, parseLocaleNumber, replaceFormatString } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { strForSearch } from "utils/StringUtils";
import { kdOffNeedLowValue } from "../common/constant/kd-need-low-value";
import {
  COLUMN_ORDER_LIST,
  DEFAULT_OFF_KD_GROUP_LV1,
} from "../common/constant/kd-report-response-key";
import { npsKD, numberOfStoreStaffKD } from "../common/constant/offline-report-kd";
import { KDReportDirection } from "../common/enums/kd-report-direction";
import { convertDataToFlatTableRotation } from "../common/helpers/convert-data-to-flat-table-rotation";
import { filterValueColumns } from "../common/helpers/filter-value-columns";
import { getBreadcrumbByLevel } from "../common/helpers/get-breadcrumb-by-level";
import { saveTargetHorizontalReport } from "../common/helpers/save-target-horizontal-report";
import { setTableHorizontalColumns } from "../common/helpers/set-table-horizontal-columns";
import { KeyDriverStyle } from "../common/kd-report/index.style";
import {
  convertDataToFlatTableKeyDriver,
  getAllDepartmentByAnalyticResult,
  // getInputTargetId,
  // handleMoveFocusInput,
  saveMonthTargetKeyDriver,
} from "./helper";
import KeyDriverOfflineProvider, {
  KeyDriverOfflineContext,
} from "./provider/key-driver-offline-provider";

const { Option } = Select;

type VerifyCellProps = {
  row: KeyDriverDataSourceType;
  children: any;
  value: number;
  type?: "display" | "edit";
};
const baseColumns: any = [
  {
    title: "CHỈ SỐ KEY",
    key: "name",
    dataIndex: "title",
    width: 220,
    fixed: "left",
    render: (text: string, record: any) => {
      return (
        <Popover
          content={<div style={{ width: 200 }}>{record.method}</div>}
          title={<div style={{ width: 200 }}>{text}</div>}
          placement="rightBottom"
          className="text-truncate-2 key-cell padding-left-5"
        >
          {text}
        </Popover>
      );
    },
  },
];

const SHOP_LEVEL = 3;
// const PREFIX_CELL_TABLE = "KEY_DRIVER_ONLINE";

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
  if (["OF.HS.S1.01", "OF.SP.S1.01"].includes(row.key)) {
    return <></>;
  } else if (!value && typeof value !== "number" && type === "display") {
    return <div>-</div>;
  } else {
    return <div className="overflow-wrap-normal">{children}</div>;
  }
}

function KeyDriverOffline() {
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date");
  const keyDriverGroupLv1 = query.get("keyDriverGroupLv1") || DEFAULT_OFF_KD_GROUP_LV1;
  const departmentLv2 = query.get("departmentLv2");
  const departmentLv3 = query.get("departmentLv3");
  const groupLevel = query.get("groupLv");

  const [finalColumns, setFinalColumns] = useState<ColumnsType<any>>([]);
  const [loadingPage, setLoadingPage] = useState<boolean | undefined>();
  const { data, setData } = useContext(KeyDriverOfflineContext);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const day = date
    ? moment(date).format(DATE_FORMAT.DDMMYYY)
    : moment().format(DATE_FORMAT.DDMMYYY);

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
  // const expandedDefault = localStorage.getItem(LocalStorageKey.KDOfflineRowkeysExpanded);
  const getColumns = localStorage.getItem(LocalStorageKey.KDOfflineColumns);
  // const [expandRowKeys, setExpandRowKeys] = useState<any[]>(
  //   expandedDefault ? JSON.parse(expandedDefault) : [],
  // );
  const [expandRowKeys, setExpandRowKeys] = useState<any[]>([]);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [columns, setColumns] = useState<any[]>(
    getColumns
      ? JSON.parse(getColumns)
      : [
          {
            title: "Mục tiêu tháng",
            name: "monthly_target",
            index: 0,
            visible: true,
          },
          {
            title: "Luỹ kế",
            name: "monthly_actual",
            index: 1,
            visible: true,
            fixed: true,
          },
          {
            title: "Tỷ lệ (Luỹ kế/Mục tiêu tháng)",
            name: "monthly_progress",
            index: 2,
            visible: true,
          },
          {
            title: "Dự kiến đạt",
            name: "monthly_forecasted",
            index: 3,
            visible: true,
          },
          {
            title: "Tỷ lệ (Dự kiến đạt/Mục tiêu tháng)",
            name: "monthly_forecasted_progress",
            index: 4,
            visible: true,
          },
          {
            title: "Mục tiêu ngày",
            name: "daily_target",
            index: 5,
            visible: true,
          },
          {
            title: "Thực đạt",
            name: "daily_actual",
            index: 6,
            visible: true,
            fixed: true,
          },
          {
            title: "Tỷ lệ (Thực đạt/Mục tiêu ngày)",
            name: "daily_progress",
            index: 7,
            visible: true,
          },
        ],
  );
  const [allItemInDim, setAllItemInDim] = useState<any[]>([]);
  const [havePermission, setHavePermission] = useState<boolean>(true);

  const newFinalColumns = useMemo(() => {
    return filterValueColumns(finalColumns, columns);
  }, [columns, finalColumns]);

  const setObjectiveColumns = useCallback(
    (
      departmentKey: string,
      department: string,
      columnIndex: number,
      departmentDrillingLevel: number,
      className: string = "department-name--secondary",
      link: string,
    ): ColumnGroupType<any> | ColumnType<any> => {
      const queryParams = queryString.parse(history.location.search);
      const { direction, date: viewDate } = queryParams;
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
          {
            title: () => {
              return (
                <Popover
                  content={<div style={{ width: 200 }}>Cho phép người dùng nhập vào</div>}
                  title="MỤC TIÊU THÁNG"
                  placement="bottom"
                >
                  MỤC TIÊU THÁNG
                </Popover>
              );
            },
            width: 120,
            align: "right",
            dataIndex: `${departmentKey}_monthly_target`,
            className: "input-cell",
            render: (text: any, record: KeyDriverDataSourceType, index: number) => {
              // const inputId = getInputTargetId(index, columnIndex * 2, PREFIX_CELL_TABLE);
              const inputId = `${record[`${departmentKey}_key`] || record.key}-${
                record.title
              }-${index}-${columnIndex * 2 + 1}-month-target`;
              let newValue = text ? Number(text) : 0;
              let clickCancel = false;
              return numberOfStoreStaffKD.includes(record.key) ? (
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

                          if (!clickCancel && value != newValue) {
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
                                `day${day.toString().padStart(2, "0")}`,
                              );
                            }
                          } else {
                            clickCancel = false;
                          }
                          document
                            .getElementById(`${inputId}-action`)
                            ?.setAttribute("hidden", "false");
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
                      suffix={record.unit === "percent" ? "%" : null}
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
          },
          {
            title: () => {
              return (
                <Popover
                  content={
                    <div style={{ width: 200 }}>
                      Dữ liệu cập nhật từ đầu tháng đến hết ngày hôm qua(TH ngày chọn là ngày hiện
                      tại). Dữ liệu cập nhật từ đầu tháng đến ngày được chọn(TH ngày được chọn là
                      ngày quá khứ)
                    </div>
                  }
                  title="LUỸ KẾ"
                  placement="bottom"
                >
                  LUỸ KẾ
                </Popover>
              );
            },
            width: 45,
            align: "right",
            dataIndex: `${departmentKey}_monthly_actual`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {formatCurrency(text)} {record.unit === "percent" ? "%" : ""}
                </VerifyCell>
              );
            },
          },
          {
            title: () => {
              return (
                <Popover
                  content={<div style={{ width: 200 }}>Luỹ kế/Mục tiêu tháng</div>}
                  title="TỶ LỆ"
                  placement="bottom"
                >
                  TỶ LỆ
                </Popover>
              );
            },
            width: 45,
            align: "right",
            dataIndex: `${departmentKey}_monthly_progress`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {`${text}%`}
                </VerifyCell>
              );
            },
          },
          {
            title: () => {
              return (
                <Popover
                  content={
                    <div
                      style={{ width: 200 }}
                    >{`=Lũy kế/(Ngày được chọn - 1) * Số ngày trong tháng(TH ngày dược chọn là ngày hiện tại). =Lũy kế/Ngày được chọn * Số ngày trong tháng(TH ngày được chọn là ngày quá khứ)`}</div>
                  }
                  title="DỰ KIẾN ĐẠT"
                  placement="bottom"
                >
                  DỰ KIẾN ĐẠT
                </Popover>
              );
            },
            width: 90,
            align: "right",
            dataIndex: `${departmentKey}_monthly_forecasted`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverDataSourceType, index: number) => {
              return ["OF.DT.FB.02", ...npsKD].includes(record.key) ? (
                <span>-</span>
              ) : (
                <div
                  className={
                    text
                      ? (
                          kdOffNeedLowValue.includes(record.key)
                            ? Number(text) - record[`${departmentKey}_monthly_target`] <= 0
                            : Number(text) - record[`${departmentKey}_monthly_target`] >= 0
                        )
                        ? "background-green"
                        : "background-red"
                      : ""
                  }
                >
                  <VerifyCell row={record} value={text}>
                    {formatCurrency(text)} {record.unit === "percent" ? "%" : ""}
                  </VerifyCell>
                </div>
              );
            },
          },
          {
            title: () => {
              return (
                <Popover
                  content={<div style={{ width: 200 }}>Dự kiến đạt/Mục tiêu tháng</div>}
                  title="TỶ LỆ"
                  placement="bottom"
                >
                  TỶ LỆ
                </Popover>
              );
            },
            width: 45,
            align: "right",
            dataIndex: `${departmentKey}_monthly_forecasted_progress`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverDataSourceType) => {
              return ["OF.DT.FB.02", ...npsKD].includes(record.key) ? (
                <span>-</span>
              ) : (
                <div
                  className={
                    text
                      ? (kdOffNeedLowValue.includes(record.key) ? text <= 100 : text >= 100)
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
          },
          {
            title: () => {
              return (
                <Popover
                  content={
                    <div
                      style={{ width: 200 }}
                    >{`=(Mục tiêu tháng - Lũy kế) / [Số ngày trong tháng - (Ngày hiện tại - 1)]. Người dùng vẫn có thể nhập mục tiêu ngày cho riêng phòng ban. Xoá mục tiêu ngày đã nhập -> Unicorn sẽ tự tính lại mục tiêu ngày theo công thức trên`}</div>
                  }
                  title="MỤC TIÊU NGÀY"
                  placement="bottom"
                >
                  MỤC TIÊU NGÀY
                </Popover>
              );
            },
            width: 110,
            align: "right",
            dataIndex: `${departmentKey}_daily_target`,
            className: "input-cell",
            render: (text: any, record: KeyDriverDataSourceType, index: number) => {
              // const inputId = getInputTargetId(index, columnIndex * 2 + 1, PREFIX_CELL_TABLE);
              const inputId = `${record[`${departmentKey}_key`] || record.key}-${
                record.title
              }-${index}-${columnIndex * 2 + 1}-day-target`;
              let newValue = text ? Number(text) : 0;
              let clickCancel = false;
              return ["OF.DT.FB.02", ...numberOfStoreStaffKD, ...npsKD].includes(record.key) ? (
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

                          if (!clickCancel && value != newValue) {
                            newValue = value;
                            let targetDay = viewDate
                              ? moment(viewDate as string, DATE_FORMAT.YYYYMMDD).date()
                              : 0;
                            const day =
                              targetDay && targetDay > 0 && targetDay <= 31
                                ? targetDay
                                : moment().date();
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
                          document
                            .getElementById(`${inputId}-action`)
                            ?.setAttribute("hidden", "false");
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
                      suffix={record.unit === "percent" ? "%" : null}
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
          },
          {
            title: () => {
              return (
                <Popover
                  content={<div style={{ width: 200 }}>Dữ liệu trong ngày hôm nay</div>}
                  title="THỰC ĐẠT"
                  placement="bottom"
                >
                  THỰC ĐẠT
                </Popover>
              );
            },
            width: 75,
            align: "right",
            dataIndex: `${departmentKey}_daily_actual`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverDataSourceType, index: number) => {
              return ["OF.DT.FB.02", ...npsKD].includes(record.key) ? (
                <span>-</span>
              ) : (
                <VerifyCell row={record} value={text}>
                  {formatCurrency(text)} {record.unit === "percent" ? "%" : ""}
                </VerifyCell>
              );
            },
          },
          {
            title: () => {
              return (
                <Popover
                  content={<div style={{ width: 200 }}>Thực đạt/Mục tiêu ngày</div>}
                  title="TỶ LỆ"
                  placement="bottom"
                >
                  TỶ LỆ
                </Popover>
              );
            },
            width: 50,
            align: "right",
            dataIndex: `${departmentKey}_daily_progress`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {`${text}%`}
                </VerifyCell>
              );
            },
          },
        ],
      };
    },
    [day, dispatch, history],
  );

  const initTable = useCallback(
    async (
      date: string,
      keyDriverGroupLv1: string,
      departmentLv2: string | null,
      departmentLv3: string | null,
    ) => {
      const selectedItemsInDim = form.getFieldsValue(true)["itemsInDim"];
      setLoadingPage(true);
      let allDepartment: { groupedBy: string; drillingLevel: number }[] = [];
      try {
        let dimension: KeyDriverDimension;
        let currentDrillingLevel: number;
        const { Asm, Store, Staff } = KeyDriverDimension;
        if (departmentLv3) {
          dimension = Staff;
          currentDrillingLevel = 3;
        } else if (departmentLv2) {
          dimension = Store;
          currentDrillingLevel = 2;
        } else if (keyDriverGroupLv1) {
          dimension = Asm;
          currentDrillingLevel = 1;
        }
        const response = await callApiNative(
          { isShowError: true },
          dispatch,
          getKeyDriverOnlineApi,
          {
            date,
            keyDriverGroupLv1,
            departmentLv2,
            departmentLv3,
          },
        );
        const { FORBIDDEN, FORBIDDEN_REPORT, SUCCESS } = HttpStatus;
        if (response.data?.code === FORBIDDEN) {
          setHavePermission(false);
          return;
        }
        const queryParams = queryString.parse(history.location.search);
        const {
          direction,
          groupLv,
          groupLvName,
          departmentLv2: departmentLv2Param,
          departmentLv3: departmentLv3Param,
        } = queryParams;
        const { Horizontal } = KDReportDirection;
        let temp = [...baseColumns];
        if (response.code && response.code !== SUCCESS) {
          const { department_lv2, department_lv3 } = response;
          switch (response.code) {
            case FORBIDDEN_REPORT:
              let newQueries: any = {
                ...queryParams,
                keyDriverGroupLv1: DEFAULT_OFF_KD_GROUP_LV1,
              };
              if (department_lv2) {
                newQueries = { ...newQueries, departmentLv2: department_lv2.toUpperCase() };
              }
              if (department_lv3) {
                newQueries = { ...newQueries, departmentLv3: department_lv3.toUpperCase() };
              }
              history.push({ search: queryString.stringify(newQueries) });
              break;
            default:
              setLoadingPage(false);
              break;
          }
          return;
        }
        if (direction === Horizontal) {
          setData(() => {
            return convertDataToFlatTableRotation(
              response,
              currentDrillingLevel,
              groupLv as string,
            );
          });
          const horizontalColumns = () => {
            return setTableHorizontalColumns(
              response.result.data,
              setObjectiveColumns,

              currentDrillingLevel,
              {
                groupLv: groupLv as string,
                groupLvName: groupLvName as string,
                queryParams,
              },
            );
          };
          temp = [
            {
              title: "Khu vực",
              key: "name",
              dataIndex: "title",
              width: 220,
              fixed: "left",
              render: (text: string, record: any) => {
                if (record.blockAction) {
                  return <span className="deparment-name-horizontal">{text}</span>;
                } else {
                  if (!departmentLv2Param) {
                    return (
                      <Link
                        to={`?${queryString.stringify({
                          ...queryParams,
                          departmentLv2: text,
                        })}`}
                      >
                        <span className="deparment-name-horizontal">{text}</span>
                      </Link>
                    );
                  } else if (!departmentLv3Param) {
                    return (
                      <Link
                        to={`?${queryString.stringify({
                          ...queryParams,
                          departmentLv3: text,
                        })}`}
                      >
                        <span className="deparment-name-horizontal">{text}</span>
                      </Link>
                    );
                  } else {
                    return <span className="deparment-name-horizontal">{text}</span>;
                  }
                }
              },
            },
            ...horizontalColumns(),
          ];
        } else {
          setData(() => {
            return convertDataToFlatTableKeyDriver(response, COLUMN_ORDER_LIST, dimension);
          });
          allDepartment = getAllDepartmentByAnalyticResult(response.result.data, COLUMN_ORDER_LIST);
          allDepartment
            .filter(
              (item) =>
                !selectedItemsInDim?.length ||
                selectedItemsInDim?.includes(item.groupedBy) ||
                item.drillingLevel === currentDrillingLevel,
            )
            .forEach(({ groupedBy, drillingLevel }, index: number) => {
              let link = "";
              if (index !== 0 && drillingLevel <= SHOP_LEVEL) {
                const defaultDate = date ? date : moment().format(DATE_FORMAT.YYYYMMDD);
                const columnDepartmentLv2 = drillingLevel === 2 ? groupedBy : departmentLv2;
                const columnDepartmentLv3 = drillingLevel === 3 ? groupedBy : departmentLv3;

                const params = {
                  ...queryParams,
                  date: defaultDate,
                  keyDriverGroupLv1: DEFAULT_OFF_KD_GROUP_LV1,
                  departmentLv2: columnDepartmentLv2,
                  departmentLv3: columnDepartmentLv3,
                };

                link = `?${queryString.stringify(params)}`;
              }

              temp.push(
                setObjectiveColumns(
                  nonAccentVietnameseKD(groupedBy),
                  groupedBy.toUpperCase(),
                  index,
                  drillingLevel,
                  index === 0 ? "department-name--primary" : undefined,
                  link,
                ),
              );
            });
        }

        setFinalColumns(temp);
        setLoadingPage(false);
        setAllItemInDim(
          allDepartment.filter((item) => {
            if (departmentLv3) {
              return item.drillingLevel === 4;
            } else if (departmentLv2) {
              return item.drillingLevel === 3;
            } else if (keyDriverGroupLv1) {
              return item.drillingLevel === 2;
            }
            return [];
          }),
        );
      } catch (error) {
        console.log("error", error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, setData, setObjectiveColumns],
  );

  useEffect(() => {
    setTimeout(() => {
      form.setFieldsValue({ itemsInDim: undefined });
    }, 1000);
    if (keyDriverGroupLv1 && date) {
      initTable(
        moment(date).format(DATE_FORMAT.YYYYMMDD),
        keyDriverGroupLv1,
        departmentLv2,
        departmentLv3,
      );
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      setTimeout(() => {
        form.setFieldsValue({ date: moment() });
      }, 1000);
      const queryParams = queryString.parse(history.location.search);
      const newQueries = {
        ...queryParams,
        date: today,
        keyDriverGroupLv1: DEFAULT_OFF_KD_GROUP_LV1,
      };
      history.push({ search: queryString.stringify(newQueries) });
    }
  }, [initTable, history, date, keyDriverGroupLv1, departmentLv2, departmentLv3, form, groupLevel]);

  const onFinish = useCallback(() => {
    let date = form.getFieldsValue(true)["date"];
    let newDate = "";
    if (date) {
      newDate = moment(date, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.YYYYMMDD);
    } else {
      newDate = moment().format(DATE_FORMAT.YYYYMMDD);
      setTimeout(() => {
        form.setFieldsValue({ date: moment() });
      }, 1000);
    }
    const queryParams = queryString.parse(history.location.search);
    const newQueries = {
      ...queryParams,
      date: newDate,
      keyDriverGroupLv1: DEFAULT_OFF_KD_GROUP_LV1,
    };
    history.push({ search: queryString.stringify(newQueries) });
  }, [form, history]);

  const onChangeItemInDim = () => {
    initTable(
      moment(date).format(DATE_FORMAT.YYYYMMDD),
      keyDriverGroupLv1,
      departmentLv2,
      departmentLv3,
    );
  };
  return havePermission ? (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Offline"}
      breadcrumb={getBreadcrumbByLevel(
        queryString.parse(history.location.search),
        departmentLv2,
        departmentLv3,
      )}
      extra={
        <>
          <Button className="sub-feature-button" type="primary">
            <Link to={`/key-driver-offline/potential-importing`}>
              Nhập file khách hàng tiềm năng
            </Link>
          </Button>
        </>
      }
    >
      <KeyDriverStyle>
        <Card>
          <Form
            onFinish={onFinish}
            onFinishFailed={() => {}}
            form={form}
            name="report-form-base"
            layout="inline"
            initialValues={{
              date: date
                ? moment(date).format(DATE_FORMAT.DDMMYYY)
                : moment().format(DATE_FORMAT.DDMMYYY),
            }}
          >
            <Col xs={24} md={8}>
              <Form.Item name="date">
                <CustomDatePicker
                  format={DATE_FORMAT.DDMMYYY}
                  placeholder="Chọn ngày"
                  style={{ width: "100%" }}
                  onChange={() => onFinish()}
                  showToday={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="itemsInDim">
                <Select
                  disabled={loadingPage}
                  mode="multiple"
                  placeholder="Tuỳ chọn hiển thị"
                  showArrow
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                  maxTagCount={"responsive"}
                  filterOption={(input: String, option: any) => {
                    if (option.props.value) {
                      return strForSearch(option.props.children).includes(strForSearch(input));
                    }
                    return false;
                  }}
                >
                  {allItemInDim.map((item, index) => (
                    <Option key={"dimFilter" + index} value={item.groupedBy}>
                      {item.groupedBy}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Button
              htmlType="submit"
              type="primary"
              loading={loadingPage}
              onClick={onChangeItemInDim}
            >
              Áp dụng hiển thị
            </Button>
          </Form>
          <Button
            className="columns-setting"
            icon={<SettingOutlined />}
            onClick={() => setShowSettingColumn(true)}
          />
        </Card>
        <Card title={`BÁO CÁO NGÀY: ${day}`}>
          <Table
            className="disable-table-style" // để tạm background màu trắng vì chưa group data
            scroll={{ x: "max-content" }}
            sticky={{
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
              offsetScroll: 5,
            }}
            indentSize={6}
            bordered
            pagination={false}
            onRow={(record: any) => {
              return {
                onClick: () => {
                  // console.log(record);
                },
              };
            }}
            expandedRowKeys={expandRowKeys}
            expandable={{
              defaultExpandAllRows: false,
              onExpandedRowsChange: (rowKeys: any) => {
                setExpandRowKeys(rowKeys);
                // localStorage.setItem(LocalStorageKey.KDOfflineRowkeysExpanded, JSON.stringify(rowKeys));
              },
            }}
            rowClassName={(record: any, rowIndex: any) => {
              if (!expandRowKeys.includes(record.key) || !record.children) {
                return "expand-parent";
              }
              return "";
            }}
            columns={newFinalColumns}
            dataSource={data}
            loading={loadingPage}
          />
          <ModalSettingColumnData
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumns(data);
              localStorage.setItem(LocalStorageKey.KDOfflineColumns, JSON.stringify(data));
            }}
            data={columns}
          />
        </Card>
      </KeyDriverStyle>
    </ContentContainer>
  ) : (
    <NoPermission></NoPermission>
  );
}

const KeyDriverOfflineWithProvider = (props: any) => {
  return (
    <KeyDriverOfflineProvider>
      <KeyDriverOffline {...props} />
    </KeyDriverOfflineProvider>
  );
};

export default KeyDriverOfflineWithProvider;
