import {FormInstance} from "antd";
import {
  DiscountFormModel,
  VariantEntitlementsResponse,
} from "model/promotion/discount.create.model";

export const shareDiscount = (
  oldDiscountList: Array<DiscountFormModel>,
  newVariantList: Array<VariantEntitlementsResponse>,
  form: FormInstance
) => {
  const discountMap = new Map<number, DiscountFormModel>();
  const ignoreVariantMap = new Map<number, VariantEntitlementsResponse>();

  oldDiscountList.forEach((item) => {
    if (item["prerequisite_quantity_ranges.value"]) {
      discountMap.set(item["prerequisite_quantity_ranges.value"], item);
    }

    item?.variants?.forEach((child) => {
      ignoreVariantMap.set(child.variant_id, child);
    });
  });

  newVariantList.forEach((item, index) => {
    let discount = discountMap.get(item.discount_value);
    console.log("parent", typeof discount?.variants);
    if (!discount) {
      const discount = {
        variants: [item],
        entitled_variant_ids: [item.variant_id],
        "prerequisite_quantity_ranges.value": item.discount_value,
        "prerequisite_quantity_ranges.allocation_limit": item.limit,
        "prerequisite_quantity_ranges.greater_than_or_equal_to": item.min_quantity,
        "prerequisite_quantity_ranges.value_type":
          form.getFieldValue("entitled_method") === "FIXED_PRICE"
            ? "FIXED_AMOUNT"
            : item.discount_type,
      };
      oldDiscountList.push(discount);
      discountMap.set(item.discount_value, discount);
    } else if (discount && !ignoreVariantMap.get(item.variant_id)) {
      discount.variants.push(item);
      discount.entitled_variant_ids.push(item.variant_id);

      ignoreVariantMap.set(item.variant_id, item);
    }
  });

  return oldDiscountList;
};

export function nonAccentVietnamese(str: string) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str
    .toUpperCase()
    .replaceAll(/\s/g, "")
    .replace(/[^a-zA-Z ]/g, "");
}
 export const getDateFormDuration = (duration: number) => {
  if (duration) {
    const day = duration % 100;
    const month = (duration - day) / 100;

    console.log(month, day);

    return day + "/" + month;
  } else {
    return " -/- ";
  }
};

