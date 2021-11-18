import { Row, Col, Card, Tag } from "antd";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import arrowLeft from "assets/icon/arrow-left.svg";
import { CustomerResponse } from "model/response/customer/customer.response";
import { CustomerListPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";

const genreEnum: any = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const updateCustomerPermission = [CustomerListPermission.customers_update];

type CustomerInfoProps = {
  customer: CustomerResponse | undefined;
  loyaltyCard: any;
};

type CustomerParams = {
  id: string;
};

type detailMapping = {
  name: string;
  value: string | null;
  position: string;
  key: string;
  isWebsite?: boolean;
};

const CustomerInfo: React.FC<CustomerInfoProps> = (
  props: CustomerInfoProps
) => {
  const { customer, loyaltyCard } = props;

  const [allowUpdateCustomer] = useAuthorization({
    acceptPermissions: updateCustomerPermission,
    not: false,
  });

  const params = useParams<CustomerParams>();
  const [showDetail, setShowDetail] = React.useState<boolean>(true);
  const customerDetail: Array<detailMapping> | undefined = React.useMemo(() => {
    if (customer) {
      const details = [
        {
          name: "Họ tên khách hàng",
          value: customer.full_name,
          position: "left",
          key: "1",
        },
        {
          name: "Loại khách hàng",
          value: customer.customer_type,
          position: "right",
          key: "10",
        },
        {
          name: "Số điện thoại",
          value: customer.phone,
          position: "left",
          key: "3",
        },
        {
          name: "Nhóm khách hàng",
          value: customer.customer_group,
          position: "right",
          key: "11",
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
          name: "Địa chỉ",
          value: `${customer.full_address ? customer.full_address : ""}${
            customer.ward ? " - " + customer.ward : ""
          }${customer.district ? " - " + customer.district : ""}${
            customer.city ? " - " + customer.city : ""
          }`,
          position: "right",
          key: "8",
        },
        {
          name: "Giới tính",
          value: genreEnum[customer.gender],
          position: "left",
          key: "6",
        },
      ];
      return details;
    }
  }, [customer]);
  
  const customerDetailCollapse: Array<detailMapping> | undefined =
    React.useMemo(() => {
      if (customer) {
        const details = [
          {
            name: "Ngày cưới",
            value: customer.wedding_date
              ? ConvertUtcToLocalDate(
                  customer.wedding_date,
                  DATE_FORMAT.DDMMYYY
                )
              : null,
            position: "left",
            key: "4",
          },
          {
            name: "Mã khách hàng",
            value: customer.code,
            position: "right",
            key: "2",
          },
          {
            name: "Tên đơn vị",
            value: customer.company,
            position: "left",
            key: "6",
          },
          {
            name: "Thẻ khách hàng",
            value: loyaltyCard?.card_number,
            position: "right",
            key: "4",
          },
          {
            name: "Email",
            value: customer.email,
            position: "left",
            key: "2",
          },
          {
            name: "Mã số thuế",
            value: customer.tax_code,
            position: "right",
            key: "7",
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
            position: "left",
            key: "1",
          },
          {
            name: "Ghi chú",
            value: customer.description,
            position: "right",
            key: "9",
          },
          {
            name: "Website/Facebook",
            value: customer.website,
            position: "left",
            isWebsite: true,
            key: "5",
          },
        ];
        return details;
      }
    }, [customer, loyaltyCard]);
  const handleLinkClick = React.useCallback((detail: detailMapping) => {
    let link = "";
    if (!detail?.value?.includes("https://")) {
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
      extra={allowUpdateCustomer &&
        [
          <Link key={params.id} to={`/customers/${params.id}/update`}>
            Cập nhật
          </Link>,
        ]
      }
    >
      <Row gutter={30} style={{ paddingTop: 16 }}>
        <Col span={12}>
          {customerDetail &&
            customerDetail
              .filter((detail: detailMapping) => detail.position === "left")
              .map((detail: detailMapping, index: number) => (
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
                    <span style={{ color: "#666666" }}>{detail.name}</span>
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
              .filter((detail: detailMapping) => detail.position === "right")
              .map((detail: detailMapping, index: number) => (
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
                    <span style={{ color: "#666666" }}>{detail.name}</span>
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
                .filter((detail: detailMapping) => detail.position === "left")
                .map((detail: detailMapping, index: number) => (
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
                      <span style={{ color: "#666666" }}>{detail.name}</span>
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
                .filter((detail: detailMapping) => detail.position === "right")
                .map((detail: detailMapping, index: number) => (
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
                      <span style={{ color: "#666666" }}>{detail.name}</span>
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
        {showDetail && (
          <Col
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
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default CustomerInfo;
