export const currencyAbbreviation = (value: number) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toString() + " Tỷ";
  } else if (value >= 1000000) {
    return (value / 1000000).toString() + " Tr";
  } else if (value >= 1000) {
    return (value / 1000).toString() + " N";
  } else {
    return value.toString() + " Đ";
  }
};
