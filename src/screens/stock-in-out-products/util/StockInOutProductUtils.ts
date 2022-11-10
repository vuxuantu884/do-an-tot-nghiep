import { StockInOutItemsOther } from "model/stock-in-out-other";
import { VariantResponse } from "model/product/product.model";
import { isNullOrUndefined, Products } from "utils/AppUtils";

const StockInOutProductUtils = {
  convertVariantToStockInOutItem: (
    variants: Array<VariantResponse>,
    policyPriceType: string,
  ): Array<StockInOutItemsOther> => {
    let result: Array<StockInOutItemsOther> = [];
    variants.forEach((variant) => {
      // let price_response = Products.findPrice(
      //   variant.variant_prices,
      //   AppConfig.currency
      // );
      let variant_image = Products.findAvatar(variant.variant_images);
      // let price = price_response !== null ? price_response.import_price : 0;
      const retailPrice = variant.variant_prices[0].retail_price;
      const costPrice = variant.variant_prices[0].cost_price;
      const wholeSalePrice = variant.variant_prices[0].wholesale_price;
      const importPrice = variant.variant_prices[0].import_price;
      let newItem: StockInOutItemsOther = {
        sku: variant.sku,
        barcode: variant.barcode,
        variant_id: variant.id,
        product_id: variant.product_id,
        product: variant.product.name,
        variant_name: variant.name,
        quantity: 1,
        amount: variant.variant_prices[0][policyPriceType],
        variant_image: variant_image !== null ? variant_image.url : null,
        unit: variant.product.unit,
        receipt_quantity: 0,
        policy_price: policyPriceType,
        retail_price: retailPrice,
        cost_price: costPrice,
        wholesale_price: wholeSalePrice,
        import_price: importPrice,
      };
      result.push(newItem);
    });
    return result;
  },
  addProduct: (
    oldItems: Array<StockInOutItemsOther>,
    newItems: Array<StockInOutItemsOther>,
    policyPriceType: string,
    type: string,
  ) => {
    newItems.forEach((item) => {
      let index = oldItems.findIndex((oldItem) => oldItem.sku === item.sku);
      if (index === -1) {
        oldItems.unshift(item);
      } else {
        let oldItem = oldItems[index];
        let newQuantity = oldItem.quantity + (type === "SELECT" ? 1 : item.quantity);
        let amount: any = newQuantity * oldItem[policyPriceType];
        if (isNullOrUndefined(oldItem[policyPriceType])) amount = null;
        oldItems[index] = {
          ...oldItem,
          quantity: newQuantity,
          amount: amount,
        };
      }
    });
    return [...oldItems];
  },
  updateStockInOutItemByQuantity: (
    stockInOutItem: StockInOutItemsOther,
    quantity: number,
    typePrice: string,
  ): StockInOutItemsOther => {
    let amount: any = quantity * stockInOutItem[typePrice];
    if (isNullOrUndefined(stockInOutItem[typePrice])) amount = null;
    return {
      ...stockInOutItem,
      quantity: quantity,
      amount: amount,
    };
  },
  getTotalAmountByStockInOutItems: (stockInOutItemsOther: Array<StockInOutItemsOther>): number => {
    let total = 0;
    stockInOutItemsOther.forEach((item: any) => {
      total += item.amount;
    });
    return total;
  },
  totalQuantity: (data: Array<StockInOutItemsOther>): number => {
    let total = 0;
    data.forEach((item) => (total = total + item.quantity));
    return total;
  },
  checkAllAmountIsNull: (stockInOutItemsOther: Array<StockInOutItemsOther>) => {
    return stockInOutItemsOther.every((item: StockInOutItemsOther) => item.amount === null);
  },
};

export default StockInOutProductUtils;
