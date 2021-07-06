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
import { RegUtil } from 'utils/RegUtils';
import { showSuccess } from 'utils/ToastUtils';

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
  const [isError, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const isFirstLoad = useRef(true);
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const onSuccess = useCallback((result: CategoryResponse) => {
    setLoading(false);
    setDetail(result);
    showSuccess('Sửa danh mục thành công')
  }, []);
  const onFinish = useCallback(
    (values: CategoryUpdateRequest) => {
      setLoading(true);
      dispatch(categoryUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, idNumber, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const onGetDetailSuccess = useCallback((data: false|CategoryResponse) => {
    setLoadingData(false)
    if(!data) {
      setError(true);
    } else {
      setDetail(data);
    }
  }, []);
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(getCategoryRequestAction({}, setCategories));
      if (!isNaN(idNumber)) {
        dispatch(categoryDetailAction(idNumber, onGetDetailSuccess));
      } else {
        setError(true);
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, idNumber, onGetDetailSuccess]);
  return (
    <ContentContainer
      isLoading={loadingData}
      isError={isError}
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
          name: detail!== null ? detail.name : 'Sửa danh mục',
        },
      ]}
    >
      {detail !== null && (
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
                      {max: 255, message: 'Tên danh mục không quá 255 kí tự'},
                      {pattern: RegUtil.STRINGUTF8, message: 'Tên danh mục không gồm kí tự đặc biệt'},
                    ]}
                    label="Tên danh mục"
                    name="name"
                  >
                    <Input maxLength={255} placeholder="VD: Áo phông nữ" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập chọn ngành hàng',
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
                    
                      {
                        pattern: RegUtil.NO_SPECICAL_CHARACTER,
                        message: 'Mã danh mục không chứa ký tự đặc biệt',
                      },
                    ]}
                    name="code"
                    label="Mã danh mục"
                    normalize={(value) => (value || '').toUpperCase()}
                  >
                    <Input maxLength={3} placeholder="VD: APN" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item name="parent_id" label="Danh mục cha">
                    <TreeSelect placeholder={categories.find((item) => item.id === detail.id)?.name} treeDefaultExpandAll>
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
              <Button loading={loading} htmlType="submit" type="primary">
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
