import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { searchDepartmentAction } from "domain/actions/account/department.action";
import { DepartmentResponse } from "model/account/department.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const DepartmentSearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<Array<DepartmentResponse>>([]);
  useEffect(() => {
    setLoading(true);
    dispatch(searchDepartmentAction((result) => {
      setLoading(false);
      if(result) {
        setData(result)
      } else {
        setError(false);
      }
    }))
  }, [dispatch]);
  return (
    <ContentContainer
      title="Quản lý phòng ban/bộ phận"
      isError={error}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý phòng ban/bộ phận",
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.DEPARTMENT}/create`} />}
    >
      <Card>
        <CustomTable 
          dataSource={data}
          rowKey={data => data.id}
          isLoading={loading}
          pagination={false}
          isRowSelection
          columns={[
            {
              title: "Mã phòng ban/Bộ phận",
              dataIndex: "code",
            },
            {
              title: "Tên phhòng ban/Bộ phận",
              dataIndex: "name",
            },
            {
              title: "Số điện thoại",
              dataIndex: "mobile",
            },
            {
              title: "Địa chỉ",
              dataIndex: "address",
            },
            {
              title: "Quản lý",
              dataIndex: "manager",
            }
          ]}
        />
      </Card>
    </ContentContainer>
  );
}

export default DepartmentSearchScreen;  