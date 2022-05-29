import moment, {Moment} from "moment";

export const DATE_FORMAT = {
  DDMMYYY: "DD/MM/YYYY",
  DDMMYY_HHmm: "DD/MM/YYYY HH:mm",
  HHmm_DDMMYYYY: "HH:mm DD/MM/YYYY",
  DDMM: "DD/MM",
	fullDate: "DD/MM/YY HH:mm",
  YYYYMMDD: "YYYY-MM-DD",
  MMYYYY: "MM/YYYY",
  DD_MM_YYYY: "DD-MM-YYYY",
};

export const ConvertUtcToLocalDate = (
  date?: Date | string | number | null,
  format?: string
) => {
  if (date != null) {
    let localDate = moment.utc(date).toDate();
    let dateFormat = moment(localDate).format(
      format ? format : DATE_FORMAT.fullDate
    );
    return dateFormat;
  }
  return "";
};

export const ConvertTimestampToDate = (
  date?: string | number | null,
  format?: string
) => {
  if (date != null) {
    let dateTimestamp = Number(date);
    return moment(new Date(dateTimestamp * 1000)).format(format ? format : DATE_FORMAT.fullDate);
  }
  return "";
};

export const getDateFromNow = (distance: number, unit: 'day' | 'month' | 'week'): Moment => {
  return moment().subtract(distance, unit);
};

export const ConvertDateToUtc = (date: Date | string | number | Moment) => {
  return moment(date).utc().format();
};


export const checkFixedDate = (from: any, to: any) => {
  let fixedDate = null;
  let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY);
  let formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
  type CheckDateType = {
    distance: number;
    unit: "day" | "week" | "month";
    display: any;
  };

  let checkDates: Array<CheckDateType> = [
    {
      distance: 0,
      unit: "day",
      display: "Hôm nay",
    },
    {
      distance: 1,
      unit: "day",
      display: "Hôm qua",
    },
    {
      distance: 0,
      unit: "week",
      display: "Tuần này",
    },
    {
      distance: 1,
      unit: "week",
      display: "Tuần trước",
    },
    {
      distance: 0,
      unit: "month",
      display: "Tháng này",
    },
    {
      distance: 1,
      unit: "month",
      display: "Tháng trước",
    },
  ];
  for (let i = 0; i < checkDates.length; i++) {
    const checkDate = checkDates[i],
      { distance, unit, display } = checkDate;
    let searchUnit: any = unit;
    if (searchUnit === "week") searchUnit = "isoWeek";

    let dateFrom = getDateFromNow(distance, unit),
      dateTo = getDateFromNow(distance, unit);
    if (
      from === dateFrom.startOf(searchUnit).utc().format() &&
      to === dateTo.endOf(searchUnit).utc().format()
    ) {
      if (unit === "day") fixedDate = `${display} (${formatedFrom})`;
      else fixedDate = `${display} (${formatedFrom} - ${formatedTo})`;
      return fixedDate;
    }
  }
};

export const getStartOfDay = (date: Date | string | number | Moment) => {
  return  moment(date).startOf('day').format(`YYYY-MM-DDTHH:mm:ss`).toString() + "Z";
}
export const getEndOfDay = (date: Date | string | number | Moment) => {
  return  moment(date).endOf('day').format(`YYYY-MM-DDTHH:mm:ss`).toString() + "Z";
}

export const getStartOfDayCommon = (date: Date | string | number | Moment) => {
  if(!date) return
  return moment(date, DATE_FORMAT.DDMMYYY).startOf("day").utc(true);
}
export const getEndOfDayCommon = (date: Date | string | number | Moment) => {
  if(!date) return
  return moment(date, DATE_FORMAT.DDMMYYY).endOf("day").utc(true);
}

export const formatDateFilter = (date: Date | string | number | Moment | undefined) => {
  if(!date) return
  return moment(date).utc(false)
}

export const formatDateTimeFilter = (date: Date | string | number | Moment | undefined, format: string = '') => {
  if(!date) return
  return format !== '' ? moment(date, format).utc(true) : moment(date).utc(true)
}

export const formatDateCommon = (date: Date, format?: string) => {
  if(!date) return
  return moment(date).format(format)
}

export const splitDateRange = (dateRange: any) => {
  if(!dateRange) return { start: undefined, end: undefined}
  const splitDate = dateRange.split(' ~ ')
  const start = splitDate[0] || undefined
  const end = splitDate[1] || undefined
  return { start, end }
}


export const changeFormatDay = (date: any) => {
  if (!date) return
  const convertFormatDayStart = date.split("-").reverse();
  const restDayStart = convertFormatDayStart.slice(1);
  const getFirstElementDay = convertFormatDayStart.shift();
  const startDayAfterChangeFormat = restDayStart.concat(getFirstElementDay).join("-")
  return startDayAfterChangeFormat
}
const convertStartDateToTimestamp = (date: any) => {
  const myDate = date.split("/");
  let newDate = myDate[1] + "." + myDate[0] + "." + myDate[2] + " 00:00:00";
  return moment(new Date(newDate)).unix();
}
const convertEndDateToTimestamp = (date: any) => {
  const myDate = date.split("/");
  const today = new Date();
  let time = "23:59:59";

  if ((Number(myDate[0]) === Number(today.getDate())) &&
    (Number(myDate[1]) === Number(today.getMonth()) + 1) &&
    (Number(myDate[2]) === Number(today.getFullYear()))
  ) {
    time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  }

  const newDate = myDate[1] + "." + myDate[0] + "." + myDate[2];
  const dateTime = newDate + " " + time;
  return moment(new Date(dateTime)).unix();
}
export {
  convertStartDateToTimestamp,
  convertEndDateToTimestamp
}