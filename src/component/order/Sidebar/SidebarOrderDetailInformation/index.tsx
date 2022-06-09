import {Card, Col, Row} from "antd";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import {OrderResponse} from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {Link} from "react-router-dom";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { handleFetchApiError, isFetchApiSuccessful, isOrderFromPOS } from "utils/AppUtils";
import { YODY_APP, YODY_LANDING_PAGE, YODY_WEB } from "utils/Constants";
import {StyledComponent} from "./styles";

type PropTypes = {
  OrderDetail: OrderResponse | null;
};

function SidebarOrderDetailInformation(props: PropTypes) {
  const {OrderDetail} = props;
  const [createdByName, setCreatedByName] = useState("")
  const dispatch = useDispatch()
  const renderSplitOrder = () => {
    const splitCharacter = "-";
    if (!OrderDetail?.linked_order_code) {
      return;
    }
    let result = OrderDetail.linked_order_code.split(splitCharacter);
    if (result.length > 1) {
      return (
        <Row gutter={5}>
          <Col span={10}>Đơn tách:</Col>
          <Col span={14}>
            {result.map((single, index) => {
              return (
                <React.Fragment>
                  <Link target="_blank" to={`${UrlConfig.ORDER}/${single}`}>
                    <strong>{single}</strong>
                  </Link>
                  {index < result.length - 1 && ", "}
                </React.Fragment>
              );
            })}
          </Col>
        </Row>
      );
    } else {
      return (
        <Row gutter={5}>
          <Col span={10}>Đơn gốc tách đơn:</Col>
          <Col span={14}>
            <Link
              target="_blank"
              to={`${UrlConfig.ORDER}/${OrderDetail.linked_order_code}`}
            >
              <strong>{OrderDetail.linked_order_code}</strong>
            </Link>
          </Col>
        </Row>
      );
    }
  };
  const renderReturnedOrder = () => {
    let result = null;
    if(OrderDetail?.order_returns && OrderDetail?.order_returns?.length > 0) {
      const returnedArr = OrderDetail?.order_returns;
      result = returnedArr.map((single, index) => {
        return(
          <React.Fragment>
            <Link to={`${UrlConfig.ORDERS_RETURN}/${single.id}`}>
              {single.code}
            </Link>
            {index < returnedArr.length - 1 && ", "}
          </React.Fragment>
        )
      })
    }
    return result;
  };

  useEffect(() => {
    if(OrderDetail?.created_by) {
      searchAccountPublicApi({
        codes: OrderDetail?.created_by,
        limit: undefined,
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setCreatedByName(response.data.items[0].full_name);
          } else {
            handleFetchApiError(response, "Danh sách tài khoản", dispatch)
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
    }
  }, [OrderDetail?.created_by, dispatch])

  const getTitleEcommerce= (channelId:number|null)=>{
    let title= "";

    if(channelId === YODY_WEB.channel_id){
      title= "Website:";
    }else if(channelId === YODY_APP.channel_id){
      title="App:";
    }else if(channelId===YODY_LANDING_PAGE.channel_id){
      title="Landing page:"
    }else{
      title="Gian hàng TMĐT:";
    }
    return (
      <Col span={10}>{title}</Col>
    )
  };

  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG">
        <Row className="" gutter={5}>
          <Col span={10}>Cửa hàng:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#2A2A86"}} className="text-focus">
              <Link target="_blank" to={`${UrlConfig.ORDER}?page=1&limit=30&store_ids=${OrderDetail?.store_id}`}>
                {OrderDetail?.store}
              </Link>
            </span>
          </Col>
        </Row>
				{OrderDetail?.order_return_origin?.order_id && (
					<Row className="rowDetail" gutter={5}>
						<Col span={10}>Mã đơn gốc:</Col>
						<Col span={14}>
							<span style={{fontWeight: 500, color: "#2A2A86"}} className="text-focus">
								{OrderDetail?.order_return_origin?.order_id ? (
									<Link to={`${UrlConfig.ORDER}/${OrderDetail?.order_return_origin?.order_id}`} target="_blank">
										{OrderDetail?.order_return_origin?.order_code}
									</Link>
								) : (
									"-"
								)}
							</span>
						</Col>
					</Row>
				)}
        {OrderDetail?.ecommerce_shop_name && (
          <Row gutter={5}>
            {/* <Col span={10}>Gian hàng TMĐT:</Col> */}
            {getTitleEcommerce(OrderDetail?.channel_id)}
            <Col span={14}>
              <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
                {OrderDetail?.ecommerce_shop_name}
              </span>
            </Col>
          </Row>
        )}
        <Row gutter={5}>
          <Col span={10}>Điện thoại:</Col>
          <Col span={14}>
						<a href={`tel:${OrderDetail?.store_phone_number}`} style={{fontWeight: 500}}>
							<span >
								{OrderDetail?.store_phone_number}
							</span>
						</a>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Địa chỉ:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}}>
              {OrderDetail?.store_full_address}
            </span>
          </Col>
        </Row>
        {isOrderFromPOS(OrderDetail) ? (
          <Row gutter={5}>
            <Col span={10}>NV thu ngân:</Col>
            <Col span={14}>
              <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
                <Link
                  target="_blank"
                  to={`${UrlConfig.ORDER}?page=1&limit=30&assignee_codes=${OrderDetail?.account_code}`}
                >
                  {OrderDetail?.account_code} - {OrderDetail?.account}
                </Link>
              </span>
            </Col>
          </Row>
        ) : null}
        <Row gutter={5}>
          <Col span={10}>{isOrderFromPOS(OrderDetail) ? "NV tư vấn:" : "NV bán hàng:"}</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
								to={`${UrlConfig.ORDER}?page=1&limit=30&assignee_codes=${OrderDetail?.assignee_code}`}
              >
                {OrderDetail?.assignee_code} - {OrderDetail?.assignee}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>NV marketing:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
								to={`${UrlConfig.ORDER}?page=1&limit=30&marketer_codes=${OrderDetail?.marketer_code}`}
              >
                {OrderDetail?.marketer_code} - {OrderDetail?.marketer}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>NV điều phối:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
								to={`${UrlConfig.ORDER}?page=1&limit=30&coordinator_codes=${OrderDetail?.coordinator_code}`}
              >
                {OrderDetail?.coordinator_code} - {OrderDetail?.coordinator}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Người tạo:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
								to={`${UrlConfig.ORDER}?page=1&limit=30&created_by=${OrderDetail?.account_code}`}
              >
                {OrderDetail?.created_by} - {createdByName}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Tham chiếu:</Col>
          <Col span={14} style={{wordWrap: "break-word"}}>
            {OrderDetail?.url ? (
              <a href={OrderDetail?.url} target="_blank" rel="noreferrer">{OrderDetail?.reference_code}</a>
            ) : (
              <a href={`${BASE_NAME_ROUTER}${UrlConfig.ORDER}/${OrderDetail?.reference_code}`} target="_blank" rel="noreferrer">{OrderDetail?.reference_code}</a>
              // <span className="text-focus">{OrderDetail?.reference_code} ss</span>
            )}
          </Col>
        </Row>
        {OrderDetail?.reason_name && (
          <Row gutter={5}>
            <Col span={10}>Lý do huỷ:</Col>
            <Col span={14}>
              <span style={{fontWeight: 500, color: "rgb(226, 67, 67)"}} className="text-focus">
                {OrderDetail?.sub_reason_name ? OrderDetail?.sub_reason_name : OrderDetail?.reason_name}
              </span>
            </Col>
          </Row>
        )}
        {OrderDetail?.order_returns && OrderDetail?.order_returns?.length > 0 && (
          <Row gutter={5}>
            <Col span={10}>Mã đơn trả hàng:</Col>
            <Col span={14}>
              <span style={{fontWeight: 500, color: "rgb(226, 67, 67)"}} className="text-focus">
                {renderReturnedOrder()}
              </span>
            </Col>
          </Row>
        )}
        {renderSplitOrder()}
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderDetailInformation;
