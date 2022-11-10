import { KeyDriverDataSourceType } from "model/report";
import moment from "moment";
import { Dispatch } from "redux";
import { onlineCounterService } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showError, showSuccess } from "utils/ToastUtils";

export async function saveTargetHorizontalReport(
  value: { [key: string]: number; currentValue: any },
  row: KeyDriverDataSourceType,
  inputId: string,
  dispatch: Dispatch<any>,
  keyDriver: string,
) {
  const { currentValue, ...otherValue } = value;
  const columnDrillingLevel = row.drillingLevel;
  const columnKey = nonAccentVietnameseKD(row.title);
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
    entity_key: row[`${keyDriver}_key`],
    year: moment().year(),
    month: moment().month() + 1,
    account_code: row[`${columnKey}_account_code`] || "",
    account_name: row[`${columnKey}_account_name`] || "",
    account_role: row[`${columnKey}_account_role`] || "",
    ...departmentLevel,
    ...otherValue,
  };

  const response = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    onlineCounterService,
    params,
  );
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
