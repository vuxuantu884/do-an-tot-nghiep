import { Card, Col, Row } from "antd";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import Countdown from "react-countdown";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import { SourceSearchQuery } from "model/request/source.request";
import { actionFetchListOrderSources } from "domain/actions/settings/order-sources.action";
import { ChannelResponse } from "model/response/product/channel.response";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { PromotionCampaignResponse } from "../../../../model/promotion/campaign.model";
import CustomerConditionDetail from "screens/promotion/campaign/detail/CustomerConditionDetail";

interface Props {
  data: PromotionCampaignResponse;
}

export default function PromotionCampaignConditionDetail(props: Props): ReactElement {
  const { data } = props;
  const dispatch = useDispatch();
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);
  const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
      // Render a complete state
      return <span>Kết thúc chương trình</span>;
    } else {
      // Render a countdown
      return (
        <span style={{ color: "#FCAF17", fontWeight: 500 }}>
          {days > 0 ? `${days} Ngày` : ""} {hours}:{minutes}
        </span>
      );
    }
  };

  const timeApply = [
    {
      name: "Bắt đầu",
      value: data?.starts_date && moment(data.starts_date).format(DATE_FORMAT.DDMMYY_HHmm),
      key: "1",
    },
    {
      name: "Kết thúc",
      value: data?.ends_date && moment(data.ends_date).format(DATE_FORMAT.DDMMYY_HHmm),
      key: "2",
    },
    {
      name: "Còn",
      value: data?.ends_date ? (
        <Countdown
          zeroPadTime={2}
          zeroPadDays={2}
          date={moment(data?.ends_date).toDate()}
          renderer={renderer}
        />
      ) : (
        "---"
      ),
      key: "3",
    },
  ];

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch]);

  useEffect(() => {
    const query: SourceSearchQuery = {
      limit: data?.prerequisite_order_source_ids?.length || 10000,
      ids: data?.prerequisite_order_source_ids,
    };
    dispatch(
      actionFetchListOrderSources(query, (sourceResponse: any) => {
        if (sourceResponse && sourceResponse.items) {
          setListSource(sourceResponse.items);
        }
      }),
    );
  }, [data?.prerequisite_order_source_ids, dispatch]);

  return (
    <div>
      {/* Thời gian áp dụng */}
      <Card className="card" title="Thời gian áp dụng">
        <Row>
          {timeApply &&
            timeApply.map((detail: any, index: number) => (
              <Col
                key={index}
                span={24}
                style={{
                  display: "flex",
                  marginBottom: 10,
                  color: "#222222",
                }}
              >
                <Col span={6}>
                  <span style={{ color: "#000000" }}>{detail.name}:</span>
                </Col>
                <Col span={16} style={{ marginLeft: "10px" }}>
                  <span
                    style={{
                      wordWrap: "break-word",
                      fontWeight: 500,
                    }}
                  >
                    {detail.value ? detail.value : "---"}
                  </span>
                </Col>
              </Col>
            ))}
        </Row>
      </Card>

      {/* Phạm vi áp dụng */}
      <Card className="card" title="Phạm vi áp dụng">
        <div className="condition-item">
          <div className={"title"}>Kênh áp dụng:</div>
          {Array.isArray(data?.prerequisite_sales_channel_names) &&
          data.prerequisite_sales_channel_names.length > 0 ? (
            <ul
              style={{
                padding: "0 16px",
                maxHeight: "220px",
                overflow: "auto",
              }}
            >
              {listChannel &&
                data.prerequisite_sales_channel_names.map((code) => (
                  <li key={code}>
                    {
                      listChannel.find(
                        (channel) => channel.code?.toUpperCase() === code?.toUpperCase(),
                      )?.name
                    }
                  </li>
                ))}
            </ul>
          ) : (
            "Áp dụng toàn bộ"
          )}
        </div>

        <div className="condition-item">
          <div className={"title"}>Nguồn đơn hàng áp dụng:</div>
          {Array.isArray(data?.prerequisite_order_source_ids) &&
          data?.prerequisite_order_source_ids.length > 0 ? (
            <ul
              style={{
                padding: "0 16px",
                maxHeight: "220px",
                overflow: "auto",
              }}
            >
              {listSource &&
                data.prerequisite_order_source_ids.map((id) => (
                  <li key={id}>{listSource.find((source) => source.id === id)?.name}</li>
                ))}
            </ul>
          ) : (
            "Áp dụng toàn bộ"
          )}
        </div>

        <div className="condition-item">
          <div className={"title"}>Cửa hàng áp dụng:</div>
          {Array.isArray(data.prerequisite_store_ids) && data.prerequisite_store_ids.length > 0 ? (
            <>
              <span>{data.prerequisite_store_ids.length} cửa hàng </span>
              <ul
                style={{
                  padding: "0 16px",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {listStore &&
                  data.prerequisite_store_ids.map((id) => (
                    <li key={id}>{listStore.find((store) => store.id === id)?.name}</li>
                  ))}
              </ul>
            </>
          ) : (
            "Áp dụng toàn bộ"
          )}
        </div>

        {/* khách hàng áp dụng */}
        <div className="condition-item">
          <div className={"title"}>Khách hàng áp dụng:</div>
          <CustomerConditionDetail {...data} />
        </div>
      </Card>
    </div>
  );
}
