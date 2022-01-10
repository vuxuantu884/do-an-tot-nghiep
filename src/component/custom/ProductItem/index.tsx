import { Checkbox } from "antd";
import { ProductResponse } from "model/product/product.model";
import imgDefIcon from "assets/img/img-def.svg";

export type ProductItemProps = {
  data: ProductResponse;
  showCheckBox?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
}

const ProductItem: React.FC<ProductItemProps> = (props: ProductItemProps) => {
  const { data, showCheckBox, checked } = props;
  let url = null;
  data.variants.forEach((item) => {
    item.variant_images?.forEach((item1) => {
      if (item1.product_avatar) {
        url = item1.url;
      }
    });
  });
  return (
    <div className="product-item">
      {
        showCheckBox && (
          <Checkbox checked={checked} onChange={(e) => props.onChange && props.onChange(e.target.checked)} />
        )
      }
      <div className="product-item-image">
        <img src={url === null ? imgDefIcon : url} alt="" className="" />
      </div>
      <div className="product-item-info">
        <div className="product-item-info-left">
          <span className="product-item-name">{data.name}</span>
          <span className="product-item-sku">{data.code}</span>
        </div>
        <div className="product-item-info-right">
          <span className="product-item-inventory">SL phiên bản: <span className="value">{data.variants ? data.variants.length : 0}</span></span>
        </div>
      </div>
    </div>
  )
}

export default ProductItem;
