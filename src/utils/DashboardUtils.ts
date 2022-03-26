import { FIELD_FORMAT } from "model/report/analytics.model";

export const currencyAbbreviation = (value: number, format: FIELD_FORMAT | string = FIELD_FORMAT.Price) => {
  const { Price } = FIELD_FORMAT;
  switch (format) {
    case Price:
      if(typeof value !== 'number') {
        return value;
      }
      const absValue = Math.abs(value);
      if (absValue >= 1000000000) {
        return (value / 1000000000).toString() + " Tỷ";
      } else if (absValue >= 1000000) {
        return (value / 1000000).toString() + " Tr";
      } else if (absValue >= 1000) {
        return (value / 1000).toString() + " N";
      } else if (absValue === 0) {
        return value.toString();
      } else {
        return value.toString() + " Đ";
      }  
    default:
      return value.toString();
  }
  
};
