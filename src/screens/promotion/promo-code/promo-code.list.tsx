import {
  Card,
  Button,
  Form,
  Input,
  Tag,
  Row,
  Space,
  Modal,
  Col,
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import actionColumn from "./actions/action.column";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import CustomSelect from "component/custom/select.custom";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import exportIcon from "assets/icon/export.svg";
import VoucherIcon from "assets/img/voucher.svg";
import AddImportCouponIcon from "assets/img/add_import_coupon_code.svg";
import AddListCouponIcon from "assets/img/add_list_coupon_code.svg";
import ModalAddCode from "./components/ModalAddCode";
import Dragger from "antd/lib/upload/Dragger";
import "./promo-code.scss";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { PlusOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { DiscountSearchQuery } from "model/query/discount.query";
import { getQueryParams, useQuery } from "../../../utils/useQuery";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { RiUpload2Line } from "react-icons/ri";
import { getListPromoCode, getPromoCodeById, updatePromoCodeById } from "domain/actions/promotion/promo-code/promo-code.action";
import { PromoCodeResponse } from "model/response/promotion/promo-code/list-promo-code.response";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { showError, showSuccess } from "utils/ToastUtils";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { deleteMultiPromoCode } from "service/promotion/promo-code/promo-code.service";

const promotionStatuses = [
  {
    code: 'APPLYING',
    value: 'Đang áp dụng',
    style: {
      background: "rgba(42, 42, 134, 0.1)",
      borderRadius: "100px",
      color: "rgb(42, 42, 134)",
      padding: "5px 10px"
    }
  },
  {
    code: 'TEMP_STOP',
    value: 'Tạm ngưng',
    style: {
      background: "rgba(252, 175, 23, 0.1)",
      borderRadius: "100px",
      color: "#FCAF17",
      padding: "5px 10px"
    }
  },
  {
    code: 'WAIT_FOR_START',
    value: 'Chờ áp dụng',
    style: {
      background: "rgb(245, 245, 245)",
      borderRadius: "100px",
      color: "rgb(102, 102, 102)",
      padding: "5px 10px"
    }
  },
  {
    code: 'ENDED',
    value: 'Kết thúc',
    style: {
      background: "rgba(39, 174, 96, 0.1)",
      borderRadius: "100px",
      color: "rgb(39, 174, 96)",
      padding: "5px 10px"
    }
  },
  {
    code: 'CANCELLED',
    value: 'Đã huỷ',
    style: {
      background: "rgba(226, 67, 67, 0.1)",
      borderRadius: "100px",
      color: "rgb(226, 67, 67)",
      padding: "5px 10px"
    }
  },
]

const ListCode = () => {
  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Đã tặng",
    },
    {
      id: 2,
      name: "Xoá",
    },
  ];
  const initQuery: DiscountSearchQuery = {
    type: "MANUAL",
    request: "",
    from_created_date: "",
    to_created_date: "",
    status: "",
    applied_shop: "",
    applied_source: "",
    customer_category: "",
    discount_method: ""
  };
  const dispatch = useDispatch();
  const query = useQuery();
  const {id} = useParams() as any; 
  const priceRuleId = id;
  
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showAddCodeManual, setShowAddCodeManual] = React.useState<boolean>(false);
  const [showAddCodeRandom, setShowAddCodeRandom] = React.useState<boolean>(false);
  const [showImportFile, setShowImportFile] = React.useState<boolean>(false);
  const [showEditPopup, setShowEditPopup] = React.useState<boolean>(false);
  const [editData, setEditData] = React.useState<any>();
  const [deleteData, setDeleteData] = React.useState<any>();
  const [data, setData] = useState<any>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  let dataQuery: DiscountSearchQuery = {
    ...initQuery,
    ...getQueryParams(query)
  }
  const [params, setParams] = useState<DiscountSearchQuery>(dataQuery);

  // handle get list data
  const fetchData = useCallback((data: any) => {
    let dataSource = {
      metadata: {
        limit: 20,
        total: data.length,
        page: 1,
      },
      items: data
    }
    
    setData(dataSource);
    setTableLoading(false);
  }, [])
  useEffect(() => {
    dispatch(getListPromoCode(priceRuleId, fetchData));
  }, [dispatch, fetchData, priceRuleId]);

  const onPageChange = useCallback(
    (page, limit) => {
      setParams({ ...params, page, limit });
    },
    [params]
  );

  const onFilter = useCallback(values => {
    let newParams = { ...params, ...values, page: 1 };
    console.log("newParams", newParams);
    setParams({ ...newParams })
  }, [params])

  // section EDIT by Id
  const handleUpdate = (item: any) => {
    setEditData(item);
    setShowEditPopup(true);
  };
   // section DELETE by Id
   function handleEdit(value: any) {
     if(!value) return;
    let body = {
      ...editData,
      code: value?.code
    }
    dispatch(showLoading());
    dispatch(updatePromoCodeById(priceRuleId, body, onUpdateSuccess));
  }
  const onUpdateSuccess = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Cập nhật thành công");
    dispatch(getListPromoCode(priceRuleId, fetchData));
  }, [dispatch]);

  // section DELETE by Id
  function handleDelete(item: any) {
    setDeleteData(item);
    setIsShowDeleteModal(true);
  }
  const onDeleteSuccess = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Xóa thành công");
    dispatch(getListPromoCode(priceRuleId, fetchData));
  }, [dispatch]);

  // section CHANGE STATUS
  const handleStatus = (item: any) => {
    console.log(item);
  };

  const columns: Array<ICustomTableColumType<any>> = useMemo(() => [
    {
      title: "Mã giảm giá",
      visible: true,
      fixed: "left",
      width: "30%",
      dataIndex: "code",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      dataIndex: "usage_count",
      width: "10%",
    },
    {
      title: "Lượt áp dụng còn lại",
      visible: true,
      fixed: "left",
      dataIndex: "amountUsed",
      width: "15%",
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: 'status',
      align: 'center',
      width: '12%',
      render: (value: any, item: any, index: number) => {
        const status: any | null = promotionStatuses.find(e => e.code === value);
        return (<div
          style={status?.style}
        >
          {status?.value}
        </div>)
      }
    },
    {
      title: "Ngày tạo mã",
      visible: true,
      fixed: "left",
      align: 'center',
      width: '15%',
      render: (value: any, item: any, index: number) =>
        <div>{`${item.create_date ? moment(item.create_date).format(DATE_FORMAT.DDMMYYY)  : ""}`}</div>,
    },
    actionColumn(handleUpdate, handleDelete, handleStatus),
  ], []);
  const columnFinal = React.useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  function tagRender(props: any) {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="primary-bg"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
      >
        {label}
      </Tag>
    );
  }
  const listStatus: Array<BaseBootstrapResponse> = [
    {
      value: "APPLYING",
      name: "Đang áp dụng",
    },
    {
      value: "TEMP_STOP",
      name: "Tạm ngưng",
    },
    {
      value: "WAIT_FOR_START",
      name: "Chờ áp dụng",
    },
    {
      value: "ENDED",
      name: "Kết thúc",
    },
    {
      value: "CANCELLED",
      name: "Đã huỷ",
    }
  ]

  const onMenuClick = useCallback(
    async (index: number) => {
      switch (index) {
        case 1:
          break;
        case 2:
          const body = {
            created_by: "",
            created_name: "",
            updated_by: "",
            updated_name: "",
            request_id: "",
            operator_kc_id: "",
            id: selectedRowKey
          }
          const bulkDeleteResponse = await deleteMultiPromoCode(priceRuleId, body);
          if (bulkDeleteResponse.code === 20000000) {
            showSuccess('Thao tác thành công');
            dispatch(getListPromoCode(priceRuleId, fetchData));
          } else {
            showError(`${bulkDeleteResponse.code} - ${bulkDeleteResponse.message}`)
          }
          break;
      }
    },
    [dispatch, fetchData, priceRuleId, selectedRowKey]
  );

  return (
    <ContentContainer
      title="Mã giảm giá của đợt phát hành CPM9"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Mã chiết khấu đơn hàng",
        },
      ]}
      extra={
        <Row>
          <Space>
            <Button
              type="default"
              className="light"
              size="large"
              icon={
                <img src={exportIcon} style={{ marginRight: 8 }} alt="" />
              }
              // onClick={onExport}
              onClick={() => {}}
            >
              Xuất file
            </Button>
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setShowModalAdd(true)}
            >
              Thêm mới mã giảm giá
            </Button>
          </Space>
        </Row>
      }
    >
      <Card>
        <div className="discount-code__search">
          <CustomFilter onMenuClick={onMenuClick}  menu={actions}>
            <Form onFinish={onFilter} initialValues={params} layout="inline">
              <Form.Item name="request" className="search">
                <Input
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="Tìm kiếm theo mã, tên chương trình"
                />
              </Form.Item>
              <Form.Item>
                <CustomSelect
                  showSearch
                  optionFilterProp="children"
                  showArrow
                  placeholder="Chọn trạng thái"
                  allowClear
                  tagRender={tagRender}
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {listStatus?.map((item) => (
                    <CustomSelect.Option key={item.value} value={item.value}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Form.Item>
              {/* style={{ display: "flex", justifyContent: "flex-end" }}> */}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Form.Item>
              <Form.Item>
                <Button>Thêm bộ lọc</Button>
              </Form.Item>
            </Form>
          </CustomFilter>

          <CustomTable
            selectedRowKey={selectedRowKey}
            onChangeRowKey={(rowKey) => {
              console.log('CustomTable: ', rowKey)
              setSelectedRowKey(rowKey)
            }}
            isRowSelection
            isLoading={tableLoading}
            sticky={{offsetScroll: 5}}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={data.items}
            columns={columnFinal}
            rowKey={(item: any) => item.id}
          />
        </div>
      </Card>
      <Modal
        className="modal-show-add-discount"
        onCancel={() => setShowModalAdd(false)}
        width={600}
        visible={showModalAdd}
        title="Thêm mã giảm giá"
        footer={[]}
      >
        <Row gutter={24}>
          <Col span="24" style={{
            display: "flex",
            gap: 15,
          }}>
            <div className="card-discount-code" onClick={() => setShowAddCodeManual(true)}>
              <img style={{ background: "linear-gradient(65.71deg, #0088FF 28.29%, #33A0FF 97.55%)" }} src={VoucherIcon} alt="" />
              <p style={{fontWeight: 500}}>Thêm mã thủ công</p>
            </div>
            <div className="card-discount-code" onClick={() => setShowAddCodeRandom(true)}>
              <img style={{ background: "linear-gradient(62.06deg, #0FD186 25.88%, #3FDA9E 100%)" }} src={AddListCouponIcon} alt="" />
              <p style={{fontWeight: 500}}>Thêm mã ngẫu nhiên</p>
            </div>
            <div className="card-discount-code" onClick={() => setShowImportFile(true)}>
              <img style={{ background: "linear-gradient(66.01deg, #FFAE06 37.34%, #FFBE38 101.09%)" }} src={AddImportCouponIcon} alt="" />
              <p style={{fontWeight: 500}}>Nhập file Excel</p>
            </div>
          </Col>
        </Row>
      </Modal>
      <ModalAddCode
        isManual={true}
        visible={showAddCodeManual}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã thủ công"
        onCancel={() => {
          setShowAddCodeManual(false);
        }}
        onOk={() => {
          setShowAddCodeManual(false);
        }}
      />
      <ModalAddCode
        isManual={false}
        visible={showAddCodeRandom}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã ngẫu nhiên"
        onCancel={() => {
          setShowAddCodeRandom(false);
        }}
        onOk={(data) => {
          console.log(data);
          setShowAddCodeRandom(false);
        }}
      />
      <Modal
        onCancel={() => setShowImportFile(false)}
        width={650}
        visible={showImportFile}
        title="Nhập file khuyến mại"
        footer={[
          <Button key="back" onClick={() => setShowImportFile(false)}>
            Huỷ
          </Button>,

          <Button
            key="link"
            type="primary"
          >
            Nhập file
          </Button>,
        ]}
      >
        <Row gutter={12}>
          <Col span={3}>
            Chú ý:
          </Col>
          <Col span={19}>
            <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
            <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
            <p>- Tải file mẫu <Link to="#">tại đây</Link></p>
            <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
            <p>- Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5 phút. Trong lúc hệ thống xử lý
              không F5 hoặc tắt cửa sổ trình duyệt.</p>
          </Col>
        </Row>
        <Row gutter={24}>
          <div className="dragger-wrapper">
            <Dragger accept=".xlsx">
              <p className="ant-upload-drag-icon">
                <RiUpload2Line size={48}/>
              </p>
              <p className="ant-upload-hint">
                Kéo file vào đây hoặc tải lên từ thiết bị
              </p>
            </Dragger>
          </div>
        </Row>
      </Modal>
      <ModalAddCode
        isManual={true}
        visible={showEditPopup}
        okText="Thêm"
        dataSource={editData ? editData : null}
        cancelText="Thoát"
        title={`Sửa mã giảm giá ${editData?.code}`}
        onCancel={() => {
          setShowEditPopup(false);
        }}
        onOk={(data) => {
          handleEdit(data);
          setShowEditPopup(false);
        }}
      />
      <ModalDeleteConfirm
        onCancel={() => setIsShowDeleteModal(false)}
        onOk={() => {
          setIsShowDeleteModal(false);
          dispatch(showLoading());
          dispatch(getPromoCodeById(priceRuleId, deleteData.id, onDeleteSuccess));
        }}
        okText="Đồng ý"
        cancelText= "Huỷ"
        title="Xóa mã giảm giá"
        subTitle="Bạn có chắc chắn xóa mã giảm giá, ..."
        visible={isShowDeleteModal}
      />
    </ContentContainer>
  );
};

export default ListCode;
