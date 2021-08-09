import { Form, Table, Typography } from "antd";
import { POField } from "model/purchase-order/po-field";
import { POProcumentLineItemField, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { ProcumentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";

const TabInvetory = () => {
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
        let items = procurements !== undefined ? procurements.filter(
          (item) => item.status === ProcumentStatus.FINISHED
        ) : [];
        return (
          <Table
            locale={{
              emptyText: 'Không có phiếu nhập kho'
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
                  <Typography.Link
                    style={{ color: "#5D5D8A", textDecoration: "underline" }}
                  >
                    {value}
                  </Typography.Link>
                ),
              },
              {
                title: "Kho nhận hàng",
                dataIndex: "store_code",
                align: "center",
                render: (value, item, index) => <div>{value}</div>,
              },
              {
                title: "Ngày nhận hàng thực tế",
                dataIndex: POProcumentLineItemField.activated_date,
                align: "center",
                render: (value: string, item, index: number) =>
                  ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
              },
              
              {
                align: "right",
                title: "SL Nhận hàng được duyệt",
                dataIndex: "procurement_items",
                render: (value, item, index: number) =>
                  POUtils.totalAccpectQuantityProcument(value),
              },
              {
                align: "right",
                title: <div style={{color: '#27AE60'}}>SL Thực nhận</div>,
                dataIndex: "procurement_items",
                render: (value, item, index: number) =>
                  <div style={{color: '#27AE60'}}>{POUtils.totalRealQuantityProcument(value)}</div>,
              },
              {
                title: "",
                dataIndex: "procurement_items",
                width: 40,
                render: () => "",
              },
            ]}
          />
        );
      }}
    </Form.Item>
  );
}

export default TabInvetory;