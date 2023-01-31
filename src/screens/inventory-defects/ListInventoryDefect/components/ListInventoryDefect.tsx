import { Button, Card, Form, Image, Input, Select, Tooltip } from "antd";
import ButtonSetting from "component/table/ButtonSetting";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {
  DataRequestDefectItems,
  InventoryDefectFields,
  InventoryDefectResponse,
  LineItemDefect,
} from "model/inventory-defects";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ImageProduct from "screens/products/product/component/ImageProduct";
import search from "assets/img/search.svg";
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
import {
  generateQuery,
  formatFieldTag,
  transformParamsToObject,
  splitEllipsis,
} from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { cloneDeep, isArray, isEmpty } from "lodash";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import TextEllipsis from "component/table/TextEllipsis";
import { StoreResponse } from "model/core/store.model";
import { DefectFilterBasicEnum, DefectFilterBasicName } from "model/inventory-defects/filter";
import { useArray } from "hook/useArray";
import BaseFilterResult from "component/base/BaseFilterResult";
import { CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { InventoryDefectsPermission } from "config/permissions/inventory-defects.permission";
import AuthWrapper from "component/authorization/AuthWrapper";
import { RootReducerType } from "model/reducers/RootReducerType";
import { strForSearch } from "utils/StringUtils";
import { Option } from "antd/es/mentions";
import CopyIcon from "screens/order-online/component/CopyIcon";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import { formatCurrencyForProduct } from "screens/products/helper";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import useAuthorization from "hook/useAuthorization";
import styled from "styled-components";
import EditDefect from "./EditDefect";

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
    icon: <CloseCircleOutlined />,
  },
];

