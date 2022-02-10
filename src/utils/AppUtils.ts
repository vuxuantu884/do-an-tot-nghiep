import { UploadFile } from "antd/lib/upload/interface";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { Type } from "config/type.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import _ from "lodash";
import { AccountStoreResponse } from "model/account/account.model";
import { DepartmentResponse, DepartmentView } from "model/account/department.model";
import { CityView, DistrictResponse } from "model/content/district.model";
import { LineItem } from "model/inventory/transfer";
import { RouteMenu } from "model/other";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import {
	ProductRequest,
	ProductRequestView,
	ProductResponse,
	VariantImage,
	VariantPriceRequest,
	VariantPricesResponse,
	VariantPriceViewRequest,
	VariantRequest,
	VariantRequestView,
	VariantResponse,
	VariantUpdateRequest,
	VariantUpdateView
} from "model/product/product.model";
import { SizeDetail, SizeResponse } from "model/product/size.model";
import {
  OrderDiscountRequest,
	OrderLineItemRequest,
	OrderPaymentRequest
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
	FulFillmentResponse,
	// DeliveryServiceResponse,
	OrderLineItemResponse,
	OrderPaymentResponse,
	OrderResponse,
	ReturnProductModel
} from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import { getSourcesWithParamsService } from "service/order/order.service";
import { ErrorGHTK, POS, ShipmentMethod } from "./Constants";
import { ConvertDateToUtc } from "./DateUtils";
import { RegUtil } from "./RegUtils";
import { showError } from "./ToastUtils";

export const isUndefinedOrNull = (variable: any) => {
  if (variable && variable !== null) {
    return false;
  }
  return true;
};

export const findCurrentRoute = (
  routes: Array<RouteMenu> = [],
  path: string = ""
) => {
  let current: Array<string> = [];
  let subMenu: Array<string> = [];
  routes.forEach((route) => {
    if (route.subMenu.length > 0) {
      route.subMenu.forEach((item) => {
        if (item.subMenu.length > 0 && item.showMenuThird) {
          item.subMenu.forEach((item1) => {
            if (path === item1.path) {
              current.push(item1.key);
              subMenu.push(route.key);
              subMenu.push(item.key);
            }
          });
        }
        if (path === item.path) {
          current.push(item.key);
          subMenu.push(route.key);
        }
      });
    }
    if (path === route.path) {
      current.push(route.key);
    }
  });
  let obj = {
    current: current,
    subMenu: subMenu,
  };
  return obj;
};

const checkPath = (p1: string, p2: string, pathIgnore?: Array<string>) => {
  if (p1.includes(":") || p2.includes(":")) {
    if (p1.includes(":")) {
      let urls1 = p1.split("/");
      let urls2 = p2.split("/");
      let index = urls1.findIndex((a) => a.includes(":"));
      if (pathIgnore && pathIgnore.includes(urls2[index])) {
        return false;
      }
      urls1[index] = urls2[index];
      return urls1.join("/") === urls2.join("/");
    }
  }
  if (p2.includes(":")) {
    let urls1 = p2.split("/");
    let urls2 = p1.split("/");
    let index = urls1.findIndex((a) => a.includes(":"));
    if (pathIgnore && pathIgnore.includes(urls2[index])) {
      return false;
    }
    urls1[index] = urls2[index];
    return urls1.join("/") === urls2.join("/");
  }
  return p1 === p2;
};

export const formatSuffixPoint = (point: number | string): string => {
  let format = point.toString();
  //return `${format.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")} điểm`;
  return `${format.replace(RegUtil.SUFIX_POINT, "$1,")}`;
};

export const getListBreadcumb = (
  routes: Array<RouteMenu> = [],
  path: string = ""
) => {
  let result: Array<RouteMenu> = [];
  if (path === "" || path === "/") {
    return result;
  }
  result.push(routes[0]);
  routes.forEach((route) => {
    if (checkPath(route.path, path)) {
      result.push(route);
    } else {
      if (route.subMenu.length > 0) {
        route.subMenu.forEach((route1) => {
          if (checkPath(route1.path, path, route1.pathIgnore)) {
            result.push(route);
            result.push(route1);
          } else {
            if (route1.subMenu.length > 0) {
              route1.subMenu.forEach((route2) => {
                if (checkPath(route2.path, path, route2.pathIgnore)) {
                  result.push(route);
                  result.push(route1);
                  result.push(route2);
                }
              });
            }
          }
        });
      }
    }
  });
  return result;
};

