import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Upload,
  Space,
} from 'antd';
import {ColorResponse, ColorUpdateRequest} from 'model/product/color.model';
import {PageResponse} from 'model/base/base-metadata.response';
import React, {createRef, useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory, useParams} from 'react-router';
import uploadIcon from 'assets/img/upload.svg';
import imgDefIcon from 'assets/img/img-def.svg';
import {
  colorDetailAction, colorUpdateAction,
  getColorAction,
} from 'domain/actions/product/color.action';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';

const {Option} = Select;
type ColorParams = {
  id: string;
};

const ColorUpdateScreen: React.FC = () => {
  const {id} = useParams<ColorParams>();
  let idNumber = parseInt(id);
  const [color, setColor] = useState<ColorResponse | null>(null);
  const [selector, setSelector] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [imageUrl, setImageUrl] = useState('');
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.COLORS);
  }, [history]);
  const onFinish = useCallback(
    (values: ColorUpdateRequest) => {
      if (imageUrl !== '') {
        values.image = imageUrl;
      }
      dispatch(colorUpdateAction(idNumber, values, onSuccess));
    },
    [dispatch, imageUrl, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useEffect(() => {
    dispatch(getColorAction({is_main_color: 1}, setSelector));
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(colorDetailAction(idNumber, setColor));
    }
    return () => {};
  }, [dispatch, id]);
  if (color == null) {
    return (
      <Card>
        <div className="padding-20">Không tìm thấy màu sắc</div>
      </Card>
    );
  }
  return (
    <ContentContainer
      title="Sửa màu sắc"
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
          name: 'Màu sắc',
          path: `${UrlConfig.COLORS}`,
        },
        {
          name: 'Sửa Màu sắc',
        },
      ]}
    >
      <Form
        ref={formRef}
        initialValues={color}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item hidden noStyle name="version">
          <Input />
        </Form.Item>
        <Card title="Thông tin cơ bản">
          <div className="padding-20">
            <Row gutter={50}>
              <Col
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
                span={24}
                sm={24}
                md={24}
                lg={4}
              >
                <Upload
                  customRequest={(options) => {
                    console.log(options);
                  }}
                  listType="picture"
                  action=""
                  maxCount={1}
                  showUploadList={false}
                  className="upload-v"
                >
                  <div className="upload-view">
                    <img className="img-upload" src={uploadIcon} alt="" />
                    <img className="img-default" src={imgDefIcon} alt="" />
                  </div>
                </Upload>
                <div className="upload-bottom">Ảnh màu</div>
              </Col>
              <Col span={24} lg={20} sm={24} md={24}>
                <Row gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      className="form-group form-group-with-search"
                      rules={[
                        {required: true, message: 'Vui lòng nhập tên màu'},
                      ]}
                      label="Tên màu"
                      name="name"
                    >
                      <Input
                        className="r-5"
                        placeholder="Nhập tên màu"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      rules={[
                        {required: true, message: 'Vui lòng chọn màu chủ đạo'},
                      ]}
                      className="form-group form-group-with-search"
                      name="parent_id"
                      label="Màu chủ đạo"
                    >
                      <Select
                        placeholder="Chọn màu chủ đạo"
                        className="selector"
                      >
                        {selector.items.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      rules={[
                        {required: true, message: 'Vui lòng nhập mã màu'},
                      ]}
                      className="form-group form-group-with-search"
                      name="code"
                      labelAlign="right"
                      label="Mã màu"
                      normalize={value => (value || '').toUpperCase()}
                    >
                      <Input
                        className="r-5"
                        placeholder="Nhập mã màu"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Form.Item
                      className="form-group form-group-with-search"
                      name="hex_code"
                      label="Mã hex"
                    >
                      <Input
                        className="r-5"
                        placeholder="Nhập mã hex"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
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

export default ColorUpdateScreen;
