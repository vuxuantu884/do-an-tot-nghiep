import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { DepartmentsPermissions } from "config/permissions/account.permisssion";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import {
  departmentDetailAction,
  searchDepartmentAction,
} from "domain/actions/account/department.action";
import useAuthorization from "hook/useAuthorization";
import { DepartmentResponse } from "model/account/department.model";
import React, { Key, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import RowDetail from "screens/settings/store/RowDetail";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { convertDepartment } from "utils/AppUtils";

interface DepartmentParam {
  id: string;
}

const DepartmentCreateScreen: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<DepartmentParam>();
  const idNumber = parseInt(id);
  const dispatch = useDispatch();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DepartmentResponse | null>(null);
  const [departments, setDepartment] = useState<Array<DepartmentResponse>>([]);

  const convertDepTree = useCallback((item: DepartmentResponse): Array<DataNode> => {
    let arr = [] as Array<DataNode>;
    let node;
    node = {
      title: item.name,
      key: item.id,
    };

    if (item.children.length > 0) {
      let childs = [] as Array<DataNode>;
      item.children.forEach((i) => {
        const c = convertDepTree(i);
        childs = [...childs, ...c];
      });
      node = { ...node, children: childs };
    }
    arr.push(node);
    return arr;
  }, []);

  const dataChildren = useMemo(() => {
    let dataNode: Array<DataNode> = [];
    if (data !== null) {
      data.children &&
        data.children.length > 0 &&
        data.children.forEach((item) => {
          const temp = convertDepTree(item);
          dataNode = [...dataNode, ...temp];
        });
    }
    return dataNode;
  }, [data, convertDepTree]);

  //phân quyền
  const [allowUpdateDep] = useAuthorization({
    acceptPermissions: [DepartmentsPermissions.UPDATE],
    not: false,
  });

  useEffect(() => {
    setLoading(true);
    dispatch(
      departmentDetailAction(idNumber, (result) => {
        setLoading(false);
        if (result) {
          setData(result);
        } else {
          setError(true);
        }
      }),
    );

    dispatch(
      searchDepartmentAction((result) => {
        if (result) {
          const converted: any = convertDepartment(result);
          setDepartment(converted);
        }
      }),
    );
  }, [dispatch, idNumber]);

  const convertToDepartmentName = (parentId: number) => {
    if (departments.length === 0) return "";

    const departmentFiltered = departments.filter((i) => i.id === parentId);

    return departmentFiltered.length > 0 ? departmentFiltered[0].name : "";
  };

  const convertStatus = (status: string) => {
    switch (status) {
      case "active":
        return <span style={{ color: "#42B873" }}>Đang hoạt động</span>;
      case "inactive":
        return <span style={{ color: "#E24343" }}>Ngừng hoạt động</span>;
      default:
        return <span style={{ color: "#42B873" }}>Đang hoạt động</span>;
    }
  };

  const goToDepartmentDetail = (keys: Key[]) => {
    if (keys.length > 0) {
      window.open(`${BASE_NAME_ROUTER}${UrlConfig.DEPARTMENT}/${keys[0]}`, "_blank");
    }
  };

  return (
    <ContentContainer
      title={`Phòng ban ${data?.name}`}
      isError={error}
      isLoading={loading}
      breadcrumb={[
        {
          name: "Cài đặt",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý phòng ban",
          path: UrlConfig.DEPARTMENT,
        },
        {
          name: data !== null ? data.code : "",
        },
      ]}
    >
      {data !== null && (
        <React.Fragment>
          <Row gutter={24}>
            <Col md={16} span={16}>
              <Card title="Thông tin chi tiết" extra={convertStatus(data.status)}>
                <Row gutter={50}>
                  <Col span={24}>
                    <RowDetail title="Mã phòng ban" value={data.code} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Tên phòng ban" value={data.name} />
                  </Col>
                  <Col span={24}>
                    <RowDetail
                      title="Quản lý"
                      value={data.manager_code ? `${data.manager_code} - ${data.manager}` : ""}
                    />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Cấp độ" value={data.level} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Trực thuộc" value={convertToDepartmentName(data.parent_id)} />
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24}>
                    <RowDetail title="Số điện thoại" value={data.phone} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Địa chỉ" value={data.address} />
                  </Col>
                  <Col span={24}>
                    <RowDetail
                      title="Người tạo"
                      value={data.created_by ? `${data.created_by} - ${data.created_name}` : ""}
                    />
                  </Col>
                  <Col span={24}>
                    <RowDetail
                      title="Ngày tạo"
                      value={ConvertUtcToLocalDate(data.created_date, DATE_FORMAT.DDMMYY_HHmm)}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col md={8} span={8}>
              <Card title="Sơ đồ tổ chức 1">
                <Tree
                  showLine={{ showLeafIcon: false }}
                  defaultExpandAll
                  defaultSelectedKeys={["0-0-0"]}
                  switcherIcon={<DownOutlined />}
                  treeData={dataChildren}
                  onSelect={(keys) => goToDepartmentDetail(keys)}
                />
              </Card>
            </Col>
          </Row>
        </React.Fragment>
      )}
      <BottomBarContainer
        back="Quay lại danh sách"
        rightComponent={
          <React.Fragment>
            {allowUpdateDep ? (
              <Button
                onClick={() => {
                  history.push(`${UrlConfig.DEPARTMENT}/${idNumber}/update`);
                }}
                type="primary"
              >
                Sửa phòng ban
              </Button>
            ) : (
              <></>
            )}
          </React.Fragment>
        }
      />
    </ContentContainer>
  );
};

export default DepartmentCreateScreen;
