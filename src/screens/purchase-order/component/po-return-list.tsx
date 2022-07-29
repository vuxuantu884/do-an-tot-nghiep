import { Timeline, Button, Card, Row, Col, Collapse, Space, Divider } from "antd";

import { useHistory } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { useMemo, Fragment } from "react";
import UrlConfig from "config/url.config";
import { POUtils } from "utils/POUtils";
import { formatCurrency } from "utils/AppUtils";

import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import "./po-return-list.scss";
import IconPrintHover from "assets/img/iconPrintHover.svg";

interface POReturnListProps {
  id: string;
  params: PurchaseOrder | null;
  actionPrint?: (poReturnId: number) => {};
  printElementRefReturn?: any;
}

const POReturnList: React.FC<POReturnListProps> = (props: POReturnListProps) => {
  const { id, params, actionPrint } = props;
  const history = useHistory();
  const return_orders = useMemo(() => {
    return params?.return_orders;
  }, [params]);

  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">Hoàn trả</span>
        </div>
      }
      extra={
        <Button
          onClick={() => {
            history.push(`${UrlConfig.PURCHASE_ORDERS}/${id}/return`);
          }}
          style={{
            alignItems: "center",
            display: "flex",
          }}
          type="primary"
          className="create-button-custom ant-btn-outline fixed-button"
          icon={<AiOutlinePlus size={16} />}
        >
          Tạo hoàn trả
        </Button>
      }
    >
      {return_orders && return_orders.length > 0 && (
        <div className="timeline">
          {return_orders.map((item) => {
            let total = 0;
            let totalValue = 0;
            if (item.line_return_items) {
              item.line_return_items.forEach((lineReturn) => {
                total += lineReturn.quantity_return;
              });
              item.line_return_items.forEach((item) => {
                const caculatePrice = POUtils.caculatePrice(
                  item.price,
                  item.discount_rate,
                  item.discount_value,
                );
                totalValue +=
                  item.quantity_return * caculatePrice +
                  (item.tax_rate / 100) * item.quantity_return * caculatePrice;
              });
            }

            return (
              <Timeline key={item.id} style={{ marginTop: 10 }}>
                <Timeline.Item className="active">
                  <Row>
                    <Col span={12}>
                      <div style={{ fontWeight: 500 }}>{`${total} sản phẩm`}</div>
                      <div className="text-default">
                        {`Tổng giá trị hàng: ${formatCurrency(totalValue)}`}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="return-right">
                        <div className="text-center">
                          {`Ngày trả hàng: ${ConvertUtcToLocalDate(item.expect_return_date)}`}
                        </div>
                        <div>
                          <Button
                            className="ant-btn-outline"
                            size="large"
                            onClick={() => {
                              actionPrint && actionPrint(item.id);
                            }}
                            icon={<img src={IconPrintHover} style={{ marginRight: 8 }} alt="" />}
                          >
                            In phiếu trả
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Collapse className="margin-top-20">
                    <Collapse.Panel
                      key={1}
                      header={<span style={{ fontWeight: 500 }}>{`${total} sản phẩm`}</span>}
                    >
                      {item.line_return_items?.map((item) => {
                        return (
                          <Fragment>
                            <Row>
                              <Col span={20} style={{ display: "inline" }}>
                                <Space split={<i className="icon-dot" />}>
                                  <span className="text-primary">{item.sku}</span>
                                  <span>{item.variant}</span>
                                </Space>
                              </Col>
                              <Col span={4}>
                                <div className="text-right">{item.quantity_return}</div>
                              </Col>
                            </Row>
                            <Divider />
                          </Fragment>
                        );
                      })}
                    </Collapse.Panel>
                  </Collapse>
                </Timeline.Item>
              </Timeline>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default POReturnList;
