import { Button, Card, Form, Image, Input, Select } from "antd";
import styled from "styled-components";
import { Option } from "antd/es/mentions";
import { useDispatch, useSelector } from "react-redux";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import search from "assets/img/search.svg";
import { DefectFilterBasicEnum } from "model/inventory-defects/filter";
import { strForSearch } from "utils/StringUtils";
import ButtonSetting from "component/table/ButtonSetting";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StoreResponse } from "model/core/store.model";
import { callApiNative } from "utils/ApiUtils";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { generateQuery, splitEllipsis } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import {
  InventoryDefectHistoryResponse,
  InventorySearchItem,
  LineItemDefect,
} from "model/inventory-defects";
import { getQueryParams, useQuery } from "utils/useQuery";
import { PageResponse } from "model/base/base-metadata.response";
import { useArray } from "hook/useArray";
import BaseFilterResult from "component/base/BaseFilterResult";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { EyeOutlined } from "@ant-design/icons";
import { ImageProduct } from "screens/products/product/component";
import { getListInventoryDefectHistory } from "service/inventory/defect/index.service";
import CopyIcon from "screens/order-online/component/CopyIcon";
import TextEllipsis from "component/table/TextEllipsis";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";
import { showError } from "utils/ToastUtils";
import { cloneDeep } from "lodash";
import { formatCurrencyForProduct } from "screens/products/helper";
import { EnumCodeKey } from "config/enum.config";
import { AccountStoreResponse } from "model/account/account.model";

const { Item } = Form;

export const ListInventoryDefectHistory = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([]);
  const query = useQuery();
  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_DEFECT_HISTORY,
  );

  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false);
  const [data, setData] = useState<PageResponse<InventoryDefectHistoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  const getTotalDefects = useCallback(() => {
    const inventoryDefects = cloneDeep(data.items);
    const total =
      inventoryDefects?.reduce((value, element) => {
        return value + element.defect || 0;
      }, 0) || 0;
    return formatCurrencyForProduct(total);
  }, [data]);

  const initColumns: Array<ICustomTableColumType<InventoryDefectHistoryResponse>> = useMemo(() => {
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
        render: (value: string, item) => {
          let strName = item.name?.trim() ?? "";
          strName =
            window.screen.width >= 1920
              ? splitEllipsis(strName, 100, 30)
              : window.screen.width >= 1600
              ? splitEllipsis(strName, 60, 30)
              : window.screen.width >= 1366
              ? splitEllipsis(strName, 47, 30)
              : strName;
          return (
            <>
              <div style={{ whiteSpace: "nowrap" }}>
                <Link
                  to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}
                  target="_blank"
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
        render: (text: string, item) => {
          return (
            <Link to={`${UrlConfig.STORE}/${item.store_id}`} target="_blank">
              {text}
            </Link>
          );
        },
      },

      {
        title: (
          <div>
            Số lỗi <span style={{ color: "#2A2A86" }}>({getTotalDefects()})</span>
          </div>
        ),
        dataIndex: "defect",
        align: "center",
        visible: true,
        width: 120,
        render: (text: string) => {
          return <span>{text}</span>;
        },
      },
      {
        title: "Người thao tác",
        dataIndex: "updated_name",
        align: "center",
        visible: true,
        render: (text: string, item) => {
          return (
            <span>
              <Link to={`${UrlConfig.ACCOUNTS}/${text}`} target="_blank">
                {text}
              </Link>{" "}
              {item.updated_by && " - " + item.updated_by}
            </span>
          );
        },
      },
      {
        title: "Ngày thao tác",
        dataIndex: "updated_date",
        align: "center",
        visible: true,
        width: 120,
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        align: "center",
        visible: true,
        width: 200,
      },
    ];
  }, [getTotalDefects]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<InventoryDefectHistoryResponse>>>(initColumns);

  const dataQuery = useMemo(() => {
    return { ...getQueryParams(query) } as InventorySearchItem;
  }, [query]);
  const [params, setParams] = useState<InventorySearchItem>(dataQuery);

  const myStores = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const getInventoryDefectsHistory = useCallback(async () => {
    const queryString = generateQuery(params);
    const res = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      getListInventoryDefectHistory,
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

  const onSearch = useCallback(() => {
    const searchValue = form.getFieldValue(DefectFilterBasicEnum.condition);
    if (typeof searchValue !== "string") return;
    // make sure user enter something, not special characters
    if (!/[a-zA-Z0-9\s-]{1,}/.test(searchValue)) return;
    const newParam = { ...params, [DefectFilterBasicEnum.condition]: searchValue.trim(), page: 1 };
    const queryParam = generateQuery(newParam);
    history.replace(`${UrlConfig.INVENTORY_DEFECTS_HISTORY}?${queryParam}`);
    setParams(newParam);
    setData({ ...data, metadata: { ...data.metadata, page: 1 } }); // change to page 1 before performing search
  }, [form, history, params]);

  const onRemoveStatus = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      let queryParam = generateQuery(params);
      history.replace(`${UrlConfig.INVENTORY_DEFECTS_HISTORY}?${queryParam}`);
    },
    [params, history],
  );

  const onFinish = useCallback(
    (data) => {
      const newParam = { ...params, ...data };
      setParams(newParam);
      const queryParam = generateQuery(newParam);
      history.replace(`${UrlConfig.INVENTORY_DEFECTS_HISTORY}?${queryParam}`);
    },
    [history, params],
  );

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  const onColumnConfigChange = (
    newColumnsConfig: Array<ICustomTableColumType<InventoryDefectHistoryResponse>>,
  ) => {
    const newColumnsOrder = [];
    for (const columnConfig of newColumnsConfig) {
      const column = initColumns.find((col) => col.dataIndex === columnConfig.dataIndex);
      if (column) {
        newColumnsOrder.push({ ...column, visible: columnConfig.visible });
      }
    }
    onSaveConfigTableColumn(newColumnsOrder);
    setColumns(newColumnsOrder);
  };

  useEffect(() => {
    getInventoryDefectsHistory();
    getStores();
  }, [getStores, params]);

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
    }
  }, [initColumns, tableColumnConfigs, data]);

  return (
    <StyledCard>
      <Form onFinish={onFinish} layout="inline" initialValues={{}} form={form}>
        <Item style={{ flex: 1 }} name={DefectFilterBasicEnum.condition} className="input-search">
          <Input
            allowClear
            prefix={<img src={search} alt="" />}
            placeholder="Tìm kiếm theo mã vạch, sku, tên sản phẩm. Nhấn Enter để tìm"
            onKeyDown={(e) => {
              e.charCode === EnumCodeKey.ENTER && onSearch();
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
            filterOption={(input: string, option) => {
              if (option?.props?.value) {
                return strForSearch(option?.props?.children).includes(strForSearch(input));
              }
              return false;
            }}
          >
            {myStores && (myStores.length || stores.length)
              ? myStores?.length
                ? myStores.map((item: AccountStoreResponse, index: number) => (
                    <Option key={"from_store_id" + index} value={item?.store_id?.toString()}>
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
        data={columns}
      />
    </StyledCard>
  );
};
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
