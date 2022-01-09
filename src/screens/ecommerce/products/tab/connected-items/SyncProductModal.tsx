import { Checkbox, Form, Modal, Radio, Select, Space, Tooltip } from "antd";
import { getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getEcommerceIcon } from "screens/ecommerce/common/commonAction";
import { StyledProductFilter } from "screens/ecommerce/products/styles";
import { StyledComponentSyncStock } from "./styles";

export interface ResultConnectedItemsProps {
  width: string;
  visible: boolean;
  title: string;
  okText: string;
  cancelText: string;
  onCancel: () => void;
  onOk: (item: any, shop_ids: number[]) => void;
}

function SyncProductModal({
  width,
  visible,
  title,
  okText,
  cancelText,
  onCancel,
  onOk,
}: ResultConnectedItemsProps) {
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

  const [syncStockType, setSyncStockType] = useState<any>("");

  const [isCheckedRadioNormal, setIsCheckedRadioNormal] = useState(false);
  const [isCheckedRadioSpecial, setIsCheckedRadioSpecial] = useState(false);

  const dispatch = useDispatch();

  //handle select ecommerce
  const updateEcommerceShopList = React.useCallback((result) => {
    const shopList: any[] = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopList.push({
          id: item.id,
          name: item.name,
          isSelected: false,
          ecommerce: item.ecommerce,
        });
      });
    }
    setEcommerceShopList(shopList);
  }, []);

  useEffect(() => {
    dispatch(getShopEcommerceList({}, updateEcommerceShopList));
  }, [dispatch, updateEcommerceShopList]);

  const onCheckedChange = (shop: any, e: any) => {
    if (e.target.checked) {
      shop.isSelected = true;
      const shopSelected = [...shopIdSelected];
      shopSelected.push(shop.id);
      setShopIdSelected(shopSelected);
    } else {
      shop.isSelected = false;
      const shopSelected =
        shopIdSelected &&
        shopIdSelected.filter((item: any) => {
          return item !== shop.id;
        });
      setShopIdSelected(shopSelected);
    }
  };

  const renderShopList = (isNewFilter: any) => {
    return (
      <StyledProductFilter>
        <div className="render-shop-list">
          {ecommerceShopList?.map((item: any) => (
            <div key={item.id} className="shop-name">
              <Checkbox
                onChange={(e) => onCheckedChange(item, e)}
                checked={item.isSelected}>
                <span className="check-box-name">
                  <span>
                    <img
                      src={getEcommerceIcon(item.ecommerce)}
                      alt={item.id}
                      style={{ marginRight: "5px", height: "16px" }}
                    />
                  </span>
                  <Tooltip title={item.name} color="#1890ff" placement="right">
                    <span
                      className="name"
                      style={isNewFilter ? { width: 270 } : { width: 90 }}>
                      {item.name}
                    </span>
                  </Tooltip>
                </span>
              </Checkbox>
            </div>
          ))}

          {ecommerceShopList.length === 0 && (
            <div style={{ color: "#737373", padding: 10 }}>
              Không có dữ liệu
            </div>
          )}
        </div>
      </StyledProductFilter>
    );
  };

  const getPlaceholderSelectShop = () => {
    if (shopIdSelected && shopIdSelected.length > 0) {
      return `Đã chọn: ${shopIdSelected.length} gian hàng`;
    } else {
      return "Chọn gian hàng";
    }
  };

  const onChangeSyncOption = (e: any) => {
    setSyncStockType(e.target.value);
  };

  const handleSyncShopListSelected = (e: any) => {
    setIsCheckedRadioNormal(true);
    setIsCheckedRadioSpecial(false);
  };

  const handleSyncAllOfShopList = () => {
    setIsCheckedRadioNormal(false);
    setIsCheckedRadioSpecial(true);
  };

  const handleCloseSync = () => {
    setShopIdSelected([]);
    setIsCheckedRadioNormal(false);
    setIsCheckedRadioSpecial(false);
    ecommerceShopList.forEach((item: any) => (item.isSelected = false));
    setSyncStockType(null);
  };

  const handleCancelSyncModal = () => {
    onCancel();
    handleCloseSync();
  };

  const handleOkSyncModal = () => {
    onOk(syncStockType, shopIdSelected);
    handleCloseSync();
  };
  return (
    <Modal
      width={width}
      visible={visible}
      title={title}
      okText={okText}
      cancelText={cancelText}
      onCancel={handleCancelSyncModal}
      onOk={handleOkSyncModal}
      okButtonProps={{
        disabled:
          isCheckedRadioNormal === true || shopIdSelected.length ? false : true,
      }}>
      <StyledComponentSyncStock>
        <Radio.Group onChange={onChangeSyncOption} value={syncStockType}>
          <Space direction="vertical">
            <Radio value={"selected"} onChange={handleSyncShopListSelected}>
              Đồng bộ các sản phẩm đã chọn
            </Radio>
            <Radio value={"shop"} onChange={handleSyncAllOfShopList}>
              Đồng bộ tất cả sản phẩm của gian hàng
            </Radio>
          </Space>
        </Radio.Group>
        {isCheckedRadioSpecial && (
          <Form>
            <Form.Item
              className="select-store-dropdown select-store-dropdown-sync-stock"
              label={<span>Chọn gian hàng</span>}>
              <Select
                placeholder={getPlaceholderSelectShop()}
                dropdownRender={() => renderShopList(true)}
              />
            </Form.Item>
          </Form>
        )}
      </StyledComponentSyncStock>
    </Modal>
  );
}

export default SyncProductModal;
