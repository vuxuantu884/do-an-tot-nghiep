import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Button, Col, Form, Row } from "antd";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";
import UrlConfig from "config/url.config";
import { SupplierCreateAction } from "domain/actions/core/supplier.action";
import useAuthorization from "hook/useAuthorization";
import { SupplierCreateRequest, SupplierResponse } from "model/core/supplier.model";
import { FormConfigs, initialSupplierForm } from "./supplier-add.config";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import SupplierBasicInfo from "component/supplier/SupplierBasicInfo";
import SupplierAddress from "component/supplier/SupplierAddress";
import SupplierDetail from "component/supplier/SupplierDetail";
import SupplierContact from "component/supplier/SupplierContact";
import SupplierPayment from "component/supplier/SupplierPayment";

const CreateSupplierScreen: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const history = useHistory();

  const [allowCreateSup] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.CREATE],
    not: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCreateSuccess = (data: SupplierResponse) => {
    setIsSubmitting(false);
    if (!data) return;

    history.push(`${UrlConfig.SUPPLIERS}`);
  };

  const onFinish = (values: SupplierCreateRequest) => {
    const { name, phone, fax, email, website, position } = values.contacts[0];
    const { name: nameBankAccount, brand, number, beneficiary } = values.payments[0];

    //Không tạo địa chỉ liên hệ nếu không nhập trường nào
    if (!name && !position && !phone && !fax && !email && !website) {
      values.contacts = [];
    }
    //Không tạo thông tin thanh toán nếu không nhập trường nào
    if (!nameBankAccount && !brand && !number && !beneficiary) {
      values.payments = [];
    }
    setIsSubmitting(true);
    dispatch(SupplierCreateAction(values, onCreateSuccess));
  };

  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: "Sản phẩm",
        },
        {
          name: "Nhà cung cấp",
          path: `${UrlConfig.SUPPLIERS}`,
        },
        {
          name: "Thêm mới",
        },
      ]}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialSupplierForm}
        scrollToFirstError>
        <Row gutter={20}>
          <Col span={16}>
            <SupplierBasicInfo form={form} formFields={FormConfigs.INFO} />
            <SupplierAddress form={form} formFields={FormConfigs.ADDRESS} />
            <SupplierDetail form={form} formFields={FormConfigs.DETAIL} />
          </Col>
          <Col span={8}>
            <SupplierContact formFields={FormConfigs.CONTACT} />
            <SupplierPayment formFields={FormConfigs.PAYMENT} />
          </Col>
        </Row>
        <BottomBarContainer
          back="Quay lại danh sách"
          rightComponent={
            allowCreateSup && (
              <Button htmlType="submit" type="primary" loading={isSubmitting}>
                Tạo nhà cung cấp
              </Button>
            )
          }
        />
      </Form>
    </ContentContainer>
  );
};

export default CreateSupplierScreen;
