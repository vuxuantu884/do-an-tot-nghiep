import { Form } from "antd";
import ContentContainer from "component/container/content.container";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { getAllModuleParam } from "config/module.config";
import UrlConfig from "config/url.config";
import { getModuleAction } from "domain/actions/auth/module.action";
import { getRoleByIdAction, updateRoleByIdction } from "domain/actions/auth/role.action";
import _ from "lodash";
import { ModuleAuthorize } from "model/auth/module.model";
import { PermissionsAuthorize } from "model/auth/permission.model";
import { RoleAuthorize, RoleAuthorizeRequest } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import { showError, showSuccess } from "utils/ToastUtils";
import { ACTION_FORM_CONSTANTS } from "../constants";
import RoleForm from "../role.form";

const RoleUpdateScreen: React.FC = () => {
  const {id} = useParams<{id: string}>();
  console.log(id);

  const history = useHistory();
  const [form] = Form.useForm();
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  }); 

  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moduleData, setModuleData] = useState<PageResponse<ModuleAuthorize>>();
  const [activePanel, setActivePanel] = useState<string | string[]>([]);
  const [indeterminateModules, setIndeterminateModules] = useState<string[]>([]);
  const [checkedModules, setCheckedModules] = useState<string[]>([]);
  const [roleData, setRoleData] = useState<RoleAuthorize>({} as RoleAuthorize);
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
    dataSubmit.id = parseInt(id);
    dataSubmit.version = roleData.version;
    console.log(dataSubmit);
    dispatch(
      updateRoleByIdction(dataSubmit, (response: RoleAuthorize) => {
        setIsSubmitting(false);
        if (response) {
          showSuccess("Chỉnh sửa nhóm quyền thành công");
          history.push(UrlConfig.ROLES);
        }
      })
    );
  };

  // handle checkbox
  const handleDefaultField = useCallback(
    (data: RoleAuthorize) => {
      setRoleData(data);
      // get total permission of module
      const totalPermissionOfModules = new Map(
        moduleData?.items.map((item) => [item.code, item.permissions.length])
      );

      let defaultCheckedModules: string[] = [];
      let defaultIndeterminateModules: string[] = [];
      let defaultCheckedPermission: any = {};

      data?.modules?.forEach((item: ModuleAuthorize) => {
        if (item.permissions.length === totalPermissionOfModules.get(item.code)) {
          // init default checked module
          defaultCheckedModules.push(item.code);
        } else if (item.permissions.length > 0) {
          // init default indeterminate module
          defaultIndeterminateModules.push(item.code);
        }
        // init default checked permission
        item.permissions.forEach((permission: PermissionsAuthorize) => {
          defaultCheckedPermission[permission.id.toString()] = true;
        });
      });

      // set default checked
      form.resetFields();
      form.setFieldsValue(defaultCheckedPermission);
      setCheckedModules(defaultCheckedModules);
      setIndeterminateModules(defaultIndeterminateModules);
      // set default active panel
      setActivePanel(_.uniq([...defaultCheckedModules, ...defaultIndeterminateModules]));

      // set default value name and description
      form.setFieldsValue({
        name: data.name,
        description: data.description,
      });
      setDataOrigin(form.getFieldsValue());
    },
    [form, moduleData]
  );

  const [dataOrigin, setDataOrigin] = useState<RoleAuthorizeRequest | null>(null);
  const backAction = ()=>{ 
    if (JSON.stringify(form.getFieldsValue()) !== JSON.stringify(dataOrigin)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({visible: false});
        },
        onOk: () => { 
          setModalConfirm({visible: false});
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle:
          "Sau khi quay lại thay đổi sẽ không được lưu.",
      }); 
    }else{
      history.goBack();
    }
  };

  useEffect(() => {
    dispatch(
      getModuleAction(getAllModuleParam, (response: PageResponse<ModuleAuthorize>) => {
        setModuleData(response);
      })
    );
  }, [dispatch, id]);

  useEffect(() => {
    const parseId = parseInt(id);
    if (typeof parseId === "number") {
      dispatch(
        getRoleByIdAction(parseId, (response: RoleAuthorize) => {
          if (response) {
            handleDefaultField(response);
          }
        })
      );
    }
  }, [dispatch, id, handleDefaultField, moduleData]);

  return (
    <ContentContainer
      title="Chỉnh sửa nhóm quyền"
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
          name: "Chỉnh sửa nhóm quyền",
        },
      ]}
    >
      {moduleData && (
        <RoleForm
        formType={ACTION_FORM_CONSTANTS.UPDATE}
          form={form}
          moduleData={moduleData}
          activePanel={activePanel}
          checkedModules={checkedModules}
          indeterminateModules={indeterminateModules}
          isSubmitting={isSubmitting}
          onFinish={onFinish}
          backAction={backAction}
          setActivePanel={setActivePanel}
          setCheckedModules={setCheckedModules}
          setIndeterminateModules={setIndeterminateModules}
        />
      )}
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default RoleUpdateScreen;
