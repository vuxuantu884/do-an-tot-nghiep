/* eslint-disable eqeqeq */
import { CheckOutlined, CloseOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Form, Table, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/lib/table";
import classnames from "classnames";
import ContentContainer from "component/container/content.container";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import ModalSettingColumnData from "component/table/ModalSettingColumnData";
import UrlConfig from "config/url.config";
// import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import { KeyDriverOnlineDataSourceType } from "model/report";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { getKeyDriverOnlineApi } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import {
  formatCurrency,
  generateQuery,
  parseLocaleNumber,
  replaceFormatString,
} from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import {
  COLUMN_ORDER_LIST,
  convertDataToFlatTableKeyDriver,
  DEFAULT_KEY_DRIVER_GROUP_LV_1,
  getAllDepartmentByAnalyticResult,
  getBreadcrumbByLevel,
  saveActualDay,
  // getInputTargetId,
  // handleMoveFocusInput,
  saveMonthTargetKeyDriver,
} from "./helper";
import { KeyDriverOnlineStyle } from "./index.style";
import KeyDriverOnlineProvider, {
  KeyDriverOfflineContext,
} from "./provider/key-driver-online-provider";

type VerifyCellProps = {
  row: KeyDriverOnlineDataSourceType;
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
        <Tooltip className="text-truncate-2 key-cell padding-left-10" title={record.method}>
          {text}
        </Tooltip>
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
  if (row.key.endsWith(".L")) {
    // Kết thúc bằng .L là những trường không có giá trị. TO bảo thế
    return <></>;
  } else if (!value && typeof value !== "number" && type === "display") {
    return <div>-</div>;
  } else {
    return <div>{children}</div>;
  }
}

