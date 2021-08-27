import { Button, Form, Table, Typography } from "antd";
import { POField } from "model/purchase-order/po-field";
import {
  POProcumentField,
  PurchaseProcument,
} from "model/purchase-order/purchase-procument";
import { ProcumentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";

type TabDraftProps = {
  confirmDraft: (item: PurchaseProcument, isEdit: boolean) => void;
};
const TabDraft: React.FC<TabDraftProps> = (props: TabDraftProps) => {
  const { confirmDraft } = props;
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, current) =>
        prev[POField.procurements] !== current[POField.procurements]
      }
    >
      {({ getFieldValue }) => {
        let procurements: Array<PurchaseProcument> = getFieldValue(
          POField.procurements
        );
        let items = procurements
          ? procurements.filter((item) => item.status === ProcumentStatus.DRAFT)
          : [];
        return (
          <Table
            locale={{
              emptyText: "Không có đơn nháp",
            }}
            className="product-table"
            rowKey={(record: PurchaseProcument) =>
              record.id ? record.id : new Date().getTime()
            }
            rowClassName="product-table-row"
            dataSource={items}
            tableLayout="fixed"
            scroll={{ y: 250, x: 845 }}
            pagination={false}
            columns={[
              {
                align: "center",
                title: (
                  <div
                    style={{
                      flexDirection: "column",
                      display: "flex",
                    }}
                  >
                    Phiếu nháp
                  </div>
                ),
                dataIndex: "code",
                render: (value, item, index) => (
                  <Button
                    type="link"
                    onClick={() => {
                      confirmDraft(item, true);
                    }}
                  >
                    <div
                      style={{ color: "#5D5D8A", textDecoration: "underline" }}
                    >
                      {value}
                    </div>
                  </Button>
                ),
              },
              {
                title: "Kho nhận hàng",
                dataIndex: POProcumentField.store,
                align: "center",
                render: (value, item, index) => <div>{value}</div>,
              },
              {
                title: "Ngày nhận hàng dự kiến",
                dataIndex: "expect_receipt_date",
                align: "right",
                render: (value: string, item, index: number) =>
                  ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
              },
              {
                align: "right",
                title: "SL Nhận hàng dự kiến",
                dataIndex: "procurement_items",
                render: (value, item, index: number) =>
                  POUtils.totalQuantityProcument(value),
              },
              {
                title: "",
                dataIndex: "procurement_items",
                width: 200,
                render: (value, item, index: number) => (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      onClick={() => confirmDraft(item, false)}
                      type="primary"
                    >
                      Duyệt phiếu
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        );
      }}
    </Form.Item>
  );
};

export default TabDraft;
