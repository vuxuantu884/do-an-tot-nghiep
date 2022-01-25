import { Button, Dropdown, Menu } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import threeDot from "assets/icon/three-dot.svg";
import IconVector from "assets/img/Vector.svg";
import IconPrint from "assets/icon/Print.svg";
import IconPack from "assets/icon/Pack.svg";
import { GoodsReceiptsSearchQuery } from "model/query/goods-receipts.query";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { useDispatch } from "react-redux";
import {
  deleteAllGoodsReceipts,
  getGoodsReceiptsSerch,
} from "domain/actions/goods-receipts/goods-receipts.action";
import { GoodsReceiptsSearhModel } from "model/pack/pack.model";
import { FulFillmentStatus } from "utils/Constants";
import { getQueryParams } from "utils/useQuery";
import { useHistory } from "react-router";
import { generateQuery } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import PackFilter from "component/filter/pack.filter";
import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import { MenuAction } from "component/table/ActionButton";
import { Link } from "react-router-dom";
import { showSuccess } from "utils/ToastUtils";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import useAuthorization from "hook/useAuthorization";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";

const initQueryGoodsReceipts: GoodsReceiptsSearchQuery = {
  limit: 30,
  page: 1,
  sort_column: "",
  sort_type: "",
  ids:null,
  store_ids: null,
  delivery_service_ids: null,
  ecommerce_ids: null,
  good_receipt_type_ids: null,
  order_codes: null,
  from_date: "",
  to_date: "",
};

const typePrint = {
  simple: "simple",
  detail: "detail"
}

type PackReportHandOverProps = {
  query: any;
};

