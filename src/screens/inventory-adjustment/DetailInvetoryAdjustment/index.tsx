import {createRef, FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {StyledWrapper} from "./styles";
import exportIcon from "assets/icon/export.svg";
import UrlConfig, {BASE_NAME_ROUTER, InventoryTabUrl} from "config/url.config";
import {Button, Card, Col, Row, Space, Tag, Input, Tabs, Upload} from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import PlusOutline from "assets/icon/plus-outline.svg";
import {
  PaperClipOutlined,
  PrinterOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import BottomBarContainer from "component/container/bottom-bar.container";
import {useHistory, useParams} from "react-router";
import {useDispatch} from "react-redux";
import {
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {
  InventoryAdjustmentDetailItem, 
  LineItemAdjustment,
} from "model/inventoryadjustment";
import {Link} from "react-router-dom";
import ContentContainer from "component/container/content.container";
import InventoryAdjustmentTimeLine from "./conponents/InventoryAdjustmentTimeLine";
import {VariantResponse} from "model/product/product.model";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import {showError, showSuccess} from "utils/ToastUtils";
import ProductItem from "screens/purchase-order/component/product-item";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import _, {parseInt} from "lodash";
import {
  INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY,
  STATUS_INVENTORY_ADJUSTMENT,
} from "../ListInventoryAdjustment/constants";
import {PageResponse} from "model/base/base-metadata.response";
import InventoryAdjustmentHistory from "./conponents/InventoryAdjustmentHistory";
import InventoryAdjustmentListAll from "./conponents/InventoryAdjustmentListAll";
import {
  adjustInventoryAction,
  getDetailInventoryAdjustmentAction,
  getLinesItemAdjustmentAction,
  InventoryAdjustmentGetPrintContentAction,
  updateItemOnlineInventoryAction,
  updateOnlineInventoryAction,
} from "domain/actions/inventory/inventory-adjustment.action";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import {STATUS_INVENTORY_ADJUSTMENT_CONSTANTS} from "../constants";
import {HttpStatus} from "config/http-status.config";

import {UploadRequestOption} from "rc-upload/lib/interface";
import InventoryTransferExportModal from "./conponents/ExportModal";
import {useReactToPrint} from "react-to-print";
import {generateQuery} from "utils/AppUtils";
import purify from "dompurify";
import {AccountResponse} from "model/account/account.model";
import {AccountSearchAction} from "domain/actions/account/account.action";
import {StyledComponent} from "screens/products/product/component/RowDetail/style";
import ModalConfirm from "component/modal/ModalConfirm";
import {StoreResponse} from "model/core/store.model";
import {ConvertFullAddress} from "utils/ConvertAddress";
import {UploadFile} from "antd/lib/upload/interface";
import InventoryTransferImportModal from "./conponents/ImportModal";
import {importFile, exportFile, getFile} from "service/other/import.inventory.service";
import {ImportResponse} from "model/other/files/export-model";
import NumberInput from "component/custom/number-input.custom";
import AuthWrapper from "component/authorization/AuthWrapper";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import useAuthorization from "hook/useAuthorization";

const {TabPane} = Tabs;

export interface InventoryParams {
  id: string;
}

export interface SummaryData {
  total: number;
  partly: number;
}

export interface Summary {
  TotalExcess: number | 0;
  TotalMiss: number | 0;
  TotalOnHand: number | 0;
  TotalRealOnHand: number | 0;
}
export const STATUS_IMPORT_EXPORT = {
  DEFAULT: 1,
  CREATE_JOB_SUCCESS: 2,
  JOB_FINISH: 3,
  ERROR: 4,
};

const DetailInvetoryAdjustment: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<InventoryAdjustmentDetailItem>();
  const [isShowConfirmAdited, setIsShowConfirmAdited] = useState<boolean>(false);
  const [isShowConfirmAdj, seIsShowConfirmAdj] = useState<boolean>(false);

  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();

  const {id} = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [keySearch, setKeySearch] = useState<string>("");
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [objSummary, setObjSummary] = useState<SummaryData>();
  const [hasError, setHasError] = useState<boolean>(false);

  const [printContent, setPrintContent] = useState("");
  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.DEFAULT);

  const [listJobImportFile, setListJobImportFile] = useState<Array<string>>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [statusImport, setStatusImport] = useState<number>(1);
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [dataImport, setDataImport] = useState<ImportResponse>();
  const [hasImportUrl, setHasImportUrl] = useState<boolean>(false);

  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [formStoreData, setFormStoreData] = useState<StoreResponse | null>();
  const [dataLinesItem, setDatalinesItem] = useState<PageResponse<LineItemAdjustment>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [tableLoading, setTableLoading] = useState(true);

  const [objSummaryTable, setObjSummaryTable] = useState<Summary>({
    TotalExcess: 0,
    TotalMiss: 0,
    TotalOnHand: 0,
    TotalRealOnHand: 0,
  });  

  //phân quyền
  const [allowUpdate] = useAuthorization({
    acceptPermissions: [InventoryAdjustmentPermission.update],
  });

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();

  const onSearchProduct = (value: string) => {
    const storeId = data?.adjusted_store_id;
    if (!storeId) {
      showError("Vui lòng chọn kho gửi");
      return;
    } else if (value.trim() !== "" && value.length >= 3) {
      dispatch(
        inventoryGetVariantByStoreAction(
          {
            status: "active",
            limit: 10,
            page: 1,
            store_ids: storeId,
            info: value.trim(),
          },
          setResultSearch
        )
      );
    }
  };

  let textTag = "";
  let classTag = "";
  switch (data?.status) {
    case STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status:
      textTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.name;
      classTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status;
      break;
    case STATUS_INVENTORY_ADJUSTMENT.AUDITED.status:
      textTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.name;
      classTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.status;
      break;
    default:
      textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
      classTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.status;
      break;
  }

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem isTransfer data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const drawColumns = useCallback((data: Array<LineItemAdjustment> | any) => {
    let totalExcess = 0,
      totalMiss = 0,
      totalQuantity = 0,
      totalReal = 0;
    data.forEach((element: LineItemAdjustment) => {
      totalQuantity += element.on_hand;
      totalReal += parseInt(element.real_on_hand.toString()) ?? 0;
      let on_hand_adj = element.on_hand_adj ?? 0;
      if (on_hand_adj > 0) {
        totalExcess += on_hand_adj;
      }
      if (on_hand_adj < 0) {
        totalMiss += -on_hand_adj;
      }
    });

    setObjSummaryTable({
      TotalOnHand: totalQuantity,
      TotalExcess: totalExcess,
      TotalMiss: totalMiss,
      TotalRealOnHand: totalReal,
    });
  }, []);

  const onResultDataTable = useCallback(
    (result: PageResponse<LineItemAdjustment> | false) => {
      setTableLoading(true);
      if (result) {
        setDatalinesItem({...result});
        drawColumns(result?.items);
        setHasError(false);
        if (result?.items && result?.items.length > 0) {
          let dataDis = 0;
          result.items.forEach((e: LineItemAdjustment) => {
            if (e.on_hand_adj !== 0) {
              dataDis += 1;
            }
          });
          let total = result.items.length;

          setObjSummary({
            partly: dataDis,
            total: total,
          });
        }
        setTableLoading(false);
      }
    },
    [drawColumns]
  );

  const onSelectProduct = useCallback(
    (value: string) => {
      const dataTemp = [...dataLinesItem.items];
      let selectedItem = resultSearch?.items?.find(
        (variant: VariantResponse) => variant.id.toString() === value
      );

      if (
        !dataTemp.some((variant: LineItemAdjustment) => variant.id === selectedItem.id)
      ) {
        selectedItem = {
          ...selectedItem,
          variant_id: selectedItem.id,
          variant_name: selectedItem.name,
          real_on_hand: 0,
          on_hand_adj: 0 - (selectedItem.on_hand ?? 0),
          on_hand_adj_dis: (0 - (selectedItem.on_hand ?? 0)).toString(),
        };

        setHasError(false);

        dispatch(
          updateItemOnlineInventoryAction(idNumber, selectedItem, (result) => {
            if (result) {
              dispatch(
                getLinesItemAdjustmentAction(
                  idNumber,
                  `page=1&limit=30&condition=${keySearch?.toLocaleLowerCase()}`,
                  onResultDataTable
                )
              );
            }
          })
        );
      }
    },
    [dataLinesItem.items, resultSearch, keySearch, idNumber, dispatch, onResultDataTable]
  );

  const onPickManyProduct = useCallback(
    (result: Array<VariantResponse>) => {
      const newResult = result?.map((item) => {
        return {
          ...item,
          variant_id: item.id,
          variant_name: item.name,
          real_on_hand: 0,
          on_hand_adj: 0 - (item.on_hand ?? 0),
          on_hand_adj_dis: (0 - (item.on_hand ?? 0)).toString(),
        };
      });
      const dataTemp = [...dataLinesItem.items, ...newResult];

      const arrayUnique = [...new Map(dataTemp.map((item) => [item.id, item])).values()];
      setTableLoading(true);

      arrayUnique.forEach((item) => {
        dispatch(
          updateItemOnlineInventoryAction(idNumber, item, () => {
            if (result) {
              dispatch(
                getLinesItemAdjustmentAction(
                  idNumber,
                  `page=1&limit=30&condition=${keySearch?.toLocaleLowerCase()}`,
                  onResultDataTable
                )
              );
            }
          })
        );
      });

      setTableLoading(false);
      setHasError(false);
      setVisibleManyProduct(false);
    },
    [dispatch, keySearch, idNumber, dataLinesItem.items, onResultDataTable]
  );

  const pageBreak = "<div class='pageBreak'></div>";
  const printContentCallback = useCallback(
    (printContent) => {
      const textResponse = printContent.map((single: any) => {
        return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint]
  );

  const onBeforeUpload = useCallback((file) => {}, []);

  const onCustomRequest = (options: UploadRequestOption<any>) => {
    const {file} = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      dispatch(
        inventoryUploadFileAction({files: files}, (data: false | Array<string>) => {
          let index = fileList.findIndex((item) => item.uid === uuid);
          if (!!data) {
            if (index !== -1) {
              fileList[index].status = "done";
              fileList[index].url = data[0];
            }
            setHasImportUrl(true);
          } else {
            fileList.splice(index, 1);
            showError("Upload ảnh không thành công");
          }
          setFileList([...fileList]);
        })
      );
    }
  };

  const onChangeFile = useCallback((info) => {
    setFileList([info.file]);
    setShowImportModal(true);
  }, []);

  const onPrintAction = () => {
    if (data) {
      let params = {
        ids: data.id,
        type: "inventory_transfer_bill",
      };
      const queryParam = generateQuery(params);
      dispatch(
        InventoryAdjustmentGetPrintContentAction(queryParam, printContentCallback)
      );
    }
  };

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: string, record: VariantResponse, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_image",
      render: (value: string, record: any) => {
        return (
          <div className="product-item-image">
            <img src={value ? value : imgDefIcon} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: "Sản phẩm",
      width: "200px",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: VariantResponse, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${InventoryTabUrl.HISTORIES}?condition=${record.sku}&store_ids=${data?.adjusted_store_id}&page=1`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: () => {
        return (
          <>
            <div>Tồn trong kho</div>
            <div>{objSummaryTable.TotalOnHand}</div>
          </>
        );
      },
      width: 100,
      align: "center",
      dataIndex: "on_hand",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Tồn thực tế</div>
            <div>{objSummaryTable.TotalRealOnHand}</div>
          </>
        );
      },
      dataIndex: "real_on_hand",
      align: "center",
      width: 100,
      render: (value, row: LineItemAdjustment, index: number) => {
        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT && allowUpdate) {
          return (
            <NumberInput
              min={0}
              maxLength={12}
              value={value}
              onChange={(value) => {
                onRealQuantityChange(value, row, index);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  let value = event.target.value;
                  row.real_on_hand = value ?? 0;
                  let totalDiff = 0;
                  totalDiff = value - row.on_hand;
                  if (totalDiff === 0) {
                    row.on_hand_adj = null;
                    row.on_hand_adj_dis = null;
                  } else if (row.on_hand < value) {
                    row.on_hand_adj = totalDiff;
                    row.on_hand_adj_dis = `+${totalDiff}`;
                  } else if (row.on_hand > value) {
                    row.on_hand_adj = totalDiff;
                    row.on_hand_adj_dis = `${totalDiff}`;
                  }

                  dispatch(
                    updateItemOnlineInventoryAction(data?.id, row, (result) => {
                      if (result) {
                        showSuccess("Nhập tồn thực tế thành công.");
                        onEnterFilterVariant(null);
                      }
                    })
                  );
                }
              }}
            />
          );
        } else {
          return value ?? "";
        }
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Thừa/Thiếu</div>
            <Row align="middle" justify="center">
              {objSummaryTable.TotalExcess === 0 ? (
                ""
              ) : (
                <div style={{color: "#27AE60"}}>+{objSummaryTable.TotalExcess}</div>
              )}
              {objSummaryTable.TotalExcess && objSummaryTable.TotalMiss ? (
                <Space>/</Space>
              ) : (
                ""
              )}
              {objSummaryTable.TotalMiss === 0 ? (
                ""
              ) : (
                <div style={{color: "red"}}>-{objSummaryTable.TotalMiss}</div>
              )}
            </Row>
          </>
        );
      },
      align: "center",
      width: 200,
      render: (value, item, index: number) => {
        if (!item.on_hand_adj || item.on_hand_adj === 0) {
          return null;
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{color: "red"}}>{item.on_hand_adj}</div>;
        } else {
          return <div style={{color: "green"}}>+{item.on_hand_adj}</div>;
        }
      },
    },
  ];

  const onResult = useCallback(
    (result) => {
      setLoading(true);
      if (!result) {
        setError(true);
        return;
      } else {
        setLoading(false);
        let data: InventoryAdjustmentDetailItem = result;
        setHasError(false);
        setFormStoreData(data?.store);
        setData(data);

        dispatch(
          getLinesItemAdjustmentAction(
            idNumber,
            `page=1&limit=30&condition=${keySearch?.toString()}`,
            onResultDataTable
          )
        );
      }
    },
    [idNumber, keySearch, onResultDataTable, dispatch]
  );

  const onUpdateOnlineInventory = useCallback(() => {
    setLoading(true);
    dispatch(
      updateOnlineInventoryAction(data?.id ?? 0, (result) => {
        setLoading(false);
        if (result) {
          onResult(result);
          showSuccess("Hoàn thành kiểm kho thành công.");
          setIsShowConfirmAdited(false);
        }
      })
    );
  }, [data, dispatch, onResult]);

  const onAdjustInventory = useCallback(() => {
    setLoading(true);
    dispatch(
      adjustInventoryAction(data?.id ?? 0, (result) => {
        setLoading(false);
        if (result) {
          onResult(result);
          showSuccess("Cân tồn kho thành công.");
          seIsShowConfirmAdj(false);
        }
      })
    );
  }, [dispatch, data?.id, onResult]);

  const onEnterFilterVariant = useCallback(
    (lst: Array<LineItemAdjustment> | null) => {
      setTableLoading(true);
      dispatch(
        getLinesItemAdjustmentAction(
          idNumber,
          `page=1&limit=30&condition=${keySearch?.toLocaleLowerCase()}`,
          onResultDataTable
        )
      );
      setTableLoading(false);
    },
    [keySearch, dispatch, idNumber, onResultDataTable]
  );

  type accountAudit = {
    user_name: string;
  };

  const RenderItemAuditBy = useCallback(
    (auditBY: accountAudit) => {
      const account = accounts.find(
        (e) => e.code.toLocaleLowerCase() === auditBY.user_name.toLocaleLowerCase()
      );

      return <div>{`${account?.code} - ${account?.full_name}`}</div>;
    },
    [accounts]
  );

  const onRealQuantityChange = useCallback(
    (quantity: number | any, row: LineItemAdjustment, index: number) => {
      const dataTableClone: Array<LineItemAdjustment> = _.cloneDeep(dataLinesItem.items);

      dataTableClone.forEach((item) => {
        quantity = quantity ?? 0;

        if (item.id === row.id) {
          item.real_on_hand = quantity;
          let totalDiff = 0;
          totalDiff = quantity - item.on_hand;
          if (totalDiff === 0) {
            item.on_hand_adj = null;
            item.on_hand_adj_dis = null;
          } else if (item.on_hand < quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `+${totalDiff}`;
          } else if (item.on_hand > quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `${totalDiff}`;
          }
        }
      });
    },
    [dataLinesItem.items]
  );

  type RowDetailProps = {
    label: string;
    value: string | null;
  };

  const RenderRowInfo = (info: RowDetailProps) => {
    return (
      <>
        <Row className="row-detail">
          <Col flex="90px" className="row-detail-left label">
            {info.label} <Col className="dot">:</Col>
          </Col>
          <Col flex="auto" className="row-detail-right data">
            <b>{info?.value}</b>
          </Col>
        </Row>
      </>
    );
  };

  const onPageChange = useCallback(
    (page, size) => {
      setDatalinesItem({
        ...dataLinesItem,
        metadata: {...dataLinesItem.metadata, page: page, limit: size},
      });

      dispatch(
        getLinesItemAdjustmentAction(
          idNumber,
          `page=${page}&limit=${size}&condition=${keySearch?.toString()}`,
          onResultDataTable
        )
      );
    },
    [dataLinesItem, dispatch, idNumber, keySearch, onResultDataTable]
  );

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));
  }, [idNumber, onResult, dispatch, setDataAccounts]);

  const onExport = useCallback(() => {
    exportFile({
      conditions: data?.id.toString(),
      type: "EXPORT_INVENTORY_ADJUSTMENT",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch((error) => {
        setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [data?.id, listExportFile]);

  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.percent) {
            setExportProgress(response.data.percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();

            setListExportFile(newListExportFile);
          }
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const onImport = useCallback(() => {
    importFile({
      url: fileList[0].url,
      conditions: data?.id.toString(),
      type: "IMPORT_INVENTORY_ADJUSTMENT",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusImport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
          showSuccess("Đã gửi yêu cầu nhập file");
          setListJobImportFile([...listJobImportFile, response.data.code]);
        }
      })
      .catch((error) => {
        setStatusImport(STATUS_IMPORT_EXPORT.ERROR);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [data?.id, fileList, listJobImportFile]);

  const checkImportFile = useCallback(() => {
    if (statusImport !== STATUS_IMPORT_EXPORT.DEFAULT) {
      let getFilePromises = listJobImportFile.map((code) => {
        return getFile(code);
      });
      Promise.all(getFilePromises).then((responses) => {
        responses.forEach((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setDataImport(response.data);
            if (response.data.percent) {
              setImportProgress(response.data.percent);
            }
            if (response.data && response.data.status === "FINISH") {
              if (!response.data.percent) {
                setImportProgress(100);
              }

              setStatusImport(STATUS_IMPORT_EXPORT.JOB_FINISH);
              dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));
            }
            if (response.data && response.data.status === "ERROR") {
              setStatusImport(STATUS_IMPORT_EXPORT.ERROR);
            }
          }
        });
      });
    }
  }, [dispatch, idNumber, listJobImportFile, onResult, statusImport]);

  useEffect(() => {
    if (
      listJobImportFile.length === 0 ||
      statusImport === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusImport === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkImportFile();

    const getFileInterval = setInterval(checkImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listJobImportFile, statusImport, checkImportFile]);

  return (
    <StyledWrapper>
      <ContentContainer
        isError={isError}
        isLoading={isLoading}
        title={`Kiểm kho ${data?.code}`}
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Kiểm kho",
            path: `${UrlConfig.INVENTORY_ADJUSTMENTS}`,
          },
          {
            name: `${data?.code}`,
          },
        ]}
        extra={
          <InventoryAdjustmentTimeLine
            status={data?.status}
            inventoryAdjustmentDetail={data}
          />
        }
      >
        {data && (
          <>
            <Row gutter={24}>
              <Col span={18}>
                <Card
                  title="KHO HÀNG"
                  bordered={false}
                  extra={
                    <Space size={20}>
                      <span>
                        <b>Loại kiểm:</b>
                      </span>
                      <span>
                        {INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find(
                          (e) => e.value === data.audit_type
                        )?.name ?? ""}
                      </span>
                    </Space>
                  }
                >
                  {formStoreData && (
                    <Row className="pd16">
                      <Col span={31}>
                        <>
                          <span>
                            <b>{formStoreData?.name}:</b>
                          </span>{" "}
                          {formStoreData?.code} - {formStoreData?.hotline} -{" "}
                          {ConvertFullAddress(formStoreData)}
                        </>
                      </Col>
                    </Row>
                  )}
                </Card>
                {
                  //case trạng thái
                  data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status ||
                  data.status === STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status ? (
                    <Card>
                      <Tabs
                        style={{overflow: "initial"}}
                        activeKey={activeTab}
                        onChange={(active) => setActiveTab(active)}
                      >
                        <TabPane tab={`Thừa/Thiếu (${objSummary?.partly})`} key="1">
                          <InventoryAdjustmentHistory
                            data={data}
                            dataLinesItem={dataLinesItem.items}
                          />
                        </TabPane>
                        <TabPane tab={`Tất cả (${objSummary?.total})`} key="2">
                          <InventoryAdjustmentListAll
                            data={data}
                            dataLinesItem={dataLinesItem.items}
                          />
                        </TabPane>
                      </Tabs>
                    </Card>
                  ) : (
                    <Card title="Thông tin sản phẩm" bordered={false}>
                      <AuthWrapper
                        acceptPermissions={[InventoryAdjustmentPermission.update]}
                      >
                        <Input.Group style={{paddingTop: 16}} className="display-flex">
                          <CustomAutoComplete
                            id="#product_search_variant"
                            dropdownClassName="product"
                            placeholder="Thêm sản phẩm vào phiếu kiểm"
                            onSearch={onSearchProduct}
                            dropdownMatchSelectWidth={456}
                            style={{width: "100%"}}
                            showAdd={true}
                            textAdd="Thêm mới sản phẩm"
                            onSelect={onSelectProduct}
                            options={renderResult}
                            ref={productSearchRef}
                            onClickAddNew={() => {
                              window.open(
                                `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                                "_blank"
                              );
                            }}
                          />
                          <Button
                            onClick={() => {
                              setVisibleManyProduct(true);
                              return;
                            }}
                            style={{width: 132, marginLeft: 10}}
                            icon={<img src={PlusOutline} alt="" />}
                          >
                            &nbsp;&nbsp; Chọn nhiều
                          </Button>

                          <Input
                            name="key_search"
                            value={keySearch}
                            onChange={(e) => {
                              setKeySearch(e.target.value);
                            }}
                            onKeyPress={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                onEnterFilterVariant(null);
                              }
                            }}
                            style={{marginLeft: 8}}
                            placeholder="Tìm kiếm sản phẩm trong phiếu"
                            addonAfter={
                              <SearchOutlined
                                onClick={() => {
                                  onEnterFilterVariant(null);
                                }}
                                style={{color: "#2A2A86"}}
                              />
                            }
                          />
                        </Input.Group>
                      </AuthWrapper>
                      <CustomTable
                        isLoading={tableLoading}
                        tableLayout="fixed"
                        style={{paddingTop: 20}}
                        scroll={{y: 300}}
                        columns={defaultColumns}
                        pagination={{
                          pageSize: dataLinesItem.metadata.limit,
                          total: dataLinesItem.metadata.total,
                          current: dataLinesItem.metadata.page,
                          showSizeChanger: true,
                          onChange: onPageChange,
                          onShowSizeChange: onPageChange,
                        }}
                        dataSource={dataLinesItem.items}
                        rowKey={(item: LineItemAdjustment) => item.id}
                      />
                    </Card>
                  )
                }
              </Col>
              <Col span={6}>
                <Card
                  title={"THÔNG TIN PHIẾU"}
                  bordered={false}
                  className={"inventory-info"}
                  extra={<Tag className={classTag}>{textTag}</Tag>}
                >
                  <Col>
                    <RenderRowInfo label="ID Phiếu" value={data.code} />
                    <RenderRowInfo
                      label="Người tạo"
                      value={`${data?.created_name} - ${data.created_by}`}
                    />
                    <RenderRowInfo label="Người kiểm" value="" />
                    {
                      <StyledComponent>
                        <Row className="audit_by">
                          <Col span={24}>
                            {data.audited_by?.map((item: string) => {
                              return (
                                <RenderItemAuditBy
                                  key={item?.toString()}
                                  user_name={item?.toString()}
                                />
                              );
                            })}
                          </Col>
                        </Row>
                      </StyledComponent>
                    }
                  </Col>
                </Card>
                <Card title={"GHI CHÚ"} bordered={false} className={"inventory-note"}>
                  <Row className="" gutter={5} style={{flexDirection: "column"}}>
                    <Col span={24} style={{marginBottom: 6}}>
                      <b>Ghi chú nội bộ:</b>
                    </Col>
                    <Col span={24}>
                      <span className="text-focus" style={{wordWrap: "break-word"}}>
                        {data?.note !== "" && data?.note !== "string"
                          ? data?.note
                          : "Không có ghi chú"}
                      </span>
                    </Col>
                  </Row>

                  <Row
                    className="margin-top-10"
                    gutter={5}
                    style={{flexDirection: "column"}}
                  >
                    <Col span={24} style={{marginBottom: 6}}>
                      <b>File đính kèm:</b>
                    </Col>
                    <Col span={24}>
                      <span className="text-focus">
                        {data.attached_files?.map((link: string, index: number) => {
                          return (
                            <a
                              key={index}
                              className="file-pin"
                              target="_blank"
                              rel="noreferrer"
                              href={link}
                            >
                              <PaperClipOutlined /> {link}
                            </a>
                          );
                        })}
                      </span>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <div style={{display: "none"}}>
              <Upload fileList={fileList}></Upload>
              <div className="printContent" ref={printElementRef}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: purify.sanitize(printContent),
                  }}
                ></div>
              </div>
            </div>
            <BottomBarContainer
              leftComponent={
                <div
                  onClick={() => history.push(`${UrlConfig.INVENTORY_ADJUSTMENTS}`)}
                  style={{cursor: "pointer"}}
                >
                  <img style={{marginRight: "10px"}} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  {data.status !== STATUS_INVENTORY_ADJUSTMENT.DRAFT.status && (
                    <AuthWrapper
                      acceptPermissions={[InventoryAdjustmentPermission.print]}
                    >
                      <Button
                        type="default"
                        onClick={() => {
                          onPrintAction();
                        }}
                      >
                        <Space>
                          <PrinterOutlined /> In phiếu
                        </Space>
                      </Button>
                    </AuthWrapper>
                  )}
                  {data.status === STATUS_INVENTORY_ADJUSTMENT.DRAFT.status ? (
                    <>
                      <AuthWrapper
                        acceptPermissions={[InventoryAdjustmentPermission.import]}
                      >
                        <Upload
                          beforeUpload={onBeforeUpload}
                          multiple={false}
                          showUploadList={false}
                          onChange={onChangeFile}
                          customRequest={onCustomRequest}
                        >
                          <Button icon={<UploadOutlined />}>Nhập excel</Button>
                        </Upload>
                      </AuthWrapper>
                      <AuthWrapper
                        acceptPermissions={[InventoryAdjustmentPermission.export]}
                      >
                        <Button
                          type="default"
                          className="light"
                          size="large"
                          icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                          onClick={() => {
                            setShowExportModal(true);
                            onExport();
                          }}
                        >
                          Xuất excel
                        </Button>
                      </AuthWrapper>
                      <AuthWrapper
                        acceptPermissions={[InventoryAdjustmentPermission.audit]}
                      >
                        <Button
                          type="primary"
                          onClick={() => {
                            setIsShowConfirmAdited(true);
                          }}
                          loading={isLoading}
                          disabled={hasError || isLoading}
                        >
                          Hoàn thành kiểm
                        </Button>
                      </AuthWrapper>
                    </>
                  ) : null}
                  {data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status ? (
                    <AuthWrapper
                      acceptPermissions={[InventoryAdjustmentPermission.adjust]}
                    >
                      <Button
                        type="primary"
                        onClick={() => {
                          seIsShowConfirmAdj(true);
                        }}
                        loading={isLoading}
                        disabled={hasError || isLoading}
                      >
                        Cân tồn kho
                      </Button>
                    </AuthWrapper>
                  ) : null}
                </Space>
              }
            />
            {showExportModal && (
              <InventoryTransferExportModal
                visible={showExportModal}
                onCancel={() => {
                  setShowExportModal(false);
                  setExportProgress(0);
                  setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
                }}
                onOk={() => onExport()}
                exportProgress={exportProgress}
                statusExport={statusExport}
              />
            )}
            {showImportModal && (
              <InventoryTransferImportModal
                visible={showImportModal}
                onImport={onImport}
                dataImport={dataImport}
                hasImportUrl={hasImportUrl}
                onCancel={() => {
                  setShowImportModal(false);
                  setImportProgress(0);
                  setListJobImportFile([]);
                  setStatusImport(STATUS_IMPORT_EXPORT.DEFAULT);
                  setFileList([]);
                }}
                importProgress={importProgress && importProgress}
                statusImport={statusImport}
                fileList={fileList}
              />
            )}
            {visibleManyProduct && (
              <PickManyProductModal
                storeID={data?.adjusted_store_id}
                selected={dataLinesItem.items}
                isTransfer
                onSave={onPickManyProduct}
                onCancel={() => setVisibleManyProduct(false)}
                visible={visibleManyProduct}
              />
            )}
            {isShowConfirmAdited && (
              <ModalConfirm
                onCancel={() => {
                  setIsShowConfirmAdited(false);
                }}
                onOk={() => {
                  onUpdateOnlineInventory();
                }}
                okText="Đồng ý"
                cancelText="Hủy"
                title={`Bạn có chắc chắn Hoàn thành kiểm?`}
                subTitle='Phiếu kiểm kho sẽ chuyển sang trạng thái "Đã kiểm" và không thể thay đổi số lượng thực tồn.'
                visible={isShowConfirmAdited}
              />
            )}

            {isShowConfirmAdj && (
              <ModalConfirm
                onCancel={() => {
                  seIsShowConfirmAdj(false);
                }}
                onOk={() => {
                  onAdjustInventory();
                }}
                okText="Đồng ý"
                cancelText="Hủy"
                title={`Bạn có chắc chắn Cân tồn kho?`}
                subTitle='Phiếu kiểm kho sẽ chuyển sang trạng thái "Đã cân tồn" và tính toán lại tồn kho.'
                visible={isShowConfirmAdj}
              />
            )}
          </>
        )}
      </ContentContainer>
    </StyledWrapper>
  );
};

export default DetailInvetoryAdjustment;