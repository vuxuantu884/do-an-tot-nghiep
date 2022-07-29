import { VariantResponse } from "model/product/product.model";
import imgDefIcon from "assets/img/img-def.svg";
import { formatCurrency, Products } from "utils/AppUtils";
import { AppConfig } from "config/app.config";
import { Checkbox } from "antd";

type ProductItemProps = {
  data: VariantResponse;
  showCheckBox?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

const ProductItem: React.FC<ProductItemProps> = (props: ProductItemProps) => {
  const { data, showCheckBox, checked } = props;
  const avatar = Products.findAvatar(data.variant_images);
  const price_data = Products.findPrice(data.variant_prices, AppConfig.currency);
  return (
    <div className="product-item">
      {showCheckBox && (
        <Checkbox
          checked={checked}
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
            {price_data && price_data.retail_price !== null
              ? formatCurrency(price_data.retail_price)
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
