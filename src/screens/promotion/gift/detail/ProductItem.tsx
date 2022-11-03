import imgDefIcon from "assets/img/img-def.svg";
import { GiftProductEntitlements } from "model/promotion/gift.model";
import { formatCurrency } from "utils/AppUtils";

export type ProductItemProps = {
  data: GiftProductEntitlements;
};

const ProductItem: React.FC<ProductItemProps> = (props: ProductItemProps) => {
  const { data } = props;
  return (
    <div className="product-item product-item-select">
      <div className="product-item-image">
        <img src={imgDefIcon} alt="" className="" />
      </div>
      <div className="product-item-info">
        <div className="product-item-info-left">
          <span className="product-item-name">{data.title}</span>
          <span className="product-item-sku">{data.sku}</span>
        </div>
        <div className="product-item-info-right">
          <span className="product-item-price">
            {data.retail_price ? formatCurrency(data.retail_price) : 0} <span className="currency">₫</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
