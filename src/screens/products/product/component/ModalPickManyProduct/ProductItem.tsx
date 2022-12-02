import { VariantResponse } from "model/product/product.model";
import imgDefIcon from "assets/img/img-def.svg";
import { formatCurrency } from "utils/AppUtils";
import { AppConfig } from "config/app.config";
import { Checkbox } from "antd";
import { findAvatar, findPrice } from "screens/products/helper";
import React from "react";

type ProductItemProps = {
  data: VariantResponse;
  isShowCheckBox?: boolean;
  isChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

const ProductItem: React.FC<ProductItemProps> = (props: ProductItemProps) => {
  const { data, isShowCheckBox, isChecked } = props;
  const avatar = findAvatar(data.variant_images);
  const priceData = findPrice(data.variant_prices, AppConfig.currency);
  return (
    <div className="product-item">
      {isShowCheckBox && (
        <Checkbox
          checked={isChecked}
          onChange={(e) => props.onChange && props.onChange(e.target.checked)}
        />
      )}
      <div className="product-item-image">
        <img src={avatar === null ? imgDefIcon : avatar.url} alt="" className="" />
      </div>
      <div className="product-item-info">
        <div className="product-item-info-left">
          <span className="product-item-name">{data.name}</span>
          <span className="product-item-sku">{data.sku}</span>
        </div>
        <div className="product-item-info-right">
          <span className="product-item-price">
            {priceData && priceData.retail_price !== null
              ? formatCurrency(priceData.retail_price)
              : 0}{" "}
            <span className="currency">₫</span>
          </span>
          <span className="product-item-inventory">
            Số lượng: <span className="value">{data.inventory}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
