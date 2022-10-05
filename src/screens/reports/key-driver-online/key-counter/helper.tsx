import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, FormInstance } from "antd";
import { ColumnsType } from "antd/lib/table";
import NumberInput from "component/custom/number-input.custom";
import { uniqBy } from "lodash";
import { DepartmentLevel4, MonthlyCounter } from "model/report";
import moment, { Moment } from "moment";
import { Dispatch } from "redux";
import {
  getMetadataKeyDriverOnlineApi,
  getOnlineCounterService,
  onlineCounterService,
} from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { parseLocaleNumber } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { DEFAULT_KEY_DRIVER_GROUP_LV_1 } from "../helper";

export const getShopListByDate = async (
  dispatch: Dispatch<any>,
  date: moment.Moment = moment(),
) => {
  //edit date
  const dateString = date.format(DATE_FORMAT.YYYYMMDD);

  const metadata = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getMetadataKeyDriverOnlineApi,
    {
      keyDriverGroupLv1: DEFAULT_KEY_DRIVER_GROUP_LV_1,
      date: dateString,
      departmentLv2: "",
      departmentLv3: "",
    },
  );

  if (metadata?.departments?.columns && Array.isArray(metadata.departments.columns)) {
    const departmentLv1Index = metadata.departments.columns.findIndex(
      (item: any) => item.field === "department_lv1",
    );
    const departmentLv2Index = metadata.departments.columns.findIndex(
      (item: any) => item.field === "department_lv2",
    );
    const departmentLv3Index = metadata.departments.columns.findIndex(
      (item: any) => item.field === "department_lv3",
    );
    const departmentLv4Index = metadata.departments.columns.findIndex(
      (item: any) => item.field === "department_lv4",
    );

    const accountCodeIndex = metadata.departments.columns.findIndex(
      (item: any) => item.field === "account_code",
    );
    const accountNameIndex = metadata.departments.columns.findIndex(
      (item: any) => item.field === "account_name",
    );
    const accountRoleIndex = metadata.departments.columns.findIndex(
      (item: any) => item.field === "account_role",
    );

    let departmentLv3List = metadata.departments.data.map((item: any) => ({
      department_lv1: item[departmentLv1Index],
      department_lv2: item[departmentLv2Index],
      department_lv3: item[departmentLv3Index],
      department_lv4: item[departmentLv4Index],
      account_code: item[accountCodeIndex],
      account_name: item[accountNameIndex],
      account_role: item[accountRoleIndex],
    }));
    departmentLv3List = uniqBy(departmentLv3List, "department_lv3").filter(
      (item: any) => item.department_lv3,
    );
    return departmentLv3List;
  }
};
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

export const getColumnByDate = (
  keyDriver: string,
  date: moment.Moment = moment(),
  departmentLv1: string,
  departmentLv2: string,
  departmentLv3: string,
  dispatch: Dispatch<any>,
): ColumnsType<any> => {
  const month = date.month() + 1;
  const numberOfDay = date.daysInMonth();
  const columns: ColumnsType<any> = [];
  for (let i = 1; i <= numberOfDay; i++) {
    columns.push({
      title: `${i}`,
      dataIndex: `day${i.toString().padStart(2, "0")}`,
      key: month + keyDriver + i,
      width: 100,
      align: "center",
      render: (text: number, record: any, index: number) => {
        const inputId = `${record.account_code}-${month + keyDriver + i}-month-target`;
        let newValue = text ? Number(text) : 0;
        let clickCancel = false;
        return (
          <div>
            <NumberInput
              id={inputId}
              value={text}
              key={month + keyDriver + record.account_code + i}
              className="hide-control-input-number"
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
                setTimeout(async () => {
                  const input: any = document.getElementById(inputId);
                  const value = input.value
                    ? parseLocaleNumber(input.value)
                    : parseLocaleNumber(newValue);
                  console.log("value, newValue", value, newValue);

                  // eslint-disable-next-line eqeqeq
                  if (!clickCancel && value != newValue) {
                    newValue = value;
                    // saveMonthTargetKeyDriver(
                    //   { total: value },
                    //   record,
                    //   departmentDrillingLevel,
                    //   departmentKey,
                    //   inputId,
                    //   dispatch,
                    //   parseLocaleNumber(newValue),
                    //   `day${day.toString().padStart(2, "0")}`,
                    // );
                    const params = {
                      entity_name: keyDriver,
                      entity_key: "",
                      department_lv1: departmentLv1,
                      department_lv2: departmentLv2,
                      department_lv3: departmentLv3,
                      account_code: record.account_code,
                      account_name: record.account_name,
                      account_role: record.account_role,
                      [`day${i.toString().padStart(2, "0")}`]: Number(value),
                      month: date.month() + 1,
                      year: date.year(),
                    } as MonthlyCounter;
                    console.log("params params", params);
                    const response = await callApiNative(
                      { notifyAction: "SHOW_ALL" },
                      dispatch,
                      onlineCounterService,
                      params,
                    );
                    if (response) {
                      showSuccess("Lưu thành công");
                    } else {
                      showError("Lưu không thành công");
                    }
                  } else {
                    clickCancel = false;
                  }
                  // input.style.border = "none";
                  document.getElementById(`${inputId}-action`)?.setAttribute("hidden", "false");
                }, 100);
              }}
              onKeyDown={(e: any) => {
                if (e.key === "Escape") {
                  const event = new Event("input", { bubbles: true });
                  const input: any = document.getElementById(inputId);
                  setNativeValue(input, newValue);
                  input.dispatchEvent(event);
                  input.blur();
                }
              }}
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
                right: 16,
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
        );
      },
    });
  }
  const accountColumn = {
    title: "Nhân viên",
    dataIndex: "account_name",
    key: "account_code",
    width: 200,
    fixed: "left",
  } as any;
  console.log([accountColumn, ...columns]);
  return [accountColumn, ...columns];
};

