import { Col, Form, FormInstance, Row, Space } from "antd";
import classNames from "classnames";
import CustomDatePicker from "component/custom/date-picker.custom";
import { POField } from "model/purchase-order/po-field";
import {
  PurchaseProcument,
  PurchaseProcurementViewDraft,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import React, { lazy, useCallback, useEffect, useState } from "react";
import { ProcumentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import POProgressView from "../po-progress-view";

const TabAll = lazy(() => import("./tab1"));
const TabInvetory = lazy(() => import("./tab2"));
const TabConfirmed = lazy(() => import("./tab3"));
const TabDraft = lazy(() => import("./tab4"));

type POInventoryViewProps = {
  id?: number;
  code?: string;
  onSuccess: () => void;
  confirmDraft: (
    item: PurchaseProcument,
    isEdit: boolean,
    procumentCode: string,
  ) => void;
  confirmInventory: (item: PurchaseProcument, isEdit: boolean) => void;
  tabs: Array<any>;
  activeTab: number;
  selectTabChange: (id: number) => void;
  form: FormInstance;
  isEditDetail?: boolean;
  receiveStatus?: string;
};

const POInventoryView: React.FC<POInventoryViewProps> = (
  props: POInventoryViewProps,
) => {
  const {
    confirmDraft,
    confirmInventory,
    id: poId,
    onSuccess,
    code,
    tabs,
    activeTab,
    selectTabChange,
    form,
    isEditDetail,
    receiveStatus,
  } = props;
  const [procumentView, setProcumentView] = useState<
    Array<PurchaseProcurementViewDraft>
  >([]);
  const getComponent = useCallback(
    (id: number) => {
      switch (id) {
        case 1:
          return <TabAll onSuccess={onSuccess} id={poId} code={code} />;
        case 2:
          return <TabInvetory poId={poId} />;
        case 3:
          return <TabConfirmed confirmInventory={confirmInventory} />;
        case 4:
          return <TabDraft confirmDraft={confirmDraft} />;
      }
    },
    [code, confirmDraft, confirmInventory, onSuccess, poId],
  );

  const getExpectReceiptDate = () => {
    const procument_items: Array<PurchaseProcument> = form.getFieldValue(
      POField.procurements,
    );
    if (procument_items?.length > 0 && procument_items[0]) {
      return ConvertUtcToLocalDate(
        procument_items[0].expect_receipt_date,
        DATE_FORMAT.DDMMYYY,
      );
    } else {
      return "-";
    }
  };

  useEffect(() => {
    let procurements: Array<PurchaseProcurementViewDraft> =
      form.getFieldValue(POField.procurements) || [];
    setProcumentView([...procurements]);
  }, [form]);

  return (
    <React.Fragment>
      <Form.Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev[POField.planned_quantity] !==
            current[POField.planned_quantity] &&
          prev[POField.receipt_quantity] !== current[POField.receipt_quantity]
        }
      >
        {({ getFieldValue }) => {
          let planned_quantity = getFieldValue(POField.planned_quantity);
          let receipt_quantity = getFieldValue(POField.receipt_quantity);
          return (
            <POProgressView
              remainTitle={
                receipt_quantity - planned_quantity > 0
                  ? "SL NHẬP DƯ"
                  : "SL CÒN LẠI"
              }
              receivedTitle={"ĐÃ NHẬN"}
              received={receipt_quantity}
              total={planned_quantity}
            />
          );
        }}
      </Form.Item>
      <Row align="middle">
        <div
          className="po-inven-view"
          style={{ borderBottom: "1px solid #2A2A86" }}
        >
          <Col span={16}>
            <Space size={15}>
              {tabs.map((item) => (
                <div
                  className={classNames(
                    "po-inven-view-tab",
                    activeTab === item.id && "active",
                  )}
                  key={item.id}
                >
                  <div
                    onClick={() => {
                      selectTabChange(item.id);
                    }}
                    className="tab"
                  >
                    <img src={item.icon} className="tab-icon" alt="icon"></img>
                    <span>{item.name}</span>
                  </div>
                </div>
              ))}
            </Space>
          </Col>
          <Col style={{ marginLeft: "auto" }} span={5}>
            <div>
              {isEditDetail &&
              receiveStatus &&
              receiveStatus !== ProcumentStatus.FINISHED ? (
                <>
                  <Form.Item
                    name={[
                      POField.procurements,
                      0,
                      POField.expect_receipt_date,
                    ]}
                  >
                    <CustomDatePicker
                      value={
                        procumentView.length > 0 && procumentView[0]
                          ? procumentView[0].expect_receipt_date
                          : undefined
                      }
                      disableDate={(date) => date <= moment().startOf("days")}
                      format={DATE_FORMAT.DDMMYYY}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </>
              ) : (
                <p style={{ margin: 0 }}>
                  Ngày nhận dự kiến: <b>{getExpectReceiptDate()}</b>
                </p>
              )}
            </div>
          </Col>
        </div>
      </Row>
      {tabs.map((item) => (
        <div
          className={classNames(
            "tab-content",
            activeTab === item.id && "active",
          )}
          key={item.id}
        >
          {getComponent(item.id)}
        </div>
      ))}
    </React.Fragment>
  );
};

export default POInventoryView;
