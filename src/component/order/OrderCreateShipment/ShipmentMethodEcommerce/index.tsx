import { Badge, Button, Col, Collapse, Row, Typography } from "antd";
import { EcommerceDeliveryResponse, OrderResponse } from "model/response/order/order.response";
import {StyledComponent} from "component/order/OrderCreateShipment/ShipmentMethodEcommerce/styles";

import copyFileBtn from "assets/icon/copyfile_btn.svg";
import { showSuccess } from "utils/ToastUtils";
import { useEffect } from "react";
import { SHIPPING_TYPE } from "utils/Constants";
import NumberFormat from "react-number-format";

type PropType = {
  ecommerceShipment?: EcommerceDeliveryResponse | null;
	OrderDetail?: OrderResponse | null;
  handleCreateShipment?: () => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
  isLoading?: boolean;
};

const { Panel } = Collapse;
const { Link } = Typography;

function ShipmentMethodEcommerce(props: PropType) {
  const {
    ecommerceShipment,
    OrderDetail,
    handleCreateShipment,
    setShippingFeeInformedToCustomer,
    isLoading,
  } = props;

  useEffect(() => {
    setShippingFeeInformedToCustomer(ecommerceShipment?.shipping_fee_informed_to_customer || 0);
  }, [ecommerceShipment?.shipping_fee_informed_to_customer, setShippingFeeInformedToCustomer])

  // copy button
	const copyOrderID = (e: any, data: string | null) => {
		e.stopPropagation();
		e.target.style.width = "26px";
		const decWidth = setTimeout(() => {
			e.target.style.width = "23px";
		}, 100);
		clearTimeout(decWidth);
		navigator.clipboard.writeText(data ? data : "").then(() => { });
    showSuccess("Đã sao chép mã vận đơn!");
	};

  
  return (
    <StyledComponent>
      <div className="shipment">
        <div className="shipment-item">
          <span className="title">Đối tác giao hàng: </span>
          <span className="content">{ecommerceShipment?.delivery_service_provider_name || "--"}</span>
        </div>

        <div className="shipment-item">
          <span className="title">Phí ship trả đối tác: </span>
          <span className="content">
            {ecommerceShipment ? 
              <NumberFormat
                value={ecommerceShipment.shipping_fee_paid_to_three_pls || 0}
                displayType={"text"}
                thousandSeparator={true}
              /> 
              : 0
            }
          </span>
        </div>
      </div>

      <div className="shipment">
        <div className="shipment-item">
          <span className="title">Phí ship báo khách: </span>
          <span className="content">
            {ecommerceShipment ? 
              <NumberFormat
                value={ecommerceShipment.shipping_fee_informed_to_customer}
                displayType={"text"}
                thousandSeparator={true}
              /> 
              : 0
            }
          </span>
        </div>

        <div className="shipment-item">
          <span className="title">Loại đơn giao hàng: </span>
          <span className="content">{ecommerceShipment?.service === SHIPPING_TYPE.DELIVERY_4H ? "Đơn giao 4H" : "Đơn giao bình thường"}</span>
        </div>
      </div>

      <Row className="orders-timeline-custom orders-shipment-item">
        <Collapse ghost>
          <Panel
            header={
              <Row>
                <Col style={{ alignItems: "center" }}>
                  <b
                    style={{
                      marginRight: "10px",
                      color: "#222222",
                    }}
                  >
                    {OrderDetail?.items.reduce(
                      (a: any, b: any) => a + b.quantity,
                      0
                    )}{" "}
                    SẢN PHẨM
                  </b>
                </Col>
              </Row>
            }
            key="1"
          >
            {OrderDetail?.items.map((item, index) => (
              <div className="orders-shipment-item-view" key={index}>
                <div className="orders-shipment-item-view-wrap">
                  <div className="orders-shipment-item-name">
                    <div>
                      <Link style={{ color: "#2A2A86" }}>{item.sku}</Link>
                    </div>
                    <Badge
                      status="default"
                      text={item.variant}
                      style={{ marginLeft: 7 }}
                    />
                  </div>
                  <div
                    style={{
                      width: "30%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {item.type === "gift" ? (
                      <span>Quà tặng</span>
                    ) : (
                      <div></div>
                    )}
                    <span style={{ marginRight: 10 }}>
                      {item.quantity >= 10
                        ? item.quantity
                        : "0" + item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Panel>
        </Collapse>
      </Row>

      {ecommerceShipment?.tracking_code &&
        <div 
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center"
          }}
        >
          <div
            style={{
              marginRight: "10px",
              color: "#222222",
            }}
          >
            Mã vận đơn:
          </div>

          <div
            className="text-field"
            style={{
              color: "#2A2A86",
              fontWeight: 500,
              fontSize: 16,
            }}                >
            {ecommerceShipment.tracking_code}
          </div>

          <div
            style={{
              width: 30,
              padding: "0 4px",
              cursor: "pointer"
            }}
          >
            <img
              onClick={(e) =>
                copyOrderID(
                  e,
                  ecommerceShipment.tracking_code!
                )
              }
              src={copyFileBtn}
              alt=""
              style={{ width: 23 }}
            />
          </div>
        </div>
      }

      <div style={{marginTop: 20}}>
        <Button
          type="primary"
          className="create-button-custom"
          style={{float: "right"}}
          onClick={() => {
            handleCreateShipment && handleCreateShipment();
          }}
          loading={isLoading}
        >
          Tạo đơn giao hàng
        </Button>
      </div>
      
    </StyledComponent>
  );
}

export default ShipmentMethodEcommerce;
