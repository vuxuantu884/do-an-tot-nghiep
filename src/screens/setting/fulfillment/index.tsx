

import { Card } from 'antd';
import ContentContainer from 'component/container/content.container';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import UrlConfig from 'config/UrlConfig';
import { actionFetchList } from 'domain/actions/settings/fulfillment.action';
import { VariantResponse, VariantSearchQuery } from 'model/product/product.model';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { generateQuery } from 'utils/AppUtils';


const SettingFulfillment: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const dispatch = useDispatch();
  const data = useSelector((state:any) => {
    return state.settings.fulfillment.list;
  });

  const [columns, setColumn]  = useState<Array<ICustomTableColumType<VariantResponse>>>([
    {
      title: "Trạng thái xử lý",
      dataIndex: "name",
      visible: true,
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "color",
      visible: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "size",
      visible: true,
    },
    {
      title: "Áp dụng ",
      dataIndex: "status",
      visible: true,
    },
  ]);
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const history = useHistory();
  
  let [params, setParams] = useState({
    page: 1,
    limit: 30,
  });
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.FULFILLMENTS}?${queryParam}`);
    },
    [history, params]
  );

  useEffect(() => {
    dispatch(actionFetchList(params));
  }, [dispatch, params])

  return (
    <ContentContainer
      title="Xử lý đơn hàng"
      breadcrumb={[
        {
          name: 'Tổng quan',
          path: UrlConfig.HOME,
        },
        {
          name: 'Cài đặt',
          path: UrlConfig.ACCOUNTS,
        },
        {
          name: 'Xử lý đơn hàng',
        },
      ]}
    >
      <Card>
        <CustomTable
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: 1080 }}
          pagination={{
            pageSize: params.limit,
            total: 50,
            current: params.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          // onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data}
          columns={columnFinal}
          rowKey={(item: VariantResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default SettingFulfillment;
