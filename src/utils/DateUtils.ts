import moment from "moment";

export const DATE_FORMAT = {
  DDMMYYY: "DD/MM/YYYY",
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

export const ConvertDateToUtc = (date: Date | string | number) => {
  return moment(date).utc().format();
};
