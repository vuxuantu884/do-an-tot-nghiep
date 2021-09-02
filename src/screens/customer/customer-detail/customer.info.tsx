import { Row, Col, Card, Collapse, Tag } from "antd";
import React from "react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";

const { Panel } = Collapse;

const genreEnum: any = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};
function CustomerInfo(props: any) {
  const { customer } = props;
  const params = useParams() as any;
  const [customerDetail, setCustomerDetail] = React.useState([]) as any;
  const [customerDetailCollapse, setCustomerDetailCollapse] = React.useState(
    []
  ) as any;
  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        {
          name: "Họ tên khách hàng",
          value: customer.full_name,
          position: "left",
          key: "10",
        },

        {
          name: "Giới tính",
          value: genreEnum[customer.gender],
          position: "right",
          key: "11",
        },
        {
          name: "Số điện thoại",
          value: customer.phone,
          position: "left",
          key: "12",
        },
        {
          name: "Loại khách hàng",
          value: customer.customer_type,
          position: "right",
          key: "13",
        },
        {
          name: "Ngày sinh",
          value: customer.birthday
            ? moment(customer.birthday).format("DD/MM/YYYY")
            : null,
          position: "left",
          key: "14",
        },
        {
          name: "Nhóm khách hàng",
          value: customer.customer_group,
          position: "right",
          key: "15",
        },
      ];
    }
    setCustomerDetail(details);
  }, [customer, setCustomerDetail]);
  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        // {
        //   name: "Giới tính",
        //   value: customer.gender === "male" ? "Nam" : "Nữ",
        // },
        {
          name: "Nhân viên phụ trách",
          value: `${
            customer.responsible_staff_code
              ? customer.responsible_staff_code
              : ""
          }${
            customer.responsible_staff ? "-" + customer.responsible_staff : ""
          }`,
          position: "right",
          key: "1",
        },
        {
          name: "Email",
          value: customer.email,
          position: "left",
          key: "2",
        },
        {
          name: "Mã khách hàng",
          value: customer.code,
          position: "right",
          key: "3",
        },
        {
          name: "Ngày cưới",
          value: customer.wedding_date
            ? moment(customer.wedding_date).format("DD/MM/YYYY")
            : null,
          position: "left",
          key: "4",
        },
        {
          name: "Website/Facebook",
          value: customer.website,
          position: "right",
          isWebsite: true,
          key: "5",
        },
        {
          name: "Tên đơn vị",
          value: customer.company,
          position: "left",
          key: "6",
        },
        {
          name: "Mã số thuế",
          value: customer.tax_code,
          position: "right",
          key: "7",
        },
        {
          name: "Địa chỉ",
          value: `${customer.full_address ? customer.full_address : ""}${
            customer.ward ? " - " + customer.ward : ""
          }${customer.district ? " - " + customer.district : ""}${
            customer.city ? " - " + customer.city : ""
          }`,
          position: "left",
          key: "8",
        },
        {
          name: "Ghi chú",
          value: customer.description,
          position: "right",
          key: "9",
        },
      ];
    }
    setCustomerDetailCollapse(details);
  }, [customer, setCustomerDetailCollapse]);
  return (
    <Card
      className="customer-information-card"
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="title-card">THÔNG TIN CÁ NHÂN</span>
          {customer && customer.status === "active" ? (
            <Tag
              className="orders-tag"
              style={{
                marginLeft: 10,
                backgroundColor: "#27AE60",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 400,
                marginBottom: 6,
              }}
            >
              Đang hoạt động
            </Tag>
          ) : (
            <Tag
              className="orders-tag"
              style={{
                marginLeft: 10,
                backgroundColor: "#aaaaaa",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 400,
                marginBottom: 6,
              }}
            >
              Không hoạt động
            </Tag>
          )}
        </div>
      }
      extra={[<Link to={`/customers/edit/${params.id}`}>Cập nhật</Link>]}
    >
      <Row gutter={30} style={{ paddingTop: 16 }}>
        <Col span={12}>
          {customerDetail &&
            customerDetail
              .filter((detail: any) => detail.position === "left")
              .map((detail: any, index: number) => (
                <Col
                  key={detail.key}
                  span={24}
                  style={{
                    display: "flex",
                    marginBottom: 20,
                    color: "#222222",
                  }}
                >
                  <Col
                    span={12}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0 4px 0 15px",
                    }}
                  >
                    <span>{detail.name}</span>
                    <span style={{ fontWeight: 600 }}>:</span>
                  </Col>
                  <Col span={12} style={{ paddingLeft: 0 }}>
                    <span
                      style={{
                        wordWrap: "break-word",
                        fontWeight: 500,
                      }}
                    >
                      {detail.value ? detail.value : "---"}
                    </span>
                  </Col>
                </Col>
              ))}
        </Col>
        <Col span={12}>
          {customerDetail &&
            customerDetail
              .filter((detail: any) => detail.position === "right")
              .map((detail: any, index: number) => (
                <Col
                  key={detail.key}
                  span={24}
                  style={{
                    display: "flex",
                    marginBottom: 20,
                    color: "#222222",
                  }}
                >
                  <Col
                    span={12}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0 4px 0 15px",
                    }}
                  >
                    <span>{detail.name}</span>
                    <span style={{ fontWeight: 600 }}>:</span>
                  </Col>
                  <Col span={12} style={{ paddingLeft: 0 }}>
                    <span
                      style={{
                        wordWrap: "break-word",
                        fontWeight: 500,
                      }}
                    >
                      {detail.value ? detail.value : "---"}
                    </span>
                  </Col>
                </Col>
              ))}
        </Col>
      </Row>
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Collapse ghost>
            <Panel
              key="1"
              header={[<span style={{ color: "#5656A1" }}>Xem thêm</span>]}
            >
              <Row gutter={30}>
                <Col span={12}>
                  {customerDetailCollapse &&
                    customerDetailCollapse
                      .filter((detail: any) => detail.position === "left")
                      .map((detail: any, index: number) => (
                        <Col
                          key={detail.key}
                          span={24}
                          style={{
                            display: "flex",
                            marginBottom: 20,
                            color: "#222222",
                          }}
                        >
                          <Col
                            span={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "0 4px 0 15px",
                            }}
                          >
                            <span>{detail.name}</span>
                            <span style={{ fontWeight: 600 }}>:</span>
                          </Col>
                          <Col span={12} style={{ paddingLeft: 0 }}>
                            <span
                              style={{
                                wordWrap: "break-word",
                                fontWeight: 500,
                              }}
                            >
                              {detail.value ? detail.value : "---"}
                            </span>
                          </Col>
                        </Col>
                      ))}
                </Col>
                <Col span={12}>
                  {customerDetailCollapse &&
                    customerDetailCollapse
                      .filter((detail: any) => detail.position === "right")
                      .map((detail: any, index: number) => (
                        <Col
                          key={detail.key}
                          span={24}
                          style={{
                            display: "flex",
                            marginBottom: 20,
                            color: "#222222",
                          }}
                        >
                          <Col
                            span={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "0 4px 0 15px",
                            }}
                          >
                            <span>{detail.name}</span>
                            <span style={{ fontWeight: 600 }}>:</span>
                          </Col>
                          <Col span={12} style={{ paddingLeft: 0 }}>
                            <span
                              style={{
                                wordWrap: "break-word",
                                fontWeight: 500,
                              }}
                            >
                              {detail.isWebsite ? (
                                <a href={detail.value}>{detail.value}</a>
                              ) : detail.value ? (
                                detail.value
                              ) : (
                                "---"
                              )}
                            </span>
                          </Col>
                        </Col>
                      ))}
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </Card>
  );
}

export default CustomerInfo;
