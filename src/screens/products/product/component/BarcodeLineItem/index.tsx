import { VariantResponse } from "model/product/product.model";
import imgDefIcon from "assets/img/img-def.svg";
import { Checkbox } from "antd";
import { StyledComponent } from "./style";
import { findAvatar } from "screens/products/helper";
import React from "react";

type ProductItemProps = {
  data: VariantResponse;
  isShowCheckBox?: boolean;
  isChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

const BarcodeLineItem: React.FC<ProductItemProps> = (props: ProductItemProps) => {
  const { data, isShowCheckBox, isChecked, onChange } = props;
  const avatar = findAvatar(data.variant_images);

  return (
    <StyledComponent>
      <div className="bc-item">
        {isShowCheckBox && (
          <Checkbox
            checked={isChecked}
            onChange={(event) => onChange && onChange(event.target.checked)}
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
