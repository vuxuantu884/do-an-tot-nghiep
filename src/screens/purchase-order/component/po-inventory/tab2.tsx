import { Form, Table } from "antd";
import { POField } from "model/purchase-order/po-field";
import { POProcumentField, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { ProcumentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";
import { HiChevronDoubleRight, HiOutlineChevronDoubleDown } from "react-icons/hi";
import imgDefIcon from "assets/img/img-def.svg";
import { formatCurrency } from "utils/AppUtils";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { Link } from "react-router-dom";
import styled from "styled-components";

type TabInventoryProps = {
  poId?: number;
};
const TabInvetory: React.FC<TabInventoryProps> = (props: TabInventoryProps) => {
  return (
    <StyledTabInvetory>
      <Form.Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev[POField.procurements] !== current[POField.procurements]
        }
      >
        {({ getFieldValue }) => {
          let procurements: Array<PurchaseProcument> = getFieldValue(POField.procurements);
          // let items =
          //   procurements !== undefined && procurements !== null
          //     ? procurements.filter(
          //       (item) => item.status === ProcumentStatus.RECEIVED
          //     )
          //     : [];
          const items = procurements !== undefined && procurements !== null ? procurements : [];
          // const dataSource = items.filter((item) => {
          //   return (
          //     Number(formatCurrency(POUtils.totalAcceptedQuantity(item.procurement_items))) ||
          //     Number(
          //       formatCurrency(POUtils.totalRealQuantityProcument(item.procurement_items), "."),
          //     )
          //   );
          // });
          return (
            <Table
              locale={{
                emptyText: "Không có phiếu nhập kho",
              }}
              className="product-table"
              rowKey={(record: PurchaseProcument) => (record.id ? record.id : new Date().getTime())}
              rowClassName="product-table-row"
              dataSource={items}
              tableLayout="fixed"
              scroll={{ x: 600 }}
              pagination={false}
              expandable={{
                expandIcon: (props) => {
                  let icon = <HiChevronDoubleRight size={12} />;
                  if (props.expanded) {
                    icon = <HiOutlineChevronDoubleDown size={12} color="#2A2A86" />;
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
                    {record.procurement_items
                      .filter(
                        (procurement_item) =>
                          procurement_item.planned_quantity ||
                          procurement_item.real_quantity ||
                          procurement_item.accepted_quantity,
                      )
                      .map((item, index) => (
                        <div className="item">
                          <div className="item-info-wrap">
                            <div className="item-col item-col-index">{index + 1}</div>
                            <div className="item-col item-col-img">
                              <div className="product-item-image">
                                <img
                                  src={
                                    item.variant_image === null ? imgDefIcon : item.variant_image
                                  }
                                  alt=""
                                  className=""
                                />
                              </div>
                            </div>
                            <div className="item-col item-col-name">
                              <div className="product-item-sku">{item.sku}</div>
                              <div className="product-item-name text-truncate-1">
                                <div className="product-item-name-detail">{item.variant}</div>
                              </div>
                            </div>
                          </div>
                          <div className="item-col item-col-number">
                            {item.accepted_quantity || 0}
                          </div>
                          <div
                            style={{
                              color: "#27AE60",
                              fontWeight: 700,
                              width: "120px",
                            }}
                            className="item-col item-col-number"
                          >
                            {item.real_quantity || 0}
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
                  width: 120,
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
                  render: (value, item, index) => {
                    return (
                      props.poId && (
                        <div>
                          <Link
                            to={`${UrlConfig.PURCHASE_ORDERS}/${props.poId}/procurements/${item.id}`}
                            target="_blank"
                          >
                            {value}
                          </Link>
                        </div>
                      )
                    );
                  },
                },
                {
                  title: "Kho nhận hàng",
                  dataIndex: POProcumentField.store,
                  align: "left",
                  width: 110,
                  render: (value, item, index) => <div>{value}</div>,
                },

                {
                  align: "center",
                  title: "Được duyệt",
                  dataIndex: "procurement_items",
                  width: 180,
                  render: (value, item, index: number) =>
                    formatCurrency(POUtils.totalAcceptedQuantity(value)),
                },
                {
                  align: "center",
                  width: 120,
                  title: <div style={{ color: "#27AE60" }}>Thực nhận</div>,
                  dataIndex: "procurement_items",
                  render: (value, item, index: number) => (
                    <div style={{ color: "#27AE60", fontWeight: 700 }}>
                      {formatCurrency(POUtils.totalRealQuantityProcument(value), ".")}
                    </div>
                  ),
                },
                {
                  title: "Ngày nhận hàng thực tế",
                  dataIndex: POProcumentField.stock_in_date,
                  align: "center",
                  width: 170,
                  render: (value: string, item, index: number) => {
                    return value ? ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY) : <></>;
                  },
                },
                // {
                //   title: "",
                //   dataIndex: "procurement_items",
                //   width: 40,
                //   render: () => "",
                // },
              ]}
            />
          );
        }}
      </Form.Item>
    </StyledTabInvetory>
  );
};
const StyledTabInvetory = styled.div`
  .ant-table-content::-webkit-scrollbar {
    height: 5px !important;
    background-color: #f5f5f5;
  }
`;
export default TabInvetory;
