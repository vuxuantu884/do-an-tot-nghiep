import { formatCurrency, isNullOrUndefined } from "./../../utils/AppUtils";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import {
  ProductRequest,
  ProductRequestView,
  ProductResponse,
  VariantImage,
  VariantPriceRequest,
  VariantPricesResponse,
  VariantRequest,
  VariantRequestView,
  VariantResponse,
  VariantUpdateRequest,
} from "model/product/product.model";
import { cloneDeep } from "lodash";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import { splitEllipsis } from "utils/AppUtils";
import { FormInstance, Upload } from "antd";
import { MaterialResponse } from "model/product/material.model";
import { SizePriority } from "model/product/size.model";
import { RegUtil } from "utils/RegUtils";
import { showWarning } from "utils/ToastUtils";
import { CompareObject } from "utils/CompareObject";
import { careInformationByTitle } from "./component/CareInformation/CareValues";

const URL_TEMPLATE =
  "https://yody-prd-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock_67f18ffe-23a3-4a67-b8f7-9a09bc6d0e36_original.xlsx";
const URL_IMPORT_PRODUCT_TEMPLATE =
  "https://yody-prd-media.s3.ap-southeast-1.amazonaws.com/yody-file/product-import_cd692c40-5818-4d7b-b259-01a47c3b0275_original.xlsx";

const START_PROCESS_PERCENT = 0;
const FINISH_PROCESS_PERCENT = 100;

enum ProductResponseStatuses {
  SUCCESS = "SUCCESS",
}

enum ProgressStatuses {
  NORMAL = "normal",
  ACTIVE = "active",
  SUCCESS = "success",
  EXCEPTION = "exception",
}