export const convertCategory = (data: Array<CategoryResponse>) => {
  let arr: Array<CategoryView> = [];
  data.forEach((item) => {
    let level = 0;
    let temp = getArrCategory(item, level, null);
    arr = [...arr, ...temp];
  });
  return arr;
};

export const convertDepartment = (data: Array<DepartmentResponse>) => {
  let arr: Array<DepartmentView> = [];
  data.forEach((item) => {
    let level = 0;
    let temp = getArrDepartment(item, level, null);
    arr = [...arr, ...temp];
  });
  return arr;
};

export const getArrCategory = (
  i: CategoryResponse,
  level: number,
  parent: CategoryResponse | null
) => {
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
  });
  if (i.children.length > 0) {
    i.children.forEach((i1) => {
      let c = getArrCategory(i1, level + 1, i);
      arr = [...arr, ...c];
    });
  }
  return arr;
};

export const getArrDepartment = (
  i: DepartmentResponse,
  level: number,
  parent: DepartmentResponse | null
) => {
  let arr: Array<DepartmentView> = [];
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
    address: i.address,
    manager: i.manager,
    manager_code: i.manager_code,
    phone: i.phone,
    level: level,
    parent: parentTemp,
    name: i.name,
  });
  if (i.children.length > 0) {
    i.children.forEach((i1) => {
      let c = getArrDepartment(i1, level + 1, i);
      arr = [...arr, ...c];
    });
  }
  return arr;
};

export const convertSizeResponeToDetail = (size: SizeResponse) => {
  let ids: Array<number> = [];
  size.categories.forEach((category) => ids.push(category.category_id));
  let sizeConvert: SizeDetail = {
    id: size.id,
    created_by: size.created_by,
    created_date: size.created_date,
    created_name: size.created_name,
    updated_by: size.updated_by,
    updated_name: size.updated_name,
    updated_date: size.updated_date,
    version: size.version,
    code: size.code, 
  };
  return sizeConvert;
};

