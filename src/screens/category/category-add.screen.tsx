import {
  Space,
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  TreeSelect,
} from 'antd';
import {
  createCategoryAction,
  getCategoryRequestAction,
} from 'domain/actions/product/category.action';
import {RootReducerType} from 'model/reducers/RootReducerType';
import React, {
  createRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {
  CategoryCreateRequest,
  CategoryResponse,
} from 'model/product/category.model';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';
import { RegUtil } from 'utils/RegUtils';

let initialRequest: CategoryCreateRequest = {
  code: '',
  parent_id: -1,
  goods: '',
  name: '',
};

const {TreeNode} = TreeSelect;

const AddCategory: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const [categories, setCategories] = useState<Array<CategoryResponse>>([]);
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const onSuccess = useCallback(() => {
    history.push('/categories');
  }, [history]);
  const onFinish = useCallback(
    (values: CategoryCreateRequest) => {
      dispatch(createCategoryAction(values, onSuccess));
    },
    [dispatch, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useLayoutEffect(() => {
    dispatch(getCategoryRequestAction({}, setCategories));
  }, [dispatch]);
  return (
    <ContentContainer
      title="Thêm mới danh mục"
      breadcrumb={[
        {
          name: 'Tổng quản',
          path: UrlConfig.HOME,
        },
        {
          name: 'Sản phẩm',
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: 'Danh mục',
          path: `${UrlConfig.CATEGORIES}`,
        },
        {
          name: 'Thêm danh mục',
        },
      ]}
    >
      <Form
        ref={formRef}
        onFinish={onFinish}
        initialValues={initialRequest}
        layout="vertical"
      >
        <Card className="card-block card-block-normal" title="Thông tin cơ bản">
          <div className="padding-20">
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {required: true, message: 'Vui lòng nhập tên danh mục'},
                  ]}
                  label="Tên danh mục"
                  name="name"
                >
                  <Input
                    className="r-5"
                    placeholder="Tên danh mục"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập thành phần chất liệu',
                    },
                  ]}
                  name="goods"
                  label="Ngành hàng"
                >
                  <Select className="selector">
                    <Select.Option value="">Ngành hàng</Select.Option>
                    {goods.map((item, index) => (
                      <Select.Option key={index} value={item.value}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    {required: true, message: 'Vui lòng nhập mã danh mục'},
                    {len: 3, message: 'Mã danh mục gồm 3 kí tự'},
                    {
                      pattern: RegUtil.NO_SPACE,
                      message: 'Mã danh mục không được chứa khoảng trắng',
                    },
                  ]}
                  name="code"
                  labelAlign="right"
                  label="Mã danh mục"
                >
                  <Input
                    maxLength={3}
                    className="r-5"
                    placeholder="Mã danh mục"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item name="parent_id" label="Danh mục cha">
                  <TreeSelect treeDefaultExpandAll className="selector">
                    <TreeNode value={-1} title="Danh mục cha" />
                    {categories.map((item, index) => (
                      <React.Fragment key={index}>
                        {TreeCategory(item)}
                      </React.Fragment>
                    ))}
                  </TreeSelect>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Card>
        <div className="margin-top-10" style={{textAlign: 'right'}}>
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
    </ContentContainer>
  );
};

const TreeCategory = (item: CategoryResponse) => {
  return (
    <TreeNode value={item.id} title={item.name}>
      {item.children.length > 0 && (
        <React.Fragment>
          {item.children.map((item, index) => (
            <React.Fragment key={index}>{TreeCategory(item)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeNode>
  );
};

export default AddCategory;
