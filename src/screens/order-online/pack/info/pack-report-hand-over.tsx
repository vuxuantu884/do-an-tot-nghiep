import { Button, Dropdown, Menu } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import threeDot from "assets/icon/three-dot.svg";
import IconVector from "assets/img/Vector.svg";
import IconPrint from "assets/icon/Print.svg";
// import IconPack from "assets/icon/Pack.svg";
import { GoodsReceiptsSearchQuery } from "model/query/goods-receipts.query";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAllGoodsReceipts,
  getGoodsReceiptsSerch,
  updateGoodsReceipts,
} from "domain/actions/goods-receipts/goods-receipts.action";
import { GoodsReceiptsSearhModel } from "model/pack/pack.model";
import { COLUMN_CONFIG_TYPE, FulFillmentStatus } from "utils/Constants";
import { getQueryParams } from "utils/useQuery";
import { useHistory } from "react-router";
import { convertFromStringToDate, generateQuery, haveAccess } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import PackFilter from "component/filter/pack.filter";
import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import { MenuAction } from "component/table/ActionButton";
import { Link } from "react-router-dom";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import useAuthorization from "hook/useAuthorization";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import AuthWrapper from "component/authorization/AuthWrapper";
import moment, { Moment } from "moment";
import EditNote from "screens/order-online/component/edit-note";
import { GoodsReceiptsRequest } from "model/request/pack.request";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";

