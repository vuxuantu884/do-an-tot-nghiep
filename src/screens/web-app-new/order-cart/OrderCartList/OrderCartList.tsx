import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { Link, useHistory, useLocation } from "react-router-dom";
import OrderCartListFilter from "./OrderCartListFilter/OrderCartListFilter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { getParamsFromQuery } from "utils/useQuery";
import queryString from "query-string";
import moment from "moment";
import { getAbandonCartListAction } from "domain/actions/web-app/web-app.actions";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

const OrderCartList = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const queryParamsParsed: any = queryString.parse(location.search);
  //init params
  const initQuery: any = {
    page: 1,
    limit: 30,
    searcher: null,
    updated_date_to: null,
    updated_date_from: null,
    abandoned_code: null,
    ecommerce_order_id: null,
  };
  let queryParams: any = {
    ...initQuery,
    ...getParamsFromQuery(queryParamsParsed, initQuery),
  };
  const [params, setParams] = useState<any>(queryParams);

  //handle filter
  const handleFilter = (value: any) => {
    let newParams = { ...params, ...value, page: 1 };
    if (newParams.updated_date_from != null) {
      newParams.updated_date_from = moment(newParams.updated_date_from, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    if (newParams.updated_date_to != null) {
      newParams.updated_date_to = moment(newParams.updated_date_to, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    let queryParam = generateQuery(params);
    let newQueryParam = generateQuery(newParams);
    if (newQueryParam !== queryParam) {
      setParams(newParams);
      history.push(`${location.pathname}?${newQueryParam}`);
    }
  };

  //handle change page
  const handleChangePage = (page: any, limit: any) => {
    const newPrams = { ...params, page: page, limit: limit };
    const queryParam = generateQuery(newPrams);
    setParams(newPrams);
    window.scrollTo(0, 0);
    history.push(`${location.pathname}?${queryParam}`);
  };

  //clear filter
  const handClearFilter = () => {
    setParams(initQuery);
    history.push(`${location.pathname}`);
  };

  //get variant data
  const getVarinantData = () => {
    setIsLoading(true);
    let newParams = { ...params };
    newParams.updated_date_from = newParams.updated_date_from
      ? moment(newParams.updated_date_from, "DD-MM-YYYY").utc(true).format()
      : null;
    newParams.updated_date_to = newParams.updated_date_to
      ? moment(newParams.updated_date_to, "DD-MM-YYYY").utc(true).format()
      : null;
    dispatch(
      getAbandonCartListAction(newParams, (result: any) => {
        setIsLoading(false);
        if (!!result) {
          setData(result);
        }
      }),
    );
  };
  useEffect(() => {
    getVarinantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const [columns] = useState<Array<ICustomTableColumType<any>>>([
    {
      title: "Mã giỏ hàng",
      key: "abandoned_code",
      width: "10%",
      align: "center",
      render: (item: any) => (
        <a href={`${UrlConfig.WEB_APP}-cart/${item?.code}/detail`}>{item?.code}</a>
      ),
    },
    {
      title: "Mã đơn trên sapo",
      key: "ecommerce_order_id",
      width: "10%",
      align: "center",
      render: (item: any) => <span>{item?.ecommerce_order_id}</span>,
    },
    {
      title: "Mã đơn trên unicorn",
      key: "core_order_id",
      width: "10%",
      align: "center",
      render: (item: any) => <span>{item?.core_order_id}</span>,
    },
    {
      title: "Ngày tạo",
      key: "created_date",
      width: "10%",
      align: "center",
      render: (item: any) => (
        <span>{ConvertUtcToLocalDate(item?.created_date, "DD/MM/YYYY HH:mm:ss")}</span>
      ),
    },
    {
      title: "Ngày update",
      key: "updated_date",
      width: "10%",
      align: "center",
      render: (item: any) => (
        <span>{ConvertUtcToLocalDate(item?.updated_date, "DD/MM/YYYY HH:mm:ss")}</span>
      ),
    },
    {
      title: "Khách hàng",
      key: "full_name",
      width: "10%",
      align: "center",
      render: (item: any) => <span>{item?.customer?.full_name}</span>,
    },
    {
      title: "Số điện thoại",
      key: "phone",
      width: "10%",
      align: "center",
      render: (item: any) => <span>{item?.customer?.phone}</span>,
    },
    {
      title: "Tổng tiền",
      key: "core_order_code",
      width: "10%",
      align: "center",
      render: (item: any) => <span>{item?.total_price}</span>,
    },
  ]);

  return (
    <div>
      <ContentContainer
        title="Danh sách giỏ hàng"
        breadcrumb={[
          {
            name: "Web/App",
            path: `${UrlConfig.WEB_APP}`,
          },
          {
            name: "Danh sách giỏ hàng",
          },
        ]}
      >
        <Card>
          <OrderCartListFilter
            isLoading={isLoading}
            params={params}
            initQuery={initQuery}
            onClearFilter={handClearFilter}
            onFilter={handleFilter}
            sourceList={data?.items}
          />

          <CustomTable
            bordered
            isLoading={isLoading}
            showColumnSetting={true}
            scroll={{ x: 1500 }}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={
              isLoading
                ? false
                : {
                    pageSize: data.metadata.limit,
                    total: data.metadata.total,
                    current: data.metadata.page,
                    showSizeChanger: true,
                    onChange: handleChangePage,
                    onShowSizeChange: handleChangePage,
                  }
            }
            // onSelectedChange={handleSelectRowTable}
            dataSource={data.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </Card>
      </ContentContainer>
    </div>
  );
};
export default OrderCartList;
