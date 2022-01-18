import { Modal, List, Checkbox } from "antd";
import { VariantResponse } from "model/product/product.model";
import variantdefault from "assets/icon/variantdefault.jpg";
import { Products } from "utils/AppUtils";
import { useState } from "react";
import { StyledComponent } from "./styled";

type IProps = {
  visible: boolean;
  currentVariant: number;
  variants: Array<VariantResponse>;
  onOk: (listSelected: Array<number>) => void;
  onCancel: () => void;
};

const ModalUpdatePrice: React.FC<IProps> = (props: IProps) => {
  const [listSelected, setListSelected] = useState<Array<number>>([]);
  const [checkedAll, setCheckedAll] = useState<boolean>(false);
  return (
    <Modal
      okText="Cập nhật giá"
      onCancel={() => {
        setCheckedAll(false)
        setListSelected([]);
        props.onCancel();
      }}
      onOk={() => {
        props.onOk(listSelected);
        setCheckedAll(false)
        setListSelected([])
      }}
      title={
        <div>
          <b>Cập nhật nhanh</b>
          <p
            style={{
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: 14,
              marginTop: 5,
              color: "#666666",
            }}
          >
            Chọn các sản phẩm bạn muốn cập nhật giá
          </p>
        </div>
      }
      visible={props.visible}
      className="yody-modal-price-product"
    >
      <StyledComponent>
        <List
          header={
            <div className="header-tab">
              <div className="header-tab-left">
                <Checkbox
                  checked={checkedAll}
                  onChange={(e) => {
                    setCheckedAll(e.target.checked);
                    if (props.variants) {
                      if (e.target.checked) {
                        props.variants.forEach((item) => {
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
            </div>
          }
          className="list__variants"
          dataSource={props.variants.filter(
            (item, index) => index !== props.currentVariant
          )}
          rowKey={(item) => item.id.toString()}
          renderItem={(item, index) => {
            let avatar = Products.findAvatar(item.variant_images);
            return (
              <List.Item>
                <div className="line-item">
                  <Checkbox
                    checked={
                      listSelected.findIndex((item1) => item1 === item.id) !==
                      -1
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
                  <div className="line-item-container">
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
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div>{item.sku}</div>
                      <div className="right__name">{item.name}</div>
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </StyledComponent>
    </Modal>
  );
};

export default ModalUpdatePrice;
