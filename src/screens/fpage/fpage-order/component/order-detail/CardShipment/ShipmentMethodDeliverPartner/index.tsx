import { Col, Row, Form, Table, Radio } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { OrderPaymentRequest } from "model/request/order.request";
import {
  // DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
  FeesResponse,
} from "model/response/order/order.response";
import React, { useMemo, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

import ImageGHTK from "assets/img/imageGHTK.svg";
import ImageGHN from "assets/img/imageGHN.png";
import ImageVTP from "assets/img/imageVTP.svg";
import ImageDHL from "assets/img/imageDHL.svg";
// import NumberFormat from "react-number-format";

type PropType = {
  amount: number | undefined;
  shippingFeeCustomer: number | null;
  discountValue: number | null | undefined;
  OrderDetail?: OrderResponse | null;
  payments?: OrderPaymentRequest[] | null;
  setShippingFeeInformedCustomer: (value: number | null) => void;
  // deliveryServices: DeliveryServiceResponse[] | null;
  infoFees: FeesResponse[];
  serviceType?: string | null;
  changeServiceType: (id: number, code: string, item: any, fee: number) => void;
  fulfillments: FulFillmentResponse[] | null | undefined;
  isCloneOrder?: boolean;
  addressError: string;
  levelOrder?: number;
  totalAmountReturnProducts?: number;
};
function ShipmentMethodDeliverPartner(props: PropType) {
  const {
    amount,
    shippingFeeCustomer,
    discountValue,
    OrderDetail,
    payments,
    setShippingFeeInformedCustomer,
    // deliveryServices,
    infoFees,
    serviceType,
    changeServiceType,
    // fulfillments,
    // isCloneOrder,
    addressError,
    levelOrder = 0,
    totalAmountReturnProducts,
  } = props;

  const [selectedShipmentMethod, setSelectedShipmentMethod] =
    useState(serviceType);

  const totalAmountPaid = () => {
    let total = 0;
    if (payments) {
      payments.forEach((p) => (total = total + p.amount));
    }
    return total;
  };

  const deliveryService: any = useMemo(() => {
    return {
      ghtk: {
        code: "ghtk",
        id: 1,
        logo: ImageGHTK,
        name: "Giao hàng tiết kiệm",
      },
      ghn: {
        code: "ghn",
        id: 2,
        logo: ImageGHN,
        name: "Giao hàng nhanh",
      },
      vtp: {
        code: "vtp",
        id: 3,
        logo: ImageVTP,
        name: "Viettel Post",
      },
      dhl: {
        code: "dhl",
        id: 4,
        logo: ImageDHL,
        name: "DHL",
      },
    };
  }, []);
  // const sercivesFee = useMemo(() => {
  //   return {
  //     ghtk: infoFees.filter((item) => item.delivery_service_code === "ghtk"),
  //     ghn: infoFees.filter((item) => item.delivery_service_code === "ghn"),
  //     vtp: infoFees.filter((item) => item.delivery_service_code === "vtp"),
  //     dhl: infoFees.filter((item) => item.delivery_service_code === "dhl"),
  //   };
  // }, [infoFees]);

  const handleMapService = useMemo(() => {
    let serviceArray = [];
    let obj: any = infoFees?.reduce((res: any, curr: any) => {
      if (res[curr.delivery_service_code])
        res[curr.delivery_service_code].push(curr);
      else Object.assign(res, { [curr.delivery_service_code]: [curr] });
      return res;
    }, []);
    for (let key in obj) {
      serviceArray.push({
        method: key,
        services: obj[key],
      });
    }
    return serviceArray;
  }, [infoFees]);

  const columns = [
    {
      title: "Hãng VC",
      dataIndex: "",
      key: "1",
      width: "20%",
      render: (l: any, v: any, i: any) => {
        return (
          <img
            src={deliveryService[v.method].logo}
            alt=""
            className="logoHVC"
          />
        );
      },
    },
    {
      title: "Dịch vụ chuyển phát",
      dataIndex: "",
      key: "2",width: "60%",
      render: (l: any, v: any, i: any) => {
        return (
          <div key={v.method}>
            <Radio.Group value={selectedShipmentMethod}>
              {v.services?.map((item: any) => (
                <Radio key={item.transport_type} value={item.transport_type} checked={
                  selectedShipmentMethod ===
                  item.transport_type
                }
                onChange={(e) => {
                  setSelectedShipmentMethod(
                    item.transport_type
                  );
                  changeServiceType(
                    deliveryService[v.method].id,
                    v.method,
                    item.transport_type,
                    item.total_fee
                  );
                }}
                disabled={item.total_fee === 0}>
                  {item.transport_type_name}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        );
      },
    },
    {
      title: "Cước phí",
      dataIndex: "",
      key: "3",width: "20%",
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            {v.services?.map((item: any) => (
              <div key={item.transport_type}>{formatCurrency(item.total_fee)}</div>
            ))}
          </div>
        );
      },
    },
  ];
  const totalAmountCustomerNeedToPaySelfDelivery = () => {
    return (
      (amount ? amount : 0) +
      (shippingFeeCustomer ? shippingFeeCustomer : 0) -
      (discountValue ? discountValue : 0) -
      (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) -
      totalAmountPaid() -
      (totalAmountReturnProducts ? totalAmountReturnProducts : 0)
    );
  };

  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner">
        {addressError && (
          <div style={{ margin: "10px 0", color: "#ff4d4f" }}>
            {addressError}
          </div>
        )}
        {levelOrder > 3 && (
          <div style={{ margin: "10px 0", color: "#ff4d4f" }}>
            Huỷ đơn giao để thực hiện các thay đổi giao hàng
          </div>
        )}
        <Row gutter={20}>
        <Col span={24}>
            <Form.Item label="Tiền thu hộ:">
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  totalAmountCustomerNeedToPaySelfDelivery() > 0
                    ? totalAmountCustomerNeedToPaySelfDelivery()
                    : 0
                }
                className="formInputAmount"
                maxLength={999999999999}
                minLength={0}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Phí ship báo khách:"
              name="shipping_fee_informed_to_customer"
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                className="formInputAmount"
                maxLength={15}
                minLength={0}
                onChange={setShippingFeeInformedCustomer}
              />
            </Form.Item>
          </Col>
        </Row>
        <Table
          style={{ padding: 0 }}
          dataSource={handleMapService}
          columns={columns}
          pagination={false}
          rowKey={(data: any) => data.method }
        />
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodDeliverPartner;