export const getDepartmentLevel4ByShop = async (
  departmentLv2: string,
  departmentLv3: string,
  dispatch: Dispatch<any>,
) => {
  // const dateString = moment().format(DATE_FORMAT.YYYYMMDD);
  const dateString = "2022-07-31";
  const metadata = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getMetadataKeyDriverOnlineApi,
    {
      keyDriverGroupLv1: DEFAULT_KEY_DRIVER_GROUP_LV_1,
      date: dateString,
      departmentLv2: departmentLv2,
      departmentLv3: departmentLv3,
    },
  );
  console.log(metadata);
  if (
    metadata?.departments?.data &&
    Array.isArray(metadata.departments.data) &&
    metadata.departments.data.length > 0
  ) {
    const departmentLv4Index = metadata.departments.columns.findIndex(
      (item: any) => item.field === "department_lv4",
    );
    const accountCodeIndex = metadata.departments.columns.findIndex(
      (item: any) => item.field === "account_code",
    );
    const accountNameIndex = metadata.departments.columns.findIndex(
      (item: any) => item.field === "account_name",
    );
    const accountRoleIndex = metadata.departments.columns.findIndex(
      (item: any) => item.field === "account_role",
    );

    const departmentLv4List = metadata?.departments?.data
      .map((item: Array<any>) => ({
        department_lv4: item[departmentLv4Index],
        account_code: item[accountCodeIndex],
        account_name: item[accountNameIndex],
        account_role: item[accountRoleIndex],
      }))
      .filter((item: any) => item.department_lv4);
    return departmentLv4List;
  } else {
    return [];
  }
};

export const getMonthlyCounterByDepartmentLevel3 = async (
  departmentLv1: string,
  departmentLv2: string,
  departmentLv3: string,
  form: FormInstance,
  dispatch: Dispatch<any>,
): Promise<Array<MonthlyCounter>> => {
  const selectedKeyDriver = form.getFieldValue("key_driver");
  const selectedDate = form.getFieldValue("date") as Moment;
  const selectedYear = selectedDate?.year();
  const selectedMonth = selectedDate?.month() + 1;

  const response = await callApiNative({ isShowError: true }, dispatch, getOnlineCounterService, {
    "departmentLv1.equals": departmentLv1,
    "departmentLv2.equals": departmentLv2,
    "departmentLv3.equals": departmentLv3,
    "year.equals": selectedYear,
    "month.equals": selectedMonth,
    "entityName.in": [selectedKeyDriver],
  });

  console.log(response);
  if (response) {
    return response;
  } else {
    return [];
  }
};

export const convertDepartmentLv4AndMonthlyCounterToDataTable = (
  dpmLv4List: DepartmentLevel4[],
  savedMonthlyCounter: Array<MonthlyCounter>,
) => {
  const dataTable = dpmLv4List.map((dpmLv4: DepartmentLevel4) => {
    const monthlyCounter = savedMonthlyCounter.find(
      (monthlySaved: MonthlyCounter) => monthlySaved.account_code === dpmLv4.account_code,
    );
    const newRow = {
      ...dpmLv4,
      ...monthlyCounter,
    };
    return newRow;
  });
  console.log(dataTable);
  return dataTable;
};
