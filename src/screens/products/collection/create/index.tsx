import {
  Space,
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
} from 'antd';
import TextArea from "antd/es/input/TextArea"; 
import React, {
  createRef,
  useCallback,
  useState,
} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router';
import {
  CollectionCreateRequest,
  CollectionResponse,
} from 'model/product/collection.model';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/url.config';
import {RegUtil} from 'utils/RegUtils';
import { showSuccess } from 'utils/ToastUtils';
import BottomBarContainer from 'component/container/bottom-bar.container'; 
import { createCollectionAction } from 'domain/actions/product/collection.action';

let initialRequest: CollectionCreateRequest = {
  code: '',
  name: '',
}; 

const AddCollection: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>(); 
  const [loading, setLoading] = useState<boolean>(false); 

  const onSuccess = useCallback((result: CollectionResponse) => {
    showSuccess('Thêm nhóm hàng thành công');
    history.push(`${UrlConfig.COLLECTIONS}`);
  }, [history]);

  const onFinish = useCallback(
    (values: CollectionCreateRequest) => {
      setLoading(true);
      dispatch(createCollectionAction(values, onSuccess));
      setLoading(false);
    },
    [dispatch, onSuccess]
  );  

  return (
    <ContentContainer
      title="Thêm mới nhóm hàng"
      breadcrumb={[
        {
          name: 'Tổng quan',
          path: UrlConfig.HOME,
        },
        {
          name: 'Sản phẩm',
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: 'Nhóm hàng',
          path: `${UrlConfig.COLLECTIONS}`,
        },
        {
          name: 'Thêm nhóm hàng',
        },
      ]}
    >
      <Form
        ref={formRef}
        onFinish={onFinish}
        initialValues={initialRequest}
        layout="vertical"
      >
        <Card>
          <Row gutter={50}>
            <Col span={12}>
              <Form.Item
                rules={[
                  {max: 500, message: "Không được nhập quá 500 ký tự"},
                  {required: true, message: 'Vui lòng nhập tên nhóm hàng'},
                  {pattern: RegUtil.STRINGUTF8, message: 'Tên nhóm hàng không gồm kí tự đặc biệt'},
                ]}
                label="Tên nhóm hàng"
                name="name"
              >
                <Input placeholder="Nhập tên nhóm hàng" maxLength={255} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="description"
                label="Mô tả"
                rules={[{max: 500, message: "Không được nhập quá 500 ký tự"}]}
              >
                <TextArea placeholder="Mô tả nhóm hàng" autoSize={{minRows: 1, maxRows: 1}} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <BottomBarContainer
          back={"Quay lại danh sách"}
          rightComponent={
            <Space>
              <Button loading={loading} htmlType="submit" type="primary">
                Tạo nhóm hàng
              </Button>
            </Space>
          }
        /> 
      </Form>
    </ContentContainer>
  );
}; 

export default AddCollection;
