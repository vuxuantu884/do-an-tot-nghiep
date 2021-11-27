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
