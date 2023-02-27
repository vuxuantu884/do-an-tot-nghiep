import React, { Fragment, ReactNode, useCallback, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import UrlConfig from "config/url.config";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { DATE_FORMAT } from "utils/DateUtils";
import { generateQuery } from "utils/AppUtils";
import queryString from "query-string";
import moment from "moment/moment";
import { PageResponse } from "model/base/base-metadata.response";
import { PromotionCampaignQuery, PromotionCampaignResponse } from "model/promotion/campaign.model";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ContentContainer from "component/container/content.container";
import { getPromotionCampaignListAction } from "domain/actions/promotion/campaign/campaign.action";
import PromotionCampaignListFilter from "screens/promotion/campaign/components/PromotionCampaignListFilter";
import { DISCOUNT_STATUS } from "screens/promotion/constants";
import { EmptyDataTable } from "screens/promotion/campaign/components/EmptyDataTable";

const initQuery: PromotionCampaignQuery = {
  page: 1,
  limit: 30,
  request: "",
  starts_date: "",
  ends_date: "",
};
const PromotionCampaignList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const [params, setParams] = useState<PromotionCampaignQuery>(initQuery);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [campaignListData, setCampaignListData] = useState<PageResponse<PromotionCampaignResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  /** handle get promotion campaign list */
  const getPromotionCampaignListCallback = useCallback((data: PageResponse<PromotionCampaignResponse> | null) => {
    setTableLoading(false);
    if (data) {
      setCampaignListData(data);
    }
  }, []);

  const getPromotionCampaignList = useCallback(
    (params: PromotionCampaignQuery) => {
      window.scrollTo(0, 0);
      setTableLoading(true);
      dispatch(getPromotionCampaignListAction(params, getPromotionCampaignListCallback));
    },
    [dispatch, getPromotionCampaignListCallback],
  );

  useEffect(() => {
    const dataQuery: any = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      starts_date: queryParamsParsed.starts_date,
      ends_date: queryParamsParsed.ends_date,
    };
    setParams(dataQuery);
    getPromotionCampaignList(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPromotionCampaignList, location.search]);
  /** end handle get promotion campaign list */

  /** table colums */
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã chương trình KM",
      align: "center",
      width: "150px",
      render: (item: any) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${item.id}`}
          style={{ color: "#2A2A86", fontWeight: 500 }}
        >
          {item.code}
        </Link>
      ),
    },
    {
      title: "Tên chương trình KM",
      dataIndex: "name",
    },
    {
      title: "Thời gian bắt đầu",
      align: "center",
      width: "150px",
      render: (item: any) => (
        <>
          {item.starts_date &&
            <span>{moment(item.starts_date).format(DATE_FORMAT.DDMMYY_HHmm)}</span>
          }
        </>
      ),
    },
    {
      title: "Thời gian kết thúc",
      align: "center",
      width: "150px",
      render: (item: any) => (
        <>
          {item.ends_date ?
            <span>{moment(item.ends_date)?.format(DATE_FORMAT.DDMMYY_HHmm)}</span>
            :
            <div style={{ textAlign: "center" }}>∞</div>
          }
        </>
      ),
    },
    {
      title: "Người tạo",
      align: "center",
      width: "20%",
      render: (item: any) => {
        return (
          <div>{`${item.created_by || ""} - ${item.created_name || ""}`}</div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      align: "center",
      width: "150px",
      render: (state: string) => {
        const StatusTag: ReactNode = DISCOUNT_STATUS.find((e) => e.code === state)?.Component ?? (
          <Fragment />
        );
        return StatusTag;
      },
    },
  ];

  const onPageChange = (page: number, limit?: number) => {
    const newParams = { ...params, page, limit };
    const queryParam = generateQuery(newParams);
    history.push(`${location.pathname}?${queryParam}`);
  };

  const onFilter = (values: PromotionCampaignQuery | Object) => {
    const newParams = { ...params, ...values, page: 1 };
    const queryParam = generateQuery(newParams);
    const currentParam = generateQuery(params);
    if (currentParam === queryParam) {
      getPromotionCampaignList(newParams);
    } else {
      history.push(`${location.pathname}?${queryParam}`);
    }
  };


  return (
    <ContentContainer
      title="Quản lý chương trình KM"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quản lý chương trình KM",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`,
        },
      ]}
      extra={
        <Link to={`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/create`}>
          <Button
            className="ant-btn-outline ant-btn-primary"
            size="large"
            icon={<PlusOutlined />}

          >
            Tạo mới chương trình khuyến mại
          </Button>
        </Link>
      }
    >
      <Card>
        <PromotionCampaignListFilter
          params={params}
          onFilter={onFilter}
        />
        <CustomTable
          bordered
          isLoading={tableLoading}
          sticky={{
            offsetScroll: 5,
            offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
          }}
          locale={{
            emptyText: <EmptyDataTable />
          }}
          pagination={{
            pageSize: campaignListData?.metadata.limit || 0,
            total: campaignListData?.metadata.total || 0,
            current: campaignListData?.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          isShowPaginationAtHeader
          dataSource={campaignListData?.items}
          columns={columns}
          rowKey={(item: any) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default PromotionCampaignList;
