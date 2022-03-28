import { Modal, Form, Row, Col, DatePicker, Checkbox, Button } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InventoryShipmentWrapper } from "./styles";
import moment from "moment";
import LogoDHL from "assets/img/LogoDHL.svg";
import LogoGHN from "assets/img/LogoGHN.svg";
import LogoGHTK from "assets/img/LogoGHTK.svg";
import LogoVTP from "assets/img/LogoVTP.svg";
import logoYody from "assets/img/logoYody.png";
import { FeesResponse } from "model/response/order/order.response";
import NumberFormat from "react-number-format";
import { InventoryTransferDetailItem, InventoryTransferShipmentRequest } from "model/inventory/transfer";
import { createInventoryTransferShipmentAction, getLogisticGateAwayAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { useDispatch } from "react-redux";
import { SumWeightLineItems } from "utils/AppUtils";

let initFormShipment: InventoryTransferShipmentRequest = {
  delivery_service_id: null,
  delivery_service_code: "",
  delivery_service_name: "",
  delivery_service_logo: "",
  order_code: "inventory-transfer",
  fulfillment_code: "",
  store_id: null,
  transport_type: "",
  transport_type_name: "",
  cod: null,
  weight: null,
  weight_unit: "",
  total_fee: null,
  note_to_shipper: "",
  shipping_requirement: "",
  who_paid: "",
  expected_delivery_time: "",
  office_time: null,
}

type InventoryShipmentProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (item: InventoryTransferDetailItem | null) => void;
  textStore?: string;
  serviceType?: string | null;
  levelOrder?: number;
  infoFees: FeesResponse[];
  dataTicket: InventoryTransferDetailItem | null;
};

export const deliveryService = {
    yody: {
      code: "yody",
      id: 1,
      logo: logoYody,
      name: "Tự giao hàng",
    },
    ghtk: {
      code: "ghtk",
      id: 2,
      logo: LogoGHTK,
      name: "Giao hàng tiết kiệm",
    },
    ghn: {
      code: "ghn",
      id: 3,
      logo: LogoGHN,
      name: "Giao hàng nhanh",
    },
    vtp: {
      code: "vtp",
      id: 4,
      logo: LogoVTP,
      name: "Viettel Post",
    },
    dhl: {
      code: "dhl",
      id: 5,
      logo: LogoDHL,
      name: "DHL",
    },
  };

