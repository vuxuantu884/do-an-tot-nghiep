import { Row, Col, Card, Tabs, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { modalActionType } from "model/modal/modal.model";
import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { CustomerResponse } from "model/response/customer/customer.response";
import CustomerInfo from "./customer.info";
import CustomerContactInfo from "./customer-contact/customer.contact";
import CustomerShippingAddressInfo from "./customer-shipping/customer.shipping";
import CustomerShippingInfo from "./customer-billing/customer.billing";
import CustomerNoteInfo from "./customer-note/customer.note";
import CustomerHistoryInfo from "./customer.history";
import CustomerCareHistory from "./customer-care-history";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { GetListOrderCustomerAction } from "domain/actions/order/order.action";
import {
  getLoyaltyPoint,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import ActionButton, {
  MenuAction,
} from "../../../component/table/ActionButton";
import { formatCurrency } from "utils/AppUtils";
import { LoyaltyCardSearch } from "domain/actions/loyalty/card/loyalty-card.action";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { CustomerListPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";

import warningCircleIcon from "assets/icon/warning-circle.svg";
import { StyledCustomerDetail } from "screens/customer/customer-detail/customerDetailStyled";
import { showWarning } from "utils/ToastUtils";


const { TabPane } = Tabs;

const viewCustomerDetailPermission = [CustomerListPermission.customers_read];
const updateCustomerPermission = [CustomerListPermission.customers_update];

const CustomerDetailIndex = () => {

  const [allowViewCustomerDetail] = useAuthorization({
    acceptPermissions: viewCustomerDetailPermission,
    not: false,
  });

  const [allowUpdateCustomer] = useAuthorization({
    acceptPermissions: updateCustomerPermission,
    not: false,
  });

  const [activeTab, setActiveTab] = React.useState<string>("history");
  const [isShowModalContacts, setIsShowModalContacts] = React.useState(false);
  const [isShowModalBilling, setIsShowModalBilling] = React.useState(false);
  const [isShowModalShipping, setIsShowModalShipping] = React.useState(false);
  const [isShowModalNote, setIsShowModalNote] = React.useState(false);
  const [isShowAddBtn, setIsShowAddBtn] = React.useState(false);
  const params: any = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const [customer, setCustomer] = React.useState<CustomerResponse>();
  const [customerPointInfo, setCustomerPoint] = React.useState<any>([]);
  const [modalAction, setModalAction] =
    React.useState<modalActionType>("create");
  const [loyaltyPoint, setLoyaltyPoint] = React.useState<LoyaltyPoint | null>(
    null
  );
  const [loyaltyCard, setLoyaltyCard] = React.useState<any>();
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = React.useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [customerSpendDetail, setCustomerSpendDetail] = React.useState<any>([]);
  const [queryParams, setQueryParams] = React.useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Tặng điểm",
    },
    {
      id: 2,
      name: "Trừ điểm",
    },
    {
      id: 3,
      name: "Tặng tiền tích lũy",
    },
    {
      id: 4,
      name: "Trừ tiền tích lũy",
    },
  ];

  const [orderHistory, setOrderHistory] = React.useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [tableLoading, setTableLoading] = React.useState<boolean>(false);
  // add and edit contact section;


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateLoyaltyCard = useCallback((result) => {
    if (result && result.items && result.items.length) {
      const loyaltyCardData = result.items.find((item: any) => item.customer_id === customer?.id);
      setLoyaltyCard( loyaltyCardData);
    }
  }, [customer]);

  useEffect(() => {
    if (!allowViewCustomerDetail) {
      return;
    }
    
    if (customer) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
      dispatch(LoyaltyCardSearch({ customer_id: customer.id, status: "ACTIVE"}, updateLoyaltyCard));
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch, customer, allowViewCustomerDetail, updateLoyaltyCard]);
  
  React.useEffect(() => {
    if (!allowViewCustomerDetail) {
      return;
    }
    
    if (history.location.hash) {
      switch (history.location.hash) {
        case "#history":
          setActiveTab("history");
          setIsShowAddBtn(false);
          break;
        case "#caring-history":
          setActiveTab("caring-history");
          setIsShowAddBtn(false);
          break;
        case "#contacts":
          setActiveTab("contacts");
          setIsShowAddBtn(true);
          setModalAction("create");
          break;
        case "#billing":
          setActiveTab("billing");
          setIsShowAddBtn(true);
          setModalAction("create");
          break;
        case "#shipping":
          setActiveTab("shipping");
          setIsShowAddBtn(true);
          setModalAction("create");
          break;
        case "#notes":
          setActiveTab("notes");
          setIsShowAddBtn(true);
          setModalAction("create");
          break;
        case "#updated-logging":
          setActiveTab("updated-logging");
          setIsShowAddBtn(false);
          break;
      }
    }
  }, [allowViewCustomerDetail, history.location.hash]);

  const mappingBtnName: any = {
    "#notes": "Thêm ghi chú",
    "#billing": "Thêm địa chỉ",
    "#shipping": "Thêm địa chỉ",
    "#contacts": "Thêm liên hệ",
    "#caring-history": "Thêm mới",
  };

  React.useEffect(() => {
    const purchaseIfo = customer?.report;
    const _detail = [
      {
        name: "Tổng đơn hàng",
        value: purchaseIfo?.total_finished_order,
      },
      {
        name: "Cửa hàng mua đầu",
        value: purchaseIfo?.store_of_first_order,
      },
      {
        name: "Số đơn trả",
        value: purchaseIfo?.total_returned_order,
      },
      {
        name: "Tiền tích luỹ",
        value: purchaseIfo?.total_paid_amount,
      },
      {
        name: "Ngày mua đầu",
        value: purchaseIfo?.first_order_date,
      },
      {
        name: "Tổng giá trị đơn trả",
        value: formatCurrency(
          purchaseIfo?.total_refunded_amount ? purchaseIfo?.total_refunded_amount : ""
        ),
      },
      {
        name: "Số ngày chưa mua",
        value: purchaseIfo?.number_of_days_without_purchase,
      },
      {
        name: "Cửa hàng mua cuối",
        value: purchaseIfo?.store_of_last_order,
      },
      
      {
        name: "Số tiền cần nâng hạng",
        value: purchaseIfo?.remain_amount_to_level_up,
      },
      {
        name: 
            <div className="average-value">
              <span>Giá trị trung bình</span>
              <Tooltip
                overlay="GTTB = Tiền tích lũy/Tổng đơn hàng"
                placement="top"
                color="blue"
              >
                <img
                  src={warningCircleIcon}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  alt=""
                />
              </Tooltip>
            </div>,
        value: purchaseIfo?.average_order_value,
      },
      {
        name: "Ngày mua cuối",
        value: purchaseIfo?.last_order_date,
      }
    ];

    setCustomerSpendDetail(_detail);
  }, [customer?.report, loyaltyPoint]);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQueryParams({ ...queryParams, page, limit });
    },
    [queryParams, setQueryParams]
  );

  const setOrderHistoryItems = React.useCallback(
    (data: PageResponse<OrderModel> | false) => {
      setTableLoading(false);
      if (data) {
        setOrderHistory(data);
      }
    },
    []
  );
  
  React.useEffect(() => {
    if (!allowViewCustomerDetail) {
      return;
    }

    if (params?.id) {
      queryParams.customer_ids = [params?.id];
      setTableLoading(true);
      dispatch(GetListOrderCustomerAction(queryParams, setOrderHistoryItems));
    }
  }, [params, dispatch, queryParams, setOrderHistoryItems, allowViewCustomerDetail]);
  // end

  React.useEffect(() => {
    const _detail = [
      { name: "Điểm hiện tại", value: loyaltyPoint?.point || null },
      {
        name: "Hạng thẻ",
        value:
          loyaltyUsageRules?.find(
            (item) => item.rank_id === loyaltyPoint?.loyalty_level_id
          )?.rank_name || null,
      },
      {
        name: "Ngày gắn thẻ",
        value: loyaltyCard?.assigned_date ? ConvertUtcToLocalDate(loyaltyCard.assigned_date, DATE_FORMAT.DDMMYYY) : null,
      },
      {
        name: "CH gắn thẻ",
        value: loyaltyCard?.assigned_store || null,
      },
    ];
    setCustomerPoint(_detail);
  }, [loyaltyPoint, loyaltyUsageRules, loyaltyCard]);

  React.useEffect(() => {
    if (!allowViewCustomerDetail) {
      return;
    }
    
    dispatch(CustomerDetail(params.id, setCustomer));
  }, [allowViewCustomerDetail, dispatch, params, setCustomer]);

  const handleChangeTab = (active: string) => {
    switch (active) {
      case "contacts":
        setIsShowAddBtn(true);
        break;
      case "billing":
        setIsShowAddBtn(true);
        break;
      case "shipping":
        setIsShowAddBtn(true);
        break;
      case "notes":
        setIsShowAddBtn(true);
        break;
      case "caring-history":
        setIsShowAddBtn(false);
        break;
      case "updated-logging":
        setIsShowAddBtn(false);
        break;
      case "history":
        setIsShowAddBtn(false);
        break;
    }
    if (active === "add") {
      switch (history.location.hash) {
        case "#contacts":
          setIsShowModalContacts(true);
          setModalAction("create");
          setIsShowAddBtn(true);
          break;
        case "#billing":
          setIsShowModalBilling(true);
          setModalAction("create");
          setIsShowAddBtn(true);
          break;
        case "#shipping":
          setIsShowModalShipping(true);
          setModalAction("create");
          setIsShowAddBtn(true);
          break;
        case "#notes":
          setIsShowModalNote(true);
          setModalAction("create");
          setIsShowAddBtn(true);
          break;
        case "#caring-history":
          setIsShowAddBtn(false);
          break;
        case "#updated-logging":
          setIsShowAddBtn(false);
          break;
        case "#history":
          setIsShowAddBtn(false);
          break;
      }
    } else {
      history.replace(`${history.location.pathname}#${active}`);
    }
  };

  const onMenuClick = React.useCallback(
    (menuId: number) => {
      switch (menuId) {
        case 1:
          history.replace(
            `${UrlConfig.CUSTOMER}/point-adjustments?customer_ids=${customer?.id}&type=add`
          );
          break;
        case 2:
          history.replace(
            `${UrlConfig.CUSTOMER}/point-adjustments?customer_ids=${customer?.id}&type=subtract`
          );
          break;
        case 3:
          showWarning("Sẽ làm chức năng này sau bạn nhé!");
          break;
        case 4:
          showWarning("Sẽ làm chức năng này sau bạn nhé!");
          break;
      }
    },
    [customer, history]
  );

  return (
    <StyledCustomerDetail>
      <ContentContainer
        title="Thông tin chi tiết"
        extra={allowViewCustomerDetail &&
          <ActionButton
            type="default"
            menu={actions}
            onMenuClick={onMenuClick}
          />
        }
      >
        <AuthWrapper acceptPermissions={viewCustomerDetailPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <>
              <div className="customer-info">
                <CustomerInfo
                  customer={customer}
                  loyaltyCard={loyaltyCard}
                />

                <Card
                  className="point-info"
                  title={<span className="card-title">THÔNG TIN TÍCH ĐIỂM</span>}
                >
                  {customerPointInfo &&
                    customerPointInfo.map((detail: any, index: number) => (
                      <div className="detail-info" key={index}>
                        <div className="title">
                          <span style={{ color: "#666666" }}>{detail.name}</span>
                          <span style={{ fontWeight: 600 }}>:</span>
                        </div>

                        <span className="content">{detail.value ? detail.value : "---"}</span>
                      </div>
                    ))
                  }
                </Card>
              </div>

              <Card
                title={<span className="card-title">THÔNG TIN MUA HÀNG</span>}
                className="purchase-info"
              >
                <Row>
                  {customerSpendDetail &&
                    customerSpendDetail.map((info: any, index: number) => (
                      <Col
                        key={index}
                        span={8}
                        className="item-info"
                      >
                        <Col span={11}>
                          <span>{info.name}</span>
                        </Col>
                        <Col span={13}>
                          <b>: {info.value ? info.value : "---"}</b>
                        </Col>
                      </Col>
                    ))}
                </Row>
              </Card>

              <Card className="extended-info">
                <Tabs
                  activeKey={activeTab}
                  onChange={(active) => handleChangeTab(active)}
                  className="tabs-list"
                >
                  <TabPane tab="Lịch sử mua hàng" key="history">
                    <CustomerHistoryInfo
                      orderData={orderHistory}
                      onPageChange={onPageChange}
                      tableLoading={tableLoading}
                    />
                  </TabPane>

                  <TabPane tab="Lịch sử chăm sóc" key="caring-history">
                    <CustomerCareHistory
                      customer={customer}
                    />
                  </TabPane>

                  <TabPane tab="Ghi chú" key="notes">
                    <CustomerNoteInfo
                      customer={customer}
                      customerDetailState={activeTab}
                      setModalAction={setModalAction}
                      modalAction={modalAction}
                      setIsShowModalNote={setIsShowModalNote}
                      isShowModalNote={isShowModalNote}
                    />
                  </TabPane>

                  <TabPane tab="Đ/c nhận hàng" key="shipping">
                    <CustomerShippingAddressInfo
                      isShowModalShipping={isShowModalShipping}
                      setIsShowModalShipping={setIsShowModalShipping}
                      customer={customer}
                      customerDetailState={activeTab}
                      setModalAction={setModalAction}
                      modalAction={modalAction}
                      allowUpdateCustomer={allowUpdateCustomer}
                    />
                  </TabPane>

                  <TabPane tab="Đ/c nhận hóa đơn" key="billing">
                    <CustomerShippingInfo
                      setIsShowModalBilling={setIsShowModalBilling}
                      isShowModalBilling={isShowModalBilling}
                      customer={customer}
                      customerDetailState={activeTab}
                      setModalAction={setModalAction}
                      modalAction={modalAction}
                      allowUpdateCustomer={allowUpdateCustomer}
                    />
                  </TabPane>

                  <TabPane tab="Liên hệ" key="contacts">
                    <CustomerContactInfo
                      setIsShowModalContacts={setIsShowModalContacts}
                      isShowModalContacts={isShowModalContacts}
                      customer={customer}
                      customerDetailState={activeTab}
                      setModalAction={setModalAction}
                      modalAction={modalAction}
                    />
                  </TabPane>

                  {allowUpdateCustomer && isShowAddBtn && (
                    <TabPane
                      tab={
                        <span>
                          <PlusOutlined />
                          {mappingBtnName[history.location.hash]}
                        </span>
                      }
                      key="add"
                    />
                  )}
                </Tabs>
              </Card>
            </>
            : <NoPermission />)}
        </AuthWrapper>
      </ContentContainer>
    </StyledCustomerDetail>
  );
};

export default CustomerDetailIndex;
