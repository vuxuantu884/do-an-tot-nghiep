import {Button, Card, Col, Form, FormInstance, Input, Row, Space} from 'antd';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/url.config';
import {
  detailMaterialAction,
  updateMaterialAction,
} from 'domain/actions/product/material.action';
import {
  MaterialResponse,
  MaterialUpdateRequest,
} from 'model/product/material.model';
import {createRef, useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory, useParams} from 'react-router';
import {RegUtil} from 'utils/RegUtils';
import { showSuccess } from 'utils/ToastUtils';

type MaterialPamram = {
  id: string;
};

const UpdateMaterial: React.FC = () => {
  const {id} = useParams<MaterialPamram>();
  const [oldData, setData] = useState<MaterialResponse | null>(null);
  const [isLoadData, setLoadData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [isError, setError] = useState<boolean>(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onUpdate = useCallback((material: MaterialResponse|false) => {
    setLoading(false);
    if(!!material) {
      showSuccess('Cập nhật chất liệu thành công')
      history.push(`${UrlConfig.MATERIALS}`)
    }
  }, [history]);
  const onFinish = useCallback(
    (values: MaterialUpdateRequest) => {
      let idNumber = parseInt(id);
      setLoading(true);
      dispatch(updateMaterialAction(idNumber, values, onUpdate));
      
    },
    [dispatch, id, onUpdate]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const onGetDetail = useCallback((material: MaterialResponse|false) => {
    setLoadData(false);
    if(!material) {
      setError(true);
    } else {
      setData(material);
    }
  }, []);
  useEffect(() => {
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(detailMaterialAction(idNumber, onGetDetail));
    }
  }, [dispatch, id, onGetDetail]);
  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoadData}
      title="Sửa chất liệu"
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
          name: 'Chất liệu',
          path: `${UrlConfig.MATERIALS}`,
        },
        {
          name: oldData !== null ? oldData.name : '',
        },
      ]}
    >
      {oldData && (
        <Form
          ref={formRef}
          onFinish={onFinish}
          initialValues={oldData}
          scrollToFirstError
          layout="vertical"
        >
          <Card title="Thông tin cơ bản">
            <div className="padding-20">
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập tên chất liệu',
                      },
                      {
                        max: 50,
                        message: 'Tên chất liệu không vượt quá 50 ký tự',
                      },
                    ]}
                    label="Tên chất liệu"
                    name="name"
                  >
                    <Input maxLength={50} placeholder="Tên danh mục" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      {max: 50, message: 'Thành phần không quá 50 kí tự'},
                      {max: 50},
                    ]}
                    name="component"
                    label="Thành phần"
                  >
                    <Input placeholder="Thành phần" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item
                    rules={[
                      {required: true, message: 'Vui lòng nhập mã chất liệu'},
                      {
                        pattern: RegUtil.NO_SPECICAL_CHARACTER,
                        message: 'Mã chất liệu không chứa ký tự đặc biệt',
                      },
                    ]}
                    name="code"
                    labelAlign="right"
                    label="Mã chất liệu"
                  >
                    <Input
                      placeholder="Mã chất liệu"
                      size="large"
                      maxLength={5}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Form.Item name="description" label="Ghi chú">
                    <Input placeholder="Nhập ghi chú" size="large" />
                  </Form.Item>
                  <Form.Item noStyle hidden name="version">
                    <Input />
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

export default UpdateMaterial;