export const formatCurrency = (currency: number | string | boolean, sep: string = ","): string => {
  try {
		if(typeof currency ==="number") {
			currency = Math.round(currency);
		} else if(typeof currency ==="string") {
			currency = Math.round(Number(currency));
		}
    let format = currency.toString();
    return format.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${sep}`);
  } catch (e) {
    return "";
  }
};

export const generateQuery = (obj: any) => {
  if (obj !== undefined) {
    let a: string = Object.keys(obj)
      .map((key, index) => {
        let url = "";
        if (
          obj[key] !== undefined &&
          obj[key] !== null &&
          obj[key] !== "" &&
          obj[key].length !== 0
        ) {
          let value = obj[key];
          if (obj[key] instanceof Array) {
            value = obj[key].join(",");
          }
          if (obj[key] instanceof Date) {
            value = ConvertDateToUtc(obj[key]);
          }
          if (moment.isMoment(obj[key])) {
            value = obj[key].utc().format();
          }
          url = key + "=" + encodeURIComponent(value) + "&";
        }
        return url;
      })
      .join("");
    if (a.charAt(a.length - 1) === "&") {
      a = a.substring(0, a.length - 1);
    }
    return a;
  }
  return "";
};

export const convertDistrict = (data: Array<DistrictResponse>) => {
  let array: Array<CityView> = [];
  data.forEach((item) => {
    let index = array.findIndex((item1) => item1.city_id === item.city_id);
    if (index !== -1) {
      array[index].districts.push({
        id: item.id,
        name: item.name,
        code: item.code,
      });
    } else {
      array.push({
        city_id: item.city_id,
        city_name: item.city_name,
        districts: [
          {
            id: item.id,
            name: item.name,
            code: item.code,
          },
        ],
      });
    }
  });
  return array;
};

export const findPriceInVariant = (
  variantPrices: Array<VariantPricesResponse>,
  currency_code: string
): number => {
  let price: number = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code) {
      price = v.retail_price;
    }
  });
  return price;
};

export const findTaxInVariant = (
  variantPrices: Array<VariantPricesResponse>,
  currency_code: string
): number => {
  let tax: number | null = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code) {
      tax = v.tax_percent;
    }
  });
  return tax;
};

export const findPrice = (
  variantPrices: Array<VariantPricesResponse>,
  currency_code: string
): string => {
  let price: string = "0";
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code) {
      price = v.retail_price.toString();
    }
  });
  return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

export const replaceFormat = (currency: number | string): number => {
  let format = currency.toString();
  return parseInt(format.replace(/,/gi, ""));
};

export const replaceFormatString = (currency: number | string): string => {
  let format = currency.toString();
  return format.replace(/,/gi, "");
};

export const findAvatar = (VariantImage: Array<VariantImage>): string => {
  let avatar: string = "";
  VariantImage.forEach((v) => {
    if (v.variant_avatar) {
      avatar = v.url;
    }
  });
  return avatar;
};

export const haveAccess = (
  storeId: number,
  accountStores: Array<AccountStoreResponse>
): boolean => {
  let isHave = false;
  let accountStoreFilter = accountStores.filter(
    (store: AccountStoreResponse) => store.store_id === storeId
  );
  if (accountStoreFilter.length > 0) {
    return (isHave = true);
  }
  return isHave;
};

export const ListUtil = {
  notEmpty: (a: Array<any> | undefined) => {
    return a !== undefined && a.length >= 0;
  },
};

export const Products = {
  convertVariantPriceViewToRequest: (
    priceView: Array<VariantPriceViewRequest>
  ) => {
    let variant_prices: Array<VariantPriceRequest> = [];
    priceView.forEach((item) => {
      variant_prices.push({
        cost_price: item.cost_price === "" ? null : item.cost_price,
        currency_code: item.currency,
        import_price: item.import_price === "" ? null : item.import_price,
        retail_price: item.retail_price === "" ? null : item.retail_price,
        tax_percent: item.tax_percent === "" ? null : item.tax_percent,
        wholesale_price:
          item.wholesale_price === "" ? null : item.wholesale_price,
      });
    });
    return variant_prices;
  },
  convertProductViewToRequest: (
    pr: ProductRequestView,
    arrVariants: Array<VariantRequestView>,
    status: string
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
        wholesale_price:
          item.wholesale_price === "" ? null : item.wholesale_price,
      });
    });
    arrVariants.forEach((item) => {
      variants.push({
        status: status,
        name: item.name,
        color_id: item.color_id,
        size_id: item.size_id,
        barcode: null,
        taxable: false,
        saleable: pr.saleable,
        deleted: false,
        sku: item.sku,
        width: pr.width,
        height: pr.height,
        length: pr.length,
        length_unit: pr.length_unit,
        weight: pr.weight,
        weight_unit: pr.weight_unit,
        variant_prices: variant_prices,
        variant_images: item.variant_images,
        inventory: 0,
        supplier_id: pr.supplier_id,
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
      supplier_id: pr.supplier_id,
      material_id: pr.material_id,
      material: pr.material,
      collections: pr.product_collections,
    };
    return productRequest;
  },
  findAvatar: (images: Array<VariantImage>): VariantImage | null => {
    let image: VariantImage | null = null;
    images?.forEach((imageRequest) => {
      if (imageRequest.variant_avatar) {
        image = imageRequest;
      }
    });
    return image;
  },
  findPrice: (
    prices: Array<VariantPricesResponse>,
    currency: string
  ): VariantPricesResponse | null => {
    let price: VariantPricesResponse | null = null;
    prices.forEach((priceResponse) => {
      if (priceResponse.currency_code === currency) {
        price = priceResponse;
      }
    });
    return price;
  },
  convertVariantRequestToView: (variant: VariantResponse) => {
    let variantPrices: Array<VariantPriceViewRequest> = [];
    let variantUpdateView: VariantUpdateView = {
      id: variant.id,
      product_id: variant.product_id,
      supplier_id: variant.supplier_id,
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
      variant_prices: variantPrices,
      product: {
        product_type: variant.product.product_type,
        goods: variant.product.goods,
        category_id: variant.product.category_id,
        collections: variant.product.collections.map(
          (i) => i.code
        ),
        tags:
          variant.product.tags !== null ? variant.product.tags.split(";") : [],
        product_unit: variant.product.unit,
        brand: variant.product.brand,
        content: variant.product.content,
        description: variant.product.description,
        designer_code: variant.product.designer_code,
        made_in_id: variant.product.made_in_id,
        merchandiser_code: variant.product.merchandiser_code,
        care_labels: variant.product.care_labels,
        specifications: variant.product.specifications,
        material_id: variant.product.material_id,
      },
      variant_image: null,
    };
    return variantUpdateView;
  },
  convertVariantResponseToRequest: (variant: VariantResponse) => {
    let variantUpadteRequest: VariantUpdateRequest = {
      id: variant.id,
      composite: variant.composite,
      product_id: variant.product_id,
      supplier_id: variant.supplier_id,
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
    return variantUpadteRequest;
  },
  findAvatarProduct: (product: ProductResponse | null) => {
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
  },
  convertAvatarToFileList: (arrImg: Array<VariantImage>) => {
    let arr: Array<UploadFile> = [];
    arrImg?.forEach((item, index) => {
      arr.push({
        uid: item.image_id.toString(),
        name: item.image_id.toString(),
        url: item.url,
        status: "done",
      });
    });
    return arr;
  },
};

export const getAmountPayment = (items: Array<OrderPaymentResponse|OrderPaymentRequest> | null) => {
  let value = 0;
  if (items !== null) {
    if (items.length > 0) {
      items.forEach((a) => (value = value + a.paid_amount));
    }
  }
  return value;
};

export const getAmountPaymentRequest = (
  items: Array<OrderPaymentRequest> | null
) => {
  let value = 0;
  if (items !== null) {
    if (items.length > 0) {
      items.forEach((a) => (value = value + a.paid_amount));
    }
  }
  return value;
};

export const getTotalAmount = (items: Array<OrderLineItemRequest>) => {
  let total = 0;
  items.forEach((a) => {
    if (a.product_type === "normal" || "combo") {
      total = total + a.amount;
    }
  });
  return total;
};

export const getLineItemDiscountValue = (lineItem: OrderLineItemRequest) => {
	let total = 0;
  lineItem.discount_items.forEach((a) => (total = total + a.value));
  return total;
};

export const getLineItemDiscountAmount = (lineItem: OrderLineItemRequest) => {
	let total = 0;
  lineItem.discount_items.forEach((a) => (total = total + a.amount));
  return total;
};

export const getLineItemDiscountRate = (lineItem: OrderLineItemRequest) => {
  return lineItem.discount_value * 100 / lineItem.price ;
};

export const getTotalDiscount = (items: Array<OrderLineItemRequest>) => {
  let total = 0;
  items.forEach((a) => (total = total + a.discount_amount));
  return total;
};

export const getTotalAmountAfterDiscount = (
  items: Array<OrderLineItemRequest>
) => {
  let total = 0;
  items.forEach((a) => (total = total + a.line_amount_after_line_discount));
  return total;
};


export const getLineAmountAfterLineDiscount = (lineItem: OrderLineItemRequest) => {
	return lineItem.amount - lineItem.discount_amount;
};

export const getTotalQuantity = (items: Array<OrderLineItemResponse>) => {
  let total = 0;
  items.forEach((a) => {
		if(a.type !== Type.GIFT) {
			total = total + a.quantity
		}
	});
  return total;
};

export const checkPaymentStatusToShow = (items: OrderResponse) => {
  //tính tổng đã thanh toán
  let value = 0;
  if (items !== null) {
    if (items.payments !== null) {
      if (items.payments.length > 0) {
        items.payments.forEach((a) => (value = value + a.paid_amount));
      }
    }
  }
  if (
    items?.total <= value
  ) {
    return 1; //đã thanh toán
  } else {
    if (value === 0) {
      return -1; //chưa thanh toán
    } else {
      return 0; //thanh toán 1 phần
    }
  }
};

export const checkPaymentStatus = (payments: any, orderAmount: number) => {
  let value = 0;
  if (payments !== null) {
    if (payments !== null) {
      if (payments.length > 0) {
        payments.forEach((a: any) => (value = value + a.paid_amount));
      }
    }
  }
  if (
    value >= orderAmount
  ) {
    return 1; //đã thanh toán
  } else {
    if (value === 0) {
      return -1; //chưa thanh toán
    } else {
      return 0; //thanh toán 1 phần
    }
  }
};

export const SumCOD = (items: OrderResponse) => {
  let cod = 0;
  if (items !== null) {
    if (items.fulfillments) {
      if (items.fulfillments.length > 0) {
        items.fulfillments.forEach((a) => {
          if (a.shipment !== undefined && a.shipment !== null) {
            cod = cod + a.shipment?.cod;
          }
        });
      }
    }
  }

  return cod;
};

//COD + tổng đã thanh toán
export const checkPaymentAll = (items: OrderResponse) => {
  //tính tổng đã thanh toán
  let value = 0;
  if (items !== null) {
    if (items.payments !== null) {
      if (items.payments.length > 0) {
        items.payments.forEach((a) => (value = value + a.paid_amount));
      }
    }
  }

  //tổng cod
  let cod = SumCOD(items);

  let totalPay = value + cod;
  if (items?.total === totalPay) {
    return 1;
  } else {
    return 0;
  }
};

// export const getDateLastPayment = (items: OrderResponse) => {
//   let value: Date | undefined;
//   if (items !== null) {
//     if (items.payments !== null) {
//       if (items.payments.length > 0) {
//         items.payments.forEach((a) => (value = a.created_date));
//       }
//     }
//   }
//   return value;
// };

export const getDateLastPayment = (items: any) => {
  let value: Date | undefined;
  if (items !== null) {
    if (items.length > 0) {
      items.forEach((a: any) => (value = a.created_date));
    }
  }
  return value;
};

//Lấy ra địa chỉ giao hàng mắc định
export const getShippingAddressDefault = (items: CustomerResponse | null) => {
  let objShippingAddress = null;
  if (items !== null) {
    for (let i = 0; i < items.shipping_addresses?.length; i++) {
      if (items.shipping_addresses[i].default) {
        objShippingAddress = items.shipping_addresses[i];
      }
    }
  }
  return objShippingAddress;
};

export const SumWeight = (items?: Array<OrderLineItemRequest>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].quantity;
          break;
        case "kg":
          totalWeight =
            totalWeight + items[i].weight * 1000 * items[i].quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const SumWeightLineItems = (items?: Array<LineItem>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].transfer_quantity;
          break;
        case "kg":
          totalWeight =
            totalWeight + items[i].weight * 1000 * items[i].transfer_quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const SumWeightInventory = (items?: Array<LineItem>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].transfer_quantity;
          break;
        case "kg":
          totalWeight =
            totalWeight + items[i].weight * 1000 * items[i].transfer_quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const SumWeightResponse = (items?: Array<OrderLineItemResponse>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].quantity;
          break;
        case "kg":
          totalWeight =
            totalWeight + items[i].weight * 1000 * items[i].quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const InfoServiceDeliveryDetail = (
  items: Array<any> | null,
  delivery_id: number | null
) => {
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === delivery_id) {
        return items[i].logo;
      }
    }
  }
};

export const CheckShipmentType = (item: OrderResponse) => {
  if (item) {
    if (item.fulfillments) {
      if (item.fulfillments.length > 0) {
        return item.fulfillments[0].shipment?.delivery_service_provider_type;
      }
    }
  }
};

export const TrackingCode = (item: OrderResponse | null) => {
  if (item) {
    if (item.fulfillments) {
      if (item.fulfillments.length > 0) {
        if (item.fulfillments[0].shipment?.pushing_status === "waiting") {
          return ErrorGHTK.WAITTING;
        } else {
          return item.fulfillments[0].shipment?.tracking_code;
        }
      }
    }
  }
};

export const getServiceName = (item: OrderResponse) => {
  if (item) {
    if (item.fulfillments) {
      if (item.fulfillments.length > 0) {
        if (
          item.fulfillments[0].shipment?.delivery_service_provider_type ===
          "external_service"
        ) {
          if (
            item.fulfillments[0].shipment?.delivery_service_provider_id === 1
          ) {
            if (item.fulfillments[0].shipment?.service === "standard") {
              return "Đường bộ";
            } else {
              return "Đường bay";
            }
          } else {
            return "Chuyển phát nhanh PDE";
          }
        }
      }
    }
  }
};

export const scrollAndFocusToDomElement = (element?: HTMLElement) => {
  if (!element) {
    return;
  }
  element.focus();
  const y = element.getBoundingClientRect()?.top + window.pageYOffset + -250;
  window.scrollTo({top: y, behavior: "smooth"});
};

// lấy danh sách sản phẩm đã đổi
export const getListReturnedOrders = (OrderDetail: OrderResponse | null) => {
  if(!OrderDetail) {
    return [];
  }
  if(!OrderDetail?.order_returns || OrderDetail?.order_returns?.length === 0) {
    return []
  }
  let orderReturnItems:OrderLineItemResponse[] = [];

  for (const singleReturn of OrderDetail.order_returns) {
     //xử lý trường hợp 1 sản phẩm có số lượng nhiều đổi trả nhiều lần
     for (const singleReturnItem of singleReturn.items) {
       let index = orderReturnItems.findIndex((item) => item.variant_id === singleReturnItem.variant_id);

       if(index > -1) {
         let duplicatedItem = {...orderReturnItems[index]};
        duplicatedItem.quantity = duplicatedItem.quantity + singleReturnItem.quantity;
        orderReturnItems[index] = duplicatedItem;
       } else {
         orderReturnItems.push(singleReturnItem);
       }

     }
  }
	console.log('orderReturnItems', orderReturnItems)
  return orderReturnItems;
};

// lấy danh sách còn có thể đổi trả
export const getListItemsCanReturn = (OrderDetail: OrderResponse | null) => {
  if(!OrderDetail) {
    return [];
  }
  let result:OrderLineItemResponse[] = [];
	let listReturned = getListReturnedOrders(OrderDetail)
  let orderReturnItems = [...listReturned]
	let _orderReturnItems = orderReturnItems.filter((single)=>single.quantity > 0);
	let newReturnItems = _.cloneDeep(_orderReturnItems);
	let normalItems = _.cloneDeep(OrderDetail.items).filter(item=>item.type !==Type.SERVICE);
  
  for (const singleOrder of normalItems) {
		// trường hợp line item trùng nhau
    let duplicatedItem = newReturnItems.find(single=>single.variant_id === singleOrder.variant_id);
    if(duplicatedItem) {
			let index = newReturnItems.findIndex(single=>single.variant_id === duplicatedItem?.variant_id)
			const quantityLeft = newReturnItems[index].quantity - singleOrder.quantity;
			if(quantityLeft ===0) {
				newReturnItems.splice(index, 1);
			} else if(quantityLeft > 0) {
				newReturnItems[index].quantity = quantityLeft;
				const clone = {...duplicatedItem}
				clone.quantity = quantityLeft;
				clone.id = singleOrder.id;
				// result.push(clone)
			} else {
				singleOrder.quantity = singleOrder.quantity - duplicatedItem.quantity;
				newReturnItems.splice(index, 1);
				result.push(singleOrder);
			}
    } else {
      result.push(singleOrder);
    }
  }
  console.log('result', result)
 return result;
}

// kiểm tra xem đã trả hết hàng chưa
export const checkIfOrderHasReturnedAll = (OrderDetail: OrderResponse | null) => {
  if(!OrderDetail) {
    return false;
  }
  let result = false;
	let abc = getListItemsCanReturn(OrderDetail)
  if(abc.length===0) {
    result = true;
  }
  return result;
}

export const customGroupBy = (array:any, groupBy:any) => {
  let groups = {};
  array.forEach((o: any) => {
    const group:string = groupBy.map((e: any) => `{"${e}": "${o[e]}"}`);
    // @ts-ignore
    groups[group] = groups[group] || [];
    const e = Object.assign({}, o);
    groupBy.forEach((g:string) => {
      // @ts-ignore
      groups[group][g] = e[g];
      delete e[g];
    })
    // @ts-ignore
    groups[group].push(e);
  });
  return Object.keys(groups).map((group) => {
    // @ts-ignore
    const r = {variants: groups[group]};
    groupBy.forEach((b: string) => {
      // @ts-ignore
      r[b] = groups[group][b];
      // @ts-ignore
      delete groups[group][b]
    })
    return r;
  });
};


export const handleDisplayCoupon = (coupon: string, numberCouponCharactersShowedBeforeAndAfter: number = 2) => {
  if(coupon.length > numberCouponCharactersShowedBeforeAndAfter) {
    const firstCharacters = coupon.substring(0,numberCouponCharactersShowedBeforeAndAfter);
    const lastCharacters = coupon.substring(coupon.length - numberCouponCharactersShowedBeforeAndAfter,coupon.length);
    return `${firstCharacters}***${lastCharacters}`;
  } else {
    return `${coupon}***${coupon}`;
  }
};

export const getAccountCodeFromCodeAndName = (text: string | null | undefined) => {
	const splitString = "-"
	let result = null;
	if(text) {
		result = text.split(splitString)[0].trim();
	} 
	return result;
};

export const handleDelayActionWhenInsertTextInSearchInput = (inputRef: React.MutableRefObject<any>, func: (...arg: any) => void|any, delayTime: number = 500) => {
	if (inputRef.current) {
		clearTimeout(inputRef.current);
	}
	inputRef.current = setTimeout(() => {
		func();
	}, delayTime);
};

export const getProductDiscountPerProduct = (product: ReturnProductModel) => {
	let discountPerProduct = 0;
	product.discount_items.forEach((single) => {
		discountPerProduct += single.value;
	});
	return discountPerProduct;
};

export const getProductDiscountPerOrder =  (OrderDetail: OrderResponse | null | undefined , product: ReturnProductModel) => {
	let discountPerOrder = 0;
	let totalDiscountRatePerOrder = 0;
	OrderDetail?.discounts?.forEach((singleOrderDiscount) => {
		if (singleOrderDiscount?.rate) {
			totalDiscountRatePerOrder = totalDiscountRatePerOrder + singleOrderDiscount.rate;
		}
	});
	console.log('totalDiscountRatePerOrder', totalDiscountRatePerOrder);
	product.discount_value = getLineItemDiscountValue(product)
	discountPerOrder =
		(totalDiscountRatePerOrder/100 * (product.price - product.discount_value))
	return discountPerOrder;
}

export const getTotalOrderDiscount =  (discounts: OrderDiscountRequest[] | null) => {
  if(!discounts) {
    return 0;
  }
	let totalDiscount = 0;
	discounts.forEach((singleOrderDiscount) => {
		if (singleOrderDiscount?.amount) {
			totalDiscount = totalDiscount + singleOrderDiscount.amount;
		}
	});
	return totalDiscount;
}


export const totalAmount = (items: Array<OrderLineItemRequest>) => {
		if (!items) {
			return 0;
		}
		let _items = [...items];
		let _amount = 0;

		_items.forEach((i) => {
			let total_discount_items = 0;
			i.discount_items.forEach((d) => {
				total_discount_items = total_discount_items + d.value;
			});
			let amountItem = (i.price - total_discount_items) * i.quantity;
			i.line_amount_after_line_discount = amountItem;
			i.amount = i.price * i.quantity;
			_amount += amountItem;
			if (i.amount !== null) {
				let totalDiscount = 0;
				i.discount_items.forEach((a) => {
					totalDiscount = totalDiscount + a.amount;
				});
				i.discount_amount = totalDiscount;
			}
		});
		// console.log("totalAmount333", _amount);
		return _amount;
}
// check if value is null or undefined
export const isNullOrUndefined = (value: any) => {
  if (value === null || value === undefined) {
    return true;
  } else {
    return false;
  }
};

export const convertActionLogDetailToText = (data?: string, dateFormat: string = "HH:mm DD/MM/YYYY") => {
  const renderAddress = (dataJson: any) => {
    let result = "-";
    let textFullAddress = null;
    let textWard = null;
    let textDistrict = null;
    let textCity = null;
    if(dataJson.shipping_address?.full_address) {
      textFullAddress = dataJson.shipping_address?.full_address;
    }
    if(dataJson.shipping_address?.ward) {
      textWard = `${dataJson.shipping_address?.ward},`;
    }
    if(dataJson.shipping_address?.district) {
      textDistrict = `${dataJson.shipping_address?.district},`;
    }
    if(dataJson.shipping_address?.city) {
      textCity = `${dataJson.shipping_address?.city},`;
    }
    if(dataJson.shipping_address?.full_address || dataJson.shipping_address?.ward || dataJson.shipping_address?.district || dataJson.shipping_address?.city) {
      result = `${textFullAddress} ${textWard} ${textDistrict} ${textCity}`
    }
    return result;
  };
	const renderShipmentMethod = (dataJson: any) => {
		let result = "-";
    if(dataJson.fulfillments) {
      const sortedFulfillments = dataJson?.fulfillments?.sort((a:FulFillmentResponse, b:FulFillmentResponse) =>
        moment(b?.updated_date).diff(moment(a?.updated_date))
      );
      switch (sortedFulfillments[0]?.shipment?.delivery_service_provider_type) {
        case ShipmentMethod.EMPLOYEE:
          result = `Tự giao hàng - ${sortedFulfillments[0]?.shipment?.shipper_code} - ${sortedFulfillments[0]?.shipment.shipper_name}` 
          break;
        case ShipmentMethod.EXTERNAL_SERVICE:
          result = `Hãng vận chuyển - ${sortedFulfillments[0]?.shipment?.delivery_service_provider_name}` 
          break;
        case ShipmentMethod.EXTERNAL_SHIPPER:
          result = `Tự giao hàng - ${sortedFulfillments[0]?.shipment.shipper_code} - ${sortedFulfillments[0]?.shipment.shipper_name}`
          break;
        case ShipmentMethod.PICK_AT_STORE:
          result = "Nhận tại cửa hàng"
          break;
        case ShipmentMethod.SHOPEE:
          result = "Shopee"
          break;
        default:
          break;
      }
    }
		return result
	};
	let result = "";
	if (data) {
		let dataJson = JSON.parse(data);
		result = `
		<span style="color:red">Thông tin đơn hàng: </span><br/> 
		- Nhân viên: ${dataJson?.created_name || "-"}<br/>
		- Trạng thái : ${dataJson?.status_after || "-"}<br/>
		- Nguồn : ${dataJson?.source || "-"}<br/>
		- Cửa hàng : ${dataJson?.store || "-"}<br/>
		- Địa chỉ cửa hàng : ${dataJson?.store_full_address}<br/>
		- Thời gian: ${dataJson?.updated_date ? moment(dataJson?.updated_date).format(dateFormat) : "-"}<br/>
		- Ghi chú: ${dataJson?.note || "-"} <br/>
		<br/>
		<span style="color:red">Sản phẩm: </span><br/> 
		${dataJson?.items
			.map((singleItem: any, index: any) => {
				return `
		- Sản phẩm ${index + 1}: ${singleItem?.product} <br/>
			+ Đơn giá: ${singleItem?.price} <br/>
			+ Số lượng: ${singleItem?.quantity} <br/>
			+ Thuế : ${singleItem?.tax_rate || 0} <br/>
			+ Chiết khấu sản phẩm: ${singleItem?.discount_value || 0} <br/>
			+ Thành tiền: ${singleItem?.amount} <br/>
			`;
			})
			.join("<br/>")}
		<br/>
		<span style="color:red">Phiếu đóng gói: </span><br/> 
		- Địa chỉ giao hàng: ${renderAddress(dataJson)} <br/>
		- Địa chỉ nhận hóa đơn: ${renderAddress(dataJson)} <br/>
		- Phương thức giao hàng: ${renderShipmentMethod(dataJson)} <br/>
		- Trạng thái: ${dataJson?.fulfillments ? dataJson?.fulfillments[0]?.status : "-"} <br/>
		<br/>
		<span style="color:red">Thanh toán: </span><br/>  
		${
			(!(dataJson?.payments?.length > 0))
				? `- Chưa thanh toán`
				: dataJson?.payments && dataJson?.payments
						.map((singlePayment: any, index: number) => {
							return `
							- ${singlePayment?.payment_method}: ${singlePayment?.paid_amount}
						`;
						})
						.join("<br/>")
		}
		`;
	}
	return result;
};

/**
* utils to remove all XSS  attacks potential
* @param
{
    String
}
html
* @return
{
    Object
}
*/
export const safeContent = (html: any) => {
  if(!html) return html
  const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  //Removing the <script> tags
  while (SCRIPT_REGEX.test(html)) {
    html = html.replace(SCRIPT_REGEX, "");
  }

  //Removing all events from tags...
  html = html.replace(/ on\w+="[^"]*"/g, "");

  return {
    __html: html,
  };
};

export const isFetchApiSuccessful = (response:BaseResponse<any>) => {
	switch (response.code) {
		case HttpStatus.SUCCESS:
			return true;
		default:
			return false;
	}
};

export function handleFetchApiError(response: BaseResponse<any>, textApiInformation: string, dispatch: any) {
  switch (response.code) {
    case HttpStatus.UNAUTHORIZED:
      dispatch(unauthorizedAction());
      break;
    case HttpStatus.FORBIDDEN:
      showError(`${textApiInformation}: ${response.message}`);
      break;
    default:
      response.errors.forEach((e:any) => showError(e));
      break;
  }
}

export async function sortSources(orderSources: SourceResponse[], departmentIds: number[] | null) {
	let result = orderSources;
	let departmentSources:SourceResponse[] = [];
	if(departmentIds && departmentIds.length > 0) {
		for (const departmentId of departmentIds) {
			const query = {
				department_id: departmentId,
			}
			try {
				let response = await getSourcesWithParamsService(query);
				if(response.data.items) {
					for (const item of response.data.items) {
						let index = departmentSources.findIndex(single => single.id ===item.id);
						if(index === -1) {
							departmentSources.push(item)
						}
					}
				}
				
			} catch (error) {
				console.log('error', error)
			}
		}
	} 
	if(departmentSources.length > 0) {
		result = [...departmentSources]
	}
	return result;
}

export const isOrderFromPOS = (OrderDetail: OrderResponse | null) => {
	if(OrderDetail?.channel_id === POS.channel_id) {
		return true;
	}
	return false;
};

/**
 * Ẩn kí tự
 * value: ki tu can dua vao
 * length: số kí tự muốn hiển thị
 * lastLength: số kí tự cuối muốn hiện thị
 */
export const splitEllipsis=(value:string,length:number,lastLength:number):string=>{

  if(value.length<=length)
    return value;
  let strLength=value.length-(value.length-length+7);// tổng số kí tự cần lấy

  let strFirst = value.substring(0,strLength - lastLength);//lấy kí tự đầu
  let strLast=value.substring(value.length-lastLength,value.length);//lấy kí tự cuối

  return `${strFirst} [...] ${strLast}`;
};