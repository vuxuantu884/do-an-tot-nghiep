import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Space,
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
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.COLORS);
  }, [history]);
  const onFinish = useCallback(
    (values: ColorUpdateRequest) => {
      dispatch(colorUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, idNumber, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
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
                        {
                          pattern: RegUtil.NO_ALL_SPACE,
                          message: "Tên màu sắc chưa đúng định dạng",
                        },
                      ]}
                      label="Tên màu"
                      name="name"
                    >
                      <Input placeholder="Nhập tên màu" maxLength={50} />
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
                    <Form.Item name="hex_code" label="Mã hex">
                      <Input placeholder="Nhập mã hex" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
          <div className="margin-top-10" style={{ textAlign: "right" }}>
            <Space size={12}>
              <Button type="default" onClick={onCancel}>
                Hủy
              </Button>
              <Button htmlType="submit" type="primary">
                Lưu
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </ContentContainer>
  );
};

export default ColorUpdateScreen;
