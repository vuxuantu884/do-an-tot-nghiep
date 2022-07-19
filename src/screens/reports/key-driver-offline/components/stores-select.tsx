import { SelectProps } from "antd";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";
interface Props extends SelectProps<number> {
  asmName: string;
}

StoresSelect.defaultProps = {};
function StoresSelect(props: Props): ReactElement {
  const { asmName } = props;
  const dispatch = useDispatch();
  const { setSelectedAsm, setSelectedStores } = useContext(KDOfflineStoresContext);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);

  const handleOnChange = (values: number[], labelList: any[] ) => {
    setSelectedStores(labelList.length ? labelList : storesInAsm.map(item => item.name));
  };

  const storesInAsm: StoreResponse[] = useMemo(() => {
    let selectedAsmName: string;
    const stores = [...listStore].filter(item => {
      if (!selectedAsmName && item.department_h3 && nonAccentVietnamese(item.department_h3) === asmName) {
        selectedAsmName = item.department_h3;
      }
      return item.department_h3 && nonAccentVietnamese(item.department_h3) === asmName;
    });
    setTimeout(() => {
      if (stores.length) {
        setSelectedStores(stores.map(item => item.name));
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
  return (
    <TreeStore listStore={storesInAsm} name="" style={{ width: "250px" }} onChange={handleOnChange} placeholder={"Chọn bộ phận"}/>
  );
}

export default StoresSelect;
