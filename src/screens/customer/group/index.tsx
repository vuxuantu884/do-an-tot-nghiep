import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Menu, Dropdown } from "antd";
import ContentContainer from "component/container/content.container";
import FormCustomerGroup from "component/forms/FormCustomerGroup";
import CustomerModal from "../CustomerModal";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import threeDot from "assets/icon/three-dot.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

import {
  actionAddCustomerGroup,
  actionDeleteCustomerGroup,
  actionEditCustomerGroup,
  actionFetchListCustomerGroup,
} from "domain/actions/customer/customer.action";
import { modalActionType } from "model/modal/modal.model";
import { VariantResponse } from "model/product/product.model";
import {
  CustomerGroupModel,
  CustomerGroupResponseModel,
} from "model/response/customer/customer-group.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { StyledComponent } from "./styles";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";

const SettingCustomerGroup: React.FC = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const dispatch = useDispatch();
  const [listCustomerGroup, setListCustomerGroup] = useState<
    CustomerGroupModel[]
  >([]);
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const [total, setTotal] = useState(0);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [modalSingleServiceSubStatus, setModalSingleServiceSubStatus] =
    useState<any>(null);



  const columns: Array<ICustomTableColumType<VariantResponse>> = [
    {
      title: "STT",
      key: "index",
      render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
      visible: true,
      width: "5%",
    },
    {
      title: "Tên Nhóm",
      dataIndex: "name",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        if (value) {
          return (
            <span
              title={value}
              style={{ wordWrap: "break-word", wordBreak: "break-word" }}
              className="title text"
              onClick={(event) => {
                setModalSingleServiceSubStatus(row);
                setModalAction("edit");
                setIsShowModal(true);
              }}
            >
              {value}
            </span>
          );
        }
      },
    },

    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: true,
      width: "20%",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      visible: true,
      width: "20%",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Mô tả",
      dataIndex: "note",
      visible: true,
      width: "25%",
      render: (value, row, index) => {
        return (
          <span className="text" title={value} style={{ color: "#666666" }}>
            {value}
          </span>
        );
      },
    },
    {
      title: "",
      visible: true,
      width: "5%",
      className: "saleorder-product-card-action ",
      render: (value, row, index) => {
        const menu = (
          <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
            <Menu.Item key="1">
              <Button
                icon={<img alt="" style={{ marginRight: 12 }} src={editIcon} />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                }}
                onClick={() => {
                  setModalSingleServiceSubStatus(row);
                  setModalAction("edit");
                  setIsShowModal(true);
                }}
              >
                Chỉnh sửa
              </Button>
            </Menu.Item>
            <Menu.Item key="2">
              <Button
                icon={<img alt="" style={{ marginRight: 12 }} src={deleteIcon} />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                  color: "red",
                }}
                onClick={() => {
                  setModalSingleServiceSubStatus(row);
                  setIsShowConfirmDelete(true);
                }}
              >
                Xóa
              </Button>
            </Menu.Item>
          </Menu>
        );
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 4px",
            }}
          >
            <div
              className="site-input-group-wrapper saleorder-input-group-wrapper"
              style={{
                borderRadius: 5,
              }}
            >
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  icon={<img src={threeDot} alt=""></img>}
                ></Button>
              </Dropdown>
            </div>
          </div>
        );
      },
    },
  ];

  const [selected, setSelected] = useState<Array<CustomerGroupResponseModel>>(
    []
  );

  const onSelectTable = useCallback(
    (selectedRow: Array<CustomerGroupResponseModel>) => {
      setSelected(selectedRow);
    },
    []
  );

  const columnFinal = () => columns.filter((item) => item.visible === true);

  const history = useHistory();

  let [params, setParams] = useState({
    page: +(query.get("page") || 1),
    limit: +(query.get("limit") || 30),
    sort_type: "desc",
    sort_column: "id",
  });
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.ORDER_PROCESSING_STATUS}?${queryParam}`);
      window.scrollTo(0, 0);
    },
    [history, params]
  );

  const addCustomerGroup = () => {
    return (
      <Button
        type="primary"
        className="ant-btn-primary"
        size="large"
        onClick={() => {
          setModalAction("create");
          setIsShowModal(true);
        }}
        icon={<PlusOutlined />}
      >
        Thêm nhóm khách hàng
      </Button>
    );
  };

  const gotoFirstPage = () => {
    const newParams = {
      ...params,
      page: 1,
    };
    setParams({ ...newParams });
    history.replace(`${UrlConfig.CUSTOMER}/groups`);
    window.scrollTo(0, 0);
  };

  const handleForm = {
    create: (formValue: CustomerGroupModel) => {
      dispatch(
        actionAddCustomerGroup(formValue, () => {
          setIsShowModal(false);
          gotoFirstPage();
        })
      );
    },
    edit: (formValue: CustomerGroupModel) => {
      if (modalSingleServiceSubStatus) {
        dispatch(
          actionEditCustomerGroup(
            modalSingleServiceSubStatus.id,
            formValue,
            () => {
              dispatch(
                actionFetchListCustomerGroup(
                  params,
                  (data: CustomerGroupResponseModel) => {
                    setListCustomerGroup(data.items);
                  }
                )
              );
              setIsShowModal(false);
            }
          )
        );
      }
    },
    delete: () => {
      if (modalSingleServiceSubStatus) {
        dispatch(
          actionDeleteCustomerGroup(modalSingleServiceSubStatus.id, () => {
            setIsShowConfirmDelete(false);
            gotoFirstPage();
          })
        );
      }
    },
  };

  useEffect(() => {
    /**
     * when dispatch action, call function (handleData) to handle data
     */
    setTableLoading(true);
    console.log(1);
    dispatch(
      actionFetchListCustomerGroup(
        params,
        (data: CustomerGroupResponseModel) => {
          setListCustomerGroup(data.items);
          setTotal(data.metadata.total);
          setTableLoading(false);
        }
      )
    );
  }, [dispatch, params]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Nhóm khách hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Nhóm khách hàng",
            path: UrlConfig.CUSTOMER + "/customers-group",
          },
        ]}
        extra={addCustomerGroup()}
      >
        {listCustomerGroup && (
          <Card style={{ padding: "35px 15px" }} className="customer-group-table">
            <CustomTable
              isRowSelection
              onSelectedChange={onSelectTable}
              isLoading={tableLoading}
              showColumnSetting={false}
              scroll={{ x: 1080 }}
              pagination={{
                pageSize: params.limit,
                total: total,
                current: params.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              dataSource={listCustomerGroup}
              columns={columnFinal()}
              rowKey={(item: VariantResponse) => item.id}
              // onRow={(record: CustomerGroupModel) => {
              //   return {
              //     onClick: (event) => {
              //       setModalSingleServiceSubStatus(record);
              //       setModalAction("edit");
              //       setIsShowModal(true);
              //     }, // click row
              //   };
              // }}
            />
          </Card>
        )}
        {/* <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          onOk={() => handleForm.delete()}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Xác nhận"
          subTitle={renderConfirmDeleteSubtitle(
            modalSingleServiceSubStatus ? modalSingleServiceSubStatus.name : ""
          )}
        /> */}
        <SaveAndConfirmOrder
          onCancel={() => setIsShowConfirmDelete(false)}
          onOk={() => handleForm.delete()}
          visible={isShowConfirmDelete}
          okText="Đồng ý"
          cancelText="Hủy"
          title=""
          text={`Bạn có chắc chắn xóa nhóm "${
            modalSingleServiceSubStatus ? modalSingleServiceSubStatus.name : ""
          }" này không?`}
          icon={DeleteIcon}
        />
        <CustomerModal
          visible={isShowModal}
          onCreate={(formValue: CustomerGroupModel) =>
            handleForm.create(formValue)
          }
          onEdit={(formValue: CustomerGroupModel) => handleForm.edit(formValue)}
          onDelete={() => handleForm.delete()}
          onCancel={() => setIsShowModal(false)}
          modalAction={modalAction}
          modalTypeText="Nhóm khách hàng"
          componentForm={FormCustomerGroup}
          formItem={modalSingleServiceSubStatus}
          deletedItemTitle={modalSingleServiceSubStatus?.name}
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default SettingCustomerGroup;
