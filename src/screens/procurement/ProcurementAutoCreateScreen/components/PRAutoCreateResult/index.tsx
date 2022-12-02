import { Col, FormInstance, Image, Row, Tabs, Typography } from "antd";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { isEmpty } from "lodash";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { Link } from "react-router-dom";
import ImageProduct from "screens/products/product/component/ImageProduct";
import {
  getTotalProcurementItemsQuantityType,
  POProcurementLineItemField,
} from "screens/procurement/helper";
import { formatCurrency } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

type PRAutoCreateResultProps = {
  formMain: FormInstance;
  procurementsResult: Array<PurchaseProcument>;
};

const { TabPane } = Tabs;
const PRAutoCreateResult: React.FC<PRAutoCreateResultProps> = (props: PRAutoCreateResultProps) => {
  const { procurementsResult } = props;

  const renderTabTitle = (procurement: PurchaseProcument) => {
    return (
      <div style={{ textAlign: "center" }}>
        <div>{procurement.purchase_order?.code}</div>
        <div style={{ fontSize: 12, fontWeight: "bold" }}>{procurement?.code}</div>
      </div>
    );
  };
  return (
    <Tabs defaultActiveKey={procurementsResult[0].code}>
      {!isEmpty(procurementsResult) &&
        procurementsResult.map((item: PurchaseProcument) => {
          const procurementItemsFilter = item.procurement_items.filter(
            (el: PurchaseProcumentLineItem) => el.real_quantity,
          );

          const calculatingReceiptQuantity = () => {
            const total = item.procurement_items
              .map((el: PurchaseProcumentLineItem) => el.real_quantity)
              .reduce((prev: number, current: number) => prev + current, 0);
            return total;
          };
          return (
            <TabPane tab={renderTabTitle(item)} key={item.code}>
              <Row gutter={50} style={{ marginTop: 15, marginBottom: 15 }}>
                <Col span={6}>
                  Mã tham chiếu: <Typography.Text strong>{item?.reference}</Typography.Text>
                </Col>
                <Col span={6}>
                  Ngày tạo đơn đặt hàng:{" "}
                  <Typography.Text strong>
                    {ConvertUtcToLocalDate(item.purchase_order.order_date, DATE_FORMAT.DDMMYYY)}
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
                  <Typography.Text strong>{calculatingReceiptQuantity()}</Typography.Text>
                </Col>
              </Row>
              <CustomTable
                bordered
                scroll={{ x: 1200 }}
                sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
                pagination={false}
                dataSource={procurementItemsFilter}
                columns={[
                  {
                    title: "STT",
                    align: "center",
                    fixed: "left",
                    width: 50,
                    render: (value, record, index) => index + 1,
                  },
                  {
                    title: "Ảnh",
                    align: "center",
                    width: 60,
                    dataIndex: "variant_image",
                    render: (url: string) => {
                      return (
                        <>
                          {url ? (
                            <Image width={40} height={40} placeholder="Xem" src={url ?? ""} />
                          ) : (
                            <ImageProduct isDisabled={true} path={url} />
                          )}
                        </>
                      );
                    },
                  },
                  {
                    title: "Mã Sản phẩm",
                    align: "center",
                    width: 120,
                    dataIndex: "sku",
                    render: (value: string, i: PurchaseOrderLineItem) => {
                      return (
                        <>
                          <div>
                            <Link
                              to={`${UrlConfig.PRODUCT}/${i.product_id}${UrlConfig.VARIANTS}/${i.variant_id}`}
                            >
                              {value}
                            </Link>
                          </div>
                        </>
                      );
                    },
                  },
                  {
                    title: "Tên Sản phẩm",
                    align: "center",
                    width: 120,
                    dataIndex: "variant",
                    render: (value: string, i: PurchaseOrderLineItem) => {
                      return (
                        <>
                          <div>
                            <Link
                              to={`${UrlConfig.PRODUCT}/${i.product_id}${UrlConfig.VARIANTS}/${i.variant_id}`}
                            >
                              {value}
                            </Link>
                          </div>
                        </>
                      );
                    },
                  },
                  {
                    title: "Giá bán",
                    dataIndex: "retail_price",
                    align: "center",
                    width: 70,
                    render: (value: number) => (
                      <div> {value !== null ? formatCurrency(value, ".") : "0"}</div>
                    ),
                  },
                  {
                    title: (
                      <div>
                        Số lượng được duyệt
                        <span className="text-center" style={{ color: "#2A2A86", marginLeft: 4 }}>
                          (
                          {formatCurrency(
                            getTotalProcurementItemsQuantityType(
                              procurementItemsFilter,
                              POProcurementLineItemField.accepted_quantity,
                            ),
                          )}
                          )
                        </span>
                      </div>
                    ),
                    align: "center",
                    dataIndex: "accepted_quantity",
                    width: 70,
                    render: (value: number) => (
                      <div> {value !== null ? formatCurrency(value, ".") : "0"}</div>
                    ),
                  },
                  {
                    title: (
                      <div>
                        Số lượng thực nhận
                        <span className="text-center" style={{ color: "#27AE60", marginLeft: 4 }}>
                          (
                          {formatCurrency(
                            getTotalProcurementItemsQuantityType(
                              procurementItemsFilter,
                              POProcurementLineItemField.real_quantity,
                            ),
                          )}
                          )
                        </span>
                      </div>
                    ),
                    dataIndex: "real_quantity",
                    align: "center",
                    width: 70,
                    render: (value: string) => value,
                  },
                ]}
                className="yody-table-product-search small-padding"
              />
            </TabPane>
          );
        })}
    </Tabs>
  );
};

export default PRAutoCreateResult;
