import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
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


const initParams: PointAdjustmentListRequest = {
  page: 1,
  limit: 30,
  id: null,
  reasons: [],
};

const TYPE_ADJUSTMENT = [
  {
    title: "Tặng điểm",
    value: "ADD"
  },
  {
    title: "Trừ điểm",
    value: "SUBTRACT"
  }
]
const createPointAdjustmentPermission = [LoyaltyPermission.points_update];


const PointAdjustment = () => {

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
      width: "10%"
    },
    {
      title: "Số KH",
      width: "6%",
      render: (value: any, item: any) => (
        <div style={{ textAlign: "right" }}>
          1
        </div>
      ),
    },
    {
      title: "Kiểu điều chỉnh",
      dataIndex: "type",
      width: "10%",
      align: "center",
      render: (value: any, item: any) => {
        const type = TYPE_ADJUSTMENT.find(type => type.value === value);
        return (
          <div>{type?.title}</div>
        )
      },
    },
    {
      title: "Giá trị",
      dataIndex: "change_point",
      width: "10%",
      align: "center",
      render: (value: any, item: any) => (
        <div style={{ textAlign: "right" }}>
          <NumberFormat
            value={value}
            displayType={"text"}
            thousandSeparator={true}
          />
        </div>
      ),
    },
    {
      title: "Lý do điều chỉnh",
      dataIndex: "reason",
      width: "15%"
    },
    {
      title: "Người điều chỉnh",
      dataIndex: "created_by",
      width: "15%"
    },
    {
      title: "Ngày điều chỉnh",
      dataIndex: "created_date",
      align: "center",
      width: "12%",
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
      const filterParams = { ...params, ...values, page: 1 };
      setParams(filterParams);
    },
    [params]
  );

  const onClearFilter = useCallback(() => {
    setParams(initParams);
  }, []);


  const onPageChange = useCallback(
    (page, limit) => {
      setParams({ ...params, page, limit });
      window.scrollTo(0, 0);
    },
    [params]
  );

  const updatePointAdjustmentData = useCallback((data: any) => {
    setIsLoading(false);
    if (!!data) {
      setPointAdjustmentData(data);
    }
  }, [])

  useEffect(() => {
    setIsLoading(true);
    dispatch(getPointAdjustmentListAction(params, updatePointAdjustmentData));
  }, [dispatch, updatePointAdjustmentData, params]);
  

  return (
    <StyledPointAdjustment>
      <ContentContainer
        title="Phiếu điều chỉnh"
        extra={
          <>
            {allowCreatePointAdjustment &&
              <Link to={`${UrlConfig.CUSTOMER}/point-adjustments/create`}>
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
            initParams={initParams}
            onClearFilter={onClearFilter}
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