import { Button, Card, Row, Select, Spin } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useGetStoreIdFromLocalStorage from "hook/useGetStoreIdFromLocalStorage";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { RevenueSearchQuery } from "model/revenue";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getListStore } from "service/core/store.service";
import { getDailyRevenueService } from "service/daily-revenue";
import { StyledComponent } from "./style";

let initQueryDefault: RevenueSearchQuery = {
  page: 1,
  limit: 1000,
  store_ids: [],
  date: null,
};

const DailyRevenueToday: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const storeReducer = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [storeId, setStoreId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const storeIdLogin = useGetStoreIdFromLocalStorage();

  const redirectDailyRevenueToday = useCallback(
    (storeId: number) => {
      const date = moment().startOf("day").format("YYYY-MM-DD");
      initQueryDefault.date = date;
      initQueryDefault.store_ids = [storeId];

      dispatch(showLoading());
      getDailyRevenueService(initQueryDefault)
        .then((response) => {
          if (response.status === 200 && response.data && response.data.length !== 0) {
            const dailyRevenueId = response.data[0].id;
            history.push(`${UrlConfig.DAILY_REVENUE}/${dailyRevenueId}`);
          }
        })
        .catch()
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [dispatch, history],
  );

  useEffect(() => {
    if (storeIdLogin) setStoreId(storeIdLogin);
  }, [storeIdLogin]);

  useEffect(() => {
    if (!storeReducer || (storeReducer && storeReducer.length === 0)) {
      setLoading(true);
      getListStore()
        .then((response) => {
          setListStores(response.data);
        })
        .catch()
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dispatch, storeReducer]);

  useEffect(() => {
    if (storeReducer && storeReducer.length === 1) {
      const store = storeReducer[0];
      redirectDailyRevenueToday(store.store_id || 0);
    }
  }, [redirectDailyRevenueToday, storeReducer]);

  return (
    <ContentContainer title="">
      <StyledComponent>
        {storeReducer && storeReducer.length === 1 ? null : (
          <Row className="revenue-container">
            <Card
              title="Chọn cửa hàng"
              bordered={false}
              actions={[
                <Button
                  type="primary"
                  onClick={() => {
                    redirectDailyRevenueToday(storeId || 0);
                  }}
                  disabled={!storeId}
                >
                  Chọn
                </Button>,
              ]}
            >
              <Spin spinning={loading}>
                <Select
                  value={storeId}
                  showSearch
                  placeholder="Chọn cửa hàng"
                  optionFilterProp="children"
                  allowClear
                  filterOption={(input, option) =>
                    (option!.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    console.log(value);
                    setStoreId(value ? Number(value) : undefined);
                  }}
                >
                  {listStores && listStores.length !== 0
                    ? listStores.map((p, index) => (
                        <Select.Option key={index} value={p.id || 0}>
                          {p.name}
                        </Select.Option>
                      ))
                    : storeReducer &&
                      storeReducer?.map((p, index) => (
                        <Select.Option key={index} value={p.store_id || 0}>
                          {p.store}
                        </Select.Option>
                      ))}
                </Select>
              </Spin>
            </Card>
          </Row>
        )}
      </StyledComponent>
    </ContentContainer>
  );
};

export default DailyRevenueToday;
