import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Table,
  Space,
} from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import MorePopover from "./more";
import React from "react";
import Popup from "./popup";
import CustomerAdd from "./add";

const { Column } = Table;

const Customer = () => {
  const customers = [
    { id: 1, name: "A", phone: "13213", email: '', },
    { id: 2, name: "B", phone: "13213", email: '', },
    { id: 3, name: "C", phone: "13213", email: '', },
  ];
  const [ popup, setPopup ] = React.useState({
      visible: false,
      x: 0,
      y: 0
  })
  const [ visible, setVisible ] = React.useState<boolean>(false);
  const onRow = (record: any) => ({
    onContextMenu: (event: any) => {
        event.preventDefault()
      if (!popup.visible) {
        document.addEventListener(`click`, function onClickOutside() {
          setPopup({...popup,visible: false})
          document.removeEventListener(`click`, onClickOutside)
        })
      }

      setPopup({visible: true, x: event.clientX, y: event.clientY})
    }
  })
  return (
    <Row gutter={[12, 12]} style={{ padding: "5px 0" }}>
      <Col span={24}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={() => setVisible(true)} icon={<UserAddOutlined />} className="ant-btn-primary">
            Thêm khách hàng
          </Button>
        </div>
      </Col>
      <Col span={24}>
        <Card>
          <Row gutter={[10, 10]} style={{ padding: "5px 7px" }}>
            <Col span={4}>
              <Input prefix={<SearchOutlined style={{color: '#d4d3cf'}} />} placeholder="Tên khách hàng, số điện thoại,..."></Input>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card style={{position: 'relative'}}>
          <Table dataSource={customers} >
            <Column title="Tên khách hàng" dataIndex="name" key="name" />
            <Column title="Số điện thoại" dataIndex="phone" key="phone" />
            <Column title="Thư điện tử" dataIndex="email" key="email" />
            <Column
              key="action"
              render={() => (
                <div className="more">
                  <MorePopover />
                </div>
              )}
            />
          </Table>
          <Popup {...popup}  />
        </Card>
      </Col>
      {
          visible && <CustomerAdd visible={visible} setVisible={setVisible} />
      }
    </Row>
  );
};

export default Customer;
