import {
  Card,
  Button,
  Form,
  Input,
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
import CustomModal from "./components/CustomModal";
import Dragger from "antd/lib/upload/Dragger";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
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
import { 
  addPromoCode,
  deleteBulkPromoCode,
  getListPromoCode,
  deletePromoCodeById,
  updatePromoCodeById 
} from "domain/actions/promotion/promo-code/promo-code.action";
import { PromoCodeResponse } from "model/response/promotion/promo-code/list-promo-code.response";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { showSuccess } from "utils/ToastUtils";
import { STATUS_CODE } from "../constant";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import { promoGetDetail } from "domain/actions/promotion/discount/discount.action";

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
    state: "",
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
  const [data, setData] = useState<PageResponse<PromoCodeResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [promoValue, setPromoValue] = useState<any>();

  let dataQuery: DiscountSearchQuery = {
    ...initQuery,
    ...getQueryParams(query)
  }
  const [params, setParams] = useState<DiscountSearchQuery>(dataQuery);

  // section handle call api GET DETAIL
  const onResult = useCallback((result: DiscountResponse | false) => {
    setPromoValue(result);
  }, []);
  useEffect(() => {
    dispatch(promoGetDetail(id, onResult));
    return () => {};
  }, [dispatch, id, onResult]);

  // handle response get list
  const fetchData = useCallback((data: any) => {
    setData(data);
    setTableLoading(false);
  }, []);

  // Call API get list
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
   // section EDIT by Id
   function handleEdit(value: any) {
    if(!value) return;
    let body = {
      id: editData.id,
      code: value
    }
    dispatch(showLoading());
    dispatch(updatePromoCodeById(priceRuleId, body, onUpdateSuccess));
  }
  const onUpdateSuccess = useCallback((response) => {
    dispatch(hideLoading());
    if (response) {
      showSuccess("Cập nhật thành công");
      dispatch(getListPromoCode(priceRuleId, fetchData));
    }
  }, [dispatch, priceRuleId, fetchData]);

  // section DELETE by Id
  function handleDelete(item: any) {
    setDeleteData(item);
    setIsShowDeleteModal(true);
  }

  // section ADD Manual
  function handleAddManual(value: any) {
    if(!value) return;
    let body = {
      discount_codes: [],
      generate_discount_codes: null
    };
    (value.listCode as Array<string>).forEach(element => {
      if (!element) return;
      (body.discount_codes as Array<any>).push({code: element});
    });
    dispatch(showLoading());
    dispatch(addPromoCode(priceRuleId, body, onAddSuccess));
  }
  function handleAddRandom(value: any) {
    if(!value) return;
    let body = {
      discount_codes: null,
      generate_discount_codes: {
        prefix: value.prefix,
        suffix: value.suffix,
        length: value.length,
        count: value.count
      }
    };
    dispatch(showLoading());
    dispatch(addPromoCode(priceRuleId, body, onAddSuccess));
  }
  const onAddSuccess = useCallback((response) => {
    dispatch(hideLoading());
    if(response) {
      showSuccess("Thêm thành công");
      dispatch(getListPromoCode(priceRuleId, fetchData));
    }
  }, [dispatch, priceRuleId, fetchData]);

   // section DELETE bulk
  const deleteCallBack = useCallback((response) => {
    dispatch(hideLoading());
    if (response) {
      showSuccess("Xóa thành công");
      dispatch(getListPromoCode(priceRuleId, fetchData));
    }
  }, [dispatch, priceRuleId, fetchData]);

  // section CHANGE STATUS
  const handleStatus = (item: any) => {
    // TODO
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
        const status: any | null = STATUS_CODE.find(e => e.code === value);
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
      const body = {
        ids: selectedRowKey
      }
      switch (index) {
        case 1:
          break;
        case 2:
          dispatch(showLoading());
          dispatch(deleteBulkPromoCode(priceRuleId, body, deleteCallBack));
          break;
      }
    }, [dispatch, deleteCallBack, priceRuleId, selectedRowKey]
  );

  return (
    <ContentContainer
      title={`Mã giảm giá của đợt phát hành ${promoValue?.code}`}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
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
                  style={{ width: "100%", borderRadius: "6px" }}
                  showArrow
                  showSearch
                  placeholder="Chọn trạng thái"
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {listStatus.map((item, index) => (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={(index + 1).toString()}
                      value={item.value}
                    >
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
            <div className="card-discount-code" onClick={() => {
              setShowModalAdd(false);
              setShowAddCodeManual(true);
            }}>
              <img style={{ background: "linear-gradient(65.71deg, #0088FF 28.29%, #33A0FF 97.55%)" }} src={VoucherIcon} alt="" />
              <p style={{fontWeight: 500}}>Thêm mã thủ công</p>
            </div>
            <div className="card-discount-code" onClick={() => {
              setShowModalAdd(false);
              setShowAddCodeRandom(true);
            }}>
              <img style={{ background: "linear-gradient(62.06deg, #0FD186 25.88%, #3FDA9E 100%)" }} src={AddListCouponIcon} alt="" />
              <p style={{fontWeight: 500}}>Thêm mã ngẫu nhiên</p>
            </div>
            <div className="card-discount-code" onClick={() => {
              setShowModalAdd(false);
              setShowImportFile(true);
            }}>
              <img style={{ background: "linear-gradient(66.01deg, #FFAE06 37.34%, #FFBE38 101.09%)" }} src={AddImportCouponIcon} alt="" />
              <p style={{fontWeight: 500}}>Nhập file Excel</p>
            </div>
          </Col>
        </Row>
      </Modal>
      <CustomModal
        type={"MANUAL"}
        visible={showAddCodeManual}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã thủ công"
        onCancel={() => {
          setShowAddCodeManual(false);
        }}
        onOk={(value) => {
          setShowAddCodeManual(false);
          handleAddManual(value);
        }}
      />
      <CustomModal
        type={"RANDOM"}
        visible={showAddCodeRandom}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã ngẫu nhiên"
        onCancel={() => {
          setShowAddCodeRandom(false);
        }}
        onOk={(data) => {
          handleAddRandom(data);
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
      <CustomModal
        type={"EDIT"}
        visible={showEditPopup}
        okText="Thêm"
        valueChange={editData?.code}
        cancelText="Thoát"
        title={`Sửa mã giảm giá ${editData?.code}`}
        onCancel={() => {
          setShowEditPopup(false);
        }}
        onOk={(data) => {
          handleEdit(data?.code);
          setShowEditPopup(false);
        }}
      />
      <ModalDeleteConfirm
        onCancel={() => setIsShowDeleteModal(false)}
        onOk={() => {
          setIsShowDeleteModal(false);
          dispatch(showLoading());
          dispatch(deletePromoCodeById(priceRuleId, deleteData.id, deleteCallBack));
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
