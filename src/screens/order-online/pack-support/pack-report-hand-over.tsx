import PackFilter from "component/filter/pack.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { generateQuery } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import PackTable from "./pack-table";

const PackReportHandOver: React.FC = () => {
  
  let [params, setPrams] = useState<any>();
  const [tableLoading, setTableLoading] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const onMenuClick = useCallback((index: number) => {
    console.log(index);
  }, []);

  

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<any>>
  >([
    {
      title: "Gian hàng",
      dataIndex: "store",
      key: "store",
      visible: true,
      width: "200px",
    },
    {
      title: "Nguồn đơn hàng",
      dataIndex: "source",
      key: "order_source",
      visible: true,
      width: "200px",
    },
    {
      title: "Ghi chú của khách",
      dataIndex: "customer_note",
      key: "customer_note",
      visible: true,
    },
  ]);

  const dataTest = [];
  for (let i = 0; i < 100; i++) {
    dataTest.push({
      key: i,
      name: `Edrward ${i}`,
      age: 32,
      address: `London Park no. ${i}`,
    });
  }

  const columnFinal = useMemo(
    () => columns.filter((item:any) => item.visible === true),
    [columns]
  );

  useEffect(() => {
    if(dataTest.length>0)
    {
      
    }
  }, [dataTest])

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
    },
    [params]
  );

  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowKeys = selectedRow.map((row: any) => row.id);
    setSelectedRowKeys(selectedRowKeys);
  }, []);

  return (
    <>
      <div style={{ padding: "24px 24px 0 24px" }}>
        <PackFilter onMenuClick={onMenuClick} params={params} />
      </div>
      <div style={{ padding: "24px 24px 0 24px" }}>
      <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 3630, y: 350 }}
            pagination={
                tableLoading ? false : {
                pageSize: data.metadata.limit,
                total: data.metadata.total,
                current: data.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }
            }
            onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
            dataSource={data.items}
            columns={columnFinal}
            rowKey={(item: any) => item.id}
            className="ecommerce-order-list"
          />
      </div>
    </>
  );
};

export default PackReportHandOver;
