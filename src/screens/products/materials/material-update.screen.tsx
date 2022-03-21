import { Button, Card, Col, Form, FormInstance, Input, Row} from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import {
  detailMaterialAction,
  updateMaterialAction,
} from "domain/actions/product/material.action";
import {
  MaterialResponse,
  MaterialUpdateRequest,
} from "model/product/material.model";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import { CompareObject } from "utils/CompareObject";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";

type MaterialPamram = {
  id: string;
};

const UpdateMaterial: React.FC = () => {
  const { id } = useParams<MaterialPamram>();
  const [oldData, setData] = useState<MaterialResponse | null>(null);
  const [isLoadData, setLoadData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [isError, setError] = useState<boolean>(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  }); 

  const onUpdate = useCallback(
    (material: MaterialResponse | false) => {
      setLoading(false);
      if (!!material) {
        showSuccess("Cập nhật chất liệu thành công");
        history.push(`${UrlConfig.MATERIALS}`);
      }
    },
    [history]
  );

  const onFinish = useCallback(
    (values: MaterialUpdateRequest) => {
      let idNumber = parseInt(id);
      const newValue = {
        ...values,
        code: values.code.trim(),
        component: values.component.trim(),
        description: values.description.trim(),
        name: values.name.trim(),
        advantages: values.advantages.trim(),
        defect: values.defect.trim(),
        preserve: values.preserve.trim(),
      };
      setLoading(true);
      dispatch(updateMaterialAction(idNumber, newValue, onUpdate));
    },
    [dispatch, id, onUpdate]
  ); 

  const onGetDetail = useCallback((material: MaterialResponse | false) => {
    setLoadData(false);
    if (!material) {
      setError(true);
    } else {
      setData(material);
    }
  }, []);

  const backAction = ()=>{ 
    if (!CompareObject(formRef.current?.getFieldsValue(),oldData)) {
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
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(detailMaterialAction(idNumber, onGetDetail));
    }
  }, [dispatch, id, onGetDetail]);

  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoadData}
      title="Sửa chất liệu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Chất liệu",
          path: `${UrlConfig.MATERIALS}`,
        },
        {
          name: oldData !== null ? oldData.name : "",
        },
      ]}
    >
      {oldData && (
        <Form
          ref={formRef}
          onFinish={onFinish}
          initialValues={oldData}
          scrollToFirstError
          layout="vertical"
        >
          <Card title="Thông tin cơ bản">
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "Vui lòng nhập mã chất liệu",
                    },
                    {
                      pattern: RegUtil.NO_SPECICAL_CHARACTER,
                      message: "Mã chất liệu không chứa ký tự đặc biệt",
                    },
                  ]}
                  name="code"
                  labelAlign="right"
                  label="Mã chất liệu:"
                >
                  <Input placeholder="Nhập mã chất liệu" size="large" />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "Vui lòng nhập tên chất liệu",
                    },
                    {
                      max: 50,
                      message: "Tên chất liệu không vượt quá 50 ký tự",
                    },
                  ]}
                  label="Tên chất liệu:"
                  name="name"
                >
                  <Input maxLength={50} placeholder="Tên chất liệu" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[{max: 50, message: "Thành phần không quá 50 kí tự"}, {max: 50}]}
                  name="component"
                  label="Thành phần:"
                >
                  <Input placeholder="Thành phần" />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {
                      max: 150,
                      message: "Thông tin bảo quản không quá 150 kí tự",
                    },
                  ]}
                  name="preserve"
                  label="Thông tin bảo quản:"
                >
                  <Input size="large" maxLength={150} placeholder="Thông tin bảo quản" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[{max: 150, message: "Ưu điểm không quá 150 kí tự"}]}
                  name="advantages"
                  label="Ưu điểm:"
                >
                  <Input.TextArea
                    autoSize={{minRows: 3, maxRows: 5}}
                    maxLength={150}
                    placeholder="Ưu điểm"
                  />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[{max: 150, message: "Nhược điểm không quá 150 kí tự"}]}
                  name="defect"
                  label="Nhược điểm:"
                >
                  <Input.TextArea
                    autoSize={{minRows: 3, maxRows: 5}}
                    maxLength={150}
                    placeholder="Nhược điểm"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={16}>
                <Form.Item
                  rules={[{max: 250, message: "Ghi chú không quá 150 kí tự"}]}
                  name="description"
                  label="Ghi chú:"
                >
                  <Input.TextArea
                    autoSize={{minRows: 3, maxRows: 5}}
                    maxLength={250}
                    placeholder="Nhập ghi chú"
                  />
                </Form.Item>
                <Form.Item noStyle hidden name="version">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Card> 
          <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={backAction}
            rightComponent={
              <AuthWrapper acceptPermissions={[ProductPermission.materials_update]}>
                <Button loading={loading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
            </AuthWrapper>
            }
          />       
        </Form>
      )}
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default UpdateMaterial;
