export const ConvertFullAddress = (storeData: any): string => {
  if (storeData) {
    const addressArr = [
      storeData.address,
      storeData.ward_name,
      storeData.district_name,
      storeData.city_name,
    ];
    const newAddressArr = addressArr.filter((item) => {
      if (!item) return false;
      return item;
    });

    return newAddressArr.join(", ");
  }
  return "---";
};
