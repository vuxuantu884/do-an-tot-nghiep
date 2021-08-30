import { Card, Col, Collapse, Form, Input, List, Row } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { permissionGetAll } from "domain/actions/auth/permission.action";
import { PermissionResponse } from "model/auth/permission.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback } from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const RoleCreateScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isFirstLoad = useRef(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<boolean>(false);
  const [permissions, setPermission] = useState<Array<PermissionResponse>>([]);
  const onReusltPermissionAll = useCallback((result: PageResponse<PermissionResponse>|false) => {
    setLoading(false);
    if(!result) {
      setError(true);
    } else {
      setPermission(result.items);
    }
  }, []);
  useEffect(() => {
    if(!isFirstLoad.current) {
      setLoading(true);
      dispatch(permissionGetAll(onReusltPermissionAll))
    }
    isFirstLoad.current = true;
  }, [dispatch, onReusltPermissionAll]);
  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoading}
      title="Thêm mới nhóm quyền"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý nhóm quyền",
          path: `${UrlConfig.ROLES}`,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <Form
        layout="vertical"
      >
        <Card title="THÔNG TIN VAI TRÒ">
          <div className="padding-20">
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên chất liệu",
                    },
                    {
                      max: 50,
                      message: "Tên chất liệu không vượt quá 50 ký tự",
                    },
                  ]}
                  label="Tên vai trò"
                  name="name"
                >
                  <Input maxLength={50} placeholder="Nhập tên vai trò" />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[
                    { max: 50, message: "Thành phần không quá 50 kí tự" },
                  ]}
                >
                  <Input maxLength={50} placeholder="Nhập mô tả" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Card>
        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
          <Collapse.Panel key="1" header="DANH SÁCH CHỨC NĂNG">
            <div className="padding-20">
            <Collapse>
              <List 
                dataSource={permissions}
                renderItem={item => (
                  <List.Item>
                    <Collapse.Panel key={item.id} header={<div>{item.module_name}</div>}>
                      
                    </Collapse.Panel>
                  </List.Item>
                )}
              />
              </Collapse>
            </div>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </ContentContainer>
  );
};

export default RoleCreateScreen;
