import { Col, Divider, Form, Row } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { getAllModuleParam } from "config/auth.config";
import { getModuleAction } from "domain/actions/auth/module.action";
import { ModuleAuthorize } from "model/auth/module.model";
import { PermissionsAuthorize } from "model/auth/permission.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { CreateRoleStyled } from "screens/settings/account/detail/index.style";
import { AuthorizeDetailCard } from "screens/settings/roles/card-authorize-detail";
import { AccountDetailContext } from "../provider/account.detail.provider";

function AccountPermissionTab() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [moduleData, setModuleData] = useState<PageResponse<ModuleAuthorize>>();
  const [activePanel, setActivePanel] = useState<string | string[]>([]);
  const [indeterminateModules, setIndeterminateModules] = useState<string[]>([]);
  const [checkedModules, setCheckedModules] = useState<string[]>([]);

  const detailContext = useContext(AccountDetailContext);
  const { accountInfo, roleName } = detailContext;


  const onChangeCheckBoxPermission = ((e: CheckboxChangeEvent, module: ModuleAuthorize, permission: PermissionsAuthorize) => {
    const { checked } = e.target;
    console.log("checked", checked);
    console.log("module", module);
    console.log("permission", permission);
  });

  const onChangeCheckBoxModule = ((e: CheckboxChangeEvent, module: ModuleAuthorize) => {
    const { checked } = e.target;
    console.log("checked", checked);
    console.log("module", module);
  });

  const onSetModuleData = useCallback((data: PageResponse<ModuleAuthorize>) => {
    setModuleData(data);
    // form.setFieldsValue({ 3: true,4: true,6: true });
    // setIndeterminateModules(['1']);
    // setCheckedModules(['1']);
    //set defautl active panel here
  }, []);

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
              <b>: {roleName} </b>
            </Row>
          </Col>
        </Row>
        <h4 className="margin-top-20">PHÂN QUYỀN CHI TIẾT</h4>
        <Divider style={{ marginBottom: 0, borderTop: "1px solid #d9d9d9" }} />
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
        </Form></CreateRoleStyled>
    </>
  );
}

export default AccountPermissionTab;
