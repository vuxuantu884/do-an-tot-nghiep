import { useCallback, useEffect, useState } from "react";
import { InventoryAdjustmentDetailItem, LineItemAdjustment } from "model/inventoryadjustment";
import { Col, Input, Row, Space, Table } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { ColumnsType } from "antd/es/table/interface";
import { VariantResponse } from "model/product/product.model";
import { useDispatch } from "react-redux";
import _ from "lodash";
import { updateItemOnlineInventoryAction } from "domain/actions/inventory/inventory-adjustment.action";
import { showSuccess } from "utils/ToastUtils";
import { STATUS_INVENTORY_ADJUSTMENT_CONSTANTS } from "screens/inventory-adjustment/constants";

type propsInventoryAdjustment = {
  data: InventoryAdjustmentDetailItem;
};

const InventoryAdjustmentHistory: React.FC<propsInventoryAdjustment> = (props: propsInventoryAdjustment) => {
  const [editReason, setEditReason] = useState<boolean | any>(false)
  const [dataTable, setDataTable] = useState<Array<LineItemAdjustment> | any>(
    [] as Array<LineItemAdjustment>
  );
  const dispatch = useDispatch();
  const {
    data,
  } = props;

  const onEnterFilterVariant = useCallback(() => {

  }, []);


  const onChangeReason = (value: string | null, index: number) => {
    const dataTableClone = _.cloneDeep(dataTable);
    dataTableClone[index].note = value;
    setEditReason(true);

    setDataTable(dataTableClone);
  }

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: string, record: VariantResponse, index: number) =>
        index + 1,
    },
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_image",
      render: (value: string, record: any) => {
        return (
          <div className="product-item-image">
            <img src={value ? value : imgDefIcon} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: () => {
        return <div>
          <div>Sản phẩm</div>
        </div>
      },
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: VariantResponse, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/inventory#3?condition=${record.sku}&store_ids${data?.adjusted_store_id}&page=1`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tồn trong kho",
      width: 120,
      align: "right",
      dataIndex: "on_hand",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "Tồn thực tế",
      dataIndex: "real_on_hand",
      align: "right",
      width: 120,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "Thừa/Thiếu",
      align: "center",
      width: 120,
      render: (value, item, index: number) => {
        if (!item.on_hand_adj && item.on_hand_adj === 0) {
          return null
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{ color: 'red' }}>{item.on_hand_adj}</div>;
        }
        else {
          return <div style={{ color: 'green' }}>+{item.on_hand_adj}</div>;
        }
      }
    },
    {
      title: "Lý do",
      dataIndex: "note",
      align: "left",
      width: 200,
      render: (value: string, row, index: number) => {
        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.AUDITED) {
          return <Input
            placeholder="Lý do lệch tồn"
            id={`item-reason-${index}`}
            value={value ? value : ""}
            onChange={(e) => {
              onChangeReason(e.target.value, index);
            }}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                dispatch(updateItemOnlineInventoryAction(data?.id, dataTable[index], (result) => {
                  showSuccess("Nhập lý do thành công.");
                }));
              }
            }}
            onBlur={(e) => {
              if (editReason) {
                dispatch(updateItemOnlineInventoryAction(data?.id, dataTable[index], (result) => {
                  showSuccess("Nhập lý do thành công.");
                }));
                setEditReason(false);
              }
            }}
          />
        }
        return value || "";
      },
    },
  ];

  useEffect(() => {
    let dataDis = data.line_items?.filter(e => e.on_hand_adj !== 0) || [];
    setDataTable(dataDis);

  }, [data]);

  return (
    <>
      {/* Tìm kiếm */}
      <Row style={{ marginTop: 8, paddingLeft: 0 }}>
        <Col span={16}>
          <Input.Group className="display-flex">
            <Input
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  onEnterFilterVariant();
                }
              }}
              style={{ marginLeft: 8 }}
              placeholder="Tìm kiếm sản phẩm trong phiếu"
            />
          </Input.Group>
        </Col>
      </Row>

      {/* Danh sách */}
      <Table
        rowClassName="product-table-row"
        tableLayout="fixed"
        style={{ paddingTop: 16 }}
        scroll={{ y: 300 }}
        pagination={false}
        columns={columns}
        dataSource={dataTable}
        summary={() => {
          let totalExcess = 0, totalMiss = 0,
            totalQuantity = 0, totalReal = 0;
          dataTable.forEach((element: LineItemAdjustment) => {
            totalQuantity += element.on_hand;
            totalReal += element.real_on_hand ?? 0;
            if (element.on_hand_adj > 0) {
              totalExcess += element.on_hand_adj;
            } if (element.on_hand_adj < 0) {
              totalMiss += -element.on_hand_adj;
            }
          });


          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                </Table.Summary.Cell>
                <Table.Summary.Cell align={"left"} index={2}>
                  <b>Tổng:</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell align={"right"} index={3}>
                  {totalQuantity}
                </Table.Summary.Cell>
                <Table.Summary.Cell align={"right"} index={4}>
                  {totalReal}
                </Table.Summary.Cell>
                <Table.Summary.Cell align={"center"} index={5}>
                  <Space>
                    {
                      totalExcess === 0 ? null :
                        <div style={{ color: '#27AE60' }}>
                          +{totalExcess}</div>
                    }
                    {totalExcess && totalMiss ? <Space>/</Space> : null}
                    {
                      totalMiss === 0 ? null :
                        <div style={{ color: 'red' }}>
                          -{totalMiss}</div>
                    }
                  </Space>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )
        }}
      />
    </>
  );
};

export default InventoryAdjustmentHistory;
