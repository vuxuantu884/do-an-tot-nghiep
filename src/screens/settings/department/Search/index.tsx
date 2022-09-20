import { Button, Card } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  departmentDetailAction,
  searchDepartmentPagingAction,
} from "domain/actions/account/department.action";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { DepartmentsPermissions } from "config/permissions/account.permisssion";
import useAuthorization from "hook/useAuthorization";
import NoPermission from "screens/no-permission.screen";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { DepartmentFilterProps, DepartmentView } from "model/account/department.model";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import DepartmentFilter from "../component/Filter";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useHistory } from "react-router";
import CustomPagination from "component/table/CustomPagination";
import LevelIcon from "assets/icon/level.svg";
import "./index.scss";

const initQuery: DepartmentFilterProps = {
  content: null,
  status: null,
  department_ids: null,
};

const DepartmentSearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  let dataQuery: DepartmentFilterProps = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<any>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [listDepartment, setDepartment] = useState<any>();
  const [params, setParams] = useState<DepartmentFilterProps>(dataQuery);
  const [columns, setColumn] = useState<any>([
    {
      fixed: "left",
      title: "Mã phòng ban",
      dataIndex: "code",
      width: 120,
      render: (text: string, item: DepartmentView) => {
        return <Link to={`${UrlConfig.DEPARTMENT}/${item.id}`}>{text}</Link>;
      },
    },
    {
      title: "Tên phòng ban",
      dataIndex: "name",
      width: 250,
    },
    {
      title: "Quản lý",
      dataIndex: "manager",
      width: 200,
      render: (value: string, record: DepartmentView) =>
        value === null ? (
          ""
        ) : (
          <Link
            to={`${UrlConfig.ACCOUNTS}/${record.manager_code}`}
          >{`${record.manager_code} - ${value}`}</Link>
        ),
    },
    {
      title: "Thông tin",
      dataIndex: "level",
      width: 250,
      render: (level: number, record: DepartmentView) => {
        return (
          <div>
            <div>
              Cấp độ:{" "}
              <span className={level ? (Number(level) < 3 ? "high-level" : "low-level") : ""}>
                {level}
              </span>
            </div>
            <div>
              Trực thuộc:{" "}
              {record.parent_name ? record.parent_name : Number(level) === 2 ? "YODY" : ""}
            </div>
          </div>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 130,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      width: 230,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      render: (status: string) => {
        return status ? (
          status === "active" ? (
            <span style={{ color: "#27AE60" }}>Đang hoạt động</span>
          ) : (
            <span style={{ color: "#E24343" }}>Ngừng hoạt động</span>
          )
        ) : (
          ""
        );
      },
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
      width: 150,
      render: (value: string, record: DepartmentView) =>
        value === null ? (
          ""
        ) : (
          <Link
            to={`${UrlConfig.ACCOUNTS}/${record.created_by}`}
          >{`${record.created_by} - ${value}`}</Link>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      width: 120,
    },
  ]);

  //phân quyền
  const [allowReadDep] = useAuthorization({
    acceptPermissions: [DepartmentsPermissions.READ],
  });
  const [allowCreateDep] = useAuthorization({
    acceptPermissions: [DepartmentsPermissions.CREATE],
  });

  function convertDepartmentToNoChild(array: any) {
    array = array.filter((j: any) => j.children.length > 0);
    array.forEach((i: any) => {
      i.children = convertDepartmentToNoChild(i.children);
    });
    return array;
  }

  const onResDepartment = useCallback((departmentData: any) => {
    let newDepartments = convertDepartmentToNoChild(departmentData);

    setDepartment(newDepartments);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(
      searchDepartmentPagingAction(params, (result) => {
        setLoading(false);
        if (result) {
          const newItems = result.items.map((i) => {
            return {
              ...i,
              children: null,
            };
          });
          setData({
            metadata: result.metadata,
            items: newItems,
          });
          return;
        }

        setError(false);
      }),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, params]);

  useEffect(() => {
    dispatch(departmentDetailAction("", onResDepartment));
  }, [dispatch, onResDepartment]);

  const onFilter = useCallback(
    (values) => {
      values.info = values.info ? values.info.trim() : null;
      let newPrams = { ...params, ...values, page: 1 };
      setParams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.DEPARTMENT}?${queryParam}`);
    },
    [history, params],
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      let queryParam = generateQuery({ ...params });
      history.push(`${history.location.pathname}?${queryParam}`);
    },
    [history, params],
  );

  return (
    <>
      {allowReadDep ? (
        <ContentContainer
          title="Quản lý phòng ban"
          isError={error}
          breadcrumb={[
            {
              name: "Cài đặt",
              path: UrlConfig.HOME,
            },
            {
              name: "Quản lý phòng ban",
            },
          ]}
          extra={
            <>
              <Link to={`${UrlConfig.DEPARTMENT}/overview`}>
                <Button
                  className="btn-view"
                  icon={<img className="icon-level" src={LevelIcon} alt="level" />}
                >
                  Xem sơ đồ tổng quan
                </Button>
              </Link>
              {allowCreateDep && (
                <ButtonCreate child="Thêm phòng ban" path={`${UrlConfig.DEPARTMENT}/create`} />
              )}
            </>
          }
        >
          <Card>
            <DepartmentFilter
              initValue={initQuery}
              listDepartment={listDepartment}
              onFilter={onFilter}
              params={params}
              onClickOpen={() => setShowSettingColumn(true)}
            />
            <CustomPagination
              pagination={{
                showSizeChanger: true,
                pageSize: data.metadata.limit,
                current: data.metadata.page,
                total: data.metadata.total,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
            />
            <CustomTable
              dataSource={data.items}
              isLoading={loading}
              pagination={false}
              scroll={{ x: 'max-content' }}
              sticky={{
                offsetScroll: 5,
                offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
              }}
              columns={columns}
            />
            <ModalSettingColumn
              visible={showSettingColumn}
              onCancel={() => setShowSettingColumn(false)}
              onOk={(data) => {
                setShowSettingColumn(false);
                setColumn(data);
              }}
              data={columns}
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
