import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { RoleSearchAction } from "domain/actions/auth/role.action";
import { RoleResponse, RoleSearchQuery } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

const ManageRoleScreen = () => {
  const dispatch = useDispatch();
  //state
  const query = useQuery();
  const history = useHistory();
  const [data, setData] = useState<PageResponse<RoleResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  let dataQuery: RoleSearchQuery = {
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<RoleSearchQuery>(dataQuery);
  const [loading, setLoading] = useState(false);
  const [columns, setColumn] = useState<Array<ICustomTableColumType<RoleResponse>>>([
    {
      title: "Tên nhóm quyền",
      width: 250,
      dataIndex: "code",
      render: (value, item) => {
        return <Link to={`${UrlConfig.STORE}/${item.id}`}>{value}</Link>;
      },
      visible: true,
    },
    {
      title: "Vai trò",
      dataIndex: "name",
      visible: true
    },
    {
      title: "Ngày cập nhật lần cuối",
      dataIndex: "updated_date",
      align: 'center',
      width: 250,
      visible: true,
      render: (value: string) => {
        return ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY);
      },
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
      align: 'center',
      width: 250,
      visible: true
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      align: 'left',
      width: 130,
      visible: false,
      render: (value: string) => {
        return ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY);
      },
    },
    {
      title: "Người sửa",
      dataIndex: "updated_name",
      align: 'center',
      width: 150,
      visible: false
    },
  ]);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.size = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onSuccess = useCallback((data: PageResponse<RoleResponse>) => {
    setLoading(false);
    setData(data);  
  }, []);  
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);
  useEffect(() => {
    setLoading(true);
    dispatch(RoleSearchAction(params, onSuccess));
  }, [dispatch, onSuccess, params]);
  return (
    <ContentContainer title="Quản lý phân quyền" breadcrumb={[
      {
        name: 'Tổng quản',
        path: UrlConfig.HOME,
      },
      {
        name: 'Phân quyền',
        path: `${UrlConfig.ROLES}`
      },
    ]}>
      <Card>
        <CustomTable
          isLoading={loading}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          scroll={{ x: 1080 }}
          // onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: RoleResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  )
}

export default ManageRoleScreen;