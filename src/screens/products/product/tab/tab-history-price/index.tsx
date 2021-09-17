import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig from "config/url.config";
import { productGetHistoryAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  ProductHistoryQuery,
  ProductHistoryResponse,
} from "model/product/product.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import HistoryProductFIlter from "../../filter/HistoryProductFilter";
const initQuery: ProductHistoryQuery = {
  history_type: 'UPDATE_PRICE'
};

const IS_PRODUCT_TYPE = ['ADD_PRODUCT','UPDATE_PRODUCT','DELETE_PRODUCT']

const TabHistoryPrice: React.FC = () => {
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
    []
  );
  let dataQuery: ProductHistoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<ProductHistoryQuery>(dataQuery);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PRODUCT}#2?${queryParam}`);
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
      fixed: 'left',
      width: 200,
      render: (value, item) => {
        if (IS_PRODUCT_TYPE.includes(value)){
          return (
            <div>
              <Link to="">{item.product_code}</Link>
              <div>{item.product_name}</div>
            </div>
          );
        }
        return (
          <div>
            <Link to="">{item.sku}</Link>
            <div>{item.variant_name}</div>
          </div>
        );
      },
    },
    {
      title: "Giá nhập cũ",
      dataIndex: "data_old",
      visible: true,
      align: "center",
      render: (value) => {
        const DATA_CONVERT = JSON.parse(value);
        return (
          DATA_CONVERT.import_price
        )
      }
    },
    {
      title: "Giá nhập mới",
      dataIndex: "data_current",
      visible: true,
      align: "center",
      render: (value) => {
        const DATA_CONVERT = JSON.parse(value);
        return (
          DATA_CONVERT.import_price
        )
      }
    },
    {
      title: "Giá bán cũ",
      dataIndex: "data_old",
      visible: true,
      align: "center",
      render: (value) => {
        const DATA_CONVERT = JSON.parse(value);
        return (
          DATA_CONVERT.retail_price
        )
      }
    },
    {
      title: "Giá bán mới",
      dataIndex: "data_current",
      visible: true,
      align: "center",
      render: (value) => {
        const DATA_CONVERT = JSON.parse(value);
        return (
          DATA_CONVERT.retail_price
        )
      }
    },
    {
      title: "Người sửa",
      dataIndex: "action_name",
      visible: true,
      align: "center",
    },
    {
      title: "Thời gian",
      visible: true,
      align: "center",
      dataIndex: "created_date",
      render: (value) => ConvertUtcToLocalDate(value) 
    },
  ]);
  useEffect(() => {
    setLoading(true);
    dispatch(productGetHistoryAction(params, onResult));
  }, [dispatch, onResult, params]);

  return (
    <div className="padding-20">
      <HistoryProductFIlter 
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onMenuClick={() => {}}
        actions={[]}
      />
      <CustomTable
        scroll={{ x: 1300 }}
        columns={columns}
        dataSource={data.items}
        isLoading={loading}
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
            setColumns(data)  
          }}
          data={columns}
        />
    </div>
  );
};

export default TabHistoryPrice;
