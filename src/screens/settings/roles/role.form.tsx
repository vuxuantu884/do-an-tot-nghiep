import { Button, Card, Col, Form, FormInstance, Input, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import { ModuleAuthorize } from "model/auth/module.model";
import { PageResponse } from "model/base/base-metadata.response";
import { ReactElement } from "react";
import { AuthorizeDetailCard } from "./card-authorize-detail";
import { ACTION_FORM_CONSTANTS } from "./constants";

interface Props {
  formType: string;
  form: FormInstance;
  onFinish: (values: any) => void;
  isSubmitting: boolean;
  activePanel: string | string[];
  indeterminateModules: string[];
  checkedModules: string[];
  setActivePanel: (panel: string | string[]) => void;
  setIndeterminateModules: (indeterminateModules: string[]) => void;
  setCheckedModules: (checkedModules: string[]) => void;
  moduleData: PageResponse<ModuleAuthorize>;
  backAction?: ()=>void;
}

export default function RoleForm(props: Props): ReactElement {
  const {
    formType,
    form,
    onFinish,
    isSubmitting,
    activePanel,
    checkedModules,
    indeterminateModules,
    moduleData,
    setActivePanel,
    setCheckedModules,
    setIndeterminateModules,
    backAction
  } = props;
  return (
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
                    whitespace: true,
                    message: "Tên nhóm quyền phải khác khoảng trắng",
                  },
                  {
                    max: 100,
                    message: "Tên nhóm quyền không vượt quá 100 ký tự",
                  },
                ]}
                label="Tên nhóm quyền"
                name="name"
              >
                <Input placeholder="Nhập tên vai trò" onBlur={e=>form.setFieldsValue({name:e.target.value?.trim()})}/>
              </Form.Item>
            </Col>
            <Col span={24} lg={16} md={12} sm={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{max: 255, message: "Mô tả không vượt quá 255 kí tự"}]}
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
        backAction={backAction}
        rightComponent={
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
           {formType === ACTION_FORM_CONSTANTS.UPDATE ? 'Lưu lại' : 'Tạo nhóm quyền'}
          </Button>
        }
      />
    </Form>
  );
}
