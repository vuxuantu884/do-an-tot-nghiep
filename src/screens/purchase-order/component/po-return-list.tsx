import {
  Timeline,
  Button,
  Card,
  Row,
  Col,
  Collapse,
  Space,
  Divider,
} from "antd";

import { useHistory } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { useMemo, Fragment } from "react";
import UrlConfig from "config/url.config";
import { POUtils } from "utils/POUtils";
import { formatCurrency } from "utils/AppUtils";

import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import "./po-return-list.scss";
interface POReturnListProps {
  id: string;
  params: PurchaseOrder | null;
}

const POReturnList: React.FC<POReturnListProps> = (
  props: POReturnListProps
) => {
  const { id, params } = props;
  const history = useHistory();
  const line_return_items = useMemo(() => {
    return params?.line_return_items;
  }, [params]);
  const totalItems = useMemo(() => {
    let total = 0;
    if (!line_return_items) return total;
    line_return_items.forEach((item) => {
      total += item.quantity_return;
    });
    return total;
  }, [line_return_items]);
  const totalValue = useMemo(() => {
    let total = 0;
    if (!line_return_items) return total;
    line_return_items.forEach((item) => {
      total +=
        item.quantity_return *
        POUtils.caculatePrice(
          item.price,
          item.discount_rate,
          item.discount_value
        );
    });
    return total;
  }, [line_return_items]);
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
            history.push(`${UrlConfig.PURCHASE_ORDER}/return/${id}`, {
              params,
            });
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
      {line_return_items && line_return_items.length > 0 && (
        <div className="padding-20 timeline">
          <Timeline>
            <Timeline.Item className="active">
              <Row>
                <Col span={12}>
                  <div
                    style={{ fontWeight: 500 }}
                  >{`${totalItems} sản phẩm`}</div>
                  <div className="text-default">
                    {`Tổng giá trị hàng: ${formatCurrency(totalValue)}`}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-muted text-right">
                    {`Ngày trả hàng: ${ConvertUtcToLocalDate(
                      params?.expect_return_date
                    )}`}
                  </div>
                </Col>
              </Row>
              <Collapse className="margin-top-20">
                <Collapse.Panel
                  key={1}
                  header={
                    <span
                      style={{ fontWeight: 500 }}
                    >{`${totalItems} sản phẩm`}</span>
                  }
                >
                  {line_return_items.map((item) => {
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
                            <div className="text-right">
                              {item.quantity_return}
                            </div>
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
        </div>
      )}
    </Card>
  );
};

export default POReturnList;
