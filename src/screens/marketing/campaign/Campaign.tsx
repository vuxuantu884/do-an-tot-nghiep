import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Button, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import ContentContainer from "component/container/content.container";
import queryString from "query-string";
import UrlConfig from "config/url.config";
import { showWarning } from "utils/ToastUtils";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import CampaignProvider from "screens/marketing/campaign/campaign-provider";
import { CampaignSearchQuery } from "model/marketing/marketing.model";
import { getCampaignListAction } from "domain/actions/marketing/marketing.action";
import { PageResponse } from "model/base/base-metadata.response";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import CampaignListFilter from "screens/marketing/campaign/component/CampaignListFilter";
import { MESSAGE_STATUS_LIST, CHANNEL_LIST, CAMPAIGN_STATUS_LIST } from "screens/marketing/campaign/campaign-helper";
import { CampaignStatusStyled, CampaignStyled } from "screens/marketing/campaign/campaign-styled";

import settingGearIcon from "assets/icon/setting-gear-icon.svg";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import useAuthorization from "hook/useAuthorization";
import { CAMPAIGN_PERMISSION } from "config/permissions/marketing.permission";
import TagStatus from "component/tag/tag-status";

// campaign permission
const viewCampaignDetailPermission = [CAMPAIGN_PERMISSION.marketings_campaigns_read_detail];
const createCampaignPermission = [CAMPAIGN_PERMISSION.marketings_campaigns_create];

const initQuery: CampaignSearchQuery = {
  page: 1,
  limit: 30,
  request: null,
  sender: null,
  statuses: [],
  channels: [],
  created_date_from: null,
  created_date_to: null,
  send_date_from: null,
  send_date_to: null,
};

