import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { searchDepartmentAction } from "domain/actions/account/department.action";
import { DepartmentView } from "model/account/department.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { convertDepartment } from "utils/AppUtils";

const DepartmentSearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<Array<DepartmentView>>([]);
  useEffect(() => {
    setLoading(true);
    dispatch(searchDepartmentAction((result) => {
      setLoading(false);
      if(result) {
        let array: Array<DepartmentView> = convertDepartment(result);
        setData(array)
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
              render: (text: string, item: DepartmentView) => {
                return <Link to={`${UrlConfig.DEPARTMENT}/${item.id}`}>{text}</Link>;
              },
            },
            {
              title: "Tên phhòng ban/Bộ phận",
              dataIndex: "name",
              render: (value: string, item: DepartmentView) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  {item.level > 0 && (
                    <div
                      style={{
                        borderRadius: 2,
                        width: 20 * item.level,
                        height: 3,
                        background: "rgba(42, 42, 134, 0.2)",
                        marginRight: 8,
                      }}
                    />
                  )}
                  <span>{value}</span>
                </div>
              ),
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
              render: (value, record: DepartmentView) => value === null ? "" : (
                <Link to={`${UrlConfig.ACCOUNTS}/${record.manager_code}`}>{`${record.manager_code} - ${value}`}</Link>
              )
            }
          ]}
        />
      </Card>
    </ContentContainer>
  );
}

export default DepartmentSearchScreen;  