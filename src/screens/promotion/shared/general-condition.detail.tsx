import { Card, Col, Row } from "antd";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { PriceRule } from "model/promotion/price-rules.model";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import Countdown from "react-countdown";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import CustomerConditionDetail from "screens/promotion/shared/customer-condition.detail";
import { PromotionGift } from "model/promotion/gift.model";
import { SourceSearchQuery } from "model/request/source.request";
import { actionFetchListOrderSources } from "domain/actions/settings/order-sources.action";
import { ChannelResponse } from "model/response/product/channel.response";
import { getListChannelRequest } from "domain/actions/order/order.action";

interface Props {
  data: PriceRule | PromotionGift;
}

export default function GeneralConditionDetail(props: Props): ReactElement {
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
      name: "Từ",
      value: data?.starts_date && moment(data.starts_date).format(DATE_FORMAT.DDMMYY_HHmm),
      key: "1",
    },
    {
      name: "Đến",
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
      ids: data?.prerequisite_order_source_ids
    };
    dispatch(actionFetchListOrderSources(query, (sourceResponse: any) => {
      if (sourceResponse && sourceResponse.items) {
        setListSource(sourceResponse.items);
      }
    }));
  }, [data?.prerequisite_order_source_ids, dispatch]);

  return (
    <Col span={24} md={6}>
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
                <Col
                  span={5}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 4px 0 0",
                  }}
                >
                  <span style={{ color: "#666666" }}>{detail.name}</span>
                  <span style={{ fontWeight: 600 }}>:</span>
                </Col>
                <Col span={17} style={{ paddingLeft: 0 }}>
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
      {/* Cửa hàng áp dụng */}
      <Card className="card" title="Cửa hàng áp dụng">
        <Row>
          <Col span={24}>
            {Array.isArray(data.prerequisite_store_ids) &&
            data.prerequisite_store_ids.length > 0 ? (
              <>
                <p>{data?.prerequisite_store_ids.length} cửa hàng </p>
                <ul
                  style={{
                    padding: "0 16px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    width: "100%",
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
          </Col>
        </Row>
      </Card>
      {/* Kênh bán áp dụng */}
      <Card className="card" title="Kênh bán áp dụng">
        <Row>
          <Col span={24}>
            {Array.isArray(data?.prerequisite_sales_channel_names) &&
            data.prerequisite_sales_channel_names.length > 0 ? (
              <ul
                style={{
                  padding: "0 16px",
                }}
              >
                {listChannel &&
                  data.prerequisite_sales_channel_names.map((code) => (
                    <li key={code}>{listChannel.find(
                      (channel) => channel.code?.toUpperCase() === code?.toUpperCase())?.name}</li>
                  ))
                }
              </ul>
            ) : (
              "Áp dụng toàn bộ"
            )}
          </Col>
        </Row>
      </Card>
      {/* Nguồn đơn hàng áp dụng */}
      <Card className="card" title="Nguồn đơn hàng áp dụng">
        <Row>
          <Col span={24}>
            {Array.isArray(data?.prerequisite_order_source_ids) &&
            data?.prerequisite_order_source_ids.length > 0 ? (
              <ul
                style={{
                  padding: "0 16px",
                  maxHeight: "225px",
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
          </Col>
        </Row>
      </Card>
      {/* khách hàng áp dụng */}
      <CustomerConditionDetail {...data} />
    </Col>
  );
}
