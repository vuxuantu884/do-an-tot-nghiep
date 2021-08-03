import { Card, Input, Row, Col, Table } from "antd";
import ContentContainer from "component/container/content.container";
import { SearchOutlined } from "@ant-design/icons";
import MorePopover from "./more";
import React from "react";
import Popup from "./popup";
import CustomerAdd from "./add";
import ButtonCreate from "component/header/ButtonCreate";
import UrlConfig from "config/UrlConfig";
import { useDispatch } from "react-redux";
import { CustomerSearch, CustomerList } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";

const { Column } = Table;

const Customer = () => {
  const dispatch = useDispatch()
  const [customers, setCustomers] = React.useState<Array<any>>([])
  const [query, setQuery] = React.useState<CustomerSearchQuery>({page: 1, limit: 10, request: ''})
  const [popup, setPopup] = React.useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [visible, setVisible] = React.useState<boolean>(false);

  React.useEffect(() => {
    dispatch(CustomerList(query, setCustomers))
  }, [])

  const onRow = (record: any) => ({
    onContextMenu: (event: any) => {
      event.preventDefault();
      if (!popup.visible) {
        document.addEventListener(`click`, function onClickOutside() {
          setPopup({ ...popup, visible: false });
          document.removeEventListener(`click`, onClickOutside);
        });
      }

      setPopup({ visible: true, x: event.clientX, y: event.clientY });
    },
  });
  return (
    <ContentContainer
      title="Quản lý khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `/customer`,
        },
      ]}
      extra={<ButtonCreate path={`/customer/create`} />}
    >
      <Row gutter={[12, 12]} style={{ padding: "5px 0" }}>
        <Col span={24}>
          <Card>
            <Row gutter={[10, 10]} style={{ padding: "5px 7px" }}>
              <Col span={4}>
                <Input
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="Tên khách hàng, số điện thoại,..."
                ></Input>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card style={{ position: "relative" }}>
            <Table dataSource={customers}>
              <Column title="Mã số" dataIndex="code" key="code" />
              <Column title="Tên khách hàng" dataIndex="full_name" key="full_name" />
              <Column title="Số điện thoại" dataIndex="phone" key="phone" />
              <Column title="Thư điện tử" dataIndex="email" key="email" />
              <Column title="Nhóm khách hàng" dataIndex="customer_group" key="customer_group" />
              <Column title="Loại khách hàng" dataIndex="customer_type" key="customer_type" />
              <Column title="Mức độ" dataIndex="customer_level" key="customer_level" />
              {/* <Column
                key="action"
                render={() => (
                  <div className="more">
                    <MorePopover />
                  </div>
                )}
              /> */}
            </Table>
            <Popup {...popup} />
          </Card>
        </Col>
        {visible && <CustomerAdd visible={visible} setVisible={setVisible} />}
      </Row>
    </ContentContainer>
  );
};

export default Customer;
