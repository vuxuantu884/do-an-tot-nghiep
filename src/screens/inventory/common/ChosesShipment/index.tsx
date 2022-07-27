import { Button, Checkbox, Col, DatePicker, Form, Input, Modal, Radio, Row, Tabs } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InventoryShipmentWrapper } from "./styles";
import "./styles.scss";
import moment from "moment";
import LogoDHL from "assets/img/LogoDHL.svg";
import LogoGHN from "assets/img/LogoGHN.svg";
import LogoGHTK from "assets/img/LogoGHTK.svg";
import LogoVTP from "assets/img/LogoVTP.svg";
import logoYody from "assets/img/logoYody.png";
import { FeesResponse } from "model/response/order/order.response";
import NumberFormat from "react-number-format";
import { InventoryTransferDetailItem, InventoryTransferShipmentRequest } from "model/inventory/transfer";
import { createInventoryTransferShipmentAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { useDispatch } from "react-redux";
import { ShipmentMethodOption } from "utils/Constants";
import DeliverPartnerOutline from "component/icon/DeliverPartnerOutline";
import SelfDeliverOutline from "component/icon/SelfDeliverOutline";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";

const { TabPane } = Tabs;

type InventoryShipmentProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (item: InventoryTransferDetailItem | null) => void;
  textStore?: string;
  serviceType?: string | null;
  levelOrder?: number;
  infoFees?: FeesResponse[];
  dataTicket?: InventoryTransferDetailItem | null;
};

export const deliveryServiceTypeOptions = [
  {
    value: "employee",
    name: "Nhân viên YODY",
  },
  {
    value: "external_shipper",
    name: "Đối tác khác",
  },
];

export const deliveryServiceType = {
  EMPLOYEE: "employee",
  EXTERNAL_SHIPPER: "external_shipper",
};

