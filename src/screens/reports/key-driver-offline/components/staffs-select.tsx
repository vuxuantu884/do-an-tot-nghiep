import { Select, SelectProps } from "antd";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { strForSearch } from "utils/StringUtils";
import { keyDriverOfflineTemplateData } from "../constant/key-driver-offline-template-data";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";
interface Props extends SelectProps<number> {
  asmName: string;
  storeName: string;
}

const { Option } = Select;

StaffsSelect.defaultProps = {};
function StaffsSelect(props: Props): ReactElement {
  const { asmName, storeName } = props;
  const dispatch = useDispatch();
  const { setSelectedAsm, setSelectedStores, setSelectedStaffs, setData } =
    useContext(KDOfflineStoresContext);
  const [listStores, setStores] = useState<Array<StoreResponse>>([]);
  const [staffs, setStaffs] = useState<AccountResponse[]>([]);

  const handleOnChange = (selectedStaffs: string[]) => {
    setData((prev: any) => JSON.parse(JSON.stringify(keyDriverOfflineTemplateData)));
    setSelectedStaffs(
      selectedStaffs.length ? selectedStaffs : staffs.map((item) => JSON.stringify(item)),
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const staffsInStore: AccountResponse[] = useMemo(() => {
    const currentStore = listStores.find(
      (item) =>
        item.department_h3 &&
        nonAccentVietnameseKD(item.department_h3) === asmName &&
        nonAccentVietnameseKD(item.name) === storeName,
    );
    if (currentStore) {
      const currentStoreId = currentStore.id;
      dispatch(
        searchAccountPublicAction(
          { store_ids: [currentStoreId], status: "active", limit: 200 },
          (data: PageResponse<AccountResponse> | false) => {
            if (data) {
              const selectedStaffsState = data.items.map((item) => JSON.stringify(item));
              setSelectedStaffs(selectedStaffsState);
              setStaffs(data.items);
            }
          },
        ),
      );
      setTimeout(() => {
        setSelectedStores([currentStore.name]);
        if (currentStore.department_h3) {
          setSelectedAsm([currentStore.department_h3]);
        }
      }, 0);
    }
    return [];
  }, [
    asmName,
    dispatch,
    listStores,
    setSelectedAsm,
    setSelectedStaffs,
    setSelectedStores,
    storeName,
  ]);

  useEffect(() => {
    dispatch(StoreGetListAction(setStores));
  }, [dispatch]);
  return (
    <Select
      mode="multiple"
      placeholder="Chọn nhân viên"
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
    >
      {staffs.map((item, index) => (
        <Option key={"assignee_code" + index} value={JSON.stringify(item)}>
          {item.full_name}
        </Option>
      ))}
    </Select>
  );
}

export default StaffsSelect;
