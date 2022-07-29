import { VariantResponse } from "model/product/product.model";
import imgDefIcon from "assets/img/img-def.svg";
import { Checkbox } from "antd";
import { StyledComponent } from "./style";
import { Products } from "utils/AppUtils";

type ProductItemProps = {
  data: VariantResponse;
  showCheckBox?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

const BarcodeLineItem: React.FC<ProductItemProps> = (props: ProductItemProps) => {
  const { data, showCheckBox, checked } = props;
  const avatar = Products.findAvatar(data.variant_images);
  return (
    <StyledComponent>
      <div className="bc-item">
        {showCheckBox && (
          <Checkbox
            checked={checked}
            onChange={(e) => props.onChange && props.onChange(e.target.checked)}
          />
        )}
        <div className="bc-item-image">
          <img src={avatar === null ? imgDefIcon : avatar.url} alt="" className="" />
        </div>
        <div className="bc-item-info">
          <div className="bc-item-info-left">
            <span className="bc-item-name">{data.name}</span>
            <span className="bc-item-sku">{data.sku}</span>
          </div>
        </div>
      </div>
    </StyledComponent>
  );
};

export default BarcodeLineItem;
