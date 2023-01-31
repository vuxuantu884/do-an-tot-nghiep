import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Col, List, Modal, Row } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactCustomScrollbars from "react-custom-scrollbars";
import { ModalStyled } from "./modal-styled";
import SearchProductComponent from "./search-product";
import imgDefault from "assets/icon/img-default.svg";
import { showWarning } from "utils/ToastUtils";

const ReactDragListView = require("react-drag-listview/lib/index");
type PushingEditModalProps = {
  shopID: string;
  shopData: any[];
  visible: boolean;
  productEditPushing: any;
  onCancel: () => void;
  onOk: (products: any[]) => void;
};

const PushingEditModal: React.FC<PushingEditModalProps> = (props: PushingEditModalProps) => {
  const { shopID, shopData, visible, productEditPushing, onCancel, onOk } = props;

  const [productsPushing, setProductsPushing] = useState<any[]>([]);

  const [keySearch, setKeySearch] = useState("");

  const allProductPushing = useMemo(() => {
    let data: any[] = [];
    shopData &&
      productEditPushing.boosting &&
      shopData
        .filter((i: any) => i.boosting && i.boosting.queue !== productEditPushing.boosting.queue)
        .forEach((item: any) => {
          data = data.concat([...item.queue_boosts]);
        });
    return data;
  }, [shopData, productEditPushing]);

  useEffect(() => {
    setKeySearch("");
    let product = [];
    product =
      productEditPushing && productEditPushing.queue_boosts && productEditPushing.queue_boosts;
    setProductsPushing(product);
  }, [productEditPushing, visible]);

  const onDrag = useCallback(
    (fromIndex, toIndex) => {
      if (toIndex < 0 || toIndex > productsPushing.length - 1) return; // Ignores if outside designated area
      const items = [...productsPushing];
      // if (items[fromIndex].fixed || items[toIndex].fixed) return;

      const item = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, item);
      setProductsPushing(items);
    },
    [productsPushing],
  );

  const onClose = useCallback(
    (index) => {
      const items = [...productsPushing];
      items.splice(index, 1);
      setProductsPushing(items);
    },
    [productsPushing],
  );

  const handleSelectProduct = useCallback(
    (selected: any) => {
      setKeySearch("");
      const findIndexProduct1: any =
        shopData &&
        shopData
          .map((item: any) => {
            return {
              ...item.boosting,
            };
          })
          .filter((i: any) => i.queue && i.queue !== productEditPushing.boosting.queue)
          .findIndex((i: any) => i.ecommerce_product_id === selected.ecommerce_product_id);
      // allProductPushing: tất cả sản phẩm đang đẩy ở các queue trừ queue đang sửa

      const findIndexProduct2 = allProductPushing.findIndex(
        (i: any) => i.ecommerce_product_id === selected.ecommerce_product_id,
      );
      const findIndexProduct3 = productsPushing.findIndex(
        (i: any) => i.ecommerce_product_id === selected.ecommerce_product_id,
      );
      console.log("findIndexProduct1", findIndexProduct1);
      console.log("findIndexProduct2", findIndexProduct2);
      if (
        findIndexProduct1 === -1 &&
        findIndexProduct2 === -1 &&
        findIndexProduct3 === -1 &&
        productsPushing.length < 12
      ) {
        setProductsPushing([...productsPushing, selected]);
      }
      if (productsPushing.length >= 12) {
        showWarning("Tối đa 12 sản phẩm chờ đẩy !!!");
      } else if (findIndexProduct3 > -1) {
        showWarning("Sản phẩm đã được chọn !!!");
      } else if (findIndexProduct1 > -1) {
        showWarning("Sản phẩm đang được đẩy ở vị trí khác !!!");
      } else if (findIndexProduct2 > -1) {
        showWarning("Sản phẩm đang được chờ đẩy ở vị trí khác !!!");
      }
    },
    [productEditPushing.boosting, productsPushing, shopData],
  );

  const onSaveProducts = useCallback(() => {
    return onOk(productsPushing);
  }, [onOk, productsPushing]);

  return (
    <Modal
      onCancel={onCancel}
      onOk={() => onSaveProducts()}
      visible={visible}
      centered
      okText="Lưu lại"
      cancelText="Huỷ"
      title="Sửa sản phẩm đợi đẩy"
      width={600}
    >
      <ModalStyled>
        <SearchProductComponent
          keySearch={keySearch}
          setKeySearch={(value) => {
            setKeySearch(value);
          }}
          shopID={shopID}
          id="search_product"
          onSelect={handleSelectProduct}
        />
        <ReactCustomScrollbars style={{ height: "500px" }} autoHide>
          <ReactDragListView
            onDragEnd={onDrag}
            nodeSelector="li.ant-list-item.draggble-setting-column"
            handleSelector="li.ant-list-item.draggble-setting-column"
          >
            <List
              dataSource={productsPushing}
              renderItem={(item: any, index: number) => (
                <List.Item
                  key={index}
                  className={"draggble-setting-column"}
                  actions={[
                    <Button
                      onClick={() => {
                        onDrag(index, index + 1);
                      }}
                      key="icon-move-down"
                      icon={<ArrowDownOutlined />}
                      size="small"
                    />,
                    <Button
                      onClick={() => {
                        onDrag(index, index - 1);
                      }}
                      key="icon-move-up"
                      icon={<ArrowUpOutlined />}
                      size="small"
                    />,
                    <Button
                      onClick={() => {
                        onClose(index);
                      }}
                      key="icon-move-up"
                      icon={<CloseOutlined />}
                      size="small"
                    />,
                  ]}
                >
                  <Row
                    style={{
                      display: "flex",
                      placeContent: "center space-between",
                      height: "50px",
                      padding: "10px 15px",
                      width: "60%",
                    }}
                  >
                    <Col span={4}>
                      <img
                        src={item.image ? item.image : imgDefault}
                        alt=""
                        placeholder={imgDefault}
                        style={{ height: "40px", borderRadius: "3px" }}
                      />
                    </Col>
                    <Col span={20} style={{ display: "flex", alignItems: "center" }}>
                      <span className="text-ellipsis" style={{ color: "#37394D" }}>
                        {item.ecommerce_product}
                      </span>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </ReactDragListView>
        </ReactCustomScrollbars>
      </ModalStyled>
    </Modal>
  );
};

export default PushingEditModal;
