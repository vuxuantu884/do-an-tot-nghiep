export const WORK_SHIFT_LIST = () => {
  let workShiftList = [];
  for (let i = 1; i <= 14; i++) {
    workShiftList.push({
      name: `Ca ${i}`,
      value: i,
    });
  }
};
