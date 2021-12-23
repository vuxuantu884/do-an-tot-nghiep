import { CloseOutlined, FilterOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Col, Collapse, Form, Input, Row, Space, Tag } from "antd";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import HashTag from "component/custom/hashtag";
import CustomSelect from "component/custom/select.custom";
import CustomRangepicker from "component/filter/component/range-picker.custom";
import CustomModal from "component/modal/CustomModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { createConfigPoAction, deleteConfigPoAction, getConfigPoAction, updateConfigPoAction } from "domain/actions/po/po.action";
import { AccountResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { modalActionType } from "model/modal/modal.model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormSaveFilter from "screens/products/inventory/filter/components/FormSaveFilter";
import { FILTER_CONFIG_TYPE, PoPaymentStatus, POStatus, ProcumentStatus } from "utils/Constants";
import { checkFixedDate, DATE_FORMAT } from "utils/DateUtils";
import { primaryColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
import BaseFilter from "./base.filter";
import CustomSelectMany from "./component/select-many.custom";
import CustomSelectOne from "./component/select-one.custom"; 


const { Panel } = Collapse;
const { Item } = Form;

type PurchaseOrderFilterProps = {
  params: PurchaseOrderQuery;
  listSupplierAccount?: Array<AccountResponse>;
  listRdAccount?: Array<AccountResponse>;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: PurchaseOrderQuery) => void;
  onClearFilter?: () => void;
  openSetting: () => void;
};

const listPOStatus = {
  [POStatus.DRAFT]: "Đặt hàng",
  [POStatus.FINALIZED]: "Đã xác nhận",
  [POStatus.COMPLETED]: "Đã hoàn thành",
  [POStatus.FINISHED]: "Đã kết thúc",
  [POStatus.CANCELLED]: "Đã hủy",
};
const listProcumentStatus = {
  [ProcumentStatus.NOT_RECEIVED]: "Chưa nhận hàng",
  [ProcumentStatus.PARTIAL_RECEIVED]: "Nhận hàng 1 phần",
  [ProcumentStatus.RECEIVED]: "Đã nhận hàng",
};
const listPaymentStatus = {
  [PoPaymentStatus.UNPAID]: "Chưa thanh toán",
  [PoPaymentStatus.PARTIAL_PAID]: "Thanh toán 1 phần",
  [PoPaymentStatus.PAID]: "Đã thanh toán",
};

const filterFields = {
  order_date: "order_date",
  activated_date: "activated_date",
  completed_date: "completed_date",
  cancelled_date: "cancelled_date",
  status: "status",
  receive_status: "receive_status",
  financial_status: "financial_status",
  merchandiser: "merchandiser",
  qc: "qc",
  // cost_included: "cost_included",
  tax_included: "tax_included",
  expected_import_date: "expected_import_date",
  expected_store: "expected_store",
  note: "note",
  supplier_note: "supplier_note",
  tags: "tags",
  reference: "reference",
  is_have_returned: "is_have_returned"
};

const allStatus: any = {
  [filterFields.status]: listPOStatus,
  [filterFields.receive_status]: listProcumentStatus,
  [filterFields.financial_status]: listPaymentStatus,
};

const filterFieldsMapping: any = {
  [filterFields.order_date]: "Ngày tạo đơn",
  [filterFields.activated_date]: "Ngày duyệt đơn",
  [filterFields.completed_date]: "Ngày hoàn tất đơn",
  [filterFields.cancelled_date]: "Ngày hủy đơn",
  [filterFields.status]: "Trạng thái đơn",
  [filterFields.receive_status]: "Nhập kho",
  [filterFields.financial_status]: "Thanh toán",
  [filterFields.merchandiser]: "Merchandiser",
  [filterFields.qc]: "QC",
  // [filterFields.cost_included]: "Chi phí",
  [filterFields.tax_included]: "VAT",
  [filterFields.expected_import_date]: "Ngày nhận hàng dự kiến",
  [filterFields.expected_store]: "Kho nhận hàng dự kiến",
  [filterFields.note]: "Ghi chú nội bộ",
  [filterFields.supplier_note]: "Ghi chú nhà cung cấp",
  [filterFields.tags]: "Tag",
  [filterFields.reference]: "Mã tham chiếu",
  [filterFields.is_have_returned]: "Trả hàng"
};

type FilterHeaderProps = {
  title?: string;
};
const FilterHeader = ({ title }: FilterHeaderProps) => {
  return <span>{title?.toUpperCase()}</span>;
};

const FilterList = ({ filters, resetField }: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return null;
        if (!filterFieldsMapping[filterKey]) return null;
        switch (filterKey) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.cancelled_date:
          case filterFields.expected_import_date:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${filterFieldsMapping[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${filterFieldsMapping[filterKey]} : ${formatedFrom} - ${formatedTo}`;
            break;
          case filterFields.status:
          case filterFields.receive_status:
          case filterFields.financial_status:
            let listStatus = allStatus[filterKey];
            if (!(value instanceof Array)) value = [value];
            let listStatusValue = value?.map((key: string) => {
              return listStatus[key];
            });
            renderTxt = `${filterFieldsMapping[filterKey]} : ${listStatusValue}`;
            break;
          case filterFields.is_have_returned:
            let costTxt = "Có trả hàng";
            if (value === "false") costTxt = "Không trả hàng";
            renderTxt = `${filterFieldsMapping[filterKey]} : ${costTxt}`;
            break;
          case filterFields.tax_included:
            let taxTxt = "Có VAT";
            if (value === "false") taxTxt = "Không VAT";
            renderTxt = `${filterFieldsMapping[filterKey]} : ${taxTxt}`;
            break;
          default:
            renderTxt = `${filterFieldsMapping[filterKey]} : ${value}`;
        }
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </Space>
  );
};

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

type AdvanceFormItemProps = {
  listSupplierAccount: PurchaseOrderFilterProps["listSupplierAccount"];
  listRdAccount: PurchaseOrderFilterProps["listRdAccount"];
  listStore: PurchaseOrderFilterProps["listStore"];
  tempAdvanceFilters: any;
};

const AdvanceFormItems = ({
  listSupplierAccount,
  listRdAccount,
  listStore,
  tempAdvanceFilters,
}: AdvanceFormItemProps) => {
  return (
    <Space className="po-filter" direction="vertical" style={{ width: "100%" }}>
      {Object.keys(filterFields).map((field) => {
        let collapseChildren = null;
        switch (field) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.cancelled_date:
          case filterFields.expected_import_date:
            collapseChildren = <CustomRangepicker />;
            break;
          case filterFields.status:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Chọn 1 hoặc nhiều trạng thái"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                style={{
                  width: "100%",
                }}
                maxTagCount="responsive"
              >
                {Object.keys(listPOStatus)?.map((key) => (
                  <CustomSelect.Option key={key} value={key}>
                    {listPOStatus[key]}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          case filterFields.receive_status:
            collapseChildren = (
              <CustomSelectMany span={8} data={listProcumentStatus} />
            );
            break;
          case filterFields.financial_status:
            collapseChildren = (
              <CustomSelectMany data={listPaymentStatus} span={8} />
            );
            break;
          case filterFields.merchandiser:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Chọn 1 hoặc nhiều merchandiser"
                mode="multiple"
                allowClear
                optionFilterProp="children"
                tagRender={tagRender}
                style={{
                  width: "100%",
                }}
                notFoundContent="Không tìm thấy kết quả"
                maxTagCount="responsive"
              >
                {listSupplierAccount?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.full_name}>
                    {`${item.code} - ${item.full_name}`}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          case filterFields.qc:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Chọn 1 hoặc nhiều qc"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                style={{
                  width: "100%",
                }}
                optionFilterProp="children"
                notFoundContent="Không tìm thấy kết quả"
                maxTagCount="responsive"
              >
                {listRdAccount?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.full_name}>
                    {`${item.code} - ${item.full_name}`}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          case filterFields.is_have_returned:
            collapseChildren = (
              <CustomSelectOne span={12} data={{"true": "Có trả hàng", "false": "Không có trả hàng"}} />
            )
            break;
          case filterFields.tax_included:
            collapseChildren = (
              <CustomSelectOne span={12} data={{"true": "Có VAT", "false": "Không VAT"}} />
            );
            break;
          case filterFields.expected_store:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Kho nhận hàng dự kiến"
                style={{
                  width: "100%",
                }}
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                mode="multiple"
                allowClear
                maxTagCount="responsive"
              >
                {listStore?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.name}>
                    {item.name}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          case filterFields.note:
            collapseChildren = (
              <Input placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
            );
            break;
          case filterFields.supplier_note:
            collapseChildren = (
              <Input placeholder="Tìm kiếm theo nội dung ghi chú nhà cung cấp" />
            );
            break;
          case filterFields.tags:
            collapseChildren = <HashTag placeholder="Tìm kiếm theo tag" />;
            break;
          case filterFields.reference:
            collapseChildren = (
              <Input placeholder="Tìm kiếm theo mã tham chiếu" />
            );
            break;
          default:
            collapseChildren = null;
        }
        return (
          <Collapse key={field}>
            <Panel
              className={tempAdvanceFilters[field] ? "active" : ""}
              header={<FilterHeader title={filterFieldsMapping[field]} />}
              key="1"
            >
              <Item name={field}>{collapseChildren}</Item>
            </Panel>
          </Collapse>
        );
      })}
    </Space>
  );
};

const PurchaseOrderFilter: React.FC<PurchaseOrderFilterProps> = (
  props: PurchaseOrderFilterProps
) => {
  const {
    params,
    listSupplierAccount,
    listRdAccount,
    listStore, 
    onFilter,
    onMenuClick,
    actions,
  } = props;
  const [visible, setVisible] = useState(false);
  
  const [lstConfigFilter, setLstConfigFilter] = useState<Array<FilterConfig>>([]);
  const [tagAcitve, setTagActive] = useState<number|null>();
  const [configId, setConfigId] = useState<number>();
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const dispatch = useDispatch();
  const [showModalSaveFilter, setShowModalSaveFilter] = useState(false);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const {account} = userReducer;
  const [modalAction, setModalAction] = useState<modalActionType>("create");

  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();

  let [advanceFilters, setAdvanceFilters] = useState({});
  const [tempAdvanceFilters, setTempAdvanceFilters] = useState({});

  const resetField = useCallback(
    (field: string) => {
      formBaseFilter.setFieldsValue({
        ...formBaseFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formAdvanceFilter.setFieldsValue({
        ...formAdvanceFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formBaseFilter.submit();
    },
    [formBaseFilter, formAdvanceFilter]
  );

  const onBaseFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      let data = formBaseFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formBaseFilter, onFilter]
  );
  const onAdvanceFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      let data = formAdvanceFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formAdvanceFilter, onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    formAdvanceFilter.resetFields();
    setTempAdvanceFilters({ ...advanceFilters });
    setVisible(false);
  }, [formAdvanceFilter, advanceFilters]);
  const onResetFilter = useCallback(() => {
    let fields = formAdvanceFilter.getFieldsValue(true);
    console.log(fields);
    for (let key in fields) {
      if(fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formAdvanceFilter.setFieldsValue(fields);
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);

  const onSelectFilterConfig = useCallback((index: number, id: number)=>{
    setTagActive(index);
    const filterConfig = lstConfigFilter.find(e=>e.id === id);
    if (filterConfig) {
      let json_content = JSON.parse(filterConfig.json_content);

      Object.keys(json_content).forEach(function(key, index) {
        if (json_content[key] == null) json_content[key] = undefined;
      }, json_content);
      formAdvanceFilter.setFieldsValue(json_content);
    } 
},[lstConfigFilter, formAdvanceFilter]);

  const FilterConfigCom = (props: any)=>{
    return (
      <span style={{marginRight: 20, display: "inline-flex"}}>
          <Tag onClick={(e)=>{
              onSelectFilterConfig(props.index, props.id);  
              }} style={{cursor: "pointer", backgroundColor: tagAcitve === props.index ? primaryColor: '',
                    color: tagAcitve === props.index ? "white": ''}} key={props.index} icon={<StarOutlined />} 
                    closeIcon={<CloseOutlined className={tagAcitve === props.index ? "ant-tag-close-icon" : "ant-tag-close-icon-black"} />} closable={true} onClose={(e)=>{
                      e.preventDefault();
                      setConfigId(props.id); 
                      setIsShowConfirmDelete(true);
                    }}>
              {props.name}  
            </Tag> 
      </span>
    )
  }

  const getConfigPo = useCallback(()=>{
    if (account && account.code) {
      dispatch(
        getConfigPoAction( 
           account.code,
          (res)=>{
           if (res) {
            setLstConfigFilter(res.data);
           }
          }
        )
      );
    }
  },[account, dispatch])

  const onResultDeleteConfig = useCallback((res: BaseResponse<FilterConfig>)=>{
    if (res) {
      showSuccess(`Xóa bộ lọc thành công`);
      setIsShowConfirmDelete(false);
      getConfigPo();
    }
  },[getConfigPo])

  const onMenuDeleteConfigFilter =useCallback(()=>{
    if (configId) {
      dispatch(deleteConfigPoAction(configId, onResultDeleteConfig));
    }
  },[dispatch ,configId, onResultDeleteConfig]);

  const onShowSaveFilter = useCallback(() => {
    setModalAction("create");
    setShowModalSaveFilter(true);
  }, []);  

  const onResult = useCallback((res: BaseResponse<FilterConfig>) =>{
    if (res) {
      showSuccess(`Lưu bộ lọc thành công`);
      setShowModalSaveFilter(false);
      getConfigPo();
    }
  },[getConfigPo]);

  const onSaveFilter = useCallback((request: FilterConfigRequest) => {
    if (request) { 
      let json_content = JSON.stringify(
        formAdvanceFilter.getFieldsValue(),
        function(k, v) { return v === undefined ? null : v; }
      );;
      request.type = FILTER_CONFIG_TYPE.FILTER_PO;
      request.json_content = json_content; 
      
      if (request.id && request.id !== null) {
        const config = lstConfigFilter.find(e=>e.id.toString() === request.id.toString());
        if (lstConfigFilter && config) {
          request.name = config.name;
        }
        dispatch(updateConfigPoAction(request,onResult));
      }else{
        dispatch(createConfigPoAction(request ,onResult));
      }
    }
    
  }, [dispatch,formAdvanceFilter, onResult, lstConfigFilter]);

  useEffect(() => {
    formBaseFilter.setFieldsValue({ ...advanceFilters });
    formAdvanceFilter.setFieldsValue({ ...advanceFilters });
    setTempAdvanceFilters(advanceFilters);
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);
  useEffect(() => {
    setAdvanceFilters({ ...params });
  }, [params]); 

  useEffect(()=>{
    getConfigPo();
  },[getConfigPo])

  return (
    <div className="purchase-order-form">
      <Form.Provider
        onFormFinish={(name, {values, forms}) => {
          const {formBaseFilter, formAdvanceFilter} = forms;
          let baseValues = formBaseFilter.getFieldsValue(true);
          let advanceValues = formAdvanceFilter?.getFieldsValue(true);
          let data = {...baseValues, ...advanceValues};
          let orderDate = data[filterFields.order_date],
            activatedDate = data[filterFields.activated_date],
            completedDate = data[filterFields.completed_date],
            cancelledDate = data[filterFields.cancelled_date],
            expectedImportDate = data[filterFields.expected_import_date];
          const [from_order_date, to_order_date] = orderDate
              ? orderDate
              : [undefined, undefined],
            [from_activated_date, to_activated_date] = activatedDate
              ? activatedDate
              : [undefined, undefined],
            [from_completed_date, to_completed_date] = completedDate
              ? completedDate
              : [undefined, undefined],
            [from_cancelled_date, to_cancelled_date] = cancelledDate
              ? cancelledDate
              : [undefined, undefined],
            [from_expect_import_date, to_expect_import_date] = expectedImportDate
              ? expectedImportDate
              : [undefined, undefined];
          for (let key in data) {
            if (data[key] instanceof Array) {
              if (data[key].length === 0) data[key] = undefined;
            }
          }
          data = {
            ...data,
            from_order_date,
            to_order_date,
            from_activated_date,
            to_activated_date,
            from_completed_date,
            to_completed_date,
            from_cancelled_date,
            to_cancelled_date,
            from_expect_import_date,
            to_expect_import_date,
          };
          formBaseFilter.setFieldsValue({...data});
          formAdvanceFilter?.setFieldsValue({
            ...data,
          });
        }}
      >
        <div className="base-filter">
          <Form
            form={formBaseFilter}
            name="formBaseFilter"
            onFinish={onBaseFinish}
            initialValues={advanceFilters}
            layout="inline"
          >
            <CustomFilter onMenuClick={onMenuClick} menu={actions}>
              <Item name="info" className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tìm kiếm theo ID đơn mua, Tên, SĐT nhà cung cấp"
                />
              </Item>
              <Item name={filterFields.merchandiser}>
                <CustomSelect
                  showArrow
                  placeholder="Merchandise"
                  mode="multiple"
                  allowClear
                  tagRender={tagRender}
                  style={{
                    width: 150,
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                  maxTagCount="responsive"
                >
                  {listSupplierAccount?.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.full_name}>
                      {`${item.code} - ${item.full_name}`}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Item>
              <Item name={filterFields.status}>
                <CustomSelect
                  showArrow
                  placeholder="Trạng thái đặt hàng"
                  mode="multiple"
                  allowClear
                  tagRender={tagRender}
                  notFoundContent="Không tìm thấy kết quả"
                  style={{width: 200}}
                  maxTagCount="responsive"
                >
                  {Object.keys(listPOStatus)?.map((key) => (
                    <CustomSelect.Option key={key} value={key}>
                      {listPOStatus[key]}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Item>
              <Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Item>
              <Item>
                <Button icon={<FilterOutlined />} onClick={openFilter}>
                  Thêm bộ lọc
                </Button>
              </Item>
              <Item>
                <ButtonSetting onClick={props.openSetting} />
              </Item>
            </CustomFilter>
          </Form>
        </div>
        <FilterList filters={advanceFilters} resetField={resetField} />
        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
          allowSave
          onSaveFilter={onShowSaveFilter}
        >
          <Form
            form={formAdvanceFilter}
            name="formAdvanceFilter"
            onFinish={onAdvanceFinish}
            initialValues={advanceFilters}
            layout="vertical"
            onFieldsChange={(changedFields: any, allFields: any) => {
              let fieldNames =
                changedFields && changedFields.length > 0 && changedFields[0].name;
              if (!fieldNames) return;
              let filtersSelected: any = {};
              fieldNames.forEach((fieldName: any) => {
                filtersSelected[fieldName] = true;
              });
              setTempAdvanceFilters({
                ...filtersSelected,
                ...tempAdvanceFilters,
              });
            }}
          >
            {
              (lstConfigFilter && lstConfigFilter.length > 0) &&
              <Row>
                  <Item>
                    <Col span={24} className="tag-filter">
                      {
                        lstConfigFilter?.map((e, index)=>{
                          return <FilterConfigCom id={e.id} index={index} name={e.name} />
                        })
                      }
                    </Col>
                  </Item>
                </Row>
            } 
            <AdvanceFormItems
              listSupplierAccount={listSupplierAccount}
              listStore={listStore}
              listRdAccount={listRdAccount}
              tempAdvanceFilters={tempAdvanceFilters}
            />
             <CustomModal
              createText="Lưu lại"
              updateText="Lưu lại"
              visible={showModalSaveFilter}
              onCreate={(formValues)=>{onSaveFilter(formValues)}}
              onEdit={()=>{}}
              onDelete={()=>{}}
              onCancel={() => setShowModalSaveFilter(false)}
              modalAction={modalAction}
              componentForm={FormSaveFilter}
              formItem={null}
              modalTypeText="bộ lọc"
              lstConfigFilter={lstConfigFilter}
            />
          </Form>
        </BaseFilter>
      </Form.Provider>
      <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          onOk={onMenuDeleteConfigFilter}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Xác nhận"
          subTitle={"Bạn có chắc muốn xóa bộ lọc này?"}
      />           
    </div>
  );
};

export default PurchaseOrderFilter;
