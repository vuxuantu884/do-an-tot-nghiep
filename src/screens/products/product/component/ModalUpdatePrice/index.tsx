import { Modal, List } from "antd";
import { VariantResponse } from "model/product/product.model";
import variantDefault from "assets/icon/variantdefault.jpg";
import { formatCurrency } from "utils/AppUtils";
import React, { useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import { AppConfig } from "config/app.config";
import { findPrice, convertVariantPrices, findAvatar } from "screens/products/helper";

type ModalUpdatePriceProps = {
  visible: boolean;
  currentIndex: number;
  variants: Array<VariantResponse>;
  onOk: (listSelected: Array<number>) => void;
  onCancel: () => void;
};

const ModalUpdatePrice: React.FC<ModalUpdatePriceProps> = (props: ModalUpdatePriceProps) => {
  const [variantConfirm, setVariantConfirm] = useState<Array<VariantResponse>>([]);
  const { visible, currentIndex, variants, onCancel, onOk } = props;

  useEffect(() => {
    setVariantConfirm([
      ...convertVariantPrices(variants, variants[currentIndex]),
    ]);
  }, [currentIndex, variants]);

  return (
    <Modal
      okText="Cập nhật giá"
      onCancel={() => {
        onCancel();
      }}
      onOk={() => {
        onOk(variants.map((e) => e.id));
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
            Danh sách các phiên bản cập nhật giá
          </p>
        </div>
      }
      visible={visible}
      className="yody-modal-price-product"
    >
      <StyledComponent>
        <List
          className="list__variants"
          dataSource={variantConfirm.filter(
            (item, index) => index !== currentIndex && item.id,
          )}
          rowKey={(item) => item.id.toString()}
          renderItem={(item) => {
            const avatar = findAvatar(item.variant_images);
            return (
              <List.Item>
                <div className="line-item">
                  <div className="line-item-container">
                    <div className="avatar">
                      <img alt="" src={avatar !== null ? avatar.url : variantDefault} />
                      {!item.saleable && <div className="not-salable">Ngừng bán</div>}
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
                      <div className="item-sku">
                        <div>{item.sku}</div>
                        <div className="retail-price-sku">
                          {formatCurrency(
                            findPrice(item.variant_prices, AppConfig.currency)
                              ?.retail_price ?? "",
                          )}
                        </div>
                      </div>
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
