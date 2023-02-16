import { Alert, Card, Table } from "antd";
import ContentContainer from "component/container/content.container";
import { REPORTS_URL } from "config/url.config";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import GrossProfitFilter from "screens/reports/common/component/gross-profit-filter";
import { defaultDisplayOptions } from "screens/reports/common/constant/goods-reports/gross-profit-report";
import { fetchGrossProfitData } from "screens/reports/common/services/fetch-gross-profit-data";
import { InventoryBalanceStyle } from "screens/reports/common/styles/inventory-balance.style";
import { formatCurrency } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

function GrossProfitReport() {
  const dispatch = useDispatch();
  const [conditionFilter, setConditionFilter] = useState<any>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [displayOptions, setDisplayOptions] = useState<any[]>(defaultDisplayOptions);
  const [emptyMessage, setEmptyMessage] = useState<string>(
    "Vui lòng chọn điều kiện lọc để xem dữ liệu báo cáo",
  );

  const initTable = useCallback(async () => {
    if (!conditionFilter) {
      return;
    }
    const response = await fetchGrossProfitData({ ...conditionFilter }, dispatch);
    if (!response.data.length) {
      setEmptyMessage("Không có kết quả phù hợp với điều kiện lọc");
    }
    const { description } = response;
    response.data.forEach((item: any, index: number) => {
      item.no = index + 1;
    });
    const columnsFormatted = Object.keys(description).map((key: string, index: number) => {
      const { name, unit, format } = description[key];
      return {
        title: name,
        dataIndex: key,
        key,
        // width: ["gross_profit_margin"].includes(key) ? 110 : 80,
        align: ["gross_profit", "gross_profit_margin"].includes(key) ? "right" : "center",
        render: (text: number) => {
          return format === "number" && unit === "VND" ? (
            <span>{formatCurrency(text) ?? "-"}</span>
          ) : format === "number" && unit === "%" ? (
            <span>
              {text}
              {unit}
            </span>
          ) : (
            <span>{text}</span>
          );
        },
      };
    });
    setDataSource(response.data);
    setColumns(columnsFormatted);
  }, [conditionFilter, dispatch]);

  useEffect(() => {
    initTable();
  }, [initTable]);

  return (
    <ContentContainer
      title={`Báo cáo lợi nhuận gộp theo mã 3, nhóm hàng`}
      breadcrumb={[
        { name: "Báo cáo" },
        { name: "Danh sách báo cáo hàng hoá", path: `${REPORTS_URL.GOODS}` },
        { name: "Báo cáo lợi nhuận gộp theo mã 3, nhóm hàng" },
      ]}
    >
      <GrossProfitFilter
        applyFilter={setConditionFilter}
        displayOptions={displayOptions}
        setDisplayOptions={setDisplayOptions}
      ></GrossProfitFilter>
      <InventoryBalanceStyle>
        <Card>
          <Alert
            message="Dữ liệu được cập nhật hàng ngày lúc 7:00"
            type="warning"
            showIcon
            className="mb-2"
          />
          <Table
            locale={{ emptyText: emptyMessage }}
            dataSource={dataSource}
            columns={columns}
            bordered
            scroll={{ x: "max-content" }}
            sticky={{
              offsetScroll: 55,
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
            }}
            pagination={{
              defaultPageSize: 50,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
          />
        </Card>
      </InventoryBalanceStyle>
    </ContentContainer>
  );
}

export default GrossProfitReport;
