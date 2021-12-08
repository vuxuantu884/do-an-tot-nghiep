import {Form} from "antd";
import ContentContainer from "component/container/content.container";
import {getAllModuleParam} from "config/module.config";
import UrlConfig from "config/url.config";
import {getModuleAction} from "domain/actions/auth/module.action";
import {createRoleAction} from "domain/actions/auth/role.action";
import {ModuleAuthorize} from "model/auth/module.model";
import {RoleAuthorize, RoleAuthorizeRequest} from "model/auth/roles.model";
import {PageResponse} from "model/base/base-metadata.response";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";
import {showError, showSuccess} from "utils/ToastUtils";
import { ACTION_FORM_CONSTANTS } from "./constants";
import RoleForm from "./role.form";

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
    const defaultActivePanel = data.items.map((item) => item.code);
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
      {moduleData && (
        <RoleForm
        formType={ACTION_FORM_CONSTANTS.CREATE}
          form={form}
          moduleData={moduleData}
          activePanel={activePanel}
          checkedModules={checkedModules}
          indeterminateModules={indeterminateModules}
          isSubmitting={isSubmitting}
          onFinish={onFinish}
          setActivePanel={setActivePanel}
          setCheckedModules={setCheckedModules}
          setIndeterminateModules={setIndeterminateModules}
        />
      )}
    </ContentContainer>
  );
};

export default RoleCreateScreen;
