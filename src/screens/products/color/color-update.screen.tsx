import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
} from "antd";
import { ColorResponse, ColorUpdateRequest } from "model/product/color.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  colorDetailAction,
  colorUpdateAction,
  getColorAction,
} from "domain/actions/product/color.action";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import ColorUpload from "./color-upload.component";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import BottomBarContainer from "component/container/bottom-bar.container";
import { CompareObject } from "utils/CompareObject";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { showSuccess } from "utils/ToastUtils";
import { RegUtil } from "utils/RegUtils";

const { Option } = Select;
type ColorParams = {
  id: string;
};

const ColorUpdateScreen: React.FC = () => {
  const { id } = useParams<ColorParams>();
  let idNumber = parseInt(id);
  const [color, setColor] = useState<ColorResponse | null>(null);
  const [isError, setError] = useState<boolean>(false);
  const [selector, setSelector] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  }); 

  const onSuccess = useCallback(() => {
    history.push(UrlConfig.COLORS);
    showSuccess('Sửa màu sắc thành công');
  }, [history]);

  const onFinish = useCallback(
    (values: ColorUpdateRequest) => {
      dispatch(colorUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, idNumber, onSuccess]
  ); 

  const getColorCallback = useCallback((result: ColorResponse | false) => {
    // setLoadingData(false);

    if (!result) {
      setError(true);
    } else {
      setColor(result);
    }
  }, []);

  const backAction = ()=>{ 
    if (!CompareObject(formRef.current?.getFieldsValue(),color)) {
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
    dispatch(getColorAction({ is_main_color: 1 }, setSelector));
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(colorDetailAction(idNumber, getColorCallback));
    }
    return () => {};
  }, [dispatch, getColorCallback, id]);

  return (
    <ContentContainer
      title="Sửa màu sắc"
      isError={isError}
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
          name: "Màu sắc",
          path: `${UrlConfig.COLORS}`,
        },
        {
          name: "Sửa Màu sắc",
        },
      ]}
    >
      {color !== null && (
        <Form
          ref={formRef}
          initialValues={color}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item hidden noStyle name="version">
            <Input />
          </Form.Item>
          <Card title="Thông tin cơ bản">
            <Row gutter={50}>
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
                span={24}
                sm={24}
                md={24}
                lg={4}
              >
                <Form.Item name="image_id" noStyle>
                  <ColorUpload url={color.image} />
                </Form.Item>
                <div className="upload-bottom">Ảnh màu</div>
              </Col>
              <Col span={24} lg={20} sm={24} md={24}>
                <Row gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      rules={[
                        { required: true, message: "Vui lòng nhập tên màu" },
                      ]}
                      label="Tên màu"
                      name="name"
                    >
                      <Input placeholder="Nhập tên màu" maxLength={255} />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn màu chủ đạo",
                        },
                      ]}
                      name="parent_id"
                      label="Màu chủ đạo"
                    >
                      <Select
                        placeholder="Chọn màu chủ đạo"
                        className="selector"
                      >
                        {selector.items.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      rules={[
                        { required: true, message: "Vui lòng nhập mã màu" },
                      ]}
                      name="code"
                      labelAlign="right"
                      label="Mã màu"
                      normalize={(value) => (value || "").toUpperCase()}
                    >
                      <Input placeholder="Nhập mã màu" />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item name="hex_code" 
                    label="Mã hex"
                    rules={[
                      {
                        pattern: RegUtil.HEX_COLOR,
                        message:
                          "Màu sắc không chứa ký tự đặc biệt và có 6 ký tự",
                      },
                    ]}>
                      <Input placeholder="Nhập mã hex" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card> 
          <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={backAction}
            rightComponent={
              <AuthWrapper acceptPermissions={[ProductPermission.colors_update]}>
                <Button htmlType="submit" type="primary">
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

export default ColorUpdateScreen;
