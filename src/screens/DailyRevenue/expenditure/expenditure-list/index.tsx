import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space } from "antd";
import exportIcon from "assets/icon/export.svg";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { PagingParam } from "model/paging";
import { ExpenditureSearchQuery, ExpenditureTableModel } from "model/revenue/expenditure.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { getDataTable } from "screens/DailyRevenue/helper";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import ExpenditureFilter from "../component/expenditure-filter";
import ExpenditureTable from "../component/expenditure-table";
import { StyledComponent } from "./style";

let initQueryDefault: ExpenditureSearchQuery = {
  page: 1,
  limit: 30,
  store_ids: [],
  create_date: null,
};

const ExpenditureList: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();

  let dataQuery: ExpenditureSearchQuery = {
    ...initQueryDefault,
    ...getQueryParams(query),
  };

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [params, setPrams] = useState<ExpenditureSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<ExpenditureTableModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  useEffect(() => {
    dispatch(StoreGetListAction(setStores));
  }, [dispatch]);

  const onFilter = useCallback(
    (values: any) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery(newPrams);
      if (currentParam !== queryParam) {
        history.push(`${UrlConfig.EXPENDITURE}?${queryParam}`);
        setPrams({ ...newPrams });
      }
    },
    [history, params],
  );

  useEffect(() => {
    let pagingParam: PagingParam = {
      perPage: Number(params.limit) || 30,
      currentPage: Number(params.page) || 1,
    };
    const dataResult = getDataTable(pagingParam);

    console.log("dataResult", dataResult);
    setData({
      metadata: {
        limit: dataResult.perPage,
        page: dataResult.currentPage,
        total: dataResult.total,
      },
      items: dataResult.result,
    });
  }, [params]);

  return (
    <React.Fragment>
      <ContentContainer
        title="Danh sách phiếu thu chi"
        breadcrumb={[{ name: "Tổng kết ca" }, { name: "Danh sách phiếu" }]}
        extra={
          <React.Fragment>
            <Space size={8}>
              <Button
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                size="large"
              >
                Xuất file
              </Button>
              <Button icon={<PlusOutlined />} size="large">
                Tạo phiếu
              </Button>
              <Button type="primary" size="large">
                Tạo phiếu nhanh
              </Button>
            </Space>
          </React.Fragment>
        }
      >
        <StyledComponent>
          <Card>
            <ExpenditureFilter stores={stores} onFilter={onFilter} params={params} />
            <ExpenditureTable params={params} setParams={setPrams} setData={setData} data={data} />
          </Card>
        </StyledComponent>
      </ContentContainer>
    </React.Fragment>
  );
};

export default ExpenditureList;
