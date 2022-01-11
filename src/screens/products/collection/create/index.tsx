import {
  Space,
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Modal,
} from 'antd';
import TextArea from "antd/es/input/TextArea"; 
import React, {
  createRef,
  useCallback,
  useMemo,
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
import BottomBarContainer from 'component/container/bottom-bar.container'; 
import { createCollectionAction } from 'domain/actions/product/collection.action';
import { successColor } from 'utils/global-styles/variables';
import { CheckOutlined } from '@ant-design/icons';

let initialRequest: CollectionCreateRequest = {
  code: '',
  name: '',
}; 

const AddCollection: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>(); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [isShowConfirmSuccess,setIsShowConfirmSuccess] = useState<boolean>(false);
  const [collectionId,setCollectionId] = useState<number|null>(null);

  const onSuccess = useCallback((result: CollectionResponse) => {
    if (result) {
      setIsShowConfirmSuccess(true);
      setCollectionId(result.id);
    }
  }, []);

  const onFinish = useCallback(
    (values: CollectionCreateRequest) => {
      setLoading(true);
      dispatch(createCollectionAction(values, onSuccess));
      setLoading(false);
    },
    [dispatch, onSuccess]
  );  

  const onResetForm = useCallback(() => {
    let fields = formRef.current?.getFieldsValue(true);
    for (let key in fields) {
      if(fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = undefined;
      }
    }
    formRef.current?.setFieldsValue(fields);
    setIsShowConfirmSuccess(false);
  }, [formRef]); 

  const footerConfirm = useMemo(()=>{
    return <>
       <Button
            key="cancel"
            type="default"
            onClick={()=>{
              history.goBack();
            }}
          >
            Không, quay lại danh sách
      </Button>
      <Button
            key="create"
            type="default"
            onClick={onResetForm}
          >
            Tạo bst, nhóm khác
      </Button>
      <Button
            key="add"
            type="primary"
            onClick={()=>{
              history.push(`${UrlConfig.COLLECTIONS}/${collectionId}`);
            }}
          >
            Thêm sp
      </Button>
    </>;
  },[onResetForm,history, collectionId])

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
        <Modal
            closable={false}
            title={false}
            visible={isShowConfirmSuccess}
            width={550}
            footer={footerConfirm}
          >
            <div className="modal-confirm-container">
        <div>
          <div
            style={{
              color: "white",
              backgroundColor: successColor,
              fontSize: 35,
            }}
            className="modal-confirm-icon"
          >
            <CheckOutlined/> 
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">Thêm nhóm hàng thành công</div>
            <div className="modal-confirm-sub-title">Bạn có muốn thêm sản phẩm vào nhóm hàng này không?</div>
        </div>
      </div>
        </Modal>
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
