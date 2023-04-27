import { Card } from "antd";
import moment from "moment";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";import { PromotionCampaignLogsResponse, PromotionCampaignResponse } from "model/promotion/campaign.model";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  getPromotionCampaignLogsDetailAction,
} from "domain/actions/promotion/campaign/campaign.action";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import { PromotionCampaignLogsDetailStyled } from "screens/promotion/campaign/campaign.style";

interface Props {
  promotionCampaignDetail?: PromotionCampaignResponse;
}

export default function PromotionCampaignLogsDetail(props: Props): ReactElement {
  const { promotionCampaignDetail } = props;
  const dispatch = useDispatch();
  const [promotionCampaignLogsList, setPromotionCampaignLogsList] = useState<Array<PromotionCampaignLogsResponse>>([]);

  const getPromotionCampaignLogsDetailCallback = useCallback((response: Array<PromotionCampaignLogsResponse>) => {
    dispatch(hideLoading());
    if (response) {
      setPromotionCampaignLogsList(response);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!promotionCampaignDetail?.id) {
      return;
    }
    dispatch(showLoading());
    dispatch(getPromotionCampaignLogsDetailAction(promotionCampaignDetail.id, getPromotionCampaignLogsDetailCallback));
  }, [dispatch, getPromotionCampaignLogsDetailCallback, promotionCampaignDetail]);

  return (
    <PromotionCampaignLogsDetailStyled>
      <Card className="card" title="Lịch sử thao tác">
        <ul className={"log-container"}>
          {promotionCampaignLogsList?.map((log: PromotionCampaignLogsResponse, index: number) => (
            <li key={index}>
              <div className={"log-item"}>
                <Link className={"user-name"} target="_blank" to={`${UrlConfig.ACCOUNTS}/${log?.account_code}`}>
                  {log.account_name}
                </Link>
                <span
                  style={{
                    wordWrap: "break-word",
                    color: "#8C8C8C"
                  }}
                  className={"event-date"}
                >
                  {log?.event_date ? moment(log.event_date).format(DATE_FORMAT.DDMMYY_HHmm) : "---"}
                </span>
              </div>
              <div className={"event-name"}>
                {log?.event_name || "---"}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </PromotionCampaignLogsDetailStyled>
  );
}
