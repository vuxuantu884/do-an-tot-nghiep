import { CloseOutlined, FilterOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Tag, Select } from "antd";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import CustomModal from "component/modal/CustomModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import TreeStore from "component/tree-node/tree-store";
import { AppConfig } from "config/app.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { createConfigPoAction, deleteConfigPoAction, getConfigPoAction, updateConfigPoAction } from "domain/actions/po/po.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { modalActionType } from "model/modal/modal.model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import React, { createRef, Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormSaveFilter from "screens/products/inventory/filter/components/FormSaveFilter";
import { FILTER_CONFIG_TYPE, PoPaymentStatus, POStatus, ProcumentStatus } from "utils/Constants";
import { DATE_FORMAT, formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import { primaryColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
import BaseFilter from "./base.filter";
import CustomSelectMany from "./component/select-many.custom";
import CustomSelectOne from "./component/select-one.custom";
import CustomFilterDatePicker from "../custom/filter-date-picker.custom";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import { isArray } from "lodash";
import BaseSelect from "../base/BaseSelect/BaseSelect";
import {useFetchMerchans} from "../../hook/useFetchMerchans";
import BaseSelectMerchans from "../base/BaseSelect/BaseSelectMerchans";

const { Option } = Select;
const { Item } = Form;

var isWin = false;
var isQC = false;

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
  [POStatus.DRAFT]: "Nháp",
  [POStatus.FINALIZED]: "Đã xác nhận",
  [POStatus.STORED]: "Đã nhập kho",
  [POStatus.COMPLETED]: "Đã hoàn thành",
  [POStatus.FINISHED]: "Đã kết thúc",
  [POStatus.CANCELLED]: "Đã hủy",
};
const listProcumentStatus = {
  [ProcumentStatus.NOT_RECEIVED]: "Chưa nhận",
  [ProcumentStatus.PARTIAL_RECEIVED]: "Nhận 1 phần",
  [ProcumentStatus.RECEIVED]: "Đã nhận",
};
const listPaymentStatus = {
  [PoPaymentStatus.UNPAID]: "Chưa TT",
  [PoPaymentStatus.PARTIAL_PAID]: "TT 1 phần",
  [PoPaymentStatus.PAID]: "Đã TT",
};

const filterFields = {
  receive_status: "receive_status",
  financial_status: "financial_status",
  tax_included: "tax_included",
  order_date: "order_date",
  activated_date: "activated_date",
  expected_store: "expected_store",
  cancelled_date: "cancelled_date",
  expect_import_date: "expect_import_date",
  is_have_returned: "is_have_returned",
  // cost_included: "cost_included",
  completed_date: "completed_date",
  qc: "qc",
  // tags: "tags",
  reference: "reference",
  note: "note",
  supplier_note: "supplier_note",
  status: "status",
  merchandiser: "merchandiser",
};

const rangeFilter = {
  from_order_date: "from_order_date",
  to_order_date: "to_order_date",
  from_activated_date: "from_activated_date",
  to_activated_date: "to_activated_date",
  from_completed_date: "from_completed_date",
  to_completed_date: "to_completed_date",
  from_cancelled_date: "from_cancelled_date",
  to_cancelled_date: "to_cancelled_date",
  from_expect_import_date: "from_expect_import_date",
  to_expect_import_date: "to_expect_import_date",
}

const allStatus: any = {
  [filterFields.status]: listPOStatus,
  [filterFields.receive_status]: listProcumentStatus,
  [filterFields.financial_status]: listPaymentStatus,
};

const filterFieldsMapping: any = {
  [filterFields.receive_status]: "Nhập kho",
  [filterFields.financial_status]: "Thanh toán",
  [filterFields.tax_included]: "VAT",
  [filterFields.order_date]: "Ngày tạo đơn",
  [filterFields.activated_date]: "Ngày duyệt đơn",
  [filterFields.expected_store]: "Kho nhận hàng dự kiến",
  [filterFields.completed_date]: "Ngày hoàn tất đơn",
  [filterFields.cancelled_date]: "Ngày hủy đơn",
  // [filterFields.status]: "Trạng thái đơn",
  // [filterFields.cost_included]: "Chi phí",
  // [filterFields.merchandiser]: "Merchandiser",
  [filterFields.qc]: "QC",
  [filterFields.expect_import_date]: "Ngày nhận hàng dự kiến",
  [filterFields.note]: "Ghi chú nội bộ",
  [filterFields.supplier_note]: "Ghi chú nhà cung cấp",
  // [filterFields.tags]: "Tag",
  [filterFields.reference]: "Mã tham chiếu",
  [filterFields.is_have_returned]: "Trả hàng",
  [filterFields.status]: "Trạng thái đơn",
  [filterFields.merchandiser]: "Merchandiser",
};

const keysDateFilter = [
  filterFields.order_date,
  filterFields.activated_date,
  filterFields.completed_date,
  filterFields.cancelled_date,
  filterFields.expect_import_date,
];

const convertStoreLabel = (store: string, allStore: StoreResponse[]) => {
  const storeFiltered = allStore.filter((i: StoreResponse) => i.id === Number(store));
  return storeFiltered.length > 0 ? storeFiltered[0].name : '';
};

const FilterList = ({ filters, resetField, allStores }: any) => {
  const newFilters = {...filters};

  let filtersKeys = Object.keys(newFilters);
  const newKeys = ConvertDatesLabel(newFilters, keysDateFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateFilter, i));

  let renderTxt: any = null;
  return (
    <Row wrap>
      {[...newKeys, ...filtersKeys].map((filterKey) => {
        let value = filters[filterKey];

        if (!filterFieldsMapping[filterKey]) return <Fragment />;
        switch (filterKey) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.cancelled_date:
          case filterFields.completed_date:
          case filterFields.expect_import_date:
            renderTxt = `${filterFieldsMapping[filterKey]} 
            : ${filters[`from_${filterKey}`] ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'} 
            ~ ${filters[`to_${filterKey}`] ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'}`
            break;
          case filterFields.status:
          case filterFields.receive_status:
          case filterFields.financial_status:
            if (!value) return null;
            let listStatus = allStatus[filterKey];
            if (!(value instanceof Array)) value = [value];
            let listStatusValue = value?.map((key: string) => {
              return listStatus[key];
            });
            renderTxt = `${filterFieldsMapping[filterKey]} : ${listStatusValue}`;
            break;
          case filterFields.is_have_returned:
            if (!value) return null;
            let costTxt = "Có trả hàng";
            if (value === "false") costTxt = "Không trả hàng";
            renderTxt = `${filterFieldsMapping[filterKey]} : ${costTxt}`;
            break;
          case filterFields.tax_included:
            if (!value) return null;
            let taxTxt = "Có VAT";
            if (value === "false") taxTxt = "Không VAT";
            renderTxt = `${filterFieldsMapping[filterKey]} : ${taxTxt}`;
            break;
          case filterFields.expected_store:
            if (!value || value === '' || value.length === 0) return null;
            let newValuesStores = Array.isArray(value) ? value : value.split(',');

            newValuesStores = newValuesStores.filter((e: any) => e !== '');
            renderTxt = `${filterFieldsMapping[filterKey]} : `;
            newValuesStores.forEach((i: string, index: number) => {
              renderTxt = renderTxt + `${convertStoreLabel(i, allStores)}${newValuesStores.length - 1 === index ? '' : ', '}`
            });
            break;
          default:
            if (!value) return null;
            renderTxt = `${filterFieldsMapping[filterKey]} : ${value}`;
        }
        return (
          <Tag
            onClose={() => {
              if (keysDateFilter.indexOf(filterKey) !== -1) {
                resetField(`from_${filterKey}`);
                resetField(`to_${filterKey}`);
                return;
              }
              resetField(filterKey)
            }}
            key={filterKey}
            className="fade"
            style={{ marginBottom: 10 }}
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </Row>
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
  wins: PageResponse<AccountResponse>,
  lstQC: PageResponse<AccountResponse>,
  listStore: PurchaseOrderFilterProps["listStore"];
  tempAdvanceFilters: any;
  formRef: any;
  getAccounts: (code: string, page: number, qc: boolean, win: boolean) => void
};

const AdvanceFormItems = ({
  wins,
  lstQC,
  listStore,
  tempAdvanceFilters,
  getAccounts,
  formRef
}: AdvanceFormItemProps) => {
  return (
    <Row gutter={20}>
      {Object.keys(filterFields).map((field) => {
        let collapseChildren;
        switch (field) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.cancelled_date:
          case filterFields.expect_import_date:
            collapseChildren = <CustomFilterDatePicker
              fieldNameFrom={`from_${field}`}
              fieldNameTo={`to_${field}`}
              activeButton={''}
              setActiveButton={() => {}}
              formRef={formRef}
            />
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
          // case filterFields.merchandiser:
          //   collapseChildren = (
          //   );
          //   break;
          case filterFields.qc:
            collapseChildren = (
              <AccountSearchPaging fixedQuery={{ department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" }}
                tagRender={tagRender}
                mode="multiple"
                placeholder="Chọn 1 hoặc nhiều QC"/>
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
              // <CustomSelect
              //   showArrow
              //   placeholder="Kho nhận hàng dự kiến"
              //   style={{
              //     width: "100%",
              //   }}
              //   tagRender={tagRender}
              //   notFoundContent="Không tìm thấy kết quả"
              //   mode="multiple"
              //   allowClear
              //   maxTagCount="responsive"
              // >
              //   {listStore?.map((item) => (
              //     <CustomSelect.Option key={item.id} value={item.name}>
              //       {item.name}
              //     </CustomSelect.Option>
              //   ))}
              // </CustomSelect>
              <TreeStore listStore={listStore} placeholder="Kho nhận hàng dự kiến"/>
            );
            break;
          case filterFields.note:
            collapseChildren = (
              <Input.TextArea placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
            );
            break;
          case filterFields.supplier_note:
            collapseChildren = (
              <Input.TextArea placeholder="Tìm kiếm theo nội dung ghi chú nhà cung cấp" />
            );
            break;
          // case filterFields.tags:
          //   collapseChildren = <HashTag placeholder="Tìm kiếm theo tag" />;
          //   break;
          case filterFields.reference:
            collapseChildren = (
              <Input placeholder="Tìm kiếm theo mã tham chiếu" />
            );
            break;
          default:
            collapseChildren = null;
        }
        return (
          <Col span={8} key={field} hidden={ field === filterFields.status || field === filterFields.merchandiser }>
            <div className="font-weight-500">{filterFieldsMapping[field]}</div>
            <Item  name={field}>{collapseChildren}</Item>
          </Col>
        );
      })}
    </Row>
  );
};

const PurchaseOrderFilter: React.FC<PurchaseOrderFilterProps> = (
  props: PurchaseOrderFilterProps
) => {
  const {
    params,
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
  const [wins, setWins] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );
  const {fetchMerchans, merchans, isLoadingMerchans} = useFetchMerchans()

  const [lstQC, setlstQC] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();

  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [tempAdvanceFilters, setTempAdvanceFilters] = useState({});

  const resetField = useCallback(
    (field: string) => {
      formAdvanceFilter.resetFields([field]);
      setTimeout(() => {
        formBaseFilter.resetFields([field]);
      })
      onAdvanceFinish()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    (values?: PurchaseOrderQuery) => {
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
    setVisible(false);
  }, []);

  const onResetFilter = useCallback(() => {
    let fields = formAdvanceFilter.getFieldsValue(true);
    for (let key in fields) {
      if(fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formAdvanceFilter.setFieldsValue(fields);
    formAdvanceFilter.resetFields(['merchandiser', 'qc']);
    formAdvanceFilter.submit();
    setVisible(false);
    setTagActive(null);
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

  const FilterConfigCom = (props: any)=> {
    return (
      <div style={{marginRight: 20, display: "inline-flex"}}>
          <Tag onClick={(e)=>{
              onSelectFilterConfig(props.index, props.id);
              }} style={{cursor: "pointer",
                  wordBreak: "break-all", whiteSpace: "unset" , backgroundColor: tagAcitve === props.index ? primaryColor: '',
                    color: tagAcitve === props.index ? "white": ''}} key={props.index} icon={<StarOutlined />}
                    closeIcon={<CloseOutlined className={tagAcitve === props.index ? "ant-tag-close-icon" : "ant-tag-close-icon-black"} />} closable={true} onClose={(e)=>{
                      e.preventDefault();
                      setConfigId(props.id);
                      setIsShowConfirmDelete(true);
                    }}>
              {props.name}
            </Tag>
      </div>
    )
  }

  const onResultGetConfig = useCallback((res: BaseResponse<Array<FilterConfig>>)=>{
    if (res && res.data && res.data.length > 0) {
     const configFilters = res.data.filter(e=>e.type === FILTER_CONFIG_TYPE.FILTER_PO);
     setLstConfigFilter(configFilters);
    }
    else{
      setLstConfigFilter([]);
     }
  },[]);

  const getConfigPo = useCallback(()=>{
    if (account && account.code) {
      dispatch(
        getConfigPoAction(
           account.code,
           onResultGetConfig
        )
      );
    }
  },[account, dispatch, onResultGetConfig])

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

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return false;
      }
      if (isWin) {
        setWins(data);
      }
      if (isQC) {
        setlstQC(data);
      }
    },
    []
  );

  const getAccounts = useCallback((code: string, page: number, qc: boolean, win: boolean) => {
    isQC = qc;
    isWin = win;
    dispatch(
      searchAccountPublicAction(
        { condition: code, page: page, status: "active" },
        setDataAccounts
      )
    );
  }, [dispatch, setDataAccounts]);

  useEffect(() => {
    formBaseFilter.setFieldsValue({ ...advanceFilters });
    formAdvanceFilter.setFieldsValue({ ...advanceFilters });
    setTempAdvanceFilters(advanceFilters);
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);

  useEffect(() => {
    setAdvanceFilters({
      ...params,
      [rangeFilter.from_order_date]: formatDateFilter(params.from_order_date),
      [rangeFilter.to_order_date]: formatDateFilter(params.to_order_date),
      [rangeFilter.from_activated_date]: formatDateFilter(params.from_activated_date),
      [rangeFilter.to_activated_date]: formatDateFilter(params.to_activated_date),
      [rangeFilter.from_cancelled_date]: formatDateFilter(params.from_cancelled_date),
      [rangeFilter.to_cancelled_date]: formatDateFilter(params.to_cancelled_date),
      [rangeFilter.from_expect_import_date]: formatDateFilter(params.from_expect_import_date),
      [rangeFilter.to_expect_import_date]: formatDateFilter(params.to_expect_import_date),
      [rangeFilter.from_completed_date]: formatDateFilter(params.from_completed_date),
      [rangeFilter.to_completed_date]: formatDateFilter(params.to_completed_date),
      [filterFields.expected_store]: params.expected_store ? isArray(params.expected_store) ? params.expected_store : params.expected_store.split(',') : [],
    });
  }, [params]);

  useEffect(() => {
    getConfigPo();
  }, [getConfigPo]);

  useEffect(()=>{
    getAccounts('', 1, true, true);
  },[getAccounts]);

  const formRef = createRef<FormInstance>();

  return (
    <div className="purchase-order-form">
      <Form.Provider
        onFormFinish={(name, {values, forms}) => {
          const {formBaseFilter, formAdvanceFilter} = forms;
          let baseValues = formBaseFilter.getFieldsValue(true);
          let advanceValues = formAdvanceFilter?.getFieldsValue(true);
          let data = {...baseValues, ...advanceValues};
          let from_order_date = data[rangeFilter.from_order_date],
            to_order_date = data[rangeFilter.to_order_date],
            from_activated_date = data[rangeFilter.from_activated_date],
            to_activated_date = data[rangeFilter.to_activated_date],
            from_completed_date = data[rangeFilter.from_completed_date],
            to_completed_date = data[rangeFilter.to_completed_date],
            from_cancelled_date = data[rangeFilter.from_cancelled_date],
            to_cancelled_date = data[rangeFilter.to_cancelled_date],
            from_expect_import_date = data[rangeFilter.from_expect_import_date],
            to_expect_import_date = data[rangeFilter.to_expect_import_date];

          for (let key in data) {
            if (data[key] instanceof Array) {
              if (data[key].length === 0) data[key] = undefined;
            }
          }

          data = {
            ...data,
            from_order_date: getStartOfDayCommon(from_order_date),
            to_order_date: getEndOfDayCommon(to_order_date),
            from_activated_date: getStartOfDayCommon(from_activated_date),
            to_activated_date: getEndOfDayCommon(to_activated_date),
            from_completed_date: getStartOfDayCommon(from_completed_date),
            to_completed_date: getEndOfDayCommon(to_completed_date),
            from_cancelled_date: getStartOfDayCommon(from_cancelled_date),
            to_cancelled_date: getEndOfDayCommon(to_cancelled_date),
            from_expect_import_date: getStartOfDayCommon(from_expect_import_date),
            to_expect_import_date: getEndOfDayCommon(to_expect_import_date),
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
              <Item name={filterFields.merchandiser} style={{width: 250}}>
                <BaseSelectMerchans
                  mode={"tags"}
                  tagRender={tagRender}
                  merchans={merchans}
                  fetchMerchans={fetchMerchans}
                  isLoadingMerchans={isLoadingMerchans}
                />
              </Item>
              <Item name={filterFields.status}>
                <BaseSelect
                  showArrow
                  mode={"tags"}
                  placeholder="Trạng thái đơn"
                  tagRender={tagRender}
                  data={Object.keys(listPOStatus)}
                  renderItem={(item) => (
                    <Option key={item} value={item}>{listPOStatus[item]}</Option>
                  )}
                  notFoundContent="Không tìm thấy kết quả"
                  style={{width: 200}}
                />
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
        <FilterList filters={advanceFilters} resetField={resetField} allStores={listStore} />
        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={968}
          allowSave
          onSaveFilter={onShowSaveFilter}
        >
          <Form
            ref={formRef}
            form={formAdvanceFilter}
            name="formAdvanceFilter"
            onFinish={onAdvanceFinish}
            layout="vertical"
            style={{ paddingTop: 12 }}
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
              <div style={{ marginBottom: 20 }}>
                   {
                     lstConfigFilter?.map((e, index)=>{
                       return <FilterConfigCom key={index} id={e.id} index={index} name={e.name} />
                     })
                   }
              </div>
            }
            <Row gutter={12}>
              <Col span={12}>
                <Item name="info" className="search">
                  <Input
                    prefix={<img src={search} alt="" />}
                    placeholder="Tìm kiếm theo ID đơn mua, Tên, SĐT nhà cung cấp"
                  />
                </Item>
              </Col>
              <Col span={6}>
                <Item name={filterFields.merchandiser}>
                  <BaseSelectMerchans
                    mode={"tags"}
                    tagRender={tagRender}
                    merchans={merchans}
                    fetchMerchans={fetchMerchans}
                    isLoadingMerchans={isLoadingMerchans}
                  />
                </Item>
              </Col>
              <Col span={6}>
                <Item name={filterFields.status}>
                  <BaseSelect
                    showArrow
                    mode={"tags"}
                    placeholder="Trạng thái đơn"
                    tagRender={tagRender}
                    data={Object.keys(listPOStatus)}
                    renderItem={(item) => (
                      <Option key={item} value={item}>{listPOStatus[item]}</Option>
                    )}
                    notFoundContent="Không tìm thấy kết quả"
                    style={{width: 200}}
                  />
                </Item>
              </Col>
            </Row>
            <AdvanceFormItems
              formRef={formRef}
              wins={wins}
              lstQC={lstQC}
              listStore={listStore}
              tempAdvanceFilters={tempAdvanceFilters}
              getAccounts={getAccounts}
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
