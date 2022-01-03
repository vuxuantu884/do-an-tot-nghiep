import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import UrlConfig, {ProductTabUrl} from "config/url.config";
import {productGetHistoryAction} from "domain/actions/product/products.action";
import {PageResponse} from "model/base/base-metadata.response";
import {ProductHistoryQuery, ProductHistoryResponse} from "model/product/product.model";
import {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";
import {Link} from "react-router-dom";
import {generateQuery} from "utils/AppUtils";
import {OFFSET_HEADER_TABLE} from "utils/Constants";
import {ConvertUtcToLocalDate, getEndOfDay, getStartOfDay} from "utils/DateUtils";
import {getQueryParams, useQuery} from "utils/useQuery";
import HistoryProductFilter from "../../filter/HistoryProductFilter";
const initQuery: ProductHistoryQuery = {};

const IS_PRODUCT_TYPE = ["ADD_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT"];

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

  const onResult = useCallback((result: PageResponse<ProductHistoryResponse> | false) => {
    setLoading(false);
    if (result) {
      setData(result);
    }
  }, []);
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
      setParams({...params});
      history.replace(`${ProductTabUrl.PRODUCT_HISTORIES}?${queryParam}`);
    },
    [history, params]
  );
  const [columns, setColumns] = useState<
    Array<ICustomTableColumType<ProductHistoryResponse>>
  >([
    {
      title: "Sản phẩm",
      dataIndex: "history_type",
      visible: true,
      fixed: "left",
      render: (value, item) => {
        if (IS_PRODUCT_TYPE.includes(value)) {
          return (
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${item.product_id}`}>
                {item.product_code}
              </Link>
              <div>{<TextEllipsis value={item.product_name} line={1} />}</div>
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
      visible: true,
      align: "left",
      render: (value, record) => {
        return (
          <div>
            <Link to={`${UrlConfig.ACCOUNTS}/${value}`}>{value}</Link>
            <div>{record.action_name}</div>
          </div>
        );
      },
    },
    {
      title: "Log ID",
      dataIndex: "code",
      visible: true,
      align: "center",
    },
    {
      title: "Thao tác",
      dataIndex: "history_type_name",
      visible: true,
      align: "left",
    },
    {
      title: "Thời gian",
      visible: true,
      align: "left",
      dataIndex: "created_date",
      render: (value) => ConvertUtcToLocalDate(value),
      width: 160
    },
  ]);
  useEffect(() => {
    setLoading(true);
    dispatch(productGetHistoryAction(params, onResult));
  }, [dispatch, onResult, params]);

  return (
    <div>
      <HistoryProductFilter
        onFinish={(values: any) => {
          let {from_action_date, to_action_date, condition} = values;
          if (from_action_date) {
            values.from_action_date = getStartOfDay(from_action_date);
          }
          if (to_action_date) {
            values.to_action_date = getEndOfDay(to_action_date);
          }
          values.condition = condition && condition.trim();
          let newParams = {...params, ...values, page: 1};
          setParams(newParams);
          let queryParam = generateQuery(newParams);
          history.replace(`${ProductTabUrl.PRODUCT_HISTORIES}?${queryParam}`);
        }}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onMenuClick={() => {}}
        actions={[]}
      />
      <CustomTable
        bordered
        rowKey={(record) => record.id}
        isRowSelection
        columns={columns}
        dataSource={data.items}
        isLoading={loading}
        sticky={{offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE}}
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
        }}
        data={columns}
      />
    </div>
  );
};

export default TabHistoryInfo;
