import {Card} from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {searchDepartmentAction} from "domain/actions/account/department.action";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Link} from "react-router-dom";
import {convertDepartment} from "utils/AppUtils";
import {DepartmentsPermissions} from "config/permissions/account.permisssion";
import useAuthorization from "hook/useAuthorization";
import NoPermission from "screens/no-permission.screen";
import {ConvertUtcToLocalDate} from "utils/DateUtils";
import {DepartmentView} from "model/account/department.model";
import {OFFSET_HEADER_UNDER_NAVBAR} from "utils/Constants";

const DepartmentSearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<Array<DepartmentView>>([]);

  //phân quyền
  const [allowReadDep] = useAuthorization({
    acceptPermissions: [DepartmentsPermissions.READ],
  });
  const [allowCreateDep] = useAuthorization({
    acceptPermissions: [DepartmentsPermissions.CREATE],
  });

  useEffect(() => {
    setLoading(true);
    dispatch(
      searchDepartmentAction((result) => {
        setLoading(false);
        if (result) {
          let array: Array<DepartmentView> = convertDepartment(result);
          setData(array);
          console.log(array);
        } else {
          setError(false);
        }
      })
    );
  }, [dispatch]);
  return (
    <>
      {allowReadDep ? (
        <ContentContainer
          title="Quản lý bộ phận"
          isError={error}
          breadcrumb={[
            {
              name: "Tổng quan",
              path: UrlConfig.HOME,
            },
            {
              name: "Quản lý bộ phận",
            },
          ]}
          extra={
            allowCreateDep ? (
              <ButtonCreate
                child="Thêm bộ phận"
                path={`${UrlConfig.DEPARTMENT}/create`}
              />
            ) : null
          }
        >
          <Card>
            <CustomTable
              dataSource={data}
              rowKey={(data) => data.id}
              isLoading={loading}
              pagination={false}
              isRowSelection
              scroll={{x: 1480}}
              sticky={{offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR}}
              columns={[
                {
                  title: "Mã bộ phận",
                  dataIndex: "code",
                  width: 120,
                  render: (text: string, item: DepartmentView) => {
                    return <Link to={`${UrlConfig.DEPARTMENT}/${item.id}`}>{text}</Link>;
                  },
                },
                {
                  title: "Tên bộ phận",
                  dataIndex: "name",
                  width: 200,
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
                  width: 140,
                },
                {
                  title: "Địa chỉ",
                  dataIndex: "address",
                  width: 140,
                },
                {
                  title: "Quản lý",
                  dataIndex: "manager",
                  width: 120,
                  render: (value, record: DepartmentView) =>
                    value === null ? (
                      ""
                    ) : (
                      <Link
                        to={`${UrlConfig.ACCOUNTS}/${record.manager_code}`}
                      >{`${record.manager_code} - ${value}`}</Link>
                    ),
                },
                {
                  title: "Người tạo",
                  dataIndex: "created_by",
                  width: 140,
                  render: (value, record: DepartmentView) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div>{record?.updated_by}</div>
                      <div>{record?.updated_name}</div>
                    </div>
                  ),
                },
                {
                  title: "Ngày tạo",
                  dataIndex: "created_date",
                  render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
                  width: 120,
                },
              ]}
            />
          </Card>
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </>
  );
};

export default DepartmentSearchScreen;
