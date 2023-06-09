import { Button, Card, Col, Form, FormInstance, Input, Row, Select, Switch } from "antd";
import { ColorResponse, ColorUpdateRequest } from "model/product/color.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  colorDetailAction,
  colorUpdateAction,
  getColorAction,
} from "domain/actions/product/color.action";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { ColorUploadComponent } from "screens/products/color";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import BottomBarContainer from "component/container/bottom-bar.container";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { showSuccess } from "utils/ToastUtils";
import { RegUtil } from "utils/RegUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { backAction } from "../helper";

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
  const productStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status,
  );

  const onSuccess = useCallback(() => {
    history.push(UrlConfig.COLORS);
    showSuccess("Sửa màu sắc thành công");
  }, [history]);

  const updateColor = useCallback(
    (values: ColorUpdateRequest) => {
      dispatch(colorUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, idNumber, onSuccess],
  );

  const getColorCallback = useCallback((result: ColorResponse | false) => {
    // setLoadingData(false);

    if (!result) {
      setError(true);
    } else {
      setColor(result);
    }
  }, []);

  useEffect(() => {
    dispatch(getColorAction({ is_main_color: 1 }, setSelector));
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(colorDetailAction(idNumber, getColorCallback));
    }
    return () => {};
  }, [dispatch, getColorCallback, id]);

  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    let index = productStatusList?.findIndex((item) => item.value === color?.status);
    if (index !== -1) {
      return productStatusList?.[index].name;
    }
    return "";
  }, [productStatusList, color?.status]);

  const onChangeStatus = useCallback(
    (checked: boolean) => {
      let status = checked ? "active" : "inactive";
      formRef.current?.setFieldsValue({ status: status });
      if (color) setColor({ ...color, status: status });
    },
    [color, formRef],
  );

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
        <Form ref={formRef} initialValues={color} onFinish={updateColor} layout="vertical">
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
                  <ColorUploadComponent url={color.image} />
                </Form.Item>
                <div className="upload-bottom">Ảnh màu</div>
              </Col>
              <Col span={24} lg={20} sm={24} md={24}>
                <Row gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      rules={[{ required: true, message: "Vui lòng nhập tên màu" }]}
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
                      <Select placeholder="Chọn màu chủ đạo" className="selector">
                        {selector.items.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item name="status" label="Trạng thái">
                      <Switch
                        className="ant-switch-success"
                        onChange={onChangeStatus}
                        checked={color?.status === "active"}
                      />
                      <span
                        style={{ paddingLeft: 8 }}
                        className={color?.status === "active" ? "text-success" : "text-error"}
                      >
                        {statusValue}
                      </span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      rules={[{ required: true, message: "Vui lòng nhập mã màu" }]}
                      name="code"
                      labelAlign="right"
                      label="Mã màu"
                      normalize={(value) => (value || "").toUpperCase()}
                    >
                      <Input placeholder="Nhập mã màu" />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      name="hex_code"
                      label="Mã hex"
                      rules={[
                        {
                          pattern: RegUtil.HEX_COLOR,
                          message: "Màu sắc không chứa ký tự đặc biệt và có 6 ký tự",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập mã hex" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
          <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={() => backAction(formRef.current?.getFieldsValue(), color, setModalConfirm, history, UrlConfig.COLORS)}
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
