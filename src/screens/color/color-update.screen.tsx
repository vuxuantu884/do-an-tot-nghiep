import { Button, Card, Col, Form, FormInstance, Input, Row, Select, Upload } from "antd";
import { ColorCreateRequest } from "model/request/color-create.request";
import { PageResponse } from "model/base/base-metadata.response";
import { ColorResponse } from "model/response/products/color.response";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import uploadIcon from 'assets/img/upload.svg'
import imgDefIcon from 'assets/img/img-def.svg'
import { colorCreateAction, colorDetailAction, getColorAction } from "domain/actions/product/color.action";

const {Option} = Select;
type  ColorParams = {
  id: string;
}

const ColorUpdateScreen: React.FC = () => {
  const {id} = useParams<ColorParams>();
  const [color, setColor] = useState<ColorResponse|null>(null)
  const [selector, setSelector] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const [imageUrl, setImageUrl] = useState('');
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push('/materials');
  }, [history])
  const onFinish = useCallback((values: ColorCreateRequest) => {
    if(imageUrl !== '') {
      values.image = imageUrl;
    }
    dispatch(colorCreateAction(values, onSuccess))
  }, [dispatch, imageUrl, onSuccess]);
  const onSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useEffect(() => {
    dispatch(getColorAction({is_main_color: 1}, setSelector));
    let idNumber = parseInt(id);
    if(!Number.isNaN(idNumber)) {
      dispatch(colorDetailAction(idNumber, setColor));
    }
    return () => {}
  }, [dispatch, id])
  if(color == null) {
    return (
      <Card className="card-block card-block-normal">
        Không tìm thấy màu sắc
      </Card>
    )
  }
  return (
    <div>
      <Card className="card-block card-block-normal" title="Thông tin cơ bản">
        <Form
          ref={formRef}
          initialValues={color}
          onFinish={onFinish}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}} span={24} sm={24} md={24} lg={4}>
              <Upload customRequest={(options ) => {
                console.log(options);
              }} listType="picture" action="" maxCount={1} showUploadList={false} className="upload-v">
                <div className="upload-view" >
                  <img className="img-upload" src={uploadIcon} alt='' />
                  <img className="img-default" src={imgDefIcon} alt='' />
                </div>
              </Upload>
              <div className="upload-bottom">Ảnh màu</div>
            </Col>
            <Col span={24} lg={20} sm={24} md={24}>
            <Row gutter={24}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  className="form-group form-group-with-search"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên màu' },
                  ]}
                  label="Tên màu"
                  name="name"
                >
                  <Input className="r-5" placeholder="Nhập tên màu" size="large" />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[{ required: true, message: 'Vui lòng chọn màu chủ đạo' }]}
                  className="form-group form-group-with-search"
                  name="parent_id"
                  label="Màu chủ đạo"
                >
                  <Select placeholder="Chọn màu chủ đạo" className="selector">
                    {selector.items.map((item) => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  { required: true, message: 'Vui lòng nhập mã chất liệu' },
                ]}
                className="form-group form-group-with-search"
                name="code"
                labelAlign="right"
                label="Mã màu"
              >
                <Input className="r-5" placeholder="Nhập mã màu" size="large" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="hex_code"
                label="Mã hex"
              >
                <Input className="r-5" placeholder="Nhập mã hex" size="large" />
              </Form.Item>
            </Col>
          </Row>
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

export default ColorUpdateScreen;