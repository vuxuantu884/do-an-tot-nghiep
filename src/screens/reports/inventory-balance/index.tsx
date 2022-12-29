import { Table } from "antd";
import ContentContainer from "component/container/content.container";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import InventoryBalanceFilter from "../common/\bcomponents/inventory-balance-filter";
import { inventoryBalanceColumns } from "../common/constant/inventory-balance/inventory-balance-columns";
import { fetchInventoryBalanceList } from "../common/services/fetch-inventory-balance-list";
import { InventoryBalanceStyle } from "../common/styles/inventory-balance.style";

function InventoryBalance() {
  const dataSourceExample = [
    {
      sku_code: "APN3700-TNY-S",
      sku_name: "Polo nữ café phối nẹp - Trắng navy - S",
      store: "YODY Cẩm Xuyên",
      product_group_leve1: "Polo Nữ",
      product_group_leve2: "Polo nữ Café phối nẹp",
      name_color: "Trắng phối navy",
      name_size: "S",
      name_barcode: "2000143098894",
      name_currency: "VND",
      cost_price: 117720.0,
      retail_price: 329000.0,
      t13: null,
      t14: null,
      n01: 0,
      n07: 0.0,
      n02: 11.0,
      n08: 1294920.0,
      n03: 0,
      n09: 0.0,
      n04: 0,
      n10: 0.0,
      n05: 10.0,
      n11: 1177200.0,
      n06: 21.0,
      n12: 2472120.0,
      x01: 0.0,
      x02: 0.0,
      x03: 0.0,
      x04: 0.0,
      x05: -5.0,
      x06: -588600.0,
      x07: 0.0,
      x08: 0.0,
      x09: 0.0,
      x10: 0.0,
      x11: -5.0,
      x12: -588600.0,
      t39: 16.0,
      t40: 1883520.0,
      t41: 16.0,
    },
    {
      sku_code: "APK5177-HOG-4",
      sku_name: "Áo Polo Trẻ Em Mắt Chim Bo PhốiKID3052) - Hồng - 4",
      store: "YODY Cẩm Xuyên",
      product_group_leve1: "Polo Kid",
      product_group_leve2: "Áo Polo Trẻ Em Mắt Chim Bo Phối (KID3052)",
      name_color: "Hồng",
      name_size: "4",
      name_barcode: "2000140640393",
      name_currency: "VND",
      cost_price: 83160.0,
      retail_price: 219000.0,
      t13: null,
      t14: null,
      n01: 0,
      n07: 0.0,
      n02: 10.0,
      n08: 831600.0,
      n03: 0,
      n09: 0.0,
      n04: 0,
      n10: 0.0,
      n05: 7.0,
      n11: 582120.0,
      n06: 17.0,
      n12: 1413720.0,
      x01: 0,
      x02: 0.0,
      x03: 0,
      x04: 0.0,
      x05: 0,
      x06: 0.0,
      x07: 0,
      x08: 0.0,
      x09: 0,
      x10: 0.0,
      x11: 0,
      x12: 0.0,
      t39: 17.0,
      t40: 1413720.0,
      t41: 17.0,
    },
    {
      sku_code: "PHN5036-TIM-L",
      sku_name: "Áo phao nữ 3s plus - Tím - L",
      store: "YODY Cẩm Xuyên",
      product_group_leve1: "Áo Phao Nữ",
      product_group_leve2: "Áo phao nữ 3s plus",
      name_color: "Tím",
      name_size: "L",
      name_barcode: "2900000841048",
      name_currency: "VND",
      cost_price: 262000.4,
      retail_price: 699000.0,
      t13: null,
      t14: null,
      n01: 0,
      n07: 0.0,
      n02: 3.0,
      n08: 786001.2,
      n03: 0,
      n09: 0.0,
      n04: 0,
      n10: 0.0,
      n05: 5.0,
      n11: 1310002.0,
      n06: 8.0,
      n12: 2096003.2,
      x01: 0.0,
      x02: 0.0,
      x03: -1.0,
      x04: -262000.4,
      x05: 0.0,
      x06: 0.0,
      x07: 0.0,
      x08: 0.0,
      x09: 0.0,
      x10: 0.0,
      x11: -1.0,
      x12: -262000.4,
      t39: 7.0,
      t40: 1834002.8,
      t41: 7.0,
    },
  ];
  const dispatch = useDispatch();
  const [conditionFilter, setConditionFilter] = useState<any>();
  const [dataSource, setDataSource] = useState<any[]>(dataSourceExample);

  const initTable = useCallback(async () => {
    console.log("conditionFilter", conditionFilter);
    if (!conditionFilter) {
      return;
    }
    const response = await fetchInventoryBalanceList({ ...conditionFilter }, dispatch);
    console.log("response", response);
    setDataSource(response);
  }, [conditionFilter, dispatch]);

  useEffect(() => {
    initTable();
  }, [initTable]);

  return (
    <ContentContainer
      title={`Báo cáo xuất nhập tồn`}
      breadcrumb={[{ name: "Báo cáo" }, { name: "Báo cáo xuất nhập tồn" }]}
    >
      <InventoryBalanceFilter applyFilter={setConditionFilter}></InventoryBalanceFilter>
      <InventoryBalanceStyle>
        <Table
          dataSource={dataSource}
          columns={inventoryBalanceColumns}
          bordered
          scroll={{ x: "max-content" }}
          sticky={{
            offsetScroll: 55,
            offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
          }}
          pagination={{
            defaultPageSize: 50,
            pageSizeOptions: ["10", "20", "30", "50", "100", "500"],
          }}
          sortDirections={["descend", "ascend", null]}
        />
      </InventoryBalanceStyle>
    </ContentContainer>
  );
}

export default InventoryBalance;
