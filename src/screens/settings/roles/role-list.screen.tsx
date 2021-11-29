import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig from "config/url.config";
import { RoleSearchAction } from "domain/actions/auth/role.action";
import _ from "lodash";
import { PermissionsAuthorize } from "model/auth/permission.model";
import { RoleAuthorize, RoleResponse, RoleSearchQuery } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiChevronDoubleDown, HiChevronDoubleRight } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { RoleListStyled } from "./role-list.style";
const defaultRoleListParams: RoleSearchQuery = {
  page: 1,
  limit: 200,
};

const RoleListScreen = () => {
  const dispatch = useDispatch();
  //state
  const [data, setData] = useState<PageResponse<RoleAuthorize>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [columns, setColumn] = useState<Array<ICustomTableColumType<RoleAuthorize>>>([
    {
      title: "STT",
      visible: true,
      render: (value, item, index: number) =>
        (data.metadata.page - 1) * data.metadata.limit + index + 1,
    },
    {
      title: "Tên nhóm quyền",
      dataIndex: "name",
      render: (value, record) => {
        return <Link to={`${UrlConfig.ROLES}/${record.id}/update`}>{value}</Link>;
      },
      visible: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      visible: true,
    },
    {
      title: "Người cập nhật lần cuối",
      dataIndex: "updated_by",
      align: "center",
      visible: true,
      render: (value, record) => {
        return (
          <span>
            {record.updated_name}
            <br /> {value} 
          </span>
        );
      },
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updated_date",
      align: "center",
      visible: true,
      render: (value: string) => {
        return ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY);
      },
    },
  ]);

  const onSuccess = useCallback((data: PageResponse<RoleResponse>) => {
    setLoading(false);
    setData(data);
  }, []);
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );
  const columnsChild = [
    {
      dataIndex: "name",
      visible: true,
      width: 200,
      render: (value: string) => <b>{value}</b>,
    },
    {
      dataIndex: "permissions",
      visible: true,
      render: (value: Array<PermissionsAuthorize>) => {
        let formatValue = "";
        value.forEach((item) => {
          let name = _.capitalize(item.name);
          formatValue += name + " / ";
        });
        formatValue = formatValue.substring(0, formatValue.length - 2);
        return <span>{formatValue}</span>;
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    dispatch(RoleSearchAction(defaultRoleListParams, onSuccess));
  }, [dispatch, onSuccess]);
  return (
    <ContentContainer
      title="Quản lý nhóm quyền"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý nhóm quyền",
          path: `${UrlConfig.ROLES}`,
        },
      ]}
      extra={<ButtonCreate child="Thêm nhóm quyền" path={`${UrlConfig.ROLES}/create`} />}
    >
      <RoleListStyled>
        <Card>
          <CustomTable
            isLoading={loading}
            pagination={false}
            showColumnSetting
            sticky={{offsetHeader: OFFSET_HEADER_UNDER_NAVBAR}}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            dataSource={data.items}
            columns={columnFinal}
            rowKey={(data) => data.code}
            expandable={{
              expandIcon: (props) => {
                let icon = <HiChevronDoubleRight size={12} />;
                if (props.expanded) {
                  icon = <HiChevronDoubleDown size={12} color="#2A2A86" />;
                }
                return (
                  <div
                    style={{cursor: "pointer"}}
                    onClick={(event) => props.onExpand(props.record, event)}
                  >
                    {icon}
                  </div>
                );
              },
              expandedRowRender: (record, index) => {
                return (
                  <div className="child-expand" key={index}>
                    <h4>CHI TIẾT QUYỀN</h4>
                    <CustomTable
                      columns={columnsChild}
                      dataSource={record.modules}
                      bordered
                      showHeader={false}
                      pagination={false}
                      className="child-expand-table"
                      size="small"
                    />
                  </div>
                );
              },
            }}
          />
        </Card>
        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data);
          }}
          data={columns}
        />
      </RoleListStyled>
    </ContentContainer>
  );
};

export default RoleListScreen;
