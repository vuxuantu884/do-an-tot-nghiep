import { Checkbox, List } from "antd";
import { VariantResponse } from "model/product/product.model";
import { Products } from "utils/AppUtils";
import classNames from "classnames/";
import variantdefault from "assets/icon/variantdefault.jpg";
import React, { useCallback, useState } from "react";
import { StyledComponent } from "./style";
import ActionButton from "component/table/ActionButton";

interface VariantListProps {
  value?: Array<VariantResponse>;
  active: number;
  setActive: (active: number) => void;
  onStopSale: (data: Array<number>) => void;
  onAllowSale: (data: Array<number>) => void;
}

const VariantList: React.FC<VariantListProps> = (props: VariantListProps) => {
  const [listSelected, setListSelected] = useState<Array<number>>([]);
  const onMenuClick = useCallback((action) => {
    switch (action) {
      case 1:
        props.onStopSale(listSelected);
        break;
      case 2:
        props.onAllowSale(listSelected);
    }
  }, [listSelected, props]);
  return (
    <StyledComponent>
      <List
        dataSource={props.value}
        className="list__variants"
        header={
          <div className="header-tab">
            <div className="header-tab-left">
              <Checkbox
                onChange={(e) => {
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
                  disabled={listSelected.length === 0}
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
          return (
            <List.Item
              className={classNames(index === props.active && "active")}
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
                      src={avatar !== null ? avatar.url : variantdefault}
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
                    }}
                  >
                    {item.id ? (
                      <React.Fragment>
                        <div>{item.sku}</div>
                        <div>{item.name}</div>
                      </React.Fragment>
                    ) : (
                      <div className="item-new">Phiên bản mới</div>
                    )}
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </StyledComponent>
  );
};

export default VariantList;
