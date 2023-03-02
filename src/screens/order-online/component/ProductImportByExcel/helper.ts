import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import _ from "lodash";
import { VariantResponse } from "model/product/product.model";
import { OrderLineItemRequest } from "model/request/order.request";
import {
  findAvatar,
  findPriceInVariant,
  findTaxInVariant,
  getLineAmountAfterLineDiscount,
  getLineItemDiscountAmount,
  getLineItemDiscountRate,
  getLineItemDiscountValue,
} from "utils/AppUtils";
import { DISCOUNT_TYPE } from "utils/Constants";

export const FILE_DOWNLOAD =
  "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/import%20s%E1%BA%A3n%20ph%E1%BA%A9m_1669870608977.xlsx";
export const DISCOUNT_TYPES = ["đ", "%"];
export const KEYS_FILE_IMPORT = ["SKU", "Số lượng", "Khuyến mại", "Loại chiết khấu"];

export const ERROR = {
  notFoundRecordInFile: "Không tìm thấy bản ghi nào trong file",
  templateIsNotIncorrectFormat: "Mẫu file sử dụng chưa đúng định dạng, vui lòng sử dụng file mẫu",
  selectFileIsNotIncorrectFormat: "Vui lòng chọn đúng định dạng file excel .xlsx .xls",
  notFoundProduct: "không tìm thấy sản phẩm",
  discountBiggerProductValue: "chiết khấu lớn hơn giá trị sản phẩm",
  dataIsNotCorrect: "dữ liệu chưa chính xác",
  quantityIsGreaterZero: "số lượng cần lớn hơn 0",
  promotionGreaterOrEqualZero: "tiền khuyến mại cần lớn hơn hoặc bằng 0",
};

export const getRowDataImport = (item: any) => {
  return {
    sku: item["SKU"],
    quantity: item["Số lượng"] ?? 0,
    promotion: item["Khuyến mại"] ?? 0,
    discountType: item["Loại chiết khấu"] ?? "",
  };
};

export const isValidTypeOfValueColumn = (json: any) => {
  return !(
    typeof json.sku !== "string" ||
    typeof json.quantity !== "number" ||
    typeof json.promotion !== "number" ||
    typeof json.discountType !== "string" ||
    DISCOUNT_TYPES.indexOf(json.discountType) === -1
  );
};

export const isValidObjKeys = (fileData: any) => {
  if (fileData && fileData.length === 0) return false;

  let result = true;
  for (let i = 0; i < fileData.length; i++) {
    const item: any = fileData[i];
    const objKeys = Object.keys(item);
    if (objKeys.length === 4 && !_.isEqual(objKeys, KEYS_FILE_IMPORT)) {
      result = false;
      break;
    }
  }

  return result;
};

export const isValidDiscountGreaterPrice = (
  variant: VariantResponse,
  discountMoney: number,
  quantity: number,
) => {
  let retail_price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
  return retail_price * quantity >= discountMoney;
};

const isValidPromotionGreaterOrEqualZero = (json: any) => {
  return json.promotion >= 0;
};

const isValidQuantityIsGreaterZero = (json: any) => {
  return json.quantity > 0;
};

export const handleFileExcel = (fileData: any) =>
  new Promise<any>((resolve, reject) => {
    let jsonDatas: any = [];
    let errorDatas: string[] = [];
    if (fileData && fileData.length > 0) {
      for (let i = 0; i < fileData.length; i++) {
        const item: any = fileData[i];
        if (item) {
          const json = getRowDataImport(item);
          jsonDatas.push(json);

          if (!isValidTypeOfValueColumn(json)) {
            errorDatas.push(`Dòng ${i + 2}: ${ERROR.dataIsNotCorrect}`);
          } else {
            if (!isValidQuantityIsGreaterZero(json)) {
              errorDatas.push(`Dòng ${i + 2}: ${ERROR.quantityIsGreaterZero}`);
            }
            if (!isValidPromotionGreaterOrEqualZero(json)) {
              errorDatas.push(`Dòng ${i + 2}: ${ERROR.promotionGreaterOrEqualZero}`);
            }
          }
        }
      }
    }
    resolve({
      errorDatas: errorDatas,
      jsonDatas: jsonDatas,
    });
  });

export const createItem = (
  variant: VariantResponse,
  quantity: number,
  discountType: string,
  discountValue: number,
  position: number,
) => {
  const price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
  const taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
  const amount = price * quantity;
  const avatar = findAvatar(variant.variant_images);
  discountValue = Math.abs(discountValue);

  const newItem: OrderLineItemRequest = {
    //id :null,
    id: new Date().getTime(),
    sku: variant.sku,
    variant_id: variant.id,
    product_id: variant.product.id,
    variant: variant.name,
    variant_barcode: variant.barcode,
    product_type: variant.product.product_type,
    product_code: variant.product.code,
    quantity: quantity,
    price: price,
    amount: amount,
    note: "",
    type: Type.NORMAL,
    variant_image: avatar,
    unit: variant.product.unit,
    weight: variant.weight,
    weight_unit: variant.weight_unit,
    warranty: variant.product.care_labels,
    discount_items: [],
    discount_amount: 0,
    discount_rate: 0,
    composite: variant.composite,
    is_composite: variant.composite,
    discount_value: 0,
    line_amount_after_line_discount: 0,
    product: variant.product.name,
    tax_include: null,
    tax_rate: taxRate,
    show_note: false,
    gifts: [],
    position: position,
    available: variant.available,
    taxable: variant.taxable,
  };

  if (discountType === DISCOUNT_TYPE.PERCENT) {
    discountValue = discountValue <= 100 ? discountValue : 100;
    let amountItem = Math.round(price * quantity * discountValue) / 100;
    newItem.discount_items = [
      {
        value: amountItem / quantity,
        rate: discountValue,
        amount: amountItem,
        reason: "",
      },
    ];
  } else {
    let rate = (discountValue * 100) / quantity / price;
    newItem.discount_items = [
      {
        value: discountValue / quantity,
        rate: rate,
        amount: discountValue,
        reason: "",
      },
    ];
  }

  newItem.discount_value = getLineItemDiscountValue(newItem);
  newItem.discount_amount = getLineItemDiscountAmount(newItem);
  newItem.discount_rate = getLineItemDiscountRate(newItem);
  newItem.line_amount_after_line_discount = getLineAmountAfterLineDiscount(newItem);

  return newItem;
};
