import { Button, Image, Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {
  DataRequestDefectItems,
  InventoryDefectFields,
  InventoryDefectResponse,
  InventoryDefectQuery,
  LineItemDefect,
  InventoryDefectFieldsMapping,
  InventoryDefectExport,
} from "model/inventory-defects";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ImageProduct from "screens/products/product/component/ImageProduct";
import { primaryColor } from "utils/global-styles/variables";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch, useSelector } from "react-redux";
import { getStoreApi } from "service/inventory/transfer/index.service";
import EditNote from "screens/order-online/component/edit-note";
import {
  createInventoryDefect,
  deleteInventoryDefect,
  deleteInventoryDefects,
  editInventoryDefectNote,
  getListInventoryDefect,
} from "service/inventory/defect/index.service";
import { PageResponse } from "model/base/base-metadata.response";
import UrlConfig from "config/url.config";
import { generateQuery, splitEllipsis } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { cloneDeep, isEmpty } from "lodash";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import TextEllipsis from "component/table/TextEllipsis";
import { StoreResponse } from "model/core/store.model";
import { CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { InventoryDefectsPermission } from "config/permissions/inventory-defects.permission";
import AuthWrapper from "component/authorization/AuthWrapper";
import { RootReducerType } from "model/reducers/RootReducerType";
import CopyIcon from "screens/order-online/component/CopyIcon";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import { formatCurrencyForProduct } from "screens/products/helper";
import { MenuAction } from "component/table/ActionButton";
import useAuthorization from "hook/useAuthorization";
import EditDefect from "./EditDefect";
import { AccountStoreResponse } from "model/account/account.model";
import InventoryDefectFilter from "./InventoryDefectFilter";
import { utils, writeFile } from "xlsx";
import moment from "moment";
import ExportFileModal, { ResultLimitModel } from "component/modal/ExportFileModal/ExportFileModal";
import { ExportFileStatus, ExportFileType } from "utils/ExportFileConstants";

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
    icon: <CloseCircleOutlined />,
  },
];

type ListInventoryDefectProps = {
  isExportDefects: boolean;
  setIsExportDefects: (isExport: boolean) => void;
};

