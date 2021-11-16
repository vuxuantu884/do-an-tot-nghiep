import {DownOutlined} from "@ant-design/icons";
import {Button, Card, Col, Row, Tree} from "antd";
import {DataNode} from "antd/lib/tree";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { DepartmentsPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import {departmentDetailAction} from "domain/actions/account/department.action";
import useAuthorization from "hook/useAuthorization";
import {DepartmentResponse} from "model/account/department.model";
import React, {useEffect, useMemo, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory, useParams} from "react-router-dom";
import RowDetail from "screens/settings/store/RowDetail";

interface DepartmentParam {
  id: string;
}

const DepartmentCreateScreen: React.FC = () => {
  const history = useHistory();
  const {id} = useParams<DepartmentParam>();
  const idNumber = parseInt(id);
  const dispatch = useDispatch();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DepartmentResponse | null>(null);
  const dataChildren = useMemo(() => {
    let dataNode: Array<DataNode> = [];
    if (data !== null) {
      data.children.forEach((item) => {
        dataNode.push({
          title: item.name,
          key: item.id,
        });
      });
    }
    return dataNode;
  }, [data]);

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
      })
    );
  }, [dispatch, idNumber]);
  return (
    <ContentContainer
      title="Quản lý bộ phận"
      isError={error}
      isLoading={loading}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý bộ phận",
          path: UrlConfig.DEPARTMENT,
        },
        {
          name: data !== null ? data.name : "",
        },
      ]}
    >
      {data !== null && (
        <React.Fragment>
          <Row gutter={24}>
            <Col md={16} span={16}>
              <Card title="Thông tin chi tiết">
                <Row gutter={50}>
                  <Col span={24}>
                    <RowDetail title="Tên bộ phận" value={data.name} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Quản lý" value={data.manager} />
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24}>
                    <RowDetail title="Số điện thoại" value={data.mobile} />
                  </Col>
                  <Col span={24}>
                    <RowDetail title="Địa chỉ" value={data.address} />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col md={8} span={8}>
              <Card title="Sơ đồ tổ chức">
                <Tree
                  defaultExpandAll
                  defaultSelectedKeys={["0-0-0"]}
                  switcherIcon={<DownOutlined />}
                  treeData={dataChildren}
                />
              </Card>
            </Col>
          </Row>
        </React.Fragment>
      )}
      <BottomBarContainer
        back="Quay lại"
        rightComponent={
          <React.Fragment>
            {allowUpdateDep ? (
              <Button
                onClick={() => {
                  history.push(`${UrlConfig.DEPARTMENT}/${idNumber}/update`);
                }}
                type="primary"
              >
                Sửa
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
