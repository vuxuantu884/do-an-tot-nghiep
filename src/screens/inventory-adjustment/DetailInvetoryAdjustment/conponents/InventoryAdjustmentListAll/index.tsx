import {useCallback, useEffect, useState} from "react";
import {
  InventoryAdjustmentDetailItem,
  LineItemAdjustment,
} from "model/inventoryadjustment";
import {Col, Input, Row, Space, Table} from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import {PurchaseOrderLineItem} from "model/purchase-order/purchase-item.model";
import {Link} from "react-router-dom";
import { InventoryTabUrl } from "config/url.config";
import _ from "lodash";
import {useDispatch} from "react-redux";
import {updateItemOnlineInventoryAction} from "domain/actions/inventory/inventory-adjustment.action";
import {showSuccess} from "utils/ToastUtils";
import {STATUS_INVENTORY_ADJUSTMENT_CONSTANTS} from "screens/inventory-adjustment/constants";
import {SearchOutlined} from "@ant-design/icons";
import {ICustomTableColumType} from "component/table/CustomTable";
import useAuthorization from "hook/useAuthorization";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
const {TextArea} = Input;

type propsInventoryAdjustment = {
  data: InventoryAdjustmentDetailItem;
  dataLinesItem: Array<LineItemAdjustment>;
};

export interface Summary {
  TotalExcess: number | 0;
  TotalMiss: number | 0;
  TotalOnHand: number | 0;
  TotalRealOnHand: number | 0;
}

