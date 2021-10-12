import { Row, Col, Card, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { modalActionType } from "model/modal/modal.model";
import React from "react";
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

const { TabPane } = Tabs;

const CustomerDetailIndex = () => {
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
  // const [loyaltyCard, setLoyaltyCard] = React.useState<PageResponse<LoyaltyCardResponse>>();
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
  console.log(loyaltyPoint);
  const [data, setData] = React.useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [tableLoading, setTableLoading] = React.useState<boolean>(false);
  // add and edit contact section;
  React.useEffect(() => {
    if (customer) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
      // dispatch(LoyaltyCardSearch(cardQuery, setLoyaltyCard))
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch, customer]);
  React.useEffect(() => {
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
  }, [history.location.hash]);

  const mappingBtnName: any = {
    "#notes": "Thêm ghi chú",
    "#billing": "Thêm địa chỉ",
    "#shipping": "Thêm địa chỉ",
    "#contacts": "Thêm liên hệ",
    "#caring-history": "Thêm mới",
  };

  React.useEffect(() => {
    const _detail = [
      {
        name: "Tổng chi tiêu",
        value: formatCurrency(
          loyaltyPoint?.total_money_spend ? loyaltyPoint?.total_money_spend : ""
        ),
      },
      {
        name: "Ngày cuối mua online",
        value: null,
      },
      {
        name: "Ngày cuối mua offline",
        value: null,
      },
      {
        name: "Tổng đơn hàng",
        value: loyaltyPoint?.total_order_count,
      },
      {
        name: "Tại cửa hàng",
        value: null,
      },
      {
        name: "Tại cửa hàng",
        value: null,
      },
    ];

    setCustomerSpendDetail(_detail);
  }, [loyaltyPoint]);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQueryParams({ ...queryParams, page, limit });
    },
    [queryParams, setQueryParams]
  );

  const setOrderHistoryItems = React.useCallback(
    (data: PageResponse<OrderModel> | false) => {
      if (data) {
        setData(data);
        setTableLoading(false);
      }
    },
    []
  );
  React.useEffect(() => {
    if (params?.id) {
      queryParams.customer_ids = [params?.id];
      dispatch(GetListOrderCustomerAction(queryParams, setOrderHistoryItems));
    }
  }, [params, dispatch, queryParams, setOrderHistoryItems]);
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
        value: null,
      },
      {
        name: "CH gắn thẻ",
        value: null,
      },
    ];
    setCustomerPoint(_detail);
  }, [loyaltyPoint, loyaltyUsageRules, customer]);

  React.useEffect(() => {
    dispatch(CustomerDetail(params.id, setCustomer));
  }, [dispatch, params, setCustomer]);

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
      }
    },
    [customer, history]
  );
  return (
    <ContentContainer
      title="Thông tin chi tiết"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `/customers`,
        },
        {
          name: "Chi tiết khách hàng",
        },
      ]}
      extra={
        <div className="page-filter">
          <div className="page-filter-heading">
            <div className="page-filter-left">
              <ActionButton
                // disabled={actionDisable}
                menu={actions}
                onMenuClick={onMenuClick}
              />
            </div>
          </div>
        </div>
      }
    >
      <Row gutter={24} className="customer-info-detail">
        <Col span={18}>
          <CustomerInfo customer={customer} />
          <Card
            style={{ marginTop: 20 }}
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN MUA HÀNG</span>
              </div>
            }
            // extra={[
            //   <Link key="1" to={``}>
            //     Chi tiết
            //   </Link>,
            // ]}
          >
            <Row gutter={30} style={{ padding: "16px" }}>
              {customerSpendDetail &&
                customerSpendDetail.map((info: any, index: number) => (
                  <Col
                    key={index}
                    span={8}
                    style={{
                      display: "flex",
                      marginBottom: 10,
                      color: "#222222",
                    }}
                  >
                    <Col span={11} style={{ padding: "0 0 0 15px" }}>
                      <span>{info.name}</span>
                    </Col>
                    <Col span={13}>
                      <b>: {info.value ? info.value : "---"}</b>
                    </Col>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className="customer-point-detail"
            style={{ height: "100%" }}
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN TÍCH ĐIỂM</span>
              </div>
            }
          >
            <Row gutter={30} style={{ padding: "16px" }}>
              {customerPointInfo &&
                customerPointInfo.map((detail: any, index: number) => (
                  <Col
                    key={index}
                    span={24}
                    style={{
                      display: "flex",
                      marginBottom: 10,
                      color: "#222222",
                    }}
                  >
                    <Col span={12} style={{ padding: "0 0 0 15px" }}>
                      <span>{detail.name}</span>
                    </Col>
                    <Col span={12}>
                      <b>: {detail.value ? detail.value : "---"}</b>
                    </Col>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
      </Row>
      <Row className="customer-tabs-detail">
        <Col span={24}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={(active) => handleChangeTab(active)}
              style={{ overflow: "initial" }}
            >
              <TabPane tab="Lịch sử mua hàng" key="history">
                <CustomerHistoryInfo
                  orderData={data}
                  onPageChange={onPageChange}
                  tableLoading={tableLoading}
                />
              </TabPane>
              <TabPane tab="Lịch sử chăm sóc" key="caring-history">
                <CustomerCareHistory />
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
              <TabPane tab="Địa chỉ nhận hàng" key="shipping">
                <CustomerShippingAddressInfo
                  isShowModalShipping={isShowModalShipping}
                  setIsShowModalShipping={setIsShowModalShipping}
                  customer={customer}
                  customerDetailState={activeTab}
                  setModalAction={setModalAction}
                  modalAction={modalAction}
                />
              </TabPane>
              <TabPane tab="Địa chỉ nhận hóa đơn" key="billing">
                <CustomerShippingInfo
                  setIsShowModalBilling={setIsShowModalBilling}
                  isShowModalBilling={isShowModalBilling}
                  customer={customer}
                  customerDetailState={activeTab}
                  setModalAction={setModalAction}
                  modalAction={modalAction}
                />
              </TabPane>

              <TabPane tab="Log chỉnh sửa" key="updated-logging"></TabPane>
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
              {isShowAddBtn && (
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
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default CustomerDetailIndex;
