import {FormInstance} from "antd";
import {YodyAction} from "base/base.action";
import {productGetDetail} from "domain/actions/product/products.action";
import _ from "lodash";
import {ProductResponse, VariantResponse} from "model/product/product.model";
import {
  EntilementFormModel,
  IgnoreVariant,
  PriceRuleMethod,
  ProductEntitlements,
  VariantEntitlementsFileImport,
} from "model/promotion/price-rules.model";
import moment from "moment";
import {Dispatch} from "redux";
import {DiscountUnitType} from "screens/promotion/discount/constants";
import {CustomerFilterField} from "screens/promotion/shared/cusomer-condition.form";
import {formatCurrency} from "./AppUtils";
import {PROMO_TYPE} from "./Constants";
import {DATE_FORMAT} from "./DateUtils";
import {showError} from "./ToastUtils";

//refacor
/**
 * Đóng modal xác nhận thêm mã cha
 */
export const handleDenyParentProduct = (
  setIsVisibleConfirmModal: (value: boolean) => void,
  selectedProductParentRef: any
) => {
  selectedProductParentRef.current = null;
  setIsVisibleConfirmModal(false);
};

/**
 *
 * @param currentEntilementList
 * @param currentDiscountGroupMap
 * @param isVariant
 * @param importItem
 * @param currentProductIdList
 * @param currentVariantIdList
 * @returns
 */
export const insertProduct = (
  currentEntilementList: Array<EntilementFormModel>,
  currentDiscountGroupMap: Map<string, EntilementFormModel>,
  isVariant: boolean,
  importItem: VariantEntitlementsFileImport,
  currentProductIdList: Array<number>,
  currentVariantIdList: Array<number>,
  ignoreVariantList: Array<IgnoreVariant>
) => {
  if (isVariant && currentProductIdList.includes(importItem.product_id)) {
    ignoreVariantList?.push({
      ignoreVariantId: importItem.variant_id,
      ignoreVariantSku: importItem.sku,
    });
    return;
  }

  //Tìm variant sắp thêm xem đã có trong form chưa, có thì xoá đi
  if (isVariant && currentVariantIdList.includes(importItem.variant_id)) {
    currentEntilementList.forEach((element: EntilementFormModel, index: number) => {
      currentEntilementList[index].selectedProducts = element.selectedProducts?.filter(
        (product: ProductEntitlements) => product.variant_id !== importItem.variant_id
      );

      currentEntilementList[index].entitled_variant_ids =
        element.entitled_variant_ids?.filter(
          (variantId: number) => variantId !== importItem.variant_id
        );
    });
  } else if (!isVariant && currentProductIdList.includes(importItem.product_id)) {
    //Tìm sản phẩm cha sắp thêm xem đã có trong form chưa, có thì xoá đi
    currentEntilementList.forEach((element: EntilementFormModel, index: number) => {
      currentEntilementList[index].selectedProducts = element.selectedProducts?.filter(
        (product: ProductEntitlements) => product.product_id !== importItem.product_id
      );

      currentEntilementList[index].entitled_product_ids =
        element.entitled_product_ids?.filter(
          (productId: number) => productId !== importItem.product_id
        );
    });
  }

  //Kiểm tra giá trị nhóm chiết khấu của sản phẩm import đã trùng với nhóm chiết khấu nào chưa
  // nếu tồn tại discountGroup  => true
  const discountGroup = currentDiscountGroupMap.get(
    JSON.stringify({
      value: importItem.discount_value,
      value_type: importItem.discount_type,
      greater_than_or_equal_to: importItem.min_quantity,
    })
  );

  const itemParseFromFileToDisplay = {
    ...importItem,
    cost: importItem.price,
    open_quantity: importItem.quantity,
    variant_title: importItem.variant_title,
    product_id: importItem.product_id,
    sku: isVariant ? importItem.sku : importItem.product_code || "",
  };

  const prerequisite_quantity = {
    value: importItem.discount_value,
    allocation_limit: importItem.limit,
    greater_than_or_equal_to: importItem.min_quantity,
    value_type: importItem.discount_type,
  };

  if (!discountGroup) {
    // nếu nhóm khuyến mãi không tồn tại trong danh sách => tạo mới
    const discount: EntilementFormModel = {
      selectedProducts: [itemParseFromFileToDisplay],
      entitled_variant_ids: importItem.variant_id ? [importItem.variant_id] : [],
      entitled_product_ids: importItem.product_id ? [importItem.product_id] : [],
      prerequisite_quantity_ranges: [{...prerequisite_quantity}],
    };

    currentEntilementList.unshift(discount);
    currentDiscountGroupMap.set(
      JSON.stringify({
        value: importItem.discount_value,
        value_type: importItem.discount_type,
        greater_than_or_equal_to: importItem.min_quantity,
      }),
      discount
    );
  } else {
    // nếu nhóm khuyến mãi đã tồn tại  & sản phẩm chưa tồn tại trong nhóm KM => thêm sản phẩm vào nhóm khuyến mãi
    if (isVariant) {
      discountGroup.entitled_variant_ids.unshift(importItem.variant_id);
      discountGroup.entitled_product_ids.unshift(importItem.product_id);
    } else {
      discountGroup.entitled_product_ids.unshift(importItem.product_id);
    }

    discountGroup.selectedProducts?.unshift(itemParseFromFileToDisplay);
    // thay đổi reference data form để re-render
    discountGroup.selectedProducts = _.cloneDeep(discountGroup.selectedProducts);
  }

  // add product id và variant_id vào form
  if (isVariant) {
    currentVariantIdList.push(importItem.variant_id);
    console.log(importItem.variant_id);
  } else {
    currentProductIdList.push(importItem.product_id);
  }
};

