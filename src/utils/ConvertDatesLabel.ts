export const isExistInArr = (arr: string[], el: string) => {
  const arrFiltered = arr.filter((i) => el.indexOf(i) !== -1);

  return arrFiltered.length > 0;
};


export const ConvertDatesLabel = (arr: string[], keys: string[]): string[] => {
  Object.keys(arr).forEach((key: any) => arr[key] === undefined && delete arr[key]);

  let keysInArray = Object.keys(arr);
  let newKeys: string[] = [];

  keysInArray.forEach((i) => {
    const keySelected = keys.filter((key) => i.indexOf(key) !== -1);

    if (keySelected.length > 0 && newKeys.indexOf(keySelected[0]) === -1) {
      newKeys = [...newKeys, keySelected[0]];
    }
  });

  return newKeys;
};
