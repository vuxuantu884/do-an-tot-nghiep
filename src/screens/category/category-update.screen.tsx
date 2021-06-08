import { Button, Card, Col, Form, FormInstance, Input, Row, Select, TreeSelect } from "antd";
import { categoryDetailAction, categoryUpdateAction, getCategoryRequestAction } from "domain/actions/product/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CategoryResponse } from "model/response/category.response";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { UpdateCatergoryRequest } from 'model/request/create-category.request';

const { TreeNode } = TreeSelect;

type  CategoryParam = {
  id: string;
}

const CategoryUpdate: React.FC = () => {
  const {id} = useParams<CategoryParam>();
  let idNumber = parseInt(id);

  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const [categories, setCategories] = useState<Array<CategoryResponse>>([]);
  const [detail, setDetail] = useState<CategoryResponse|null>(null);
  const isFirstLoad=useRef(true);
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const onSuccess = useCallback(() => {
    history.push('/categories');
  }, [history])
  const onFinish = useCallback((values: UpdateCatergoryRequest) => {
    dispatch(categoryUpdateAction(idNumber, values, onSuccess));
  }, [dispatch, idNumber, onSuccess]);
  const onSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useEffect(() => {
    if(isFirstLoad.current) {
      dispatch(getCategoryRequestAction({}, setCategories));
      if(!Number.isNaN(idNumber)) {
        dispatch(categoryDetailAction(idNumber, setDetail));
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, idNumber]);
  if(detail == null) {
    return (
      <Card className="card-block card-block-normal">
        Không tìm thấy danh mục
      </Card>
    )
  }
  return (
    <div>
      <Card className="card-block card-block-normal" title="Thông tin cơ bản">
        <Form
          ref={formRef}
          onFinish={onFinish}
          initialValues={detail}
          layout="vertical"
        >
           <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                name="version"
                hidden
                noStyle
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên danh mục' },
                ]}
                label="Tên danh mục"
                name="name"
              >
                <Input className="r-5" placeholder="Tên danh mục" size="large" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
                className="form-group form-group-with-search"
                name="goods"
                label="Ngành hàng"
              >
                <Select
                  className="selector">
                  <Select.Option value="">
                    Ngành hàng
                  </Select.Option>
                  {
                    goods.map((item, index) => (
                      <Select.Option key={index} value={item.value}>
                        {item.name}
                      </Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  { required: true, message: 'Vui lòng nhập mã danh mục' },
                ]}
                className="form-group form-group-with-search"
                name="code"
                labelAlign="right"
                label="Mã danh mục"
              >
                <Input className="r-5" placeholder="Mã danh mục" size="large" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="parent_id"
                label="Danh mục cha"
              >
                <TreeSelect
                  treeDefaultExpandAll
                  className="selector">
                  <TreeNode value={-1} title="Danh mục cha" />
                  {
                    categories.map((item, index) => <React.Fragment key={index}>{TreeCategory(item, idNumber)}</React.Fragment>)
                  }
                </TreeSelect>
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

const TreeCategory = (item: CategoryResponse, id: number) => {
  return (
    <TreeNode disabled={item.id === id || item.parent_id === id} value={item.id} title={item.name}>
      {
        item.children.length > 0 && (
          <React.Fragment>
            {
              item.children.map((item, index) => <React.Fragment key={index}>{TreeCategory(item, id)}</React.Fragment>)
            }
          </React.Fragment>
        )
      }
    </TreeNode>
  )
}

export default CategoryUpdate;