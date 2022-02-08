import { Loading3QuartersOutlined } from "@ant-design/icons";
import { Checkbox, List, Spin } from "antd";
import variantdefault from "assets/icon/variantdefault.jpg";
import classNames from "classnames";
import ActionButton from "component/table/ActionButton";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { formatCurrency, Products } from "utils/AppUtils";
import { StyledComponent } from "./style";

interface VariantListProps {
  value?: Array<VariantResponse>;
  active: number;
  setActive: (active: number) => void;
  onStopSale: (data: Array<number>) => void;
  onAllowSale: (data: Array<number>) => void;
  loading?: boolean;
  disabledAction?: boolean,
  productData?: ProductResponse
}

const VariantList: React.FC<VariantListProps> = (props: VariantListProps) => {
  const {active, productData} = props;
  const [listSelected, setListSelected] = useState<Array<number>>([]);
  const [checkedAll, setCheckedAll] = useState<boolean>(false);

  const firstScrollRef = useRef(true) 
  const onMenuClick = useCallback(
    (action) => {
      switch (action) {
        case 1:
          props.onStopSale(listSelected);
          setListSelected([]);
          setCheckedAll(false);
          break;
        case 2:
          props.onAllowSale(listSelected);
          setListSelected([]);
          setCheckedAll(false);
      }
    },
    [listSelected, props]
  );

  useLayoutEffect(() => {
    // scroll to active varriant
    if(firstScrollRef.current && active){
      firstScrollRef.current = false;
      document.getElementById("variantIndex"+active)?.scrollIntoView({behavior: "smooth", block: "center"});
    }
  }, [active])

  return (
    <StyledComponent>
      <List
        dataSource={props.value}
        className="list__variants"
        header={
          <div className="header-tab">
            <div className="header-tab-left">
              <Checkbox
                checked={checkedAll}
                onChange={(e) => {
                  setCheckedAll(e.target.checked);
                  if (props.value) {
                    if (e.target.checked) {
                      props.value.forEach((item) => {
                        let index = listSelected.findIndex(
                          (item1) => item1 === item.id
                        );
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
                disabled={listSelected.length === 0 || props.disabledAction}
                onMenuClick={onMenuClick}
                menu={[
                  {
                    id: 1,
                    name: "Ngừng bán",
                  },
                  {
                    id: 2,
                    name: "Cho phép bán",
                  },
                ]}
              />
            </div>
          </div>
        }
        renderItem={(item, index) => {
          let avatar = Products.findAvatar(item.variant_images);
          let variantName = item.sku;
          if (item.sku && productData) {
            variantName = item.sku?.replace(productData.code, "");
          }
          return (
            <List.Item
              className={classNames(index === props.active && "active")}
              id={"variantIndex"+index}
            >
              <div className="line-item">
                <Checkbox
                  checked={
                    listSelected.findIndex((item1) => item1 === item.id) !== -1
                  }
                  onChange={(e) => {
                    let index = listSelected.findIndex(
                      (item1) => item1 === item.id
                    );
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
                <div
                  onClick={() => props.setActive(index)}
                  className="line-item-container"
                >
                  <div className="avatar">
                    <img
                      alt=""
                      src={avatar ? avatar.url : variantdefault}
                    />
                    {!item.saleable && (
                      <div className="not-salable">Ngừng bán</div>
                    )}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {item.id ? (
                      <React.Fragment>
                        <div className="sku">{item.sku}</div>
                        <div className="variant-name">{variantName}</div>
                      </React.Fragment>
                    ) : (
                      <div className="item-new">Phiên bản mới</div>
                    )}
                  </div>
                  <div className="variant-price">
                    {`${
                     (item && item.variant_prices != null && item.variant_prices[0]?.retail_price)
                        ? formatCurrency(item.variant_prices[0].retail_price)
                        : "-"
                    }`}
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
      {props.loading && (
        <div className="loading-view">
          <Spin
            indicator={
              <Loading3QuartersOutlined style={{ fontSize: 28 }} spin />
            }
          />
        </div>
      )}
    </StyledComponent>
  );
};

export default VariantList;