/**
 * # IMPORT SẢN PHẨM TỪ FILE VÀO FORM
 *
 * ## Chia 2 phần xử lý data
 * ### 1. Xử lý sp cha trước => call @function insertProduct (để không bỏ qua trường hợp sp cha và variant của cha cùng tồn tại trong file import)
 *
 * ### 2. Xử lý variant  => call @function insertProduct
 *
 *
 * @function insertProduct : xử lý data
 * ### Kiểm tra variant có thuộc sản phẩm cha nào đã tồn tại trong form không(ưu tiên sp cha)
 * => nếu đã có đếm số lượng và lưu lại sku của variant bị bỏ qua
 * => nếu chưa thì xét các điều kiện tiếp theo
 *
 *
 * ### Tìm sản phẩm sắp thêm xem đã có trong form chưa, có thì xoá đi
 * ### Kiểm tra giá trị nhóm chiết khấu của sản phẩm import đã trùng với nhóm chiết khấu nào chưa
 *
 * => nếu chưa thì thêm mới nhóm chiết khấu và thêm sản phẩm vào nhóm chiết khấu đó
 * => nếu đã có nhóm chiết khấu thì thêm sản phẩm vào nhóm chiết khấu đó
 *
 *
 * ## Thông báo : Số lượng bản ghi con không thêm được vào danh sách do đã tồn tại mã cha
 *
 * ## Set danh sách được import vào form
 *
 * @param currentEntilementList
 * @param newProductList
 * @param form
 */

