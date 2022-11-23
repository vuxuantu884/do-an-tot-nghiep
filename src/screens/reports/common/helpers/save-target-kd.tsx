import { KeyDriverDataSourceType } from "model/report";
import moment from "moment";
import { Dispatch } from "react";
import { actualDayUpdateApi, onlineCounterService } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { showError, showSuccess } from "utils/ToastUtils";

export async function saveMonthTargetKeyDriver(
  value: { [key: string]: number },
  row: KeyDriverDataSourceType,
  columnDrillingLevel: number,
  columnKey: string,
  inputId: string,
  dispatch: Dispatch<any>,
  currentValue: any,
  key: string,
) {
  const departmentLevel: any = {
    department_lv1: "",
    department_lv2: "",
    department_lv3: "",
  };

  if (columnDrillingLevel > 0) {
    for (let i = 1; i <= columnDrillingLevel; i++) {
      departmentLevel[`department_lv${i}`] = row[`${columnKey}_department_lv${i}`] || "";
    }
  }

  const params = {
    entity_name: "monthly_target",
    entity_key: row.key,
    year: moment().year(),
    month: moment().month() + 1,
    account_code: row[`${columnKey}_account_code`] || "",
    account_name: row[`${columnKey}_account_name`] || "",
    account_role: row[`${columnKey}_account_role`] || "",
    ...departmentLevel,
    ...value,
  };

  const response = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    onlineCounterService,
    params,
  );
  console.log("response[key]", response[key]);
  // if (response && response[key]) {
  if (response) {
    showSuccess("Lưu thành công");
    // const input: any = document.getElementById(inputId);
    // input.value = parseLocaleNumber(response[key]);
  } else {
    showError("Lưu không thành công");
    const input: any = document.getElementById(inputId);
    input.value = currentValue;
  }
}

// unused
export async function saveActualDay(
  department_lv1: string,
  department_lv2: string,
  department_lv3: string,
  department_lv4: string,
  driver_key: string,
  value: number,
  dispatch: Dispatch<any>,
) {
  const params = {
    department_lv1,
    department_lv2,
    department_lv3,
    // department_lv4,
    driver_key,
    value_a: value,
    account_code: "",
    account_name: "",
    account_role: "",
  };
  console.log("params", params);
  if (params.department_lv1 && params.department_lv2 && params.department_lv3) {
    try {
      const response = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        actualDayUpdateApi,
        params,
      );
      if (response) showSuccess("Lưu thành công");
    } catch {
      showError("Lưu không thành công");
    }
  } else {
    showError("Chỉ số thực đạt được nhập phải từ shop");
  }
}
