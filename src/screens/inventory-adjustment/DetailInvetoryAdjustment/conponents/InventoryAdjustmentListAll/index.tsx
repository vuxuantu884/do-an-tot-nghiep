import {useCallback, useEffect, useMemo, useState} from "react";
import {
  InventoryAdjustmentDetailItem,
  LineItemAdjustment,
} from "model/inventoryadjustment";
import {Col, Input, Row, Space, Table} from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import {PurchaseOrderLineItem} from "model/purchase-order/purchase-item.model";
import {Link} from "react-router-dom";
import { InventoryTabUrl } from "config/url.config";
import {useDispatch} from "react-redux";
import {getLinesItemAdjustmentAction, updateItemOnlineInventoryAction} from "domain/actions/inventory/inventory-adjustment.action";
import {showSuccess} from "utils/ToastUtils";
import {STATUS_INVENTORY_ADJUSTMENT_CONSTANTS} from "screens/inventory-adjustment/constants";
import {SearchOutlined} from "@ant-design/icons";
import {ICustomTableColumType} from "component/table/CustomTable";
import useAuthorization from "hook/useAuthorization";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import CustomPagination from "component/table/CustomPagination";
import { PageResponse } from "model/base/base-metadata.response";
import _ from "lodash";
const {TextArea} = Input;

type propsInventoryAdjustment = {
  data: InventoryAdjustmentDetailItem;
  idNumber: number,
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
  const [dataLinesItem, setDataLinesItem] = useState<PageResponse<LineItemAdjustment>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  }); 
  

  const [objSummaryTable, setObjSummaryTable] = useState<Summary>({
    TotalExcess: 0,
    TotalMiss: 0,
    TotalOnHand: 0,
    TotalRealOnHand: 0,
  });

  const [keySearch, setKeySearch] = useState<string>("");
  const dispatch = useDispatch();

  const {data, idNumber} = props;


  //phân quyền
  const [allowUpdate] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.update],
  }); 

  const drawColumns = useCallback((data: Array<LineItemAdjustment>) => {
    let totalExcess = 0,
      totalMiss = 0,
      totalQuantity = 0,
      totalReal = 0;
    data?.forEach((element: LineItemAdjustment) => {
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
      width: 135,
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
      width: 120,
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
                onChangeReason(e.target.value, row, dataLinesItem);
              }}  
            />
          );
        }
        return value || "";
      },
    },
  ];

  const onResultDataTable = useCallback(
    (result: PageResponse<LineItemAdjustment> | false) => {
      if (result) { 
        setDataLinesItem({...result}); 
      }
    },
    []
  );

  const getLinesItemAdjustment= useCallback((page: number,size: number, keySearch: string|null)=>{
    dispatch(
      getLinesItemAdjustmentAction(
        idNumber,
        `page=${page}&limit=${size}&type=total&condition=${keySearch?.toString()}`,
        onResultDataTable
      )
    );
  },[idNumber,  dispatch, onResultDataTable]);

  const debounceChangeReason = useMemo(()=>
  _.debounce((row: LineItemAdjustment, dataItems: PageResponse<LineItemAdjustment>)=>{ 

    dispatch(
      updateItemOnlineInventoryAction(data?.id, row, (result) => {
        if (result) {
          showSuccess("Nhập lý do thành công.");
          getLinesItemAdjustment(1,30,keySearch);
        }
      })
    );
    
}, 1000),
[data, dispatch, getLinesItemAdjustment, keySearch]
);

const onChangeReason = useCallback(
  (value: string | null, row: LineItemAdjustment, dataItems: PageResponse<LineItemAdjustment>) => {
    row.note = value;  

    dataItems.items.forEach((e)=>{
      if (e.variant_id === row.id) {
        e.note = row.note;
      }
    }); 

    setDataLinesItem({...dataItems});
    debounceChangeReason(row, dataLinesItem);
  },
  [debounceChangeReason, dataLinesItem]
);

  const onPageChange = useCallback(
    (page, size) => {
      getLinesItemAdjustment(page,size, keySearch);
    },
    [keySearch, getLinesItemAdjustment]
  );

  useEffect(() => {
    getLinesItemAdjustment(1,30, "");
  }, [getLinesItemAdjustment]);

  useEffect(() => {
    drawColumns(dataLinesItem.items);
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
                }
              }}
              style={{marginLeft: 8}}
              placeholder="Tìm kiếm sản phẩm trong phiếu"
              addonAfter={
                <SearchOutlined
                  onClick={() => {
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
        style={{paddingTop: 16}}
        pagination={false}
        columns={defaultColumns}
        dataSource={dataLinesItem.items} 
      />
      <CustomPagination
       pagination={{
         pageSize: dataLinesItem.metadata.limit,
         total: dataLinesItem.metadata.total,
         current: dataLinesItem.metadata.page,
         showSizeChanger: true,
         onChange: onPageChange,
         onShowSizeChange: onPageChange,
       }}
      >
        </CustomPagination>
    </>
  );
};

export default InventoryAdjustmentListAll;
