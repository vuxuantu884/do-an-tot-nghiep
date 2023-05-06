import UrlConfig from "config/url.config";
import { cloneDeep } from "lodash";
import { CreateBinLocationItems } from "model/bin-location";

const BinLocationTabUrl = {
  LIST: `${UrlConfig.BIN_LOCATION}/list`,
  HISTORIES: `${UrlConfig.BIN_LOCATION}/histories`,
};

const INVENTORY_STATUSES = [
  {
    value: "empty_showroom",
    name: "Không có tồn Sàn trưng bày",
  },
  {
    value: "empty_storage",
    name: "Không có tồn Kho lưu trữ",
  },
  {
    value: "negative",
    name: "Tồn tại Sàn/Kho bị âm",
  },
];

const MAX_ITEMS = 200;

const addBinProducts = (
  oldItems: Array<CreateBinLocationItems>,
  newItems: Array<CreateBinLocationItems>,
) => {
  const newItemsClone = cloneDeep(newItems);
  const oldItemsClone = cloneDeep(oldItems);
  newItemsClone.forEach((el: any) => {
    const index = oldItemsClone.findIndex(
      (item: CreateBinLocationItems) => item.variant_id === el.variant_id,
    );
    if (index === -1) {
      oldItemsClone.unshift(el);
    } else {
      oldItemsClone[index].quantity += el.quantity;
    }
  });
  return oldItemsClone;
};

export { BinLocationTabUrl, INVENTORY_STATUSES, MAX_ITEMS, addBinProducts };
