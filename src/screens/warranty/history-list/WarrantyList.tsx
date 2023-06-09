import { PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Menu, Tabs } from "antd";
import color from "assets/css/export-variable.module.scss";
import { ReactComponent as DeleteIcon } from "assets/icon/deleteIcon.svg";
import { ReactComponent as EditIcon } from "assets/icon/edit.svg";
import exportIcon from "assets/icon/export.svg";
import MoreAction from "assets/icon/more-action.svg";
import { ReactComponent as CycleIcon } from "assets/icon/return.svg";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TagStatus from "component/tag/tag-status";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useGetPaymentMethods from "hook/order/useGetPaymentMethods";
import useFetchStores from "hook/useFetchStores";
import useFetchWarranties from "hook/warranty/useFetchWarranties";
import useGetWarrantyCenters from "hook/warranty/useGetWarrantyCenters";
import useGetWarrantyCount from "hook/warranty/useGetWarrantyCount";
import useGetWarrantyReasons from "hook/warranty/useGetWarrantyReasons";
import {
  GetWarrantiesParamModelExtra,
  WarrantiesUpdateDetailStatusModel,
  WarrantiesValueUpdateGetModel,
  WarrantyItemModel,
  WarrantyItemStatus,
  WarrantyReturnStatusModel,
  WarrantyStatus,
} from "model/warranty/warranty.model";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link, useHistory, withRouter } from "react-router-dom";
import ExportModal from "screens/order-online/modal/export.modal";
import { exportFile, getFile } from "service/other/export.service";
import {
  deleteWarrantiesService,
  sendToWarrantyCentersService,
  updateWarrantyDetailFeeService,
  updateWarrantyDetailNoteService,
  updateWarrantyDetailStatusService,
  updateWarrantyLineItemService,
} from "service/warranty/warranty.service";
import {
  changeMetaDataAfterDelete,
  formatCurrency,
  generateQuery,
  goToTopPage,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { PaymentMethodCode } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import {
  WARRANTY_ITEM_STATUS,
  WARRANTY_RETURN_STATUS,
  WARRANTY_TYPE,
} from "utils/Warranty.constants";
import WarrantyFilter from "../components/filter/WarrantyFilter";
import AppointmentDateModal from "./components/AppointmentDateModal";
import NoteModal from "./components/NoteModal";
import ReasonModal from "./components/ReasonModal";
import WarrantyCenterModal from "./components/WarrantyCenterModal";
import WarrantyReasonsPriceModal from "./components/WarrantyReasonsPriceModal";
import WarrantyStatusModal from "./components/WarrantyStatusModal";
import { StyledComponent } from "./WarrantyList.style";
const { TabPane } = Tabs;

export const TAB_STATUS_KEY = {
  new: "new",
  finalized: "finalized",
  finished: "finished",
  today: "today",
  expired: "expired",
  all: "all",
};

let TAB_STATUS = [
  {
    key: TAB_STATUS_KEY.new,
    name: "Mới",
    param: {},
    labelColor: "#0400fb",
    countParam: {
      return_status: WarrantyReturnStatusModel.UNRETURNED,
      status: [WarrantyItemStatus.RECEIVED],
    },
    count: 0,
  },
  {
    key: TAB_STATUS_KEY.finalized,
    name: "Xác nhận",
    param: {},
    labelColor: "#fbaf15",
    countParam: {
      return_status: WarrantyReturnStatusModel.UNRETURNED,
      status: [WarrantyItemStatus.FIXING, WarrantyItemStatus.FIXED, WarrantyItemStatus.NOT_FIXED],
    },
    count: 0,
  },
  {
    key: TAB_STATUS_KEY.finished,
    name: "Hoàn thành",
    param: {},
    labelColor: "#65a74a",
    countParam: {
      return_status: WarrantyReturnStatusModel.RETURNED,
    },
    count: 0,
  },
  {
    key: TAB_STATUS_KEY.today,
    name: "Hôm nay",
    param: {},
    labelColor: "#6850a7",
    countParam: {
      from_appointment_date: moment().format(DATE_FORMAT.DD_MM_YYYY),
      to_appointment_date: moment().format(DATE_FORMAT.DD_MM_YYYY),
    },
    count: 0,
  },
  {
    key: TAB_STATUS_KEY.expired,
    name: "Quá hạn",
    param: {},
    labelColor: "#cc0100",
    countParam: {
      to_appointment_date: moment().subtract(1, "days").format(DATE_FORMAT.DD_MM_YYYY),
      return_status: WarrantyReturnStatusModel.UNRETURNED,
    },
    count: 0,
  },
  {
    key: TAB_STATUS_KEY.all,
    name: "Tất cả",
    param: {},
    labelColor: "#20B2AA",
    countParam: {},
    count: 0,
  },
];

type PropTypes = {
  location: any;
};

let dataWarranties: WarrantyItemModel[] = [];

type DeleteType = "single" | "multi";

let typeOfDelete: DeleteType = "single";

const countParams: string[] = TAB_STATUS.map((single) => {
  return JSON.stringify(single.countParam);
});

function WarrantyHistoryList(props: PropTypes) {
  const { location } = props;

  const dispatch = useDispatch();

  const formatDate = DATE_FORMAT.fullDate;
  const history = useHistory();
  const rowSelected = useRef<{ record: WarrantyItemModel; index: number }>();
  const [isFeeModalVisible, setIsFeeModalVisible] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isWarrantyCenterModalVisible, setIsWarrantyCenterModalVisible] = useState(false);
  const [isAppointmentDateModalVisible, setIsAppointmentDateModalVisible] = useState(false);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [confirmDeleteSubTitle, setConfirmDeleteSubTitle] = useState<React.ReactNode>("");
  const [countForceFetchData, setCountForceFetchData] = useState(0);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const [columns, setColumns] = useState<Array<ICustomTableColumType<WarrantyItemModel>>>([]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(1);

  const rowClicked = (record: any, index: number) => {
    rowSelected.current = { record, index };
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<WarrantyItemModel[]>([]);

  const [selectedData, setSelectedData] = useState<WarrantiesValueUpdateGetModel>({
    note: "",
    status: undefined,
    return_status: undefined,
    warranty_center_id: undefined,
    price: undefined,
    customer_fee: undefined,
    appointment_date: undefined,
    reason_ids: undefined,
  });

  const initQuery: GetWarrantiesParamModelExtra = {
    tab: TAB_STATUS_KEY.new,
    page: 1,
    limit: 30,
    store_ids: [],
    ids: [],
    from_created_date: undefined,
    to_created_date: undefined,
    from_appointment_date: undefined,
    to_appointment_date: undefined,
    type: undefined,
    warranty_status: WarrantyStatus.NEW,
  };
  const [query, setQuery] = useState<GetWarrantiesParamModelExtra>(initQuery);
  const stores = useFetchStores();
  const warrantyCenters = useGetWarrantyCenters();
  const warrantyReasons = useGetWarrantyReasons();
  const paymentMethods = useGetPaymentMethods();
  const filteredPaymentMethod = paymentMethods.filter(
    (method) => method.code !== PaymentMethodCode.POINT && method.code !== PaymentMethodCode.COD,
  );

  const checkIfInvalidFilter = (values: any) => {
    console.log("values", values);
    if (
      moment(values.to_created_date, DATE_FORMAT.DDMMYY_HHmm).isBefore(
        moment(values.from_created_date, DATE_FORMAT.DDMMYY_HHmm),
      )
    ) {
      showError("Ngày tiếp nhận đang lọc không đúng");
      return true;
    }
    if (
      moment(values.to_appointment_date, DATE_FORMAT.DDMMYY_HHmm).isBefore(
        moment(values.from_appointment_date, DATE_FORMAT.DDMMYY_HHmm),
      )
    ) {
      showError("Ngày hẹn trả đang lọc không đúng");
      return true;
    }
    return false;
  };

  const getWarranties = useFetchWarranties(
    initQuery,
    location,
    countForceFetchData,
    setQuery,
    checkIfInvalidFilter,
  );
  let { warranties, metadata } = getWarranties;
  const [data, setData] = useState<WarrantyItemModel[]>([]);

  const [metaDataShow, setMetaDataShow] = useState({
    limit: 0,
    page: 0,
    total: 0,
  });
  dataWarranties = warranties;

  let warrantyCount = useGetWarrantyCount(countParams);

  const [warrantyCountState, setWarrantyCountState] = useState<number[]>([]);

  useEffect(() => {
    setWarrantyCountState(warrantyCount);
  }, [warrantyCount]);

  const ACTION_ID = {
    delete: 1,
    print_warranty: 2,
    print_warranty_returns: 3,
  };

  const actions: Array<MenuAction> = useMemo(
    () => [
      {
        id: ACTION_ID.delete,
        name: "Xóa phiếu bảo hành",
        icon: <PrinterOutlined />,
        disabled: selectedRowKeys.length ? false : true,
      },
      {
        id: ACTION_ID.print_warranty,
        name: "In phiếu tiếp nhận bảo hành",
        icon: <PrinterOutlined />,
        disabled: selectedRowKeys.length ? false : true,
      },
      {
        id: ACTION_ID.print_warranty_returns,
        name: "In phiếu trả bảo hành",
        icon: <PrinterOutlined />,
        disabled: selectedRowKeys.length ? false : true,
      },
    ],
    [
      ACTION_ID.delete,
      ACTION_ID.print_warranty,
      ACTION_ID.print_warranty_returns,
      selectedRowKeys.length,
    ],
  );

  const onSelectedChange = (selectedRow: WarrantyItemModel[]) => {
    console.log("selectedRowKeys changed: ", selectedRow);
    const selectedRows = selectedRow.filter((row) => row);
    const selectedRowIds = selectedRows.map((row) => row?.id);
    setSelectedRows(selectedRows);
    setSelectedRowKeys(selectedRowIds);
  };

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTION_ID.delete:
          typeOfDelete = "multi";
          setConfirmDeleteSubTitle(
            <React.Fragment>
              Bạn có chắc chắn muốn xóa các: <strong>Lịch sử bảo hành</strong> đã chọn ?
            </React.Fragment>,
          );
          setIsDeleteConfirmModalVisible(true);
          break;
        case ACTION_ID.print_warranty: {
          let queryParamOrder = generateQuery({
            action: "print",
            ids: selectedRowKeys,
            "print-type": "warranty",
            "print-dialog": true,
          });
          const printPreviewOrderUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParamOrder}`;
          window.open(printPreviewOrderUrl);
          break;
        }
        case ACTION_ID.print_warranty_returns: {
          const selectedRowInvalid = selectedRows.filter(
            (single) => single.status !== WarrantyItemStatus.FIXED,
          );
          const inValidateRowText = selectedRowInvalid.map((single) => single.id).join(", ");
          if (selectedRowInvalid.length > 0) {
            if (selectedRowInvalid.length === 1) {
              showError(
                `Trạng thái phiếu ${selectedRowInvalid[0].id} không hợp lệ để in phiếu trả bảo hành`,
              );
            } else {
              showError(
                `Các phiếu đã chọn có chứa phiếu không hợp lệ : ${inValidateRowText}. Vui lòng chỉ chọn các phiếu ở trạng thái Đã sửa xong.`,
              );
            }
          } else {
            let queryParamOrder = generateQuery({
              action: "print",
              ids: selectedRowKeys,
              "print-type": "warranty_returns",
              "print-dialog": true,
            });
            const printPreviewOrderUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParamOrder}`;
            window.open(printPreviewOrderUrl);
          }
          break;
        }
        default:
          break;
      }
    },
    [
      ACTION_ID.delete,
      ACTION_ID.print_warranty,
      ACTION_ID.print_warranty_returns,
      selectedRowKeys,
      selectedRows,
    ],
  );

  const handleUpdateWarrantyNote = (warrantyItemId: number, warrantyId: number, note: string) => {
    dispatch(showLoading());
    updateWarrantyDetailNoteService(warrantyItemId, warrantyId, note)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật ghi chú thành công!");
          const index = data.findIndex((single) => single.id === warrantyId);
          if (index > -1) {
            let dataResult = [...data];
            dataResult[index].note = note;
            setData(dataResult);
          }
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Cập nhật ghi chú", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleOkFeeModal = (values: any) => {
    setIsFeeModalVisible(false);
    const params = {
      customer_fee: values.customer_fee,
    };
    if (!rowSelected.current?.record.warranty.id) {
      return;
    }
    updateWarrantyDetailFeeService(
      rowSelected.current?.record.warranty.id,
      rowSelected.current?.record.id,
      params,
    )
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật phí báo khách thành công!");
          const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
          if (index > -1) {
            let dataResult = [...data];
            dataResult[index].customer_fee = values.customer_fee || null;
            setData(dataResult);
          }
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Cập nhật phí báo khách", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
    console.log(rowSelected.current);
  };

  const handleOkNoteModal = (values: any) => {
    setIsNoteModalVisible(false);
    if (!rowSelected.current?.record.warranty.id) {
      return;
    }
    handleUpdateWarrantyNote(
      rowSelected.current?.record.warranty.id,
      rowSelected.current?.record.id,
      values.note,
    );
  };

  const checkTabAfterChange = (status: string, returnStatus: string) => {
    let result = "";
    if (returnStatus === WarrantyReturnStatusModel.UNRETURNED) {
      switch (status) {
        case WarrantyItemStatus.RECEIVED:
          result = TAB_STATUS_KEY.new;
          break;
        default:
          result = TAB_STATUS_KEY.finalized;
          break;
      }
    } else {
      result = TAB_STATUS_KEY.finished;
    }
    return result;
  };

  const handleIfChangeTab = (tabValueAfterChange: string) => {
    // xóa trong list
    let dataResult = [...data].filter((single) => single.id !== rowSelected.current?.record.id);
    setData(dataResult);
    changeMetaDataAfterDelete(metadata, setMetaDataShow, 1);
    // thay đổi số
    let indexFrom = TAB_STATUS.findIndex((single) => single.key === query.tab);
    let indexTo = TAB_STATUS.findIndex((single) => single.key === tabValueAfterChange);
    let newWarrantyCount = [...warrantyCountState];
    if (indexFrom > -1) {
      newWarrantyCount[indexFrom] = warrantyCountState[indexFrom] - 1;
    }
    if (indexTo > -1) {
      newWarrantyCount[indexTo] = warrantyCountState[indexTo] + 1;
    }
    setWarrantyCountState(newWarrantyCount);
  };

  const handleOkStatusModal = (values: any) => {
    setIsStatusModalVisible(false);
    if (!rowSelected.current?.record.warranty.id) {
      return;
    }
    const params: WarrantiesUpdateDetailStatusModel =
      values.return_status === WarrantyReturnStatusModel.UNRETURNED
        ? {
            status: values.status,
            return_status: values.return_status,
          }
        : {
            status: values.status,
            return_status: values.return_status,
            payments: {
              payment_method_id: values.payment_method_id,
              line_item_id: rowSelected.current?.record.id,
              value: values.value,
            },
          };
    dispatch(showLoading());
    updateWarrantyDetailStatusService(
      rowSelected.current?.record.warranty.id,
      rowSelected.current?.record.id,
      params,
    )
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật trạng thái thành công!");
          const tabValueAfterChange = checkTabAfterChange(values.status, values.return_status);

          // let newPrams = {
          //   tab: status,
          // };
          // let queryParam = generateQuery(newPrams);
          // history.push(`${location.pathname}?${queryParam}`);
          const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
          if (index > -1) {
            console.log("rowSelected.current", rowSelected.current);
            if (query.tab !== tabValueAfterChange) {
              handleIfChangeTab(tabValueAfterChange);
            } else {
              let dataResult = [...data];
              dataResult[index].status = values.status;
              dataResult[index].return_status = values.return_status;
              setData(dataResult);
            }
          }
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Cập nhật trạng thái", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleOkReasonModal = (values: any) => {
    setIsReasonModalVisible(false);
    if (!rowSelected.current?.record.warranty.id) {
      return;
    }
    dispatch(showLoading());
    const params: any = {
      ...rowSelected.current?.record,
      expenses: values.reason_ids.map((single: number, index: number) => {
        let expense_id =
          index <= values.reason_ids.length
            ? rowSelected.current?.record.expenses[index].id
            : undefined;
        return {
          reason_id: single,
          line_item_id: rowSelected.current?.record.id,
          id: expense_id,
        };
      }),
    };
    updateWarrantyLineItemService(
      rowSelected.current?.record.id,
      rowSelected.current?.record.warranty.id,
      params,
    )
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật lý do thành công!");
          const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
          if (index > -1 && values.reason_ids && values.reason_ids?.length > 0) {
            let dataResult = [...data];
            dataResult[index].expenses =
              values.reason_ids?.map((single: number) => {
                return {
                  id: 0,
                  reason_id: single,
                  code: "",
                  reason: warrantyReasons
                    ? warrantyReasons?.find((reason) => reason.id === single)?.name || ""
                    : "",
                };
              }) || [];
            setData(dataResult);
          }
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Cập nhật lý do", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleOkAppointmentDateModal = (values: any) => {
    setIsAppointmentDateModalVisible(false);
    if (!rowSelected.current?.record.warranty.id) {
      return;
    }
    dispatch(showLoading());
    const params: any = {
      ...rowSelected.current?.record,
      appointment_date: values.appointment_date,
    };
    updateWarrantyLineItemService(
      rowSelected.current?.record.id,
      rowSelected.current?.record.warranty.id,
      params,
    )
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Cập nhật ngày hẹn trả thành công!");
          const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
          if (index > -1) {
            let dataResult = [...data];
            dataResult[index].appointment_date = values.appointment_date
              ? moment(values.appointment_date).toDate()
              : null;
            setData(dataResult);
          }
          // changeToTabFinalizedIfCurrentIsNew();
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Cập nhật ngày hẹn trả", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleOkWarrantyCenterModal = (values: any) => {
    setIsWarrantyCenterModalVisible(false);
    if (!rowSelected.current?.record.warranty.id) {
      return;
    }
    dispatch(showLoading());
    const params = {
      warranty_center_id: values.warranty_center_id,
    };
    sendToWarrantyCentersService(
      rowSelected.current?.record.warranty.id,
      rowSelected.current?.record.id,
      params,
    )
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Chuyển trung tâm bảo hành thành công!");
          const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
          if (index > -1) {
            let dataResult = [...data];
            dataResult[index].warranty_center_id = values.warranty_center_id;
            setData(dataResult);
          }
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Chuyển trung tâm bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleDeleteSingle = () => {
    if (!rowSelected.current?.record.warranty.id) {
      return;
    }
    let params = {
      ids: [
        {
          line_item_id: rowSelected.current?.record.id,
          warranty_id: rowSelected.current?.record.warranty.id,
        },
      ],
    };
    dispatch(showLoading());
    deleteWarrantiesService(params)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa phiếu bảo hành thành công!");
          const index = data.findIndex((single) => single.id === rowSelected.current?.record.id);
          if (index > -1) {
            let dataResult = [...data];
            dataResult.splice(index, 1);
            setData(dataResult);
          }
          changeMetaDataAfterDelete(metadata, setMetaDataShow, 1);
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Xóa phiếu bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleDeleteMulti = () => {
    const query = selectedRowKeys.map((single) => {
      const selected = dataWarranties.find((data) => data.id === single);
      console.log("single", single);
      return {
        line_item_id: selected?.id || 0,
        warranty_id: selected?.warranty.id || 0,
      };
    });
    let params = {
      ids: query,
    };
    dispatch(showLoading());
    deleteWarrantiesService(params)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Xóa phiếu bảo hành thành công!");
          let dataResult = [...data].filter((single) => !selectedRowKeys.includes(single.id));
          setData(dataResult);
          changeMetaDataAfterDelete(metadata, setMetaDataShow, selectedRowKeys.length);
          console.log("response", response);
        } else {
          handleFetchApiError(response, "Xóa phiếu bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const handleOkDeleteModal = () => {
    setIsDeleteConfirmModalVisible(false);
    switch (typeOfDelete) {
      case "single":
        handleDeleteSingle();
        break;
      case "multi":
        handleDeleteMulti();
        break;
      default:
        break;
    }
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
      goToTopPage();
    },
    [history, location.pathname, query],
  );

  const forceFetchData = useCallback(() => {
    setCountForceFetchData(countForceFetchData + 1);
  }, [countForceFetchData]);

  const onFilter = useCallback(
    (values) => {
      let isError = checkIfInvalidFilter(values);
      if (isError) {
        return;
      }
      let newParams = {
        ...query,
        ...values,
        page: 1,
      };
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
    [forceFetchData, history, location.pathname, query],
  );

  useEffect(() => {
    setData(warranties);
  }, [warranties]);

  const initColumns: ICustomTableColumType<WarrantyItemModel>[] = useMemo(() => {
    // if (data.items.length === 0) {
    //   return [];
    // }
    return [
      {
        title: "ID",
        dataIndex: "id",
        align: "center",
        width: "6%",
        render: (id, record: WarrantyItemModel) => {
          return record?.id ? (
            <div className="columnId">
              <Link to={`${UrlConfig.WARRANTY}/${record.id}`}>{id}</Link>
              <br />
              <div>
                {record?.created_date ? moment(record?.created_date).format(formatDate) : "-"}
              </div>
            </div>
          ) : null;
        },
        visible: true,
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
        visible: true,
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
        visible: true,
      },
      {
        title: "Loại",
        dataIndex: "type",
        key: "type",
        width: "9%",
        align: "center",
        render: (value, record: WarrantyItemModel) => {
          let result = WARRANTY_TYPE.find((single) => single.code === record.type);
          return <div>{result ? result.name : "-"}</div>;
        },
        visible: true,
      },
      {
        title: "Phí báo khách",
        dataIndex: "customer_fee",
        key: "customer_fee",
        width: "7%",
        align: "center",
        render: (id, record: WarrantyItemModel, index) => {
          return (
            <div
              className="customer_fee isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setSelectedData({
                  ...selectedData,
                  customer_fee: record.customer_fee ? record.customer_fee : undefined,
                });
                setIsFeeModalVisible(true);
              }}
            >
              {record.customer_fee ? (
                <div className="hasFee">{formatCurrency(record.customer_fee)}</div>
              ) : (
                <div className="noFee">
                  <Button
                    icon={<AiOutlinePlus color={color.primary} />}
                    className="fee-icon addIcon"
                    onClick={() => {
                      rowClicked(record, index);
                      setIsFeeModalVisible(true);
                    }}
                  />
                </div>
              )}
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Lý do",
        dataIndex: "reason",
        key: "reason",
        width: "8.5%",
        render: (value, record: WarrantyItemModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setSelectedData({
                  ...selectedData,
                  reason_ids: record.expenses.map((single) => single.reason_id),
                });
                setIsReasonModalVisible(true);
              }}
            >
              {record?.expenses && record?.expenses.length > 0 ? (
                renderReason(record)
              ) : (
                <Button
                  icon={<AiOutlinePlus color={color.primary} />}
                  className="fee-icon addIcon"
                />
              )}
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Hẹn trả",
        dataIndex: "appointment_date",
        key: "appointment_date",
        align: "center",
        width: "7%",
        render: (value, record: WarrantyItemModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setSelectedData({
                  ...selectedData,
                  appointment_date: record.appointment_date
                    ? moment(record.appointment_date).format(DATE_FORMAT.DD_MM_YYYY)
                    : undefined,
                });
                setIsAppointmentDateModalVisible(true);
              }}
            >
              {record?.appointment_date ? (
                moment(record?.appointment_date).format(DATE_FORMAT.DD_MM_YYYY)
              ) : (
                <Button
                  icon={<AiOutlinePlus color={color.primary} />}
                  className="fee-icon addIcon"
                />
              )}
            </div>
          );
        },
        visible: true,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: "9%",
        render: (value, record: WarrantyItemModel, index) => {
          let resultStatus = WARRANTY_ITEM_STATUS.find((single) => single.code === record.status);
          let resultReturn = WARRANTY_RETURN_STATUS.find(
            (single) => single.code === record.return_status,
          );
          return (
            <React.Fragment>
              <div
                className="isCanChange"
                onClick={() => {
                  rowClicked(record, index);
                  setIsStatusModalVisible(true);
                  setSelectedData({
                    ...selectedData,
                    status: record.status,
                    return_status: record.return_status,
                  });
                }}
              >
                <div className="warranty-status">
                  {resultStatus ? (
                    <TagStatus type={resultStatus.type}>{resultStatus.name}</TagStatus>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="warranty-status">
                  {resultReturn ? (
                    <TagStatus type={resultReturn.type}>{resultReturn.name}</TagStatus>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        },
        visible: true,
      },
      {
        title: "Người tạo",
        dataIndex: "created_name",
        key: "created_name",
        width: "12%",
        render: (value, record: WarrantyItemModel) => {
          return <div>{`${record.created_by} - ${record.created_name}`}</div>;
        },
        visible: true,
      },
      {
        title: "Ghi chú",
        width: "7%",
        align: "center",
        render: (id, record: WarrantyItemModel, index) => {
          return (
            <div
              className="isCanChange"
              onClick={() => {
                rowClicked(record, index);
                setIsNoteModalVisible(true);
                setSelectedData({
                  ...selectedData,
                  note: record.note,
                });
              }}
            >
              {record.note && record.note.trim().length > 0 ? (
                record.note
              ) : (
                <Button
                  icon={<AiOutlinePlus color={color.primary} />}
                  className="fee-icon addIcon"
                  onClick={() => {
                    rowClicked(record, index);
                    setIsNoteModalVisible(true);
                  }}
                />
              )}
            </div>
          );
        },
        visible: true,
      },
      {
        title: "",
        width: "3.5%",
        align: "center",
        render: (text, record: WarrantyItemModel, index) => {
          return (
            <Dropdown
              trigger={["click"]}
              overlay={
                <Menu>
                  <Menu.Item
                    icon={<CycleIcon width={20} height={30} />}
                    key={"chuyen-trung-tam-bao-hanh"}
                    onClick={() => {
                      setIsWarrantyCenterModalVisible(true);
                      rowClicked(record, index);
                      setSelectedData({
                        ...selectedData,
                        warranty_center_id: record.warranty_center_id || undefined,
                      });
                    }}
                  >
                    Chuyển trung tâm bảo hành
                  </Menu.Item>
                  <Menu.Item
                    icon={<EditIcon width={20} height={30} />}
                    onClick={() => {
                      history.push(`${UrlConfig.WARRANTY}/${record.id}`);
                    }}
                    key={"update"}
                  >
                    Sửa
                  </Menu.Item>
                  <Menu.Item
                    icon={<CycleIcon width={20} height={30} />}
                    key={"in"}
                    onClick={() => {
                      let queryParamOrder = generateQuery({
                        action: "print",
                        ids: [record.id],
                        "print-type": "warranty",
                        "print-dialog": true,
                      });
                      const printPreviewOrderUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParamOrder}`;
                      window.open(printPreviewOrderUrl);
                    }}
                  >
                    In hóa đơn bảo hành
                  </Menu.Item>
                  <Menu.Item
                    icon={<CycleIcon width={20} height={30} />}
                    key={"in"}
                    onClick={() => {
                      if (record.status === WarrantyItemStatus.FIXED) {
                        let queryParamOrder = generateQuery({
                          action: "print",
                          ids: [record.id],
                          "print-type": "warranty_returns",
                          "print-dialog": true,
                        });
                        const printPreviewOrderUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParamOrder}`;
                        window.open(printPreviewOrderUrl);
                      } else {
                        showError(
                          `Trạng thái phiếu ${record.id} không hợp lệ để in phiếu trả bảo hành`,
                        );
                      }
                    }}
                  >
                    In phiếu trả bảo hành
                  </Menu.Item>
                  <Menu.Item
                    icon={<DeleteIcon height={30} />}
                    key={"delete"}
                    onClick={() => {
                      rowClicked(record, index);
                      typeOfDelete = "single";
                      setConfirmDeleteSubTitle(
                        <React.Fragment>
                          Bạn có chắc chắn muốn xóa: <strong>Lịch sử bảo hành</strong> có ID{" "}
                          <strong>{`"${record.id}"`}</strong> ?
                        </React.Fragment>,
                      );
                      setIsDeleteConfirmModalVisible(true);
                    }}
                  >
                    Xoá
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text" icon={<img src={MoreAction} alt=""></img>}></Button>
            </Dropdown>
          );
        },
        visible: true,
      },
    ];
  }, [formatDate, history, selectedData]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const onExport = useCallback(
    (optionExport) => {
      let newParams: any = { ...query };
      let currentTab = query.tab;
      let currentTabParams = TAB_STATUS.find((single) => single.key === currentTab)?.countParam;
      newParams = {
        ...query,
        ...currentTabParams,
        tab: undefined,
      };

      // let hiddenFields = [];
      switch (optionExport) {
        case 1:
          newParams = {};
          break;
        case 2:
          break;
        case 3:
          newParams = {
            ids: selectedRowKeys,
          };
          break;
        case 4:
          delete newParams.page;
          delete newParams.limit;
          break;
        default:
          break;
      }

      let queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: "EXPORT_WARRANTY",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(2);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch((error) => {
          setStatusExport(4);
          console.log("orders export file error", error);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    [query, selectedRowKeys, listExportFile],
  );
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(
            Math.round((response.data.num_of_record / response.data.total) * 10000) / 100,
          );
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(3);
            setExportProgress(100);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setListExportFile(newListExportFile);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(4);
          }
        } else {
          setStatusExport(4);
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);

  useEffect(() => {
    setMetaDataShow(metadata);
  }, [metadata]);

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
        <>
          <Button
            type="default"
            className="light"
            size="large"
            icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
            // onClick={onExport}
            onClick={() => {
              setShowExportModal(true);
            }}
          >
            Xuất file
          </Button>
          <Button
            type="primary"
            onClick={() => history.push(UrlConfig.WARRANTY + "/create")}
            style={{ marginLeft: 20 }}
          >
            Thêm mới yêu cầu bảo hành
          </Button>
        </>
      }
    >
      <StyledComponent>
        <Card className="card-tab">
          <Tabs
            onTabClick={(key: any) => {
              let newPrams = {
                tab: key,
              };
              let queryParam = generateQuery(newPrams);
              history.push(`${location.pathname}?${queryParam}`);
            }}
            defaultActiveKey={query.tab}
            key={query.tab}
          >
            {TAB_STATUS.map(({ key, name, labelColor }, index: number) => {
              return (
                <TabPane
                  key={key}
                  tab={
                    <React.Fragment>
                      <span>{name}</span>
                      <span className="number" style={{ background: labelColor }}>
                        {warrantyCountState[index] || 0}
                      </span>
                    </React.Fragment>
                  }
                >
                  <WarrantyFilter
                    actions={actions}
                    params={query}
                    stores={stores}
                    isLoading={false}
                    onFilter={onFilter}
                    onMenuClick={onMenuClick}
                    onShowColumnSetting={() => setIsShowSettingColumn(true)}
                  />
                  <CustomTable
                    isRowSelection
                    rowSelectionWidth={"3.5%"}
                    dataSource={data}
                    selectedRowKey={selectedRowKeys}
                    onSelectedChange={onSelectedChange}
                    rowKey={(item: WarrantyItemModel) => item.id}
                    bordered
                    columns={columnFinal}
                    pagination={{
                      pageSize: metaDataShow?.limit,
                      total: metaDataShow?.total,
                      current: metaDataShow?.page,
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
      <WarrantyReasonsPriceModal
        visible={isFeeModalVisible}
        onCancel={() => setIsFeeModalVisible(false)}
        onOk={handleOkFeeModal}
        initialFormValues={{
          customer_fee: selectedData.customer_fee,
        }}
        record={rowSelected.current?.record}
      />
      <NoteModal
        visible={isNoteModalVisible}
        onCancel={() => setIsNoteModalVisible(false)}
        onOk={(values: any) => {
          handleOkNoteModal(values);
        }}
        initialFormValues={{
          note: selectedData.note,
        }}
        record={rowSelected.current?.record}
      />
      <WarrantyStatusModal
        visible={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        onOk={(values: any) => {
          handleOkStatusModal(values);
        }}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        record={rowSelected.current?.record}
        filteredPaymentMethod={filteredPaymentMethod}
        initialFormValues={{
          status: selectedData.status,
          return_status: selectedData.return_status,
          payment_method_id: undefined,
          value: rowSelected.current?.record?.customer_fee || 0,
        }}
      />
      <WarrantyCenterModal
        visible={isWarrantyCenterModalVisible}
        onCancel={() => setIsWarrantyCenterModalVisible(false)}
        onOk={handleOkWarrantyCenterModal}
        warrantyCenters={warrantyCenters}
        initialFormValues={{
          warranty_center_id: selectedData.warranty_center_id,
        }}
        record={rowSelected.current?.record}
      />
      <ModalDeleteConfirm
        visible={isDeleteConfirmModalVisible}
        onOk={handleOkDeleteModal}
        onCancel={() => setIsDeleteConfirmModalVisible(false)}
        title="Xác nhận xóa"
        subTitle={confirmDeleteSubTitle}
      />
      <AppointmentDateModal
        visible={isAppointmentDateModalVisible}
        onCancel={() => setIsAppointmentDateModalVisible(false)}
        onOk={(values: any) => handleOkAppointmentDateModal(values)}
        initialFormValues={{
          appointment_date: selectedData?.appointment_date
            ? moment(selectedData.appointment_date, DATE_FORMAT.DD_MM_YYYY)
            : undefined,
        }}
        record={rowSelected.current?.record}
      />
      <ReasonModal
        visible={isReasonModalVisible}
        onCancel={() => setIsReasonModalVisible(false)}
        onOk={(values: any) => handleOkReasonModal(values)}
        warrantyReasons={warrantyReasons}
        initialFormValues={{
          reason_ids: selectedData.reason_ids,
        }}
        record={rowSelected.current?.record}
      />
      <ModalSettingColumn
        visible={isShowSettingColumn}
        onCancel={() => setIsShowSettingColumn(false)}
        onOk={(data) => {
          console.log("data", data);
          setIsShowSettingColumn(false);
          setColumns(data);
        }}
        data={columns}
      />
      {showExportModal && (
        <ExportModal
          visible={showExportModal}
          onCancel={() => {
            setShowExportModal(false);
            setExportProgress(0);
            setStatusExport(1);
          }}
          onOk={(optionExport) => onExport(optionExport)}
          type="warranty"
          total={metaDataShow?.total}
          exportProgress={exportProgress}
          statusExport={statusExport}
          selected={selectedRowKeys.length ? true : false}
        />
      )}
    </ContentContainer>
  );
}

export default withRouter(WarrantyHistoryList);