export const shareDiscountImportedProduct = (
  currentEntilementList: Array<EntilementFormModel>,
  newProductList: Array<VariantEntitlementsFileImport>,
  form: FormInstance
) => {
  const currentDiscountGroupMap = new Map<string, EntilementFormModel>();
  // const ignoreProductMap = new Map<string, ProductEntitlements>();
  let currentProductIdList: Array<number> = [];
  let currentVariantIdList: Array<number> = [];

  currentEntilementList.forEach((item) => {
    const {value, value_type, greater_than_or_equal_to} =
      item.prerequisite_quantity_ranges[0];

    if (
      typeof value === "number" &&
      typeof greater_than_or_equal_to === "number" &&
      typeof value_type === "string"
    ) {
      currentDiscountGroupMap.set(
        JSON.stringify({value, value_type, greater_than_or_equal_to}),
        item
      ); // map những nhóm chiết => key: giá trị chiết khấu, dơn vị, số lượng tối thiểu
    }

    // lấy ra danh id sách sản phẩm cha đã tồn tại
    if (
      Array.isArray(item.entitled_product_ids) &&
      item.entitled_product_ids.length > 0
    ) {
      currentProductIdList = currentProductIdList.concat(item.entitled_product_ids);
    }

    // lấy ra danh id sách variant đã tồn tại
    if (
      Array.isArray(item.entitled_variant_ids) &&
      item.entitled_variant_ids.length > 0
    ) {
      currentVariantIdList = currentVariantIdList.concat(item.entitled_variant_ids);
    }
  });

  const ignoreVariantList: Array<IgnoreVariant> = [];

  // load lần 1 để import hết các sp cha
  newProductList.forEach((importItem) => {
    // trường variant mới thuộc sản phẩm cha khác thì bỏ qua (ưu tiên sp cha)
    // điều kiện phân biệt variant:  sẽ có cả variant_id và product_id
    const isVariant = Boolean(importItem.variant_id && importItem.product_id);
    if (!isVariant) {
      insertProduct(
        currentEntilementList,
        currentDiscountGroupMap,
        isVariant,
        importItem,
        currentProductIdList,
        currentVariantIdList,
        ignoreVariantList
      );
    }
  });

  // load các variant còn lại
  newProductList.forEach((importItem) => {
    // trường variant mới thuộc sản phẩm cha khác thì bỏ qua (ưu tiên sp cha)
    // điều kiện phân biệt variant:  sẽ có cả variant_id và product_id
    const isVariant = Boolean(importItem.variant_id && importItem.product_id);
    if (isVariant) {
      insertProduct(
        currentEntilementList,
        currentDiscountGroupMap,
        isVariant,
        importItem,
        currentProductIdList,
        currentVariantIdList,
        ignoreVariantList
      );
    }
  });
  const cleanEntilementList = currentEntilementList.filter(
    (element: EntilementFormModel) =>
      element.selectedProducts && element.selectedProducts?.length > 0
  );

  if (ignoreVariantList.length > 0) {
    showError(
      `Có ${ignoreVariantList.length} sản phẩm đã tồn mã cha trong danh sách khuyến mãi`
    );
  }

  form.setFieldsValue({entitlements: cleanEntilementList});
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

export const parseDurationToMoment = (duration?: number) => {
  if (duration) {
    const day = duration % 100;
    const month = (duration - day) / 100;
    const year = moment().year();
    return moment(`${year}-${month}-${day}`);
  } else {
    return undefined;
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

// export const handleSearchProduct = _.debounce(
//   (
//     dispatch: Dispatch<YodyAction>,
//     value: string,
//     onSetData: (data: Array<ProductResponse>) => void
//   ) => {
//     dispatch(
//       searchProductWrapperRequestAction(
//         {
//           status: "active",
//           limit: 200,
//           page: 1,
//           info: value.trim(),
//         },
//         (response: PageResponse<ProductResponse> | false) => {
//           if (response) {
//             onSetData(response.items);
//           }
//         }
//       )
//     );
//   },
//   500
// );

/**
 * chọn sp chiết khấu
 * @param value : selected product
 * @param selectedProductParentRef : ref of selected product parent
 * @param variantIdOfSelectedProdcutRef : save variant id of selected product => remove another variant if exist
 * @param setIsVisibleConfirmModal : variant id of selected product
 * @param form : form
 * @param name : number of discount group
 * @param dispatch  : dispatch
 * @returns : none
 */
export const onSelectVariantOfDiscount = (
  value: string,
  selectedProductParentRef: any,
  variantIdOfSelectedProdcutRef: any,
  setIsVisibleConfirmModal: (isVisible: boolean) => void,
  form: FormInstance,
  name: number, // index of a group entilement
  dispatch: Dispatch<YodyAction>
) => {
  const entitlements: Array<EntilementFormModel> = form.getFieldValue("entitlements");

  const currentProductList: Array<ProductEntitlements> =
    entitlements[name].selectedProducts || [];

  const selectedItem = JSON.parse(value);

  const isVariant = !!selectedItem?.sku;

  if (!isVariant) {
    // sp cha không có sku => set sku = code
    selectedItem.sku = selectedItem.code;
  }

  /**
   *  Check sản phẩm đã tồn tại trong danh sách hay chưa
   */
  const checkExist = currentProductList.some(
    (e) => e.sku === (selectedItem.sku ?? selectedItem.code)
  );
  if (checkExist) {
    showError("Sản phẩm đã được chọn!");
    return;
  }

  /**
   * Trường hợp trên ds đã có mã cha
   * → tìm kiếm sp variant thì thông báo lỗi đã đưa mã cha vào ds
   * → Nếu muốn thay đổi thì xóa mã cha
   */
  if (isVariant && currentProductList.some((e) => selectedItem?.sku?.includes(e?.sku))) {
    showError("Sản phẩm đã được chọn mã cha");
    return;
  }

  /**
   * Trường hợp trên ds đã có mã variant
   * → tìm kiếm sp  cha thì thông báo đã có mã variant vào ds
   * → popup thông báo sẽ áp dụng các variant còn lại của mã này
   * → Bấm XÁC NHẬN/ HỦY
   */
  if (
    !isVariant &&
    currentProductList.some((e) => e?.sku?.startsWith(selectedItem?.sku))
  ) {
    selectedProductParentRef.current = selectedItem;

    dispatch(
      productGetDetail(selectedItem.id, (result: ProductResponse | false) => {
        if (result) {
          variantIdOfSelectedProdcutRef.current = result.variants;
        }
      })
    );
    setIsVisibleConfirmModal(true);
    return;
  }

  /**
   * Pass hết các trường hợp trên thì thêm vào ds
   */
  let itemParseFromSelectToTable: ProductEntitlements = {} as ProductEntitlements;
  if (selectedItem && isVariant) {
    itemParseFromSelectToTable = {
      ...selectedItem,
      cost: 0,
      open_quantity: selectedItem.on_hand,
      variant_title: selectedItem.name,
      product_id: selectedItem.product_id, // id của sp cha
      variant_id: selectedItem.id, // id của sp variant
      sku: selectedItem.sku,
      isParentProduct: false,
    };

    entitlements[name].entitled_variant_ids.unshift(selectedItem.id);
  } else if (selectedItem && !isVariant) {
    itemParseFromSelectToTable = parseSelectProductToTableData(selectedItem);
    entitlements[name].entitled_product_ids.unshift(selectedItem.id);
  }

  currentProductList.unshift(itemParseFromSelectToTable);
  entitlements[name].selectedProducts = currentProductList;
  form.setFieldsValue({
    entitlements: _.cloneDeep(entitlements),
  });
};

export const parseSelectProductToTableData = (selectedItem: ProductResponse) => {
  return {
    ...selectedItem,
    cost: 0,
    open_quantity: selectedItem.on_hand || 0, // tạm thời chưa có trường on_hand của sp trong api variant
    variant_title: selectedItem.name,
    product_id: selectedItem.id, // id của sp cha
    sku: selectedItem.code,
    isParentProduct: true,
  };
};
export const parseSelectVariantToTableData = (selectedItem: VariantResponse) => {
  return {
    ...selectedItem,
    cost: selectedItem.variant_prices[0]?.import_price || 0,
    open_quantity: selectedItem.on_hand || 0, // tạm thời chưa có trường on_hand của sp trong api variant
    variant_title: selectedItem.name,
    product_id: selectedItem.product_id, // id của sp cha
    variant_id: selectedItem.id, // id của sp variant
    sku: selectedItem.sku,
    isParentProduct: false,
  };
};

export const addProductFromSelectToForm = (
  selectedItem: VariantResponse,
  form: FormInstance,
  name: number
) => {
  const entilementFormValue: EntilementFormModel[] = form.getFieldValue("entitlements");
  if (
    Array.isArray(entilementFormValue) &&
    Array.isArray(entilementFormValue[name]?.selectedProducts)
  ) {
    const checkExist = entilementFormValue[name]?.selectedProducts?.some(
      (e: any) => e.id === selectedItem.id
    );
    if (checkExist) {
      showError("Sản phẩm đã được chọn!");
      return;
    }
  }

  //parse selectedItem  to VariantEntitlements
  const temp: ProductEntitlements = {
    variant_id: selectedItem.id,
    variant_title: selectedItem.name,
    open_quantity: selectedItem.on_hand,
    cost: selectedItem.variant_prices[0]?.import_price ?? 0,
    price_rule_id: 0,
    limit: 0,
    sku: selectedItem.sku,
    product_id: selectedItem.id,
  };

  // add variant to display
  if (Array.isArray(entilementFormValue[name].selectedProducts)) {
    entilementFormValue[name].selectedProducts?.push(temp);
  } else {
    entilementFormValue[name].selectedProducts = [temp];
  }
  // add variant id
  if (Array.isArray(entilementFormValue[name].entitled_variant_ids)) {
    entilementFormValue[name].entitled_variant_ids?.push(selectedItem.id);
  } else {
    entilementFormValue[name].entitled_variant_ids = [selectedItem.id];
  }
  //TODO
  // add variant to form
  form.setFieldsValue({
    entitlements: _.cloneDeep(entilementFormValue),
  });
  console.log(form.getFieldValue("entitlements"));
};

export const getEntilementValue = (
  entitlements: EntilementFormModel[],
  entitlementMethod: string
) => {
  if (entitlementMethod === PriceRuleMethod.ORDER_THRESHOLD.toString()) {
    return [];
  } else {
    if (!entitlements || !Array.isArray(entitlements)) {
      return null;
    }

    // check không được để trống sản phẩm trong nhóm chiết khấu
    const checkEmpty = entitlements.some(
      (e) => e.entitled_product_ids.length === 0 && e.entitled_variant_ids.length === 0
    );
    if (checkEmpty) {
      throw new Error("Không được để trống sản phẩm trong nhóm chiết khấu");
    }
    return entitlements?.map((item: EntilementFormModel) => {
      delete item.selectedProducts;
      return item;
    });
  }
};

export const transformData = (values: any) => {
  let body: any = values;
  body.entitlements = getEntilementValue(values.entitlements, values.entitled_method);

  body.type = PROMO_TYPE.AUTOMATIC;
  body.starts_date = values.starts_date.format();
  body.ends_date = values.ends_date?.format() || null;

  body.prerequisite_store_ids = values.prerequisite_store_ids ?? [];
  body.prerequisite_sales_channel_names = values.prerequisite_sales_channel_names ?? [];
  body.prerequisite_order_source_ids = values.prerequisite_order_source_ids ?? [];

  // ==Đối tượng khách hàng==

  // Giới tính
  body.prerequisite_genders = values.prerequisite_genders ?? [];
  //Ngày sinh khách hàng
  const startsBirthday = values[CustomerFilterField.starts_birthday]
    ? moment(values[CustomerFilterField.starts_birthday])
    : null;
  const endsBirthday = values[CustomerFilterField.ends_birthday]
    ? moment(values[CustomerFilterField.ends_birthday])
    : null;
  if (startsBirthday || endsBirthday) {
    body.prerequisite_birthday_duration = {
      starts_mmdd_key: startsBirthday
        ? Number(
            (startsBirthday.month() + 1).toString().padStart(2, "0") +
              startsBirthday.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
        : null,
      ends_mmdd_key: endsBirthday
        ? Number(
            (endsBirthday.month() + 1).toString().padStart(2, "0") +
              endsBirthday.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
        : null,
    };
  } else {
    body.prerequisite_birthday_duration = null;
  }

  //==Ngày cưới khách hàng
  const startsWeddingDays = values[CustomerFilterField.starts_wedding_day]
    ? moment(values[CustomerFilterField.starts_wedding_day])
    : null;
  const endsWeddingDays = values[CustomerFilterField.ends_wedding_day]
    ? moment(values[CustomerFilterField.ends_wedding_day])
    : null;

  if (startsWeddingDays || endsWeddingDays) {
    body.prerequisite_wedding_duration = {
      starts_mmdd_key: startsWeddingDays
        ? Number(
            (startsWeddingDays.month() + 1).toString().padStart(2, "0") +
              startsWeddingDays.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
        : null,
      ends_mmdd_key: endsWeddingDays
        ? Number(
            (endsWeddingDays.month() + 1).toString().padStart(2, "0") +
              endsWeddingDays.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
        : null,
    };
  } else {
    body.prerequisite_wedding_duration = null;
  }

  //Khách hàng thuộc nhóm
  body.prerequisite_customer_group_ids = values.prerequisite_customer_group_ids ?? [];
  //Khách hàng thuộc cấp độ
  body.prerequisite_customer_loyalty_level_ids =
    values.prerequisite_customer_loyalty_level_ids ?? [];
  //Nhân viên phụ trách
  body.prerequisite_assignee_codes = values.prerequisite_assignee_codes ?? [];

  //==Chiết khấu nâng cao theo đơn hàng==
  //Điều kiện chung

  if (values?.rule && !_.isEmpty(JSON.parse(JSON.stringify(values?.rule)))) {
    body.rule = values.rule;
  }

  return body;
};

/**
 *
 * @param value
 * @param form
 * @param setDiscountMethod
 */
export const handleChangeDiscountMethod = (
  value: PriceRuleMethod,
  form: FormInstance,
  setDiscountMethod: (discountMethod: PriceRuleMethod) => void
) => {
  if (value) {
    setDiscountMethod(value);
    const formData = form.getFieldsValue(true);
    const isFixedPriceMethod = value === PriceRuleMethod.FIXED_PRICE;
    const isQuantityMethod = value === PriceRuleMethod.QUANTITY;

    const valueType = isFixedPriceMethod
      ? DiscountUnitType.FIXED_PRICE.value
      : DiscountUnitType.PERCENTAGE.value;
    if (
      (isFixedPriceMethod || isQuantityMethod) &&
      Array.isArray(formData?.entitlements) &&
      formData?.entitlements.length > 0
    ) {
      formData?.entitlements?.forEach((item: EntilementFormModel) => {
        const temp = {
          prerequisite_quantity_ranges: [
            {
              value_type: valueType,
              greater_than_or_equal_to: 1,
              value: 0,
            },
          ],
        };
        _.merge(item, temp);
      });
    } else if (isFixedPriceMethod || isQuantityMethod) {
      formData.entitlements = [
        {
          entitled_category_ids: [],
          entitled_product_ids: [],
          entitled_variant_ids: [],
          prerequisite_variant_ids: [],
          selectedProducts: [],
          prerequisite_quantity_ranges: [
            {
              value_type: valueType,
              greater_than_or_equal_to: 1,
              value: 0,
            },
          ],
        },
      ];
    }
    form.setFieldsValue({
      entitlements: _.cloneDeep(formData?.entitlements),
    });
  }
};
