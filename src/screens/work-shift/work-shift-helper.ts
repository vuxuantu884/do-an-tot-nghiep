import { WorkShiftCellQuery } from "model/work-shift/work-shift.model";

export const shiftCustomColor = {
  darkCharcoal: "#262626",
  darkGrey: "#595959",
  blueViolet: "#8080DA",
  yellowGold: "#FAAD14",
  deepPurple: "#5858b6",
  darkBlue: "#2A2A86",
  limeGreen: "#52C41A",
  lavenderMist: "#F0F0FE",
  lightGray: "#D9D9D9",
  lightSlateGray: "#F0F0F0",
};

export enum EnumSelectedFilter {
  calendar = "calendar",
  user = "user",
}

export const WORK_SHIFT_LIST = () => {
  let workShiftList = [];
  let hours: number = 8;
  for (let i = 1; i <= 14; i++) {
    workShiftList.push({
      name: `Ca ${i}`,
      value: i,
      formHours: hours + i - 1,
      toHours: hours + i,
    });
  }

  return workShiftList;
};

export const convertWorkShiftCellQuery = (query: WorkShiftCellQuery) => {
  let toDate = null;
  let formDate = null;

  if (query.issued_date && query.issued_date.length !== 0) {
    if (query.issued_date.length === 1) {
      formDate = query.issued_date[0];
    } else {
      formDate = query.issued_date[0];
      toDate = query.issued_date[1];
    }
  }
  const customQuery = {
    "locationId.equals": query.location_id,
    "assignedTo.equals": query.assigned_to,
    "workHourName.equals": query.work_hour_name,
    "issuedDate.greaterThanOrEqual": formDate,
    "issuedDate.lessThanOrEqual": toDate,
  };

  return customQuery;
};