let initFormShipment: InventoryTransferShipmentRequest = {
  delivery_service_provider_id: null,
  delivery_service_provider_code: "",
  delivery_service_provider_name: "",
  delivery_service_provider_type: "",
  shipping_fee_paid_to_three_pls: null,
  expected_received_date: "",
  delivery_transport_type: deliveryServiceType.EMPLOYEE,
  office_time: null,
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
  const [deliveryServiceTypeState, setDeliveryServiceTypeState] = useState<string>(deliveryServiceType.EMPLOYEE);
  const [serviceCode, setServiceCode] = useState<string>("");
  const [serviceFeeTotal, setServiceFeeTotal] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isShowMessage, setIsShowMessage] = useState<boolean>(false);
  const [shipmentMethod, setShipmentMethod] = useState<number>(ShipmentMethodOption.DELIVER_PARTNER);

  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState(serviceType);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!dataTicket) {
      setShipmentMethod(ShipmentMethodOption.SELF_DELIVER);
      shipmentForm.setFieldsValue({
        delivery_service_provider_type: 'employee'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTicket])

  const serviceFee = useMemo(() => {
    return {
      ghtk: infoFees?.filter((item) => item.delivery_service_code === "ghtk"),
      ghn: infoFees?.filter((item) => item.delivery_service_code === "ghn"),
      vtp: infoFees?.filter((item) => item.delivery_service_code === "vtp"),
      dhl: infoFees?.filter((item) => item.delivery_service_code === "dhl"),
    };
  }, [infoFees]);

  const changeServiceType = (id: number, code: string, item: any, fee: number) => {
    setHvc(id);
    setServiceCode(code);
    setServiceType(item);
    setServiceFeeTotal(fee);
  };

  const onFinish = useCallback(
    (data) => {
      if (!hvc && shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER) {
        setIsShowMessage(true);
        return;
      }
      setLoading(true);
      const deliveryTime = data.expected_delivery_time;

      if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER && deliveryServiceTypeState === deliveryServiceType.EMPLOYEE) {
        data.shipper_code = JSON.parse(data.shipper).code;
        data.shipper_name = JSON.parse(data.shipper).name;
        data.shipper_phone = JSON.parse(data.shipper).phone;
      }

      data.delivery_service_provider_id = hvc;
      data.delivery_service_provider_code = serviceCode;
      data.delivery_service_provider_name = serviceType;
      data.delivery_transport_type = serviceType;
      data.shipping_fee_paid_to_three_pls = shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER ? serviceFeeTotal : data.shipping_fee_paid_to_three_pls;
      data.delivery_service_provider_type = shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER ? "external_service" : data.delivery_service_provider_type;
      data.expected_received_date = deliveryTime && deliveryTime.utc().format();
      data.office_time = officeTime;
      const newData = { ...data };

      delete newData.shipper;

      if (dataTicket) {
        dispatch(createInventoryTransferShipmentAction(dataTicket.id, newData, (result) => {
          setLoading(false);
          onOk(result);
        }));
      } else {
        onOk(newData);
      }
    },
    [hvc, shipmentMethod, dataTicket, deliveryServiceTypeState, serviceCode, serviceType, serviceFeeTotal, officeTime, dispatch, onOk],
  );

  const renderDateForm = () => {
    return (
      <Row className="shipment_date">
        <Col span={24} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }} className="mr-15 margin-top-20">
            <div className="mr-15">Hẹn giao:</div>
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
            <Form.Item name="office_time" style={{ marginLeft: 20 }}>
              <Checkbox
                checked={officeTime}
                onChange={(e) => setOfficeTime(e.target.checked)}
              >
                Giờ hành chính
              </Checkbox>
            </Form.Item>
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <Modal
      className="modal-select-shipment"
      title="Chọn hãng vận chuyển"
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
        <Form
          layout="vertical"
          initialValues={initFormShipment}
          form={shipmentForm}
          scrollToFirstError
          onFinish={onFinish}
        >
          <div
            className="saleorder_shipment_method_content"
          >
            <Tabs defaultActiveKey={String(ShipmentMethodOption.DELIVER_PARTNER)} onChange={(key) => {
              setShipmentMethod(Number(key));
              shipmentForm.setFieldsValue({
                shipper_name: null,
                shipper_phone: null,
                note_to_shipper: null,
                shipping_fee_paid_to_three_pls: null,
                delivery_service_provider_type: 'employee'
              });
              setSelectedShipmentMethod('');
              setServiceCode('');
              setServiceType('');
              setHvc(null);
            }}>
              {dataTicket && (
                <TabPane tab={<div><DeliverPartnerOutline />Chuyển hãng vận chuyển</div>}
                         key={ShipmentMethodOption.DELIVER_PARTNER}>
                  {renderDateForm()}

                  {/*--- Chuyển hãng vận chuyển ----*/}
                  {shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && (
                    <>
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
                              {["ghtk", "ghn", "vtp", "dhl"].map(
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
                                                            service.transport_type,
                                                          );
                                                          setIsShowMessage(false);
                                                          changeServiceType(
                                                            (deliveryService as any)[
                                                              deliveryServiceName
                                                              ].id,
                                                            deliveryServiceName,
                                                            service.transport_type,
                                                            service.total_fee,
                                                          );
                                                        }}
                                                        disabled={
                                                          (service.transport_type !== "yody" && service.total_fee === 0) || levelOrder > 3
                                                        }
                                                      />
                                                      <span className="checkmark" />
                                                      {service.transport_type_name}
                                                    </label>
                                                  </div>
                                                );
                                              },
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
                                              },
                                            )}
                                          </td>
                                        </tr>
                                      </React.Fragment>
                                    )) ||
                                    null
                                  );
                                },
                              )}
                              </tbody>
                            </table>
                            {isShowMessage && (
                              <div className="error-mess">Vui lòng chọn Hãng vận chuyển</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </TabPane>
              )}
              <TabPane tab={<div><SelfDeliverOutline />Tự giao hàng</div>}
                       key={ShipmentMethodOption.SELF_DELIVER}>
                {renderDateForm()}

                {shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
                  <div className="mt-10">
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item
                          name="delivery_service_provider_type"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn loại vận chuyển",
                            },
                          ]}
                        >
                          <Radio.Group onChange={(e) => {
                            setDeliveryServiceTypeState(e.target.value);
                            shipmentForm.setFieldsValue({
                              shipper: null,
                            });
                          }}>
                            {deliveryServiceTypeOptions.map((i) => (
                              <Radio value={i.value}>{i.name}</Radio>
                            ))}
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    {deliveryServiceTypeState === deliveryServiceType.EMPLOYEE ? (
                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item
                            name="shipper"
                            label="Nhân viên yody"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn nhân viên",
                              },
                            ]}
                          >
                            <AccountSearchPaging
                              isGetName
                              placeholder="Tìm theo họ tên hoặc mã nhân viên"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="shipping_fee_paid_to_three_pls"
                            label="Phí ship trả đối tác giao hàng"
                          >
                            <NumberInput
                              format={(a: string) => formatCurrency(a)}
                              replace={(a: string) => replaceFormatString(a)}
                              placeholder="0"
                              style={{
                                textAlign: "right",
                                width: "100%",
                                color: "#222222",
                              }}
                              maxLength={15}
                              minLength={0}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ) : (
                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item
                            name="shipper_name"
                            label="Tên người giao"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn nhập tên người giao",
                              },
                            ]}
                          >
                            <Input placeholder="Tên người giao hàng" />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            name="shipping_fee_paid_to_three_pls"
                            label="Phí ship trả đối tác giao hàng"
                          >
                            <NumberInput
                              format={(a: string) => formatCurrency(a)}
                              replace={(a: string) => replaceFormatString(a)}
                              placeholder="0"
                              style={{
                                textAlign: "right",
                                width: "100%",
                                color: "#222222",
                              }}
                              maxLength={15}
                              minLength={0}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            name="shipper_phone"
                            label="SĐT người giao"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn nhập SĐT người giao",
                              },
                            ]}
                          >
                            <Input placeholder="SĐT người giao hàng" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="note_to_shipper"
                            label="Ghi chú"
                          >
                            <Input placeholder="Nhập ghi chú" />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                )}
              </TabPane>
            </Tabs>
          </div>
        </Form>
      </InventoryShipmentWrapper>
    </Modal>
  );
};

export default InventoryShipment;
