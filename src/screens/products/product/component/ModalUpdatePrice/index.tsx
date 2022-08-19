import { Modal, List } from "antd";
import { VariantResponse } from "model/product/product.model";
import variantdefault from "assets/icon/variantdefault.jpg";
import { convertVariantPrices, formatCurrency, Products } from "utils/AppUtils";
import { useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import { AppConfig } from "config/app.config";

type IProps = {
  visible: boolean;
  currentIndex: number;
  variants: Array<VariantResponse>;
  onOk: (listSelected: Array<number>) => void;
  onCancel: () => void;
};

const ModalUpdatePrice: React.FC<IProps> = (props: IProps) => {
  const [variantConfirm, setVariantConfirm] = useState<Array<VariantResponse>>([]);

  useEffect(() => {
    setVariantConfirm([
      ...convertVariantPrices(props.variants, props.variants[props.currentIndex]),
    ]);
  }, [props.currentIndex, props.variants]);

  return (
    <Modal
      okText="Cập nhật giá"
      onCancel={() => {
        props.onCancel();
      }}
      onOk={() => {
        props.onOk(props.variants.map((e) => e.id));
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
      visible={props.visible}
      className="yody-modal-price-product"
    >
      <StyledComponent>
        <List
          className="list__variants"
          dataSource={variantConfirm.filter(
            (item, index) => index !== props.currentIndex && item.id,
          )}
          rowKey={(item) => item.id.toString()}
          renderItem={(item, index) => {
            let avatar = Products.findAvatar(item.variant_images);
            return (
              <List.Item>
                <div className="line-item">
                  <div className="line-item-container">
                    <div className="avatar">
                      <img alt="" src={avatar !== null ? avatar.url : variantdefault} />
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
                            Products.findPrice(item.variant_prices, AppConfig.currency)
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
