import { Button, Card, Dropdown, Menu, Tabs } from "antd";
import color from "assets/css/export-variable.module.scss";
import { ReactComponent as DeleteIcon } from "assets/icon/deleteIcon.svg";
import { ReactComponent as EditIcon } from "assets/icon/edit.svg";
import MoreAction from "assets/icon/more-action.svg";
import { ReactComponent as CycleIcon } from "assets/icon/return.svg";
import ContentContainer from "component/container/content.container";
import WarrantyFilter from "component/filter/warranty.filter";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import CustomTable from "component/table/CustomTable";
import TagStatus from "component/tag/tag-status";
import UrlConfig from "config/url.config";
import useFetchStores from "hook/useFetchStores";
import useFetchWarranties from "hook/useFetchWarranties";
import {
  GetWarrantiesParamModel,
  WarrantyItemModel, WarrantyStatus
} from "model/warranty/warranty.model";
import moment from "moment";
import React, { useCallback, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { Link, useHistory, withRouter } from "react-router-dom";
import { formatCurrency, generateQuery, goToTopPage } from "utils/AppUtils";
import { WARRANTY_STATUS } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import FeeModal from "./components/fee-modal";
import NoteModal from "./components/note-modal";
import WarrantyStatusModal from "./components/status-modal";
import { StyledComponent } from "./WarrantyList.style";
const { TabPane } = Tabs;
const TAB_STATUS = [
  {
    key: WarrantyStatus.NEW,
    name: "Mới",
  },
  {
    key: WarrantyStatus.FINALIZED,
    name: "Xác nhận",
  },
  {
    key: WarrantyStatus.FINISH,
    name: "Hoàn thành",
  },
];

type PropTypes = {
  location: any;
};

function WarrantyHistoryList(props: PropTypes) {
  const { location } = props;

  const formatDate = DATE_FORMAT.fullDate;
  const history = useHistory();
  const rowSelected = useRef<{ record: any; index: number }>();
  const [isFeeModalVisible, setIsFeeModalVisible] = React.useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = React.useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = React.useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = React.useState(false);
  const [confirmDeleteSubTitle, setConfirmDeleteSubTitle] = useState<React.ReactNode>("");
  const [countForceFetchData, setCountForceFetchData] = useState(0)
  const rowClicked = (record: any, index: number) => {
    rowSelected.current = { record, index };
  };

  const initQuery: GetWarrantiesParamModel = {
    page: 1,
    limit: 30,
    store_ids: [],
    ids: [],
    from_created_date: null,
    from_appointment_date: null,
    type: null,
    warranty_status: WarrantyStatus.NEW,
  };
  const [query, setQuery] = useState<GetWarrantiesParamModel>(initQuery);
  const stores = useFetchStores();

  const getWarranties = useFetchWarranties(initQuery, location, countForceFetchData, setQuery);
  const {warranties, metadata} = getWarranties;
  console.log("warranties", warranties);
  console.log("query", query);

  const handleOkFeeModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsFeeModalVisible(false);
    console.log(rowSelected.current);
  };

  const handleOkNoteModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsNoteModalVisible(false);
    console.log(rowSelected.current);
  };

  const handleOkStatusModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsStatusModalVisible(false);
    console.log(rowSelected.current);
  };

  const handleOkDeleteModal = () => {
    setIsDeleteConfirmVisible(false);
    console.log(rowSelected.current);
  };

  const renderReason = (record: WarrantyItemModel) => {
    let html = null;
    if (record.expenses && record.expenses.length > 0) {
      const arr = record.expenses.map((single) => single.reason);
      html = arr.join(", ");
    }
    return html;
  };

  const onPageChange = useCallback(
    (page, size) => {
      query.page = page;
      query.limit = size;
      let queryParam = generateQuery(query);
      setQuery(query);
      history.push(`${location.pathname}?${queryParam}`);
      goToTopPage()
    },
    [history, location.pathname, query]
  );

  const forceFetchData = useCallback(() => {
    setCountForceFetchData(countForceFetchData+1)
  }, [countForceFetchData]);

  const onFilter = useCallback(
    (values) => {
      let newParams = { ...query, ...values, page: 1 };
      setQuery(newParams);
      let currentParam = generateQuery(query);
      let queryParam = generateQuery(newParams);
      if (currentParam === queryParam) {
        forceFetchData();
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
      // setSelectedRow([]);
      // setSelectedRowKeys([]);
      // setSelectedRowCodes([]);
    },
    [forceFetchData, history, location.pathname, query]
  );

  return (
    <ContentContainer
      title="Lịch sử bảo hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Lịch sử bảo hành",
          path: UrlConfig.WARRANTY,
        },
      ]}
      extra={
        <Button type="primary" onClick={() => history.push(UrlConfig.WARRANTY + "/create")}>
          Thêm mới phiếu tiếp nhận yêu cầu bảo hành
        </Button>
      }>
      <StyledComponent>
        <Card className="card-tab">
          <Tabs  onTabClick={(key: any) => {
            let newPrams = {
              ...query,
              warranty_status: key,
            }
            let queryParam = generateQuery(newPrams);
            history.push(`${location.pathname}?${
              queryParam
            }`);
          }
          }>
            {TAB_STATUS.map(({ key, name }) => {
              return (
                <TabPane tab={name} key={key}>
                  <WarrantyFilter actions={[]} params={query} stores={stores} isLoading={false} onFilter={onFilter} onMenuClick={() =>{}} onShowColumnSetting={() =>{}} />
                  <CustomTable
                    isRowSelection
                    rowSelectionWidth={"3.5%"}
                    dataSource={warranties}
                    bordered
                    columns={[
                      {
                        title: "ID",
                        dataIndex: "id",
                        align: "center",
                        width: "6%",
                        render: (id, record: WarrantyItemModel) => {
                          return (
                            record?.warranty?.id ? (
                              <div className="columnId">
                                <Link to={`${UrlConfig.WARRANTY}/${record.warranty.id}`}>{id}</Link>
                                <br />
                                <div>
                                  {record?.created_date
                                    ? moment(record?.created_date).format(formatDate)
                                    : "-"}
                                </div>
                              </div>
                            ) : null
                          );
                        },
                      },
                      {
                        title: "Khách hàng",
                        align: "left",
                        dataIndex: "customer",
                        key: "customer",
                        width: "13%",
                        render: (value, record: WarrantyItemModel) => {
                          return (
                            <div>
                              <b>{record?.warranty?.customer}</b>
                              <br />
                              <span>{record?.warranty?.customer_mobile}</span>
                            </div>
                          );
                        },
                      },
                      {
                        title: "Sản phẩm",
                        dataIndex: "product",
                        key: "lineItem",
                        width: "13%",
                        render: (value, record: WarrantyItemModel) => {
                          // let result = record.line_items.map((lineItem, index) => {
                          //   return (
                          //     <div key={index}>
                          //       {lineItem.product}
                          //     </div>
                          //   )
                          // })
                          return <div>{record.variant}</div>;
                        },
                      },
                      {
                        title: "Loại",
                        dataIndex: "type",
                        key: "type",
                        width: "9%",
                        render: (value, record: WarrantyItemModel) => {
                          let result = WARRANTY_STATUS.find(single => single.code === record.type);
                          return <div>{result ? result.name : "-"}</div>;
                        }
                      },
                      {
                        title: "Phí",
                        dataIndex: "fee",
                        key: "fee",
                        width: "7%",
                        render: (id, record: WarrantyItemModel, index) => {
                          if (record.price) {
                            return (
                              <div
                                className="fee"
                                onClick={() => {
                                  rowClicked(record, index);
                                  setIsFeeModalVisible(true);
                                }}>
                                {formatCurrency(record.price)}
                              </div>
                            );
                          }
                          return (
                            <Button
                              icon={<AiOutlinePlus color={color.primary} />}
                              className="fee-icon"
                              onClick={() => {
                                rowClicked(record, index);
                                setIsFeeModalVisible(true);
                              }}
                            />
                          );
                        },
                      },
                      {
                        title: "Lý do",
                        dataIndex: "reason",
                        key: "reason",
                        width: "8.5%",
                        render: (value, record: WarrantyItemModel, index) => {
                          return renderReason(record);
                        },
                      },
                      {
                        title: "Hẹn trả",
                        dataIndex: "appointment_date",
                        key: "appointment_date",
                        width: "7%",
                        render: (value, record: WarrantyItemModel, index) => {
                          return record?.appointment_date
                            ? moment(record?.appointment_date).format(DATE_FORMAT.DDMMYYY)
                            : "-";
                        },
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                        width: "9%",
                        render: (id, record: WarrantyItemModel, index) => {
                          return (
                            <div
                              className="warranty-status"
                              onClick={() => setIsStatusModalVisible(true)}>
                              <TagStatus type="danger">Không thể sửa</TagStatus>

                              <TagStatus type="success" className="tag-line-height">
                                Đã trả khách
                              </TagStatus>
                            </div>
                          );
                        },
                      },
                      {
                        title: "Người sửa",
                        dataIndex: "created_name",
                        key: "created_name",
                        width: "12%",
                      },
                      {
                        title: "Ghi chú",
                        width: "7%",
                        align: "center",
                        render: (id, record: WarrantyItemModel, index) => {
                          return (
                            <Button
                              icon={<AiOutlinePlus color={color.primary} />}
                              className="fee-icon"
                              onClick={() => {
                                rowClicked(record, index);
                                setIsNoteModalVisible(true);
                              }}
                            />
                          );
                        },
                      },
                      {
                        title: "",
                        width: "3.5%",
                        align: "center",
                        render: (text, record: WarrantyItemModel) => {
                          return (
                            <Dropdown
                            trigger={["click"]}
                              overlay={
                                <Menu>
                                  <Menu.Item
                                    icon={<CycleIcon width={20} height={30} />}
                                    key={"chuyen-nguoi=tiep-nhan"}>
                                    Chuyển người tiếp nhận
                                  </Menu.Item>
                                  <Menu.Item
                                    icon={<CycleIcon width={20} height={30} />}
                                    key={"chuyen-trung-tam-bao-hanh"}>
                                    Chuyển trung tâm bảo hành
                                  </Menu.Item>
                                  <Menu.Item
                                    icon={<EditIcon width={20} height={30} />}
                                    key={"update"}>
                                    Sửa
                                  </Menu.Item>
                                  <Menu.Item icon={<DeleteIcon height={30} />} key={"delete"} onClick={() => {
                                    setConfirmDeleteSubTitle(
                                      <React.Fragment>
                                        Bạn có chắc chắn muốn xóa bảo hành
                                        {" "}
                                        <strong>{`"${record.id}"`}</strong> ?
                                      </React.Fragment>
                                    );
                                    setIsDeleteConfirmVisible(true)
                                  }}>
                                    Xoá
                                  </Menu.Item>
                                </Menu>
                              }
                              >
                                <Button
                                  type="text"
                                  icon={<img src={MoreAction} alt=""></img>}
                                ></Button>
                              </Dropdown>
                          );
                        },
                      },
                    ]}
                    pagination={{
                      pageSize: metadata?.limit,
                      total: metadata?.total,
                      current: metadata?.page,
                      showSizeChanger: true,
                      onChange: onPageChange,
                      onShowSizeChange: onPageChange,
                    }}
                  />
                </TabPane>
              );
            })}
          </Tabs>
        </Card>
      </StyledComponent>
      <FeeModal
        visible={isFeeModalVisible}
        onCancel={() => setIsFeeModalVisible(false)}
        onOk={handleOkFeeModal}
      />
      <NoteModal
        visible={isNoteModalVisible}
        onCancel={() => setIsNoteModalVisible(false)}
        onOk={handleOkNoteModal}
      />
      <WarrantyStatusModal
        visible={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        onOk={handleOkStatusModal}
      />
      <ModalDeleteConfirm
        visible={isDeleteConfirmVisible}
        onOk={handleOkDeleteModal}
        onCancel={() => setIsDeleteConfirmVisible(false)}
        title="Xác nhận xóa"
        subTitle={confirmDeleteSubTitle}
      />
    </ContentContainer>
  );
}

export default withRouter(WarrantyHistoryList);
