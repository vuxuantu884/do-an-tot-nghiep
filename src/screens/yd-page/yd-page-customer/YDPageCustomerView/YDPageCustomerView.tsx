/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useMemo, useState } from "react";
import { Table, Card, Tooltip, Tag, Input, Button, Form } from "antd";

import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import NumberFormat from "react-number-format";
import moment from "moment";

import { showSuccess } from "utils/ToastUtils";
import { formatCurrency, handleFetchApiError, isFetchApiSuccessful, isNullOrUndefined } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderHistorySearch } from "model/order/order.model";
import { getLoyaltyPoint } from "domain/actions/loyalty/loyalty.action";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";

import AddPhoneModal from "screens/yd-page/yd-page-customer/AddPhoneModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";

import "screens/yd-page/yd-page-customer/customer.scss";
import XCloseBtn from "assets/icon/X_close.svg";
import phonePlus from "assets/icon/phone-plus.svg";
import editIcon from "assets/icon/edit.svg";

import { StyledComponent } from "./styles";
import { getOrderHistoryService } from "service/order/order.service";
import { CustomerOrderHistoryResponse } from "model/response/order/order.response";
import { ORDER_SUB_STATUS } from "utils/Order.constants";

const YDPageCustomerView = (props: any) => {
  const {
    allowUpdateCustomer,
    setIsEditCustomer,
    customer,
    newCustomerInfo,
    setNewCustomerInfo,
    getCustomerWhenPhoneChange,
    customerPhone,
    customerDefaultPhone,
    customerPhones,
    addFpPhone,
    deleteFpPhone,
    setFpDefaultPhone,
    setCustomerDefaultPhone,
  } = props;

  const dispatch = useDispatch();

  const [customerName, setCustomerName] = useState<string>(customer.full_name);
  const [visiblePhoneModal, setVisiblePhoneModal] = React.useState<boolean>(false);
  const [visibleDeletePhoneModal, setVisibleDeletePhoneModal] = useState<boolean>(false);
  const [deletePhoneAction, setDeletePhoneAction] = React.useState<() => void>(() => {});

  const [loyaltyPoint, setLoyaltyPoint] = React.useState<LoyaltyPoint | null>(null);

  useEffect(() => {
    if (customer?.id) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
  }, [customer.id, dispatch]);

  useEffect(() => {
    if (customer?.full_name) {
      setCustomerName(customer.full_name);
    } else {
      setCustomerName("");
    }
  }, [customer.full_name]);

  // handle customer order history
  const [orderHistoryYDpageQuery, setOrderHistoryYDpageQuery] = useState<OrderHistorySearch>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });

  const defaultOrderHistory = useMemo(() => {
    return {
      metadata: {
        limit: 10,
        page: 1,
        total: 0,
      },
      items: [],
    };
  }, []);

  const [orderHistory, setOrderHistory] = useState<PageResponse<CustomerOrderHistoryResponse>>(defaultOrderHistory);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState<boolean>(false);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setOrderHistoryYDpageQuery({ ...orderHistoryYDpageQuery, page, limit });
    },
    [orderHistoryYDpageQuery, setOrderHistoryYDpageQuery],
  );

  useEffect(() => {
    if (customer && !isNullOrUndefined(customer.id)) {
      orderHistoryYDpageQuery.customer_ids = Number(customer.id);
      setOrderHistoryLoading(true);
      getOrderHistoryService(orderHistoryYDpageQuery)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setOrderHistory(response.data);
          } else {
            setOrderHistory(defaultOrderHistory);
            handleFetchApiError(response, "Danh sách lịch sử đơn hàng", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          setOrderHistoryLoading(false);
        });
    } else {
      setOrderHistory(defaultOrderHistory);
    }
  }, [
    customer,
    customer.id,
    defaultOrderHistory,
    dispatch,
    orderHistoryYDpageQuery,
  ]);
  // end handle customer order history

  const status_order = [
    {
      name: "Nháp",
      value: "draft",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đóng gói",
      value: "packed",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Xuất kho",
      value: "shipping",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đã xác nhận",
      value: "finalized",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Hoàn thành",
      value: "completed",
      color: "#27AE60",
      background: "rgba(39, 174, 96, 0.1)",
    },
    {
      name: "Kết thúc",
      value: "finished",
      color: "#27AE60",
      background: "rgba(39, 174, 96, 0.1)",
    },
    {
      name: "Đã huỷ",
      value: "cancelled",
      color: "#ae2727",
      background: "rgba(223, 162, 162, 0.1)",
    },
    {
      name: "Đã hết hạn",
      value: "expired",
      color: "#ae2727",
      background: "rgba(230, 171, 171, 0.1)",
    },
    {
      name: "Đơn trả",
      value: ORDER_SUB_STATUS.returned,
      color: "#E24343",
      background: "rgba(226, 67, 67, 0.1)",
    },
  ];

  const checkIfOrderReturn = (record: CustomerOrderHistoryResponse) => {
    return !!record.order_id;
  };

  const purchaseHistoryColumn: any = [
    {
      title: "Ngày",
      render: (value: any, row: any) => {
        return <div>{moment(row.created_date).format("DD/MM")}</div>;
      },
    },
    {
      title: "Tổng thu",
      align: "right",
      render: (value: any, item: any) => {
        const isOrderReturn = checkIfOrderReturn(item);
        return (
          <div style={{ textAlign: "right" }}>
            {isOrderReturn ? (
              <Link to={`${UrlConfig.ORDERS_RETURN}/${item.id}`} target="_blank">
                {formatCurrency(item.total_line_amount_after_line_discount)}
              </Link>
            ) : (
              <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">
                {formatCurrency(item.total_line_amount_after_line_discount)}
              </Link>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (value: any, row: any) => {
        const isOrderReturn = checkIfOrderReturn(row);
        if (isOrderReturn) {
          row.status = ORDER_SUB_STATUS.returned;
          row.sub_status = "Đơn trả";
        }
        const statusTag = status_order.find((status) => status.value === row.status);
        return (
          <div>
            <Tag
              className="fpage-recent-tag"
              style={{
                color: `${statusTag?.color}`,
                backgroundColor: `${statusTag?.background}`,
              }}
            >
              {row.sub_status}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Nguồn",
      dataIndex: "source",
      className: "order_source_desc",
    },
  ];

  const handleEditCustomer = () => {
    setIsEditCustomer(true);
  };

  // Update new customer info
  const updateNewCustomerInfo = (fieldName: string, value: any) => {
    const tempNewCustomerInfo = { ...newCustomerInfo };
    tempNewCustomerInfo[fieldName] = value;
    setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
  };

  // update customer phone
  const showPhoneModal = () => {
    setVisiblePhoneModal(true);
  };

  const hidePhoneModal = () => {
    setVisiblePhoneModal(false);
  };

  const showConfirmDeletePhone = (p: string) => {
    setVisibleDeletePhoneModal(true);
    setDeletePhoneAction(() => () => {
      deleteFpPhone(p);
      setVisibleDeletePhoneModal(false);
    });
  };

  const onSelectPhone = (phone: any) => {
    if (phone !== customerPhone) {
      updateNewCustomerInfo("phone", phone);
      getCustomerWhenPhoneChange(phone);
      setCustomerDefaultPhone(phone);
    }
  };
  // end update customer phone

  // customer purchase info
  const purchaseIfo = customer?.report;

  const calculateAge = (birthDay: any) => {
    const current = new Date().getFullYear();
    const birthdayYear = new Date(birthDay).getFullYear();
    return current - birthdayYear;
  };

  const customerPurchaseInfo = [
    {
      name: "Tiền tích lũy:",
      value: purchaseIfo?.total_paid_amount ? (
        <>
          <NumberFormat
            value={purchaseIfo.total_paid_amount}
            displayType={"text"}
            thousandSeparator={true}
          />
          <span> đ</span>
        </>
      ) : (
        "--"
      ),
    },
    {
      name: "Điểm tích lũy:",
      value: loyaltyPoint?.point ? (
        <NumberFormat value={loyaltyPoint.point} displayType={"text"} thousandSeparator={true} />
      ) : (
        "--"
      ),
    },
    {
      name: "GTTB:",
      value:
        purchaseIfo?.average_order_value && purchaseIfo?.total_finished_order ? (
          <>
            <NumberFormat
              value={Math.round(purchaseIfo.average_order_value)}
              displayType={"text"}
              thousandSeparator={true}
            />
            <span> đ / </span>
            <span>{purchaseIfo.total_finished_order} đơn</span>
          </>
        ) : (
          "--"
        ),
    },
    {
      name: "Hạng KH:",
      value: loyaltyPoint?.loyalty_level ? <span>{loyaltyPoint.loyalty_level}</span> : "--",
    },
    {
      name: "Thẻ KH:",
      value: customer?.card_number ? <span>{customer?.card_number}</span> : "--",
    },
    {
      name: "Tuổi KH:",
      value: customer?.birthday ? (
        <div>
          {ConvertUtcToLocalDate(customer.birthday, DATE_FORMAT.DDMMYYY)}
          <span> - {calculateAge(customer.birthday)} tuổi</span>
        </div>
      ) : (
        "--"
      ),
    },
  ];
  // end customer purchase info

  // handle note
  const [notes, setNotes] = React.useState<any>([]);
  const [note, setNote] = React.useState<string>("");
  window.addEventListener(
    "message",
    async (e) => {
      const { data } = e;
      const { service, res } = data;

      if (service === "notes") {
        setNotes(res);
      }
    },
    false,
  );

  const handleNote = {
    get: (e: any) => {
      e.preventDefault();
      window.parent.postMessage(
        {
          service: "notes",
          action: "list",
          params: {},
        },
        "*",
      );
    },
    create: (noteContent: any) => {
      if (noteContent) {
        window.parent.postMessage(
          {
            service: "notes",
            action: "add",
            params: {
              content: noteContent,
            },
          },
          "*",
        );
        showSuccess("Thêm mới ghi chú thành công");
      }
    },
    delete: (note: any) => {
      if (note) {
        window.parent.postMessage(
          {
            service: "notes",
            action: "remove",
            params: {
              noteId: note.id,
            },
          },
          "*",
        );
        showSuccess("Xóa ghi chú thành công");
      }
    },
  };

  return (
    <StyledComponent>
      <div className="yd-page-customer-view">
        <Card>
          {/*Customer name*/}
          <div className="item-container">
            <Input
              disabled={true}
              maxLength={255}
              placeholder="Nhập tên khách hàng"
              value={customerName}
              className="item-input"
            />

            <div className="item-icon-button">
              {allowUpdateCustomer ? (
                <Button icon={<img src={editIcon} alt="" />} onClick={handleEditCustomer} />
              ) : (
                <Tooltip placement="topRight" title="Không có quyền sửa khách hàng" color="red">
                  <Button disabled={true} icon={<img src={editIcon} alt="" />} />
                </Tooltip>
              )}
            </div>
          </div>

          {/*Customer phone*/}
          <div className="item-container">
            <Input
              disabled={true}
              value={customerPhone}
              placeholder="Nhập số điện thoại"
              className="item-input phone-disabled"
            />

            <div className="item-icon-button">
              {allowUpdateCustomer ? (
                <Button
                  type="primary"
                  icon={<img src={phonePlus} alt="" />}
                  onClick={showPhoneModal}
                />
              ) : (
                <Tooltip placement="topRight" title="Không có quyền sửa khách hàng" color="red">
                  <Button
                    style={{ cursor: "default" }}
                    type="primary"
                    icon={<img src={phonePlus} alt="" />}
                  />
                </Tooltip>
              )}
            </div>
          </div>

          {customerPhones && customerPhones.length > 0 && (
            <div className="phone-tag">
              {customerPhones &&
                customerPhones.map((phone: any, index: any) => (
                  <Tag
                    key={index}
                    style={{
                      cursor: "pointer",
                      borderColor: customerPhone === phone ? "#dcdcff" : "#f4f4f7",
                      backgroundColor: customerPhone === phone ? "#dcdcff" : "#f4f4f7",
                    }}
                    onClick={() => onSelectPhone(phone)}
                  >
                    {phone}
                    {allowUpdateCustomer && (
                      <img
                        alt="delete"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          showConfirmDeletePhone(phone);
                        }}
                        style={{ width: 16, marginBottom: 2 }}
                        src={XCloseBtn}
                      />
                    )}
                  </Tag>
                ))}
            </div>
          )}

          {/*Customer info*/}
          <div className="yd-customer-purchase-info">
            {customerPurchaseInfo.map((item, index) => (
              <div className="item-info" key={index}>
                <div>{item.name}</div>
                <div>{item.value}</div>
              </div>
            ))}
          </div>

          {/*Ghi chú*/}
          <div className="customer-note">
            <div>
              <b>Ghi chú</b>
            </div>
            <Form.Item
              name="note"
              className="note-container"
              rules={[
                {
                  max: 1000,
                  message: "Vui lòng không nhập quá 1000 kí tự",
                },
              ]}
            >
              <Input
                disabled={!allowUpdateCustomer}
                maxLength={1000}
                placeholder="Nhập ghi chú"
                value={note}
                onChange={(e: any) => setNote(e.target.value)}
                onPressEnter={async (e: any) => {
                  await handleNote.get(e);
                  await handleNote.create(e.target.value);
                  setNote("");
                }}
              />
              <Button
                type="primary"
                onClick={async (e: any) => {
                  await handleNote.get(e);
                  await handleNote.create(note);
                  setNote("");
                }}
              >
                Thêm
              </Button>
            </Form.Item>

            {notes?.length > 0 ? (
              notes.map((note: any, index: number) => (
                <div className="customer-note-item" key={index}>
                  <span key={note.id}>{note.content}</span>
                  {allowUpdateCustomer && (
                    <img
                      alt="delete"
                      onClick={() => handleNote.delete(note)}
                      style={{
                        width: 20,
                        float: "right",
                        cursor: "pointer",
                        marginLeft: 4,
                      }}
                      src={XCloseBtn}
                    />
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: "right" }}>
                <a href="#" onClick={(e) => handleNote.get(e)}>
                  Xem ghi chú
                </a>
              </div>
            )}
          </div>

          {/*Lịch sử mua hàng*/}
          <div className="purchase-history">
            <div style={{ margin: "10px 0 5px" }}>
              <b>ĐƠN GẦN NHẤT</b>
            </div>
            <Table
              columns={purchaseHistoryColumn}
              dataSource={orderHistory.items}
              loading={orderHistoryLoading}
              pagination={{
                pageSize: orderHistory.metadata.limit,
                total: orderHistory.metadata.total,
                current: orderHistory.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              rowKey={(data) => data.id}
            />
          </div>
        </Card>
      </div>

      <AddPhoneModal
        visible={visiblePhoneModal}
        customerDefaultPhone={customerDefaultPhone}
        addFpPhone={addFpPhone}
        deleteFpPhone={showConfirmDeletePhone}
        setFpDefaultPhone={setFpDefaultPhone}
        customerPhones={customerPhones}
        onOk={hidePhoneModal}
        onCancel={hidePhoneModal}
      />

      <ModalDeleteConfirm
        width="400px"
        visible={visibleDeletePhoneModal}
        onOk={() => deletePhoneAction()}
        onCancel={() => setVisibleDeletePhoneModal(false)}
        title="Thông báo"
        subTitle="Bạn có chắc chắn muốn xóa số điện thoại này"
      />
    </StyledComponent>
  );
};

export default YDPageCustomerView;