const ListInventoryDefect: React.FC<ListInventoryDefectProps> = (
  props: ListInventoryDefectProps,
) => {
  const { isExportDefects, setIsExportDefects } = props;
  const dispatch = useDispatch();
  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [statusExport, setStatusExport] = useState<number>(ExportFileStatus.Export);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const exportRef: { current: NodeJS.Timeout | null } = useRef(null);
  const query = useQuery();

  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_DEFECT,
  );

  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );

  const myStores: Array<AccountStoreResponse> | undefined = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const initialQuery: InventoryDefectQuery = {
    page: 1,
    limit: 30,
    condition: undefined,
    store_ids: undefined,
    from_defect: undefined,
    to_defect: undefined,
  };

  const dataQuery = {
    ...initialQuery,
    ...getQueryParams(query),
  } as InventoryDefectQuery;

  let [params, setParams] = useState<InventoryDefectQuery>(dataQuery);
  const [itemDelete, setItemDelete] = useState<InventoryDefectResponse>();
  const [selectedRowData, setSelectedRowData] = useState<Array<InventoryDefectResponse>>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [data, setData] = useState<PageResponse<InventoryDefectResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const history = useHistory();

  const resultsExportFile: ResultLimitModel[] = [
    {
      value: ExportFileType.INPAGE,
      name: ExportFileType.INPAGE,
      title: "Sản phẩm trên trang này",
      isHidden: false,
      isChecked: true,
    },
    {
      value: ExportFileType.SELECTED,
      name: ExportFileType.SELECTED,
      title: "Các sản phẩm được chọn",
      isHidden: selectedRowData.length > 0 ? false : true,
      isChecked: false,
    },
    {
      value: ExportFileType.CURRENT_SEARCH,
      name: ExportFileType.CURRENT_SEARCH,
      title: "Các sản phẩm phù hợp với điều kiện lọc",
      isHidden: false,
      isChecked: false,
    },
    {
      value: ExportFileType.ALL,
      name: ExportFileType.ALL,
      title: "Tất cả các sản phẩm",
      isHidden: false,
      isChecked: false,
    },
  ];

  const getInventoryDefects = useCallback(async () => {
    const res = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      getListInventoryDefect,
      params,
    );
    if (res) {
      setData(res);
    }
  }, [dispatch, params]);

  const getStores = useCallback(async () => {
    const response = await callApiNative({ isShowError: true }, dispatch, getStoreApi, {
      status: "active",
      simple: true,
    });
    if (response) {
      setStores(response);
    }
  }, [dispatch]);

  useEffect(() => {
    getStores();
  }, [getStores]);

  useEffect(() => {
    getInventoryDefects();
  }, [params, getInventoryDefects]);

  const editItemDefect = useCallback(
    async (value: any, field: string, itemObject: InventoryDefectResponse) => {
      let itemEdit: any = {};
      if (itemObject && !isEmpty(itemObject)) {
        if (InventoryDefectFields.defect === field) {
          if (!/^-?\d+$/.test(value)) {
            // numeric
            showError("Bạn cần nhập số");
            return;
          }
          if (value <= 0) {
            showError("Số lỗi không được nhỏ hơn 1");
            return;
          }
          if (itemObject.defect === value) {
            value = 0;
          } else {
            value = value - itemObject.defect;
          }
          itemEdit = { ...itemObject, [field]: value };
        } else {
          itemEdit = {
            ...itemObject,
            [field]: value,
            [InventoryDefectFields.defect]: 0,
          };
        }
        const itemSubmit: DataRequestDefectItems = {
          store: itemObject.store,
          store_id: itemObject.store_id,
          items: [itemEdit],
        };
        // phía BE viết chức năng update và create chung 1 api
        dispatch(showLoading());
        const res = await callApiNative(
          { isShowError: true },
          dispatch,
          createInventoryDefect,
          itemSubmit,
        );
        if (res) {
          // BE yêu cầu chờ 3s để đồng bộ ES
          setTimeout(() => {
            getInventoryDefects();
            showSuccess("Sửa sản phẩm thành công");
          }, 3000);
        } else {
          dispatch(hideLoading());
        }
      }
    },
    [dispatch, getInventoryDefects],
  );

  const editNoteDefect = async (value: string, id: number) => {
    if (value.length > 255) {
      showError("Ghi chú không được quá 255 ký tự");
      return;
    }
    dispatch(showLoading());
    const res = await callApiNative(
      { isShowError: true },
      dispatch,
      editInventoryDefectNote,
      id,
      value,
    );
    if (res) {
      // BE yêu cầu chờ 3s để đồng bộ ES
      setTimeout(() => {
        getInventoryDefects();
        showSuccess("Sửa sản phẩm thành công");
      }, 3000);
    } else {
      dispatch(hideLoading());
    }
  };

  const handleDelete = useCallback(
    async (id: number) => {
      dispatch(showLoading());
      await callApiNative({ isShowError: true }, dispatch, deleteInventoryDefect, id);
      setTimeout(() => {
        getInventoryDefects();
        showSuccess("Xóa sản phẩm thành công");
        dispatch(hideLoading());
      }, 3000);
    },
    [dispatch, getInventoryDefects],
  );

  const initColumns: Array<ICustomTableColumType<InventoryDefectResponse>> = useMemo(() => {
    return [
      {
        title: "Ảnh",
        align: "center",
        fixed: "left",
        dataIndex: "variant_image",
        width: 70,
        render: (value: string) => {
          return (
            <>
              {value ? (
                <Image
                  width={40}
                  height={40}
                  src={value ?? ""}
                  placeholder="Xem"
                  preview={{ mask: <EyeOutlined /> }}
                />
              ) : (
                <ImageProduct isDisabled={true} onClick={undefined} path={value} />
              )}
            </>
          );
        },
        visible: true,
      },
      {
        title: "Sản phẩm",
        width: 280,
        dataIndex: "sku",
        align: "left",
        fixed: "left",
        visible: true,
        render: (value: string, item: InventoryDefectResponse) => {
          let strName = item.name?.trim() ?? "";
          strName =
            window.screen.width >= 1920
              ? splitEllipsis(strName, 100, 30)
              : window.screen.width >= 1600
              ? (strName = splitEllipsis(strName, 60, 30))
              : window.screen.width >= 1366
              ? (strName = splitEllipsis(strName, 47, 30))
              : strName;
          return (
            <>
              <div style={{ whiteSpace: "nowrap" }}>
                <Link
                  to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}
                >
                  {value}
                </Link>
                <span title="click to copy">
                  <CopyIcon copiedText={value} informationText="Đã copy mã sản phẩm!" size={18} />
                </span>
              </div>

              <TextEllipsis value={strName ?? ""} line={1}></TextEllipsis>
            </>
          );
        },
      },
      {
        title: "Cửa hàng",
        dataIndex: "store",
        align: "center",
        visible: true,
        width: 150,
        render: (text: string, item: InventoryDefectResponse) => {
          return <span>{text}</span>;
        },
      },
      {
        title: <Tooltip title="Số tồn trong tại thời điểm hiện tại">Tồn trong kho</Tooltip>,
        dataIndex: "on_hand",
        align: "center",
        visible: true,
        width: 120,
        render: (text: string, item: InventoryDefectResponse) => {
          return <span>{text}</span>;
        },
      },
      {
        title: () => {
          const inventoryDefects = cloneDeep(data.items);
          const total =
            inventoryDefects?.reduce((value, element) => {
              return value + element.defect || 0;
            }, 0) || 0;

          return (
            <div>
              Số lỗi <span style={{ color: "#2A2A86" }}>({formatCurrencyForProduct(total)})</span>
            </div>
          );
        },
        titleCustom: "Số tồn lỗi",
        dataIndex: "defect",
        width: 120,
        align: "center",
        visible: true,
        render: (value, item: InventoryDefectResponse, index: number) => {
          const hasPermission = [InventoryDefectsPermission.update].some((element) => {
            return currentPermissions.includes(element);
          });
          return (
            <div className="single">
              <EditDefect
                isHaveEditPermission={hasPermission}
                value={item.defect}
                title="Sửa số lỗi: "
                color={primaryColor}
                confirmEdit={(newValue) => {
                  editItemDefect(newValue, InventoryDefectFields.defect, item);
                }}
                errorMessage="Không thể sửa số lỗi về 0, bạn có thể xóa sản phẩm này khỏi danh sách hàng lỗi"
                index={index}
              />
            </div>
          );
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        width: 280,
        visible: true,
        render: (value: string, item: InventoryDefectResponse) => {
          const hasPermission = [InventoryDefectsPermission.update].some((element) => {
            return currentPermissions.includes(element);
          });
          return (
            <div className="single">
              <EditNote
                isHaveEditPermission={hasPermission}
                note={item.note}
                color={primaryColor}
                onOk={(newNote) => {
                  editNoteDefect(newNote, item.id);
                }}
              />
            </div>
          );
        },
      },
      {
        key: "action",
        dataIndex: "action",
        render: (value: any, item: InventoryDefectResponse, index: number) => {
          return (
            <AuthWrapper acceptPermissions={[InventoryDefectsPermission.delete]}>
              <Button
                type="text"
                className=""
                style={{
                  background: "transparent",
                  border: "solid 1px red",
                  padding: 0,
                  width: "40px",
                }}
                onClick={() => {
                  setItemDelete(item);
                  setConfirmDelete(true);
                }}
              >
                <DeleteOutlined style={{ fontSize: 18, color: "red" }} />
              </Button>
            </AuthWrapper>
          );
        },
        visible: true,
        width: 50,
        align: "center",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPermissions, editItemDefect, data]);

  useEffect(() => {
    if (tableColumnConfigs && tableColumnConfigs.length) {
      const userConfig = tableColumnConfigs.find(
        (e) => e.type === COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_DEFECT,
      );
      if (userConfig) {
        try {
          const columnsConfig = JSON.parse(userConfig.json_content);
          let newColumns = [];

          for (const colConfig of columnsConfig) {
            const col = initColumns.find((column) => column.dataIndex === colConfig.dataIndex);
            if (col) {
              newColumns.push({ ...col, visible: colConfig.visible });
            }
          }
          setColumns(newColumns);
        } catch (err) {
          showError("Lỗi lấy cài đặt cột");
        }
      }
    } else {
      setColumns([...initColumns]);
    }
  }, [initColumns, tableColumnConfigs, data]);
  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<InventoryDefectResponse>>>(initColumns);

  const onColumnConfigChange = (
    newColumnsConfig: Array<ICustomTableColumType<InventoryDefectResponse>>,
  ) => {
    const newColumnsOrder = [];

    for (const columnConfig of newColumnsConfig) {
      const column = initColumns.find((col) => col.dataIndex === columnConfig.dataIndex);
      if (column) {
        newColumnsOrder.push({ ...column, visible: columnConfig.visible });
      }
    }
    const action = newColumnsOrder.find((col) => col.dataIndex === "action");
    const actionInitial = initColumns.find((col) => col.dataIndex === "action");
    if (!action && actionInitial) {
      newColumnsOrder.push(actionInitial);
    }
    onSaveConfigTableColumn(newColumnsOrder);
    setColumns(newColumnsOrder);
  };

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  /**  the delete button should always be stand in the end */
  const columnSettingModalColumns = useMemo(
    () => columns.filter((item) => item.dataIndex !== "action"),
    [columns],
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      let queryParam = generateQuery(params);
      history.replace(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
    },
    [params, history],
  );

  const [canDeleteDefect] = useAuthorization({
    acceptPermissions: [InventoryDefectsPermission.delete],
  });

  const menuAction = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === actionsDefault[0].id) {
        return canDeleteDefect;
      }
      return false;
    });
  }, [canDeleteDefect]);

  const menuClick = useCallback(
    (index: number) => {
      if (selectedRowData.length === 0) {
        showWarning("Bạn chưa chọn đơn đặt hàng nào");
        return;
      }
      switch (index) {
        case actionsDefault[0].id:
          setConfirmDelete(true);
          break;
      }
    },
    [selectedRowData],
  );

  const changeSelected = useCallback(
    (
      selectedRow: Array<InventoryDefectResponse>,
      selected: boolean | undefined,
      changeRow: any,
    ) => {
      if (selected) {
        const newSelectedRowKeys = changeRow.map((row: any) => row.id);
        const newSelectedRows = [...selectedRowData, ...changeRow];
        const newRowKeys = [...selectedRowKeys, ...newSelectedRowKeys];
        setSelectedRowData(newSelectedRows);
        setSelectedRowKeys(newRowKeys);
        return;
      }
      const deselectedRowKeys = selectedRowKeys.filter((item) => {
        const findIndex = changeRow.findIndex((row: any) => row.id === item);

        return findIndex === -1;
      });
      const deselectedRow = selectedRowData.filter((el: InventoryDefectResponse) => {
        const findIndex = changeRow.findIndex((item: any) => item.id === el.id);
        return findIndex === -1;
      });
      setSelectedRowData(deselectedRow);
      setSelectedRowKeys(deselectedRowKeys);
    },
    [selectedRowData, selectedRowKeys],
  );

  const handleDeleteInventoryDefects = async () => {
    try {
      const idSelected = selectedRowData.map((item) => {
        return item.id;
      });

      const result = await callApiNative(
        { isShowError: true, isShowLoading: true },
        dispatch,
        deleteInventoryDefects,
        {
          ids: idSelected.toString(),
        },
      );

      if (result) {
        showSuccess("Xóa sản phẩm thành công");
        getInventoryDefects();
      }
      setConfirmDelete(false);
    } catch (err) {}
  };

  const showColumnSetting = () => {
    setShowSettingColumn(true);
  };

  const filterDefects = (values: InventoryDefectQuery) => {
    const newParams = { ...params, ...values, page: 1 };
    setParams(newParams);
    const queryParam = generateQuery(newParams);
    history.push(`${history.location.pathname}?${queryParam}`);
  };

  const clearFilterDefect = () => {
    setParams(initialQuery);
    const queryParams = generateQuery(initialQuery);
    history.push(`${UrlConfig.INVENTORY_DEFECTS}?${queryParams}`);
  };

  useEffect(() => {
    return () => {
      clearInterval(exportRef.current as NodeJS.Timeout);
    };
  }, []);

  const getItemsExportInPage = (params: InventoryDefectQuery) => {
    return callApiNative({ isShowLoading: false }, dispatch, getListInventoryDefect, {
      ...params,
      limit: params.limit ?? 50,
    });
  };

  const getItemsExport = async (
    params: InventoryDefectQuery,
    total: number,
    exportType: string,
  ): Promise<Array<InventoryDefectResponse>> => {
    const limit = params.limit ?? 50;
    const newParams = exportType === ExportFileType.CURRENT_SEARCH ? { ...params } : {};
    const roundAll = Math.round(total / limit);
    const times = roundAll < total / limit ? roundAll + 1 : roundAll;
    let items: Array<InventoryDefectResponse> = [];
    let currentPage = 1;
    const intervalFun = async (resolve: any, reject: any) => {
      const res = await callApiNative({ isShowLoading: false }, dispatch, getListInventoryDefect, {
        ...newParams,
        page: currentPage,
        limit: limit,
      });
      if (res) {
        items = items.concat(res.items);
        const percent = Math.round(Number.parseFloat((currentPage / times).toFixed(2)) * 100);
        setExportProgress(percent);
        currentPage = currentPage + 1;
        if (currentPage > times) {
          clearInterval(exportRef.current as NodeJS.Timeout);
          currentPage = 1;
          resolve(items);
        }
      } else {
        clearInterval(exportRef.current as NodeJS.Timeout);
        currentPage = 1;
        setExportProgress(0);
        setStatusExport(ExportFileStatus.ExportError);
        reject();
      }
    };
    return new Promise((resolve, reject) => {
      exportRef.current = setInterval(() => intervalFun(resolve, reject), 3000);
    });
  };

  const convertItemExport = (item: InventoryDefectResponse) => {
    return {
      [InventoryDefectFieldsMapping.sku]: item.sku,
      [InventoryDefectFieldsMapping.name]: item.name,
      [InventoryDefectFieldsMapping.store_id]: item.store_id,
      [InventoryDefectFieldsMapping.store]: item.store,
      [InventoryDefectFieldsMapping.defect]: item.defect === 0 ? null : item.defect,
      [InventoryDefectFieldsMapping.on_hand]: item.on_hand === 0 ? null : item.on_hand,
      [InventoryDefectFieldsMapping.note]: item.note,
    };
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      try {
        setStatusExport(ExportFileStatus.Exporting);
        const dataExport: Array<InventoryDefectExport> = [];
        let dataResult: Array<InventoryDefectResponse> = [];
        if (
          typeExport === ExportFileType.SELECTED &&
          selectedRowData &&
          selectedRowData.length === 0
        ) {
          setStatusExport(ExportFileStatus.Export);
          showWarning("Bạn chưa chọn sản phẩm nào để xuất file");
          return;
        }

        switch (typeExport) {
          case ExportFileType.INPAGE:
            const res = await getItemsExportInPage(params);
            dataResult = res.items;
            break;
          case ExportFileType.SELECTED:
            dataResult = [...selectedRowData];
            break;
          case ExportFileType.CURRENT_SEARCH:
            dataResult = await getItemsExport(
              params,
              data.metadata.total,
              ExportFileType.CURRENT_SEARCH,
            );
            break;
          case ExportFileType.ALL:
            const result = await callApiNative(
              { isShowLoading: false },
              dispatch,
              getListInventoryDefect,
              {
                page: 1,
                limit: 30,
              },
            );
            const totalRecord = result.metadata.total;
            dataResult = await getItemsExport(params, totalRecord, ExportFileType.ALL);
            break;
          default:
            break;
        }
        if (dataResult.length === 0) {
          showWarning("Không có sản phẩm nào đủ điều kiện");
          return;
        }

        const workbook = utils.book_new();
        if (dataResult.length > 0) {
          for (let i = 0; i < dataResult.length; i++) {
            const e = dataResult[i];
            const item = convertItemExport(e);
            dataExport.push(item);
          }
        }
        const worksheet = utils.json_to_sheet(dataExport);
        utils.book_append_sheet(workbook, worksheet, "data");

        setStatusExport(ExportFileStatus.ExportSuccess);
        setExportProgress(100);
        const today = moment(new Date(), "YYYY/MM/DD");
        const month = today.format("M");
        const day = today.format("D");
        const year = today.format("YYYY");
        writeFile(workbook, `inventory_defects_${day}_${month}_${year}.xlsx`);
      } catch (e) {
        setStatusExport(ExportFileStatus.ExportError);
      }
    },
    Cancel: () => {
      clearInterval(exportRef.current as NodeJS.Timeout);
      setIsExportDefects(false);
      setExportProgress(0);
      setStatusExport(ExportFileStatus.Export);
    },
  };

  return (
    <>
      <InventoryDefectFilter
        myStores={myStores}
        stores={stores}
        filterDefects={filterDefects}
        menuClick={menuClick}
        menuAction={menuAction}
        params={params}
        showColumnSetting={showColumnSetting}
        clearFilterDefect={clearFilterDefect}
      />
      <CustomTable
        className="small-padding"
        bordered
        isShowPaginationAtHeader
        isRowSelection
        scroll={{ x: "max-content" }}
        selectedRowKey={selectedRowKeys}
        onSelectedChange={changeSelected}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
        columns={columnFinal}
        rowKey={(item: LineItemDefect) => item.id}
        pagination={{
          showSizeChanger: true,
          pageSize: data?.metadata?.limit || 0,
          current: data?.metadata?.page || 0,
          total: data?.metadata?.total || 0,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        isSetDefaultColumn
        onResetToDefault={() => onColumnConfigChange(initColumns)}
        onOk={(data) => {
          setShowSettingColumn(false);
          onColumnConfigChange(data);
        }}
        data={columnSettingModalColumns}
      />
      {itemDelete && (
        <ModalDeleteConfirm
          onCancel={() => setConfirmDelete(false)}
          onOk={() => {
            handleDelete(itemDelete.id);
            setConfirmDelete(false);
          }}
          title={
            <div>
              Bạn chắc chắn xóa sản phẩm <span style={{ color: "#11006f" }}>{itemDelete.name}</span>{" "}
              ?
            </div>
          }
          visible={isConfirmDelete}
        />
      )}
      {isExportDefects && (
        <ExportFileModal
          results={resultsExportFile}
          visible={isExportDefects}
          isExportList={true}
          onOk={(exportType) => actionExport.Ok(exportType)}
          title="hàng lỗi"
          status={statusExport}
          onCancel={actionExport.Cancel}
          exportProgress={exportProgress}
        />
      )}
      {selectedRowData.length > 0 && (
        <ModalDeleteConfirm
          onCancel={() => setConfirmDelete(false)}
          onOk={() => {
            handleDeleteInventoryDefects();
          }}
          title={
            <div>
              Bạn chắc chắn xóa <span style={{ color: "#11006f" }}>{selectedRowData.length}</span>{" "}
              sản phẩm này ra khỏi danh sách hàng lỗi không ?
            </div>
          }
          visible={isConfirmDelete}
        />
      )}
    </>
  );
};

export default ListInventoryDefect;