const InventoryAdjustmentListAll: React.FC<propsInventoryAdjustment> = (
  props: propsInventoryAdjustment
) => {
  const [dataTable, setDataTable] = useState<Array<LineItemAdjustment> | any>(
    [] as Array<LineItemAdjustment>
  );
  const [searchVariant, setSearchVariant] = useState<Array<LineItemAdjustment> | any>(
    [] as Array<LineItemAdjustment>
  );
  
  const [editReason, setEditReason] = useState<boolean | any>(false);

  const [objSummaryTable, setObjSummaryTable] = useState<Summary>({
    TotalExcess: 0,
    TotalMiss: 0,
    TotalOnHand: 0,
    TotalRealOnHand: 0,
  });

  const [keySearch, setKeySearch] = useState<string>("");
  const dispatch = useDispatch();

  const {data, dataLinesItem} = props;

  const onEnterFilterVariant = useCallback(
    (lst: Array<LineItemAdjustment> | null) => {
      let temps = lst ? lst : dataTable;
      let key = keySearch.toLocaleLowerCase();
      let dataSearch = [
        ...temps.filter((e: LineItemAdjustment) => {
          return (
            e.on_hand === parseInt(key) ||
            e.variant_name?.toLocaleLowerCase().includes(key) ||
            e.sku?.toLocaleLowerCase().includes(key) ||
            e.code?.toLocaleLowerCase().includes(key) ||
            e.barcode?.toLocaleLowerCase().includes(key)
          );
        }),
      ];

      setSearchVariant(dataSearch);
    },
    [keySearch, dataTable]
  );

  //phân quyền
  const [allowUpdate] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.update],
  });

  const onChangeReason = useCallback(
    (value: string | null, row: LineItemAdjustment, index: number) => {
      const dataTableClone: Array<LineItemAdjustment> = _.cloneDeep(dataTable);

      dataTableClone.forEach((item) => {
        if (item.id === row.id) {
          value = value ?? "";
          item.note = value;
        }
      }); 

      let dataEdit =
        (searchVariant && searchVariant.length > 0) || keySearch !== ""
          ? [...dataTableClone]
          : null;

      setDataTable(dataTableClone);
      setSearchVariant(dataTableClone);
      setEditReason(true);

      onEnterFilterVariant(dataEdit);
    },
    [searchVariant, keySearch, dataTable, onEnterFilterVariant]
  );

  const drawColumns = useCallback((data: Array<LineItemAdjustment> | any) => {
    let totalExcess = 0,
      totalMiss = 0,
      totalQuantity = 0,
      totalReal = 0;
    data.forEach((element: LineItemAdjustment) => {
      totalQuantity += element.on_hand;
      totalReal += parseInt(element.real_on_hand.toString()) ?? 0;
      let on_hand_adj = element.on_hand_adj ?? 0;
      if (on_hand_adj > 0) {
        totalExcess += on_hand_adj;
      }
      if (on_hand_adj < 0) {
        totalMiss += -on_hand_adj;
      }
    });

    setObjSummaryTable({
      TotalOnHand: totalQuantity,
      TotalExcess: totalExcess,
      TotalMiss: totalMiss,
      TotalRealOnHand: totalReal,
    });
  }, []);

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) => index + 1,
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
      title: "Sản phẩm",
      width: "200px",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: PurchaseOrderLineItem, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${InventoryTabUrl.HISTORIES}?condition=${record.sku}&store_ids=${data?.adjusted_store_id}&page=1`}
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
      title: () => {
        return (
          <>
            <div>Tồn trong kho</div>
            <div>{objSummaryTable.TotalOnHand}</div>
          </>
        );
      },
      width: 120,
      align: "center",
      dataIndex: "on_hand",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Tồn thực tế</div>
            <div>{objSummaryTable.TotalRealOnHand}</div>
          </>
        );
      },
      dataIndex: "real_on_hand",
      align: "center",
      width: 110,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Thừa/Thiếu</div>
            <Row align="middle" justify="center">
              {objSummaryTable.TotalExcess === 0 ? (
                ""
              ) : (
                <div style={{color: "#27AE60"}}>+{objSummaryTable.TotalExcess}</div>
              )}
              {objSummaryTable.TotalExcess && objSummaryTable.TotalMiss ? (
                <Space>/</Space>
              ) : (
                ""
              )}
              {objSummaryTable.TotalMiss === 0 ? (
                ""
              ) : (
                <div style={{color: "red"}}>-{objSummaryTable.TotalMiss}</div>
              )}
            </Row>
          </>
        );
      },
      align: "center",
      width: 200,
      render: (value, item, index: number) => {
        if (!item.on_hand_adj && item.on_hand_adj === 0) {
          return null;
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{color: "red"}}>{item.on_hand_adj}</div>;
        } else {
          return <div style={{color: "green"}}>+{item.on_hand_adj}</div>;
        }
      },
    },
    {
      title: "Lý do",
      dataIndex: "note",
      align: "left",
      width: 200,
      render: (value: string, row: LineItemAdjustment, index: number) => {
        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.AUDITED && allowUpdate) {
          return (
            <TextArea
              placeholder="Lý do lệch tồn"
              id={`item-reason-${index}`}
              value={value ? value : ""}
              maxLength={250}
              onChange={(e) => {
                onChangeReason(e.target.value, row, index);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  row.note = event.currentTarget.value;

                  dispatch(
                    updateItemOnlineInventoryAction(data?.id, row, (result) => {
                      if (result) {
                        showSuccess("Nhập lý do thành công.");
                      }
                    })
                  );
                }
              }}
              onBlur={(e) => {
                if (editReason) {
                  dispatch(
                    updateItemOnlineInventoryAction(
                      data?.id,
                      dataTable[index],
                      (result) => {
                        showSuccess("Nhập lý do thành công.");
                      }
                    )
                  );
                  setEditReason(false);
                }
              }}
            />
          );
        }
        return value || "";
      },
    },
  ];

  useEffect(() => {
    setDataTable(dataLinesItem);
    setSearchVariant(dataLinesItem);
    drawColumns(dataLinesItem);
  }, [dataLinesItem, drawColumns]);

  return (
    <>
      {/* Tìm kiếm */}
      <Row style={{marginTop: 8, paddingLeft: 0}}>
        <Col span={24}>
          <Input.Group className="display-flex">
            <Input
              value={keySearch}
              onChange={(e) => {
                setKeySearch(e.target.value);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onEnterFilterVariant(null);
                }
              }}
              style={{marginLeft: 8}}
              placeholder="Tìm kiếm sản phẩm trong phiếu"
              addonAfter={
                <SearchOutlined
                  onClick={() => {
                    onEnterFilterVariant(null);
                  }}
                  style={{color: "#2A2A86"}}
                />
              }
            />
          </Input.Group>
        </Col>
      </Row>

      {/* Danh sách */}
      <Table
        rowClassName="product-table-row"
        tableLayout="fixed"
        style={{paddingTop: 16}}
        scroll={{y: 300}}
        pagination={false}
        columns={defaultColumns}
        dataSource={
          searchVariant && (searchVariant.length > 0 || keySearch !== "")
            ? searchVariant
            : dataTable
        }
      />
    </>
  );
};

export default InventoryAdjustmentListAll;
