import { Timeline, Button, Card, Row, Col, Collapse, Space, Divider } from "antd";

import { AiOutlinePlus } from "react-icons/ai";
import React, { Fragment, useState } from "react";
import { POUtils } from "utils/POUtils";
import { formatCurrency } from "utils/AppUtils";

import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import "./po-return-list.scss";
import IconPrintHover from "assets/img/iconPrintHover.svg";
import POReturnScreen from "../purchase-order-return.screen";
import ModalConfirm from "../../../component/modal/ModalConfirm";

interface POReturnListProps {
  id: string;
  params: PurchaseOrder | null;
  actionPrint?: (poReturnId: number) => {};
  printElementRefReturn?: any;
  onUpdateCallReturn: () => any;
}

const POReturnList: React.FC<POReturnListProps> = (props: POReturnListProps) => {
  const { params, actionPrint, onUpdateCallReturn } = props;
  const [isShowReturn, setIsShowReturn] = useState(false);
  const [isShowModalConfirmCancel, setIsShowModalConfirmCancel] = useState(false);

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
          onClick={() => setIsShowReturn(true)}
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
      {isShowReturn && (
        <>
          <POReturnScreen
            poData={params}
            cancelReturn={() => {
              setIsShowModalConfirmCancel(true);
            }}
            onUpdateCallReturn={() => {
              onUpdateCallReturn();
              setIsShowReturn(false);
            }}
          />
          <Divider style={{ margin: '20px 0' }} />
        </>
      )}
      {params?.return_orders && params?.return_orders.length > 0 && (
        <div className="timeline">
          {params?.return_orders.map((item) => {
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
                <Timeline.Item className="custom-timeline">
                  <Row>
                    <Col span={6}>
                      <div className="text-default">
                        Ngày trả hàng: <span className="font-weight-500">{ConvertUtcToLocalDate(item.expect_return_date)}</span>
                      </div>
                      <div className="text-default">
                        Tổng giá trị hàng: <span className="font-weight-500">{formatCurrency(totalValue)}</span>
                      </div>
                    </Col>
                    <Col span={18}>
                      <div>
                        <Button
                          style={{ color: '#222222' }}
                          size="large"
                          onClick={() => {
                            actionPrint && actionPrint(item.id);
                          }}
                          icon={<img src={IconPrintHover} style={{ marginRight: 8 }} alt="" />}
                        >
                          In phiếu trả
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <Collapse className="margin-top-20">
                    <Collapse.Panel
                      key={1}
                      header={<span style={{ fontWeight: 500 }}>{`${total} sản phẩm`}</span>}
                    >
                      {item.line_return_items?.map((poLineReturnItem, index) => {
                        return (
                          <Fragment key={index}>
                            <Row>
                              <Col span={20} style={{ display: "inline" }}>
                                <Space split={<i className="icon-dot" />}>
                                  <span className="text-primary">{poLineReturnItem.sku}</span>
                                  <span>{poLineReturnItem.variant}</span>
                                </Space>
                              </Col>
                              <Col span={4}>
                                <div className="text-right">{poLineReturnItem.quantity_return}</div>
                              </Col>
                            </Row>
                            {index !== item.line_return_items.length - 1 && (
                              <Divider />
                            )}
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

      {isShowModalConfirmCancel && (
        <ModalConfirm
          visible={isShowModalConfirmCancel}
          onCancel={() => setIsShowModalConfirmCancel(false)}
          onOk={() => {
            setIsShowReturn(false);
            setIsShowModalConfirmCancel(false);
          }}
          title="Bạn có muốn hủy trả hàng không?"
        />
      )}
    </Card>
  );
};

export default POReturnList;
