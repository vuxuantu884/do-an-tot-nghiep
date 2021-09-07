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
const initQuery: ProductHistoryQuery = {};

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
      dataIndex: "data",
      visible: true,
      render: (value) => {
        let data = JSON.parse(value);
        console.log(data);
        return (
          <div>
            <Link to="">{data.code}</Link>
            <div>{data.name}</div>
          </div>
        );
      },
    },
    {
      title: "Người sửa",
      dataIndex: "data",
      visible: true,
      align: "center",
      render: (value) => {
        let data = JSON.parse(value);
        return data.updated_name;
      },
    },
    {
      title: "Log ID",
      dataIndex: "id",
      visible: true,
      align: "center",
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      visible: true,
      align: "center",
      render: (value) => (value === "Create" ? "Thêm mới" : "Cập nhật"),
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
      <HistoryProductFIlter onMenuClick={() => {}} actions={[]} />
      <CustomTable
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

export default TabHistoryInfo;
