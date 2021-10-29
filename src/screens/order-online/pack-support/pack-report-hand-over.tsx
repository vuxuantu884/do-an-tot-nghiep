import { Button, Dropdown,Menu } from "antd";
import PackFilter from "component/filter/pack.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useMemo, useState } from "react";
import threeDot from "assets/icon/three-dot.svg";
import IconVector from "assets/img/Vector.svg";
import IconPrint from "assets/icon/Print.svg";
import IconPack from "assets/icon/Pack.svg";

const PackReportHandOver: React.FC = () => {
  
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let [params, setPrams] = useState<any>();
  const [tableLoading] = useState(true);

  const [data] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  // const dataSource = [
  //   {
  //     key: '1',
  //     name: 'John Brown',
  //     age: 32,
  //     address: 'New York No. 1 Lake Park',
  //   },
  //   {
  //     key: '2',
  //     name: 'Jim Green',
  //     age: 42,
  //     address: 'London No. 1 Lake Park',
  //   },
  //   {
  //     key: '3',
  //     name: 'Joe Black',
  //     age: 32,
  //     address: 'Sidney No. 1 Lake Park',
  //   },
  //   {
  //     key: '4',
  //     name: 'Disabled User',
  //     age: 99,
  //     address: 'Sidney No. 1 Lake Park',
  //   },
  // ];

  const onMenuClick = useCallback((index: number) => {
    console.log(index);
  }, []);

  const handlePrint=()=>{

  }

  const handleExportHVC=()=>{

  }

  const handleAddPack=()=>{

  }

  const actionColumn = (handlePrint: any, handleExportHVC: any, handleAddPack: any) => {
    const _actionColumn = {
      title: "",
      visible: true,
      width: "5%",
      className: "saleorder-product-card-action ",
      render: (l: any, item: any, index: number) => {
        const menu = (
          <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
            <Menu.Item key="1">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={IconPrint}/>}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handlePrint}
              >
                In biên bản
              </Button>
            </Menu.Item>
            
            <Menu.Item key="2">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={IconVector}/>}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handleExportHVC}
              >
                Gửi biên bản sang hãng vận chuyển
              </Button>
            </Menu.Item>

            <Menu.Item key="3">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={IconPack}/>}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={handleAddPack}
              >
                Thêm đơn hàng vào biên bản
              </Button>
            </Menu.Item>
          </Menu>
        );
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 4px",
            }}
          >
            <div
              className="site-input-group-wrapper saleorder-input-group-wrapper"
              style={{
                borderRadius: 5,
              }}
            >
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  icon={<img src={threeDot} alt=""></img>}
                ></Button>
              </Dropdown>
            </div>
          </div>
        );
      },
    };
    return _actionColumn;
  };

  const [columns,setColumn] = useState<
    Array<ICustomTableColumType<any>>
  >([
    {
      title: "ID biên bản bàn giao",
      dataIndex: "ID1",
      key: "1",
      visible: true,
      width: "200px",
      fixed: 'left',
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "key2",
      key: "2",
      visible: true,
      width: "200px",
    },
    {
      title: "Loại",
      dataIndex: "key3",
      key: "3",
      visible: true,
      width: "200px",
    },
    {
      title: "SL sản phẩm",
      dataIndex: "key4",
      key: "4",
      visible: true,
      width: "200px",
    },
    {
      title: "Số đơn",
      dataIndex: "key5",
      key: "5",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn đã gửi HVC",
      dataIndex: "key6",
      key: "6",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn chưa lấy",
      dataIndex: "key7",
      key: "7",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn đang chuyển",
      dataIndex: "key8",
      key: "8",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn hủy",
      dataIndex: "key9",
      key: "9",
      visible: true,
      width: "200px",
    },
    {
      title: "Đang chuyển hoàn",
      dataIndex: "key10",
      key: "10",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn thành công",
      dataIndex: "key11",
      key: "11",
      visible: true,
      width: "200px",
    },
    {
      title: "Đơn hoàn",
      dataIndex: "key12",
      key: "12",
      visible: true,
      width: "200px",
    },
    {
      title: "Người tạo",
      dataIndex: "key13",
      key: "13",
      visible: true,
      width: "200px",
    },
   actionColumn(handlePrint,handleExportHVC,handleAddPack)
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

  return (
    <>
      <div style={{ padding: "0px 24px 0 24px" }}>
        <PackFilter onMenuClick={onMenuClick} params={params}  onShowColumnSetting={() => setShowSettingColumn(true)}/>
      </div>
      <div style={{ padding: "0px 24px 0 24px" }}>
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
            //onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
            dataSource={[]}
            columns={columnFinal}
            onRow={(record: any) => {
              return {
                onClick: (event) => {
                  // setSinglePack(record);
                  // console.log("record",record);
                }, // click row
              };
            }}
            className="ecommerce-order-list"
          />
      {/* <Table
        rowSelection={{
          type: 'checkbox',
          columnWidth: 60,
        }}
        columns={columnFinal}
        dataSource={dataSource}
        rowKey={(item: any) => item.id}
            onRow={(record: any) => {
              return {
                onClick: (event) => {
                  setSinglePack(record);
                  console.log("record",record);
                  //setModalAction("edit");
                  // setIsShowModalShipping(true);
                }, // click row
              };
            }}
        className="ecommerce-order-list"
      /> */}
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
