import Color from "assets/css/export-variable.module.scss";
import moment from "moment";
import React from "react";
import { DATE_FORMAT } from "utils/DateUtils";
type Props = {
  startDate: Date;
  endDate: Date;
};

function DatePromotionColumn({ endDate, startDate }: Props) {
  console.log(typeof moment(endDate).format(DATE_FORMAT.DDMMYY_HHmm));
  return (
    <div>
      {startDate && moment(startDate).format(DATE_FORMAT.DDMMYY_HHmm)} -
      <div>
        {endDate ? (
          <div style={moment().isBefore(endDate) ? { color: Color.red } : {}}>
            {moment(endDate).format(DATE_FORMAT.DDMMYY_HHmm)}{" "}
          </div>
        ) : (
          "∞"
        )}
      </div>
    </div>
  );
}

export default DatePromotionColumn;
