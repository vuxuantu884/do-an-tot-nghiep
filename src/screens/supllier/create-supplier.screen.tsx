import { Button, Card, Col, Collapse, Form, Input, Radio, Row, Select, Switch } from "antd";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CreateSupplierRequest } from "model/request/create-supplier.request";
import { useSelector } from "react-redux";

const { Item } = Form;
const { Panel } = Collapse;
const { Option } = Select;
const initRequest: CreateSupplierRequest = {
  address: '',
  bank_brand: '',
  bank_name: '',
  bank_number: '',
  beneficiary_name: '',
  certifications: [],
  city_id: -1,
  country_id: 233,
  contact_name: '',
  debt_time: 0,
  debt_time_unit: '', 
  district_id: -1,
  website: '',
  email: '',
  fax: '',
  goods: [],
  person_in_charge: '',
  moq: 0,
  note: '',
  name: '',
  phone: '',
  scorecard: '',
  status: 'active',
  tax_code: '',
  type: '',
};
const CreateSupplierScreen: React.FC = () => {
  const supplier_type = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.supplier_type);
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods);
  return (
    <Form layout="vertical" initialValues={initRequest}>
      <Card 
        className="card-block card-block-normal" 
        title="Thông tin cơ bản"
        extra={
          <div className="v-extra d-flex align-items-center">
            Trạng thái
            <Item name="status">
              <Switch />
              <p className="t-status">đang hoạt động</p>
            </Item>
          </div>
        }
      >
        <Row>
          <Item
            className="form-group form-group-with-search" 
            rules={[{ required: true, message: "Vui lòng chọn loại nhà cung cấp" }]} 
            label="Loại nhà cung cấp"
            name="type"
          >
            <Radio.Group>
              {
                supplier_type?.map((item) => (
                  <Radio value={item.value} key={item.value}>{item.name}</Radio>
                ))
              }
            </Radio.Group>
          </Item>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              rules={[
                { required: true, message: 'Vui lòng nhập tên chất liệu' },
              ]}
              label="Mã nhà cung cấp"
              name="name"
            >
              <Input className="r-5" placeholder="Mã nhà cung cấp" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
              className="form-group form-group-with-search"
              name="component"
              label="Tên nhà cung cấp"
            >
              <Input className="r-5" placeholder="Nhập tên nhà cung cấp" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              rules={[
                {required: true, message: 'Vui lòng chọn ngành hàng' },
              ]}
              name="goods"
              label="Ngành hàng"
            >
              <Select  mode="multiple" className="selector" placeholder="Chọn ngành hàng">
                {
                  goods?.map((item) => (<Option key={item.value} value={item.value}>{item.name}</Option>))
                }
              </Select>
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
              className="form-group form-group-with-search"
              name="person_in_charge"
              label="Nhân viên phụ trách"
            >
              <Select className="selector">
                <Option value="">Nhân viên phụ trách</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row className="title-rule">
          <div className="title">Thông tin khác</div>
          <div className="rule" />
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              rules={[
                { required: true, message: 'Vui lòng nhập tên chất liệu' },
              ]}
              label="Mã nhà cung cấp"
              name="name"
            >
              <Input className="r-5" placeholder="Tên danh mục" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
              className="form-group form-group-with-search"
              name="component"
              label="Thành phần"
            >
              <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              rules={[
                { required: true, message: 'Vui lòng nhập tên chất liệu' },
              ]}
              label="Mã nhà cung cấp"
              name="name"
            >
              <Input className="r-5" placeholder="Tên danh mục" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
              className="form-group form-group-with-search"
              name="component"
              label="Thành phần"
            >
              <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              rules={[
                { required: true, message: 'Vui lòng nhập tên chất liệu' },
              ]}
              label="Mã nhà cung cấp"
              name="name"
            >
              <Input className="r-5" placeholder="Tên danh mục" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
              className="form-group form-group-with-search"
              name="component"
              label="Thành phần"
            >
              <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              rules={[
                { required: true, message: 'Vui lòng nhập tên chất liệu' },
              ]}
              label="Mã nhà cung cấp"
              name="name"
            >
              <Input className="r-5" placeholder="Tên danh mục" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
              className="form-group form-group-with-search"
              name="component"
              label="Thành phần"
            >
              <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Collapse expandIconPosition="right" className="view-other card-block card-block-normal">
        <Panel header="Chi tiết nhà cung cấp" key="1">
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chất liệu' },
                ]}
                label="Mã nhà cung cấp"
                name="name"
              >
                <Input className="r-5" placeholder="Tên danh mục" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
                className="form-group form-group-with-search"
                name="component"
                label="Thành phần"
              >
                <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chất liệu' },
                ]}
                label="Mã nhà cung cấp"
                name="name"
              >
                <Input className="r-5" placeholder="Tên danh mục" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
                className="form-group form-group-with-search"
                name="component"
                label="Thành phần"
              >
                <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Panel>
      </Collapse>
      <Collapse expandIconPosition="right" className="view-other card-block card-block-normal">
        <Panel header="Thông tin thanh toán" key="1">
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chất liệu' },
                ]}
                label="Mã nhà cung cấp"
                name="name"
              >
                <Input className="r-5" placeholder="Tên danh mục" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
                className="form-group form-group-with-search"
                name="component"
                label="Thành phần"
              >
                <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chất liệu' },
                ]}
                label="Mã nhà cung cấp"
                name="name"
              >
                <Input className="r-5" placeholder="Tên danh mục" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
                className="form-group form-group-with-search"
                name="component"
                label="Thành phần"
              >
                <Input className="r-5" placeholder="Tên nhà cunh cấp" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Panel>
      </Collapse>
      <Row className="footer-row-btn" justify="end">
        <Button type="default" className="btn-style btn-cancel">Hủy</Button>
        <Button htmlType="submit" type="default" className="btn-style btn-save">Lưu</Button>
      </Row>
    </Form>
  )
}

export default CreateSupplierScreen;