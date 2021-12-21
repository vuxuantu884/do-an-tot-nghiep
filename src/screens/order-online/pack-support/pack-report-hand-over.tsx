import { Button, Dropdown,Menu } from "antd";
import PackFilter from "component/filter/pack.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import threeDot from "assets/icon/three-dot.svg";
import IconVector from "assets/img/Vector.svg";
import IconPrint from "assets/icon/Print.svg";
import IconPack from "assets/icon/Pack.svg";
import { GoodsReceiptsSearchQuery } from "model/query/goods-receipts.query";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { useDispatch } from "react-redux";
import { getGoodsReceiptsSerch } from "domain/actions/goods-receipts/goods-receipts.action";

const initQueryGoodsReceipts: GoodsReceiptsSearchQuery = {
  limit: 30,
  page: 1,
  sort_column: "",
  sort_type: "",
  store_id: null,
  delivery_service_id: null,
  ecommerce_id: null,
  good_receipt_type_id: null,
  good_receipt_id:null,
  order_codes:null,
  from_date: "",
  to_date: "",
};

const PackReportHandOver: React.FC = () => {
  const dispatch = useDispatch();
  //const [listGoodsReceiptsSearch, setListGoodsReceiptsSearch] = useState<GoodsReceiptsResponse[]>([]);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [tableLoading] = useState(true);
  let [params, setPrams] = useState<GoodsReceiptsSearchQuery>(initQueryGoodsReceipts);

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

  const handlePrint=()=>{

  }

  const handleExportHVC=()=>{

  }

  const handleAddPack=()=>{

  }

  const  goodsReceiptsIdColumns:ICustomTableColumType<any>={
    title: "ID biên bản bàn giao",
    key: "1",
    dataIndex:"key1",
    visible: true,
    width: "200px",
    fixed:"left",
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      // console.log(a)
      // console.log("field",listGoodsReceiptsSearch);
      return (
          <div className="t-success">
             1
          </div>
      );
    },
  }

  const  goodsReceiptsStoreNameColumns:ICustomTableColumType<any>={
    title: "Tên cửa hàng",
    key: "2",
    dataIndex:"key2",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  
  const  goodsReceiptsTypeNameColumns:ICustomTableColumType<any>={
    title: "Loại",
    key: "3",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsProductQuanlityColumns:ICustomTableColumType<any>={
    title: "SL sản phẩm",
    key: "4",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsOrderQuanlityColumns:ICustomTableColumType<any>={
    title: "Số đơn",
    key: "5",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsSendHVCColumns:ICustomTableColumType<any>={
    title: "Đơn đã gửi HVC",
    
    key: "6",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsNotGetOrderColumns:ICustomTableColumType<any>={
    title: "Đơn chưa lấy",
    
    key: "7",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsMovingOrderColumns:ICustomTableColumType<any>={
    title: "Đơn đang chuyển",
    
    key: "8",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsCancelOrderColumns:ICustomTableColumType<any>={
    title: "Đơn hủy",
    
    key: "9",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsTransferCompleteColumns:ICustomTableColumType<any>={
    title: "Đang chuyển hoàn",
    
    key: "10",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsSuccessOrderColumns:ICustomTableColumType<any>={
    title: "Đơn thành công",
    
    key: "11",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsCompleteOrderColumns:ICustomTableColumType<any>={
    title: "Đơn hoàn",
    
    key: "12",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const  goodsReceiptsCreatorColumns:ICustomTableColumType<any>={
    title: "Người tạo",
    
    key: "13",
    visible: true,
    width: "200px",
    
    render: (a: GoodsReceiptsResponse, item: any, index: number) => {
      return (
          <div className="t-success">
             ok
          </div>
      );
    },
  }

  const actionColumn = (handlePrint: any, handleExportHVC: any, handleAddPack: any) => {
    const _actionColumn = {
      title: "",
      key: "14",
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

  const [columns,setColumn] = useState< Array<ICustomTableColumType<any>>>([
    goodsReceiptsIdColumns,
    goodsReceiptsStoreNameColumns,
    goodsReceiptsTypeNameColumns,
    goodsReceiptsProductQuanlityColumns,
    goodsReceiptsOrderQuanlityColumns,
    goodsReceiptsSendHVCColumns,
    goodsReceiptsNotGetOrderColumns,
    goodsReceiptsMovingOrderColumns,
    goodsReceiptsCancelOrderColumns,
    goodsReceiptsTransferCompleteColumns,
    goodsReceiptsSuccessOrderColumns,
    goodsReceiptsCompleteOrderColumns,
    goodsReceiptsCreatorColumns,
    actionColumn(handlePrint,handleExportHVC,handleAddPack)
  ])

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

  useEffect(() => {
    //const toDate = new Date();
    // Trừ đi 1 ngày
    //const fromDate = new Date().setDate(toDate.getDate() - 1);

    //initQueryGoodsReceipts.limit = 3;
    // initQueryGoodsReceipts.page = 1;
    // initQueryGoodsReceipts.sort_type = "desc";
    // initQueryGoodsReceipts.sort_column = "updated_date";
    // initQueryGoodsReceipts.from_date = moment(fromDate).format("DD-MM-YYYY");
    // initQueryGoodsReceipts.to_date = moment(toDate).format("DD-MM-YYYY");

    dispatch(
      getGoodsReceiptsSerch(initQueryGoodsReceipts, (data:PageResponse<GoodsReceiptsResponse>)=>{
        let dataResult:Array<GoodsReceiptsResponse>=[];
        data.items.forEach((item:GoodsReceiptsResponse,index:number)=>{
          dataResult.push(
            {...item, key:index}
          );
        })
        //setListGoodsReceiptsSearch(dataResult)
        setData({
          metadata: {
            limit: data.metadata.limit,
            page: data.metadata.page,
            total: data.metadata.total,
          },
          items: dataResult
        });
      })
    );

    console.log("initQueryGoodsReceipts", initQueryGoodsReceipts);
  }, [dispatch]);



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
            scroll={{ x: 3630, y: 600 }}
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
            dataSource={data.items}
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
            key={Math.random()}
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
