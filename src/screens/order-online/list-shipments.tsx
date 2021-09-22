/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Card, Col, Modal, Row, Space, Tag, Table } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
import ShipmentFilter from "component/filter/shipment.filter";
import { RootReducerType } from "model/reducers/RootReducerType";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { Item, Shipment, ShipmentModel, ShipmentSearchQuery } from "model/order/shipment.model";
import { AccountResponse } from "model/account/account.model";
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
// import { hideLoading, showLoading } from "domain/actions/loading.action";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { getListReasonRequest, getShipmentsAction } from "domain/actions/order/order.action";
import './scss/index.screen.scss'
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import NumberFormat from "react-number-format";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import { OrderProcessingStatusModel, OrderProcessingStatusResponseModel } from "model/response/order-processing-status.response";
import ImageGHTK from "assets/img/imageGHTK.svg";
import ImageGHN from "assets/img/imageGHN.png";
import ImageVTP from "assets/img/imageVTP.svg";
import ImageDHL from "assets/img/imageDHL.svg";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
  {
    id: 2,
    name: "Export",
  },
];

const initQuery: ShipmentSearchQuery = {
  page: 1,
  limit: 30,
  sort_type: null,
  sort_column: null,
  search_term: null,
  status: [],
  stock_location_ids: [],
  delivery_provider_ids: [],
  delivery_types: [],
  shipper_ids: [],
  reference_status: [],
  packed_on_min: null,
  packed_on_max: null,
  packed_on_predefined: null,
  exported_on_min: null,
  exported_on_max: null,
  exported_on_predefined: null,
  ship_on_min: null,
  ship_on_max: null,
  ship_on_predefined: null,
  received_on_min: null,
  received_on_max: null,
  received_predefined: null,
  cancelled_on_min: null,
  cancelled_on_max: null,
  cancelled_on_predefined: null,
  print_status: [],
  store_ids: [],
  source_ids: [],
  account_codes: [],
  shipping_address: null,
  variant_ids: [],
  note: null,
  customer_note: null,
  tags: [],
  cancel_reason: [],
};

const columnsItems  = [
  {
    title: "STT",
    dataIndex: "index",
    visible: true,
    width:"30px",
  },
  {
    title: "Mã SKU",
    dataIndex: "sku",
    visible: true,
    width:"150px",
  },
  {
    title: "Tên sản phẩm",
    dataIndex: "variant",
    visible: true,
    width: "200px",
  },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    visible: true,
    width: "50px",
  },
  {
    title: "Đơn giá",
    dataIndex: "price",
    visible: true,
    width: "100px",
  },
  {
    title: "Thành tiền",
    render: (record: any) => (
      <NumberFormat
        value={100000}
        className="foo"
        displayType={"text"}
        thousandSeparator={true}
      />
    ),
    visible: true,
    width: "150px",
  },
];

const ListOrderScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
 
  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.variant_status;
  });
  const [tableLoading, setTableLoading] = useState(true);
  const isFirstLoad = useRef(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
    useState<Array<AccountResponse>>();
  let dataQuery: ShipmentSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<ShipmentSearchQuery>(dataQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [reasons, setReasons] = useState<Array<{id: number; name: string}>>([]);
  
  const [data, setData] = useState<PageResponse<ShipmentModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  
  const status_order = [
    {name: "Nháp", value: "draft"},
    {name: "Đóng gói", value: "packed"},
    {name: "Xuất kho", value: "shipping"},
    {name: "Đã xác nhận", value: "finalized"},
    {name: "Hoàn thành", value: "completed"},
    {name: "Kết thúc", value: "finished"},
    {name: "Đã huỷ", value: "cancelled"},
    {name: "Đã hết hạn", value: "expired"},
  ]
  const delivery_service = [
    {
      code: "ghtk",
      id: 1,
      logo: ImageGHTK,
      name: "Giao hàng tiết kiệm"
    },
    {
      code: "ghn",
      id: 2,
      logo: ImageGHN,
      name: "Giao hàng nhanh"
    },
    {
      code: "vtp",
      id: 3,
      logo: ImageVTP,
      name: "Viettel Post"
    },
    {
      code: "dhl",
      id: 4,
      logo: ImageDHL,
      name: "DHL"
    }
  ]
  
  const shipmentDetailModal = useCallback(
    (record: any) => {
      Modal.info({
        title: `Chi tiết đơn hàng ${record.code}`,
        content: (
          <Row gutter={16}>
            <Col span={16}>
              <Table
                dataSource={record.items.map((item: any, index: number) => {
                  return {
                    ...item,
                    index: index +1
                  }
                })}
                columns={columnsItems}
                pagination={false}
              />
              <div className="customer">
                <div style={{ display: 'flex', justifyContent: 'flex-end', height: '50px', marginTop: '20px', marginRight: '85px' }}>
                  <div>Tổng tiền:</div>
                  <div style={{ color: "#2A2A86", width: '135px', display: 'flex', justifyContent: 'flex-end' }}>
                    <NumberFormat
                      value={record.total}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', height: '50px', marginRight: '85px' }}>
                  <div>Chiết khấu:</div>
                  <div style={{ color: "#2A2A86", width: '135px', display: 'flex', justifyContent: 'flex-end' }}>
                    <NumberFormat
                      value={record.total_discount? record.total_discount : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', height: '50px', marginRight: '85px' }}>
                  <div>Phí giao hàng:</div>
                  <div style={{ color: "#2A2A86", width: '135px', display: 'flex', justifyContent: 'flex-end' }}>
                    <NumberFormat
                      value={record.shipment.delivery_fee ? record.shipment.delivery_fee : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', height: '50px', marginRight: '85px' }}>
                  <div>COD:</div>
                  <div style={{ color: "#2A2A86", width: '135px', display: 'flex', justifyContent: 'flex-end' }}>
                    <NumberFormat
                      value={record.shipment.cod ? record.shipment.cod : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                
              </div>
            </Col>
            <Col span={8}>
              {record.shipping_address && (
              <div className="customer">
                <div style={{ height: '50px', display: 'flex'}}>
                  <div style={{ width: '100px'}}>Người nhận:</div>
                  <div style={{ color: "#2A2A86" }}>{record.shipping_address.name}</div>
                </div>
                <div style={{ height: '50px', display: 'flex' }}>
                  <div style={{ width: '100px'}}>SĐT:</div>
                  <div style={{ color: "#2A2A86" }}>{record.shipping_address.phone}</div>
                </div>
                <div style={{ height: '50px', display: 'flex' }}>
                  <div style={{ width: '100px'}}>Địa chỉ:</div>
                  <div style={{ color: "#2A2A86" }}>{record.shipping_address.full_address}</div>
                </div>
              </div>)}
            </Col>
          </Row>
        ),
        maskClosable: true,
        width: '1200px'
      })
    },
    []
  );
  const [columns, setColumn]  = useState<Array<ICustomTableColumType<ShipmentModel>>>([
    {
      title: "Mã đơn giao",
      // dataIndex: "code",
      // render: (value: string, i: ShipmentModel) => (
      //   <Link to={`${UrlConfig.ORDER}/${i.id}`}>{value}</Link>
      // ),
      render: (record: ShipmentModel) => (
        <div>
          <div
            onClick={() => shipmentDetailModal(record)}
            className="name p-b-3" style={{ color: "#2A2A86" }}
          >
            {record.code}
          </div>
          <div>{record.created_date ? ConvertUtcToLocalDate(record.created_date) : ''}</div>
        </div>
      ),
      visible: true,
      fixed: 'left',
      width:"120px",
    },
    {
      title: "Mã vận đơn",
      dataIndex: "shipment",
      render: (shipment: any) => (
        shipment?.tracking_code
      ),
      visible: true,
      width:"120px",
    },
    {
      title: "Người nhận",
      dataIndex: "shipping_address",
      render: (shipping_address: any) => (
        shipping_address && (
        <div className="customer">
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>{shipping_address.name}</div>
          <div className="p-b-3">{shipping_address.phone}</div>
          <div className="p-b-3">{shipping_address.full_address}</div>
        </div>
      )),
      key: "customer",
      visible: true,
      width: "5%",
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items.name",
      render: (items: Array<Item>) => (
        <div className="items">
           {items.map((item, i) => {
            return (
              <div className="item custom-td" style={{ width: "100%" }}>
                <div className="item-sku">{item.variant}</div>
              </div>
            );
          })}
        </div>
      ),
      visible: true,
      align: "left",
      width: "6.5%",
    },

    {
      title: "SL",
      dataIndex: "items",
      key: "items.name",
      render: (items: Array<Item>) => (
        <div className="items">
          {items.map((item, i) => {
            return (
              <div className="item custom-td" style={{ width: "100%" }}>
                <div className="item-quantity">{item.quantity}</div>
              </div>
            );
          })}
        </div>
      ),
      visible: true,
      align: "center",
      width: "1.3%",
    },
    
    {
      title: "Tiền COD",
      dataIndex: "shipment",
      render: (value) => (
        <NumberFormat
          value={value.cod}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      key: "cod",
      visible: true,
      align:"right"
    },
    {
      title: "HTVC",
      dataIndex: "shipment",
      render: (shipment: Shipment) => {
        const service_id = shipment.delivery_service_provider_id
        const service = delivery_service.find(service => service.id === service_id)
        return(
          service && (
            <img
              src={service.logo ? service.logo : ""}
              alt=""
              style={{ width: "100%", height: "30px" }}
            />
          )
        )
      },
      key: "shipment.type",
      visible: true,
      width: "3.5%",
      align:"center"
    },
    {
      title: "Trạng thái giao vận",
      dataIndex: "status",
      key: "status",
      render: (status_value: string) => {
        const status = status_order.find(status => status.value === status_value)
        return <div style={{background:"rgba(42, 42, 134, 0.1)", borderRadius:"100px", color:"#2A2A86"}}>{status?.name}</div>;
      },
      visible: true,
      align: "center",
      width:"4.3%"
    },
    
    {
      title: "Tổng SL sản phẩm",
      dataIndex: "total_quantity",
      key: "total_quantity",
      visible: true,
      align: "center",
    },
    
    {
      title: "Phí trả đối tác",
      dataIndex: "shipment",
      render: (value) => value.shipping_fee_paid_to_three_pls,
      key: "shipping_fee_paid_to_three_pls",
      visible: true,
    },
    // {
    //   title: "Khách đã trả",
    //   dataIndex: "total",
    //   key: "total",
    //   visible: true,
    // },
    
    {
      title: "Ngày giao hàng",
      dataIndex: "shipped_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "shipped_on",
      visible: true,
      align: "center",
    },
    {
      title: "Nhân viên tạo đơn giao",
      dataIndex: "account_code",
      key: "account_code",
      visible: true,
      align: "center",
    },
    {
      title: "Ngày tạo đơn",
      dataIndex: "created_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "shipped_on",
      visible: true,
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "received_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "received_on",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "cancel_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "cancel_date",
      visible: true,
    },
    {
      title: "Lý do huỷ giao",
      dataIndex: "shipment",
      render: (shipment: any) => <div>{shipment.cancel_reason}</div>,
      key: "cancel_date",
      visible: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "shipment.note_to_shipper",
      key: "note_to_shipper",
      visible: true,
    },
    {
      title: "Tỉnh thành",
      dataIndex: "shipping_address",
      render: (shipping_address: any) => (
        shipping_address && (shipping_address.city)),
      key: "city",
      visible: true,
    },
    {
      title: "Quận huyện",
      dataIndex: "shipping_address",
      render: (shipping_address: any) => (
        shipping_address && (shipping_address.district)),
      key: "district",
      visible: true,
    },
    {
      title: "Trạng thái đối soát",
      dataIndex: "reference_code",
      key: "reference_code",
      visible: true,
    }
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.SHIPMENTS}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      console.log('values filter 1', values)
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      console.log('filter start', `${UrlConfig.SHIPMENTS}?${queryParam}`)
      history.push(`${UrlConfig.SHIPMENTS}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);

  const setSearchResult = useCallback(
    (result: PageResponse<ShipmentModel>|false) => {
      setTableLoading(false);
      if(!!result) {
        setData(result);
      }
    },
    []
  );
  
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);
  
  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  
  useEffect(() => {
    if (isFirstLoad.current) {
      setTableLoading(true);
    }
    isFirstLoad.current = false;
    setTableLoading(true);
    dispatch(getShipmentsAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(getListReasonRequest(setReasons));
  }, [dispatch, setDataAccounts]);
  
  return (
    <ContentContainer
      title="Danh sách đơn giao hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
         path: UrlConfig.HOME,
        },
        {
          name: "Danh sách đơn giao hàng",
        },
      ]}
      extra={
        <Row>
          <Space>
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
              onClick={() => {}}
            >
              Nhập file
            </Button>
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
              // onClick={onExport}
              onClick={() => {
                // setShowExportModal(true);
              }}
            >
              Xuất file
            </Button>
            <ButtonCreate path={`${UrlConfig.ORDER}/create`} />
          </Space>
        </Row>
      }
    >
      <Card>
        <div className="padding-20">
        <ShipmentFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          params={params}
          listSource={listSource}
          listStore={listStore}
          accounts={accounts}
          reasons={reasons}
          deliveryService={delivery_service}
          onShowColumnSetting={() => setShowSettingColumn(true)}
        />
        <CustomTable
          isRowSelection
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: 3630, y: "50vh" }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          // expandable={{
          //   expandedRowRender: record => <p style={{ margin: 0 }}>test</p>,
          // }}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: ShipmentModel) => item.id}
          className="order-list"
        />
        </div>
      </Card>
      
      <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data)
          }}
          data={columns}
        />
    </ContentContainer>
  );
};

export default ListOrderScreen;
