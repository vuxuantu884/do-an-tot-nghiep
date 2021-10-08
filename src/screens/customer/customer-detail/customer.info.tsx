import { Row, Col, Card, Tag } from "antd";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import arrowLeft from "assets/icon/arrow-left.svg";

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
  const [showDetail, setShowDetail] = React.useState<boolean>(true);

  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        {
          name: "Tên khách hàng",
          value: customer.full_name,
          position: "left",
          key: "1",
        },
        {
          name: "Mã khách hàng",
          value: customer.code,
          position: "right",
          key: "2",
        },
        {
          name: "Số điện thoại",
          value: customer.phone,
          position: "left",
          key: "3",
        },
        {
          name: "Thẻ khách hàng",
          value: customer.card_number,
          position: "right",
          key: "4",
        },
        {
          name: "Ngày sinh",
          value: customer.birthday
            ? ConvertUtcToLocalDate(customer.birthday, DATE_FORMAT.DDMMYYY)
            : null,
          position: "left",
          key: "5",
        },
        {
          name: "Giới tính",
          value: genreEnum[customer.gender],
          position: "right",
          key: "6",
        },
      ];
    }
    setCustomerDetail(details);
  }, [customer, setCustomerDetail]);
  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        {
          name: "Nhóm khách hàng",
          value: customer.customer_group,
          position: "left",
          key: "11",
        },
        {
          name: "Email",
          value: customer.email,
          position: "right",
          key: "2",
        },
        {
          name: "Loại khách hàng",
          value: customer.customer_type,
          position: "left",
          key: "10",
        },
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
          name: "Ngày cưới",
          value: customer.wedding_date
            ? ConvertUtcToLocalDate(customer.wedding_date, DATE_FORMAT.DDMMYYY)
            : null,
          position: "left",
          key: "4",
        },
        {
          name: "Facebook",
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

  const handleLinkClick = React.useCallback((detail: any) => {
    let link = "";
    if (!detail?.value.includes("https://")) {
      link = `https://${detail.value}`;
    } else {
      link = `${detail.value}`;
    }
    window.open(link, "_blank");
  }, []);
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
      extra={[
        <Link key={params.id} to={`/customers/${params.id}/edit`}>
          Cập nhật
        </Link>,
      ]}
    >
      <Row gutter={30} style={{ paddingTop: 16 }}>
        <Col span={12}>
          {customerDetail &&
            customerDetail
              .filter((detail: any) => detail.position === "left")
              .map((detail: any, index: number) => (
                <Col
                  key={index}
                  span={24}
                  style={{
                    display: "flex",
                    marginBottom: 10,
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
                    <span style={{color: "#666666"}}>{detail.name}</span>
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
                    marginBottom: 10,
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
                    <span style={{color: "#666666"}}>{detail.name}</span>
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
      {!showDetail && (
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
                      marginBottom: 10,
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
                      <span style={{color: "#666666"}}>{detail.name}</span>
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
                      marginBottom: 10,
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
                      <span style={{color: "#666666"}}>{detail.name}</span>
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
                          detail.value ? (
                            <span
                              style={{ color: "#2a2a86", cursor: "pointer" }}
                              onClick={() => handleLinkClick(detail)}
                            >
                              {detail.value}
                            </span>
                          ) : (
                            "---"
                          )
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
      )}

      <Row
        style={{
          padding: "0px 30px 10px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Col span={4} style={{ cursor: "pointer" }}>
          <div
            style={{ flex: 1 }}
            onClick={() => {
              setShowDetail(!showDetail);
            }}
          >
            <img
              alt="arrow down"
              src={arrowLeft}
              style={
                !showDetail
                  ? { marginBottom: "3px", transform: "rotate(270deg)" }
                  : { marginBottom: "3px" }
              }
            ></img>
            <span style={{ marginLeft: "15px", color: "#5656A2" }}>
              {showDetail ? "Xem thêm" : "Thu gọn"}
            </span>
          </div>
        </Col>
        {showDetail && <Col
          span={20}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 0,
              borderBottom: "1px dashed #E5E5E5",
            }}
          ></div>
        </Col>}
        
      </Row>
    </Card>
  );
}

export default CustomerInfo;
