import {Form, Table } from "antd";
import { POField } from "model/purchase-order/po-field";
import {
  POProcumentField,
  PurchaseProcument,
} from "model/purchase-order/purchase-procument";
import { ProcumentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";
import {
  HiChevronDoubleRight,
  HiOutlineChevronDoubleDown,
} from "react-icons/hi";
import imgDefIcon from "assets/img/img-def.svg";
import { formatCurrency } from "utils/AppUtils";

type TabInventoryProps = {};
const TabInvetory: React.FC<TabInventoryProps> = (props: TabInventoryProps) => {
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
                (item) => item.status === ProcumentStatus.RECEIVED
              )
            : [];
        return (
          <Table
            locale={{
              emptyText: "Không có phiếu nhập kho",
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
            expandable={{
              expandIcon: (props) => {
                let icon = <HiChevronDoubleRight size={12} />;
                if (props.expanded) {
                  icon = (
                    <HiOutlineChevronDoubleDown size={12} color="#2A2A86" />
                  );
                }
                return (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={(event) => props.onExpand(props.record, event)}
                  >
                    {icon}
                  </div>
                );
              },
              expandedRowRender: (record) => (
                <div className="row-expand">
                  {record.procurement_items.map((item, index) => (
                    <div className="item">
                      <div className="item-col">{index + 1}</div>
                      <div className="item-col item-col-img">
                        <div className="product-item-image">
                          <img
                            src={
                              item.variant_image === null
                                ? imgDefIcon
                                : item.variant_image
                            }
                            alt=""
                            className=""
                          />
                        </div>
                      </div>
                      <div className="item-col item-col-name">
                        <div className="product-item-sku">{item.sku}</div>
                        <div className="product-item-name">
                          <span className="product-item-name-detail">
                            {item.variant}
                          </span>
                        </div>
                      </div>
                      <div className="item-col item-col-number">
                        {item.quantity}
                      </div>
                      <div
                        style={{ color: "#27AE60", fontWeight: 700 }}
                        className="item-col item-col-number"
                      >
                        {item.real_quantity}
                      </div>
                      <div className="item-col item-col-empty" />
                    </div>
                  ))}
                </div>
              ),
            }}
            columns={[
              {
                align: "left",
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
                render: (value, item, index) => <div>{value}</div>,
              },
              {
                title: "Kho nhận hàng",
                dataIndex: POProcumentField.store,
                align: "left",
                render: (value, item, index) => <div>{value}</div>,
              },
              {
                title: "Ngày nhận hàng thực tế",
                dataIndex: POProcumentField.stock_in_date,
                align: "center",
                render: (value: string, item, index: number) =>
                  ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
              },

              {
                align: "right",
                width: 200,
                title: "SL Nhận hàng được duyệt",
                dataIndex: "procurement_items",
                render: (value, item, index: number) =>
                  formatCurrency(POUtils.totalQuantity(value),"."),
              },
              {
                align: "right",
                width: 200,
                title: <div style={{ color: "#27AE60" }}>SL Thực nhận</div>,
                dataIndex: "procurement_items",
                render: (value, item, index: number) => (
                  <div style={{ color: "#27AE60", fontWeight: 700 }}>
                    {formatCurrency(POUtils.totalRealQuantityProcument(value),".")}
                  </div>
                ),
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
};

export default TabInvetory;
