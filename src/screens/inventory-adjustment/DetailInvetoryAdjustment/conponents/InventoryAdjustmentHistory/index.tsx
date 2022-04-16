import {useCallback, useEffect, useMemo, useState} from "react";
import {
  InventoryAdjustmentDetailItem,
  LineItemAdjustment,
} from "model/inventoryadjustment";
import {Col, Input, Radio, Row, Space, Table, Tooltip} from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import {Link} from "react-router-dom";
import { InventoryTabUrl } from "config/url.config";
import {VariantResponse} from "model/product/product.model";
import {useDispatch} from "react-redux";
import _ from "lodash";
import {STATUS_INVENTORY_ADJUSTMENT_CONSTANTS} from "screens/inventory-adjustment/constants";
import {CodepenOutlined, InfoCircleOutlined, PieChartOutlined, SearchOutlined, UserSwitchOutlined} from "@ant-design/icons";
import {ICustomTableColumType} from "component/table/CustomTable";
import useAuthorization from "hook/useAuthorization";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import { PageResponse } from "model/base/base-metadata.response";
import CustomPagination from "component/table/CustomPagination";
import { callApiNative } from "utils/ApiUtils";
import { getLinesItemAdjustmentApi, updateReasonItemOnlineInventoryApi } from "service/inventory/adjustment/index.service";
import EditNote from "screens/order-online/component/edit-note";

type propsInventoryAdjustment = {
  data: InventoryAdjustmentDetailItem;
  idNumber: number;
};

const arrTypeNote = [
  {key: 1,value: "XNK sai quy trình"},
  {key: 2,value: "Sai trạng thái đơn hàng"},
  {key: 3,value: "Thất thoát"},
]

export interface Summary {
  TotalExcess: number | 0;
  TotalMiss: number | 0;
  TotalOnHand: number | 0;
  TotalRealOnHand: number | 0;
}

const InventoryAdjustmentHistory: React.FC<propsInventoryAdjustment> = (
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

  const [keySearch, setKeySearch] = useState<string | any>("");

  const dispatch = useDispatch();
  const {data, idNumber} = props;

  //phân quyền
  const [allowUpdate] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.update],
  }); 

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

  const getLinesItemAdjustment= useCallback(async (page: number,size: number, keySearch: string|null)=>{

    const res = await callApiNative(
      { isShowError: false },
      dispatch,
      getLinesItemAdjustmentApi,
      idNumber,
      `page=${page}&limit=${size}&type=deviant&condition=${keySearch?.toString()}`
    );
    if (res) {
      setDataLinesItem({...res}); 
     } 
  },[idNumber,  dispatch]);

  const onChangeReason = (value: string | null, row: LineItemAdjustment, dataItems: PageResponse<LineItemAdjustment>) => {
    row.note = value;  

    dataItems.items.forEach((e)=>{
      if (e.variant_id === row.id) {
        e.note = row.note;
      }
    }); 

    setDataLinesItem({...dataItems});
  }
  
  const handleNoteChange = useCallback(async (index:number, newValue: string,item: LineItemAdjustment) => {
    const value = newValue;
    if (value && value.indexOf('##') !== -1) {
      return;
    }
   
    item.note = value ?? "";
    if (item.note) {
      item.note = item.note.substring(item.note.lastIndexOf("#")+1,item.note.length);
    }
    
    const res = await callApiNative({isShowError: false},dispatch,updateReasonItemOnlineInventoryApi,data?.id ?? 0,item.id,item);
    
    if (res) {
      onChangeReason(item.note, item, dataLinesItem);
    }
  },[dataLinesItem,dispatch,data]);


  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: string, record: VariantResponse, index: number) => index + 1,
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
      render: (value: string, record: VariantResponse, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">
              {record.sku}
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">
                <Link
                target="_blank"
                to={`${InventoryTabUrl.HISTORIES}?condition=${record.sku}&store_ids=${data?.adjusted_store_id}&page=1`}
              >
                {value}
              </Link>
                </span>
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
      width: 145,
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
      width: 125,
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
      title: <div>
        Lý do <Tooltip title={
        <div>
          <div>1.XNK sai quy trình</div>
          <div>2.Sai trạng thái đơn hàng</div>
          <div>3.Thất thoát</div>
        </div>
      }><InfoCircleOutlined type="primary" color="primary" /></Tooltip>
      </div>,
      dataIndex: "note",
      align: "left",
      width: 225,
      render: (value, row: LineItemAdjustment, index: number) => {
        let note = `${index}#${value}`;
        let tooltip = null;
        
        if (!arrTypeNote.find(e=>e.value === value)) {
          note = `${index}##${value}`;
          tooltip= value;
        }
        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.AUDITED && allowUpdate) {
          return (
            <Radio.Group value={note} buttonStyle="solid" onChange={(e)=>{
              handleNoteChange(index,e.target.value,row);
            }}>
              <Tooltip placement="topLeft" title={arrTypeNote[0].value}>
                <Radio.Button style={{paddingLeft: 12,paddingRight:12}} value={`${index}#${arrTypeNote[0].value}`}>
                  <UserSwitchOutlined />
                </Radio.Button>
              </Tooltip>
               <Tooltip placement="topLeft" title={arrTypeNote[1].value}>
                <Radio.Button style={{paddingLeft: 12,paddingRight:12}} value={`${index}#${arrTypeNote[1].value}`}>
                  <CodepenOutlined />
                </Radio.Button>
              </Tooltip>
               <Tooltip placement="topLeft" title={arrTypeNote[2].value}>
                <Radio.Button style={{paddingLeft: 12,paddingRight:12}} value={`${index}#${arrTypeNote[2].value}`}>
                  <PieChartOutlined />
                </Radio.Button>
              </Tooltip>
               <Tooltip placement="topLeft" title={tooltip}>
                <Radio.Button
                  style={{paddingLeft: 8,paddingRight:8}}
                  value={`${index}##${value}`}>
                  <EditNote
                    note={tooltip}
                    title=""
                    onOk={(newNote) => {
                      handleNoteChange(index,newNote,row);
                    }}
                /></Radio.Button>
              </Tooltip>
          </Radio.Group>
          );
        }
        return value || "";
      },
    },
  ];

  const onPageChange = useCallback(
    (page, size) => {
      getLinesItemAdjustment(page,size, keySearch);
    },
    [keySearch, getLinesItemAdjustment]
  );

  const onEnterFilterVariant = useCallback(
    (code: string) => {
      getLinesItemAdjustment(1,30,code);
    },
    [getLinesItemAdjustment]
  );

  const debounceSearchVariant = useMemo(()=>
    _.debounce((code: string)=>{
      onEnterFilterVariant(code);
  }, 300),
  [onEnterFilterVariant]
 );

  const onChangeKeySearch = useCallback((code: string)=>{
    debounceSearchVariant(code);
  },[debounceSearchVariant]); 

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
                onChangeKeySearch(e.target.value);
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
        dataSource={dataLinesItem.items?.filter(e=>e.on_hand_adj !== 0)}
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

export default InventoryAdjustmentHistory;
