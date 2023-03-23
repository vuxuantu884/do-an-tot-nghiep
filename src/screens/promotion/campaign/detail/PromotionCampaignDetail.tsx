import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import { PROMOTION_CAMPAIGN_PERMISSIONS } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { Link, useHistory } from "react-router-dom";
import BottomBarContainer from "component/container/bottom-bar.container";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { DISCOUNT_STATUS } from "screens/promotion/constants";
import { getPromotionCampaignDetailAction } from "domain/actions/promotion/campaign/campaign.action";
import { PromotionCampaignResponse } from "model/promotion/campaign.model";
import PromotionSelectedList from "screens/promotion/campaign/components/PromotionSelectedList";
import PromotionCampaignProvider,
  { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";

const PromotionCampaignDetail: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const idNumber = parseInt(id);

  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    setPromotionSelectedList,
  } = promotionCampaignContext;

  const [error, setError] = useState(false);
  const [promotionCampaignDetail, setPromotionCampaignDetail] = useState<PromotionCampaignResponse>();
  const [promotionCampaignDescriptionList, setPromotionCampaignDescriptionList] = useState<Array<string>>([]);

  /** phân quyền */
  const [allowUpdatePromotionCampaign] = useAuthorization({
    acceptPermissions: [PROMOTION_CAMPAIGN_PERMISSIONS.UPDATE],
  });
  /** */

  /** handle get promotion campaign detail */
  const handleSetContextData = useCallback(
    (data: PromotionCampaignResponse) => {
      setPromotionSelectedList(data.price_rules);
    },
    [setPromotionSelectedList],
  );
  const getPromotionCampaignDetailCallback = useCallback((response: PromotionCampaignResponse | false) => {
    dispatch(hideLoading());
    if (!response) {
      setError(true);
    } else {
      setPromotionCampaignDetail(response);
      if (response.description) {
        const descriptionList = response.description.split('\n');
        setPromotionCampaignDescriptionList(descriptionList);
      }
      handleSetContextData(response);
    }
  }, [dispatch, handleSetContextData]);

  useEffect(() => {
    dispatch(showLoading());
    dispatch(getPromotionCampaignDetailAction(idNumber, getPromotionCampaignDetailCallback));
  }, [dispatch, getPromotionCampaignDetailCallback, idNumber]);
  /** end handle get promotion campaign detail */

  const RenderStatus = (data: PromotionCampaignResponse) => {
    const status = DISCOUNT_STATUS.find((status) => status.code === data.state);
    return <span style={{ marginLeft: "20px" }}>{status?.Component}</span>;
  };

  return (
    <ContentContainer
      isError={error}
      title={promotionCampaignDetail ? promotionCampaignDetail.name : "Chi tiết chương trình khuyến mại"}
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
        {
          name: "Chi tiết chương trình KM",
        },
      ]}
    >
      {promotionCampaignDetail && (
        <div>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>THÔNG TIN CHƯƠNG TRÌNH KHUYẾN MẠI</span>
                {RenderStatus(promotionCampaignDetail)}
              </div>
            }
          >
            <div>
              <span>
                <span style={{ fontWeight: "500" }}>Tên chương trình khuyến mại</span>
                <span style={{ color: "red" }}> *</span>
                <span> :</span>
              </span>
              <span style={{ marginLeft: "8px" }}>{promotionCampaignDetail.name}</span>
            </div>
            <div style={{ marginTop: "8px" }}>
              <span style={{ fontWeight: "500" }}>Mô tả chương trình KM:</span>
              {promotionCampaignDescriptionList?.length > 0 &&
                promotionCampaignDescriptionList.map((description, index) => {
                  return <div style={{ marginLeft: "8px" }} key={index}>{description}</div>
                })
              }
            </div>
          </Card>

          <PromotionSelectedList />

          <BottomBarContainer
            back="Quay lại danh sách chương trình KM"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`)}
            rightComponent={
              <>
                {allowUpdatePromotionCampaign && (
                  <Link to={`${idNumber}/update`}>
                    <Button type="primary">Chỉnh sửa</Button>
                  </Link>
                )}
              </>
            }
          />
        </div>
      )}
    </ContentContainer>
  );
};

const PromotionCampaignDetailWithProvider = () => (
  <PromotionCampaignProvider>
    <PromotionCampaignDetail />
  </PromotionCampaignProvider>
);
export default PromotionCampaignDetailWithProvider;