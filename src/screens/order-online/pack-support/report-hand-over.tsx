import { PlusSquareOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Col, FormInstance, Row, Select } from "antd";
import { createRef, useState } from "react";
// import { useDispatch } from "react-redux";
import ReportHandOverModal from "../modal/report-hand-over.modal";

const ReportHandOver: React.FC = () => {
  // const dispatch = useDispatch();

  //useState
  const [visibleModal, setVisibleModal] = useState(false);
  const formRef = createRef<FormInstance>();

  const handleOk = () => {};

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setVisibleModal(false);
  };

  const showModal = () => {
    setVisibleModal(true);
  };

  return (
    <Card
      title="Cho vào biên bản bàn giao "
      bordered={false}
      style={{ marginTop: "24px" }}
    >
      <div>
        <Row gutter={24}>
          <Col md={8} sm={24}>
            <Select
              className="select-with-search"
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn biên bản"
              notFoundContent="Không tìm thấy kết quả"
              onChange={(value?: number) => {
                console.log(value);
              }}
              filterOption={(input, option) => {
                if (option) {
                  return (
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  );
                }
                return false;
              }}
            >
              {/* {dataCanAccess.map((item, index) => (
                  <Select.Option key={index.toString()} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))} */}
              <Select.Option key={0} value={1}>
                -- chon --
              </Select.Option>
            </Select>
          </Col>
          <Col md={3}>
            <Button icon={<PlusSquareOutlined />} size="large" block onClick={showModal}>
              Thêm mới
            </Button>
          </Col>
          <Col md={2}>
            <Button type="primary" icon={<SaveOutlined />} size="large" block>
              Lưu
            </Button>
          </Col>
        </Row>
      </div>
      <ReportHandOverModal visible={visibleModal} formRef={formRef} handleOk={handleOk} handleCancel={handleCancel} />
    </Card>
  );
};

export default ReportHandOver;