const initQueryGoodsReceipts: GoodsReceiptsSearchQuery = {
  limit: 30,
  page: 1,
  sort_column: "",
  sort_type: "",
  ids: null,
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
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const orderPackContextData = useContext(OrderPackContext);
  const listStores = orderPackContextData?.listStores;

  let dataQuery: GoodsReceiptsSearchQuery = {
    ...initQueryGoodsReceipts,
    ...getQueryParams(query),
  };
  const [allowDeleteGoodsReceipt] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.DELETE_GOODS_RECEIPT],
    not: false,
  });

  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let [params, setPrams] = useState<GoodsReceiptsSearchQuery>(dataQuery);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [goodsReceipt, setGoodsReceipt] = useState<GoodsReceiptsResponse[]>([]);
  const [listStoresDataCanAccess, setListStoresDataCanAccess] = useState<Array<StoreResponse>>([]);

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const actions: Array<MenuAction> = useMemo(() => [
    {
      id: 1,
      name: "In biên bản đầy đủ ",
      icon: <PrinterOutlined />,
      disabled: selectedRowKeys.length === 0
    },
    {
      id: 2,
      name: "In biên bản rút gọn ",
      icon: <PrinterOutlined />,
      disabled: selectedRowKeys.length === 0
    },
    {
      id: 3,
      name: "Xóa",
      icon: <DeleteOutlined />,
      color: (allowDeleteGoodsReceipt && selectedRowKeys.length !== 0) ? "#E24343" : "rgba(0,0,0,.25)",
      disabled: !allowDeleteGoodsReceipt || selectedRowKeys.length === 0
    },
  ], [allowDeleteGoodsReceipt, selectedRowKeys.length]);

  const [modalDeleteComfirm, setModalDeleteComfirm] = useState(false);

  const handlePrintPack = useCallback((id = undefined, type: string) => {
    let params = {
      action: "print",
      ids: id ? [id] : selectedRowKeys,
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
          handlePrintPack(undefined, typePrint.detail);
          break;
        case 2:
          handlePrintPack(undefined, typePrint.simple);
          break;
        case 3:
          if (!selectedRowKeys || selectedRowKeys.length === 0) break;
          let selectedOrder: GoodsReceiptsResponse[] = goodsReceipt.filter((p) => selectedRowKeys.some((single: number) => single.toString() === p.id.toString()));
          console.log('selectedOrder', selectedOrder);

          let canDelete = true;
          let idError = "";
          selectedOrder.forEach(item => {
            if (item.orders && item.orders?.length) {
              canDelete = false;
              idError += item.id + " "
            }
          });
          if (canDelete) {
            setModalDeleteComfirm(true);
          } else {
            showWarning(`Biên bản bàn giao ${idError}có đơn hàng cần giao`);
          }
          break;
      }
    },
    [goodsReceipt, handlePrintPack, selectedRowKeys]
  );

  let delivery_services: Array<DeliveryServiceResponse> = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deliveryServices, setDeliveryServices] = useState<Array<DeliveryServiceResponse>>([]);
  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        delivery_services = response
        setDeliveryServices(response)
      })
    );
  }, [dispatch]);

  const handleAddPack = useCallback((item: any) => {
    history.push(
      `${UrlConfig.DELIVERY_RECORDS}/${item.id_handover_record}/update`
    );
  }, [history]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.DELIVERY_RECORDS}?${queryParam}`);
    },
    [history, params]
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      //setIsFilter(true)
      history.push(`${UrlConfig.DELIVERY_RECORDS}?${queryParam}`);
    },
    [history, params]
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQueryGoodsReceipts);
    let queryParam = generateQuery(initQueryGoodsReceipts);
    history.push(`${UrlConfig.DELIVERY_RECORDS}?${queryParam}`);
  }, [history]);

  const onSelectedChange = useCallback((selectedRow) => {
    if (selectedRow[0]) {
      const selectedRowKeys = selectedRow.map((row: any) => row.id_handover_record);
      setSelectedRowKeys(selectedRowKeys);
    } else setSelectedRowKeys([]);
  }, []);

  const setDataTable = (data: PageResponse<GoodsReceiptsResponse>) => {
    let dataResult: Array<GoodsReceiptsSearhModel> = [];

    data.items.forEach((item: GoodsReceiptsResponse, index: number) => {
      //let product_quantity = 0;
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
        //product_quantity += itemOrder.total_quantity||0;
        // itemOrder.fulfillments?.forEach(function (itemFulfillment) {
        //   product_quantity =
        //     product_quantity +
        //     (itemFulfillment.total_quantity !== null
        //       ? itemFulfillment.total_quantity
        //       : 0);

        //   if (itemFulfillment.status === FulFillmentStatus.SHIPPING)
        //     order_transport = order_transport + 1;

        //   if (itemFulfillment.status === FulFillmentStatus.UNSHIPPED)
        //     order_have_not_taken = order_have_not_taken + 1;
        //   if (itemFulfillment.status === FulFillmentStatus.CANCELLED)
        //     order_cancel = order_cancel + 1;
        //   if (itemFulfillment.status === FulFillmentStatus.RETURNING)
        //     order_moving_complete = order_moving_complete + 1;
        //   if (itemFulfillment.status === FulFillmentStatus.SHIPPED)
        //     order_success = order_success + 1;
        //   if (itemFulfillment.status === FulFillmentStatus.RETURNED)
        //     order_complete = order_complete + 1;
        // });
        if (itemOrder.fulfillment_status === FulFillmentStatus.SHIPPING)
          order_transport = order_transport + 1;

        if (itemOrder.fulfillment_status === FulFillmentStatus.UNSHIPPED)
          order_have_not_taken = order_have_not_taken + 1;
        if (itemOrder.fulfillment_status === FulFillmentStatus.CANCELLED)
          order_cancel = order_cancel + 1;
        if (itemOrder.fulfillment_status === FulFillmentStatus.RETURNING)
          order_moving_complete = order_moving_complete + 1;
        if (itemOrder.fulfillment_status === FulFillmentStatus.SHIPPED)
          order_success = order_success + 1;
        if (itemOrder.fulfillment_status === FulFillmentStatus.RETURNED)
          order_complete = order_complete + 1;
      });

      let _result: GoodsReceiptsSearhModel = {
        ...item,
        key: index,
        id_handover_record: item.id,
        store_name: item.store_name,
        handover_record_type: item.receipt_type_name, //loại biên bản
        total_quantity: item.total_quantity ? item.total_quantity : 0, // sl sản phẩm
        order_quantity: order_quantity, //SL đơn
        order_send_quantity: order_quantity, //Số đơn gửi hvc
        order_transport: order_transport, //Đơn đang chuyển
        order_have_not_taken: order_have_not_taken, //Đơn chưa lấy
        order_cancel: order_cancel, //đơn hủy
        order_moving_complete: order_moving_complete, //đơn hoàn chuyển
        order_success: order_success, //đơn thành công
        order_complete: order_complete, //đơn hoàn
        account_create: item.updated_by ? item.updated_by : "", //người tạo
        ecommerce_id: item.ecommerce_id,
        description: item.description,
        note: item.note,
        goods_receipts: item
      };
      console.log("dataResult", _result)
      dataResult.push(_result);

    });
    return dataResult;
  };

  const setLayoutDeleteAllGoodsReceipts = useMemo(() => {
    let selectedOrder: GoodsReceiptsResponse[] = goodsReceipt.filter((p) => selectedRowKeys.some((single: number) => single.toString() === p.id.toString()));
    return (
      <React.Fragment>
        {selectedOrder.map((value: GoodsReceiptsResponse, index: number) => (
          <p style={{ lineHeight: "18px" }}>
            <Link target="_blank" to={`${UrlConfig.DELIVERY_RECORDS}/${value.id}`} key={index}>
              {value.id}- {value.delivery_service_name}-{" "}
              {value.receipt_type_name}- {value.ecommerce_name}
            </Link>{" "}
            sẽ được xóa</p>
        ))}
      </React.Fragment>
    )
  }, [goodsReceipt, selectedRowKeys])

  const hanldRemoveGoodsReceiptOk = useCallback((id = undefined) => {
    let request: any = {
      ids: id ? [id] : selectedRowKeys
    }
    console.log('id', [id], selectedRowKeys);

    dispatch(
      deleteAllGoodsReceipts(request, (data: GoodsReceiptsResponse) => {
        if (data) {
          setTableLoading(true);
          dispatch(
            getGoodsReceiptsSerch({ ...params, page: 1 }, (data: PageResponse<GoodsReceiptsResponse>) => {
              if (data) {
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
              } else {
                setData({
                  metadata: {
                    limit: 30,
                    page: 1,
                    total: 0,
                  },
                  items: [],
                })
              }
              setTableLoading(false);
            })
          );
          setSelectedRowKeys([]);
          setModalDeleteComfirm(false);
          showSuccess(`Đã xóa biên bản bàn giao`);
        }
      })
    );
  }, [dispatch, params, selectedRowKeys]);

  const menu = (item: any) => {
    // console.log('allowDeleteGoodsReceipt', allowDeleteGoodsReceipt);
    return (
      <Menu
        className="yody-line-item-action-menu saleorders-product-dropdown"
      >
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
            onClick={() => handlePrintPack(item.id_handover_record, typePrint.detail)}
          >
            In biên bản đầy đủ
          </Button>
        </Menu.Item>
        <Menu.Item key="2">
          <Button
            icon={<img style={{ marginRight: 12 }} alt="" src={IconPrint} />}
            type="text"
            className=""
            style={{
              paddingLeft: 24,
              background: "transparent",
              border: "none",
            }}
            onClick={() => handlePrintPack(item.id_handover_record, typePrint.simple)}
          >
            In biên bản rút gọn
          </Button>
        </Menu.Item>

        <Menu.Item key="3">
          <Button
            icon={<img style={{ marginRight: 12 }} alt="" src={IconVector} />}
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
            Thêm đơn vào biên bản
          </Button>
        </Menu.Item>

        <Menu.Item key="4">
          <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.DELETE_GOODS_RECEIPT]} passThrough>
            {(isPassed: boolean) =>
              <Button
                icon={<DeleteOutlined />}
                type="text"
                className=""
                style={{
                  color: isPassed ? "#E24343" : "rgba(0,0,0,.25)",
                }}
                disabled={!isPassed}
                onClick={() => {
                  hanldRemoveGoodsReceiptOk(item.id_handover_record);
                }}
              >
                Xoá
              </Button>
            }
          </AuthWrapper>
        </Menu.Item>
      </Menu>
    );
  };

  const editNote = useCallback((id: number, data: GoodsReceiptsResponse, newNote: string) => {
    let goodsReceiptsCopy: any = { ...data }
    let codes = data.orders?.map((p) => p.fullfilement_code);
    let param: GoodsReceiptsRequest = {
      ...goodsReceiptsCopy,
      codes: codes,
      note: newNote
    }

    dispatch(
      updateGoodsReceipts(id, param, (data: GoodsReceiptsResponse) => {
        if (data) {
          setTableLoading(true);
          dispatch(
            getGoodsReceiptsSerch({ ...params, page: 1 }, (data: PageResponse<GoodsReceiptsResponse>) => {
              if (data) {
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
              } else {
                setData({
                  metadata: {
                    limit: 30,
                    page: 1,
                    total: 0,
                  },
                  items: [],
                })
              }
              setTableLoading(false);
            })
          );
          showSuccess("Cập nhập ghi chú biên bản thành công");
        }
      })
    );
  }, [dispatch, params])

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<GoodsReceiptsSearhModel>>
  >([
    {
      title: "ID",
      // key: "id_handover_record",
      visible: true,
      align: "center",
      fixed: "left",
      width: "120px",
      render: (l: any, item: any, index: number) => {

        const service_id = item.delivery_service_id;
        if (service_id === -1) {
          return (
            <React.Fragment>
              <Link target="_blank" to={`${UrlConfig.DELIVERY_RECORDS}/${item.id_handover_record}`}>
                {item.id_handover_record}
              </Link>
              <div style={{ fontSize: "0.86em", lineHeight: "1.25" }}>{moment(item?.created_date).format("DD/MM/YYYY HH:ss")}</div>
              <div className="shipment-details">
                Tự vận chuyển
              </div>
            </React.Fragment>
          );
        } else {
          const service = delivery_services.find((service) => service.id === service_id);
          return (
            <React.Fragment>
              <Link target="_blank" to={`${UrlConfig.DELIVERY_RECORDS}/${item.id_handover_record}`}>
                {item.id_handover_record}
              </Link>
              <div style={{ fontSize: "0.86em", lineHeight: "1.25" }}>{moment(item?.created_date).format("DD/MM/YYYY HH:ss")}</div>
              <div className="shipment-details">
                {service &&
                  <img
                    src={service.logo ? service.logo : ""}
                    alt=""
                    style={{ width: 100 }}
                  />
                }
              </div>
            </React.Fragment>
          );
        }
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
      key: "handover_record_type",
      visible: true,
      align: "center",
      width: "160px",
      render: (l: any, item: any, index: number) => {

        return (
          <div>
            <p style={{ marginBottom: 0 }} >{item.handover_record_type}</p>
            {item.ecommerce_id !== -1 && <p style={{ color: "#2A2A86", marginBottom: 0 }}>({item.ecommerce_name})</p>}
          </div>
        );
      },
    },

    {
      title: "SL SP",
      dataIndex: "total_quantity",
      key: "total_quantity",
      visible: true,
      align: "center",
      width: "80px",
    },

    {
      title: "Số đơn ",
      dataIndex: "order_quantity",
      key: "order_quantity",
      visible: true,
      align: "center",
      width: "80px",
    },

    {
      title: "Đơn gửi HVC",
      dataIndex: "order_send_quantity",
      key: "order_send_quantity",
      visible: true,
      align: "center",
      width: "100px",
    },

    {
      title: "Đơn đang chuyển",
      dataIndex: "order_transport",
      key: "order_transport",
      visible: true,
      align: "center",
      width: "110px",
    },

    {
      title: "Đơn chưa lấy",
      dataIndex: "order_have_not_taken",
      key: "order_have_not_taken",
      visible: true,
      align: "center",
      width: "80px",
    },

    {
      title: "Đang chuyển hoàn",
      dataIndex: "order_moving_complete",
      key: "order_moving_complete",
      visible: true,
      align: "center",
      width: "110px",
    },

    {
      title: "Đơn thành công",
      dataIndex: "order_success",
      key: "order_success",
      visible: true,
      align: "center",
      width: "110px",
    },

    // {
    //   title: "Đơn hoàn",
    //   dataIndex: "order_complete",
    //   key: "order_complete",
    //   visible: true,
    //   align: "center",
    //   width: "80px",
    // },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      width: "160px",
      align: "left",
      render: (value: string, record: GoodsReceiptsSearhModel) => (
        <div className="orderNotes">
          <div className="inner">
            <div className="single">
              <EditNote
                note={record?.note}
                //title="Khách hàng: "
                color={"#2a2a86"}
                onOk={(newNote) => {
                  editNote(record.id_handover_record, record.goods_receipts, newNote);
                }}
              // isDisable={record.status === OrderStatus.FINISHED}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Người tạo",
      dataIndex: "account_create",
      key: "account_create",
      visible: true,
      align: "center",
      width: "100px",
    },
    {
      title: "",
      key: "14",
      visible: true,
      width: "80px",
      fixed: "right",
      className: "saleorder-product-card-action text-center",
      render: (l: any, item: any, index: number) => {

        return (
          <Dropdown
            overlayStyle={{ minWidth: "15rem" }}
            overlay={() => menu(item)}
          // getPopupContainer={(trigger) => trigger}
          // trigger={["click"]}
          // placement="bottomRight"
          >
            <Button
              type="text"
              className="p-0 ant-btn-custom"
              icon={<img src={threeDot} alt=""></img>}
            />
          </Dropdown>
        );
      },
    }
  ]);

  // let newColumns = columns
  const columnFinal = useMemo(
    () => {
      return columns.filter((item: any) => item.visible === true)
    },
    [columns]
  );

  // cột column
  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(COLUMN_CONFIG_TYPE.orderDeliveryRecord)

  //cột của bảng
  useSetTableColumns(COLUMN_CONFIG_TYPE.orderDeliveryRecord, tableColumnConfigs, columns, setColumns)
  useEffect(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores.length > 0) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = listStores.filter((store) =>
          haveAccess(
            store.id,
            userReducer.account ? userReducer.account.account_stores : []
          )
        );
        setListStoresDataCanAccess(newData);
      }
      else {
        // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
        setListStoresDataCanAccess(listStores);
      }
    }
  }, [listStores, userReducer.account]);

  useEffect(() => {
    if (listStoresDataCanAccess && listStoresDataCanAccess.length > 0) {
      setTableLoading(true);
      let from_date: Moment | undefined = convertFromStringToDate(params.from_date, "yyyy-MM-dd'T'HH:mm:ss'Z'")?.startOf('day');
      let to_date: Moment | undefined = convertFromStringToDate(params.to_date, "yyyy-MM-dd'T'HH:mm:ss'Z'")?.endOf('day');

      let query = {
        ...params,
        from_date: from_date,
        to_date: to_date,
        store_ids: params.store_ids && params.store_ids.length > 0 ? params.store_ids : listStoresDataCanAccess.map(p => p.id),
      }

      console.log("query", query)
      dispatch(
        getGoodsReceiptsSerch(query, (data: PageResponse<GoodsReceiptsResponse>) => {
          if (data) {
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
          } else setData({
            metadata: {
              limit: 30,
              page: 1,
              total: 0,
            },
            items: [],
          })
          setTableLoading(false);
        })
      );
    }

  }, [dispatch, listStoresDataCanAccess, params]);

  return (
    <>
      <PackFilter
        params={params}
        isLoading={false}
        actions={actions}
        onMenuClick={onMenuClick}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onFilter={onFilter}
        onClearFilter={onClearFilter}
        deliveryServices={deliveryServices}
      />
      {data.items && (
        <CustomTable
          isRowSelection
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: 1550, y: 520 }}
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
          onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: GoodsReceiptsSearhModel) => item.id_handover_record}
        />
      )}

      {showSettingColumn && (
        <ModalSettingColumn
          visible={showSettingColumn}
          isSetDefaultColumn={false}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
            onSaveConfigTableColumn(data);
          }}
          data={columns}
        />
      )}

      <ModalDeleteConfirm
        onCancel={() => setModalDeleteComfirm(false)}
        onOk={() => hanldRemoveGoodsReceiptOk()}
        title="Bạn chắc chắn xóa biên bản bàn giao?"
        subTitle={setLayoutDeleteAllGoodsReceipts}
        visible={modalDeleteComfirm}
      />
    </>
  );
};

export default PackReportHandOver;
