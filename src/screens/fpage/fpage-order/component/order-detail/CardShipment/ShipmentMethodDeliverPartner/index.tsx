import { Col, Row, Form, Table, Radio } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { OrderPaymentRequest } from "model/request/order.request";
import {
  OrderResponse,
  FeesResponse,
} from "model/response/order/order.response";
import { useMemo, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";
import ImageGHTK from "assets/img/imageGHTK.svg";
import ImageGHN from "assets/img/imageGHN.png";
import ImageVTP from "assets/img/imageVTP.svg";
import ImageDHL from "assets/img/imageDHL.svg";

type PropType = {
  amount: number;
  shippingFeeCustomer: number | null;
  discountValue: number | null;
  OrderDetail?: OrderResponse | null;
  payments?: OrderPaymentRequest[];
  setShippingFeeInformedCustomer: (value: number | null) => void;
  // deliveryServices: DeliveryServiceResponse[] | null;
  infoFees: FeesResponse[];
  changeServiceType: (id: number, code: string, item: any, fee: number) => void;
  // fulfillments: FulFillmentResponse[];
  // isCloneOrder?: boolean;
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
    changeServiceType,
    // fulfillments,
    // isCloneOrder,
  } = props;

  // console.log("propsShipmentmethod", props);

  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState("");

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
      title: "Hãng vận chuyển",
      dataIndex: "",
      key: "1",
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
      key: "2",
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
      key: "3",
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

  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner">
        <Row gutter={20}>
          <Col span={24}>
            <Form.Item label="Tiền thu hộ:">
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  amount +
                  (shippingFeeCustomer ? shippingFeeCustomer : 0) -
                  (discountValue ? discountValue : 0) -
                  (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) -
                  totalAmountPaid()
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




// <div className="ant-table ant-table-bordered custom-table">
// <div className="ant-table-container">
//   <div className="ant-table-content">
//     <table
//       className="table-bordered"
//       style={{ width: "100%", tableLayout: "auto" }}
//     >
//       <thead className="ant-table-thead">
//         <tr>
//           <th className="ant-table-cell">Hãng vận chuyển</th>
//           <th className="ant-table-cell">Dịch vụ chuyển phát</th>
//           <th
//             className="ant-table-cell"
//             style={{ textAlign: "right" }}
//           >
//             Cước phí
//           </th>
//         </tr>
//       </thead>
//       <tbody className="ant-table-tbody">
//         {["ghtk", "ghn", "vtp", "dhl"].map(
//           (deliveryServiceName: string, index) => {
//             return (
//               ((sercivesFee as any)[deliveryServiceName].length && (
//                 <React.Fragment key={deliveryServiceName}>
//                   <tr>
//                     <td>
//                       <img
//                         className="logoHVC"
//                         src={
//                           (deliveryService as any)[
//                             deliveryServiceName
//                           ].logo
//                         }
//                         alt=""
//                       />
//                     </td>
//                     <td style={{ padding: 0 }}>
//                       {(sercivesFee as any)[deliveryServiceName].map(
//                         (service: any, index: any) => {
//                           return (
//                             <div
//                               key={index}
//                               style={{ padding: "8px 16px" }}
//                               className="custom-table__has-border-bottom custom-table__has-select-radio"
//                             >
//                               <label className="radio-container">
//                                 <input
//                                   type="radio"
//                                   name="tt"
//                                   className="radio-delivery"
//                                   value={service.transport_type}
//                                   checked={
//                                     selectedShipmentMethod ===
//                                     service.transport_type
//                                   }
//                                   onChange={(e) => {
//                                     setSelectedShipmentMethod(
//                                       service.transport_type
//                                     );
//                                     changeServiceType(
//                                       (deliveryService as any)[
//                                         deliveryServiceName
//                                       ].id,
//                                       deliveryServiceName,
//                                       service.transport_type,
//                                       service.total_fee
//                                     );
//                                   }}
//                                   disabled={service.total_fee === 0}
//                                 />
//                                 <span className="checkmark"></span>
//                                 {service.transport_type_name}
//                               </label>
//                             </div>
//                           );
//                         }
//                       )}
//                     </td>
//                     <td style={{ padding: 0, textAlign: "right" }}>
//                       {(sercivesFee as any)[deliveryServiceName].map(
//                         (service: any, index: any) => {
//                           return (
//                             <div
//                               key={index}
//                               style={{ padding: "8px 16px" }}
//                               className="custom-table__has-border-bottom custom-table__has-select-radio"
//                             >
//                               {formatCurrency(service.total_fee)}
//                             </div>
//                           );
//                         }
//                       )}
//                     </td>
//                   </tr>
//                 </React.Fragment>
//               )) ||
//               null
//             );
//           }
//         )}
//       </tbody>
//     </table>
//   </div>
// </div>
// </div>