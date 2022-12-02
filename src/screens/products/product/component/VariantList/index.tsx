import { Loading3QuartersOutlined } from "@ant-design/icons";
import { Checkbox, List, Spin } from "antd";
import variantDefault from "assets/icon/variantdefault.jpg";
import classNames from "classnames";
import ActionButton from "component/table/ActionButton";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { SupportedCurrencyType, formatCurrencyValue } from "utils/AppUtils";
import { StyledComponent } from "./style";
import { findAvatar } from "screens/products/helper";

interface VariantListProps {
  value?: Array<VariantResponse>;
  active: number;
  setActive: (active: number) => void;
  onStopSale: (data: Array<number>) => void;
  onAllowSale: (data: Array<number>) => void;
  isLoading?: boolean;
  isDisabledAction?: boolean;
  productData?: ProductResponse;
  canUpdateSaleable?: boolean;
}

const VariantList: React.FC<VariantListProps> = (props: VariantListProps) => {
  const { active, productData, isDisabledAction, onStopSale, onAllowSale, value, canUpdateSaleable, isLoading, setActive } = props;
  const [listSelected, setListSelected] = useState<Array<number>>([]);
  const [isCheckedAll, setIsCheckedAll] = useState<boolean>(false);

  const firstScrollRef = useRef(true);
  const onMenuClick = useCallback(
    (action) => {
      switch (action) {
        case 1:
          onStopSale(listSelected);
          setListSelected([]);
          setIsCheckedAll(false);
          break;
        case 2:
          onAllowSale(listSelected);
          setListSelected([]);
          setIsCheckedAll(false);
      }
    },
    [listSelected, onAllowSale, onStopSale],
  );

  useLayoutEffect(() => {
    // scroll to active variant
    if (firstScrollRef.current && active) {
      firstScrollRef.current = false;
      document
        .getElementById("variantIndex" + active)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [active]);

  return (
    <StyledComponent>
      <List
        dataSource={value}
        className="list__variants"
        header={
          <div className="header-tab">
            <div className="header-tab-left">
              <Checkbox
                checked={isCheckedAll}
                onChange={(e) => {
                  setIsCheckedAll(e.target.checked);
                  if (value) {
                    if (e.target.checked) {
                      value.forEach((item) => {
                        const index = listSelected.findIndex((item1) => item1 === item.id);
                        if (index === -1) {
                          listSelected.push(item.id);
                        }
                      });
                      setListSelected([...listSelected]);
                    } else {
                      setListSelected([]);
                    }
                  }
                }}
              >
                Chọn tất cả
              </Checkbox>
            </div>
            <div className="header-tab-right">
              <ActionButton
                disabled={listSelected.length === 0 || isDisabledAction}
                onMenuClick={onMenuClick}
                menu={[
                  {
                    id: 1,
                    name: "Ngừng bán",
                    disabled: !canUpdateSaleable,
                  },
                  {
                    id: 2,
                    name: "Cho phép bán",
                    disabled: !canUpdateSaleable,
                  },
                ]}
              />
            </div>
          </div>
        }
        renderItem={(item, index) => {
          const avatar = findAvatar(item.variant_images);
          let variantName = item.sku;
          if (item.sku && productData) {
            variantName = item.name?.replace(productData.name, "");
            variantName = variantName.replace("- ", "");
          }
          return (
            <List.Item
              className={classNames(index === active && "active")}
              id={"variantIndex" + index}
            >
              <div className="line-item">
                <Checkbox
                  checked={listSelected.findIndex((item1) => item1 === item.id) !== -1}
                  onChange={(e) => {
                    const index = listSelected.findIndex((item1) => item1 === item.id);
                    if (e.target.checked) {
                      if (index === -1) {
                        listSelected.push(item.id);
                      }
                    } else {
                      if (index !== -1) {
                        listSelected.splice(index, 1);
                      }
                    }
                    setListSelected([...listSelected]);
                  }}
                />
                <div onClick={() => setActive(index)} className="line-item-container">
                  <div className="line-item-left">
                    <div className="avatar">
                      <img alt="" src={avatar ? avatar.url : variantDefault} />
                      {!item.saleable && <div className="not-salable">Ngừng bán</div>}
                    </div>
                    <div className="info">
                      {item.id ? (
                        <div>
                          <div className="variant-sku">
                            <div className="sku text-truncate-1">{item.sku}</div>
                            <div className="variant-price">
                              {`${
                                item &&
                                item.variant_prices != null &&
                                item.variant_prices[0]?.retail_price
                                  ? formatCurrencyValue(
                                      item.variant_prices[0].retail_price,
                                      ".",
                                      ",",
                                      item.variant_prices[0].currency_code.toUpperCase() as SupportedCurrencyType,
                                    )
                                  : "-"
                              }`}
                            </div>
                          </div>

                          <div className="variant-name" title={item.name}>
                            {variantName}
                          </div>
                        </div>
                      ) : (
                        <div className="item-new">Phiên bản mới</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
      {isLoading && (
        <div className="loading-view">
          <Spin indicator={<Loading3QuartersOutlined style={{ fontSize: 28 }} spin />} />
        </div>
      )}
    </StyledComponent>
  );
};

export default VariantList;
