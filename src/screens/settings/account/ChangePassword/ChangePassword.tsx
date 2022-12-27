import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import { Rule } from "antd/lib/form";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { AccountPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import { AccountUpdatePassAction } from "domain/actions/account/account.action";
import { loadUserFromStorageAction } from "domain/actions/app.action";
import useAuthorization from "hook/useAuthorization";
import { AccountRequest, AccountResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { normalizeText } from "utils/StringUtils";
import { showSuccess } from "utils/ToastUtils";
import { validateFormFields } from "utils/validateUtil";
import { ChangePasswordStyle } from "./ChangePasswordStyle";
import { getPasswordChecklist, PasswordSchema } from "./helper";
import PasswordChecklist from "./PasswordChecklist";

const AccountUpdatePassScreen: React.FC = () => {
  const [form] = Form.useForm();
  const { Item } = Form;
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordChecklist, setPasswordChecklist] = useState<PasswordChecklist[]>(
    getPasswordChecklist(""),
  );
  const allowUpdateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstChangePassword = useSelector(
    (state: RootReducerType) => state.userReducer.account?.temporary_password,
  );

  const backAction = () => {
    history.push(`${UrlConfig.ACCOUNTS}/me`);
  };

  const handleUpdateAccount = (res: AccountResponse) => {
    if (res) {
      showSuccess("Đặt lại mật khẩu thành công.");
      dispatch(
        loadUserFromStorageAction(() => {
          history.push(UrlConfig.HOME);
        }),
      );
    }
    setLoading(false);
  };

  const onFinish = (values: AccountRequest) => {
    setLoading(true);
    dispatch(AccountUpdatePassAction(values, handleUpdateAccount));
  };

  const validateRules: Rule = {
    async validator(rule) {
      return validateFormFields(rule, PasswordSchema, form.getFieldsValue());
    },
  };

  return (
    <ContentContainer
      title={`Đặt lại mật khẩu ${isFirstChangePassword ? "lần đầu" : ""}`}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Thông tin tài khoản",
          path: `${UrlConfig.ACCOUNTS}/me`,
        },
        {
          name: "Đặt lại mật khẩu",
        },
      ]}
    >
      <ChangePasswordStyle>
        <Card>
          <Form
            form={form}
            onFinish={onFinish}
            onChange={() => {
              setPasswordChecklist(getPasswordChecklist(form.getFieldValue("password")));
            }}
            className="change-password-form"
          >
            <div className="change-password-container">
              <Item
                name="password"
                className="password-input"
                label="Mật khẩu"
                help={false}
                required
                rules={[validateRules]}
                normalize={(value) => normalizeText(value)}
                labelAlign="left"
              >
                <Input.Password
                  placeholder="Nhập mật khẩu"
                  allowClear
                  autoComplete="new-password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Item>

              <Item
                name="confirm_password"
                className="confirm-password-input"
                labelAlign="left"
                label="Nhập lại mật khẩu"
                required
                rules={[validateRules]}
                normalize={(value) => normalizeText(value)}
              >
                <Input.Password
                  placeholder="Nhập lại mật khẩu"
                  allowClear
                  autoComplete="new-password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Item>
              <PasswordChecklist passwordChecklist={passwordChecklist} />
            </div>
          </Form>
        </Card>
        <BottomBarContainer
          back="Quay lại thông tin tài khoản"
          backAction={backAction}
          rightComponent={
            <Space>
              {allowUpdateAcc && (
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="button"
                  onClick={() => form.submit()}
                >
                  Đặt lại mật khẩu
                </Button>
              )}
            </Space>
          }
        />
      </ChangePasswordStyle>
    </ContentContainer>
  );
};

export default AccountUpdatePassScreen;
