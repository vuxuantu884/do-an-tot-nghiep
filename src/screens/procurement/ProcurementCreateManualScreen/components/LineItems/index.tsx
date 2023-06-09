import { Card, Col, FormInstance, Image, Row, Tabs, Typography } from "antd";
import CustomTable from "component/table/CustomTable";
import React, { useEffect } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import ImageProduct from "screens/products/product/component/ImageProduct";
import NumberInput from "component/custom/number-input.custom";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { isEmpty } from "lodash";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  getTotalProcurementItemsQuantityType,
  POProcurementLineItemField,
} from "screens/procurement/helper";

interface LineItemsProps {
  formMain: FormInstance;
  onQuantityChange: (quantity: number, sku: string, code: string) => void;
  procurements: Array<PurchaseProcument>;
  poData: PurchaseOrder;
  setActivePR: (value: string) => void;
  activePR: string;
}

const LineItems: React.FC<LineItemsProps> = (props: LineItemsProps) => {
  const { onQuantityChange, procurements, poData, setActivePR, activePR } = props;
  const { TabPane } = Tabs;

  useEffect(() => {
    if (!activePR && !isEmpty(procurements)) {
      setActivePR(procurements[0].code);
    }
  }, [activePR, procurements, setActivePR]);

  const renderTabTitle = (procurement: PurchaseProcument) => {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: "500" }}>{procurement?.code}</div>
        <div style={{ fontSize: 12 }}>
          {ConvertUtcToLocalDate(procurement.expect_receipt_date, DATE_FORMAT.DDMMYYY)}
        </div>
      </div>
    );
  };

  return (
    <Card title="THÔNG TIN SẢN PHẨM" className="card-manual-items">
      <Tabs onChange={(value) => setActivePR(value)} defaultActiveKey={procurements[0].code}>
        {!isEmpty(procurements) &&
          procurements.map((item: PurchaseProcument) => {
            const { procurement_items, code } = item;
            const procurementItemFilter = procurement_items.filter(
              (el: PurchaseProcumentLineItem) => el.planned_quantity > 0,
            );
            return (
              <TabPane tab={renderTabTitle(item)} key={code}>
                <Row gutter={50} style={{ marginTop: 15, marginBottom: 15 }}>
                  <Col span={6}>
                    Mã tham chiếu: <Typography.Text strong>{poData.reference}</Typography.Text>
                  </Col>
                  <Col span={6}>
                    Ngày tạo đơn đặt hàng:{" "}
                    <Typography.Text strong>
                      {ConvertUtcToLocalDate(poData.order_date, DATE_FORMAT.DDMMYYY)}
                    </Typography.Text>
                  </Col>
                  <Col span={6}>
                    Ngày nhận dự kiến:{" "}
                    <Typography.Text strong>
                      {ConvertUtcToLocalDate(item.expect_receipt_date, DATE_FORMAT.DDMMYYY)}
                    </Typography.Text>
                  </Col>
                  <Col span={6}>
                    Tổng sản phẩm nhận:{" "}
                    <Typography.Text strong>
                      {getTotalProcurementItemsQuantityType(
                        procurementItemFilter,
                        POProcurementLineItemField.real_quantity,
                      )}
                    </Typography.Text>
                  </Col>
                </Row>
                <CustomTable
                  scroll={{ x: "max-content" }}
                  rowClassName="product-table-row"
                  tableLayout="fixed"
                  pagination={false}
                  columns={[
                    {
                      title: "STT",
                      align: "center",
                      width: "40px",
                      render: (value: string, row: PurchaseProcumentLineItem, index: number) =>
                        index + 1,
                    },
                    {
                      title: "Ảnh",
                      width: "60px",
                      align: "center",
                      dataIndex: "variant_images",
                      render: (value: string | null) => {
                        return value ? (
                          <Image width={40} height={40} placeholder="Xem" src={value ?? ""} />
                        ) : (
                          <ImageProduct isDisabled={true} path={value} />
                        );
                      },
                    },
                    {
                      title: "Sản phẩm",
                      width: "200px",
                      className: "ant-col-info",
                      dataIndex: "variant",
                      render: (value: string, row: PurchaseProcumentLineItem) => (
                        <div>
                          <div>
                            <div className="product-item-sku">
                              <Link
                                target="_blank"
                                to={`${UrlConfig.PRODUCT}/${row.product_id}/variants/${row.variant_id}`}
                              >
                                {row.sku}
                              </Link>
                            </div>
                            <div className="product-item-name">
                              <span className="product-item-name-detail">{value}</span>
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: (
                        <div>
                          <div>
                            SL đặt hàng (
                            <span style={{ color: "#2A2A86" }}>
                              {getTotalProcurementItemsQuantityType(
                                procurementItemFilter,
                                POProcurementLineItemField.planned_quantity,
                              )}
                            </span>
                            )
                          </div>
                        </div>
                      ),
                      width: 100,
                      align: "center",
                      dataIndex: "planned_quantity",
                      render: (value, row, index) => value ?? 0,
                    },
                    {
                      title: (
                        <div>
                          <div>
                            SL được duyệt (
                            <span style={{ color: "#2A2A86" }}>
                              {getTotalProcurementItemsQuantityType(
                                procurementItemFilter,
                                POProcurementLineItemField.accepted_quantity,
                              )}
                            </span>
                            )
                          </div>
                        </div>
                      ),
                      width: 100,
                      align: "center",
                      dataIndex: "accepted_quantity",
                      render: (value, row, index) => value ?? 0,
                    },
                    {
                      title: (
                        <div>
                          <div>
                            SL thực nhận (
                            <span style={{ color: "#2A2A86" }}>
                              {getTotalProcurementItemsQuantityType(
                                procurementItemFilter,
                                POProcurementLineItemField.real_quantity,
                              )}
                            </span>
                            )
                          </div>
                        </div>
                      ),
                      width: 100,
                      align: "center",
                      dataIndex: "real_quantity",
                      render: (value, row: PurchaseProcumentLineItem, index) => (
                        <NumberInput
                          isFloat={false}
                          value={value}
                          minLength={1}
                          placeholder="0"
                          maxLength={12}
                          onChange={(quantity: number | null) => {
                            if (quantity === null) {
                              quantity = 0;
                            }
                            onQuantityChange(quantity, row.sku, code);
                            getTotalProcurementItemsQuantityType(
                              procurementItemFilter,
                              POProcurementLineItemField.real_quantity,
                            );
                          }}
                          format={(value: string) => {
                            return formatCurrency(value);
                          }}
                          replace={(a: string) => replaceFormatString(a)}
                        />
                      ),
                    },
                  ]}
                  dataSource={procurementItemFilter}
                  bordered={true}
                  sticky
                  footer={() =>
                    procurementItemFilter.length > 0 ? (
                      <div style={{ background: "#f5f5f5" }} className="row-footer-custom">
                        <div
                          className="yody-foot-total-text"
                          style={{
                            width: "32%",
                            float: "left",
                            fontWeight: 700,
                          }}
                        >
                          TỔNG
                        </div>

                        <div
                          style={{
                            width: "27.5%",
                            float: "left",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {getTotalProcurementItemsQuantityType(
                            procurementItemFilter,
                            POProcurementLineItemField.planned_quantity,
                          )}
                        </div>

                        <div
                          style={{
                            width: "16.5%",
                            float: "left",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {getTotalProcurementItemsQuantityType(
                            procurementItemFilter,
                            POProcurementLineItemField.accepted_quantity,
                          )}
                        </div>

                        <div
                          style={{
                            width: "23%",
                            float: "left",
                            textAlign: "right",
                            color: "#000000",
                            fontWeight: 700,
                          }}
                        >
                          {getTotalProcurementItemsQuantityType(
                            procurementItemFilter,
                            POProcurementLineItemField.real_quantity,
                          )}
                        </div>
                      </div>
                    ) : (
                      <div />
                    )
                  }
                />
              </TabPane>
            );
          })}
      </Tabs>
    </Card>
  );
};

export default LineItems;
