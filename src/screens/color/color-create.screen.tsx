import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Upload,
  Space,
} from "antd";
import { ColorCreateRequest } from "model/request/color-create.request";
import { PageResponse } from "model/base/base-metadata.response";
import { ColorResponse } from "model/response/products/color.response";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import uploadIcon from "assets/img/upload.svg";
import imgDefIcon from "assets/img/img-def.svg";
import {
  colorCreateAction,
  getColorAction,
} from "domain/actions/product/color.action";

let initialRequest: ColorCreateRequest = {
  code: "",
  parent_id: null,
  name: "",
  hex_code: null,
  image: null,
};
const { Option } = Select;
const ColorCreateScreen: React.FC = () => {
  const [selector, setSelector] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const [imageUrl, setImageUrl] = useState("");
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push("/materials");
  }, [history]);
  const onFinish = useCallback(
    (values: ColorCreateRequest) => {
      if (imageUrl !== "") {
        values.image = imageUrl;
      }
      dispatch(colorCreateAction(values, onSuccess));
    },
    [dispatch, imageUrl, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useEffect(() => {
    dispatch(getColorAction({ is_main_color: 1 }, setSelector));
    return () => {};
  }, [dispatch]);
  return (
    <Form
      ref={formRef}
      onFinish={onFinish}
      initialValues={initialRequest}
      layout="vertical"
    >
      <Card title="Thông tin cơ bản">
        <div className="padding-20">
          <Row gutter={24}>
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
              <Upload
                customRequest={(options) => {
                  console.log(options);
                }}
                listType="picture"
                action=""
                maxCount={1}
                showUploadList={false}
                className="upload-v"
              >
                <div className="upload-view">
                  <img className="img-upload" src={uploadIcon} alt="" />
                  <img className="img-default" src={imgDefIcon} alt="" />
                </div>
              </Upload>
              <div className="upload-bottom">Ảnh màu</div>
            </Col>
            <Col span={24} lg={20} sm={24} md={24}>
              <Row gutter={24}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      { required: true, message: "Vui lòng nhập tên màu" },
                    ]}
                    label="Tên màu"
                    name="name"
                  >
                    <Input placeholder="Nhập tên màu" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      { required: true, message: "Vui lòng chọn màu chủ đạo" },
                    ]}
                    name="parent_id"
                    label="Màu chủ đạo"
                  >
                    <Select placeholder="Chọn màu chủ đạo">
                      {selector.items.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      { required: true, message: "Vui lòng nhập mã chất liệu" },
                    ]}
                    name="code"
                    labelAlign="right"
                    label="Mã màu"
                  >
                    <Input placeholder="Nhập mã màu" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item name="hex_code" label="Mã hex">
                    <Input
                      placeholder="Nhập mã hex"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
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
  );
};

export default ColorCreateScreen;
