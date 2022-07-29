import { SelectProps } from "antd";
import { searchDepartmentAction } from "domain/actions/account/department.action";
import { StoreResponse } from "model/core/store.model";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { KDOnlineShopContext } from "../provider/kd-online-shop-provider";
interface Props extends SelectProps<number> {
  cnName: string;
}

StoresSelect.defaultProps = {};
function StoresSelect(props: Props): ReactElement {
  const { cnName } = props;
  const dispatch = useDispatch();
  const { setSelectedCN, setSelectedShops } = useContext(KDOnlineShopContext);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);

  const handleOnChange = (values: number[], labelList: any[]) => {
    setSelectedShops(labelList.length ? labelList : storesInAsm.map((item) => item.name));
  };

  const storesInAsm: StoreResponse[] = useMemo(() => {
    let selectedcnName: string;
    setTimeout(() => {
      if (listStore.length) {
        setSelectedShops(listStore.map((item) => item.name));
      }
      if (selectedcnName) {
        setSelectedCN([selectedcnName]);
      }
    }, 0);
    return listStore;
  }, [listStore, setSelectedCN, setSelectedShops]);

  useEffect(() => {
    dispatch(
      searchDepartmentAction((result) => {
        if (result) {
          const onlineDepartment = result.find((item) => item.name === "KINH DOANH ONLINE");
          if (!onlineDepartment?.children?.length) {
            setStore([]);
          } else {
            const onlineBranch = onlineDepartment.children.find(
              (item) => nonAccentVietnamese(item.name) === cnName,
            );
            if (!onlineBranch?.children?.length) {
              setStore([]);
            } else {
              const stores = onlineBranch.children.reduce((res: any, item: any) => {
                if (item.children?.length) {
                  res = [...res, ...item.children];
                } else {
                  res = [...res, item];
                }
                return res;
              }, []);
              setStore(stores);
            }
          }
        }
      }),
    );
  }, [cnName, dispatch]);
  return (
    <TreeStore
      listStore={storesInAsm}
      name=""
      style={{ width: "250px" }}
      onChange={handleOnChange}
      placeholder={"Chọn shop"}
    />
  );
}

export default StoresSelect;
