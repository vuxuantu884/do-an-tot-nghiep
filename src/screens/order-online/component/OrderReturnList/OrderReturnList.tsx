import { DeleteOutlined, ExclamationCircleOutlined, ExportOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Radio, Row, Space, Tooltip } from "antd";
import exportIcon from "assets/icon/export.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ReturnFilter from "component/filter/return.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, {
  ICustomTableColumType
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { HttpStatus } from "config/http-status.config";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  getListReasonRequest,
  getReturnsAction,
} from "domain/actions/order/order.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { OrderTypeModel } from "model/order/order.model";
import { ReturnModel, ReturnSearchQuery } from "model/order/return.model";
import { OrderLineItemResponse, OrderPaymentResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import ExportModal from "screens/order-online/modal/export.modal";
import { exportFile, getFile } from "service/other/export.service";
import { copyTextToClipboard, formatCurrency, formatNumber, generateQuery, getTotalQuantity, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, FACEBOOK, POS, SHOPEE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { dangerColor, primaryColor } from "utils/global-styles/variables";
import { ORDER_PAYMENT_STATUS, ORDER_TYPES } from "utils/Order.constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import IconPaymentPoint from "../../component/OrderList/ListTable/images/paymentPoint.svg";
import { StyledComponent } from "./OrderReturnList.styles";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
// import search from "assets/img/search.svg";
import useAuthorization from "hook/useAuthorization";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { deleteOrderReturnService, updateNoteOrderReturnService } from "service/order/return.service";
import EditNote from "../EditOrderNote";
import IconShopee from "assets/icon/channel/shopee.svg";
import IconStore from "assets/icon/channel/store.svg";
import IconFacebook from "assets/icon/channel/facebook.svg";

type PropTypes = {
  initQuery: ReturnSearchQuery;
  location: any;
  orderType: OrderTypeModel;
}

function OrderReturnList(props: PropTypes) {
  const {initQuery, location, orderType} = props;
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();

  const [allowDeleteOrderReturn] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.DELETE_RETURN_ORDER],
    not: false
  })

  const [tableLoading, setTableLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  useState<Array<AccountResponse>>();
  let dataQuery: ReturnSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<ReturnSearchQuery>(dataQuery);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [reasons, setReasons] = useState<Array<{ id: number; name: string }>>(
    []
  );

  const [isLoopInfoIfOrderHasMoreThanTwoProducts, setIsLoopInfoIfOrderHasMoreThanTwoProducts] = useState(false);

  const [dataItems, setDataItems] = useState<any[]>([]);

  const [dataMetadata, setDataMetadata] = useState({
      limit: 30,
      page: 1,
      total: 0,
    });
  // columns table cần phải dùng useMemo, hàm useCallback bên trong colums ko cập nhật được state của component
  // update columns table thành useMemo để fix, tạm thời dùng dataItemsClone
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let dataItemsClone: any[] = [];
  const setSearchResult = useCallback(
    (result: PageResponse<ReturnModel> | false) => {
      setTableLoading(false);
      setIsFilter(false) 
      if (!!result) {
        setDataItems(result.items);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        dataItemsClone = result.items;
        setDataMetadata(result.metadata);
      }
    },
    []
  );

  const onFilterPhoneCustomer = useCallback((phone: string) => {
    let paramCopy = { ...params, search_term: phone, page: 1  };
    setPrams(paramCopy);
    let queryParam = generateQuery(paramCopy);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, location.pathname, params]);

  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<ReturnModel>>
  >([
    {
      title: "ID",
      dataIndex: "code_order_return",
      key: "code_order_return",
      visible: true,
      fixed: "left",
      className: "code_order_return custom-shadow-td",
      width: 140,
      render: (value: string, i: ReturnModel) => {
        return (
          <React.Fragment>
            <div className="noWrap">
              <Link to={`${UrlConfig.ORDERS_RETURN}/${i.id}`} style={{ fontWeight: 500 }} title="Chi tiết đơn trả hàng">
                {value}
              </Link>
              <span title="Click để copy">
                <img
                  onClick={(e) => {
                    copyTextToClipboard(e, value?.toString())
                    showSuccess("Đã copy mã đơn trả hàng!")
                  }}
                  src={copyFileBtn}
                  alt=""
                  style={{ width: 18, cursor: "pointer" }}
                />
              </span>
            </div>
            <div className="textSmall" title="Ngày tạo đơn">{moment(i.created_date).format(DATE_FORMAT.fullDate)}</div>
            <div className="textSmall">
              <Tooltip title="Cửa hàng">
                <Link to={`${UrlConfig.STORE}/${i?.store_id}`}>
                  {i.store}
                </Link>
              </Tooltip>
            </div>
            {orderType === ORDER_TYPES.offline ? null : (
              <div className="textSmall single">
                <Tooltip title="Nguồn">{i.source}</Tooltip>
              </div>
            )}

            {orderType === ORDER_TYPES.offline ? (
              <div className="textSmall single mainColor">
                <Tooltip title="Thu ngân">
                  <Link to={`${UrlConfig.ACCOUNTS}/${i.account_code}`}>
                    <strong className="item-title">Thu ngân: </strong>{i.account_code} - {i.account}
                  </Link>
                </Tooltip>
              </div>
            ) : null}
            {orderType === ORDER_TYPES.online ? (
              <React.Fragment>
                <div className="textSmall single mainColor">
                  <Link to={`${UrlConfig.ACCOUNTS}/${i.assignee_code}`}>
                    <strong className="item-title">NV bán hàng: </strong>{i.assignee_code} - {i.assignee}
                  </Link>
                </div>
              </React.Fragment>
            ) : null}
            <div className="textSmall single">
              <strong>Tổng SP: {getTotalQuantity(i.items)}</strong>
            </div>
          </React.Fragment>
        )
      }
    },

    {
      title: "Thông tin",
      dataIndex: "order_id",
      key: "order_id",
      visible: true,
      fixed: "left",
      className: "orderId custom-shadow-td",
      width: 140,
      render: (value: string, record: ReturnModel) => {
        return (
          <React.Fragment>
            <div className="noWrap">
              <div className="order-id-title">ID đơn gốc:</div>
              <Link to={`${UrlConfig.ORDER}/${record.order_id}`} style={{ fontWeight: 500 }} title="Chi tiết đơn trả hàng">
                {record.code_order}
              </Link>
              <span title="Click để copy">
                <img
                  onClick={(e) => {
                    copyTextToClipboard(e, value?.toString())
                    showSuccess("Đã copy mã đơn hàng!")
                  }}
                  src={copyFileBtn}
                  alt=""
                  style={{ width: 18, cursor: "pointer" }}
                />
              </span>
            </div>

            <div className="noWrap single-lg">
              <div className="order-id-title">Khách hàng:</div>
              <Link to={`${UrlConfig.CUSTOMER}/${record.customer_id}`} style={{ fontWeight: 500 }} title="Chi tiết khách hàng">
                {record.customer_phone_number}
              </Link>
              <span title="Click để copy">
                <img
                  onClick={(e) => {
                    copyTextToClipboard(e, record.customer_phone_number?.toString())
                    showSuccess("Đã copy số điện thoại!")
                  }}
                  src={copyFileBtn}
                  alt=""
                  style={{ width: 18, cursor: "pointer" }}
                />
              </span>
            </div>
            <div className="textSmall single" title="Tên khách hàng">{record?.customer_name}</div>

          </React.Fragment>
        )
      }
    },
    // {
    //   title: "Mã đơn trả hàng",
    //   dataIndex: "code_order_return",
    //   key: "code_order_return",
    //   visible: true,
    //   fixed: "left",
    //   className: "orderId custom-shadow-td",
    //   width: 140,
    //   render: (value: string, i: ReturnModel) => {
    //     return (
    //       <React.Fragment>
    //         <div className="noWrap" style={{display:"flex"}}>
    //           <Link to={`${UrlConfig.ORDERS_RETURN}/${i.id}`} style={{ fontWeight: 500, width:"88%", overflow:"hidden", textOverflow:"ellipsis" }}>
    //             {value}
    //           </Link>
    //           <Tooltip title="Click để copy">
    //             <img
    //               onClick={(e) => {
    //                 copyTextToClipboard(e, i.code_order_return.toString())
    //                 showSuccess("Đã copy mã đơn hàng!")
    //               }}
    //               src={copyFileBtn}
    //               alt=""
    //               style={{ width: 18, cursor: "pointer" }}
    //             />
    //           </Tooltip>
    //         </div>
    //         <div className="textSmall">{moment(i.created_date).format(DATE_FORMAT.fullDate)}</div>
    //         <div className="textSmall">
    //           <Tooltip title="Cửa hàng">
    //             <Link to={`${UrlConfig.STORE}/${i?.store_id}`}>
    //               {i.store}
    //             </Link>
    //           </Tooltip>
    //         </div>
    //         {orderType === ORDER_TYPES.offline ? null : (
    //           <div className="textSmall single">
    //             <Tooltip title="Nguồn">{i.source}</Tooltip>
    //           </div>
    //         )}
    //         { orderType === ORDER_TYPES.offline ? (
    //           <React.Fragment>
    //             <div className="textSmall single mainColor">
    //               <Tooltip title="Chuyên gia tư vấn">
    //                 <Link to={`${UrlConfig.ACCOUNTS}/${i.assignee_code}`}>
    //                   <strong>CGTV: </strong>{i.assignee_code} - {i.assignee}
    //                 </Link>
    //               </Tooltip>
    //             </div>
    //             <div className="textSmall single mainColor">
    //               <Tooltip title="Thu ngân">
    //                 <Link to={`${UrlConfig.ACCOUNTS}/${i.account_code}`}>
    //                   <strong>Thu ngân: </strong>{i.account_code} - {i.account}
    //                 </Link>
    //               </Tooltip>
    //             </div>
    //           </React.Fragment>
    //         ) :null}
    //         { orderType === ORDER_TYPES.online && i.source && (
    //           <div className="textSmall single mainColor">
    //             <Tooltip title="Nhân viên bán hàng">
    //               <Link to={`${UrlConfig.ACCOUNTS}/${i.assignee_code}`}>
    //                 <strong>NV bán hàng: </strong>{i.assignee_code} - {i.assignee}
    //               </Link>
    //             </Tooltip>
    //           </div>
    //         )}
    //       </React.Fragment>
    //     );
    //   },
      
    // },
    // {
    //   title: "Mã đơn hàng",
    //   render: (record: ReturnModel) => (
    //     <Link target="_blank" to={`${UrlConfig.ORDER}/${record.order_id}`}>
    //       {record.code_order}
    //     </Link>
    //   ),
    //   key: "order_code",
    //   visible: true,
    //   width: 120,
    // },
    // {
    //   title: "Khách hàng",
    //   render: (record: ReturnModel) => (
    //     <div className="customer custom-td">
    //       {record.customer_phone_number && (
    //         <div style={{ color: "#2A2A86" ,display:"flex" }}>
    //           <div
    //             style={{ padding: "0px", fontWeight: 500, cursor: "pointer", fontSize: "0.9em" }}
    //             onClick={() => {
    //               onFilterPhoneCustomer(
    //                 record.customer_phone_number ? record.customer_phone_number : ""
    //               );
    //             }}
    //             >
    //             {record.customer_phone_number}
    //             <Tooltip title="Click để copy">
    //               <img
    //                 onClick={(e) => {
    //                   copyTextToClipboard(e, (record?.customer_phone_number || "").toString())
    //                   showSuccess("Đã copy số điện thoại!")
    //                 }}
    //                 src={copyFileBtn}
    //                 alt=""
    //                 style={{ width: 18, cursor: "pointer" }}
    //               />
    //             </Tooltip>

    //           </div>
    //           <Popover placement="bottomLeft" content={
    //             <div className="poppver-to-fast">
    //               <Button
    //                 className="btn-to-fast"
    //                 style={{padding: "0px", display:"block", height:"30px"}}
    //                 type="link"
    //                 icon={<img src={search} alt="" style={{paddingRight:"18px"}}/> }
    //                 onClick={() =>
    //                   onFilterPhoneCustomer(
    //                     record.customer_phone_number ? record.customer_phone_number : ""
    //                   )
    //                 }
    //               >
    //                 Lọc đơn của khách
    //               </Button>
    //               <Button className="btn-to-fast"
    //                 style={{padding: "0px", display:"block", height:"30px"}}
    //                 type="link"
    //                  icon={<EyeOutlined style={{paddingRight:"10px"}} /> }
    //                 onClick={()=>{
    //                   let pathname = `${process.env.PUBLIC_URL}${UrlConfig.CUSTOMER}/${record.customer_id}`;
    //                   window.open(pathname,"_blank");
    //                 }}
    //               >
    //                 Thông tin khách hàng
    //               </Button>
    //               <Button
    //                className="btn-to-fast"
    //                style={{padding: "0px", display:"block", height:"30px"}}
    //                type="link"
    //                icon={<PlusOutlined style={{paddingRight:"10px"}}/> }
    //                onClick={()=>{
    //                  let pathname = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/create?customer=${record.customer_id}`;
    //                  window.open(pathname,"_blank");
    //               }}
    //               >
    //                 Tạo đơn cho khách
    //               </Button>
    //               <Button
    //                 className="btn-to-fast"
    //                 style={{padding: "0px", display:"block", height:"30px"}}
    //                 type="link"
    //                 icon={<PhoneOutlined style={{paddingRight:"10px"}}/>}
    //                 onClick={()=>{
    //                   window.location.href=`tel:${record.customer_phone_number}`;
    //                 }}
    //               >
    //                 Gọi điện cho khách
    //               </Button>
    //             </div>
    //           } trigger="click">
    //             <Button type="link" style={{ width: "25px", padding: "0px", paddingTop:2}} icon={<DownOutlined style={{fontSize:"12px"}}/>}></Button>
    //           </Popover>
    //         </div>
    //       )}
    //       <div className="name" style={{ color: "#2A2A86" }}>
    //         <Link
    //           target="_blank"
    //           to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
    //           className="primary">
    //           {record.customer_name}
    //         </Link>{" "}
    //       </div>
    //       {/* <div className="textSmall">{renderShippingAddress(record)}</div> */}
    //     </div>
    //   ),
    //   key: "customer",
    //   visible: true,
    //   width: 140,
    // },
    // {
    //   title: "Người nhận",
    //   render: (record: any) => (
    //     <div className="customer">
    //       <div className="name p-b-3" style={{ color: "#2A2A86" }}>
    //         <Link
    //           target="_blank"
    //           to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}
    //         >
    //           {record.account_code} - {record.account}
    //         </Link>
    //       </div>
    //       {/* <div className="p-b-3">{record.account_code}</div> */}
    //       {/* <div className="p-b-3">{record.customer_email}</div> */}
    //     </div>
    //   ),
    //   key: "receive_person",
    //   visible: true,
    //   width: 160,
    // },
    {
      title: (
        <div className="productNameQuantityPriceHeader">
          <span className="productNameWidth">
            Sản phẩm
            <span className="separator">, </span>
          </span>
          <span className="quantity quantityWidth">
            <span>
              SL
              <span className="separator">, </span>
            </span>
          </span>
          <span className="price priceWidth">
            <span>Giá </span>
          </span>

        </div>
      ),
      dataIndex: "items",
      key: "productNameQuantityPrice",
      className: "productNameQuantityPrice",
      render: (items: Array<OrderLineItemResponse>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td" key={i}>
                  <div className="product productNameWidth 2">
                    <div className="inner">
                      <Link
                        to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}>
                        {item.sku}
                      </Link>
                      <br />
                      <div className="productNameText textSmall" title={item.variant}>
                        {item.variant}
                      </div>
                    </div>
                  </div>
                  <div className="quantity quantityWidth">
                    <NumberFormat
                      value={formatNumber(item.quantity)}
                      displayType={"text"}
                    />
                  </div>
                  <div className="price priceWidth">
                    <div>
                      <Tooltip title="Giá sản phẩm">
                        <span>{formatCurrency(item.price)}</span>
                      </Tooltip>

                      {item?.discount_items && item.discount_items[0]?.value ? (
                        <Tooltip title="Khuyến mại sản phẩm">
                          <div className="itemDiscount" style={{ color: dangerColor }}>
                            <span> - {formatCurrency(item.discount_items[0].value)}</span>
                          </div>
                        </Tooltip>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: 350,
    },
    {
      title: "Tổng tiền",
      width: 120,
      render: (record: any) => (
        <>
          <Tooltip title="Hoàn tiền">
            <NumberFormat
              value={formatCurrency(record.total)}
              className="total-amount-black"
              displayType={"text"}
              //style={{ fontWeight: 500, color: "#27ae60"}}
            />
          </Tooltip>
          {record.discounts.length > 0 ? (
            <Tooltip title="Khuyến mại đơn hàng">
              <div className="item-discount">
                <span> - {formatCurrency(record.discounts[0].value)}</span>
              </div>
            </Tooltip>
          ) : null}
        </>
      ),
      className:"total-amount",
      key: "total_amount",
      visible: true,
      align: "center",
    },
    {
      title: "Hoàn điểm",
      width: 120,
      render: (record: any) => (
        <>
          <div>
            {
              record.point_refund ?(
                <img src={IconPaymentPoint} alt="" />
              ):null
            }
            
            <NumberFormat
              value={formatNumber(record.point_refund||0)}
              className="item-point"
              displayType={"text"}
            />
          </div>
        </>
      ),
      key: "point_refund",
      className:"point-refund",
      visible: true,
      align: "center",
    },
    {
      title: "Nhận hàng",
      dataIndex: "received",
      key: "received",
      className: "received",
      render: (value: boolean, record: ReturnModel) => {
        return value ? (
          <React.Fragment>
            <div className="text-center received-success">Đã nhận hàng</div>
            <div className="textSmall" title="Ngày tạo đơn">{moment(record.receive_date).format(DATE_FORMAT.fullDate)}</div>
          </React.Fragment>
        ) : (
          <div className="text-center received-danger">Chưa nhận hàng</div>
        )
      },
      visible: true,
      align: "center",
      width: 140,
    },
    {
      title: "Hoàn tiền",
      //dataIndex: "total_amount",
      render: (record: ReturnModel) => {
        if(!record?.payment_status) {
          return null
        }

        
        const payment_date =()=>{
          if(!record?.payments){
            return null;
          }
          if(record?.payments.length===0){
            return null;
          }

          let payments= record.payments.sort((a, b)=>{
            if(moment(a.created_date)>moment(b.created_date)){
              return -1
            }
            return 0
          });
          
          return (
            <React.Fragment>
              {
                // record.payments?.map((p) => (
                //   p?.created_date ? (
                //     <div className="textSmall" title="Ngày tạo đơn">{ConvertUtcToLocalDate(p.created_date, DATE_FORMAT.fullDate)}</div>
                //   ) : "ok"
                // ))
                <div className="textSmall" title="Ngày tạo đơn">{ConvertUtcToLocalDate(payments[0].created_date, DATE_FORMAT.fullDate)}</div>
              }
            </React.Fragment>
          )
        }

        return record.payment_status === ORDER_PAYMENT_STATUS.unpaid ? (
          <div className="text-center refund-amount-danger">Chưa hoàn tiền</div>
        ) : record.payment_status === ORDER_PAYMENT_STATUS.paid ? (
          <>
            <div className="text-center refund-amount-success">Đã hoàn tiền</div>
            {payment_date()}
          </>
        ) : record.payment_status === ORDER_PAYMENT_STATUS.partial_paid ? (
          <>
            <div className="text-center refund-amount-warning">Hoàn một phần</div>
            {payment_date()}
          </>
        ) : null
      },
      className:"refund-amount",
      key: "refund_amount",
      visible: true,
      align: "center",
      width: 140,
    },
    
    // {
    //   title: "Trạng thái nhận hàng",
    //   dataIndex: "received",
    //   key: "received",
    //   render: (value: boolean) => {
    //     let processIcon = null;
    //     switch (value) {
    //       case true:
    //         processIcon = "icon-full";
    //         break;
    //       default:
    //         processIcon = "icon-blank";
    //         break;
    //     }
    //     return (
    //       <div className="text-center">
    //         <div className={processIcon} />
    //       </div>
    //     );
    //   },
    //   visible: true,
    //   align: "center",
    //   width: 140,
    // },
    // {
    //   title: "Ngày nhận hàng",
    //   dataIndex: "receive_date",
    //   render: (value: string) => <div>{value && moment(value).format(DATE_FORMAT.fullDate)}</div>,
    //   key: "receive_date",
    //   visible: true,
    //   align: "center",
    //   width: 130,
    // },

    {
      title: "Ghi chú",
      className: "notes",
      render: (value: string, record: any) => {
        return (
          <div className="orderNotes">
            <div className="inner">
              <div className="single text-left">
                <EditNote
                  note={record.customer_note}
                  title="Khách hàng: "
                  color={primaryColor}
                  onOk={(values) => {
                    editNote(record.id, values.note, values.customer_note);
                  }}
                  noteFormValue={{
                    note: record.note,
                    customer_note: record.customer_note,
                  }}
                />
              </div>
              <div className="single text-left">
                <EditNote
                  note={record.note}
                  title="Nội bộ: "
                  color={primaryColor}
                  onOk={(values) => {
                    editNote(record.id, values.note, values.customer_note);
                  }}
                  noteFormValue={{
                    note: record.note,
                    customer_note: record.customer_note,
                  }}
                />
              </div>
            </div>
          </div>
        )
      },
      key: "note",
      visible: true,
      align: "center",
      width: 200,
    },
    {
      title: "Lý do trả",
      dataIndex: "reason",
      key: "reason",
      visible: true,
      align: "center",
      width: 160,
      render:(value: any, record: ReturnModel, index: number)=><div>{record?.return_reason?.name}</div>
    },
  ]);

  const onSuccessEditNote = useCallback(
    (orderReturnID, note, customer_note) => {
      showSuccess(`${orderReturnID} Cập nhật ghi chú thành công`);
      console.log('dataItems dataItems', dataItemsClone)
      const newDataItems = [...dataItemsClone]
      const indexOrder = newDataItems.findIndex((item: any) => item.id === orderReturnID);
      if (indexOrder > -1) {
        newDataItems[indexOrder].note = note;
        newDataItems[indexOrder].customer_note = customer_note;
      }
      setDataItems(newDataItems)
    },
    [dataItemsClone]
  );

  const editNote = useCallback(
    (orderReturnID, note, customer_note) => {
      updateNoteOrderReturnService(orderReturnID, note, customer_note).then((response) => {
        if (isFetchApiSuccessful(response)) {
          onSuccessEditNote(orderReturnID, note, customer_note)
        } else {
          handleFetchApiError(response, "Cập nhật ghi chú đơn trả", dispatch);
        }
      })
    },
    [dispatch, onSuccessEditNote]
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      setIsFilter(true) 
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params]
  );

  const onClearFilter = useCallback(
    () => {
      setPrams(initQuery);
      let queryParam = generateQuery(initQuery);
      history.push(`${UrlConfig.ORDERS_RETURN}?${queryParam}`);
    },
    [history, initQuery]
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);

  const [selectedRowCodes, setSelectedRowCodes] = useState<Array<string>>([]);
  const [selectedRow, setSelectedRow] = useState<Array<ReturnModel>>([]);

  const onSelectedChange = useCallback((selectedRows: ReturnModel[], selected?: boolean, changeRow?: ReturnModel[]) => {
    let selectedRowCodesCopy = [...selectedRowCodes];
    let selectedRowCopy = [...selectedRow];

    // console.log("changeRow",changeRow)

    if (changeRow && changeRow.length > 0) {
      if (selected) {
        changeRow?.forEach((row) => {
          let index = selectedRowCodesCopy.findIndex((p) => p === row.code_order_return)
          if (index === -1) {
            selectedRowCodesCopy.push(row.code_order_return)
            selectedRowCopy.push(row)
            setSelectedRowCodes(selectedRowCodesCopy);
            setSelectedRow(selectedRowCopy);
          }
        })

      }
      else {
        changeRow?.forEach((row) => {
          let index = selectedRowCodesCopy.findIndex((p) => p === row.code_order_return)
          if (index !== -1) {
            selectedRowCodesCopy.splice(index, 1)
            selectedRowCopy.splice(index, 1);
            setSelectedRowCodes(selectedRowCodesCopy);
            setSelectedRow(selectedRowCopy);
          }
        })
      }
    }

  }, [selectedRow, selectedRowCodes]);

  const onClearSelected = () => {
    setSelectedRowCodes([]);
    setSelectedRow([]);
  }

  const actions: Array<MenuAction> = useMemo(() => [
    {
      id: 1,
      name: "Xóa đơn trả",
      icon: <DeleteOutlined />,
      color:"#e24343",
      disabled: selectedRowCodes.length ? false : true,
      hidden: !allowDeleteOrderReturn

    },
    {
      id: 2,
      name: "Export",
      icon:<ExportOutlined />,
      disabled: selectedRowCodes.length ? false : true,
    },
    // {
    //   id: 3,
    //   name: "In hoá đơn",
    //   icon: <PrinterOutlined />,
    //   disabled: selectedRowCodes.length ? false : true,
    // },
  ], [allowDeleteOrderReturn, selectedRowCodes.length]);

  const onExport = useCallback((optionExport) => {
    let newParams:any = {...params};
    // let hiddenFields = [];
    switch (optionExport) {
      case 1: newParams = {}
        break
      case 2: break
      case 3:
        newParams = {
          code_order_return: selectedRowCodes,
          is_online: orderType === ORDER_TYPES.online
        };
        break
      case 4:
        delete newParams.page
        delete newParams.limit
        break
      default: break  
    }
    
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
      type: isLoopInfoIfOrderHasMoreThanTwoProducts ? "EXPORT_ORDER_LOOP_RETURN" : "TYPE_EXPORT_ORDER_RETURN",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusExport(2)
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch((error) => {
        setStatusExport(4)
        console.log("orders export file error", error);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [params, isLoopInfoIfOrderHasMoreThanTwoProducts, selectedRowCodes, orderType, listExportFile]);

  const checkExportFile = useCallback(() => {
    
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(Math.round(response.data.num_of_record/response.data.total * 10000) / 100);
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3)
            setExportProgress(100)
            const fileCode = response.data.code
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setListExportFile(newListExportFile);
          }
          if (response.data && response.data.status === "ERROR") {
						setStatusExport(4)
					}
				} else {
					setStatusExport(4)
				}
      });
    });
  }, [listExportFile]);

  // cột column
  const columnConfigType = orderType === ORDER_TYPES.offline ? COLUMN_CONFIG_TYPE.orderReturnOffline : COLUMN_CONFIG_TYPE.orderReturnOnline
  const {tableColumnConfigs, onSaveConfigTableColumn} = useHandleFilterColumns(columnConfigType)
  //cột của bảng
  useSetTableColumns(columnConfigType, tableColumnConfigs, columns, setColumns)

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();
    
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const hanldeDeleteOrderReturn = useCallback(() => {
    if (!selectedRow || (selectedRow && selectedRow.length <= 0)) {
      showError("Vui lòng chọn đơn trả cần xóa");
      return;
    }
    let ids: number[] = selectedRow.map((p) => p.id);
    onClearSelected();
  
    dispatch(showLoading());
    deleteOrderReturnService(ids)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa đơn trả thành công");
  
          let newPrams = { ...params, page: 1 };
          setPrams(newPrams);
          let queryParam = generateQuery(newPrams);
          setIsFilter(true);
          history.push(`${location.pathname}?${queryParam}`);
        } else {
          handleFetchApiError(response, "Xóa đơn trả hàng", dispatch);
        }
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }, [dispatch, history, location.pathname, params, selectedRow]);

  const onMenuClick = useCallback((index: number) => {
    switch(index){
      case 1:
        Modal.confirm({
          title: "Xác nhận xóa",
          icon: <ExclamationCircleOutlined />,
          content: (
            <div className="yody-modal-confirm-list-code">
              Bạn có chắc chắn xóa ({selectedRow.length}):
              <div className="yody-modal-confirm-item-code">
                {selectedRow.map((value, index) => (
                  <p>{value.code_order_return}</p>
                ))}
              </div>
            </div>
          ),
        
          okText: "Xóa",
          cancelText: "Hủy",
          onOk: hanldeDeleteOrderReturn,
        
          className: "comfirm-order-return",
        });
        
      break;

      case 3:
        let ids= selectedRow.map((p:any)=>p.id)
        let params = {
          action: "print",
          ids: ids,
          "print-type": "order_exchange",
          "print-dialog": true,
        };

        // console.log(selectedRowCodes)
        // console.log(selectedRow)

        const queryParam = generateQuery(params);

        const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
        window.open(printPreviewUrl);
        break; 
      default: break;
    }
  }, [selectedRow, hanldeDeleteOrderReturn]);

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

  const onChangeOrderOptions = useCallback(
    (e) => {
      onFilter && onFilter({ ...params, is_online: e.target.value });
    },
    [onFilter, params]
  );

  const renderOrderSource = (returnModel: ReturnModel) => {
    let html = null;
    if (returnModel.channel === POS.channel_code) {
      html = (
        <div className="orderSource actionButton">
          <Tooltip title="Đơn hàng tại quầy">
            <img src={IconStore} alt="" />
          </Tooltip>
        </div>
      );
    } else {
      switch (returnModel.channel_id) {
        case SHOPEE.channel_id:
          html = (
            <div className="orderSource actionButton">
              <Tooltip title="Đơn hàng tại Shopee">
                <img src={IconShopee} alt="" />
              </Tooltip>
            </div>
          );
          break;
        case FACEBOOK.channel_id:
          html = (
            <div className="orderSource actionButton">
              <Tooltip title="Đơn hàng từ Facebook">
                <img src={IconFacebook} alt="" />
              </Tooltip>
            </div>
          );
          break;
        default:
          break;
      }
    }
    return html;
  };

  const rowSelectionRenderCell = (
    checked: boolean,
    record: ReturnModel,
    index: number,
    originNode: ReactNode
  ) =>{
    return (
      <React.Fragment>
        <div className="actionButton">
          {originNode}
        </div>
        {renderOrderSource(record)}
      </React.Fragment>
    )
  }

  useEffect(() => {
    setTableLoading(true);
    dispatch(getReturnsAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    dispatch(searchAccountPublicAction({limit: 30}, setDataAccounts));
    dispatch(getListAllSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
    dispatch(getListReasonRequest(setReasons));
  }, [dispatch]);

  return (
    <StyledComponent>
      <ContentContainer
        title= {`Danh sách đơn trả hàng ${ orderType === ORDER_TYPES.online ? "online" : "offline"}`}
        breadcrumb={[
          {
            name: orderType === ORDER_TYPES.online ? "Đơn hàng online" : "Đơn hàng offline",
          },
          {
            name: `Danh sách đơn trả hàng ${ orderType === ORDER_TYPES.online ? "online" : "offline"}`,
          },
        ]}
        extra={
          <Row>
            <Space>
              <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.EXPORT]} passThrough>
                {(isPassed: boolean) => 
                <Button
                  type="default"
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                  // onClick={onExport}
                  onClick={() => {
                    setShowExportModal(true);
                  }}
                  disabled={!isPassed}
                >
                  Xuất file
                </Button>}
              </AuthWrapper>
            </Space>
          </Row>
        }
      >
        <Card className="return-card">
          {/* hiện tại không dùng tab */}
          {false ? (
            <div className="order-options">
              <Radio.Group onChange={(e) => onChangeOrderOptions(e)} value={params.is_online}>
                <Radio.Button value={null}>Tất cả đơn trả hàng</Radio.Button>
                <Radio.Button value="true">Trả hàng online</Radio.Button>
                <Radio.Button value="false">Trả hàng offline</Radio.Button>
              </Radio.Group>
            </div>
          ) : null}
          <ReturnFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={isFilter}
            params={params}
            listSource={listSource}
            listStore={listStore}
            accounts={accounts}
            reasons={reasons}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onClearFilter={() => onClearFilter()}
            orderType={orderType}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 1600 * columnFinal.length/(columns.length ? columns.length : 1)}}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={{
              pageSize: dataMetadata.limit,
              total: dataMetadata.total,
              current: dataMetadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onSelectedChange={(selectedRows, selected, changeRow) =>
              onSelectedChange(selectedRows, selected, changeRow)
            }
            selectedRowKey={selectedRowCodes}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            dataSource={dataItems}
            columns={columnFinal}
            rowKey={(item: ReturnModel) => item.code_order_return}
            className="order-list"
            rowSelectionRenderCell={rowSelectionRenderCell}
            isShowPaginationAtHeader
          />
        </Card>

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
            onSaveConfigTableColumn(data );
          }}
          data={columns}
        />
        {showExportModal && <ExportModal
            visible={showExportModal}
            onCancel={() => {
              setShowExportModal(false)
              setExportProgress(0)
              setStatusExport(1)
            }}
            onOk={(optionExport) => onExport(optionExport)}
            type="returns"
            total={dataMetadata.total}
            exportProgress={exportProgress}
            statusExport={statusExport}
            selected={selectedRowCodes.length ? true : false}
            isLoopInfoIfOrderHasMoreThanTwoProducts={isLoopInfoIfOrderHasMoreThanTwoProducts}
            setIsLoopInfoIfOrderHasMoreThanTwoProducts={setIsLoopInfoIfOrderHasMoreThanTwoProducts}
          />}
      </ContentContainer>
    </StyledComponent>
  );
};

export default OrderReturnList;
