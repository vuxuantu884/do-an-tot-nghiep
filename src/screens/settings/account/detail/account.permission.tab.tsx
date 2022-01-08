import { Col, Divider, Form, Row, Skeleton } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { getAllModuleParam } from "config/module.config";
import { AccountPermissions } from "config/permissions/account.permisssion";
import { getModuleAction } from "domain/actions/auth/module.action";
import { updateAccountPermissionAction } from "domain/actions/auth/permission.action";
import useAuthorization from "hook/useAuthorization";
import _ from "lodash";
import { ModuleAuthorize } from "model/auth/module.model";
import { PermissionsAuthorize, UserPermissionRequest } from "model/auth/permission.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { CreateRoleStyled } from "screens/settings/account/detail/index.style";
import { AuthorizeDetailCard } from "screens/settings/roles/card-authorize-detail";
import { AccountDetailContext } from "../provider/account.detail.provider";

type AccountPermissionProps = {
  getAccountData: () => void;
};

function AccountPermissionTab(props: AccountPermissionProps) {
  const { getAccountData } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const isFirstLoad = useRef(true);
  const [moduleData, setModuleData] = useState<PageResponse<ModuleAuthorize>>();
  const [permissionData, setPermissionData] = useState<Map<number, PermissionsAuthorize>>(
    new Map([])
  ); // Map<permissionId, PermissionsAuthorize>
  const [activePanel, setActivePanel] = useState<string | string[]>([]);
  const [indeterminateModules, setIndeterminateModules] = useState<string[]>([]);
  const [checkedModules, setCheckedModules] = useState<string[]>([]);
  const [loadingPermission, setLoadingPermission] = useState(false);
  //phân quyền
  const [allowUpdateAcc] = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });

  const detailContext = useContext(AccountDetailContext);
  const { accountInfo } = detailContext;

  const getCheckedPermissions = useCallback(() => {
    const permissionForm = form.getFieldsValue(true);
    const permissions_ids: number[] = [];
    Object.keys(permissionForm).forEach((key) => {
      let intKey = parseInt(key);

      if (permissionForm[key] && typeof intKey === "number") {
        permissions_ids.push(intKey);
      }
    });
    return permissions_ids;
  }, [form]);

  const getCheckedPermissionObjects = useCallback((): UserPermissionRequest => {
    if (accountInfo?.user_id) {
      const permission_ids = getCheckedPermissions();
      const permissions = permission_ids.map((id) => {
        return {
          permission_id: id,
          store_id: permissionData?.get(id)?.store_id,
          role_id: permissionData?.get(id)?.role_id,
        };
      });
      return { user_id: accountInfo.user_id, permissions };
    }
    return {} as UserPermissionRequest;
  }, [getCheckedPermissions, accountInfo?.user_id, permissionData]);

  const updatePermission = () => {
    const permission = getCheckedPermissionObjects();
    dispatch(
      updateAccountPermissionAction(permission, (result: string) => {
        getAccountData();
      })
    );
  };

  const onChangeCheckBoxModule = (e: CheckboxChangeEvent, module: ModuleAuthorize) => {
    updatePermission();
  };

  const onChangeCheckBoxPermission = (
    e: CheckboxChangeEvent,
    module: ModuleAuthorize,
    permission: PermissionsAuthorize
  ) => {
    updatePermission();
  };

  // handle checkbox
  const handleDefaultCheckbox = useCallback(
    (data: PageResponse<ModuleAuthorize>) => {
      // get total permission of module
      const totalPermissionOfModules = new Map(
        data.items.map((item) => [item.code, item.permissions.length])
      );
      // get permission of account
      const permissionDataTemps = new Map<number, PermissionsAuthorize>();
      data.items.forEach((item) => {
        item.permissions.forEach((permission) => {
          permissionDataTemps.set(permission.id, permission);
        });
      });
      setPermissionData(permissionDataTemps);

      let defaultCheckedModules: string[] = [];
      let defaultIndeterminateModules: string[] = [];
      let defaultCheckedPermission: any = {};

      accountInfo?.permissions?.modules.forEach((item: ModuleAuthorize) => {
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
    },
    [accountInfo, form]
  );

  const onSetModuleData = useCallback(
    (data: PageResponse<ModuleAuthorize>) => {
      if (data) {
        setModuleData(data);
        handleDefaultCheckbox(data);
      }
      setLoadingPermission(false);
    },
    [handleDefaultCheckbox]
  );

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      setLoadingPermission(true);
      dispatch(getModuleAction(getAllModuleParam, onSetModuleData));
    } else if (moduleData) {
      handleDefaultCheckbox(moduleData);
    }
  }, [dispatch, onSetModuleData, handleDefaultCheckbox, moduleData]);

  return (
    <>
      <div className="padding-top-20 permission">
        <Row gutter={30}>
          <Col className="col-info" span={8}>
            <span className="account-title">Mã nhân viên</span>
            <b> : {accountInfo?.code}</b>
          </Col>
          <Col className="col-info" span={8}>
            <span className="account-title">Họ và tên </span>
            <b> : {accountInfo?.full_name}</b>
          </Col>
          <Col className="col-info" span={8}>
            <span className="account-title">Nhóm quyền </span>
            <b> : {accountInfo?.role_name} </b>
          </Col>
        </Row>
        <h4 className="margin-top-20">PHÂN QUYỀN CHI TIẾT</h4>
        <Divider style={{ marginBottom: 0, borderTop: "1px solid #d9d9d9" }} />
      </div>
      {loadingPermission ? (
        <Skeleton/>
      ) : (
        <CreateRoleStyled>
          <Form form={form}>
            <AuthorizeDetailCard
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              indeterminateModules={indeterminateModules}
              setIndeterminateModules={setIndeterminateModules}
              checkedModules={checkedModules}
              setCheckedModules={setCheckedModules}
              moduleData={moduleData}
              form={form}
              onChangeCheckboxPermission={onChangeCheckBoxPermission}
              onChangeCheckboxModule={onChangeCheckBoxModule}
              disabled={!allowUpdateAcc}
            />
          </Form>
        </CreateRoleStyled>
      )}
    </>
  );
}

export default AccountPermissionTab;
