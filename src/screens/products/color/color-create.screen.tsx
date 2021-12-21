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
import { ColorCreateRequest, ColorResponse } from "model/product/color.model";
import { PageResponse } from "model/base/base-metadata.response";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import {
  colorCreateAction,
  getColorAction,
} from "domain/actions/product/color.action";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import ColorUpload from "./color-upload.component";
import { showSuccess } from "utils/ToastUtils";
import { RegUtil } from "utils/RegUtils";
import BottomBarContainer from "component/container/bottom-bar.container";

let initialRequest: ColorCreateRequest = {
  code: "",
  parent_id: null,
  name: "",
  hex_code: null,
  image_id: null,
};
const { Option } = Select;
const ColorCreateScreen: React.FC = () => {
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
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const createCallback = useCallback(
    (result: ColorResponse) => {
      if (result) {
        history.push(UrlConfig.COLORS);
        showSuccess("Thêm mới dữ liệu thành công");
      }
      setLoadingSaveButton(false);
    },
    [history]
  );

  const onFinish = useCallback(
    (values: ColorCreateRequest) => {
      setLoadingSaveButton(true);
      dispatch(colorCreateAction(values, createCallback));
    },
    [dispatch, createCallback]
  ); 

  useEffect(() => {
    dispatch(getColorAction({ is_main_color: 1 }, setSelector));
    return () => {};
  }, [dispatch]);
  return (
    <ContentContainer
      title="Thêm mới màu sắc"
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
          name: "Thêm Màu sắc",
        },
      ]}
    >
      <Form
        ref={formRef}
        onFinish={onFinish}
        initialValues={initialRequest}
        layout="vertical"
      >
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
                <ColorUpload />
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
                  <Form.Item
                    name="hex_code"
                    label="Mã hex"
                    rules={[
                      {
                        pattern: RegUtil.HEX_COLOR,
                        message:
                          "Màu sắc không chứa ký tự đặc biệt và có 6 ký tự",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập mã hex" prefix="#" maxLength={6} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card> 
        <BottomBarContainer
          back={"Quay lại danh sách"}
          rightComponent={
             <Button loading={loadingSaveButton} htmlType="submit" type="primary">
               Tạo màu sắc
             </Button>
          }
        /> 
      </Form>
    </ContentContainer>
  );
};

export default ColorCreateScreen;
