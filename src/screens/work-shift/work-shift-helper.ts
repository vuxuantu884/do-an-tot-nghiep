import {
  WorkHour,
  WorkShiftCellQuery,
  WorkShiftCellResponse,
} from "model/work-shift/work-shift.model";
import moment from "moment";
import { getAllCaWorkShift } from "service/work-shift/work-shift.service";

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
  orangeRed: "#F5222D",
  LavenderBlue: "#B0B0F2",
  AliceBlue: "#F0F0FE",
};

export interface WeeksShiftModel {
  week: string;
  shift: number[];
}

export enum EnumSelectedFilter {
  calendar = "calendar",
  user = "user",
}

export enum EnumShiftAssigner {
  auto = "auto",
  manual = "manual",
}

export const SHIFT_ROLE = {
  MANAGER: {
    key: "Cửa hàng trưởng",
    value: "Cửa hàng trưởng",
  },
  CONSULTANT: {
    key: "Chuyên gia tư vấn",
    value: "Chuyên gia tư vấn",
  },
  CASHIER: {
    key: "Thu ngân",
    value: "Chuyên viên thu ngân",
  },
  RECEPTION: {
    key: "Tiếp đón khách hàng",
    value: "Nhân viên tiếp đón",
  },
  WAREHOUSE: {
    key: "Nhân viên Kho (CH)",
    value: "Nhân viên kho",
  },
  VM: {
    key: "VM instore",
    value: "Setup cửa hàng",
  },
};

export const WORK_SHIFT_LIST = async () => {
  let workShiftList: WorkHour[] = [];
  const res = await getAllCaWorkShift();
  console.log(res);
  workShiftList = res.data.map((workHour: WorkHour) => {
    const from_hour = new Date("1970-01-01T" + workHour?.from_hour).getHours();
    const to_hour = new Date("1970-01-01T" + workHour?.to_hour).getHours();
    return {
      ...workHour,
      from_hour,
      to_hour,
    };
  });
  // for (let i = 1; i <= 14; i++) {
  //   workShiftList.push({
  //     name: `Ca ${i}`,
  //     value: i,
  //     formHours: hours + i - 1,
  //     toHours: hours + i,
  //   });
  // }

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

export const datesInRange = (startDate: string, endDate: string) => {
  const _startDate = moment(startDate);
  const _endDate = moment(endDate);
  const datesInRange = [];

  while (_startDate <= _endDate) {
    datesInRange.push(_startDate.format("YYYY-MM-DD"));
    _startDate.add(1, "day");
  }
  return datesInRange;
};

export const getDatesInWorkShift = (_workShiftCells: WorkShiftCellResponse[]) => {
  const _fullDay = _workShiftCells?.map((p) => p.issued_date || "");
  const uniqueDay = _fullDay.filter(
    (obj, index, self) => index === self.findIndex((o) => o === obj),
  );

  for (let i = 0; i < uniqueDay.length - 1; i++) {
    for (let j = i + 1; j < uniqueDay.length; j++) {
      if (new Date(uniqueDay[i]) > new Date(uniqueDay[j])) {
        const temp = uniqueDay[i];
        uniqueDay[i] = uniqueDay[j];
        uniqueDay[j] = temp;
      }
    }
  }
  return uniqueDay;
};

export const getAllShift = (_workShiftCells: WorkShiftCellResponse[]) => {
  const _fullShift = _workShiftCells?.map((p) => p.work_hour_name || "");
  const uniqueShift = _fullShift.filter(
    (obj, index, self) => index === self.findIndex((o) => o === obj),
  );

  uniqueShift.sort((a, b) => {
    const _a = a.replace(/ca/g, "");
    const _b = b.replace(/ca/g, "");
    if (Number(_a) < Number(_b)) {
      return -1;
    } else if (Number(_a) > Number(_b)) {
      return 1;
    } else {
      return 0;
    }
  });
  return uniqueShift;
};
