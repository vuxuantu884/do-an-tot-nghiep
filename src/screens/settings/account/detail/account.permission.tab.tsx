import {Col, Divider, Form, Row} from "antd";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import {getAllModuleParam} from "config/module.config";
import {getModuleAction} from "domain/actions/auth/module.action";
import {ModuleAuthorize} from "model/auth/module.model";
import {PermissionsAuthorize} from "model/auth/permission.model";
import {PageResponse} from "model/base/base-metadata.response";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {CreateRoleStyled} from "screens/settings/account/detail/index.style";
import {AuthorizeDetailCard} from "screens/settings/roles/card-authorize-detail";
import {AccountDetailContext} from "../provider/account.detail.provider";

function AccountPermissionTab() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [moduleData, setModuleData] = useState<PageResponse<ModuleAuthorize>>();
  const [activePanel, setActivePanel] = useState<string | string[]>([]);
  const [indeterminateModules, setIndeterminateModules] = useState<string[]>([]);
  const [checkedModules, setCheckedModules] = useState<string[]>([]);

  const detailContext = useContext(AccountDetailContext);
  const {accountInfo,   userCode} = detailContext;

  const getCheckedPermissions = useCallback(() => {
    const permissionForm = form.getFieldsValue(true);
    const permissions_ids: number[] = [];
    Object.keys(permissionForm).forEach((key) => {
      let intKey  = parseInt(key);
      
      if (permissionForm[key] && typeof intKey === 'number') {
        permissions_ids.push(intKey);
      }
    });
    return permissions_ids;
  }, [form]);

  // console.log("accountInfo", accountInfo);
  const onChangeCheckBoxModule = (e: CheckboxChangeEvent, module: ModuleAuthorize) => {
    console.log("all permission 2", getCheckedPermissions());
  };

  const onChangeCheckBoxPermission = (
    e: CheckboxChangeEvent,
    module: ModuleAuthorize,
    permission: PermissionsAuthorize
  ) => {
    const jsonUpdateAccount = {
      code: userCode,
      ...accountInfo,
      permissions_ids: getCheckedPermissions(),
    };
    console.log("all permission 2", jsonUpdateAccount);
  };

  // handle checkbox
  const onSetModuleData = useCallback(
    (data: PageResponse<ModuleAuthorize>) => {
      setModuleData(data);

      // get total permission of module
      const totalPermissionOfModules = new Map(
        data.items.map((item) => [item.code, item.permissions.length])
      );
      console.log("totalPermissionOfModules", totalPermissionOfModules.get("ACCOUNTS"));

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
      form.setFieldsValue(defaultCheckedPermission);
      setCheckedModules(defaultCheckedModules);
      setIndeterminateModules(defaultIndeterminateModules);
    },
    [accountInfo, form]
  );

  useEffect(() => {
    dispatch(getModuleAction(getAllModuleParam, onSetModuleData));
  }, [dispatch, onSetModuleData]);
  return (
    <>
      <div className="padding-top-20 permission">
        <Row gutter={80}>
          <Col className="col-info">
            <Row className="permission-account">
              <span className="account-title">Mã nhân viên</span>
              <b>:{accountInfo?.code}</b>
            </Row>
            <Row className="permission-account">
              <span className="account-title">Họ và tên </span>
              <b>: {accountInfo?.full_name}</b>
            </Row>
          </Col>
          <Col className="col-info">
            <Row className="permission-account">
              <span className="account-title">Nhóm quyền </span>
              <b>: </b> 
            </Row>
          </Col>
        </Row>
        <h4 className="margin-top-20">PHÂN QUYỀN CHI TIẾT</h4>
        <Divider style={{marginBottom: 0, borderTop: "1px solid #d9d9d9"}} />
      </div>
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
          />
        </Form>
      </CreateRoleStyled>
    </>
  );
}

export default AccountPermissionTab;
