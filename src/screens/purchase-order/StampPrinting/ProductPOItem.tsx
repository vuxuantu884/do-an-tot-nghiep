import ListItem from "component/modal/PickManyModal/ListItem";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import React from "react";
import imgDefIcon from "assets/img/img-def.svg";
import { formatCurrency } from "utils/AppUtils";
import { handleSelectProduct } from "./helper";

type Props = {
  item: PurchaseOrderLineItem;
  index: number;
  showCheckBox: boolean;
  selectedIds: number[];
  setSelectedIds: (data: number[]) => void;
};
ProductPOItem.defaultProps = {
  showCheckBox: true,
};
function ProductPOItem(props: Props) {
  const { index, item, selectedIds, showCheckBox, setSelectedIds } = props;
  const { variant_image, variant, variant_detail, price, variant_id } = item;
  const isSelected = variant_id ? selectedIds.includes(variant_id) : false;
  return (
    <ListItem
      item={item}
      onSelect={(item: PurchaseOrderLineItem, index: number) =>
        handleSelectProduct(item, index, selectedIds, setSelectedIds)
      }
      index={index}
      checked={isSelected}
      showCheckBox={showCheckBox}
    >
      <div className="product-item-image">
        <img src={variant_image === null ? imgDefIcon : variant_image} alt="" />
      </div>
      <div className="product-item-info">
        <div className="product-item-info-left">
          <span className="product-item-name">{variant}</span>
          <span className="product-item-sku">{variant_detail?.sku}</span>
        </div>
        <div className="product-item-info-right">
          <span className="product-item-price">
            {typeof price === "number" ? formatCurrency(price) : "-"}{" "}
            <span className="currency">₫</span>
          </span>
          {item?.quantity && (
            <span className="product-item-inventory">
              Số lượng: <span className="value">{item?.quantity}</span>
            </span>
          )}
        </div>
      </div>
    </ListItem>
  );
}

export default ProductPOItem;