const ListInventoryDefect: React.FC = () => {
  const dispatch = useDispatch();
  const { Item } = Form;
  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const query = useQuery();

  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_DEFECT,
  );

  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );

  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  let dataQuery: any = useMemo(() => {
    return { ...getQueryParams(query) };
  }, [query]);

  let [params, setParams] = useState<any>(dataQuery);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [itemDelete, setItemDelete] = useState<InventoryDefectResponse>();
  const [selected, setSelected] = useState<Array<LineItemDefect>>([]);
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([]);
  const [data, setData] = useState<PageResponse<InventoryDefectResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [form] = Form.useForm();
  const history = useHistory();

  const getInventoryDefects = useCallback(async () => {
    const queryString = generateQuery(params);
    const res = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      getListInventoryDefect,
      queryString,
    );
    if (res) {
      setData(res);
      setLoadingTable(false);
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
    getInventoryDefects();
    getStores();
  }, [getInventoryDefects, getStores, params]);

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
        width: 200,
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
        width: 200,
        render: (text: string, item: InventoryDefectResponse) => {
          return <span>{text}</span>;
        },
      },
      {
        title: <Tooltip title="Số tồn trong tại thời điểm hiện tại">Tồn trong kho</Tooltip>,
        dataIndex: "on_hand",
        align: "center",
        visible: true,
        width: 100,
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
        titleCustom: "Số lỗi",
        dataIndex: "defect",
        width: 100,
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
                maxValue={100}
                index={index}
              />
            </div>
          );
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        width: 200,
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
        title: "Thời gian tạo",
        width: 120,
        dataIndex: "created_date",
        visible: true,
        align: "center",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
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
        width: 60,
        align: "center",
      },
    ];
  }, [currentPermissions, editItemDefect, data]);

  useEffect(() => {
    if (tableColumnConfigs && tableColumnConfigs.length) {
      const latestConfig = tableColumnConfigs.reduce(
        (prev, current) => (prev.id > current.id ? prev : current),
        { id: -1, json_content: "" },
      );
      try {
        const columnsConfig = JSON.parse(latestConfig.json_content);
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

  const onFinish = useCallback(
    (data) => {
      const newParam = { ...params, ...data };
      setParams(newParam);
      const queryParam = generateQuery(newParam);
      history.replace(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
    },
    [history, params],
  );

  const onSearch = useCallback(() => {
    const searchValue = form.getFieldValue(DefectFilterBasicEnum.condition);
    if (typeof searchValue !== "string") return;

    // make sure user enter something, not special characters
    if (!/[a-zA-Z0-9\s-]{1,}/.test(searchValue)) return;
    const newParam = { ...params, [DefectFilterBasicEnum.condition]: searchValue.trim(), page: 1 };
    const queryParam = generateQuery(newParam);
    history.replace(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
    setParams(newParam);
    setData({ ...data, metadata: { ...data.metadata, page: 1 } }); // change to page 1 before performing search
  }, [form, history, params]);

  useEffect(() => {
    if (myStores) {
      form.setFieldsValue({
        [DefectFilterBasicEnum.condition]: params.condition?.toString()?.split(","),
        [DefectFilterBasicEnum.store_ids]: params.store_ids
          ? params.store_ids?.toString()?.split(",")
          : undefined,
      });
    }
  }, [form, myStores, params]);

  useEffect(() => {
    if (paramsArray.length < (prevArray?.length || 0)) {
      let newParams = transformParamsToObject(paramsArray);
      setParams(newParams);
      history.replace(`${history.location.pathname}?${generateQuery(newParams)}`);
    }
  }, [paramsArray, history, prevArray]);

  useEffect(() => {
    const newParams = { ...params };

    const formatted = formatFieldTag(newParams, { ...DefectFilterBasicName });
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case DefectFilterBasicEnum.store_ids:
          if (isArray(item.valueId)) {
            const filterStore = stores?.filter((elem) =>
              item.valueId.find((id: number) => +elem.id === +id),
            );
            if (filterStore)
              return {
                ...item,
                valueName: filterStore?.map((item: any) => item.name).toString(),
              };
          }
          const findStore = stores?.find((store) => +store.id === +item.valueId);
          return { ...item, valueName: findStore?.name };
        case DefectFilterBasicEnum.condition:
          return { ...item, valueName: item.valueId.toString() };
        default:
          return item;
      }
    });
    setParamsArray(transformParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, JSON.stringify(stores), setParamsArray]);

  const onRemoveStatus = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );
  const [canDeleteDefect] = useAuthorization({
    acceptPermissions: [InventoryDefectsPermission.delete],
  });

  const menu = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === actionsDefault[0].id) {
        return canDeleteDefect;
      }
      return false;
    });
  }, [canDeleteDefect]);

  const onMenuClick = useCallback(
    (index: number) => {
      if (selected.length === 0) {
        showWarning("Bạn chưa chọn đơn đặt hàng nào");
        return;
      }
      switch (index) {
        case actionsDefault[0].id:
          setConfirmDelete(true);
          break;
      }
    },
    [selected],
  );

  const onSelect = useCallback(
    (selectedRow: Array<LineItemDefect>) => {
      const res = selectedRow.filter(function (el) {
        return el !== undefined;
      });
      setSelected(res);
    },
    [setSelected],
  );

  const handleDeleteInventoryDefects = async () => {
    try {
      const idSelected = selected.map((item) => {
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

  return (
    <StyledCard>
      <Form onFinish={onFinish} layout="inline" initialValues={{}} form={form}>
        <div className="page-filter-left">
          <ActionButton menu={menu} onMenuClick={onMenuClick} />
        </div>
        <Item style={{ flex: 1 }} name={DefectFilterBasicEnum.condition} className="input-search">
          <Input
            allowClear
            prefix={<img src={search} alt="" />}
            placeholder="Tìm kiếm theo mã vạch, sku, tên sản phẩm. Nhấn Enter để tìm"
            onKeyDown={(e) => {
              e.charCode === 13 && onSearch();
            }}
          />
        </Item>
        <Item name={DefectFilterBasicEnum.store_ids} className="select-item">
          <Select
            autoClearSearchValue={false}
            style={{ width: "300px" }}
            placeholder="Chọn cửa hàng"
            maxTagCount={"responsive" as const}
            mode="multiple"
            showArrow
            showSearch
            allowClear
            filterOption={(input: String, option: any) => {
              if (option.props.value) {
                return strForSearch(option.props.children).includes(strForSearch(input));
              }

              return false;
            }}
          >
            {myStores.length || stores.length
              ? myStores.length
                ? myStores.map((item: any, index: number) => (
                    <Option key={"from_store_id" + index} value={item.store_id.toString()}>
                      {item.store}
                    </Option>
                  ))
                : stores.map((item, index) => (
                    <Option key={"from_store_id" + index} value={item.id.toString()}>
                      {item.name}
                    </Option>
                  ))
              : null}
          </Select>
        </Item>
        <Item>
          <Button htmlType="submit" type="primary" onClick={onSearch}>
            Lọc
          </Button>
        </Item>
        <Item style={{ margin: 0 }}>
          <ButtonSetting onClick={() => setShowSettingColumn(true)} />
        </Item>
      </Form>
      <div style={{ marginTop: paramsArray.length > 0 ? 10 : 20 }}>
        <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
      </div>
      <CustomTable
        className="small-padding"
        bordered
        isLoading={loadingTable}
        isShowPaginationAtHeader
        isRowSelection
        onSelectedChange={onSelect}
        dataSource={data.items}
        scroll={{ x: "max-content" }}
        sticky={{ offsetScroll: 5, offsetHeader: 55 }}
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
      {selected.length > 0 && (
        <ModalDeleteConfirm
          onCancel={() => setConfirmDelete(false)}
          onOk={() => {
            handleDeleteInventoryDefects();
          }}
          title={
            <div>
              Bạn chắc chắn xóa <span style={{ color: "#11006f" }}>{selected.length}</span> sản phẩm
              này ra khỏi danh sách hàng lỗi không ?
            </div>
          }
          visible={isConfirmDelete}
        />
      )}
    </StyledCard>
  );
};

export default ListInventoryDefect;

const StyledCard = styled(Card)`
  border: none;
  box-shadow: none;
  margin-top: 20px;
  .page-filter-left {
    margin-right: 20px;
    .action-button {
      border: 1px solid #2a2a86;
      padding: 6px 15px;
      border-radius: 5px;
      flex-direction: row;
      display: flex;
      align-items: center;
      color: #2a2a86;
    }
  }
  .ant-card-body {
    padding: 0;
  }
`;
