import { PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Row, Space, Tag } from "antd";
import exportIcon from "assets/icon/export.svg";
import importIcon from "assets/icon/import.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import OrdersFilter from "component/filter/order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { DeliveryServicesGetList, getListOrderAction, PaymentMethodGetList, updateOrderPartial } from "domain/actions/order/order.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import {
	OrderItemModel,
	OrderModel,
	OrderPaymentModel,
	OrderSearchQuery
} from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
	OrderProcessingStatusModel,
	OrderProcessingStatusResponseModel
} from "model/response/order-processing-status.response";
import { DeliveryServiceResponse, OrderResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import queryString from "query-string";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { changeOrderStatusToPickedService } from "service/order/order.service";
import { exportFile, getFile } from "service/other/export.service";
import { generateQuery } from "utils/AppUtils";
import { OrderStatus, ShipmentMethod } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import EditNote from "./component/edit-note";
import ExportModal from "./modal/export.modal";
import "./scss/index.screen.scss";
import { nameQuantityWidth, StyledComponent } from "./split-orders.styles";
// import { fields_order, fields_order_standard } from "./common/fields.export";

const ACTION_ID = {
	printShipment: 4,
	printStockExport: 5,
}

const actions: Array<MenuAction> = [
  {
    id: ACTION_ID.printShipment,
    name: "In phiếu giao hàng",
    icon:<PrinterOutlined />
  },
  {
    id: ACTION_ID.printStockExport,
    name: "In phiếu xuất kho",
    icon:<PrinterOutlined />
  },
];



type PropsType = {
  location: any;
};

function OrdersScreen(props: PropsType)  {
	const EXPORT_IDs = {
		allOrders: 1,
		ordersOnThisPage: 2,
		selectedOrders: 3,
		ordersFound: 4,
	}

  const history = useHistory();
  const dispatch = useDispatch();

	const {location} = props;
  const queryParamsParsed:{ [key: string]: string | string[] | null; } = queryString.parse(location.search);

  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const initQuery: OrderSearchQuery = {
		page: 1,
		limit: 30,
		is_online: null,
		sort_type: null,
		sort_column: null,
		code: null,
		customer_ids: [],
		store_ids: [],
		source_ids: [],
		variant_ids: [],
		issued_on_min: null,
		issued_on_max: null,
		issued_on_predefined: null,
		finalized_on_min: null,
		finalized_on_max: null,
		finalized_on_predefined: null,
		ship_on_min: null,
		ship_on_max: null,
		ship_on_predefined: null,
		expected_receive_on_min: null,
		expected_receive_on_max: null,
		expected_receive_predefined: null,
		completed_on_min: null,
		completed_on_max: null,
		completed_on_predefined: null,
		cancelled_on_min: null,
		cancelled_on_max: null,
		cancelled_on_predefined: null,
		order_status: [],
		sub_status_code: [],
		fulfillment_status: [],
		payment_status: [],
		return_status: [],
		account_codes: [],
		assignee_codes: [],
		price_min: undefined,
		price_max: undefined,
		payment_method_ids: [],
		delivery_types: [],
		delivery_provider_ids: [],
		shipper_ids: [],
		note: null,
		customer_note: null,
		tags: [],
		reference_code: null,
		search_term: ""
	};
  let [params, setPrams] = useState<OrderSearchQuery>(initQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);
  
  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);
  let delivery_services: Array<DeliveryServiceResponse> = []
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

  const [data, setData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let data1: any = {
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  }

	const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status
  );

	const setSearchResult = useCallback((result: PageResponse<OrderModel> | false) => {
    setTableLoading(false);
    setIsFilter(false);
    if (!!result) {
      console.log('result result result', result);
      setData(result);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      data1 = result
    }
  }, []);

	const fetchData = useCallback(
		(params) => {
			return new Promise<void>((resolve, reject) => {
				setTableLoading(true);
				setIsFilter(true);
				dispatch(getListOrderAction(params, setSearchResult));
				resolve();
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[dispatch, setSearchResult],
	)

	const handleFetchData = useCallback(
		(params) => {
			fetchData(params).catch(() => {
				setTableLoading(false);
				setIsFilter(false);
			});
		},
		[fetchData],
	)

	const renderCustomerAddress = (orderDetail: OrderResponse) => {
		let html = orderDetail.customer_address;
		if(orderDetail.customer_ward) {
			html += ` - ${orderDetail.customer_ward}`;
		}
		if(orderDetail.customer_district) {
			html += ` - ${orderDetail.customer_district}`;
		}
		if(orderDetail.customer_city) {
			html += ` - ${orderDetail.customer_city}`;
		}
		return html;
	};

  const [columns, setColumn] = useState<Array<ICustomTableColumType<OrderModel>>>([
    {
      title: "ID đơn hàng",
      dataIndex: "code",
      render: (value: string, i: OrderModel) => {
        return (
          <React.Fragment>
            <Link  target="_blank" to={`${UrlConfig.ORDER}/${i.id}`} style={{fontWeight: 500}}>
              {value}
            </Link>
            <div style={{fontSize: "0.86em"}}>
              {moment(i.created_date).format("hh:mm DD-MM-YYYY")}
            </div>
            <div style={{fontSize: "0.86em", marginTop:5}}>
              <Link target="_blank" to={`${UrlConfig.STORE}/${i?.store_id}`}>
                {i.store}
              </Link>
            </div>
          </React.Fragment>
        )
      },
      visible: true,
      fixed: "left",
      className: "custom-shadow-td",
      width: 150,
    },
    {
      title: "Khách hàng",
      render: (record: OrderResponse) =>
				<div className="customer custom-td">
					<div className="name p-b-3" style={{ color: "#2A2A86" }}>
						<Link
							target="_blank"
							to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
							className="primary"
						>
							{record.customer}
						</Link>{" "}
					</div>
					{/* <div className="p-b-3">{record.shipping_address.phone}</div>
					<div className="p-b-3">{record.shipping_address.full_address}</div> */}
					{record.customer_phone_number && (
						<div className="p-b-3">
							<a href={`tel:${record.customer_phone_number}`}>
								{record.customer_phone_number}
							</a>
						</div>
					)}
					<div className="p-b-3">{renderCustomerAddress(record)}</div>
				</div>,
      key: "customer",
      visible: true,
      width: 150,
    },
    {
      title: (
        <div className="productNameQuantityHeader">
          <span className="productNameWidth">Sản phẩm</span>
          <span className="quantity quantityWidth">
            <span>SL</span>
          </span>
        </div>
      ),
      dataIndex: "items",
      key: "productNameQuantity",
      className: "productNameQuantity",
      render: (items: Array<OrderItemModel>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td">
                  <div className="product productNameWidth 2">
										<div className="inner">
											<Link
												target="_blank"
												to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
											>
												{item.sku} 
											</Link>
											<br/>
											<div className="productNameText" title={item.variant}>
												{item.variant}
											</div>
										</div>
                    
                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: nameQuantityWidth,
    },
    // {
    //   title: "Kho cửa hàng",
    //   dataIndex: "store",
    //   key: "store",
    //   visible: true,
    //   align: "center",
    // },
    {
      title: "Khách phải trả",
      // dataIndex: "",
      render: (record: any) => (
        <>
          <span>
            <NumberFormat
              value={record.total_line_amount_after_line_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </span>
          <br />
          <span style={{ color: "#EF5B5B" }}>
            {" "}
            -
            <NumberFormat
              value={record.total_discount}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
            />
          </span>
        </>
      ),
      key: "customer.amount_money",
      visible: true,
      align: "right",
      width: 120,
    },
    {
      title: "HT Vận chuyển",
      key: "shipment.type",
      render: (record: any) => {
        if (record.fulfillments.length) {
          const newFulfillments = record.fulfillments?.sort((a: any, b: any) => b.id - a.id)
          if (newFulfillments[0].shipment) {
            switch (newFulfillments[0].shipment.delivery_service_provider_type) {
              case ShipmentMethod.EXTERNAL_SERVICE:
                const service_code = newFulfillments[0].shipment.delivery_service_provider_code;
                const service = delivery_services.find((service) => service.external_service_code === service_code);
                return (
                  service && (
                    <img
                      src={service.logo ? service.logo : ""}
                      alt=""
                      style={{ maxWidth: "100%" }}
                    />
                  )
                );
              case ShipmentMethod.SHIPPER:
                return `Đối tác - ${newFulfillments[0].shipment.shipper_code} - ${newFulfillments[0].shipment.shipper_name}`;
              case ShipmentMethod.PICK_AT_STORE:
                return `Nhận tại - ${record.store}`;
              default: return ""
            }
          }
        }
        return ""
      },
      visible: true,
      width: 140,
      align: "center",
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      render: (status_value: string) => {
				if(!status_order) {
					return "";
				}
        const status = status_order.find((status) => status.value === status_value);
        return (
          <div>
            {status_value === OrderStatus.DRAFT && (
              <div
                style={{
                  background: "#F5F5F5",
                  borderRadius: "100px",
                  color: "#666666",
                  padding: "3px 10px",
                }}
              >
                {status?.name}
              </div>
            )}

						{status_value === OrderStatus.FINALIZED && (
              <div
                style={{
                  background: "rgba(42, 42, 134, 0.1)",
                  borderRadius: "100px",
                  color: "#2A2A86",
                  padding: "5px 10px",
                }}
              >
                {status?.name}
              </div>
            )}

						{status_value === OrderStatus.FINISHED && (
              <div
                style={{
                  background: "rgba(39, 174, 96, 0.1)",
                  borderRadius: "100px",
                  color: "#27AE60",
                  padding: "5px 10px",
                }}
              >
                {status?.name}
              </div>
            )}

						{status_value === OrderStatus.CANCELLED && (
              <div
                style={{
                  background: "rgba(226, 67, 67, 0.1)",
                  borderRadius: "100px",
                  color: "#E24343",
                  padding: "5px 10px",
                }}
              >
                {status?.name}
              </div>
            )}
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 150
    },
		{
      title: "Đóng gói",
      key: "packed_status",
      render: (record: any) => {
        let processIcon = "icon-blank";
        if (record.fulfillments.length) {
          const newFulfillments = record.fulfillments?.sort((a: any, b: any) => b.id - a.id)
          processIcon = newFulfillments[0].packed_on ? "icon-full" : "icon-blank";
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 80,
    },
    {
      title: "Xuất kho",
      key: "received_status",
      render: (record: any) => {
        let processIcon = "icon-blank";
        if (record.fulfillments.length) {
          const newFulfillments = record.fulfillments?.sort((a: any, b: any) => b.id - a.id)
          processIcon = newFulfillments[0].export_on ? "icon-full" : "icon-blank";
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 80,
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "partial_paid":
            processIcon = "icon-partial";
            break;
          case "paid":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 80,
    },
    {
      title: "Trả hàng",
      dataIndex: "return_status",
      key: "return_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case "unreturned":
            processIcon = "icon-blank";
            break;
          case "returned":
            processIcon = "icon-full";
            break;
          default:
            processIcon = "icon-blank";
            break;
        }
        return (
          <div className="text-center">
            <div className={processIcon} />
          </div>
        );
      },
      visible: true,
      align: "center",
      width: 80,
    },
		{
      title: "Tổng SL",
      dataIndex: "total_quantity",
      key: "total_quantity",
      visible: true,
      align: "center",
      width: 70,
    },
		{
      title: "Kho cửa hàng",
      dataIndex: "store",
      key: "store",
      visible: true,
      align: "center",
			render: (value, record: OrderModel) => 
				<Link  target="_blank" to={`${UrlConfig.STORE}/${record.store_id}`}>
					{value}
				</Link>
      ,
      width: 140,
    },
		{
      title: "Nguồn đơn hàng",
      dataIndex: "source",
      key: "source",
      visible: true,
      align: "center",
      width: 140,
    },
		{
      title: "Khách đã trả",
      dataIndex: "payments",
      key: "customer.paid",
      render: (payments: Array<OrderPaymentModel>) => {
        let total = 0;
        payments.forEach((payment) => {
          total += payment.amount;
        });
        return (
          <NumberFormat
            value={total}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        );
      },
      visible: true,
      align: "center",
			width: 100,
    },
    {
      title: "Còn phải trả",
      key: "customer.pay",
      render: (order: OrderModel) => {
        let paid = 0;
        order.payments.forEach((payment) => {
          paid += payment.amount;
        });
        const missingPaid = order.total_line_amount_after_line_discount
          ? order.total_line_amount_after_line_discount - paid
          : 0;
        return (
          <NumberFormat
            value={missingPaid > 0 ? missingPaid : 0}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        );
      },
      visible: true,
      align: "center",
			width: 100,
    },
    {
      title: "HT thanh toán",
      dataIndex: "payments",
      key: "payments.type",
      render: (payments: Array<OrderPaymentModel>) =>
        payments.map((payment) => {
          return <Tag>{payment.payment_method}</Tag>;
        }),
      visible: true,
      align: "center",
      width: 120
    },
		{
      title: "Nhân viên bán hàng",
			render: (value, record: OrderModel) => 
				<Link  target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
					{`${record.assignee_code} - ${record.assignee}`}
				</Link>
      ,
      key: "assignee",
      visible: true,
      align: "center",
      width: 150
    },
    {
      title: "Nhân viên tạo đơn",
			render: (value, record: OrderModel) => 
				<Link  target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}>
					{`${record.account_code} - ${record.account}`}
				</Link>
      ,
      key: "account",
      visible: true,
      align: "center",
      width: 150
    },
		{
      title: "Ngày tạo đơn",
      dataIndex: "created_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "created_date",
      visible: true,
			width: 170,
    },
		{
      title: "Ngày hoàn tất đơn",
      dataIndex: "finished_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "finished_on",
      visible: true,
			width: 170,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "cancelled_on",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      key: "cancelled_on",
      visible: true,
			width: 170,
    },
    {
      title: "Ghi chú nội bộ",
      render: (record) => 
        <EditNote note={record.note} onOk={(newNote) => {
          console.log('newNote', newNote);
          editNote(newNote, 'note', record.id)
        }} />
      ,
      key: "note",
      visible: true,
      align: "center",
			width: 200,
    },
    {
      title: "Ghi chú của khách",
      render: (record) => 
        <EditNote note={record.customer_note} onOk={(newNote) => {
          console.log('newNote', newNote);
          editNote(newNote, 'customer_note', record.id)
        }} />
      ,
      key: "customer_note",
      visible: true,
      align: "center",
			width: 200,
    },
    {
      title: "Tag",
      dataIndex: "tags",
      render: (values, record: OrderModel) => {
				let result:React.ReactNode = null;
				if(record?.tags) {
					const listTags = record?.tags.split(",")
					console.log('listTags', listTags)
					if(listTags && listTags.length > 0) {
						result = listTags.map(tag => {
							return (
								<Tag>{tag}</Tag>
							)
						})
					}
				}
				return result
			},
      key: "tags",
      visible: true,
      align: "center",
			width: 140,
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "linked_order_code",
      key: "linked_order_code",
			render: (value) => 
				<Link  target="_blank" to={`${UrlConfig.ORDER}/${value}`}>
					{value}
				</Link>
      ,
      visible: true,
			width: 120,
    },
  ]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowCodes, setSelectedRowCodes] = useState([]);
  const [selectedRow, setSelectedRow] = useState<OrderResponse[]>([]);

  
  const onSelectedChange = useCallback((selectedRow) => {
    setSelectedRow(selectedRow);
    const selectedRowKeys = selectedRow.map((row: any) => row.id);
    setSelectedRowKeys(selectedRowKeys);

    const selectedRowCodes = selectedRow.map((row: any) => row.code);
    setSelectedRowCodes(selectedRowCodes);
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      history.push(`${UrlConfig.ORDER}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery(newPrams);
			if(currentParam === queryParam) {
				handleFetchData(newPrams);
			} else {
				history.push(`${UrlConfig.ORDER}?${queryParam}`);
			}
    },
    [handleFetchData, history, params]
  );
  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.ORDER}?${queryParam}`);
  }, [history, initQuery]);

  const onMenuClick = useCallback(
    (index: number) => {
      let params = {
        action: "print",
        ids: selectedRowKeys,
        "print-type": index === ACTION_ID.printShipment ? "shipment" : "stock_export",
        "print-dialog": true,
      };
      const queryParam = generateQuery(params);
      console.log(queryParam);
      switch (index) {
        case ACTION_ID.printShipment:
          let ids:number[] = [];
          selectedRow.forEach((row) => row.fulfillments?.forEach((single) => {
            ids.push(single.id)
          }));
          dispatch(showLoading());
          changeOrderStatusToPickedService(ids).then((response) => {
            switch (response.code) {
              case HttpStatus.SUCCESS:
                setData(response.data);
                break;
              case HttpStatus.UNAUTHORIZED:
                dispatch(unauthorizedAction());
                break;
              default:
                response.errors.forEach((e: any) => showError(e));
                break;
            }
          }).catch((error) => {
            console.log('error', error);
          }).finally(()=> {
            dispatch(hideLoading());
            
          })
          // history.push(`${UrlConfig.ORDER}/print-preview?${queryParam}`);
          const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
          window.open(printPreviewUrl);
          break;
        case ACTION_ID.printStockExport:
          // history.push(`${UrlConfig.ORDER}/print-preview?${queryParam}`);
          const printPreviewUrlExport = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
          window.open(printPreviewUrlExport);
          break;
        default:
          break;
      }
    },
    [dispatch, selectedRow, selectedRowKeys]
  );

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);

  const onExport = useCallback(
    (optionExport, typeExport) => {
      let newParams: any = { ...params };
      // let hiddenFields = [];
      console.log("selectedRowCodes", selectedRowCodes);
      switch (optionExport) {
        case EXPORT_IDs.allOrders:
          newParams = {};
          break;
        case EXPORT_IDs.ordersOnThisPage:
          break;
        case EXPORT_IDs.selectedOrders:
          newParams.code = selectedRowCodes;
          console.log("newParams", newParams);
          break;
        case EXPORT_IDs.ordersFound:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }
      // console.log('newParams', newParams);

      // switch (optionExport) {
      //   case 1:
      //     hiddenFields
      //     break
      //   case 2:
      //     delete newParams.page
      //     delete newParams.limit
      //     break
      //   default: break
      // }
      // }

      let queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: "EXPORT_ORDER",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(2);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch((error) => {
          setStatusExport(4);
          console.log("orders export file error", error);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    [params, selectedRowCodes, EXPORT_IDs, listExportFile]
  );
  const checkExportFile = useCallback(() => {
    console.log("start check status");

    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (exportProgress < 95) {
            setExportProgress(exportProgress + 3);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3);
            console.log("finishhh");
            setExportProgress(100);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url);
            setListExportFile(newListExportFile);
          }
        }
      });
    });
  }, [exportProgress, listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setDataAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  };

  const onSuccessEditNote = useCallback((newNote, noteType, orderID) => {
    console.log('ok ok');
    const indexOrder = data1.items.findIndex((item: any) => item.id === orderID)
    const newItems = [...data1.items]
    console.log('data', data1);
    if (indexOrder > -1) {
      const newItem: any = newItems[indexOrder]
      newItems.splice(indexOrder, 1, {
        ...newItem,
        note: noteType === 'note' ? newNote : newItem.note,
        customer_note: noteType === 'customer_note' ? newNote : newItem.customer_note
      })
    }
    const newData = {
      ...data1,
      items: newItems
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    data1 = newData
    setData(newData)
  }, [data1]);
  const editNote = useCallback((newNote, noteType, orderID) => {
    console.log('newNote, noteType, orderID', newNote, noteType, orderID);
    let params:any = {}
    if (noteType === 'note') {
      params.note = newNote
    }
    if (noteType === 'customer_note') {
      params.customer_note = newNote
    }
    dispatch(updateOrderPartial(params, orderID, () => onSuccessEditNote(newNote, noteType, orderID)))
  }, [dispatch, onSuccessEditNote]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(PaymentMethodGetList(
      (data) => {
        data.push({
          name: 'COD',
          code: 'cod',
          id: 0
        })
        setListPaymentMethod(data)
      }
    ));
    dispatch(
      actionFetchListOrderProcessingStatus(
        {},
        (data: OrderProcessingStatusResponseModel) => {
          setListOrderProcessingStatus(data.items);
        }
      )
    );
  }, [dispatch]);

	useEffect(() => {
		let dataQuery: OrderSearchQuery = {
			...initQuery,
			...getQueryParamsFromQueryString(queryParamsParsed),
		};
    setPrams(dataQuery);
		handleFetchData(dataQuery)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, handleFetchData, setSearchResult, location.search]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Danh sách đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Danh sách đơn hàng",
          },
        ]}
        extra={
          <Row>
            <Space>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.IMPORT]} passThrough>
                {(isPassed: boolean) => 
                <Button
                  type="default"
                  className="light"
                  size="large"
                  icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
                  onClick={() => {}}
                  disabled={!isPassed}
                >
                  Nhập file
                </Button>}
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.EXPORT]} passThrough>
                {(isPassed: boolean) => 
                <Button
                  type="default"
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                  // onClick={onExport}
                  onClick={() => {
                    console.log("export");
                    setShowExportModal(true);
                  }}
                  disabled={!isPassed}
                >
                  Xuất file
                </Button>}
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
                {(isPassed: boolean) => 
                <ButtonCreate path={`${UrlConfig.ORDER}/create`} disabled={!isPassed} child="Thêm mới đơn hàng"/>}
              </AuthWrapper>
              
            </Space>
          </Row>
        }
      >
        <Card>
          <OrdersFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={listStore}
            accounts={accounts}
            deliveryService={deliveryServices}
            listPaymentMethod={listPaymentMethod}
            subStatus={listOrderProcessingStatus}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 2400 * columnFinal.length/(columns.length ? columns.length : 1)}}
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
            rowKey={(item: OrderModel) => item.id}
            className="order-list"
          />
        </Card>

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data);
          }}
          data={columns}
        />
        {showExportModal && (
          <ExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false);
              setExportProgress(0);
              setStatusExport(1);
            }}
            onOk={(optionExport, typeExport) => onExport(optionExport, typeExport)}
            type="orders"
            total={data.metadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            selected={selectedRowCodes.length ? true : false}
          />
        )}
      </ContentContainer>
    </StyledComponent>
  );
};
export default withRouter(OrdersScreen);
