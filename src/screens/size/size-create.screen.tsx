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
import UrlConfig from "config/UrlConfig";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { sizeCreateAction } from "domain/actions/product/size.action";
import { CategoryView } from "model/product/category.model";
import { SizeCreateRequest } from "model/product/size.model";
import { CategoryResponse } from "model/product/category.model";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { convertCategory } from "utils/AppUtils";

const { Option } = Select;

const SizeCreateScreen: React.FC = () => {
  const [categories, setCategories] = useState<Array<CategoryView>>([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.SIZES);
  }, [history]);
  const onFinish = useCallback(
    (values: SizeCreateRequest) => {
      dispatch(sizeCreateAction(values, onSuccess));
    },
    [dispatch, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const setCategory = useCallback((data: Array<CategoryResponse>) => {
    let newData = convertCategory(data);
    setCategories(newData);
  }, []);
  useEffect(() => {
    dispatch(getCategoryRequestAction({}, setCategory));
    return () => {};
  }, [dispatch, setCategory]);
  return (
    <Form ref={formRef} onFinish={onFinish} layout="vertical">
      <Card title="Thông tin cơ bản">
        <div className="padding-20">
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                rules={[{ required: true, message: "Vui lòng nhập kích cỡ" }]}
                label="Kích cỡ"
                name="code"
              >
                <Input
                  className="r-5"
                  maxLength={3}
                  placeholder="Nhập kích cỡ"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 danh mục",
                  },
                ]}
                className="form-group form-group-with-search"
                name="category_ids"
                label="Danh mục"
              >
                <Select
                  className="selector"
                  mode="multiple"
                  placeholder="Chọn danh mục"
                >
                  {categories.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
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

export default SizeCreateScreen;
