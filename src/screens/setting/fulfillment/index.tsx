

import { Card } from 'antd';
import ContentContainer from 'component/container/content.container';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import UrlConfig from 'config/UrlConfig';
import { actionFetchList } from 'domain/actions/settings/fulfillment.action';
import { VariantResponse } from 'model/product/product.model';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';


const SettingFulfillment: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const dispatch = useDispatch();
  const [columns, setColumn]  = useState<Array<ICustomTableColumType<VariantResponse>>>([
    {
      title: "Trạng thái xử lý",
      dataIndex: "statusProcess",
      visible: true,
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "statusFulfillment",
      visible: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
    },
    {
      title: "Áp dụng ",
      dataIndex: "apply",
      visible: true,
    },
  ]);
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  useEffect(() => {
    dispatch(actionFetchList());
  }, [dispatch])

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
          // pagination={{
          //   pageSize: data.metadata.limit,
          //   total: data.metadata.total,
          //   current: data.metadata.page,
          //   showSizeChanger: true,
          //   onChange: onPageChange,
          //   onShowSizeChange: onPageChange,
          // }}
          // onShowColumnSetting={() => setShowSettingColumn(true)}
          // dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: VariantResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default SettingFulfillment;