enum ImportResponseStatuses {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

enum ConExportImport {
  IMPORT = "IMPORT_CREATE_PRODUCT",
  UPDATE = "IMPORT_UPDATE_VARIANT",
  UPDATE_PRODUCT = "IMPORT_UPDATE_PRODUCT",
}

enum ProductDetailTabName {
  HISTORY = "history",
  INVENTORY = "inventory",
  ADVERTISING_HISTORY = "advertising history",
}

enum EInventoryStatus {
  COMMITTED = "committed",
  ON_HOLD = "on_hold",
  IN_COMING = "in_coming",
  TRANSFERRING = "transferring",
  ON_WAY = "on_way",
}

enum ProductHistoryDocumentTypes {
  PURCHASE_ORDER = "purchase_order",
  ORDER = "order",
  RETURN_ORDER = "return_order",
  RETURN_PO = "return_po",
  INVENTORY_TRANSFER = "inventory_transfer",
  INVENTORY_ADJUSTMENT = "inventory_adjustment",
  OTHER_STOCK_IN_OUT = "other_stock_in_out",
}

const DOCUMENT_TYPES = [
  {
    name: "Nhà cung cấp",
    value: "purchase_order",
  },
  {
    name: "Chuyển hàng",
    value: "inventory_transfer",
  },
  {
    name: "Đơn bán hàng",
    value: "order",
  },
  {
    name: "Đơn trả hàng",
    value: "return_order",
  },
  {
    name: "Kiểm kho",
    value: "inventory_adjustment",
  },
];

const PRODUCT_ACTION_TYPES = [
  "ADD_PRODUCT",
  "UPDATE_PRODUCT",
  "DELETE_PRODUCT",
  "UPDATE_PRODUCT_STATUS",
];

const ArrDefects = [
  { code: "L10", name: "Lỗi 10%", value: 10, isSpecial: 1 },
  { code: "L20", name: "Lỗi 20%", value: 20, isSpecial: 1 },
  { code: "L30", name: "Lỗi 30%", value: 30, isSpecial: 1 },
  { code: "L50", name: "Lỗi 50%", value: 50, isSpecial: 1 },
  { code: "L15", name: "Lỗi 15%", value: 15, isSpecial: 0 },
  { code: "L25", name: "Lỗi 25%", value: 25, isSpecial: 0 },
  { code: "L35", name: "Lỗi 35%", value: 35, isSpecial: 0 },
  { code: "L40", name: "Lỗi 40%", value: 40, isSpecial: 0 },
  { code: "L45", name: "Lỗi 45%", value: 45, isSpecial: 0 },
  { code: "L55", name: "Lỗi 55%", value: 55, isSpecial: 0 },
  { code: "L60", name: "Lỗi 60%", value: 60, isSpecial: 0 },
  { code: "L65", name: "Lỗi 65%", value: 65, isSpecial: 0 },
  { code: "L70", name: "Lỗi 70%", value: 70, isSpecial: 0 },
  { code: "L75", name: "Lỗi 75%", value: 75, isSpecial: 0 },
  { code: "L80", name: "Lỗi 80%", value: 80, isSpecial: 0 },
  { code: "L85", name: "Lỗi 85%", value: 85, isSpecial: 0 },
  { code: "L90", name: "Lỗi 90%", value: 90, isSpecial: 0 },
  { code: "L95", name: "Lỗi 95%", value: 95, isSpecial: 0 },
];

const ACTIONS_INDEX = {
  PRINT_BAR_CODE: 2,
  ACTIVE: 3,
  INACTIVE: 4,
  DELETE: 5,
};

const ACTIONS_INDEX_TAB_PRODUCT = {
  EXPORT_EXCEL: 1,
  PRINT_BAR_CODE: 2,
  ACTIVE: 3,
  INACTIVE: 4,
  DELETE: 5,
};

const HISTORY_PRICE_PRODUCT_TYPES = ["ADD_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT"];

const ProductField = {
  goods: "goods",
  category_id: "category_id",
  collections: "collections",
  product_collections: "product_collections",
  code: "code",
  name: "name",
  width: "width",
  height: "height",
  length: "length",
  length_unit: "length_unit",
  weight: "weight",
  weight_unit: "weight_unit",
  tags: "tags",
  brand: "brand",
  unit: "unit",
  content: "content",
  description: "description",
  designer_code: "designer_code",
  made_in_id: "made_in_id",
  merchandiser_code: "merchandiser_code",
  care_labels: "care_labels",
  specifications: "specifications",
  status: "status",
  saleable: "saleable",
  variant_prices: "variant_prices",
  retail_price: "retail_price",
  currency: "currency",
  import_price: "import_price",
  wholesale_price: "wholesale_price",
  cost_price: "cost_price",
  tax_percent: "tax_percent",
  material_id: "material_id",
  suppliers: "suppliers",
  material: "material",
  component: "component",
  advantages: "advantages",
  defect: "defect",
  taxable: "taxable",
  variants: "variants",
};

const getArrCategory = (i: CategoryResponse, level: number, parent: CategoryResponse | null) => {
  let arr: Array<CategoryView> = [];
  let parentTemp = null;
  if (parent !== null) {
    parentTemp = {
      id: parent.id,
      name: parent.name,
    };
  }
  arr.push({
    id: i.id,
    created_by: i.created_by,
    created_date: i.created_date,
    created_name: i.created_name,
    updated_by: i.updated_by,
    updated_name: i.updated_name,
    updated_date: i.updated_date,
    version: i.version,
    code: i.code,
    goods_name: i.goods_name,
    goods: i.goods,
    level: level,
    parent: parentTemp,
    name: i.name,
    child_ids: i.child_ids,
    isHaveChild: i.children.length > 0,
  });
  if (i.children.length > 0) {
    i.children.forEach((i1) => {
      let c = getArrCategory(i1, level + 1, i);
      arr = [...arr, ...c];
    });
  }
  return arr;
};

const convertCategory = (data: Array<CategoryResponse>) => {
  let arr: Array<CategoryView> = [];
  data.forEach((item) => {
    let level = 1;
    let temp = getArrCategory(item, level, null);
    arr = [...arr, ...temp];
  });
  return arr;
};

const formatCurrencyForProduct = (
  currency: number | string | boolean,
  sep: string = ".",
): string => {
  try {
    if (currency === null || currency === undefined || currency === "") return "";

    if (typeof currency === "number") {
      currency = Math.round(currency);
    } else if (typeof currency === "string") {
      currency = Math.round(Number(currency));
    }
    let format = currency.toString();
    return format.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${sep}`);
  } catch (e) {
    return "";
  }
};

const convertProductViewToRequest = (
  pr: ProductRequestView,
  arrVariants: Array<VariantRequestView>,
  status: string,
) => {
  let variants: Array<VariantRequest> = [];
  let variant_prices: Array<VariantPriceRequest> = [];

  pr.variant_prices.forEach((item) => {
    variant_prices.push({
      cost_price: item.cost_price === "" ? null : item.cost_price,
      currency_code: item.currency,
      import_price: item.import_price === "" ? null : item.import_price,
      retail_price: item.retail_price === "" ? null : item.retail_price,
      tax_percent: item.tax_percent === "" ? null : item.tax_percent,
      wholesale_price: item.wholesale_price === "" ? null : item.wholesale_price,
    });
  });

  arrVariants.forEach((item) => {
    item.type = 0;
    let vp = cloneDeep(variant_prices);
    if (ArrDefects.find((e) => item.sku.indexOf(e.code) !== -1)) {
      item.type = 1;
    }
    if (item.defect_code) {
      item.type = 1;
      vp.forEach((itemPrice) => {
        const valueDefect = ArrDefects.find((e: any) => e.code === item.defect_code)?.value;
        if (!valueDefect) return;
        if (itemPrice.retail_price !== null)
          itemPrice.retail_price = parseFloat(
            ((itemPrice.retail_price * (100 - valueDefect)) / 100).toFixed(2),
          );
        if (itemPrice.cost_price !== null)
          itemPrice.cost_price = parseFloat(
            ((itemPrice.cost_price * (100 - valueDefect)) / 100).toFixed(2),
          );
        if (itemPrice.import_price !== null)
          itemPrice.import_price = parseFloat(
            ((itemPrice.import_price * (100 - valueDefect)) / 100).toFixed(2),
          );
        if (itemPrice.wholesale_price !== null)
          itemPrice.wholesale_price = parseFloat(
            ((itemPrice.wholesale_price * (100 - valueDefect)) / 100).toFixed(2),
          );
      });
    }

    variants.push({
      type: item.type,
      status: status,
      name: item.name,
      color_id: item.color_id,
      size_id: item.size_id,
      barcode: null,
      taxable: pr.taxable,
      saleable: item.saleable ?? pr.saleable,
      deleted: false,
      sku: item.sku,
      width: pr.width,
      height: pr.height,
      length: pr.length,
      length_unit: pr.length_unit,
      weight: pr.weight,
      weight_unit: pr.weight_unit,
      variant_prices: [...vp],
      variant_images: item.variant_images,
      inventory: 0,
      supplier_ids: pr.suppliers,
      suppliers: pr.suppliers,
    });
  });

  let productRequest: ProductRequest = {
    brand: pr.brand,
    category_id: pr.category_id,
    code: pr.code,
    content: pr.content,
    description: pr.description,
    designer_code: pr.designer_code,
    goods: pr.goods,
    made_in_id: pr.made_in_id,
    merchandiser_code: pr.merchandiser_code,
    name: pr.name,
    care_labels: pr.care_labels,
    specifications: pr.specifications,
    product_type: pr.product_type ? pr.product_type : "",
    status: status,
    tags: pr.tags,
    variants: variants,
    unit: pr.unit,
    suppliers: pr.suppliers,
    material_id: pr.material_id,
    material: pr.material,
    collections: pr.product_collections,
    component: pr.component,
    advantages: pr.advantages,
    defect: pr.defect,
  };
  return productRequest;
};

const findAvatar = (images: Array<VariantImage>): VariantImage | null => {
  let image: VariantImage | null = null;
  images?.forEach((imageRequest) => {
    if (imageRequest.variant_avatar) {
      image = imageRequest;
    }
  });
  return image;
};

const findPrice = (
  prices: Array<VariantPricesResponse>,
  currency: string,
): VariantPricesResponse | null => {
  let price: VariantPricesResponse | null = null;
  prices?.forEach((priceResponse) => {
    if (priceResponse.currency_code === currency) {
      price = priceResponse;
    }
  });
  return price;
};
const convertVariantResponseToRequest = (variant: VariantResponse) => {
  let variantUpdateRequest: VariantUpdateRequest = {
    id: variant.id,
    composite: variant.composite,
    product_id: variant.product_id,
    supplier_ids: variant.supplier_ids,
    status: variant.status,
    name: variant.name,
    color_id: variant.color_id,
    size_id: variant.size_id,
    barcode: variant.barcode,
    taxable: variant.taxable,
    saleable: variant.saleable,
    deleted: false,
    sku: variant.sku,
    width: variant.width,
    height: variant.height,
    length: variant.length,
    length_unit: variant.length_unit,
    weight: variant.weight,
    weight_unit: variant.weight_unit,
    variant_prices: variant.variant_prices,
    variant_images: variant.variant_images,
  };
  return variantUpdateRequest;
};

const findAvatarProduct = (product: ProductResponse | null) => {
  let avatar = null;
  if (product) {
    product.variants?.forEach((variant) => {
      variant.variant_images?.forEach((variantImage) => {
        if (variantImage.product_avatar) {
          avatar = variantImage.url;
        }
      });
    }, []);
  }
  return avatar;
};

const convertAvatarToFileList = (arrImg: Array<VariantImage>) => {
  let arr: Array<UploadFile> = [];
  arrImg?.forEach((item) => {
    arr.push({
      uid: item.image_id.toString(),
      name: item.image_id.toString(),
      url: item.url,
      status: "done",
    });
  });
  return arr;
};

const convertVariantPrices = (variants: Array<VariantResponse>, variantActive: VariantResponse) => {
  variants.forEach((item) => {
    const variantDefect = ArrDefects.find((e) => item.sku.indexOf(e.code) !== -1);

    item.variant_prices.forEach((e) => {
      if (e.retail_price !== null) {
        const retailPriceActive = variantActive.variant_prices[0]?.retail_price ?? 0;

        e.retail_price = retailPriceActive;
        if (variantDefect) {
          e.retail_price = parseFloat(
            ((retailPriceActive * (100 - variantDefect.value)) / 100).toFixed(2),
          );
        }
        e.currency_code = variantActive.variant_prices[0].currency_code;
        e.currency_symbol = variantActive.variant_prices[0].currency_symbol;
      }
    });
  });
  return variants;
};

const ellipseName = (str: string | undefined) => {
  if (!str) {
    return "";
  }
  let strName = str.trim();
  strName =
    window.screen.width >= 1920
      ? splitEllipsis(strName, 100, 30)
      : window.screen.width >= 1600
      ? splitEllipsis(strName, 60, 30)
      : window.screen.width >= 1366
      ? splitEllipsis(strName, 47, 30)
      : strName;
  return strName;
};

const handleChangeMaterial = (material: MaterialResponse | false, form: FormInstance) => {
  if (material) {
    let description = form.getFieldValue("description");

    const formatDescription = `<p>
    <span style="color: rgb(34, 34, 34)">Thành phần: </span>
      <strong style="background-color: transparent">${material.component}</strong>
    </p>
    <p>
      <span style="color: rgb(34, 34, 34)">Ưu điểm: </span>
      <strong style="background-color: transparent">${material.advantages}</strong>
    </p>
    <p>
      <span style="color: rgb(34, 34, 34)">Khuyến cáo: </span>
      <strong style="background-color: transparent">${material.defect}</strong>
    </p>
    <p><br/></p>
    `;
    description = formatDescription;
    form.setFieldsValue({
      description: description,
      material: material.name,
      component: material.component,
      advantages: material.advantages,
      defect: material.defect,
    });
  }
};

const findPathTreeById = (object: any, targetId: number) => {
  if (object.id === targetId) return [targetId];
  if (!object.children) return false;
  let path;
  object.children.find((o: any) => (path = findPathTreeById(o, targetId)));
  if (path) {
    return [object.id].concat(path);
  }
};

const getFirstProductAvatarByVariantResponse = (variants: Array<VariantResponse>) => {
  let isFind = false;
  let variantAvatarIndex = 0;
  const FIRST_VARIANT_IMAGE_INDEX = 0;

  const revertVariants = variants.reverse();
  //check existed product avatar, if not => set first variant image for product avatar
  revertVariants.forEach((item, i) => {
    if (item.saleable && !isFind) {
      item.variant_images.forEach((item) => {
        if (!isFind) {
          if (item.product_avatar) {
            isFind = true;
          } else {
            variantAvatarIndex = i;
          }
        }
      });
    }
  });

  if (!isFind && revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX]) {
    //reset product avatar
    revertVariants.forEach((item) => {
      item.variant_images.forEach((item) => {
        item.product_avatar = false;
      });
    });

    //set product avatar
    if (revertVariants[variantAvatarIndex].saleable)
      revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX].product_avatar =
        true;
  }

  return revertVariants.reverse();
};

const sizePriority: Array<SizePriority> = [
  {
    size: "XS",
    priority: 1,
  },
  {
    size: "S",
    priority: 2,
  },
  {
    size: "M",
    priority: 3,
  },
  {
    size: "L",
    priority: 4,
  },
  {
    size: "XL",
    priority: 5,
  },
  {
    size: "2XL",
    priority: 6,
  },
  {
    size: "3XL",
    priority: 7,
  },
  {
    size: "4XL",
    priority: 8,
  },
];

const compareSizeNumber = (a: number, b: number, sortTypeValue: number): number => {
  return (a - b) * sortTypeValue;
};

const compareSizeStringAndNumber = (sortTypeValue: number): number => {
  /**
   * hiển thị size chữ rồi đến size số
   */
  return sortTypeValue * -1;
};

const compareSizeNumberAndString = (sortTypeValue: number): number => {
  return sortTypeValue;
};

const sortSizeProduct = (
  firstSize: string | number,
  secondSize: string | number,
  sortType: "desc" | "asc",
  unknowSizePriority?: number,
): number => {
  const sortTypeValue = sortType === "asc" ? 1 : -1;
  const unknowSizePriorityValue = typeof unknowSizePriority !== "number" ? 999 : unknowSizePriority; // size nào lạ thì ưu tiên cao hơn => đẩy về sau
  if (Number(firstSize) && Number(secondSize)) {
    return compareSizeNumber(Number(firstSize), Number(secondSize), sortTypeValue);
  }

  /**
   * case size : "m/l" "m-l" "10-11" "10/11"
   */
  const regexMultisize = /\s*(?:-|\/)\s*/;
  const firstSizesSplit = firstSize.toString().split(regexMultisize)[0];
  const secondSizeSplit = secondSize.toString().split(regexMultisize)[0];

  if (Number(firstSizesSplit) && Number(secondSizeSplit)) {
    return compareSizeNumber(Number(firstSizesSplit), Number(secondSizeSplit), sortTypeValue);
  }

  if (typeof firstSizesSplit === "string" && Number(secondSizeSplit)) {
    return compareSizeStringAndNumber(sortTypeValue);
  }

  if (Number(firstSizesSplit) && typeof secondSizeSplit === "string") {
    return compareSizeNumberAndString(sortTypeValue);
  }

  if (typeof firstSizesSplit === "string" && typeof secondSizeSplit === "string") {
    const firstSizePriority =
      sizePriority.find(
        (item: SizePriority) =>
          item.size.toString().toLowerCase() === firstSizesSplit.toLowerCase(),
      )?.priority || unknowSizePriorityValue;

    const secondSizePriority =
      sizePriority.find(
        (item: SizePriority) =>
          item.size.toString().toLowerCase() === secondSizeSplit.toLowerCase(),
      )?.priority || unknowSizePriorityValue;

    return (firstSizePriority - secondSizePriority) * sortTypeValue;
  }

  return 0;
};

interface validateReturnType {
  errors?: string[];
  value?: string;
}

// Material

/**
 * Eg. "23.3456" => 7 - 2 = 5
 */
const distanceBetweenDotAndStringLength = 4;

/**
 *
 * @param value takes an input as floating point number.
 * If input contains letters other than ASCII digits and dot (.), returns error
 * If the input is natural number, returns that number
 * If the input is floating point number, rounds it up to 3 decimal digits then returns it.
 */
const validateNumberValue = (value: string): validateReturnType => {
  if (!RegUtil.FLOATREG.test(value)) {
    return { errors: ["Bạn vui lòng nhập vào một số"], value: "" };
  }

  const dotIndex = value.indexOf(".");
  if (dotIndex === -1 || value.length - dotIndex < distanceBetweenDotAndStringLength) {
    // natural number || floating pointer number but has less than 3 decimal places
    return { value };
  }

  return { value: parseFloat(value).toFixed(3) };
};

const checkFile = (file: any, type: string, mess: boolean = false) => {
  let check = true;
  switch (type) {
    case "video":
      const isVideo = file.type === "video/mp4";
      if (!isVideo) {
        mess && showWarning("Vui lòng chọn đúng định dạng mp4");
        check = false;
        break;
      }
      check = file.size / 1024 / 1024 < 500;
      if (!check) {
        mess && showWarning("Cần chọn file nhỏ hơn 500mb");
        check = false;
        break;
      }
      break;
    case "img":
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
      if (!isJpgOrPng) {
        mess && showWarning("Vui lòng chọn đúng định dạng file JPG, PNG, JPEG");
        check = false;
        break;
      }
      check = file.size / 1024 / 1024 < 3;
      if (!check) {
        mess && showWarning("Cần chọn file nhỏ hơn 10mb");
        check = false;
        break;
      }
      break;
    default:
      break;
  }

  return check;
};

const backAction = (
  formValues: any,
  data: any,
  setModalConfirm: any,
  history: any,
  path: String,
) => {
  if (!CompareObject(formValues, data)) {
    setModalConfirm({
      visible: true,
      onCancel: () => {
        setModalConfirm({ visible: false });
      },
      onOk: () => {
        setModalConfirm({ visible: false });
        history.push(path);
      },
      title: "Bạn có muốn quay lại?",
      subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
    });
  } else {
    history.push(path);
  }
};

const convertLabelSelected = (itemSelected: string[]) => {
  let careLabels: any[] = [];

  itemSelected.forEach((value: string) => {
    careInformationByTitle.forEach((info) => {
      info.forEach((item: any) => {
        if (value === item.value) {
          careLabels.push({
            ...item,
            active: true,
          });
        }
      });
    });
  });

  return careLabels;
};

const beforeUploadImage = (file: RcFile, maxFileSize: number) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    showWarning("Vui lòng chọn đúng định dạng file JPG, PNG");
  }
  const isSatisfyCondition = file.size / 1024 / 1024 < maxFileSize;
  if (!isSatisfyCondition) {
    showWarning(`Cần chọn ảnh nhỏ hơn ${maxFileSize}mb`);
  }
  return isJpgOrPng && isSatisfyCondition ? true : Upload.LIST_IGNORE;
};

const formatPriceWithCurrency = (price: number | null, currency: string = "") => {
  if (isNullOrUndefined(price)) return "";
  return formatCurrency(price ?? 0) + " " + currency;
};

export {
  ArrDefects,
  DOCUMENT_TYPES,
  ACTIONS_INDEX,
  ACTIONS_INDEX_TAB_PRODUCT,
  HISTORY_PRICE_PRODUCT_TYPES,
  URL_TEMPLATE,
  URL_IMPORT_PRODUCT_TEMPLATE,
  START_PROCESS_PERCENT,
  FINISH_PROCESS_PERCENT,
  PRODUCT_ACTION_TYPES,
  ProductField,
  ProgressStatuses,
  ConExportImport,
  ProductDetailTabName,
  ProductResponseStatuses,
  ImportResponseStatuses,
  EInventoryStatus,
  ProductHistoryDocumentTypes,
  getArrCategory,
  convertCategory,
  formatCurrencyForProduct,
  convertProductViewToRequest,
  convertAvatarToFileList,
  findAvatarProduct,
  convertVariantResponseToRequest,
  findAvatar,
  findPrice,
  convertVariantPrices,
  ellipseName,
  findPathTreeById,
  getFirstProductAvatarByVariantResponse,
  compareSizeNumber,
  compareSizeNumberAndString,
  handleChangeMaterial,
  compareSizeStringAndNumber,
  sortSizeProduct,
  validateNumberValue,
  checkFile,
  backAction,
  convertLabelSelected,
  beforeUploadImage,
  formatPriceWithCurrency,
};
