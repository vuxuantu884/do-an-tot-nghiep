import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InventoryAdjustmentDetailItem, LineItemAdjustment } from "model/inventoryadjustment";
import { Form, Radio, Row, Space, Table, Tooltip } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { Link } from "react-router-dom";
import { InventoryTabUrl } from "config/url.config";
import { useDispatch } from "react-redux";
import {
  getLinesItemAdjustmentAction,
  updateItemOnlineInventoryAction,
} from "domain/actions/inventory/inventory-adjustment.action";
import { showSuccess } from "utils/ToastUtils";
import { STATUS_INVENTORY_ADJUSTMENT_CONSTANTS } from "screens/inventory-adjustment/constants";
import {
  CodepenOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  ReloadOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { ICustomTableColumType } from "component/table/CustomTable";
import useAuthorization from "hook/useAuthorization";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import CustomPagination from "component/table/CustomPagination";
import { PageResponse } from "model/base/base-metadata.response";
import { formatCurrency } from "utils/AppUtils";
import EditNote from "screens/order-online/component/edit-note";
import { callApiNative } from "utils/ApiUtils";
import {
  updateOnHandItemOnlineInventoryApi,
  updateReasonItemOnlineInventoryApi,
} from "service/inventory/adjustment/index.service";
import _ from "lodash";
import { searchVariantsApi } from "service/product/product.service";
import { STATUS_INVENTORY_ADJUSTMENT } from "../../../ListInventoryAdjustment/constants";
import NumberInput from "component/custom/number-input.custom";
import { OFFSET_HEADER_TABLE } from "utils/Constants";

const arrTypeNote = [
  { key: 1, value: "XNK sai quy trình" },
  { key: 2, value: "Sai trạng thái đơn hàng" },
  { key: 3, value: "Thất thoát" },
];

type propsInventoryAdjustment = {
  data: InventoryAdjustmentDetailItem;
  idNumber: number;
  keySearch: string;
  tab: string;
  isPermissionAudit: boolean;
  isPermissionEdit: boolean;
  isReSearch: boolean;
  isRerenderTab: boolean;
  tableLoading: boolean;
  objSummaryTableByAuditTotal: any;
  setIsReRender: () => void;
  setDataTab?: (value: any) => void;
  setTotalProp?: (value: number) => void;
};

export interface Summary {
  TotalExcess: number | 0;
  TotalMiss: number | 0;
  TotalOnHand: number | 0;
  TotalRealOnHand: number | 0;
}

const ADJUSTMENT_LIST_TABS = {
  DEVIANT_TAB: "1",
  TOTAL_TAB: "2"
};

const InventoryAdjustmentListAll: React.FC<propsInventoryAdjustment> = (
  props: propsInventoryAdjustment,
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
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const {
    data,
    idNumber,
    objSummaryTableByAuditTotal,
    isRerenderTab,
    tableLoading,
    keySearch,
    isPermissionAudit,
    tab,
    setIsReRender,
    setDataTab,
    isReSearch,
    isPermissionEdit,
    setTotalProp
  } = props;

  //phân quyền
  const [allowUpdate] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.update],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceChangeReason = () => {
    showSuccess("Nhập lý do thành công.");
  };

  const onChangeReason = useCallback(
    (
      value: string | null,
      row: LineItemAdjustment,
      dataItems: PageResponse<LineItemAdjustment>,
    ) => {
      row.note = value;

      dataItems.items.forEach((e) => {
        if (e.variant_id === row.id) {
          e.note = row.note;
        }
      });

      setDataLinesItem({ ...dataItems });
      debounceChangeReason();
    },
    [debounceChangeReason],
  );

  const handleNoteChange = useCallback(
    async (index: number, newValue: string, item: LineItemAdjustment) => {
      const value = newValue;
      if (value && value.indexOf("##") !== -1) {
        return;
      }

      item.note = value ?? "";
      if (item.note) {
        item.note = item.note.substring(item.note.lastIndexOf("#") + 1, item.note.length);
      }

      const res = await callApiNative(
        { isShowError: false },
        dispatch,
        updateReasonItemOnlineInventoryApi,
        data?.id ?? 0,
        item.id,
        item,
      );

      if (res) {
        onChangeReason(item.note, item, dataLinesItem);
      }
    },
    [dispatch, data?.id, onChangeReason, dataLinesItem],
  );

  const reloadOnHand = async (item: any) => {
    setLoadingTable(true);
    const product = await callApiNative({ isShowError: true }, dispatch, searchVariantsApi, {
      status: "active",
      store_ids: data.store.id,
      variant_ids: item.variant_id,
    });

    if (product) {
      const res = await callApiNative(
        { isShowError: false },
        dispatch,
        updateOnHandItemOnlineInventoryApi,
        data?.id ?? 0,
        item.id,
        {
          on_hand: product?.items.length > 0 ? product?.items[0].on_hand : 0,
          on_way: product?.items.length > 0 ? product?.items[0].on_way : 0,
          shipping: product?.items.length > 0 ? product?.items[0].shipping : 0,
        },
      );

      if (res) {
        showSuccess("Cập nhật tồn trong kho thành công");
        getLinesItemAdjustment(dataLinesItem.metadata.page, dataLinesItem.metadata.limit, "");
      }
    } else {
      setLoadingTable(false);
    }
  };

  const onRealQuantityChange = useCallback(
    (quantity: number | any, row: LineItemAdjustment) => {
      const dataTableClone: Array<LineItemAdjustment> = _.cloneDeep(dataLinesItem.items);

      dataTableClone.forEach((item) => {
        quantity = quantity ?? 0;

        if (item.id === row.id) {
          item.real_on_hand = quantity;
          let totalDiff: number;
          totalDiff = quantity - item.on_hand;
          if (totalDiff === 0) {
            item.on_hand_adj = null;
            item.on_hand_adj_dis = null;
          } else if (item.on_hand < quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `+${totalDiff}`;
          } else if (item.on_hand > quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `${totalDiff}`;
          }
        }
      });
    },
    [dataLinesItem.items],
  );

  const debounceChangeRealOnHand = useMemo(
    () =>
      _.debounce((row: LineItemAdjustment, realOnHand: number) => {
        if (row.real_on_hand === realOnHand && realOnHand !== 0) {
          return;
        }
        onRealQuantityChange(realOnHand, row);
        let value = realOnHand;
        row.real_on_hand = realOnHand;
        let totalDiff: number;
        totalDiff = value - row.on_hand;
        if (totalDiff === 0) {
          row.on_hand_adj = null;
          row.on_hand_adj_dis = null;
        } else if (row.on_hand < value) {
          row.on_hand_adj = totalDiff;
          row.on_hand_adj_dis = `+${totalDiff}`;
        } else if (row.on_hand > value) {
          row.on_hand_adj = totalDiff;
          row.on_hand_adj_dis = `${totalDiff}`;
        }
        if (!data || !data.id) {
          return null;
        }

        setLoadingTable(true);

        dispatch(
          updateItemOnlineInventoryAction(data.id, row.id, row, (result: LineItemAdjustment) => {
            setLoadingTable(false);
            if (result) {
              showSuccess("Nhập số kiểm thành công.");
              setIsReRender();
              const version = form.getFieldValue("version");
              form.setFieldsValue({ version: version + 1 });
            }
          }),
        );
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps,
    [data, dispatch, onRealQuantityChange, form, keySearch],
  );

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "Ảnh",
      align: "center",
      width: "50px",
      dataIndex: "variant_image",
      render: (value: string) => {
        return (
          <div className="product-item-image" style={{ margin: "auto" }}>
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
            <div className="number-text">
              (
              {objSummaryTableByAuditTotal.total_stock
                ? formatCurrency(objSummaryTableByAuditTotal.total_stock)
                : 0}
              )
            </div>
          </>
        );
      },
      width: 100,
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
            <div className="number-text">
              (
              {objSummaryTableByAuditTotal.total_shipping
                ? formatCurrency(objSummaryTableByAuditTotal.total_shipping)
                : 0}
              )
            </div>
          </>
        );
      },
      width: 100,
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
            <div className="number-text">
              (
              {objSummaryTableByAuditTotal.total_on_way
                ? formatCurrency(objSummaryTableByAuditTotal.total_on_way)
                : 0}
              )
            </div>
          </>
        );
      },
      width: 110,
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
            <div className="number-text">
              ({formatCurrency(objSummaryTableByAuditTotal.on_hand)})
            </div>
          </>
        );
      },
      width: 110,
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
            <div className="number-text">
              ({formatCurrency(objSummaryTableByAuditTotal.real_on_hand)})
            </div>
          </>
        );
      },
      dataIndex: "real_on_hand",
      align: "center",
      width: 100,
      render: (value, row: LineItemAdjustment) => {
        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT && allowUpdate && isPermissionEdit) {
          return (
            <NumberInput
              disabled={!isPermissionAudit}
              min={0}
              maxLength={12}
              value={value}
              onBlur={(e: any) =>
                debounceChangeRealOnHand(row, e.target.value !== "" ? e.target.value : 0)
              }
            />
          );
        } else {
          return value ?? "";
        }
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Thừa/Thiếu</div>
            <Row align="middle" justify="center">
              {objSummaryTableByAuditTotal.total_excess === 0 ||
              !objSummaryTableByAuditTotal.total_excess ? (
                ""
              ) : (
                <div style={{ color: "#27AE60" }}>
                  +{formatCurrency(objSummaryTableByAuditTotal.total_excess)}
                </div>
              )}
              {objSummaryTableByAuditTotal.total_excess &&
              objSummaryTableByAuditTotal.total_missing ? (
                <Space>/</Space>
              ) : (
                ""
              )}
              {objSummaryTableByAuditTotal.total_missing === 0 ? (
                ""
              ) : (
                <div style={{ color: "red" }}>
                  {formatCurrency(objSummaryTableByAuditTotal.total_missing)}
                </div>
              )}
            </Row>
          </>
        );
      },
      align: "center",
      width: 150,
      render: (value, item) => {
        if (!item.on_hand_adj && item.on_hand_adj === 0) {
          return null;
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{ color: "red" }}>{item.on_hand_adj}</div>;
        } else {
          return (
            <div style={{ color: "green" }}>{item.on_hand_adj ? `+${item.on_hand_adj}` : ""}</div>
          );
        }
      },
    },
    {
      title: (
        <div>
          Lý do{" "}
          <Tooltip
            title={
              <div>
                <div>1.XNK sai quy trình</div>
                <div>2.Sai trạng thái đơn hàng</div>
                <div>3.Thất thoát</div>
              </div>
            }
          >
            <InfoCircleOutlined type="primary" color="primary" />
          </Tooltip>
        </div>
      ),
      dataIndex: "note",
      align: "left",
      width: 100,
      render: (value, row: LineItemAdjustment, index: number) => {
        let note = `${index}#${value}`;
        let tooltip = null;

        if (!arrTypeNote.find((e) => e.value === value)) {
          note = `${index}##${value}`;
          tooltip = value;
        }

        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.AUDITED && allowUpdate) {
          return (
            <Radio.Group
              className="custom-radio-group"
              value={note}
              buttonStyle="solid"
              onChange={(e) => {
                handleNoteChange(index, e.target.value, row);
              }}
            >
              <Tooltip placement="topLeft" title={arrTypeNote[0].value}>
                <Radio.Button
                  style={{ paddingLeft: 12, paddingRight: 12 }}
                  value={`${index}#${arrTypeNote[0].value}`}
                >
                  <UserSwitchOutlined />
                </Radio.Button>
              </Tooltip>
              <Tooltip placement="topLeft" title={arrTypeNote[1].value}>
                <Radio.Button
                  style={{ paddingLeft: 12, paddingRight: 12 }}
                  value={`${index}#${arrTypeNote[1].value}`}
                >
                  <CodepenOutlined />
                </Radio.Button>
              </Tooltip>
              <Tooltip placement="topLeft" title={arrTypeNote[2].value}>
                <Radio.Button
                  style={{ paddingLeft: 12, paddingRight: 12 }}
                  value={`${index}#${arrTypeNote[2].value}`}
                >
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
      width: 30,
      render: (value: string, row) => {
        return (
          <>
            {data.status !== STATUS_INVENTORY_ADJUSTMENT.AUDITED.status &&
              data.status !== STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status && isPermissionEdit && isPermissionAudit && (
                <ReloadOutlined
                  title="Cập nhật lại tồn trong kho"
                  onClick={() => reloadOnHand(row)}
                />
              )}
          </>
        );
      },
    },
  ];

  const onResultDataTable = useCallback(
    (result: PageResponse<LineItemAdjustment> | false) => {
      setLoadingTable(false);
      if (result) {
        setDataLinesItem({ ...result });
        setDataTab && setDataTab(result);
        if (tab === ADJUSTMENT_LIST_TABS.TOTAL_TAB) {
          setTotalProp && setTotalProp(result.metadata.total);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps,
    [],
  );

  const getLinesItemAdjustment = useCallback(
    (page: number, size: number, keySearch: string | null) => {
      setTimeout(() => {
        setLoadingTable(true);
        dispatch(
          getLinesItemAdjustmentAction(
            idNumber,
            `page=${page}&limit=${size}&type=${
              tab === ADJUSTMENT_LIST_TABS.DEVIANT_TAB ? "deviant" : "total"
            }&condition=${keySearch?.toString()}`,
            onResultDataTable,
          ),
        );
      }, 0);
    },
    [dispatch, idNumber, tab, onResultDataTable],
  );

  const onPageChange = useCallback(
    (page, size) => {
      getLinesItemAdjustment(page, size, keySearch);
    },
    [keySearch, getLinesItemAdjustment],
  );

  useEffect(() => {
    getLinesItemAdjustment(dataLinesItem.metadata.page, dataLinesItem.metadata.limit, keySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [isRerenderTab, keySearch, tab, isReSearch]);

  return (
    <>
      {/* Danh sách */}
      {data.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.INITIALIZING && (
        <div className="text-center font-weight-500 margin-top-20">
          Đang xử lý sản phẩm cần kiểm kho, vui lòng đợi giây lát...
        </div>
      )}
      <Table
        bordered
        className="adjustment-inventory-table"
        loading={loadingTable || tableLoading}
        rowClassName="product-table-row"
        style={{ paddingTop: 16 }}
        pagination={false}
        columns={defaultColumns}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        scroll={{
          x: "max-content",
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
      />
    </>
  );
};

export default InventoryAdjustmentListAll;
