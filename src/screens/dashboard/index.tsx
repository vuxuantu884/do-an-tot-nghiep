import { Card, Checkbox, Col, Divider, Row } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { GoodsAreComing, MonthIncome, OrderStatus, RankIncome } from "model/dashboard/dashboard.model";
import queryString from "query-string";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getGoodAreComingService,
  getMonthIncomeService,
  getOrderStatusService,
  getProductGroupIncomeService,
  getRankIncomeService,
} from "service/dashboard/dashboard.service";
import { callApiNative } from "utils/ApiUtils";
import { showWarning } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import CompareMonthlyChartArea from "./chart/compare-monthly-chart-area";
import RankHorizontalChart from "./chart/rank-hirizontal-chart";
import RankVerticalChart from "./chart/rank-vertical-chart";
import { DashboardContainer } from "./index.style";
import DateFilterSelect from "./shared/date-filter-select";
import DepartmentSelect from "./shared/department-select";
import GoodAreComingTable from "./shared/good-are-coming-table";
import Greeting from "./shared/greeting";
import ImcomeGroupTab from "./shared/imcome-group-tab";
import IncomeBox from "./shared/income-box";
import OrderStatusTable from "./shared/order-status-table";
const DEPARTMENT_CONTENT_PROPS = {
  title: "Bảng thi đua giữa các bộ phận",
  subTitle: "Top 5 bộ phận có doanh thu cao nhất tháng",
};

