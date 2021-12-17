import {FormInstance} from "antd";
import {YodyAction} from "base/base.action";
import {searchProductWrapperRequestAction} from "domain/actions/product/products.action";
import _ from "lodash";
import {PageResponse} from "model/base/base-metadata.response";
import {ProductResponse, VariantResponse} from "model/product/product.model";
import {
  DiscountFormModel,
  VariantEntitlementsResponse,
} from "model/promotion/discount.create.model";
import {Dispatch} from "redux";
import {formatCurrency} from "./AppUtils";
import {showError} from "./ToastUtils";

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
  
  form.setFieldsValue({entitlements: oldDiscountList});

  return oldDiscountList.map((item) => item.variants);
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

export const renderDiscountValue = (value: number, valueType: string) => {
  let result = "";
  switch (valueType) {
    case "FIXED_PRICE":
      result = formatCurrency(value);
      break;
    case "FIXED_AMOUNT":
      result = formatCurrency(value);
      break;
    case "PERCENTAGE":
      result = `${value}%`;
      break;
  }
  return result;
};

export const renderTotalBill = (cost: number, value: number, valueType: string) => {
  let result = "";

  switch (valueType) {
    case "FIXED_PRICE":
      result = formatCurrency(Math.round(value));
      break;
    case "FIXED_AMOUNT":
      if (!cost) result = "";
      else result = `${formatCurrency(Math.round(cost - value))}`;
      break;
    case "PERCENTAGE":
      if (!cost) result = "";
      else result = `${formatCurrency(Math.round(cost - (cost * value) / 100))}`;
      break;
  }
  return result;
};

export const formatDiscountValue = (value: number | undefined, isPercent: boolean) => {
  if (isPercent) {
    const floatIndex = value?.toString().indexOf(".") || -1;
    if (floatIndex > 0) {
      return `${value}`.slice(0, floatIndex + 3);
    }
    return `${value}`;
  } else {
    return formatCurrency(`${value}`.replaceAll(".", ""));
  }
};

export const getDayOptions = () => {
  let days = [];
  for (let i = 1; i <= 31; i++) {
    days.push({key: `${i}`, value: `Ngày ${i}`});
  }
  return days;
};

export const handleSearchProduct = _.debounce(
  (
    dispatch: Dispatch<YodyAction>,
    value: string,
    onSetData: (data: Array<ProductResponse>) => void
  ) => {
    dispatch(
      searchProductWrapperRequestAction(
        {
          status: "active",
          limit: 200,
          page: 1,
          info: value.trim(),
        },
        (response: PageResponse<ProductResponse> | false) => {
          if (response) {
            onSetData(response.items);
          }
        }
      )
    );
  },
  500
);

/**
 *
 * @param value : selected product
 * @param isVariant : is variant or parent product
 * @param dataSearchVariant : result of search when typing in search variant
 * @param selectedProductParentRef : ref of selected product parent
 * @param setIsVisibleConfirmModal : set visible confirm modal
 * @param selectedProduct : the products display in table
 * @param setSelectedProduct : set selected product to display in table
 * @returns none
 */
export const onSelectProduct = (
  value: string,
  isVariant: boolean,
  dataSearchVariant: Array<VariantResponse>,
  selectedProductParentRef: any,
  setIsVisibleConfirmModal: (isVisible: boolean) => void,
  selectedProduct: Array<any>,
  setSelectedProduct: (selectedProduct: Array<any>) => void
) => {
  let selectedItem: any;
  //check is variant or product
  if (isVariant) {
    selectedItem = dataSearchVariant.find((e) => e.id === Number(value));
  } else {
    selectedItem = JSON.parse(value);
  }
  /**
   *  if selected item is not exist in selected product
   */
  const checkExist = selectedProduct.some((e) => e.id === selectedItem.id);
  if (checkExist) {
    showError("Sản phẩm đã được chọn!");
    return;
  }
  /**
   * Trường hợp trên ds đã có mã cha
   * → tìm kiếm sp variant thì thông báo lỗi đã đưa mã cha vào ds
   * → Nếu muốn thay đổi thì xóa mã cha
   */
  if (isVariant && selectedProduct.some((e) => selectedItem?.sku?.includes(e?.code))) {
    showError("Sản phẩm đã được chọn mã cha");
    return;
  }

  /**
   * Trường hợp trên ds đã có mã variant
   * → tìm kiếm sp  cha thì thông báo đã có mã variant vào ds
   * → popup thông báo sẽ áp dụng các variant còn lại của mã này
   * → Bấm XÁC NHẬN/ HỦY
   */
  if (!isVariant && selectedProduct.some((e) => e?.sku?.startsWith(selectedItem?.code))) {
    selectedProductParentRef.current = selectedItem;
    setIsVisibleConfirmModal(true);
    return;
  }

  if (selectedItem) {
    setSelectedProduct([selectedItem].concat(selectedProduct));
  }
};
