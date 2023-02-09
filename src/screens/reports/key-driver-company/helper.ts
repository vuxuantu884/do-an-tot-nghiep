import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import { AnalyticDataQuery, KeyDriverOnlineParams } from "model/report";
import { Dispatch } from "redux";
import { getKeyDriverOnlineApi } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
// import { parseLocaleNumber } from "utils/AppUtils";

export async function fetchQuery(params: KeyDriverOnlineParams, dispatch: Dispatch<any>) {
  const response: AnalyticDataQuery = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getKeyDriverOnlineApi,
    params,
  );
  return response;
}

export const handleFocusInput = (e: any) => {
  setTimeout(() => {
    e.target.select();
  }, 0);
  return false;
};

export const handleMoveFocusInput = (
  row: number,
  column: number,
  prefix: string,
  key: KeyboardKey | string,
) => {
  let nextRow = row;
  let nextColumn = column;
  switch (key) {
    case KeyboardKey.ArrowDown:
      nextRow += 1;
      break;
    case KeyboardKey.ArrowUp:
      nextRow -= 1;
      break;
    case KeyboardKey.ArrowLeft:
      nextColumn -= 1;
      break;
    case KeyboardKey.ArrowRight:
      nextColumn += 1;
      break;
    default:
      break;
  }
  const nextColumnId = getInputTargetId(nextRow, nextColumn, prefix);
  const nextColumnElement = document.getElementById(nextColumnId);
  nextColumnElement?.focus();
};

export const getInputTargetId = (row: number, column: number, prefix: string) => {
  return `${prefix}_row_${row}_column_${column}`;
};
