import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
} from 'antd';

import TextArea from "antd/es/input/TextArea"; 
import {
  collectionDetailAction,
  collectionUpdateAction,
} from 'domain/actions/product/collection.action';
import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory, useParams} from 'react-router';
import {
  CollectionUpdateRequest,
  CollectionResponse,
} from 'model/product/collection.model';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/url.config';
import { RegUtil } from 'utils/RegUtils';
import { showSuccess } from 'utils/ToastUtils';
import AuthWrapper from 'component/authorization/AuthWrapper';
import { ProductPermission } from 'config/permissions/product.permission';
import BottomBarContainer from 'component/container/bottom-bar.container';
import ModalConfirm, { ModalConfirmProps } from 'component/modal/ModalConfirm';
import { CompareObject } from 'utils/CompareObject';

type CollectionParam = {
  id: string;
};

const GroupUpdate: React.FC = () => {
  const {id} = useParams<CollectionParam>();
  let idNumber = parseInt(id);

  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>(); 
  const [detail, setDetail] = useState<CollectionResponse | null>(null);
  const [isError, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const isFirstLoad = useRef(true); 
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  }); 

  const onSuccess = useCallback((result: CollectionResponse) => {
    if (result) {
      setLoading(false);
      setDetail(result);
      showSuccess('Sửa nhóm hàng thành công');
      history.push(`${UrlConfig.COLLECTIONS}`);
    }
  }, [history]);
  const onFinish = useCallback(
    (values: CollectionUpdateRequest) => {
      setLoading(true);
      dispatch(collectionUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, idNumber, onSuccess]
  ); 

  const onGetDetailSuccess = useCallback((data: false|CollectionResponse) => {
    setLoadingData(false)
    if(!data) {
      setError(true);
    } else {
      setDetail(data);
    }
  }, []);

  const backAction = ()=>{ 
    if (!CompareObject(formRef.current?.getFieldsValue(),detail)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({visible: false});
        },
        onOk: () => { 
          setModalConfirm({visible: false});
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle:
          "Sau khi quay lại thay đổi sẽ không được lưu.",
      }); 
    }else{
      history.goBack();
    }
  };

  useEffect(() => {
    if (isFirstLoad.current) {
      if (!isNaN(idNumber)) {
        dispatch(collectionDetailAction(idNumber, onGetDetailSuccess));
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
      title="Sửa nhóm hàng"
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
          name: detail!== null ? detail.name : '',
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
                  <Input placeholder="Nhập nhóm hàng" maxLength={255} />
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
            backAction={backAction}
            rightComponent={
              <AuthWrapper acceptPermissions={[ProductPermission.categories_update]}>
                <Button loading={loading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              </AuthWrapper>
            }
          /> 
        </Form>
      )} 
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
}; 

export default GroupUpdate;
