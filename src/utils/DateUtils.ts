import moment, { Moment } from "moment";

export const DATE_FORMAT = {
  DDMMYYY: "DD/MM/YYYY",
  DDMMYY_HHmm: "DD/MM/YYYY HH:mm"
};

export const ConvertUtcToLocalDate = (
  date?: Date | string | number,
  format?: string
) => {
  if (date != null) {
    let localDate = moment.utc(date).toDate();
    let dateFormat = moment(localDate).format(
      format ? format : "DD/MM/YYYY HH:mm:ss"
    );
    return dateFormat;
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