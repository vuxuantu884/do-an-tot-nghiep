import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

export const isPastDate = (date: string | null, format: string = DATE_FORMAT.YYYYMMDD): boolean => {
  return !!date && moment(date).diff(moment(), "days", true) <= -1;
};
