import { Select, SelectProps } from "antd";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { strForSearch } from "utils/StringUtils";
import { kdOfflineTemplateData } from "../constant/kd-offline-template";
import { KDOfflineContext } from "../provider/kd-offline-provider";
interface Props extends SelectProps<number> {
  asmName: string;
}

const { Option } = Select;

StoresSelect.defaultProps = {};
function StoresSelect(props: Props): ReactElement {
  const { asmName } = props;
  const dispatch = useDispatch();
  const { setSelectedAsm, setSelectedStores, setData, selectedStoreRank, setSelectedAllStores } =
    useContext(KDOfflineContext);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);

  const handleOnChange = (stores: string[]) => {
    setData((prev: any) => JSON.parse(JSON.stringify(kdOfflineTemplateData)));
    if (!stores.length) {
      setSelectedAllStores(true);
    } else {
      setSelectedAllStores(false);
    }
    setSelectedStores(
      stores.length
        ? stores.map((item) => JSON.parse(item).name)
        : storesInAsm.map((item) => item.name),
    );
  };

  const storesInAsm: StoreResponse[] = useMemo(() => {
    let selectedAsmName: string;
    const stores = [...listStore].filter((item) => {
      if (
        !selectedAsmName &&
        item.department_h3 &&
        nonAccentVietnameseKD(item.department_h3) === asmName
      ) {
        selectedAsmName = item.department_h3;
      }
      return item.department_h3 && nonAccentVietnameseKD(item.department_h3) === asmName;
    });
    setTimeout(() => {
      if (stores.length) {
        setSelectedStores(stores.map((item) => item.name));
      }
      if (selectedAsmName) {
        setSelectedAsm([selectedAsmName]);
      }
    }, 0);
    return stores;
  }, [asmName, listStore, setSelectedAsm, setSelectedStores]);

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
  }, [dispatch]);

  useEffect(() => {
    if (selectedStoreRank) {
      setData((prev: any) => JSON.parse(JSON.stringify(kdOfflineTemplateData)));
      setSelectedAllStores(true);
      setSelectedStores(
        storesInAsm.filter((item) => item.rank === selectedStoreRank).map((item) => item.name),
      );
    }
  }, [selectedStoreRank, setData, setSelectedAllStores, setSelectedStores, storesInAsm]);
  return (
    <Select
      mode="multiple"
      placeholder="Chọn cửa hàng"
      showArrow
      showSearch
      optionFilterProp="children"
      style={{ width: "100%" }}
      maxTagCount={"responsive"}
      filterOption={(input: String, option: any) => {
        if (option.props.value) {
          return strForSearch(option.props.children).includes(strForSearch(input));
        }
        return false;
      }}
      onChange={handleOnChange}
      disabled={!!selectedStoreRank}
    >
      {storesInAsm.map((item, index) => (
        <Option key={"store_id" + index} value={JSON.stringify(item)}>
          {item.name}
        </Option>
      ))}
    </Select>
  );
}

export default StoresSelect;