const CampaignList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const queryParamsParsed: any = queryString.parse(location.search);

  // campaign permission
  const [allowViewCampaignDetail] = useAuthorization({
    acceptPermissions: viewCampaignDetailPermission,
    not: false,
  });
  const [allowCreateCampaign] = useAuthorization({
    acceptPermissions: createCampaignPermission,
    not: false,
  });

  // const campaignContext = useContext(CampaignContext);
  // const { data, setData } = campaignContext;

  const [params, setParams] = useState<CampaignSearchQuery>(initQuery);
  const [isLoading, setIsLoading] = useState(false);

  const [campaignData, setCampaignData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  /** get init public accounts */
  const [initPublicAccounts, setInitPublicAccounts] = useState<Array<AccountResponse>>([]);

  const updatePublicAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setInitPublicAccounts(data.items);
  };

  useEffect(() => {
    dispatch(searchAccountPublicAction({ limit: 30 }, updatePublicAccounts));
  }, [dispatch]);
  /** end get init public accounts */


  /** column table */
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã chiến dịch",
      width: "200px",
      render: (item: any) => {
        return (
          <>
            {allowViewCampaignDetail ?
              <Link to={`${UrlConfig.MARKETING}/campaigns/${item.id}`}>{item.code}</Link>
              : <span>{item.code}</span>
            }
          </>
        );
      },
    },
    {
      title: "Tên chiến dịch",
      // width: "250px",
      render: (item: any) => {
        return (
          <span>{item.campaign_name}</span>
        );
      },
    },
    {
      title: "Thời gian tạo",
      width: 150,
      align: "center",
      render: (item: any) => {
        return (
          <div>{ConvertUtcToLocalDate(item.created_date, DATE_FORMAT.DDMMYY_HHmm)}</div>
        );
      },
    },
    {
      title: "Trạng thái chiến dịch",
      align: "center",
      width: "200px",
      render: (item: any) => {
        const campaignStatus: any = CAMPAIGN_STATUS_LIST.find(
          (status) => status.value.toUpperCase() === item.status?.toUpperCase());
        return (
          <CampaignStatusStyled>
            <TagStatus type={campaignStatus?.tagStatus}>
              {campaignStatus?.name || item.status}
            </TagStatus>
          </CampaignStatusStyled>
        )
      },
    },
    {
      title: "Thời gian gửi",
      width: 150,
      align: "center",
      render: (item: any) => {
        return (
          <div>{ConvertUtcToLocalDate(item.send_date, DATE_FORMAT.DDMMYY_HHmm)}</div>
        );
      },
    },
    {
      title: "Người gửi",
      render: (item: any) => {
        return (
          <span>{item.sender}</span>
        );
      },
    },
    {
      title: "Trạng thái gửi tin",
      align: "center",
      width: "150px",
      render: (item: any) => {
        const messageStatus: any = MESSAGE_STATUS_LIST.find(
          (status) => status.value.toUpperCase() === item.message_status?.toUpperCase());
        return <div style={{ color: `${messageStatus?.color}` }}>{messageStatus?.name}</div>;
      },
    },
    {
      title: "Kênh gửi",
      align: "center",
      width: "150px",
      render: (item: any) => {
        const campaignChannel: any = CHANNEL_LIST.find(
          (status) => status.value.toUpperCase() === item.channel?.toUpperCase());
        return <div>{campaignChannel?.name}</div>;
      },
    },
  ];

  /** get campaign list */
  const updateCampaignListData = React.useCallback((responseData: PageResponse<any> | false) => {
    setIsLoading(false);
    if (responseData) {
      setCampaignData(responseData);
    }
  }, [setCampaignData]);

  const getCampaignList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      setIsLoading(true);
      dispatch(getCampaignListAction(params, updateCampaignListData));
    },
    [dispatch, updateCampaignListData],
  );

  useEffect(() => {
    const dataQuery: CampaignSearchQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      created_date_from: queryParamsParsed.created_date_from,
      created_date_to: queryParamsParsed.created_date_to,
      send_date_from: queryParamsParsed.send_date_from,
      send_date_to: queryParamsParsed.send_date_to,
    };
    setParams(dataQuery);
    getCampaignList(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      const queryParam = generateQuery(newParams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params],
  );
  /** --- */

  const handleConfig = () => {
    showWarning("Cấu hình gửi tin sau");
  };

  /** Handle campaign list filter */
  const onFilter = useCallback(
    (values: CampaignSearchQuery) => {
      const newParams = { ...params, ...values, page: 1 };
      const queryParam = generateQuery(newParams);
      const currentParam = generateQuery(params);
      if (currentParam === queryParam) {
        getCampaignList(newParams);
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, location.pathname, params],
  );

  const onClearAdvancedFilter = useCallback(() => {
    const queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, location.pathname]);
  /** --- */


  return (
    <CampaignStyled>
      <ContentContainer
        title={"Danh sách chiến dịch"}
        isLoading={isLoading}
        breadcrumb={[
          {
            name: "Khách hàng",
            path: UrlConfig.CUSTOMER,
          },
          {
            name: "Marketing",
          },
          {
            name: "Danh sách chiến dịch",
          },
        ]}
        extra={
          <div style={{ display: "flex" }}>
            <Button
              hidden={true} //tạm ẩn
              disabled={isLoading}
              size="large"
              style={{ marginRight: "16px" }}
              icon={<img src={settingGearIcon} style={{ marginRight: 8 }} alt="" />}
              onClick={handleConfig}
            >
              Cấu hình gửi tin
            </Button>

            {allowCreateCampaign &&
              <Link to={`${UrlConfig.MARKETING}/campaigns/create`}>
                <Button
                  disabled={isLoading}
                  type={"primary"}
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Thêm chiến dịch gửi tin
                </Button>
              </Link>
            }
          </div>
        }
      >
        <Card>
          <CampaignListFilter
            onClearFilter={onClearAdvancedFilter}
            onFilter={onFilter}
            isLoading={isLoading}
            params={params}
            initQuery={initQuery}
            initPublicAccounts={initPublicAccounts}
          />

          <CustomTable
            bordered
            isLoading={isLoading}
            sticky={{ offsetScroll: 5, offsetHeader: 55 }}
            pagination={{
              pageSize: campaignData?.metadata?.limit,
              total: campaignData?.metadata?.total,
              current: campaignData?.metadata?.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            isShowPaginationAtHeader
            dataSource={campaignData?.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </Card>
      </ContentContainer>
    </CampaignStyled>
  );
};

const Campaign = () => (
  <CampaignProvider>
    <CampaignList />
  </CampaignProvider>
);
export default Campaign;
