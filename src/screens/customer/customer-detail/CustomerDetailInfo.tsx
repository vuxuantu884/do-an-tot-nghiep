import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Tag } from "antd";

import useAuthorization from "hook/useAuthorization";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { CustomerResponse } from "model/response/customer/customer.response";
import { CustomerListPermission } from "config/permissions/customer.permission";

import arrowLeft from "assets/icon/arrow-left.svg";
import arrowUp from "assets/icon/arrow-up.svg";


const genreEnum: any = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const updateCustomerPermission = [CustomerListPermission.customers_update];

type CustomerDetailInfoProps = {
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

const CustomerDetailInfo: React.FC<CustomerDetailInfoProps> = (
  props: CustomerDetailInfoProps
) => {
  const { customer, loyaltyCard } = props;

  const [allowUpdateCustomer] = useAuthorization({
    acceptPermissions: updateCustomerPermission,
    not: false,
  });

  const params = useParams<CustomerParams>();
  const [isShowMore, setIsShowMore] = React.useState<boolean>(false);

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
          value: `${customer.full_address ? customer.full_address : ""}${customer.ward ? " - " + customer.ward : ""
            }${customer.district ? " - " + customer.district : ""}${customer.city ? " - " + customer.city : ""
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

  const customerDetailCollapse: Array<detailMapping> | undefined = React.useMemo(() => {
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
          // value: loyaltyCard?.card_number,
          value: customer?.card_number,
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
          value: `${customer.responsible_staff_code
            ? customer.responsible_staff_code
            : ""
            }${customer.responsible_staff ? "-" + customer.responsible_staff : ""
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

  const onClickWebsite = React.useCallback((value: any) => {
    let link = "";
    if (value.includes("https://")) {
      link = `${value}`;
    } else {
      link = `https://${value}`;
    }

    window.open(link, "_blank");
  }, []);


  return (
    <Card
      className="general-info"
      title={
        <>
          <span className="card-title">THÔNG TIN CÁ NHÂN</span>
          {customer && customer.status === "active" ?
            <Tag className="customer-status active">Đang hoạt động</Tag>
            : <Tag className="customer-status inactive">Không hoạt động</Tag>
          }
        </>
      }
      extra={allowUpdateCustomer &&
        [
          <Link key={params.id} to={`/customers/${params.id}/update`}>
            Cập nhật
          </Link>,
        ]
      }
    >
      <div className="row-item">
        <div className="left-item">
          {customerDetail &&
            customerDetail.filter((detail: detailMapping) => detail.position === "left")
              .map((detail: detailMapping, index: number) => (
                <div className="detail-info" key={index}>
                  <div className="title">
                    <span style={{ color: "#666666" }}>{detail.name}</span>
                    <span style={{ fontWeight: 600 }}>:</span>
                  </div>

                  <span className="content">{detail.value ? detail.value : "---"}</span>
                </div>
              ))}
        </div>

        <div className="right-item">
          {customerDetail &&
            customerDetail.filter((detail: detailMapping) => detail.position === "right")
              .map((detail: detailMapping, index: number) => (
                <div className="detail-info" key={index}>
                  <div className="title">
                    <span style={{ color: "#666666" }}>{detail.name}</span>
                    <span style={{ fontWeight: 600 }}>:</span>
                  </div>

                  <span className="content">{detail.value ? detail.value : "---"}</span>
                </div>
              ))
          }
        </div>

      </div>

      {isShowMore &&
        <>
          <div className="row-item">
            <div className="left-item">
              {customerDetailCollapse &&
                customerDetailCollapse.filter((detail: detailMapping) => detail.position === "left")
                  .map((detail: detailMapping, index: number) => (
                    <div className="detail-info" key={index}>
                      <div className="title">
                        <span style={{ color: "#666666" }}>{detail.name}</span>
                        <span style={{ fontWeight: 600 }}>:</span>
                      </div>

                      {detail.value ?
                        (detail.isWebsite ?
                          <span className="content link"
                            onClick={() => onClickWebsite(detail.value)}
                          >
                            {detail.value}
                          </span>
                          : <span className="content">{detail.value}</span>
                        )
                        : <span className="content">{"---"}</span>
                      }
                    </div>
                  ))
              }
            </div>

            <div className="right-item">
              {customerDetailCollapse &&
                customerDetailCollapse.filter((detail: detailMapping) => detail.position === "right")
                  .map((detail: detailMapping, index: number) => (
                    <div className="detail-info" key={index}>
                      <div className="title">
                        <span style={{ color: "#666666" }}>{detail.name}</span>
                        <span style={{ fontWeight: 600 }}>:</span>
                      </div>

                      <span className="content">{detail.value ? detail.value : "---"}</span>
                    </div>
                  ))
              }
            </div>
          </div>

          <div style={{ cursor: "pointer", marginLeft: "10px" }} onClick={() => { setIsShowMore(!isShowMore) }}>
            <img alt="arrowUp" src={arrowUp} />
            <span style={{ marginLeft: "10px", color: "#5656A2" }}>Thu gọn</span>
          </div>
        </>
      }

      {!isShowMore &&
        <div className="show-more">
          <span className="action" onClick={() => { setIsShowMore(!isShowMore) }}>
            <img alt="arrowUp" src={arrowLeft} />
            <span style={{ marginLeft: "10px", color: "#5656A2" }}>Xem thêm</span>
          </span>
          <div className="dash" />
        </div>
      }
    </Card>
  );
};

export default CustomerDetailInfo;
