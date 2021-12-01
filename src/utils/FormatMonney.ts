export const FormatTextMonney = (money: number): string => {
  if (money && money !==0) {
    return  `${money} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');  
  }
  return ""
};
