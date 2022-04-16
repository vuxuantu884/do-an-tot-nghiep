import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

export const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);
export const START_OF_MONTH = moment().startOf("month").format(DATE_FORMAT.YYYYMMDD);
// LAST 3 MONTHS
export const LAST_3_MONTHS = [
    moment().subtract(3, "month").startOf("month").format(DATE_FORMAT.YYYYMMDD),
    moment().subtract(1, "month").endOf("month").format(DATE_FORMAT.YYYYMMDD),
];