import { Checkbox } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { AppConfig } from "config/app.config";
import {ProductResponse, VariantResponse} from "model/product/product.model";
import { formatCurrency, Products } from "utils/AppUtils";

export type ProductItemProps = {
  item: VariantResponse | ProductResponse;
  showCheckBox?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  isTransfer?: boolean
}

const ProductItem: React.FC<ProductItemProps> = (props: ProductItemProps) => {
  const { item, showCheckBox, checked, isTransfer, onChange = () => {} } = props;
  let avatar
  let price_data
  if ("variant_images" in item) {
    avatar = Products.findAvatar(item?.variant_images);
  }
  if ("variant_prices" in item) {
    price_data = Products.findPrice(item?.variant_prices || "", AppConfig.currency);
  }

  return (
    <div className="product-item product-item-select" onClick={() => onChange(!checked)}>
      {
        showCheckBox && (
          <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
        )
      }
      <div className="product-item-image">
        <img src={avatar === null ? imgDefIcon : avatar?.url} alt="" className="" />
      </div>
      <div className="product-item-info">
        <div className="product-item-info-left">
          <span className="product-item-name">{item.name}</span>
          <span className="product-item-sku">{item?.code}</span>
        </div>
        <div className="product-item-info-right">
          {
            isTransfer ? (
              <span className="product-item-price">{price_data && price_data.retail_price ? formatCurrency(price_data.retail_price) : 0} <span className="currency">₫</span></span>
            ) : (
              <span className="product-item-price">{price_data && price_data.import_price ? formatCurrency(price_data.import_price) : 0} <span className="currency">₫</span></span>
            )
          }
          <span className="product-item-inventory">Số lượng tồn: <span className="value">{item.on_hand ? item.on_hand : 0}</span></span>
        </div>
      </div>
    </div>
  )
}

export default ProductItem;