const InventoryShipment: React.FC<InventoryShipmentProps> = (
  props: InventoryShipmentProps
) => {
  const {
    visible,
    onCancel,
    infoFees,
    levelOrder = 0,
    dataTicket,
    onOk,
  } = props;

  const [shipmentForm] = Form.useForm();
  const [hvc, setHvc] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<string>("");
  const [serviceCode, setServiceCode] = useState<string>("");
  const [serviceFeeTotal, setServiceFeeTotal] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isShowMessage, setIsShowMessage] = useState<boolean>(false);

  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState(serviceType);
  const dispatch = useDispatch();

  const serviceFee = useMemo(() => {
    return {
      yody: [{
        delivery_service_code: 'yody',
        total_fee: 0,
        insurance_fee: 0,
        transport_type: 'yody',
        transport_type_name: "Yody Express",
        note: null,
        delivery: true,
      }],
      ghtk: infoFees.filter((item) => item.delivery_service_code === "ghtk"),
      ghn: infoFees.filter((item) => item.delivery_service_code === "ghn"),
      vtp: infoFees.filter((item) => item.delivery_service_code === "vtp"),
      dhl: infoFees.filter((item) => item.delivery_service_code === "dhl"),
    };
  }, [infoFees]);

  const changeServiceType = (id: number, code: string, item: any, fee: number) => {

    setHvc(id);
    setServiceCode(code);
    setServiceType(item);
    setServiceFeeTotal(fee);
  };


  useEffect(() => {
    dispatch(getLogisticGateAwayAction((result) => {
      console.log('result', result);
    }))
  }, [dispatch])

  const onFinish = useCallback(
    (data) => {
      if (!hvc) {
        setIsShowMessage(true);
        return;
      }
      setLoading(true);
      if (dataTicket) {
        const deliveryTime = data.expected_delivery_time

        data.delivery_service_id = hvc;
        data.delivery_service_code = serviceCode;
        data.delivery_service_name = serviceType;
        data.delivery_service_logo = "";
        data.store_id = dataTicket?.from_store_id;
        data.transport_type = serviceType;
        data.transport_type_name = (deliveryService as any)[serviceCode].name;
        data.cod = 0;
        data.weight = SumWeightLineItems(dataTicket?.line_items);
        data.weight_unit = "g";
        data.total_fee = serviceFeeTotal;
        data.note_to_shipper = "";
        data.shipping_requirement = "";
        data.who_paid = "";
        data.expected_delivery_time = deliveryTime && deliveryTime.utc().format();
        data.office_time = officeTime;

        dispatch(createInventoryTransferShipmentAction(dataTicket.id, data, (result) => {
          setLoading(false);
          onOk(result);
        }));

      }
      else {
        console.log('dataTicket is null');
      }
    },
    [dataTicket, hvc, serviceCode, serviceType, serviceFeeTotal, officeTime, dispatch, onOk]
  );

  return (
    <Modal
      onCancel={onCancel}
      onOk={() => shipmentForm.submit()}
      visible={visible}
      centered
      footer={[
        <Button onClick={onCancel}>
          Hủy
        </Button>,
        <Button loading={loading} type="primary" onClick={() => shipmentForm.submit()}>
          Chọn hãng vận chuyển
        </Button>,
      ]}
      cancelText={"Hủy"}
      width={800}
    >
      <InventoryShipmentWrapper>
        <Row>
          <Col span={24}>
            <div className="header" key="1">
              <div>
                <h3>TR1000456897</h3>
              </div>
            </div>
          </Col>
        </Row>
        <Form
          layout="vertical"
          initialValues={initFormShipment}
          form={shipmentForm}
          scrollToFirstError
          onFinish={onFinish}
        >
          <Row className="shipment_date">
            <Col span={12}>
              <span className="orders-shipment__dateLabel">Hẹn giao:</span>
              <Form.Item
                name="expected_delivery_time"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày giao",
                  },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  className="r-5 w-100 ip-search"
                  placeholder="Chọn ngày giao"
                  disabledDate={(current: any) => moment().add(-1, "days") >= current}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="office_time">
                <Checkbox
                  style={{ marginTop: "8px" }}
                  checked={officeTime}
                  onChange={(e) => setOfficeTime(e.target.checked)}
                >
                  Giờ hành chính
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row>

          <div
            className="ant-table ant-table-bordered custom-table"
            style={{ marginTop: 20 }}
          >
            <div className="ant-table-container">
              <div className="ant-table-content">
                <table
                  className="table-bordered"
                  style={{ width: "100%", tableLayout: "auto" }}
                >
                  <thead className="ant-table-thead">
                    <tr>
                      <th className="ant-table-cell">Hãng vận chuyển</th>
                      <th className="ant-table-cell">Dịch vụ chuyển phát</th>
                      <th className="ant-table-cell" style={{ textAlign: "right" }}>
                        Cước phí
                      </th>
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {["yody", "ghtk", "ghn", "vtp", "dhl"].map(
                      (deliveryServiceName: string) => {
                        return (
                          ((serviceFee as any)[deliveryServiceName].length && (
                            <React.Fragment key={deliveryServiceName}>
                              <tr>
                                <td>
                                  <img
                                    className="logoHVC"
                                    src={(deliveryService as any)[deliveryServiceName].logo}
                                    alt=""
                                  />
                                </td>
                                <td style={{ padding: 0 }}>
                                  {(serviceFee as any)[deliveryServiceName].map(
                                    (service: any) => {
                                      return (
                                        <div
                                          style={{ padding: "8px 16px" }}
                                          className="custom-table__has-border-bottom custom-table__has-select-radio"
                                        >
                                          <label className="radio-container">
                                            <input
                                              type="radio"
                                              name="tt"
                                              className="radio-delivery"
                                              value={service.transport_type}
                                              checked={
                                                selectedShipmentMethod ===
                                                service.transport_type
                                              }
                                              onChange={() => {
                                                setSelectedShipmentMethod(
                                                  service.transport_type
                                                );
                                                setIsShowMessage(false);
                                                changeServiceType(
                                                  (deliveryService as any)[
                                                    deliveryServiceName
                                                  ].id,
                                                  deliveryServiceName,
                                                  service.transport_type,
                                                  service.total_fee
                                                );
                                              }}
                                              disabled={
                                                (service.transport_type !== 'yody' && service.total_fee === 0) || levelOrder > 3
                                              }
                                            />
                                            <span className="checkmark"/>
                                            {service.transport_type_name}
                                          </label>
                                        </div>
                                      );
                                    }
                                  )}
                                </td>
                                <td style={{ padding: 0, textAlign: "right" }}>
                                  {(serviceFee as any)[deliveryServiceName].map(
                                    (service: any) => {
                                      return (
                                        <>
                                          <div
                                            style={{ padding: "8px 16px" }}
                                            className="custom-table__has-border-bottom custom-table__has-select-radio"
                                          >
                                            {/* {service.total_fee} */}
                                            <NumberFormat
                                              value={service.total_fee}
                                              className="foo"
                                              displayType={"text"}
                                              thousandSeparator={true}
                                            />
                                          </div>
                                        </>
                                      );
                                    }
                                  )}
                                </td>
                              </tr>
                            </React.Fragment>
                          )) ||
                          null
                        );
                      }
                    )}
                  </tbody>
                </table>
                {isShowMessage && (
                  <div className="error-mess">Vui lòng chọn Hãng vận chuyển</div>
                )}
              </div>
            </div>
          </div>
          </Row>
        </Form>
      </InventoryShipmentWrapper>
    </Modal>
  );
};

export default InventoryShipment;
