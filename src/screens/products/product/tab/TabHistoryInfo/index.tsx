import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { productGetHistoryAction } from "domain/actions/product/products.action";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { PageResponse } from "model/base/base-metadata.response";
import {
  ProductHistoryQuery,
  ProductHistoryResponse,
} from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE } from "utils/Constants";
import {
  ConvertUtcToLocalDate,
  getEndOfDay,
  getStartOfDay,
} from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import HistoryProductFilter from "../../filter/HistoryProductFilter";
import { StyledComponent } from "../style";
const initQuery: ProductHistoryQuery = {};

const IS_PRODUCT_TYPE = [
  "ADD_PRODUCT",
  "UPDATE_PRODUCT",
  "DELETE_PRODUCT",
  "UPDATE_PRODUCT_STATUS",
];

const TabHistoryInfo: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [data, setData] = useState<PageResponse<ProductHistoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const onResult = useCallback(
    (result: PageResponse<ProductHistoryResponse> | false) => {
      setLoading(false);
      if (result) {
        setData(result);
      }
    },
    [],
  );
  let dataQuery: ProductHistoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<ProductHistoryQuery>(dataQuery);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${ProductTabUrl.PRODUCT_HISTORIES}?${queryParam}`);
    },
    [history, params],
  );

  const defaultColumn: Array<ICustomTableColumType<ProductHistoryResponse>> =
    useMemo(() => {
      return [
        {
          title: "Sản phẩm",
          dataIndex: "history_type",
          key: "history_type",
          visible: true,
          fixed: "left",
          render: (value, item) => {
            if (IS_PRODUCT_TYPE.includes(value)) {
              return (
                <div>
                  <Link to={`${UrlConfig.PRODUCT}/${item.product_id}`}>
                    {item.product_code}
                  </Link>
                  <div>
                    {<TextEllipsis value={item.product_name} line={1} />}
                  </div>
                </div>
              );
            }
            return (
              <div>
                <Link
                  to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                >
                  {item.sku}
                </Link>
                <div>{<TextEllipsis value={item.variant_name} line={1} />}</div>
              </div>
            );
          },
        },
        {
          title: "Người sửa",
          width: 200,
          dataIndex: "action_by",
          key: "action_by",
          visible: true,
          align: "left",
          render: (value, record) => {
            return (
              <div>
                {value !== null ? (
                  <Link
                    target="_blank"
                    to={`${UrlConfig.ACCOUNTS}/${record?.action_by}`}
                  >
                    {record.action_name}
                  </Link>
                ) : (
                  "---"
                )}
              </div>
            );
          },
        },
        {
          title: "Log ID",
          dataIndex: "code",
          key: "code",
          visible: true,
          align: "center",
        },
        {
          title: "Thao tác",
          dataIndex: "history_type_name",
          key: "history_type_name",
          visible: true,
          align: "left",
        },
        {
          title: "Thời gian",
          visible: true,
          align: "left",
          dataIndex: "action_date",
          key: "action_date",
          render: (value) =>
            value !== null ? ConvertUtcToLocalDate(value) : "---",
          width: 160,
        },
      ];
    }, []);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<ProductHistoryResponse>>>(
      defaultColumn,
    );

  const { tableColumnConfigs, onSaveConfigTableColumn } =
    useHandleFilterColumns(COLUMN_CONFIG_TYPE.COLUMN_PRODUCT_HISTORY);
  useSetTableColumns(
    COLUMN_CONFIG_TYPE.COLUMN_PRODUCT_HISTORY,
    tableColumnConfigs,
    defaultColumn,
    setColumns,
  );

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  useEffect(() => {
    setLoading(true);
    dispatch(productGetHistoryAction(params, onResult));
  }, [dispatch, onResult, params]);

  return (
    <StyledComponent>
      <HistoryProductFilter
        onFinish={(values: any) => {
          let { from_action_date, to_action_date, condition } = values;
          if (from_action_date) {
            values.from_action_date = getStartOfDay(from_action_date);
          }
          if (to_action_date) {
            values.to_action_date = getEndOfDay(to_action_date);
          }
          values.condition = condition && condition.trim();
          let newParams = { ...params, ...values, page: 1 };
          setParams(newParams);
          let queryParam = generateQuery(newParams);
          history.replace(`${ProductTabUrl.PRODUCT_HISTORIES}?${queryParam}`);
        }}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onMenuClick={() => {}}
        actions={[]}
      />
      <CustomTable
        className="small-padding"
        bordered
        rowKey={(record) => record.id}
        isRowSelection
        columns={columnFinal}
        dataSource={data.items}
        isLoading={loading}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumns(data);
          onSaveConfigTableColumn(data);
        }}
        data={defaultColumn}
      />
    </StyledComponent>
  );
};

export default TabHistoryInfo;
