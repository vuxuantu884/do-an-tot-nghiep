import { Button, Popover } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import AddIcon from "assets/icon/addIcon.svg";
import { VariantResponse } from "model/product/product.model";
import { BAGS_CONFIG } from "utils/Order.constants";
import { searchVariantsApi } from "service/product/product.service";
import {
  findAvatar,
  findPriceInVariant,
  findTaxInVariant,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { OrderLineItemRequest } from "model/request/order.request";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import AddBagOutlined from "component/icon/AddBagOutlined";

type Props = {
  addBag: (item: OrderLineItemRequest) => void;
};

const AddBag: React.FC<Props> = (props: Props) => {
  const { addBag } = props;
  const [bags, getBags] = useState<VariantResponse[]>([]);

  const createItem = (variant: VariantResponse) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    let orderLine: OrderLineItemRequest = {
      id: new Date().getTime(),
      sku: variant.sku,
      variant_id: variant.id,
      product_id: variant.product.id,
      variant: variant.name,
      variant_barcode: variant.barcode,
      product_type: variant.product.product_type,
      product_code: variant.product_code || "",
      quantity: 1,
      price: price,
      amount: price,
      note: "",
      type: Type.NORMAL,
      variant_image: avatar,
      unit: variant.product.unit,
      weight: variant.weight,
      weight_unit: variant.weight_unit,
      warranty: variant.product.care_labels,
      discount_items: [],
      discount_amount: 0,
      discount_rate: 0,
      composite: variant.composite,
      is_composite: variant.composite,
      discount_value: 0,
      line_amount_after_line_discount: price,
      product: variant.product.name,
      tax_include: true,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
      position: undefined,
      available: variant.available,
      taxable: variant.taxable,
    };
    return orderLine;
  };

  const handleAddBag = useCallback(
    (variant: VariantResponse) => {
      console.log("handleAddBag", variant);
      const _v = createItem(variant);
      addBag(_v);
    },
    [addBag],
  );

  const renderContent = () => {
    return (
      <StyledComponent>
        <ul className="bags">
          {bags.map((bag) => {
            return (
              <li
                title="Click để thêm túi"
                onClick={() => {
                  handleAddBag(bag);
                }}
              >
                <div className="giftSku">{bag.sku}</div>
                <div>{bag.name}</div>
                <img className="icon" src={AddIcon} alt="" />
              </li>
            );
          })}
        </ul>
      </StyledComponent>
    );
  };

  useEffect(() => {
    (async () => {
      const _bags = [
        BAGS_CONFIG.ztm0002.variant_id,
        BAGS_CONFIG.ztm0002.variant_id,
        BAGS_CONFIG.ztm4.variant_id,
        BAGS_CONFIG.ztm1.variant_id,
        BAGS_CONFIG.ztm2.variant_id,
      ];
      const initialRequest: any = {
        variant_ids: _bags.filter((p) => p),
        limit: _bags.filter((p) => p).length,
      };

      const response = await searchVariantsApi(initialRequest);
      if (isFetchApiSuccessful(response)) {
        getBags(response.data.items);
      }
    })();
  }, []);
  return (
    <StyledComponent>
      <Popover placement="bottom" content={renderContent} trigger="click">
        <Button icon={<AddBagOutlined />}>Thêm túi nhanh</Button>
      </Popover>
    </StyledComponent>
  );
};

export default AddBag;