const INCOME_CART_NAME = {
  online_income: "Doanh thu online",
  offline_income: "Doanh thu offline",
  return_income: "Doanh thu Trả hàng",
  cancel_income: "Doanh thu Huỷ đơn",
  success_rate: "Tỉ lệ thành công",
  average_order: "GTTB/ Hóa đơn",
  conversion_rate: "Tỉ lệ chuyển đổi",
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [monthIncome, setMonthIncome] = useState<MonthIncome>();
  const [rankIncome, setRankIncome] = useState<RankIncome>();
  const [productGroup, setProductGroup] = useState<any>({
    product_group_incomes: [],
    product_group_quantities: [],
  });
  const [goodAreComing, setGoodAreComing] = useState<GoodsAreComing>({
    data: [],
    total: 0,
  });
  const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
  const query = useQuery();
  const amountTime = query.get("amountTime");
  const departmentId = query.get("departmentId");
  let isSeeMyData: any = query.get("isSeeMyData");
  if (typeof isSeeMyData === "string") {
    isSeeMyData = isSeeMyData.toLowerCase() === "true";
  } else {
    isSeeMyData = true;
  }

  const handleChangeSeeMyData = (e: CheckboxChangeEvent) => {
    const value = e.target.checked;
    history.replace("?" + queryString.stringify({ amountTime, departmentId, isSeeMyData: value }));
  };

  const getMonthIncomeData = useCallback(
    async (params) => {
      const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getMonthIncomeService, params);
      if (response) {
        setMonthIncome(response);
      }
      console.log("getMonthIncomeData", response?.income_card);
    },
    [dispatch]
  );
  const getRankIncomeData = useCallback(
    async (params) => {
      const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getRankIncomeService, params);
      if (response) {
        setRankIncome(response);
      }
    },
    [dispatch]
  );

  const getProductGroupIncomeData = useCallback(
    async (params) => {
      const response = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getProductGroupIncomeService,
        params
      );

      if (response) {
        console.log(response);
        setProductGroup({ ...response, product_group_quantities: response.product_group_quantitys });
      }
    },
    [dispatch]
  );

  const getGoodAreComingData = useCallback(
    async (params) => {
      const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getGoodAreComingService, params);
      if (response) {
        setGoodAreComing(response);
      }
    },
    [dispatch]
  );
  const getOrderStatusData = useCallback(
    async (params) => {
      const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getOrderStatusService, params);
      if (response) {
        setOrderStatus(response);
      }
    },
    [dispatch]
  );
  useEffect(() => {
    const parmas = {
      amountTime,
      departmentId,
      isSeeMyData,
    };
    if (amountTime && departmentId) {
      getMonthIncomeData(parmas);
      getRankIncomeData(parmas);
      getProductGroupIncomeData(parmas);
      getGoodAreComingData(parmas);
      getOrderStatusData(parmas);
    } else {
      showWarning("Vui lòng thời gian và bộ phận");
    }
  }, [
    getMonthIncomeData,
    getRankIncomeData,
    getProductGroupIncomeData,
    getGoodAreComingData,
    getOrderStatusData,
    amountTime,
    departmentId,
    isSeeMyData,
  ]);

  return (
    <DashboardContainer>
      <Greeting />
      <Card>
        <div className="dashboard-filter">
          <h1 className="title">BỘ LỌC</h1>
          <DateFilterSelect className="select-filter" />
          <DepartmentSelect className="select-filter" />
          <Checkbox checked={isSeeMyData} onChange={handleChangeSeeMyData}>
            Xem dữ liệu của tôi
          </Checkbox>
        </div>
      </Card>
      <Card title="KẾT QUẢ KINH DOANH" className="business-results">
        {monthIncome && (
          <Row className="verti-grid">
            <Col span={6}>
              <div className="verti-grid__item">
                <IncomeBox
                  title={INCOME_CART_NAME.offline_income}
                  value={monthIncome?.income_card?.offline_income.income}
                  monthlyAccumulated={monthIncome?.income_card?.offline_income?.monthlyAccumulated}
                  type="number"
                />
              </div>
              <div className="verti-grid__item">
                <IncomeBox
                  title={INCOME_CART_NAME.online_income}
                  value={monthIncome?.income_card?.online_income?.income}
                  monthlyAccumulated={monthIncome?.income_card?.online_income?.monthlyAccumulated}
                  type="number"
                />
              </div>
              <div className="verti-grid__item">
                <IncomeBox
                  title={INCOME_CART_NAME.cancel_income}
                  value={monthIncome?.income_card?.cancel_income?.income}
                  monthlyAccumulated={monthIncome?.income_card?.cancel_income?.monthlyAccumulated}
                  type="number"
                />
              </div>
              <div className="verti-grid__item">
                <IncomeBox
                  title={INCOME_CART_NAME.return_income}
                  value={monthIncome?.income_card?.return_income?.income}
                  monthlyAccumulated={monthIncome?.income_card?.return_income?.monthlyAccumulated}
                  type="number"
                />
              </div>
            </Col>

            <Col span={18}>
              <Row className="horiz-grid">
                <Col span={8} className="horiz-grid__item">
                  <IncomeBox
                    title={INCOME_CART_NAME.conversion_rate}
                    value={monthIncome?.income_card?.conversion_rate?.income}
                    monthlyAccumulated={monthIncome?.income_card?.conversion_rate?.monthlyAccumulated}
                    type="number"
                  />
                </Col>
                <Col span={8} className="horiz-grid__item">
                  <IncomeBox
                    title={INCOME_CART_NAME.average_order}
                    value={monthIncome?.income_card?.average_order?.income}
                    monthlyAccumulated={monthIncome?.income_card?.average_order?.monthlyAccumulated}
                    type="number"
                  />
                </Col>
                <Col span={8} className="horiz-grid__item">
                  <IncomeBox
                    title={INCOME_CART_NAME.success_rate}
                    value={monthIncome?.income_card?.success_rate?.income}
                    monthlyAccumulated={monthIncome?.income_card?.success_rate?.monthlyAccumulated}
                    type="percent"
                  />
                </Col>
              </Row>
              <div className="chart-monthly-container">
                {monthIncome?.income_chart && <CompareMonthlyChartArea {...monthIncome.income_chart} />}
              </div>
            </Col>
            <div className="padding-20" />
          </Row>
        )}
      </Card>
      <Card title="BẢNG THI ĐUA">
        <Row className="rank-container">
          <Col span={8} className="user-rank">
            {rankIncome?.user_income_list && <RankVerticalChart data={rankIncome.user_income_list} />}
          </Col>
          <Col span={8} className="store-rank">
            {rankIncome?.store_income_list && <RankHorizontalChart data={rankIncome.store_income_list} />}
          </Col>
          <Col span={8} className="department-rank">
            {rankIncome?.department_income_list && (
              <RankHorizontalChart data={rankIncome.department_income_list} {...DEPARTMENT_CONTENT_PROPS} />
            )}
          </Col>
        </Row>
        <div className="padding-20" />
      </Card>
      <Card className="cart-bottom-wrapper">
        <Row gutter={20}>
          <Col span={10}>
            <Card title="Doanh thu theo nhóm sản phẩm theo tháng" className="product-group-cart">
              <ImcomeGroupTab data={productGroup} />
            </Card>
          </Col>
          <Col span={14}>
            <GoodAreComingTable {...goodAreComing} />
            <Divider className="divider-table" />
            <OrderStatusTable data={orderStatus} />
          </Col>
        </Row>
      </Card>
    </DashboardContainer>
  );
};

export default Dashboard;