function KeyDriverOnline() {
  const history = useHistory();
  // get query from url
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date");
  const targetDay = query.get("day");
  const keyDriverGroupLv1 = query.get("keyDriverGroupLv1") || DEFAULT_KEY_DRIVER_GROUP_LV_1;
  const departmentLv2 = query.get("departmentLv2");
  const departmentLv3 = query.get("departmentLv3");

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
  const expandedDefault = localStorage.getItem("key-dirver-online-rowkeys-expanded");
  const getColumns = localStorage.getItem("key-dirver-online-columns");
  const [expandRowKeys, setExpandRowKeys] = useState<any[]>(
    expandedDefault ? JSON.parse(expandedDefault) : [],
  );
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
            title: "Tỉ lệ",
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
            title: "Mục tiêu ngày",
            name: "daily_target",
            index: 4,
            visible: true,
          },
          {
            title: "Thực đạt",
            name: "daily_actual",
            index: 5,
            visible: true,
            fixed: true,
          },
          {
            title: "Tỉ lệ",
            name: "daily_progress",
            index: 6,
            visible: true,
          },
        ],
  );

  const newFinalColumns = useMemo(() => {
    return finalColumns.map((columnDetails: any) => {
      return {
        ...columnDetails,
        children: columnDetails.children
          ? columnDetails.children.filter((children: any, index: number) =>
              columns.some((i) => i.visible && i.index === index),
            )
          : undefined,
      };
    });
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
      return {
        title: link ? (
          <Link className={classnames("department-name", className)} to={link}>
            {department}
          </Link>
        ) : (
          department
        ),
        className: classnames("", className),
        onHeaderCell: (data: any) => {
          return {
            onClick: () => {
              // console.log("header", data);
            },
          };
        },

        children: [
          {
            title: () => {
              return (
                <div>
                  <span>MỤC TIÊU THÁNG</span>
                </div>
              );
            },
            width: 130,
            align: "right",
            dataIndex: `${departmentKey}_monthly_target`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              const targetDrillingLevel = +record[`target_drilling_level`];
              // const inputId = getInputTargetId(index, columnIndex * 2, PREFIX_CELL_TABLE);
              const inputId = `${record.key}-${index}-${columnIndex * 2 + 1}-month-target`;
              let newValue = text ? Number(text) : 0;
              let clickCancel = false;
              return (
                <VerifyCell row={record} value={text} type="edit">
                  <div style={{ position: "relative" }}>
                    <NumberInput
                      id={inputId}
                      value={newValue}
                      disabled={departmentDrillingLevel > targetDrillingLevel}
                      onPressEnter={(e: any) => {
                        const input: any = document.getElementById(inputId);
                        input.blur();
                      }}
                      onFocus={(e) => {
                        document.getElementById(`${inputId}-action`)?.removeAttribute("hidden");
                        const input: any = document.getElementById(inputId);
                        input.style.border = "solid 1px #ddd";
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
                          } else {
                            clickCancel = false;
                          }
                          input.style.border = "none";
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
                        zIndex: 2,
                        paddingTop: "2px",
                        right: 0,
                      }}
                    >
                      <Button
                        size="small"
                        icon={<CloseOutlined style={{ verticalAlign: "0.25em" }} />}
                        style={{ borderColor: "#ddd", backgroundColor: "#fff" }}
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
                        icon={<CheckOutlined style={{ verticalAlign: "0.25em" }} />}
                        style={{ marginLeft: 5, borderColor: "#ddd", backgroundColor: "#fff" }}
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
            title: "LUỸ KẾ",
            width: 130,
            align: "right",
            dataIndex: `${departmentKey}_monthly_actual`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {formatCurrency(text)} {record.unit === "percent" ? "%" : ""}
                </VerifyCell>
              );
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "right",
            dataIndex: `${departmentKey}_monthly_progress`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType) => {
              return (
                <VerifyCell row={record} value={text}>
                  {`${text}%`}
                </VerifyCell>
              );
            },
          },
          {
            title: "DỰ KIẾN ĐẠT",
            width: 130,
            align: "right",
            dataIndex: `${departmentKey}_monthly_forecasted`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              return (
                <div
                  className={
                    Number(text) / record[`${departmentKey}_monthly_target`] > 1
                      ? "background-green"
                      : Number(text) / record[`${departmentKey}_monthly_target`] < 1 / 2
                      ? "background-red"
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
            title: "MỤC TIÊU NGÀY",
            width: 120,
            align: "right",
            dataIndex: `${departmentKey}_daily_target`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              const targetDrillingLevel = +record[`target_drilling_level`];
              // const inputId = getInputTargetId(index, columnIndex * 2 + 1, PREFIX_CELL_TABLE);
              const inputId = `${record.key}-${index}-${columnIndex * 2 + 1}-day-target`;
              let newValue = text ? Number(text) : 0;
              let clickCancel = false;
              return (
                <VerifyCell row={record} value={text} type="edit">
                  <div style={{ position: "relative" }}>
                    <NumberInput
                      id={inputId}
                      disabled={departmentDrillingLevel > targetDrillingLevel}
                      value={newValue}
                      onPressEnter={(e: any) => {
                        const input: any = document.getElementById(inputId);
                        input.blur();
                      }}
                      onFocus={(e) => {
                        document.getElementById(`${inputId}-action`)?.removeAttribute("hidden");
                        const input: any = document.getElementById(inputId);
                        input.style.border = "solid 1px #ddd";
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
                            let newTargetDay = Number(targetDay);
                            const day =
                              newTargetDay && newTargetDay > 0 && newTargetDay <= 31
                                ? newTargetDay
                                : moment().date();
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
                          } else {
                            clickCancel = false;
                          }
                          input.style.border = "none";
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
                        zIndex: 2,
                        paddingTop: "2px",
                        right: 0,
                      }}
                    >
                      <Button
                        size="small"
                        icon={<CloseOutlined style={{ verticalAlign: "0.25em" }} />}
                        style={{ borderColor: "#ddd", backgroundColor: "#fff" }}
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
                        icon={<CheckOutlined style={{ verticalAlign: "0.25em" }} />}
                        style={{ marginLeft: 5, borderColor: "#ddd", backgroundColor: "#fff" }}
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
            title: "THỰC ĐẠT",
            width: 120,
            align: "right",
            dataIndex: `${departmentKey}_daily_actual`,
            className: "input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType, index: number) => {
              if (
                (record.key === "ON.DT.ZA.33" ||
                  record.key === "ON.DT.MK.23" ||
                  record.key === "ON.DT.MK.24") &&
                departmentLv2 &&
                !departmentLv3 &&
                departmentKey.replaceAll(" ", "") !== departmentLv2.replaceAll(" ", "")
              ) {
                const targetDrillingLevel = +record[`target_drilling_level`];
                // const inputId = getInputTargetId(index, columnIndex * 2 + 1, PREFIX_CELL_TABLE);s
                const inputId = `${record.key}-${index}-${columnIndex * 2 + 1}-day-actual`;
                let newValue = text ? Number(text) : 0;
                let clickCancel = false;
                return (
                  <VerifyCell row={record} value={text} type="edit">
                    <div style={{ position: "relative" }}>
                      <NumberInput
                        id={inputId}
                        disabled={departmentDrillingLevel > targetDrillingLevel}
                        value={newValue}
                        onPressEnter={(e: any) => {
                          const input: any = document.getElementById(inputId);
                          input.blur();
                        }}
                        onFocus={(e) => {
                          document.getElementById(`${inputId}-action`)?.removeAttribute("hidden");
                          const input: any = document.getElementById(inputId);
                          input.style.border = "solid 1px #ddd";
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
                              console.log(
                                "departmentKey",
                                department,
                                departmentLv2,
                                departmentLv3,
                              );
                              const params: any = {
                                department_lv1: "TỔNG CÔNG TY",
                                department_lv2: departmentLv2,
                                department_lv3: department,
                                department_lv4: null,
                                driver_key: record.key,
                                value,
                              };

                              saveActualDay(
                                params.department_lv1,
                                params.department_lv2,
                                params.department_lv3,
                                params.department_lv4,
                                params.driver_key,
                                params.value,
                                dispatch,
                              );
                            } else {
                              clickCancel = false;
                            }
                            input.style.border = "none";
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
                          zIndex: 2,
                          paddingTop: "2px",
                          right: 0,
                        }}
                      >
                        <Button
                          size="small"
                          icon={<CloseOutlined style={{ verticalAlign: "0.25em" }} />}
                          style={{ borderColor: "#ddd", backgroundColor: "#fff" }}
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
                          icon={<CheckOutlined style={{ verticalAlign: "0.25em" }} />}
                          style={{ marginLeft: 5, borderColor: "#ddd", backgroundColor: "#fff" }}
                          onClick={(e) => {
                            const input: any = document.getElementById(inputId);
                            input.blur();
                          }}
                        />
                      </div>
                    </div>
                  </VerifyCell>
                );
              } else {
                return (
                  <VerifyCell row={record} value={text}>
                    {formatCurrency(text)} {record.unit === "percent" ? "%" : ""}
                  </VerifyCell>
                );
              }
            },
          },
          {
            title: "TỶ LỆ",
            width: 80,
            align: "right",
            dataIndex: `${departmentKey}_daily_progress`,
            className: "non-input-cell",
            render: (text: any, record: KeyDriverOnlineDataSourceType) => {
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
    [day, departmentLv2, departmentLv3, dispatch, targetDay],
  );

  const initTable = useCallback(
    async (
      date: string,
      keyDriverGroupLv1: string,
      departmentLv2: string | null,
      departmentLv3: string | null,
    ) => {
      setLoadingPage(true);
      let allDepartment: { groupedBy: string; drillingLevel: number }[] = [];
      try {
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

        setData(convertDataToFlatTableKeyDriver(response, COLUMN_ORDER_LIST));
        allDepartment = getAllDepartmentByAnalyticResult(response.result.data, COLUMN_ORDER_LIST);

        const temp = [...baseColumns];

        allDepartment.forEach(({ groupedBy, drillingLevel }, index: number) => {
          let link = "";
          if (index !== 0 && drillingLevel <= SHOP_LEVEL) {
            const defaultDate = date ? date : moment().format(DATE_FORMAT.YYYYMMDD);
            const columnDepartmentLv2 = drillingLevel === 2 ? groupedBy : departmentLv2;
            const columnDepartmentLv3 = drillingLevel === 3 ? groupedBy : departmentLv3;

            const params = {
              date: defaultDate,
              keyDriverGroupLv1: DEFAULT_KEY_DRIVER_GROUP_LV_1,
              departmentLv2: columnDepartmentLv2,
              departmentLv3: columnDepartmentLv3,
            };

            link = `${UrlConfig.KEY_DRIVER_ONLINE}?${queryString.stringify(params)}`;
          }

          temp.push(
            setObjectiveColumns(
              nonAccentVietnamese(groupedBy),
              groupedBy.toUpperCase(),
              index,
              drillingLevel,
              index === 0 ? "department-name--primary" : undefined,
              link,
            ),
          );
        });
        setFinalColumns(temp);
        setLoadingPage(false);
      } catch (error) {}
    },
    [dispatch, setData, setObjectiveColumns],
  );

  useEffect(() => {
    if (keyDriverGroupLv1 && date) {
      initTable(
        moment(date).format(DATE_FORMAT.YYYYMMDD),
        keyDriverGroupLv1,
        departmentLv2,
        departmentLv3,
      );
    } else {
      const today = moment().format(DATE_FORMAT.YYYYMMDD);
      let queryParam = generateQuery({
        "default-screen": "key-driver-online",
        date: today,
        keyDriverGroupLv1: DEFAULT_KEY_DRIVER_GROUP_LV_1,
      });
      history.push(`?${queryParam}`);
    }
  }, [initTable, history, date, keyDriverGroupLv1, departmentLv2, departmentLv3]);

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
    let queryParam = generateQuery({
      "default-screen": "key-driver-online",
      date: newDate,
      keyDriverGroupLv1: DEFAULT_KEY_DRIVER_GROUP_LV_1,
    });
    history.push(`?${queryParam}`);
  }, [form, history]);
  return (
    <ContentContainer
      title={"Báo cáo kết quả kinh doanh Online"}
      breadcrumb={getBreadcrumbByLevel(departmentLv2, departmentLv3)}
    >
      <KeyDriverOnlineStyle>
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
            <Form.Item name="date" style={{ width: 300 }}>
              <CustomDatePicker
                format={DATE_FORMAT.DDMMYYY}
                placeholder="Chọn ngày"
                style={{ width: "100%" }}
                onChange={() => onFinish()}
                showToday={false}
              />
            </Form.Item>
            {/* <Button htmlType="submit" type="primary" loading={loadingPage}>
            Lọc
          </Button> */}
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
              defaultExpandAllRows: true,
              onExpandedRowsChange: (rowKeys: any) => {
                console.log("rowKeys", rowKeys);
                setExpandRowKeys(rowKeys);
                localStorage.setItem("key-dirver-online-rowkeys-expanded", JSON.stringify(rowKeys));
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
              localStorage.setItem("key-dirver-online-columns", JSON.stringify(data));
            }}
            data={columns}
          />
        </Card>
      </KeyDriverOnlineStyle>
    </ContentContainer>
  );
}

const KeyDriverOnlineWithProvider = (props: any) => {
  return (
    <KeyDriverOnlineProvider>
      <KeyDriverOnline {...props} />
    </KeyDriverOnlineProvider>
  );
};

export default KeyDriverOnlineWithProvider;
