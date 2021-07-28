import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import {
  ICustomTableColumType
} from "component/table/CustomTable";
import CustomTableStyle2 from "component/table/CustomTableStyle2";
import UrlConfig from "config/UrlConfig";
import { actionFetchList } from "domain/actions/settings/fulfillment.action";
import {
  VariantResponse
} from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { StyledComponent } from "./styles";

const OrderSources: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const dispatch = useDispatch();
  const data = useSelector((state: any) => {
    return state.settings.fulfillment.list;
  });

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<VariantResponse>>
  >([
    {
      title: "Nguồn đơn hàng",
      dataIndex: "name",
      visible: true,
    },
    {
      title: "Áp dụng cho đơn hàng",
      dataIndex: "color",
      visible: true,
    },
    {
      title: "Mặc định",
      dataIndex: "size",
      visible: true,
    },
  ]);
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

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
  }, [dispatch, params]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Nguồn đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Nguồn đơn hàng",
          },
        ]}
      >
        <Card>
          <CustomTableStyle2
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
    </StyledComponent>
  );
};

export default OrderSources;
