import { Button, Form, Table } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { POField } from "model/purchase-order/po-field";
import {
  POProcumentField,
  PurchaseProcument,
} from "model/purchase-order/purchase-procument";
import { ProcumentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";

type TabConfirmedProps = {
  confirmInventory: (item: PurchaseProcument, isEdit: boolean) => void;
};

const TabConfirmed: React.FC<TabConfirmedProps> = (
  props: TabConfirmedProps
) => {
  const { confirmInventory } = props;
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
        let items =
          procurements !== undefined && procurements !== null
            ? procurements.filter(
                (item) =>
                  item.status === ProcumentStatus.NOT_RECEIVED
              )
            : [];
        return (
          <Table
            locale={{
              emptyText: "Không có đơn duyệt",
            }}
            className="product-table"
            rowKey={(record: PurchaseProcument) =>
              record.id ? record.id : new Date().getTime()
            }
            rowClassName="product-table-row"
            dataSource={items}
            tableLayout="fixed"
            scroll={{y: 250, x: 845}}
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
                      confirmInventory(item, true);
                    }}
                  >
                    <div style={{color: "#5D5D8A", textDecoration: "underline"}}>
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
                title: "Ngày nhận hàng được duyệt",
                dataIndex: POProcumentField.activated_date,
                align: "right",
                render: (value: string, item, index: number) =>
                  ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
              },
              {
                title: "Người duyệt",
                dataIndex: POProcumentField.activated_by,
                align: "center",
                render: (value: string, item, index: number) => value,
              },
              {
                align: "right",
                title: "SL Nhận hàng được duyệt",
                dataIndex: POProcumentField.procurement_items,
                render: (value, item, index: number) =>
                  POUtils.totalQuantityProcument(value),
              },
              {
                title: "",
                width: 200,
                dataIndex: POProcumentField.status,
                render: (value, item, index: number) => (
                  <div style={{display: "flex", justifyContent: "flex-end"}}>
                    {item.is_cancelled ? (
                      <Button disabled>Đã huỷ</Button>
                    ) : (
                      <AuthWrapper
                        acceptPermissions={[PurchaseOrderPermission.procurements_confirm]}
                      >
                        <Button
                          onClick={() => {
                            console.log(item);
                            
                            confirmInventory(item, false)
                          }}
                          type="primary"
                        >
                          Xác nhận nhập
                        </Button>
                      </AuthWrapper>
                    )}
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

export default TabConfirmed;
