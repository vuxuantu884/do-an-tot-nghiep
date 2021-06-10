import { Button, Card, Col, Form, FormInstance, Input, Row, Select } from "antd";
import UrlConfig from "config/UrlConfig";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { sizeCreateAction } from "domain/actions/product/size.action";
import { CategoryView } from "model/other/Product/category-view";
import { SizeCreateRequest } from "model/request/size.request";
import { CategoryResponse } from "model/response/category.response";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { convertCategory } from "utils/AppUtils";

const {Option} = Select;

const SizeCreateScreen: React.FC = () => {
  const [categories, setCategories] = useState<Array<CategoryView>>([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.SIZES);
  }, [history])
  const onFinish = useCallback((values: SizeCreateRequest) => {
    dispatch(sizeCreateAction(values, onSuccess));
  }, [dispatch, onSuccess]);
  const onSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const setCategory = useCallback((data: Array<CategoryResponse>) => {
    let newData = convertCategory(data);
    setCategories(newData);
  }, []);
  useEffect(() => {
    dispatch(getCategoryRequestAction({}, setCategory))
    return () => {}
  }, [dispatch, setCategory])
  return (
    <div>
      <Card className="card-block card-block-normal" title="Thông tin cơ bản">
        <Form
          ref={formRef}
          onFinish={onFinish}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: 'Vui lòng nhập kích cỡ' },
                ]}
                label="Kích cỡ"
                name="code"
              >
                <Input className="r-5" maxLength={3} placeholder="Nhập kích cỡ" size="large" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 danh mục' }]}
                className="form-group form-group-with-search"
                name="category_ids"
                label="Danh mục"
              >
                <Select className="selector" mode="multiple" placeholder="Chọn danh mục">
                  {
                    categories.map((item) => <Option key={item.id} value={item.id}>{item.name}</Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <Row className="footer-row-btn" justify="end">
        <Button type="default" onClick={onCancel} className="btn-style btn-cancel">Hủy</Button>
        <Button type="default" onClick={onSave} className="btn-style btn-save">Lưu</Button>
      </Row>
    </div>
  )
}

export default SizeCreateScreen;