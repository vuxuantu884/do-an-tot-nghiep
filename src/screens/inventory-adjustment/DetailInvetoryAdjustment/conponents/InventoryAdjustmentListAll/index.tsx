import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  InventoryAdjustmentDetailItem,
  LineItemAdjustment,
} from "model/inventoryadjustment";
import { Col, Input, Radio, Row, Space, Table, Tooltip } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import {PurchaseOrderLineItem} from "model/purchase-order/purchase-item.model";
import {Link} from "react-router-dom";
import { InventoryTabUrl } from "config/url.config";
import {useDispatch} from "react-redux";
import {
  getLinesItemAdjustmentAction,
} from "domain/actions/inventory/inventory-adjustment.action";
import {showSuccess} from "utils/ToastUtils";
import {
  STATUS_INVENTORY_ADJUSTMENT_CONSTANTS,
} from "screens/inventory-adjustment/constants";
import {
  CodepenOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {ICustomTableColumType} from "component/table/CustomTable";
import useAuthorization from "hook/useAuthorization";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import CustomPagination from "component/table/CustomPagination";
import { PageResponse } from "model/base/base-metadata.response";
import _ from "lodash";
import { formatCurrency } from "../../../../../utils/AppUtils";
import EditNote from "screens/order-online/component/edit-note";
import { callApiNative } from "utils/ApiUtils";
import {
  updateOnHandItemOnlineInventoryApi,
  updateReasonItemOnlineInventoryApi,
} from "service/inventory/adjustment/index.service";
import { searchVariantsApi } from "service/product/product.service";
import { STATUS_INVENTORY_ADJUSTMENT } from "../../../ListInventoryAdjustment/constants";

const arrTypeNote = [
  {key: 1,value: "XNK sai quy trình"},
  {key: 2,value: "Sai trạng thái đơn hàng"},
  {key: 3,value: "Thất thoát"},
]

type propsInventoryAdjustment = {
  data: InventoryAdjustmentDetailItem;
  idNumber: number,
  objSummaryTableByAuditTotal: any,
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

  const [loadingTable, setLoadingTable] = useState(false);
  const [keySearch, setKeySearch] = useState<string>("");
  const dispatch = useDispatch();

  const {data, idNumber, objSummaryTableByAuditTotal} = props;

  //phân quyền
  const [allowUpdate] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.update],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceChangeReason = () => {
    showSuccess("Nhập lý do thành công.");
  };

  const onChangeReason = useCallback(
    (value: string | null, row: LineItemAdjustment, dataItems: PageResponse<LineItemAdjustment>) => {
      row.note = value;

      dataItems.items.forEach((e)=>{
        if (e.variant_id === row.id) {
          e.note = row.note;
        }
      });

      setDataLinesItem({...dataItems});
      debounceChangeReason();
    },
    [debounceChangeReason]
  );

  const handleNoteChange = useCallback(async (index:number, newValue: string,item: LineItemAdjustment) => {
    const value = newValue;
    if (value && value.indexOf('##') !== -1) {
      return;
    }

    item.note = value ?? "";
    if (item.note) {
      item.note = item.note.substring(item.note.lastIndexOf("#")+1,item.note.length);
    }

    const res = await callApiNative({isShowError: false},dispatch, updateReasonItemOnlineInventoryApi,data?.id ?? 0,item.id,item);

    if (res) {
      onChangeReason(item.note, item, dataLinesItem);
    }
  },[dispatch, data?.id, onChangeReason, dataLinesItem]);

  const reloadOnHand = async (item: any) => {
    setLoadingTable(true);
    const product = await callApiNative({ isShowError: true }, dispatch, searchVariantsApi, {
      status: "active",
      store_ids: data.store.id,
      variant_ids: item.variant_id,
    })

    if (product) {
      const res = await callApiNative({isShowError: false}, dispatch, updateOnHandItemOnlineInventoryApi,data?.id ?? 0, item.id, {
        on_hand: product?.items.length > 0 ? product?.items[0].on_hand : 0
      });

      if (res) {
        showSuccess("Cập nhật tồn trong kho thành công");
        getLinesItemAdjustment(dataLinesItem.metadata.page, dataLinesItem.metadata.limit, '');
      }
    } else {
      setLoadingTable(false);
    }
  };

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_image",
      render: (value: string) => {
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
      render: (value: string, record: PurchaseOrderLineItem) => (
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
            <div>Tổng tồn</div>
            <div>({objSummaryTableByAuditTotal.totalStock ? formatCurrency(objSummaryTableByAuditTotal.totalStock) : 0})</div>
          </>
        );
      },
      width: 80,
      align: "center",
      dataIndex: "total_stock",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Đang giao</div>
            <div>({objSummaryTableByAuditTotal.totalShipping ? formatCurrency(objSummaryTableByAuditTotal.totalShipping) : 0})</div>
          </>
        );
      },
      width: 80,
      align: "center",
      dataIndex: "shipping",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Đang chuyển đi</div>
            <div>({objSummaryTableByAuditTotal.totalOnWay ? formatCurrency(objSummaryTableByAuditTotal.totalOnWay) : 0})</div>
          </>
        );
      },
      width: 80,
      align: "center",
      dataIndex: "on_way",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Tồn trong kho</div>
            <div>({formatCurrency(objSummaryTableByAuditTotal.onHand)})</div>
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
            <div>Số kiểm</div>
            <div>({formatCurrency(objSummaryTableByAuditTotal.realOnHand)})</div>
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
              {objSummaryTableByAuditTotal.totalExcess === 0 || !objSummaryTableByAuditTotal.totalExcess ? (
                ""
              ) : (
                <div style={{color: "#27AE60"}}>+{formatCurrency(objSummaryTableByAuditTotal.totalExcess)}</div>
              )}
              {objSummaryTableByAuditTotal.totalExcess && objSummaryTableByAuditTotal.totalMissing ? (
                <Space>/</Space>
              ) : (
                ""
              )}
              {objSummaryTableByAuditTotal.totalMissing === 0 ? (
                ""
              ) : (
                <div style={{ color: "red" }}>{formatCurrency(objSummaryTableByAuditTotal.totalMissing)}</div>
              )}
            </Row>
          </>
        );
      },
      align: "center",
      width: 200,
      render: (value, item) => {
        if (!item.on_hand_adj && item.on_hand_adj === 0) {
          return null;
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{color: "red"}}>{item.on_hand_adj}</div>;
        } else {
          return <div style={{color: "green"}}>{item.on_hand_adj ? `+${item.on_hand_adj}` : ''}</div>;
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
            <Radio.Group className="custom-radio-group" value={note} buttonStyle="solid" onChange={(e)=>{
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
                 <EditNote
                   isGroupButton
                   note={tooltip}
                   title=""
                   onOk={(newNote) => {
                     handleNoteChange(index, newNote, row).then();
                   }}
                 />
              </Tooltip>
          </Radio.Group>
          );
        }
        return value || "";
      },
    },
    {
      title: "",
      fixed: dataLinesItem?.items.length !== 0 && "right",
      width: 30,
      render: (value: string, row) => {
        return <>
          {data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status && (
            <ReloadOutlined title="Cập nhật lại tồn trong kho" onClick={() => reloadOnHand(row)} />
          )}
        </>
      }
    },
  ];

  const onResultDataTable = useCallback(
    (result: PageResponse<LineItemAdjustment> | false) => {
      setLoadingTable(false);
      if (result) {
        setDataLinesItem({...result});
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps,
    []
  );

  const getLinesItemAdjustment = useCallback((page: number,size: number, keySearch: string|null)=>{
    setTimeout(() => {
      dispatch(
        getLinesItemAdjustmentAction(
          idNumber,
          `page=${page}&limit=${size}&type=total&condition=${keySearch?.toString()}`,
          onResultDataTable
        )
      );
    }, 0);
  },[idNumber, dispatch, onResultDataTable]);

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
    getLinesItemAdjustment(dataLinesItem.metadata.page,dataLinesItem.metadata.limit, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, []);

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
        loading={loadingTable}
        rowClassName="product-table-row"
        style={{paddingTop: 16}}
        pagination={false}
        columns={defaultColumns}
        sticky
        scroll={{
          x: 'max-content',
        }}
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
