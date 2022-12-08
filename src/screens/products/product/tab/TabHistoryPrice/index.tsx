import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { productGetHistoryAction } from "domain/actions/product/products.action";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { PageResponse } from "model/base/base-metadata.response";
import { ProductHistoryQuery, ProductHistoryResponse } from "model/product/product.model";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { formatCurrencyForProduct, HISTORY_PRICE_PRODUCT_TYPES } from "screens/products/helper";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, getEndOfDay, getStartOfDay } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { HistoryProductFilter } from "../../filter";
import { StyledComponent } from "../style";

const initQuery: ProductHistoryQuery = {
  history_type: "UPDATE_PRICE",
};

const TabHistoryPrice: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const [data, setData] = useState<PageResponse<ProductHistoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const dataQuery: ProductHistoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [params, setParams] = useState<ProductHistoryQuery>(dataQuery);

  const onResult = useCallback((result: PageResponse<ProductHistoryResponse> | false) => {
    setIsLoading(false);
    if (result) {
      setData(result);
    }
  }, []);

  const changePage = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      const queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${ProductTabUrl.HISTORY_PRICES}?${queryParam}`);
    },
    [history, params],
  );

  const defaultColumns: Array<ICustomTableColumType<ProductHistoryResponse>> = useMemo(() => {
    return [
      {
        title: "Sản phẩm",
        dataIndex: "history_type",
        key: "history_type",
        visible: true,
        fixed: "left",
        render: (value, item) => {
          if (HISTORY_PRICE_PRODUCT_TYPES.includes(value)) {
            return (
              <div>
                <Link to="">{item.product_code}</Link>
                <div>{item.product_name}</div>
              </div>
            );
          }
          return (
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}>
                {item.sku}
              </Link>
              <div>{item.variant_name}</div>
            </div>
          );
        },
      },
      {
        title: "Giá nhập cũ",
        dataIndex: "data_old",
        key: "import_price_old",
        visible: true,
        align: "right",
        width: 120,
        render: (value) => {
          if (value) {
            const DATA_CONVERT = JSON.parse(value);
            return formatCurrencyForProduct(DATA_CONVERT.import_price);
          }
          return "---";
        },
      },
      {
        title: "Giá nhập mới",
        dataIndex: "data_current",
        key: "import_price_current",
        visible: true,
        align: "right",
        width: 120,
        render: (value) => {
          if (value) {
            const DATA_CONVERT = JSON.parse(value);
            return formatCurrencyForProduct(DATA_CONVERT.import_price);
          }
          return "---";
        },
      },
      {
        title: "Giá vốn cũ",
        dataIndex: "data_old",
        key: "cost_price_old",
        visible: true,
        align: "right",
        width: 120,
        render: (value) => {
          if (value) {
            const DATA_CONVERT = JSON.parse(value);
            return formatCurrencyForProduct(DATA_CONVERT.cost_price);
          }
          return "---";
        },
      },
      {
        title: "Giá vốn mới",
        dataIndex: "data_current",
        key: "cost_price_current",
        visible: true,
        align: "right",
        width: 120,
        render: (value) => {
          if (value) {
            const DATA_CONVERT = JSON.parse(value);
            return formatCurrencyForProduct(DATA_CONVERT.cost_price);
          }
          return "---";
        },
      },
      {
        title: "Giá bán cũ",
        dataIndex: "data_old",
        key: "retail_price_old",
        visible: true,
        align: "right",
        width: 120,
        render: (value) => {
          if (value) {
            const DATA_CONVERT = JSON.parse(value);
            return formatCurrencyForProduct(DATA_CONVERT.retail_price);
          }
          return "---";
        },
      },
      {
        title: "Giá bán mới",
        dataIndex: "data_current",
        key: "retail_price_current",
        visible: true,
        align: "right",
        width: 120,
        render: (value) => {
          if (value) {
            const DATA_CONVERT = JSON.parse(value);
            return formatCurrencyForProduct(DATA_CONVERT.retail_price);
          }
          return "---";
        },
      },
      {
        title: "Người sửa",
        dataIndex: "action_name",
        key: "xaction_name",
        visible: true,
        width: 200,
        align: "center",
        render: (value, record) => {
          return (
            <div>
              {value !== null ? (
                <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record?.action_by}`}>
                  {value}
                </Link>
              ) : (
                "---"
              )}
            </div>
          );
        },
      },
      {
        title: "Thời gian",
        visible: true,
        align: "left",
        dataIndex: "action_date",
        key: "yaction_date",
        render: (value) => (value ? ConvertUtcToLocalDate(value) : "---"),
        width: 160,
      },
    ];
  }, []);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<ProductHistoryResponse>>>(defaultColumns);
  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_PRODUCT_PRICE,
  );

  useSetTableColumns(
    COLUMN_CONFIG_TYPE.COLUMN_PRODUCT_PRICE,
    tableColumnConfigs,
    defaultColumns,
    setColumns,
  );

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(productGetHistoryAction(params, onResult));
  }, [dispatch, onResult, params]);

  return (
    <StyledComponent>
      <HistoryProductFilter
        onFinish={(values: any) => {
          const { from_action_date, to_action_date, condition } = values;

          if (from_action_date) {
            values.from_action_date = getStartOfDay(from_action_date);
          }
          if (to_action_date) {
            values.to_action_date = getEndOfDay(to_action_date);
          }
          values.condition = condition && condition.trim();
          const newParams = { ...params, ...values, page: 1 };

          setParams(newParams);
          const queryParam = generateQuery(newParams);
          history.replace(`${ProductTabUrl.HISTORY_PRICES}?${queryParam}`);
        }}
        onShowColumnSetting={() => setIsShowSettingColumn(true)}
        onMenuClick={() => {}}
        actions={[]}
      />
      <CustomTable
        className="small-padding"
        bordered
        rowKey={(record) => record.id}
        isRowSelection
        scroll={{ x: "max-content" }}
        columns={columnFinal}
        dataSource={data.items}
        isLoading={isLoading}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        isShowPaginationAtHeader
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: changePage,
          onShowSizeChange: changePage,
        }}
      />
      <ModalSettingColumn
        isSetDefaultColumn
        visible={isShowSettingColumn}
        onCancel={() => setIsShowSettingColumn(false)}
        onOk={(data) => {
          setIsShowSettingColumn(false);
          setColumns(data);
          onSaveConfigTableColumn(data);
        }}
        data={defaultColumns}
      />
    </StyledComponent>
  );
};

export default TabHistoryPrice;
