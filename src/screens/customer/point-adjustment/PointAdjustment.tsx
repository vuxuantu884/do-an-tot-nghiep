import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Button, Card } from 'antd';

import UrlConfig from 'config/url.config';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import { PageResponse } from 'model/base/base-metadata.response';
import { PointAdjustmentListRequest } from 'model/request/loyalty/loyalty.request';
import { getPointAdjustmentListAction } from 'domain/actions/loyalty/loyalty.action';
import { LoyaltyPermission } from 'config/permissions/loyalty.permission';
import PointAdjustmentFilter from 'screens/customer/point-adjustment/PointAdjustmentFilter';
import ContentContainer from 'component/container/content.container';

import { StyledPointAdjustment } from 'screens/customer/point-adjustment/StyledPointAdjustment';
import mathPlusIcon from "assets/icon/math-plus.svg";
import { ConvertUtcToLocalDate } from 'utils/DateUtils';
import NumberFormat from 'react-number-format';
import useAuthorization from 'hook/useAuthorization';
import { generateQuery } from 'utils/AppUtils';
import { getQueryParamsFromQueryString } from 'utils/useQuery';
import queryString from "query-string";



const initParams: PointAdjustmentListRequest = {
  page: 1,
  limit: 30,
  id: null,
  term: null,
  reasons: [],
  emps: [],
  from: null,
  to: null,
};

const createPointAdjustmentPermission = [LoyaltyPermission.points_update];


const PointAdjustment = () => {

  const history = useHistory()
  const location = useLocation()

  const queryParamsParsed: any = queryString.parse(
    location.search
  );

  const [allowCreatePointAdjustment] = useAuthorization({
    acceptPermissions: createPointAdjustmentPermission,
    not: false,
  });


  const [pointAdjustmentData, setPointAdjustmentData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      render: (value: any, item: any, index: number) =>
        <div>{(pointAdjustmentData.metadata.page - 1) * pointAdjustmentData.metadata.limit + index + 1}</div>,
      width: "5%"
    },
    {
      title: "Mã phiếu",
      dataIndex: "id",
      width: "9%",
      render: (value: string, item: any) => {
        return (
          <Link to={`${UrlConfig.CUSTOMER2}-adjustments/${item.id}`}>{item.code}</Link>
        )
      }
    },
    {
      title: "Tên phiếu điều chỉnh",
      dataIndex: "name",
      width: "15%",
      render: (value: string, item: any) => {
        return (
          <Link to={`${UrlConfig.CUSTOMER2}-adjustments/${item.id}`}>{item.name}</Link>
        )
      }
    },
    {
      title: "Số KH",
      width: "8%",
      render: (value: any, item: any) => (
        <div style={{ textAlign: "right" }}>
          {item.customers?.length &&
            <NumberFormat
              value={item.customers?.length}
              displayType={"text"}
              thousandSeparator={true}
            />
          }
        </div>
      ),
    },
    {
      title: "Kiểu điều chỉnh",
      dataIndex: "type",
      width: "7%",
      align: "center",
      render: (value: any, row: any, index: any) => {
        let adjustmentType;
        switch(value) {
          case "ADD_POINT":
            adjustmentType = "Tặng điểm"
            break;
          case "SUBTRACT_POINT":
            adjustmentType = "Trừ điểm"
            break;
          case "ADD_MONEY":
            adjustmentType = "Tặng tiền"
            break;
          case "SUBTRACT_MONEY":
            adjustmentType = "Trừ tiền"
            break;
      }
        return <span>{adjustmentType}</span>;
      },
    },
    {
      title: "Giá trị",
      dataIndex: "value_change",
      width: "8%",
      align: "center",
      render: (value: any, item: any) => (
        <div style={{ textAlign: "right" }}>
          {value &&
            <NumberFormat
            value={value}
            displayType={"text"}
            thousandSeparator={true}
            />
          }
        </div>
      ),
    },
    {
      title: "Lý do điều chỉnh",
      dataIndex: "reason",
      width: "12%"
    },
    {
      title: "Người điều chỉnh",
      dataIndex: "created_by",
      width: "10%"
    },
    {
      title: "Ngày điều chỉnh",
      dataIndex: "created_date",
      align: "center",
      width: "9%",
      render: (value: any, item: any) => (
        <div>{ConvertUtcToLocalDate(value, "HH:mm DD/MM/YYYY")}</div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
    },
  ]
  const dispatch = useDispatch()

  const [params, setParams] = useState<PointAdjustmentListRequest>({ ...initParams });
  const [isLoading, setIsLoading] = useState(false);

  const onFilter = useCallback(
    (values) => {
      const filterParams = { ...params,...values };
      const currentParam = generateQuery(params)
      const queryParam = generateQuery(filterParams)
      if (currentParam !== queryParam) {
        history.push(`${location.pathname}?${queryParam}`)
      }

    },
    [history, location.pathname, params]
  );


  const onPageChange = useCallback(
    (page, limit) => {
      let newPrams = { ...params, page, limit };
      let queryParam = generateQuery(newPrams);
			history.push(`${location.pathname}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, location.pathname, params]
  );

  const updatePointAdjustmentData = useCallback((data: any) => {
    setIsLoading(false);
    if (!!data) {
      setPointAdjustmentData(data);
    }
  }, [])

  const getPointAdjustmentList = (params: PointAdjustmentListRequest) => {
    setIsLoading(true);

    const convertReasonsToArr : any[] = Array.isArray(params.reasons) ? params.reasons : [params.reasons];
    const convertEmployeesToArr: any[] = Array.isArray(params.emps) ? params.emps : [params.emps];

    const newParams = {
      ...params, 
      reasons: convertReasonsToArr,
      emps: convertEmployeesToArr,
    }

    dispatch(getPointAdjustmentListAction(newParams, updatePointAdjustmentData));
  }

  useEffect(() => {
    let dataQuery: PointAdjustmentListRequest = {
      ...initParams,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setParams(dataQuery)
    getPointAdjustmentList(dataQuery)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);

  return (
    <StyledPointAdjustment>
      <ContentContainer
        title="Phiếu điều chỉnh"
        extra={
          <>
            {allowCreatePointAdjustment &&
              <Link to={`${UrlConfig.CUSTOMER2}-adjustments/create`}>
                <Button
                  className="ant-btn-outline ant-btn-primary"
                  size="large"
                  icon={<img src={mathPlusIcon} style={{ marginRight: 8 }} alt="" />}
                >
                  Thêm mới phiếu điều chỉnh
                </Button>
              </Link>
            }
          </>
        }
      >
        <Card>
          <PointAdjustmentFilter
            isLoading={isLoading}
            params={params}
            onFilter={onFilter}
          />
          
          <CustomTable
            bordered
            isLoading={isLoading}
            scroll={{ x: 1366 }}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={{
              pageSize: pointAdjustmentData.metadata.limit,
              total: pointAdjustmentData.metadata.total,
              current: pointAdjustmentData.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={pointAdjustmentData.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </Card>
      </ContentContainer>
    </StyledPointAdjustment>
  )
}

export default PointAdjustment;