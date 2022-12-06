import { Row, Col, Card, Tabs, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { modalActionType } from "model/modal/modal.model";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import NumberFormat from "react-number-format";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { CustomerResponse } from "model/response/customer/customer.response";

import CustomerDetailInfo from "screens/customer/customer-detail/CustomerDetailInfo";
import CustomerContactInfo from "./customer-contact/customer.contact";
import CustomerShippingAddressInfo from "./customer-shipping/customer.shipping";
import CustomerShippingInfo from "./customer-billing/customer.billing";
import CustomerNoteInfo from "./customer-note/customer.note";
import CustomerActivityLog from "screens/customer/customer-detail/CustomerActivityLog";
import CustomerCareHistory from "screens/customer/customer-detail/CustomerCareHistory";

import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import {
  getLoyaltyPoint,
  getLoyaltyUsage,
  getRecalculatePointCustomerAction,
  getRecalculateMoneyCustomerAction,
} from "domain/actions/loyalty/loyalty.action";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { LoyaltyCardSearch } from "domain/actions/loyalty/card/loyalty-card.action";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { CustomerListPermission } from "config/permissions/customer.permission";
import { LOYALTY_ADJUSTMENT_PERMISSIONS } from "config/permissions/loyalty.permission";
import useAuthorization from "hook/useAuthorization";

import warningCircleIcon from "assets/icon/warning-circle.svg";
import { StyledCustomerDetail } from "screens/customer/customer-detail/customerDetailStyled";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import { RegionResponse } from "model/content/country.model";
import { GetRegionAction } from "domain/actions/content/content.action";
import CustomerOrderHistory from "./CustomerOrderHistory";
import { showSuccess } from "utils/ToastUtils";
import CustomerFamily from "screens/customer/customer-detail/customer-family/CustomerFamily";
import BottomBarContainer from "component/container/bottom-bar.container";
import { cloneDeep } from "lodash";

const { TabPane } = Tabs;

const defaultActions: Array<MenuAction> = [
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

const viewCustomerDetailPermission = [
  CustomerListPermission.customers_read,
  ORDER_PERMISSIONS.CREATE,
];
const updateCustomerPermission = [CustomerListPermission.customers_update];
const recalculateMoneyPointPermission = [CustomerListPermission.customers_recalculate_money_point];
const createLoyaltyAdjustmentPermission = [LOYALTY_ADJUSTMENT_PERMISSIONS.CREATE];

const CustomerDetail = () => {
  const [allowViewCustomerDetail] = useAuthorization({
    acceptPermissions: viewCustomerDetailPermission,
    not: false,
  });

  const [allowUpdateCustomer] = useAuthorization({
    acceptPermissions: updateCustomerPermission,
    not: false,
  });

  const [allowRecalculateMoneyPoint] = useAuthorization({
    acceptPermissions: recalculateMoneyPointPermission,
    not: false,
  });

  const [allowCreateLoyaltyAdjustment] = useAuthorization({
    acceptPermissions: createLoyaltyAdjustmentPermission,
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
  const [modalAction, setModalAction] = React.useState<modalActionType>("create");
  const [loyaltyPoint, setLoyaltyPoint] = React.useState<any>(null);
  const [loyaltyCard, setLoyaltyCard] = React.useState<any>();
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = React.useState<Array<LoyaltyUsageResponse>>(
    [],
  );
  const [customerSpendDetail, setCustomerSpendDetail] = React.useState<any>([]);

  const actions: Array<MenuAction> = useMemo(() => {
    let _actions = allowCreateLoyaltyAdjustment ? cloneDeep(defaultActions) : [];

    if (allowRecalculateMoneyPoint) {
      _actions.push(
        {
          id: 5,
          name: "Tính lại điểm tích lũy",
        },
        {
          id: 6,
          name: "Tính lại tiền tích lũy",
        },
      );
    }

    return _actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowCreateLoyaltyAdjustment, allowRecalculateMoneyPoint]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // get region list
  const [regionList, setRegionList] = useState<Array<RegionResponse>>([]);

  useEffect(() => {
    dispatch(
      GetRegionAction((response) => {
        if (response) {
          setRegionList(response);
        }
      }),
    );
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch]);
  // end get region list

  const updateLoyaltyCard = useCallback(
    (result) => {
      if (result && result.items && result.items.length) {
        const loyaltyCardData = result.items.find((item: any) => item.customer_id === customer?.id);
        setLoyaltyCard(loyaltyCardData);
      }
    },
    [customer],
  );

  useEffect(() => {
    if (!allowViewCustomerDetail) {
      return;
    }

    if (customer && customer.id) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
      dispatch(
        LoyaltyCardSearch({ customer_id: customer.id, statuses: ["ASSIGNED"] }, updateLoyaltyCard),
      );
    } else {
      setLoyaltyPoint(null);
    }
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
        case "#activity-log":
          setActiveTab("activity-log");
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
        case "#family":
          setActiveTab("family");
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
    const purchaseInfo = customer?.report;
    const _detail = [
      {
        name: "Tổng đơn hàng",
        value: purchaseInfo?.total_finished_order || null,
      },
      {
        name: "Nơi mua đầu",
        value: purchaseInfo
          ? purchaseInfo.first_order_type?.toLowerCase() === "online"
            ? purchaseInfo.source_of_first_order_online
            : purchaseInfo.store_of_first_order_offline
          : null,
      },
      {
        name: "Số đơn trả",
        value: purchaseInfo?.total_returned_order ? (
          <NumberFormat
            value={purchaseInfo?.total_returned_order}
            displayType={"text"}
            thousandSeparator={true}
          />
        ) : null,
      },

      {
        name: "Tiền tích lũy",
        value: (
          <NumberFormat
            value={loyaltyPoint?.total_money_spend}
            displayType={"text"}
            thousandSeparator={true}
          />
        ),
      },
      {
        name: "Ngày mua đầu",
        value: purchaseInfo?.first_order_time ? (
          <span>{ConvertUtcToLocalDate(purchaseInfo?.first_order_time, DATE_FORMAT.DDMMYYY)}</span>
        ) : null,
      },
      {
        name: "Tổng giá trị đơn trả",
        value: purchaseInfo?.total_refunded_amount ? (
          <NumberFormat
            value={purchaseInfo?.total_refunded_amount}
            displayType={"text"}
            thousandSeparator={true}
          />
        ) : null,
      },
      {
        name: "Số ngày chưa mua",
        value: purchaseInfo?.number_of_days_without_purchase || null,
      },
      {
        name: "Nơi mua cuối",
        value: purchaseInfo
          ? purchaseInfo.last_order_type?.toLowerCase() === "online"
            ? purchaseInfo.source_of_last_order_online
            : purchaseInfo.store_of_last_order_offline
          : null,
      },
      {
        name: "Số tiền cần nâng hạng",
        value: loyaltyPoint?.remain_amount_to_level_up ? (
          <NumberFormat
            value={loyaltyPoint?.remain_amount_to_level_up}
            displayType={"text"}
            thousandSeparator={true}
          />
        ) : null,
      },
      {
        name: (
          <div className="average-value">
            <span>Giá trị trung bình</span>
            <Tooltip overlay="GTTB = Tiền tích lũy/Tổng đơn hàng" placement="top" color="blue">
              <img src={warningCircleIcon} style={{ marginLeft: 5, cursor: "pointer" }} alt="" />
            </Tooltip>
          </div>
        ),
        value: purchaseInfo?.average_order_value ? (
          <NumberFormat
            value={Math.round(purchaseInfo?.average_order_value)}
            displayType={"text"}
            thousandSeparator={true}
          />
        ) : null,
      },
      {
        name: "Ngày mua cuối",
        value: purchaseInfo?.last_order_time ? (
          <span>{ConvertUtcToLocalDate(purchaseInfo?.last_order_time, DATE_FORMAT.DDMMYYY)}</span>
        ) : null,
      },
      {
        name: "Ngày lên hạng gần nhất",
        value: loyaltyPoint?.level_change_time ? (
          <span>{ConvertUtcToLocalDate(loyaltyPoint.level_change_time, DATE_FORMAT.DDMMYYY)}</span>
        ) : null,
      },
      {
        name: "Doanh thu",
        value: loyaltyPoint?.gross_sale ? (
          <NumberFormat
            value={loyaltyPoint?.gross_sale}
            displayType={"text"}
            thousandSeparator={true}
          />
        ) : null,
      },
    ];

    setCustomerSpendDetail(_detail);
  }, [customer?.report, loyaltyPoint]);

  React.useEffect(() => {
    const _detail = [
      {
        name: "Điểm hiện tại",
        value: (
          <NumberFormat value={loyaltyPoint?.point} displayType={"text"} thousandSeparator={true} />
        ),
      },
      {
        name: "Hạng thẻ",
        value:
          loyaltyUsageRules?.find((item) => item.rank_id === loyaltyPoint?.loyalty_level_id)
            ?.rank_name || null,
      },
      {
        name: "Ngày gắn thẻ",
        value: loyaltyCard?.assigned_date
          ? ConvertUtcToLocalDate(loyaltyCard.assigned_date, DATE_FORMAT.DDMMYYY)
          : null,
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

    dispatch(getCustomerDetailAction(params.id, setCustomer));
  }, [allowViewCustomerDetail, dispatch, params, setCustomer]);

  const handleChangeTab = (active: string) => {
    switch (active) {
      case "contacts":
      case "billing":
      case "shipping":
      case "notes":
        setIsShowAddBtn(true);
        break;
      case "caring-history":
      case "updated-logging":
      case "history":
      case "activity-log":
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
        case "#activity-log":
          setIsShowAddBtn(false);
          break;
      }
    } else {
      history.replace(`${history.location.pathname}#${active}`);
    }
  };

  const handleRecalculatePointCustomer = (data: any) => {
    if (data) {
      showSuccess("Cập nhập điểm tích lũy thành công");
      setLoyaltyPoint((prev: any) => {
        return {
          ...prev,
          point: data?.point,
        };
      });
    }
  };

  const handleRecalculateMoneyCustomer = (data: any) => {
    if (data) {
      showSuccess("Cập nhập tiền tích lũy thành công");
      setLoyaltyPoint((prev: any) => {
        return {
          ...prev,
          total_money_spend: data?.total_money_spend,
        };
      });
    }
  };

  const onMenuClick = React.useCallback(
    (menuId: number) => {
      switch (menuId) {
        case 1:
          history.replace(
            `${UrlConfig.CUSTOMER2}-adjustments/create?type=ADD_POINT&customer_ids=${customer?.id}`,
          );
          break;
        case 2:
          history.replace(
            `${UrlConfig.CUSTOMER2}-adjustments/create?type=SUBTRACT_POINT&customer_ids=${customer?.id}`,
          );
          break;
        case 3:
          history.replace(
            `${UrlConfig.CUSTOMER2}-adjustments/create?type=ADD_MONEY&customer_ids=${customer?.id}`,
          );
          break;
        case 4:
          history.replace(
            `${UrlConfig.CUSTOMER2}-adjustments/create?type=SUBTRACT_MONEY&customer_ids=${customer?.id}`,
          );
          break;
        case 5:
          if (customer?.id) {
            dispatch(
              getRecalculatePointCustomerAction(customer.id, handleRecalculatePointCustomer),
            );
          }
          break;
        case 6:
          if (customer?.id) {
            dispatch(
              getRecalculateMoneyCustomerAction(customer.id, handleRecalculateMoneyCustomer),
            );
          }
          break;
      }
    },
    [customer?.id, dispatch, history],
  );

  return (
    <StyledCustomerDetail>
      {customer ? (
        <ContentContainer
          title="Thông tin chi tiết"
          extra={
            actions?.length > 0 && (
              <ActionButton type="default" menu={actions} onMenuClick={onMenuClick} />
            )
          }
        >
          <AuthWrapper acceptPermissions={viewCustomerDetailPermission} passThrough>
            {(allowed: boolean) =>
              allowed ? (
                <>
                  <div className="customer-info">
                    <CustomerDetailInfo
                      customer={customer}
                      loyaltyCard={loyaltyCard}
                      regionList={regionList}
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
                        ))}
                    </Card>
                  </div>

                  <Card
                    title={<span className="card-title">THÔNG TIN MUA HÀNG</span>}
                    className="purchase-info"
                  >
                    <Row>
                      {customerSpendDetail &&
                        customerSpendDetail.map((info: any, index: number) => (
                          <Col key={index} span={8} className="item-info">
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
                        <CustomerOrderHistory customer={customer} />
                      </TabPane>

                      <TabPane tab="Lịch sử chăm sóc" key="caring-history">
                        <CustomerCareHistory customer={customer} />
                      </TabPane>

                      <TabPane tab="Lịch sử thao tác" key="activity-log">
                        {activeTab === "activity-log" && (
                          <CustomerActivityLog customer={customer} />
                        )}
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

                      <TabPane tab="Thông tin người thân" key="family">
                        <CustomerFamily customer={customer} />
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

                  {/* <BottomBarContainer
                    back={"Quay lại danh sách khách hàng"}
                    backAction={() => {
                      history.push(`${UrlConfig.CUSTOMER}`)
                    }}
                  /> */}
                </>
              ) : (
                <NoPermission />
              )
            }
          </AuthWrapper>
        </ContentContainer>
      ) : (
        <ContentContainer title="Thông tin chi tiết">
          <Card title={<span className="card-title">KHÔNG CÓ THÔNG TIN KHÁCH HÀNG</span>} />
          <BottomBarContainer
            back={"Quay lại danh sách khách hàng"}
            backAction={() => {
              history.push(`${UrlConfig.CUSTOMER}`);
            }}
          />
        </ContentContainer>
      )}
    </StyledCustomerDetail>
  );
};

export default CustomerDetail;
