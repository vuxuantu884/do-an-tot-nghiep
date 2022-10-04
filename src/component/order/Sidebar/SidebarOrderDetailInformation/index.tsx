import { Card, Col, Row } from "antd";
import { AppConfig } from "config/app.config";
import UrlConfig, { BASE_NAME_ROUTER, SAPO_URL, SHOPIFY_URL } from "config/url.config";
import { HandoverResponse } from "model/handover/handover.response";
import { OrderResponse } from "model/response/order/order.response";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { handleFetchApiError, isFetchApiSuccessful, isOrderFromPOS } from "utils/AppUtils";
import { YODY_APP, YODY_LANDING_PAGE, YODY_WEB } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  OrderDetail: OrderResponse | null;
  orderDetailHandover?: HandoverResponse[] | null;
};

function SidebarOrderDetailInformation(props: PropTypes) {
  const { OrderDetail, orderDetailHandover } = props;
  const [createdByName, setCreatedByName] = useState("");
  const dispatch = useDispatch();

  const renderSplitOrder = () => {
    let title: React.ReactNode = null;
    let value: React.ReactNode = null;
    const splitCharacter = "-";
    if (!OrderDetail?.linked_order_code) {
      return;
    }
    let result = OrderDetail.linked_order_code.split(splitCharacter);
    if (result.length > 1) {
      title = "Đơn tách";
      value = result.map((single, index) => {
        return (
          <React.Fragment key={index}>
            <Link target="_blank" to={`${UrlConfig.ORDER}/${single}`}>
              <strong>{single}</strong>
            </Link>
            {index < result.length - 1 && ", "}
          </React.Fragment>
        );
      });
    } else {
      title = "Đơn gốc tách đơn";
      value = (
        <Link target="_blank" to={`${UrlConfig.ORDER}/${OrderDetail.linked_order_code}`}>
          <strong>{OrderDetail.linked_order_code}</strong>
        </Link>
      );
    }
    return {
      title,
      value,
    };
  };

  const renderReturnedOrder = () => {
    let result = null;
    if (OrderDetail?.order_returns && OrderDetail?.order_returns?.length > 0) {
      const returnedArr = OrderDetail?.order_returns;
      result = returnedArr.map((single, index) => {
        return (
          <React.Fragment>
            <Link to={`${UrlConfig.ORDERS_RETURN}/${single.id}`}>{single.code}</Link>
            {index < returnedArr.length - 1 && ", "}
          </React.Fragment>
        );
      });
    }
    return result;
  };

  useEffect(() => {
    if (OrderDetail?.created_by) {
      searchAccountPublicApi({
        codes: OrderDetail?.created_by,
        limit: undefined,
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setCreatedByName(response.data.items[0].full_name);
          } else {
            handleFetchApiError(response, "Danh sách tài khoản", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }, [OrderDetail?.created_by, dispatch]);

  const getTitleEcommerce = (channelId: number | null) => {
    const titleEcommerce = {
      [YODY_WEB.channel_id]: "Website",
      [YODY_APP.channel_id]: "App",
      [YODY_LANDING_PAGE.channel_id]: "Landing page",
      default: "Gian hàng TMĐT",
    };
    return channelId ? titleEcommerce[channelId] || titleEcommerce.default : titleEcommerce.default;
  };

  const renderElementReference = (order?: OrderResponse | null) => {
    let link = "";

    if (order?.created_by && order?.created_by.toLocaleUpperCase() === "YD0WEB") {
      let environment = AppConfig.ENV;
      switch (environment) {
        case "DEV":
          link = `${SAPO_URL.TEST}/${order.reference_code}`;
          break;
        default:
          link = `${SAPO_URL.PRODUCTION}/${order.reference_code}`;
          break;
      }
    } else if (order?.created_by && order?.created_by.toLocaleUpperCase() === "YD0WEBUSA") {
      let environment = AppConfig.ENV;
      switch (environment) {
        case "DEV":
          link = `${SHOPIFY_URL.TEST}/${order.reference_code}`;
          break;
        default:
          link = `${SHOPIFY_URL.PRODUCTION}/${order.reference_code}`;
          break;
      }
    } else if (order?.url) {
      link = order?.url;
    } else {
      link = `${BASE_NAME_ROUTER}${UrlConfig.ORDER}/${order?.reference_code}`;
    }
    return (
      <React.Fragment>
        <a href={link} target="_blank" rel="noreferrer">
          {order?.reference_code}
        </a>
      </React.Fragment>
    );
  };

  const renderElementReferenceHandover = (goods_receipts?: GoodsReceiptsResponse[] | null) => {
    return (
      <React.Fragment>
        {goods_receipts?.map((p) => (
          <Link
            to={`${UrlConfig.DELIVERY_RECORDS}/${p.id}`}
            target="_blank"
            className="reference-good-receipt"
            key={p.id}
          >
            {p.id} - {p.receipt_type_name}
          </Link>
        ))}
      </React.Fragment>
    );
  };

  const renderOrderHandover = () => {
    let transferTitle: React.ReactNode = null;
    let transferValue: React.ReactNode = null;
    let returnTitle: React.ReactNode = null;
    let returnValue: React.ReactNode = null;
    if (orderDetailHandover && orderDetailHandover.length > 0) {
      const handovers = orderDetailHandover;
      const transferHandovers = handovers.filter((handover) => handover.type === "TRANSFER");
      const returnHandovers = handovers.filter((handover) => handover.type === "RETURN");
      const renderHandoverLink = (list: HandoverResponse[]) => {
        return list.map((single, index) => {
          return (
            <React.Fragment>
              <Link target="_blank" to={`${UrlConfig.HANDOVER}/${single.id}`}>
                {single.id}
              </Link>
              {index < list.length - 1 && ", "}
            </React.Fragment>
          );
        });
      };
      if (transferHandovers.length) {
        transferTitle = "Biên bản chuyển đi";
        transferValue = renderHandoverLink(transferHandovers);
      }
      if (returnHandovers.length > 0) {
        returnTitle = "Biên bản HVC hoàn về";
        returnValue = renderHandoverLink(returnHandovers);
      }
      return {
        transferTitle,
        transferValue,
        returnTitle,
        returnValue,
      };
    }
  };

  const detailArr = [
    {
      title: "Cửa hàng",
      value: (
        <Link
          target="_blank"
          to={`${UrlConfig.ORDER}?page=1&limit=30&store_ids=${OrderDetail?.store_id}`}
        >
          {OrderDetail?.store}
        </Link>
      ),
    },
    {
      title: "Mã đơn gốc",
      value: OrderDetail?.order_return_origin?.order_id ? (
        <Link
          to={`${UrlConfig.ORDER}/${OrderDetail?.order_return_origin?.order_id}`}
          target="_blank"
        >
          {OrderDetail?.order_return_origin?.order_code}
        </Link>
      ) : null,
    },
    {
      title: OrderDetail?.channel_id ? getTitleEcommerce(OrderDetail?.channel_id) : null,
      value: OrderDetail?.ecommerce_shop_name || null,
    },
    {
      title: "Điện thoại",
      value: (
        <a href={`tel:${OrderDetail?.store_phone_number}`}>
          <span>{OrderDetail?.store_phone_number}</span>
        </a>
      ),
    },
    {
      title: "Địa chỉ",
      value: OrderDetail?.store_full_address || "-",
    },
    {
      title: isOrderFromPOS(OrderDetail) ? "NV thu ngân" : null,
      value: isOrderFromPOS(OrderDetail) ? (
        <Link
          target="_blank"
          to={`${UrlConfig.ORDER}?page=1&limit=30&assignee_codes=${OrderDetail?.account_code}`}
        >
          {OrderDetail?.account_code} - {OrderDetail?.account}
        </Link>
      ) : null,
    },
    {
      title: isOrderFromPOS(OrderDetail) ? "NV tư vấn" : "NV bán hàng",
      value: (
        <Link
          target="_blank"
          to={`${UrlConfig.ORDER}?page=1&limit=30&assignee_codes=${OrderDetail?.assignee_code}`}
        >
          {OrderDetail?.assignee_code} - {OrderDetail?.assignee}
        </Link>
      ),
    },
    {
      title: "NV marketing",
      value: (
        <Link
          target="_blank"
          to={`${UrlConfig.ORDER}?page=1&limit=30&marketer_codes=${OrderDetail?.marketer_code}`}
        >
          {OrderDetail?.marketer_code} - {OrderDetail?.marketer}
        </Link>
      ),
    },
    {
      title: "NV điều phối",
      value: (
        <Link
          target="_blank"
          to={`${UrlConfig.ORDER}?page=1&limit=30&coordinator_codes=${OrderDetail?.coordinator_code}`}
        >
          {OrderDetail?.coordinator_code} - {OrderDetail?.coordinator}
        </Link>
      ),
    },
    {
      title: "Người tạo",
      value: (
        <Link
          target="_blank"
          to={`${UrlConfig.ORDER}?page=1&limit=30&created_by=${OrderDetail?.account_code}`}
        >
          {OrderDetail?.created_by} - {createdByName}
        </Link>
      ),
    },
    {
      title: "Tham chiếu",
      value:
        OrderDetail?.reference_code && OrderDetail?.reference_code.length > 0
          ? renderElementReference(OrderDetail)
          : null,
    },
    {
      title: "Lý do huỷ",
      value: OrderDetail?.reason_name
        ? OrderDetail?.sub_reason_name
          ? OrderDetail?.sub_reason_name
          : OrderDetail?.reason_name
        : null,
    },
    {
      title: "Mã đơn trả hàng",
      value:
        OrderDetail?.order_returns && OrderDetail?.order_returns?.length > 0
          ? renderReturnedOrder()
          : null,
    },
    {
      title: "Biên bản bàn giao",
      value:
        OrderDetail?.goods_receipts && OrderDetail?.goods_receipts.length > 0
          ? renderElementReferenceHandover(OrderDetail?.goods_receipts)
          : null,
    },
    {
      title: renderSplitOrder()?.title,
      value: renderSplitOrder()?.value,
    },
    {
      title: renderOrderHandover()?.transferTitle,
      value: renderOrderHandover()?.transferValue,
    },
    {
      title: renderOrderHandover()?.returnTitle,
      value: renderOrderHandover()?.returnValue,
    },
  ];

  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG" className="orderDetailSidebar">
        {detailArr.map((single, index) => {
          if (single.title && single.value) {
            return (
              <Row className="rowDetail" gutter={5} key={index}>
                <Col span={10}>{single.title}:</Col>
                <Col span={14} className="rowDetail__value">
                  {single.value}
                </Col>
              </Row>
            );
          }
          return null;
        })}
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderDetailInformation;
