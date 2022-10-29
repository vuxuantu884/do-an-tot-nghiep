import { FormInstance } from "antd";
import { VariantEntitlementsFileImport } from "model/promotion/price-rules.model";
import { GiftEntitlementForm, GiftProductEntitlements } from "model/promotion/gift.model";
import _ from "lodash";
import { showWarning } from "utils/ToastUtils";

/** Xử lý nhập file các sản phẩm áp dụng chương trình quà tặng */
const insertGiftProduct = (
  currentEntitlementList: Array<GiftEntitlementForm>,
  currentDiscountGroupMap: Map<string, GiftEntitlementForm>,
  isVariant: boolean,
  importItem: VariantEntitlementsFileImport,
  currentProductIdList: Array<number>,
  currentVariantIdList: Array<number>,
) => {
  //Tìm variant sắp thêm xem đã có trong form chưa, nếu có thì xoá đi
  if (isVariant && currentVariantIdList.includes(importItem.variant_id)) {
    currentEntitlementList.forEach((entitlement: GiftEntitlementForm, index: number) => {
      currentEntitlementList[index].selectedProducts = entitlement.selectedProducts?.filter(
        (product: GiftProductEntitlements) => product.variant_id !== importItem.variant_id,
      );

      currentEntitlementList[index].entitled_variant_ids = entitlement.entitled_variant_ids?.filter(
        (variantId: number) => variantId !== importItem.variant_id,
      );
    });
    duplicateProductNumber++;
  } else if (!isVariant && currentProductIdList.includes(importItem.product_id)) {
    //Tìm sản phẩm cha sắp thêm xem đã có trong form chưa, có thì xoá đi
    currentEntitlementList.forEach((entitlement: GiftEntitlementForm, index: number) => {
      currentEntitlementList[index].selectedProducts = entitlement.selectedProducts?.filter(
        (product: GiftProductEntitlements) => product.product_id !== importItem.product_id,
      );

      currentEntitlementList[index].entitled_product_ids = entitlement.entitled_product_ids?.filter(
        (productId: number) => productId !== importItem.product_id,
      );
    });
    duplicateProductNumber++;
  }

  //Kiểm tra giá trị nhóm chiết khấu của sản phẩm import đã trùng với nhóm chiết khấu nào chưa
  // nếu tồn tại giftGroup  => true
  const giftGroup = currentDiscountGroupMap.get(
    JSON.stringify({
      greater_than_or_equal_to: importItem.min_quantity,
    }),
  );

  const itemParseFromFileToDisplay = {
    ...importItem,
    retail_price: importItem.price,
    open_quantity: importItem.quantity,
    variant_title: importItem.variant_title,
    product_id: importItem.product_id,
    sku: isVariant ? importItem.sku : importItem.product_code || "",
  };

  const prerequisite_quantity = {
    greater_than_or_equal_to: importItem.min_quantity,
  };

  if (!giftGroup) {
    // nếu nhóm quà tặng không tồn tại trong danh sách => tạo mới nhóm
    const giftGroup: GiftEntitlementForm = {
      entitled_product_ids: !isVariant ? [importItem.product_id] : [],
      entitled_variant_ids: isVariant ? [importItem.variant_id] : [],
      selectedProducts: [itemParseFromFileToDisplay],
      entitled_gift_ids: [],
      selectedGifts: [],
      prerequisite_quantity_ranges: [{ ...prerequisite_quantity }],
    };

    currentEntitlementList.unshift(giftGroup);
    currentDiscountGroupMap.set(
      JSON.stringify({
        greater_than_or_equal_to: importItem.min_quantity,
      }),
      giftGroup,
    );
  } else {
    // nếu nhóm quà tặng đã tồn tại => thêm sản phẩm vào nhóm quà tặng
    if (isVariant) {
      giftGroup.entitled_variant_ids.unshift(importItem.variant_id);
    } else {
      giftGroup.entitled_product_ids.unshift(importItem.product_id);
    }

    giftGroup.selectedProducts?.unshift(itemParseFromFileToDisplay);
    // thay đổi reference data form để re-render
    giftGroup.selectedProducts = _.cloneDeep(giftGroup.selectedProducts);
  }

  // add product_id và variant_id vào danh sách hiện tại
  if (isVariant) {
    currentVariantIdList.push(importItem.variant_id);
  } else {
    currentProductIdList.push(importItem.product_id);
  }
};
//
let duplicateProductNumber: number;
export const handleImportProductApplyGift = (
  currentEntitlementList: Array<GiftEntitlementForm>,
  productImportedList: Array<VariantEntitlementsFileImport>,
  form: FormInstance,
) => {
  const currentDiscountGroupMap = new Map<string, GiftEntitlementForm>();
  let currentProductIdList: Array<number> = [];
  let currentVariantIdList: Array<number> = [];

  duplicateProductNumber = 0;

  // tạm thời chỉ có 1 nhóm nên fake số lượng tối thiểu sản phẩm import bằng số lượng tối thiểu của nhóm
  let current_greater_than_or_equal_to = 1;

  currentEntitlementList.forEach((item) => {
    const { greater_than_or_equal_to } = item.prerequisite_quantity_ranges[0];
    if (typeof greater_than_or_equal_to === "number") {
      current_greater_than_or_equal_to = greater_than_or_equal_to;
      currentDiscountGroupMap.set(
        JSON.stringify({ greater_than_or_equal_to }),
        item,
      ); //map những nhóm quà tặng => key: số lượng tối thiểu
    }

    // lấy ra danh sách id sản phẩm cha đã tồn tại
    if (Array.isArray(item.entitled_product_ids) && item.entitled_product_ids.length > 0) {
      currentProductIdList = currentProductIdList.concat(item.entitled_product_ids);
    }

    // lấy ra danh sách id variant đã tồn tại
    if (Array.isArray(item.entitled_variant_ids) && item.entitled_variant_ids.length > 0) {
      currentVariantIdList = currentVariantIdList.concat(item.entitled_variant_ids);
    }
  });

  // xỷ lý thêm sản phẩm import vào nhóm quà tặng
  productImportedList.forEach((importItem) => {
    // tạm thời chỉ có 1 nhóm nên fake số lượng tối thiểu sản phẩm import bằng số lượng tối thiểu của nhóm
    // @Todo Thái
    importItem.min_quantity = current_greater_than_or_equal_to;
    // trường variant mới thuộc sản phẩm cha khác thì bỏ qua (ưu tiên sp cha)
    // điều kiện là variant: có cả variant_id và product_id
    const isVariant = Boolean(importItem.variant_id && importItem.product_id);
    insertGiftProduct(
      currentEntitlementList,
      currentDiscountGroupMap,
      isVariant,
      importItem,
      currentProductIdList,
      currentVariantIdList,
    );
  });

  if (duplicateProductNumber > 0) {
    showWarning(`Có ${duplicateProductNumber} sản phẩm đã có trong chương trình.`)
  }

  const cleanEntitlementList = currentEntitlementList.filter(
    (entitlement: GiftEntitlementForm) =>
      entitlement.selectedProducts && entitlement.selectedProducts?.length > 0,
  );
  form.setFieldsValue({ entitlements: cleanEntitlementList });
};