const PackReportHandOver: React.FC<PackReportHandOverProps> = (
  props: PackReportHandOverProps
) => {
  const { query } = props;
  const history = useHistory();
  const dispatch = useDispatch();

  let dataQuery: GoodsReceiptsSearchQuery = {
    ...initQueryGoodsReceipts,
    ...getQueryParams(query),
  };
  const [allowDeleteGoodsReceipt] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.DELETE_GOODS_RECEIPT],
    not: false,
  });

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "In biên bản đầy đủ ",
      icon: <PrinterOutlined />,
    },
    {
      id: 2,
      name: "In biên bản rút gọn ",
      icon: <PrinterOutlined />,
    },
    {
      id: 3,
      name: "Xóa",
      icon: <DeleteOutlined />,
      color: allowDeleteGoodsReceipt ? "#E24343" : "rgba(0,0,0,.25)",
      disabled: !allowDeleteGoodsReceipt
    },
  ];

  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let [params, setPrams] = useState<GoodsReceiptsSearchQuery>(dataQuery);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [goodsReceipt,setGoodsReceipt]=useState<GoodsReceiptsResponse[]>([]);

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [modalDeleteComfirm, setModalDeleteComfirm] = useState(false);

  const handlePrintPack = useCallback((type: string) => {
    let params = {
      action: "print",
      ids: selectedRowKeys,
      "print-type": "print-pack",
      "pack-type": type
    };
    const queryParam = generateQuery(params);
    const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
    window.open(printPreviewUrl);
  }, [selectedRowKeys]);

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          handlePrintPack(typePrint.detail);
          break;
        case 2:
          handlePrintPack(typePrint.simple);
          break;
        case 3:
          if(!selectedRowKeys || selectedRowKeys.length===0)break;
          setModalDeleteComfirm(true);
          break;
      }
    },
    [handlePrintPack,selectedRowKeys]
  );

  const handlePrint = () => { };

  const handleExportHVC = () => { };

  const handleAddPack = (item: any) => {
    history.push(
      `${UrlConfig.PACK_SUPPORT}/report-hand-over-update/${item.id_handover_record}`
    );
  };

  const actionColumn = (handlePrint: any, handleExportHVC: any, handleAddPack: any) => {
    const _actionColumn = {
      title: "",
      key: "14",
      visible: true,
      width: "80px",
      className: "saleorder-product-card-action text-center",
      render: (l: any, item: any, index: number) => {
        const menu = (
          <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
            <Menu.Item key="1">
              <Button
                icon={<img style={{ marginRight: 12 }} alt="" src={IconPrint} />}
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
                icon={<img style={{ marginRight: 12 }} alt="" src={IconVector} />}
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
                icon={<img style={{ marginRight: 12 }} alt="" src={IconPack} />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={() => {
                  handleAddPack(item);
                }}
              >
                Thêm đơn hàng vào biên bản
              </Button>
            </Menu.Item>
          </Menu>
        );
        return (
          <div
            style={{
              //display: "flex",
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
              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
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

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<GoodsReceiptsSearhModel>>
  >([
    {
      title: "ID biên bản bàn giao ",
      dataIndex: "id_handover_record",
      key: "id_handover_record",
      visible: true,
      align: "center",
      fixed: "left",
      width:"100px",
      render: (value: number) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`${UrlConfig.PACK_SUPPORT}/${value}`}>
              {value}
            </Link>
          </React.Fragment>
        );
      },
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "store_name",
      key: "store_name",
      visible: true,
      align: "center",
      //width:"200px",
    },

    {
      title: "Loại biên bản",
      dataIndex: "handover_record_type",
      key: "handover_record_type",
      visible: true,
      align: "center",
      width:"200px",
    },

    {
      title: "SL SP",
      dataIndex: "product_quantity",
      key: "product_quantity",
      visible: true,
      align: "center",
      width:"80px",
    },

    {
      title: "Số đơn ",
      dataIndex: "order_quantity",
      key: "order_quantity",
      visible: true,
      align: "center",
      width:"80px",
    },

    {
      title: "Đơn gửi HVC",
      dataIndex: "order_send_quantity",
      key: "order_send_quantity",
      visible: true,
      align: "center",
      width:"100px",
    },

    {
      title: "Đơn đang chuyển",
      dataIndex: "order_transport",
      key: "order_transport",
      visible: true,
      align: "center",
      width:"110px",
    },

    {
      title: "Đơn chưa lấy",
      dataIndex: "order_have_not_taken",
      key: "order_have_not_taken",
      visible: true,
      align: "center",
      width:"110px",
    },

    {
      title: "Đơn hủy",
      dataIndex: "order_cancel",
      key: "order_cancel",
      visible: true,
      align: "center",
      width:"80px",
    },

    {
      title: "Đang chuyển hoàn",
      dataIndex: "order_moving_complete",
      key: "order_moving_complete",
      visible: true,
      align: "center",
      width:"110px",
    },

    {
      title: "Đơn thành công",
      dataIndex: "order_success",
      key: "order_success",
      visible: true,
      align: "center",
      width:"110px",
    },

    {
      title: "Đơn hoàn",
      dataIndex: "order_complete",
      key: "order_complete",
      visible: true,
      align: "center",
      width:"80px",
    },

    {
      title: "Người tạo",
      dataIndex: "account_create",
      key: "account_create",
      visible: true,
      align: "center",
      width:"100px",
    },
    actionColumn(handlePrint, handleExportHVC, handleAddPack),
  ]);

  const columnFinal = useMemo(
    () => columns.filter((item: any) => item.visible === true),
    [columns]
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PACK_SUPPORT}?${queryParam}`);
    },
    [history, params]
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      //setIsFilter(true)
      history.push(`${UrlConfig.PACK_SUPPORT}?${queryParam}`);
    },
    [history, params]
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQueryGoodsReceipts);
    let queryParam = generateQuery(initQueryGoodsReceipts);
    history.push(`${UrlConfig.PACK_SUPPORT}?${queryParam}`);
  }, [history]);

  const onSelectedChange = useCallback((selectedRow) => {
    if (selectedRow[0]) {
      const selectedRowKeys = selectedRow.map((row: any) => row.id_handover_record);
      setSelectedRowKeys(selectedRowKeys);
    }else setSelectedRowKeys([]);
  }, []);

  const setDataTable = (data: PageResponse<GoodsReceiptsResponse>) => {
    let dataResult: Array<GoodsReceiptsSearhModel> = [];
    data.items.forEach((item: GoodsReceiptsResponse, index: number) => {
      let product_quantity = 0;
      let order_quantity = item.orders?.length ? item.orders?.length : 0;
      let order_send_quantity = 0;
      let order_transport = 0;
      let order_have_not_taken = 0;
      let order_cancel = 0;
      let order_moving_complete = 0;
      let order_success = 0;
      let order_complete = 0;

      item.orders?.forEach(function (itemOrder) {
        order_send_quantity =
          order_send_quantity +
          (itemOrder.fulfillments?.length ? itemOrder.fulfillments?.length : 0);

        //
        itemOrder.fulfillments?.forEach(function (itemFulfillment) {
          product_quantity =
            product_quantity +
            (itemFulfillment.total_quantity !== null
              ? itemFulfillment.total_quantity
              : 0);

          if (itemFulfillment.status === FulFillmentStatus.SHIPPING)
            order_transport = order_transport + 1;

          if (itemFulfillment.status === FulFillmentStatus.UNSHIPPED)
            order_have_not_taken = order_have_not_taken + 1;
          if (itemFulfillment.status === FulFillmentStatus.CANCELLED)
            order_cancel = order_cancel + 1;
          if (itemFulfillment.status === FulFillmentStatus.RETURNING)
            order_moving_complete = order_moving_complete + 1;
          if (itemFulfillment.status === FulFillmentStatus.SHIPPED)
            order_success = order_success + 1;
          if (itemFulfillment.status === FulFillmentStatus.RETURNED)
            order_complete = order_complete + 1;
        });
      });

      let _result: GoodsReceiptsSearhModel = {
        key: index,
        id_handover_record: item.id,
        store_name: item.store_name,
        handover_record_type: item.receipt_type_name, //loại biên bản
        product_quantity: product_quantity, // sl sản phẩm
        order_quantity: order_quantity, //SL đơn
        order_send_quantity: order_send_quantity, //Số đơn gửi hvc
        order_transport: order_transport, //Đơn đang chuyển
        order_have_not_taken: order_have_not_taken, //Đơn chưa lấy
        order_cancel: order_cancel, //đơn hủy
        order_moving_complete: order_moving_complete, //đơn hoàn chuyển
        order_success: order_success, //đơn thành công
        order_complete: order_complete, //đơn hoàn
        account_create: item.updated_by ? item.updated_by : "", //người tạo
      };

      dataResult.push(_result);

    });
    return dataResult;
  };

  const setLayoutDeleteAllGoodsReceipts=useMemo(()=>{
    let selectedOrder:GoodsReceiptsResponse[]=goodsReceipt.filter((p)=>selectedRowKeys.some((single:number)=>single.toString()===p.id.toString()));
    return(
      <React.Fragment>
        {selectedOrder.map((value: GoodsReceiptsResponse, index: number) => (
          <p style={{ lineHeight: "18px" }}>
            <Link target="_blank" to={`${UrlConfig.PACK_SUPPORT}/${value.id}`} key={index}>
            {value.id}- {value.delivery_service_name}-{" "}
                  {value.receipt_type_name}- {value.ecommerce_name}
            </Link>{" "}
            sẽ được xóa</p>
        ))}
      </React.Fragment>
    )
  },[goodsReceipt, selectedRowKeys])

  const hanldRemoveGoodsReceiptOk=useCallback(()=>{
    let request:any={
      ids:selectedRowKeys
    }
    dispatch(
      deleteAllGoodsReceipts(request, (data:GoodsReceiptsResponse) => {
        if (data) {
          dispatch(
            getGoodsReceiptsSerch(params, (data: PageResponse<GoodsReceiptsResponse>) => {
              let dataResult: Array<GoodsReceiptsSearhModel> = setDataTable(data);
              /////
              setData({
                metadata: {
                  limit: data.metadata.limit,
                  page: data.metadata.page,
                  total: data.metadata.total,
                },
                items: dataResult,
              });
              setTableLoading(false);
            })
          );
          setSelectedRowKeys([]);
          setModalDeleteComfirm(false);
          showSuccess(`Đã xóa biên bản bàn giao`);
        }
      })
    );
  },[dispatch, params, selectedRowKeys]);

  useEffect(() => {
    dispatch(
      getGoodsReceiptsSerch(params, (data: PageResponse<GoodsReceiptsResponse>) => {
        let dataResult: Array<GoodsReceiptsSearhModel> = setDataTable(data);
        /////
        setData({
          metadata: {
            limit: data.metadata.limit,
            page: data.metadata.page,
            total: data.metadata.total,
          },
          items: dataResult,
        });

        setGoodsReceipt(data.items);
        setTableLoading(false);
      })
    );
  }, [dispatch, params]);

  return (
    <>
      <div style={{ padding: "0px 24px 0 24px" }}>
        <PackFilter
          params={params}
          isLoading={false}
          actions={actions}
          onMenuClick={onMenuClick}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          onFilter={onFilter}
          onClearFilter={onClearFilter}
        />
      </div>
      <div style={{ padding: "0px 24px 0 24px" }}>
        {data.items && (
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 1650, y: 520 }}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
            // expandable={{
            //   expandedRowRender: record => <p style={{ margin: 0 }}>test</p>,
            // }}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            dataSource={data.items}
            columns={columnFinal}
            rowKey={(item: GoodsReceiptsSearhModel) => item.id_handover_record}
            className="order-list"
          //key={Math.random()}
          // onRow={(record: GoodsReceiptsSearhModel) => {
          //   return {
          //     onClick: () => {
          //       console.log("record",record);
          //     }, // click row
          //   };
          // }}
          />
        )}
      </div>

      {showSettingColumn && (
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
      )}

        <ModalDeleteConfirm
          onCancel={() => setModalDeleteComfirm(false)}
          onOk={hanldRemoveGoodsReceiptOk}
          title="Bạn chắc chắn xóa biên bản bàn giao?"
          subTitle={setLayoutDeleteAllGoodsReceipts}
          visible={modalDeleteComfirm}
        />
    </>
  );
};

export default PackReportHandOver;