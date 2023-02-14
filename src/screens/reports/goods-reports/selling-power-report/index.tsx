import { Alert, Card, Table } from "antd";
import ContentContainer from "component/container/content.container";
import { REPORTS_URL } from "config/url.config";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import SellingPowerFilter from "screens/reports/common/component/selling-power-filter";
import { defaultDisplayOptions } from "screens/reports/common/constant/goods-reports/selling-power-report";
import { sellingPowerReportColumns } from "screens/reports/common/constant/goods-reports/selling-power-report-columns";
import { fetchSellingPowerList } from "screens/reports/common/services/fetch-selling-power-list";
import { SellingPowerReportStyle } from "screens/reports/common/styles/selling-power-report.style";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

function SellingPowerReport() {
  const dispatch = useDispatch();
  const [conditionFilter, setConditionFilter] = useState<any>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>(
    "Vui lòng chọn điều kiện lọc để xem dữ liệu báo cáo",
  );
  const [displayOptions, setDisplayOptions] = useState<any[]>(defaultDisplayOptions);

  const initTable = useCallback(async () => {
    if (!conditionFilter) {
      return;
    }
    const response = await fetchSellingPowerList({ ...conditionFilter }, dispatch);
    if (!response.data.length) {
      setEmptyMessage("Không có kết quả phù hợp với điều kiện lọc");
    }
    const { data, total } = response;
    data.forEach((item: any, index: number) => {
      item.no = index + 1;
    });
    response.data = [{ ...total, no: "TỔNG", colSpan: 12, className: "font-weight-bold" }, ...data];
    setDataSource(response.data);
  }, [conditionFilter, dispatch]);

  useEffect(() => {
    initTable();
  }, [initTable]);

  return (
    <ContentContainer
      title={`Báo cáo tồn bán sức bán`}
      breadcrumb={[
        { name: "Báo cáo" },
        { name: "Danh sách báo cáo hàng hoá", path: `${REPORTS_URL.GOODS}` },
        { name: "Báo cáo tồn bán sức bán" },
      ]}
    >
      <SellingPowerFilter
        applyFilter={setConditionFilter}
        displayOptions={displayOptions}
        setDisplayOptions={setDisplayOptions}
      ></SellingPowerFilter>
      <SellingPowerReportStyle>
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
            columns={sellingPowerReportColumns(conditionFilter?.date)}
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
      </SellingPowerReportStyle>
    </ContentContainer>
  );
}

export default SellingPowerReport;
