import PackFilter from "component/filter/pack.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useMemo, useState } from "react";


const PackReportHandOver: React.FC = () => {
  
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let [params, setPrams] = useState<any>();
  const [tableLoading] = useState(true);
    // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [data] = useState<PageResponse<any>>({
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

  

  const [columns,setColumn] = useState<
    Array<ICustomTableColumType<any>>
  >([
    {
      title: "ID biên bản bàn giao",
      //dataIndex: "store",
      //key: "store",
      visible: true,
      width: "200px",
      fixed: 'left',
    },
    {
      title: "Tên cửa hàng",
      //dataIndex: "source",
      //key: "order_source",
      visible: true,
      width: "200px",
    },
    {
      title: "Loại",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "SL sản phẩm",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Số đơn",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn đã gửi HVC",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn chưa lấy",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn đang chuyển",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn hủy",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Đang chuyển hoàn",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn thành công",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn hoàn",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
    {
      title: "Người tạo",
      //dataIndex: "customer_note",
      //key: "customer_note",
      visible: true,
      width: "200px",
    },
  ]);


  const columnFinal = useMemo(
    () => columns.filter((item:any) => item.visible === true),
    [columns]
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
    },
    [params]
  );

  const onSelectedChange = useCallback((selectedRow) => {
    // const selectedRowKeys = selectedRow.map((row: any) => row.id);
    // setSelectedRowKeys(selectedRowKeys);
  }, []);

  return (
    <>
      <div style={{ padding: "24px 24px 0 24px" }}>
        <PackFilter onMenuClick={onMenuClick} params={params}  onShowColumnSetting={() => setShowSettingColumn(true)}/>
      </div>
      <div style={{ padding: "24px 24px 0 24px" }}>
      <CustomTable
            isRowSelection
            //isLoading={tableLoading}
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

      {showSettingColumn &&
          <ModalSettingColumn
            visible={showSettingColumn}
            isSetDefaultColumn={true}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumn(data);
            }}
            data={columns}
          />
        }
    </>
  );
};

export default PackReportHandOver;
