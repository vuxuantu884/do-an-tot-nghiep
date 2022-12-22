import { Modal, Select } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import RowDetail from "component/custom/RowDetail";
import { strForSearch } from "utils/StringUtils";
import { InventoryTransferDetailItem, Store } from "model/inventory/transfer";
import { callApiNative } from "utils/ApiUtils";
import { forwardStoreApi, getStoreApi } from "service/inventory/transfer/index.service";
import { useDispatch } from "react-redux";
import { ConvertFullAddress } from "utils/ConvertAddress";
import { dangerColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
const { Option } = Select;

type ModalForwardProps = {
  visible?: boolean;
  onOk: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  currentStore: InventoryTransferDetailItem | null;
};

const ModalForward: React.FC<ModalForwardProps> = (props: ModalForwardProps) => {
  const { visible, onOk, onCancel, okText, cancelText, currentStore } = props;
  const [storeData, setStoreData] = useState<Store | null>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [forwardStoreValue, setForwardStoreValue] = useState<string | undefined>(undefined);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const dispatch = useDispatch();

  const getStores = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getStoreApi, {
      status: "active",
      simple: true,
    });
    if (res) {
      setStores(res);
    }
  }, [dispatch]);

  useEffect(() => {
    getStores().then();
  }, [getStores]);

  const handleForward = async () => {
    if (!forwardStoreValue) {
      setErrorMessage("Vui lòng chọn kho chuyển tiếp!");
      return;
    }

    setErrorMessage("");
    if (currentStore) {
      setIsLoadingBtn(true);
      let res = await callApiNative({ isShowLoading: false }, dispatch, forwardStoreApi, currentStore.id, {
        to_store_id: forwardStoreValue
      });

      setIsLoadingBtn(false);

      if (res) {
        showSuccess(`Hàng đã được chuyển tiếp sang kho ${storeData?.name}.`);
        onOk();
      }
    }
  };

  return (
    <Modal
      confirmLoading={isLoadingBtn}
      width={500}
      title="Chuyển tiếp kho"
      okText={okText ? okText : "Chuyển tiếp kho"}
      cancelText={cancelText ? cancelText : "Hủy"}
      visible={visible}
      onOk={handleForward}
      onCancel={onCancel}
    >
      <div>
        <div className="font-weight-500 mb-10">Hãng đang/đã chuyển tới kho:</div>
        <div>
          <RowDetail title="Kho gửi" value={currentStore ? currentStore.to_store_name : ""} />
          <RowDetail title="Mã CH" value={currentStore ? currentStore.to_store_code?.toString() : ""} />
          <RowDetail title="SĐT" value={currentStore ? currentStore.to_store_phone?.toString() : ""} />
          <RowDetail title="Địa chỉ" value={ConvertFullAddress(currentStore?.store_receive)} />
        </div>
        <div className="font-weight-500 mb-10 mt-10">Chuyển tiếp tới kho:</div>
        <Select
          value={forwardStoreValue}
          style={{ width: "100%" }}
          autoClearSearchValue={false}
          placeholder="Chọn kho chuyển tiếp"
          showArrow
          optionFilterProp="children"
          showSearch
          onChange={(value: string) => {
            setForwardStoreValue(value);
            if (!value) {
              setStoreData(null);
            }
            setErrorMessage("");
            stores.forEach((element) => {
              if (element.id === parseInt(value)) {
                setStoreData(element);
              }
            });
          }}
          filterOption={(input: String, option: any) => {
            if (option.props.value) {
              return strForSearch(option.props.children).includes(strForSearch(input));
            }

            return false;
          }}
        >
          {Array.isArray(stores) &&
            stores.map((item, index) => (
              <Option key={index} value={item.id.toString()}>
                {item.name}
              </Option>
            ))}
        </Select>
        {storeData && (
          <div className="margin-top-20">
            <RowDetail title="Kho nhận" value={storeData.name} />
            <RowDetail title="Mã CH" value={storeData.code} />
            <RowDetail title="SĐT" value={storeData.hotline} />
            <RowDetail title="Địa chỉ" value={ConvertFullAddress(storeData)} />
          </div>
        )}

        {errorMessage !== "" && (
          <div className="margin-top-20" style={{ color: dangerColor }}>{errorMessage}</div>
        )}
      </div>
    </Modal>
  );
};

export default ModalForward;
