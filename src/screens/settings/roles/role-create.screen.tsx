import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  FormInstance,
  Input,
  Row,
} from "antd";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import {getModuleAction} from "domain/actions/auth/module.action";
import {createRoleAction} from "domain/actions/auth/role.action";
import {ModuleAuthorize, ModuleAuthorizeQuery} from "model/auth/module.model";
import {PermissionsAuthorize} from "model/auth/permission.model";
import {RoleAuthorize, RoleAuthorizeRequest} from "model/auth/roles.model";
import {PageResponse} from "model/base/base-metadata.response";
import {Fragment, useEffect, useState} from "react";
import {HiChevronDoubleRight, HiOutlineChevronDoubleDown} from "react-icons/hi";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";
import {
  handleCheckedModule,
  handleIndeterminateModule,
  onChangeModule,
} from "utils/AuthUtil";
import {showError, showSuccess} from "utils/ToastUtils";
import {RoleStyled} from "./role-create.style";

const {Panel} = Collapse;

const GET_ALL_MODULE_LIMIT = 100;
const moduleQueryParam: ModuleAuthorizeQuery = {
  get_permission: true,
  limit: GET_ALL_MODULE_LIMIT,
  status: "ACTIVE",
};
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

  useEffect(() => {
    dispatch(getModuleAction(moduleQueryParam, setModuleData));
  }, [dispatch]);

  return (
    <RoleStyled>
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
                    label="Diễn dải"
                    rules={[{max: 255, message: "Diễn dải không vượt quá 255 kí tự"}]}
                  >
                    <Input placeholder="Nhập diễn dải" />
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
    </RoleStyled>
  );
};
interface AuthorizeDetailCardProps {
  activePanel: string | string[];
  setActivePanel: (data: string | string[]) => void;
  indeterminateModules: string[];
  setIndeterminateModules: (data: string[]) => void;
  checkedModules: string[];
  setCheckedModules: (data: string[]) => void;
  moduleData: PageResponse<ModuleAuthorize> | undefined;
  form: FormInstance<any>;
  onChangeCheckboxModule?: (e: CheckboxChangeEvent, module: ModuleAuthorize) => void;
  onChangeCheckboxPermission?: (e: CheckboxChangeEvent, module: ModuleAuthorize) => void;
}
export const AuthorizeDetailCard = (props: AuthorizeDetailCardProps) => {
  const {
    activePanel,
    setActivePanel,
    indeterminateModules,
    setIndeterminateModules,
    checkedModules,
    setCheckedModules,
    moduleData,
    form,
    onChangeCheckboxModule,
    onChangeCheckboxPermission,
  } = props;

  const handleChangeModule = (e: CheckboxChangeEvent, module: ModuleAuthorize) => {
    onChangeModule(
      e,
      module,
      form,
      checkedModules,
      setCheckedModules,
      indeterminateModules,
      setIndeterminateModules,
      moduleData,
      activePanel,
      setActivePanel
    );
    onChangeCheckboxModule && onChangeCheckboxModule(e, module);
  };

  const handleChangeCheckboxPermission = (
    e: CheckboxChangeEvent,
    module: ModuleAuthorize
  ) => {
    handleCheckedModule(module, form, checkedModules, setCheckedModules);
    handleIndeterminateModule(
      module,
      form,
      indeterminateModules,
      setIndeterminateModules
    );
    onChangeCheckboxPermission && onChangeCheckboxPermission(e, module);
  };

  return (
    <Card title="PHÂN QUYỀN CHI TIẾT">
      <Collapse
        bordered={false}
        activeKey={activePanel}
        onChange={(key: string | string[]) => {
          setActivePanel(key);
        }}
        expandIcon={() => <Fragment />}
        className="site-collapse-custom-collapse"
      >
        {moduleData?.items.map((module: ModuleAuthorize) => {
          const isIndeterminate = indeterminateModules.includes(module.id.toString());
          const isChecked = checkedModules.includes(module.id.toString());

          return (
            <Panel
              header={
                <div className="panel-header">
                  <Checkbox
                    onChange={(e) => handleChangeModule(e, module)}
                    indeterminate={isIndeterminate && !isChecked}
                    checked={isChecked || isIndeterminate}
                  >
                    <b>
                      {module.name.charAt(0).toUpperCase() +
                        module.name.slice(1).toLowerCase()}
                    </b>
                  </Checkbox>
                  {activePanel.includes(module.id.toString()) ? (
                    <HiOutlineChevronDoubleDown color="#2A2A86" />
                  ) : (
                    <HiChevronDoubleRight color="#2A2A86" />
                  )}
                </div>
              }
              key={module.id}
              className="site-collapse-custom-panel"
            >
              <div className="panel-content">
                {module.permissions.map((value: PermissionsAuthorize) => {
                  return (
                    <Form.Item name={value.id} key={value.id} valuePropName="checked">
                      <Checkbox
                        className="panel-content-item"
                        onChange={(e) => handleChangeCheckboxPermission(e, module)}
                      >
                        {value.name.charAt(0).toUpperCase() +
                          value.name.slice(1).toLowerCase()}
                      </Checkbox>
                    </Form.Item>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </Collapse>
    </Card>
  );
};
export default RoleCreateScreen;
