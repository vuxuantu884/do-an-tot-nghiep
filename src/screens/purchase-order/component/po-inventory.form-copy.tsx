import { Card, Col, Form, Input, Row, Tabs } from "antd";
import { FormInstance } from "antd/es/form/Form";
import { CardInterface } from "antd/lib/card";
import RenderTabBar from "component/table/StickyTabBar";
import { groupBy } from "lodash";
import { StoreResponse } from "model/core/store.model";
import { ProcurementLineItemField } from "model/procurement/field";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { Moment } from "moment";
import React, { useContext, useMemo, useState } from "react";
import styled from "styled-components";
import { POStatus, ProcurementStatus } from "utils/Constants";
import { PurchaseOrderCreateContext } from "../provider/purchase-order.provider";
import { PoSplitGoods } from "./po-inventory/po-split-goods";
import { PoWareHouse } from "./po-inventory/po-warehouse";
import TabAll from "./po-inventory/tab1";
import TabInvetory from "./po-inventory/tab2";
import POProgressViewInVenTory from "./po-progress-view-inventory";

const { TabPane } = Tabs;

export type POInventoryFormProps = {
  loadDetail?: (poId: number, isLoading: boolean, isSuggest: boolean) => void;
  stores: Array<StoreResponse>;
  status: string;
  now: Moment;
  isEdit: boolean;
  onAddProcumentSuccess?: (isSuggest: boolean) => void;
  idNumber?: number;
  poData?: PurchaseOrder;
  formMain?: FormInstance<any>;
  isShowStatusTag?: boolean;
  isEditDetail?: boolean;
};

const POInventoryFormCopy: React.FC<POInventoryFormProps> = (props: POInventoryFormProps) => {
  const { idNumber, onAddProcumentSuccess, poData, formMain, isEditDetail } = props;
  //page context
  const { purchaseOrder } = useContext(PurchaseOrderCreateContext);
  const defaultTabs = useMemo(() => {
    return [
      {
        name: "Kế hoạch nhận hàng",
        key: "1",
        disabled: false,
        component: <PoWareHouse formMain={formMain} isEditDetail={!!isEditDetail} />,
      },
      {
        name: "Tỉ lệ chia hàng",
        key: "2",
        disabled: false,
        component: <PoSplitGoods formMain={formMain} isEditDetail={!!isEditDetail} />,
      },
      {
        name: "Phiếu nhập kho",
        key: "3",
        disabled:
          purchaseOrder?.status === POStatus.DRAFT ||
          purchaseOrder?.status === POStatus.WAITING_APPROVAL,
        component: <TabInvetory poId={idNumber} />,
      },
    ];
  }, [idNumber, isEditDetail, formMain, purchaseOrder]);

  const [activeTab, setActiveTab] = useState<string | "">("1");
  const procurements = (formMain?.getFieldsValue()?.procurements as PurchaseProcument[]) || [];
  const isMarginTop =
    procurements.some((item) => item.status === ProcurementStatus.draft) && isEditDetail;

  return (
    <StyledRow
      gutter={24}
      style={{
        boxShadow: "0 0 2px 1px #eee",
      }}
    >
      <Form.Item noStyle hidden name={POField.procurements}>
        <Input />
      </Form.Item>
      <Col
        span={12}
        style={{
          paddingRight: "0",
        }}
      >
        <StyledCardLeft
          isMarginTop={!!isMarginTop}
          className="po-form"
          title={
            <div className="d-flex">
              <span className="title-card">NHẬP KHO TỔNG QUAN</span>
            </div>
          }
          style={{
            marginBottom: "0",
            height: "100%",
            borderTopRightRadius: "initial",
            borderBottomRightRadius: "initial",
            borderRight: 0,
            boxShadow: "initial",
          }}
          extra={
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.planned_quantity] !== current[POField.planned_quantity] &&
                prev[POField.receipt_quantity] !== current[POField.receipt_quantity]
              }
            >
              {({ getFieldValue }) => {
                let planned_quantity = getFieldValue(POField.planned_quantity);
                let receipt_quantity = getFieldValue(POField.receipt_quantity);
                return (
                  <POProgressViewInVenTory
                    remainTitle={
                      receipt_quantity - planned_quantity > 0 ? "SL NHẬP DƯ" : "SL CÒN LẠI"
                    }
                    receivedTitle={"ĐÃ NHẬN"}
                    received={receipt_quantity}
                    total={planned_quantity}
                  />
                );
              }}
            </Form.Item>
          }
        >
          <TabAll
            onSuccess={() => {
              onAddProcumentSuccess && onAddProcumentSuccess(true);
            }}
            code={poData ? poData.code : undefined}
            id={idNumber}
          />
        </StyledCardLeft>
      </Col>
      <Col
        span={12}
        style={{
          paddingLeft: "0",
        }}
        flex={1}
      >
        <Card
          className="card-tab"
          style={{
            height: "100%",
            marginBottom: 0,
            borderTopLeftRadius: "initial",
            borderBottomLeftRadius: "initial",
            boxShadow: "initial",
            borderRight: 0,
          }}
        >
          <Tabs
            style={{ overflow: "initial" }}
            activeKey={activeTab}
            onChange={(active) => {
              setActiveTab(active);
            }}
            renderTabBar={RenderTabBar}
          >
            {defaultTabs.map((tab) => {
              return (
                <TabPane tab={tab.name} key={tab.key} disabled={tab.disabled}>
                  {activeTab === tab.key && tab.component}
                </TabPane>
              );
            })}
          </Tabs>
        </Card>
      </Col>
    </StyledRow>
  );
};

const StyledRow = styled(Row)`
  margin-top: 20px;
  .ant-tabs-content-holder {
    padding-top: 20px;
  }
  .card-tab .ant-card-body .ant-tabs-nav .ant-tabs-tab {
    padding: 12px 0;
  }
  .ant-table-tbody > tr > td {
    height: 52px;
  }
  .ant-card-extra {
    flex: 1;
  }
  .progress-view {
    margin: 0;
  }
  td.ant-table-cell {
    padding: 0px 5px !important;
  }
  .ant-tabs.ant-tabs-top div:first-child {
    position: initial !important;
  }
`;
interface IStyledCardLeft {
  isMarginTop: boolean;
}

const StyledCardLeft = styled<CardInterface>(Card)<IStyledCardLeft>`
  .ant-card-body {
    margin-top: ${(p) => (p.isMarginTop ? "30px" : "0px")} !important;
  }
`;

POInventoryFormCopy.defaultProps = {
  isShowStatusTag: true,
};

export default POInventoryFormCopy;
