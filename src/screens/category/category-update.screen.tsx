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
  categoryDetailAction,
  categoryUpdateAction,
  getCategoryRequestAction,
} from 'domain/actions/product/category.action';
import {RootReducerType} from 'model/reducers/RootReducerType';
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router';
import {
  CategoryUpdateRequest,
  CategoryResponse,
} from 'model/product/category.model';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';

const {TreeNode} = TreeSelect;

type CategoryParam = {
  id: string;
};

const CategoryUpdate: React.FC = () => {
  const {id} = useParams<CategoryParam>();
  let idNumber = parseInt(id);

  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const [categories, setCategories] = useState<Array<CategoryResponse>>([]);
  const [detail, setDetail] = useState<CategoryResponse | null>(null);
  const isFirstLoad = useRef(true);
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
    (values: CategoryUpdateRequest) => {
      dispatch(categoryUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, idNumber, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(getCategoryRequestAction({}, setCategories));
      if (!Number.isNaN(idNumber)) {
        dispatch(categoryDetailAction(idNumber, setDetail));
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, idNumber]);
  return (
    <ContentContainer
      title="Sửa danh mục"
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
          name: 'Sửa danh mục',
        },
      ]}
    >
      {detail === null ? (
        <Card>
          <div className="padding-20">Không tìm thấy danh mục</div>
        </Card>
      ) : (
        <Form
          ref={formRef}
          onFinish={onFinish}
          initialValues={detail}
          layout="vertical"
        >
          <Card title="Thông tin cơ bản">
            <div className="padding-20">
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item name="version" hidden noStyle>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
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
                    <Select>
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
                        pattern: new RegExp("^\\S*$"),
                        message: "Mã danh mục không được chứa khoảng trắng"
                      },
                      {
                        pattern: new RegExp("/[^a-zA-Z0-9 ]/"),
                        message: "Mã chất liệu không chứa ký tự đặc biệt"
                      },
                    ]}
                    name="code"
                    labelAlign="right"
                    label="Mã danh mục"
                    normalize={value => (value || '').toUpperCase()}
                  >
                    <Input
                      className="r-5"
                      placeholder="Mã danh mục"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item name="parent_id" label="Danh mục cha">
                    <TreeSelect treeDefaultExpandAll>
                      <TreeNode value={-1} title="Danh mục cha" />
                      {categories.map((item, index) => (
                        <React.Fragment key={index}>
                          {TreeCategory(item, idNumber)}
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
      )}
    </ContentContainer>
  );
};

const TreeCategory = (item: CategoryResponse, id: number) => {
  return (
    <TreeNode
      disabled={item.id === id || item.parent_id === id}
      value={item.id}
      title={item.name}
    >
      {item.children.length > 0 && (
        <React.Fragment>
          {item.children.map((item, index) => (
            <React.Fragment key={index}>
              {TreeCategory(item, id)}
            </React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeNode>
  );
};

export default CategoryUpdate;
