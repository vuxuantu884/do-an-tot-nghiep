import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import { LoyaltyCardReleaseSearch } from 'domain/actions/loyalty/release/loyalty-release.action';
import { PageResponse } from 'model/base/base-metadata.response';
import { BaseQuery } from 'model/base/base.query';
import { LoyaltyCardReleaseResponse } from 'model/response/loyalty/release/loyalty-card-release.response';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { DATE_FORMAT } from 'utils/DateUtils';
import './loyalty-cards-release.scss';

const LoyaltyCardRelease = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [data, setData] = useState<PageResponse<LoyaltyCardReleaseResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const pageColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      visible: true,
      fixed: "left",
      render: (value: any, item: any, index: number) => <div>{(data.metadata.page - 1) * data.metadata.limit + index + 1}</div>,
      width: '72px'
    },
    {
      title: "Tên đợt",
      dataIndex: "name",
      visible: true,
      fixed: "left"
    },
    {
      title: "Ngày tạo",
      visible: true,
      render: (value: any) => <div>{moment(value.created_date).format(DATE_FORMAT.DDMMYYY)}</div>
    },
    {
      title: "Người tạo",
      dataIndex: "Trạng thái",
      visible: true,
      fixed: "left"
    },
    {
      title: "Số lượng thẻ",
      dataIndex: "code",
      visible: true,
      fixed: "left"
    }
  ]
  const [query, setQuery] = useState<BaseQuery>({
    page: 1,
    limit: 30,
    sort_column: 'id',
    sort_type: 'DESC'
  });

  const dispatch = useDispatch()

  const fetchData = useCallback((data: PageResponse<LoyaltyCardReleaseResponse>) => {
    setData(data)
    setTableLoading(false)
  }, [])

  const onPageChange = useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },
    [query]
  );

  useEffect(() => {
    dispatch(LoyaltyCardReleaseSearch(query, fetchData));
  }, [dispatch, fetchData, query]);

  return (
    <div className="loyalty-cards-release">
      <CustomTable
        isLoading={tableLoading}
        sticky={{ offsetScroll: 5 }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        dataSource={data.items}
        columns={pageColumns}
        rowKey={(item: any) => item.id}
      />
    </div>
  )
}

export default LoyaltyCardRelease;