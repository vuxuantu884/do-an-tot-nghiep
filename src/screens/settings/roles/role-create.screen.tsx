import {
  Button,
  Card, Col, Form, Input,
  Row
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { getAllModuleParam } from "config/auth.config";
import UrlConfig from "config/url.config";
import { getModuleAction } from "domain/actions/auth/module.action";
import { createRoleAction } from "domain/actions/auth/role.action";
import { ModuleAuthorize } from "model/auth/module.model";
import { RoleAuthorize, RoleAuthorizeRequest } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { showError, showSuccess } from "utils/ToastUtils";
import { AuthorizeDetailCard } from "./card-authorize-detail";

const RoleCreateScreen: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moduleData, setModuleData] = useState<PageResponse<ModuleAuthorize>>();
  const [activePanel, setActivePanel] = useState<string | string[]>([]);
  const [indeterminateModules, setIndeterminateModules] = useState<string[]>([]);
  const [checkedModules, setCheckedModules] = useState<string[]>([]);

  const onFinish = (values: any) => {
    const dataSubmit: RoleAuthorizeRequest = {} as RoleAuthorizeRequest;
    dataSubmit.name = values.name;
    delete values.name;
    dataSubmit.description = values.description;
    delete values.description;
    dataSubmit.permissions = [];
    Object.keys(values).forEach((item) => {
      if (values[item]) {
        dataSubmit.permissions?.push(parseInt(item));
      }
    });
    if (dataSubmit.permissions?.length === 0) {
      showError("Vui lòng chọn ít nhất 1 quyền");
      return;
    }
    setIsSubmitting(true);
    dispatch(
      createRoleAction(dataSubmit, (response: RoleAuthorize) => {
        setIsSubmitting(false);
        if (response) {
          showSuccess("Thêm nhóm quyền thành công");
          history.push(UrlConfig.ROLES);
        }
      })
    );
  };

  const onSetModuleData = (data: PageResponse<ModuleAuthorize>) => {
    setModuleData(data);
    const defaultActivePanel = data.items.map((item) => item.id.toString());
    setActivePanel(defaultActivePanel);
  };

  useEffect(() => {
    dispatch(getModuleAction(getAllModuleParam, onSetModuleData));
  }, [dispatch]);

  return (
      <ContentContainer
        title="Tạo nhóm quyền mới"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Quản lý nhóm quyền",
            path: `${UrlConfig.ROLES}`,
          },
          {
            name: "Tạo nhóm quyền mới",
          },
        ]}
      >
        <Form
          layout="vertical"
          name="create-role"
          autoComplete="off"
          onFinish={onFinish}
          form={form}
        >
          <Card title="NHÓM QUYỀN">
            <div className="padding-20">
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên nhóm quyền",
                      },
                      {
                        max: 100,
                        message: "Tên nhóm quyền không vượt quá 100 ký tự",
                      },
                    ]}
                    label="Tên nhóm quyền"
                    name="name"
                  >
                    <Input placeholder="Nhập tên vai trò" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[{ max: 255, message: "Mô tả không vượt quá 255 kí tự" }]}
                  >
                    <Input placeholder="Nhập mô tả" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Card>
          <AuthorizeDetailCard
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            indeterminateModules={indeterminateModules}
            setIndeterminateModules={setIndeterminateModules}
            checkedModules={checkedModules}
            setCheckedModules={setCheckedModules}
            moduleData={moduleData}
            form={form}
            isShowTitle={true}
          />
          <BottomBarContainer
            back="Quay lại danh sách"
            rightComponent={
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Lưu
              </Button>
            }
          />
        </Form>
      </ContentContainer>
  );
};

export default RoleCreateScreen;
