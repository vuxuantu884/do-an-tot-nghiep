import { Button, Card, Table, Input, Form, FormInstance } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { FulfillmentsItemModel, GoodsReceiptsOrderListModel } from "model/pack/pack.model";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from "assets/img/search.svg";
import { StyledComponent } from "../../index.screen.styles";
import EditNote from "screens/order-online/component/edit-note";
// import { OrderModel } from "model/order/order.model";
import { useDispatch } from "react-redux";
import { updateOrderPartial } from "domain/actions/order/order.action";
import { formatCurrency, handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
import { fullTextSearch } from "utils/StringUtils";
import {
  FileExcelOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { exportFile, getFile } from "service/other/export.service";
import { generateQuery } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { HttpStatus } from "config/http-status.config";
// import { hideLoading, showLoading } from "domain/actions/loading.action";
// import { changeOrderStatusToPickedService } from "service/order/order.service";

const { Item } = Form;
type PackListOrderProps = {
  packOrderList: GoodsReceiptsOrderListModel[];
  packDetail: GoodsReceiptsResponse | undefined;
};

// interface GoodReceiptPrint {
//   good_receipt_id: number;
//   html_content: string;
//   size: string;
// }

const actions: Array<MenuAction> = [
  // {
  //   id: 1,
  //   name: "In biên bản đầy đủ",
  //   icon: <PrinterOutlined />,
  // },
  // {
  //   id: 2,
  //   name: "In biên bản rút gọn",
  //   icon: <PrinterOutlined />,
  // },
  {
    id: 3,
    name: "Xuất excel đơn hàng trong biên bản",
    icon: <FileExcelOutlined />,
  },
  // {
  //   id: 4,
  //   name: "Thêm/xoá đơn hàng vào biên bản",
  //   icon: <ReconciliationOutlined />,
  // },
  {
    id: 5,
    name: "In phiếu giao hàng",
    icon: <PrinterOutlined />,
  },
  {
    id: 6,
    name: "In phiếu xuất kho",
    icon: <PrinterOutlined />,
  }
];

// const typePrint = {
//   simple: "simple",
//   detail: "detail"
// }

var barcode: string = "";

const PackListOrder: React.FC<PackListOrderProps> = (props: PackListOrderProps) => {
  const { packOrderList, packDetail } = props;
  const dispatch = useDispatch();
  const formSearchOrderRef = createRef<FormInstance>();
  const history = useHistory();

  //Ref
  const printElementRef = React.useRef(null);
  const searchTermRef = createRef<Input>();

  const [dataPackOrderList, setDataPackOrderList] = useState<GoodsReceiptsOrderListModel[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowOrderId, setSelectedRowOrderId] = useState([]);

  // const [htmlContent, setHtmlContent] = useState("");

  // const handlePrint = useReactToPrint({
  //   content: () => printElementRef.current,
  // });
  const [statusExport, setStatusExport] = useState<number>(1);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);

  const handleSearchOrder = useCallback(
    (query?: string) => {

      if (!query || query.length <= 0) {
        setDataPackOrderList([...packOrderList])
      } else {
        let newData: GoodsReceiptsOrderListModel[] = packOrderList.filter(function (el) {
          // return el.order_code.toLowerCase().indexOf(query.toLowerCase()) !== -1
          return fullTextSearch(query, el.order_code)
            || (el.ffm_code && fullTextSearch(query, el.ffm_code))
            || (el.tracking_code && fullTextSearch(query, el.tracking_code));
        })
        setDataPackOrderList(newData);
      }

    },
    [packOrderList],
  )

  const handleSearch = useCallback(
    () => {
      let query: string = formSearchOrderRef.current?.getFieldValue("search_term");

      handleSearchOrder(query)
    },
    [formSearchOrderRef, handleSearchOrder],
  )

  const onSuccessEditNote = useCallback(
    (newNote, noteType, orderID) => {
      const dataPackOrderListCopy = [...dataPackOrderList]
      const indexOrder = dataPackOrderListCopy.findIndex((item) => item.order_id === orderID);
      if (indexOrder !== -1) {
        if (noteType === "note") {
          dataPackOrderListCopy[indexOrder].note = newNote;
        }
        else if (noteType === "customer_note") {
          dataPackOrderListCopy[indexOrder].customer_note = newNote
        }
      }
      setDataPackOrderList([...dataPackOrderListCopy]);
    },
    [dataPackOrderList]
  );

  const editNote = useCallback(
    (newNote, noteType, orderID) => {
      if (newNote && newNote.length > 255) {
        showError("độ dài kí tự phải từ 0 đến 255");
        return;
      }
      let params: any = {};
      if (noteType === "note") {
        params.note = newNote;
      }
      if (noteType === "customer_note") {
        params.customer_note = newNote;
      }
      dispatch(
        updateOrderPartial(params, orderID, () => onSuccessEditNote(newNote, noteType, orderID,))
      );
    },
    [dispatch, onSuccessEditNote]
  );

  useEffect(() => {
    if (packOrderList)
      setDataPackOrderList(packOrderList);
  }, [packOrderList]);

  const column: Array<ICustomTableColumType<GoodsReceiptsOrderListModel>> = [
    {
      title: "STT",
      key: "key",
      dataIndex: "key",
      visible: true,
      width: "60px",
      align: "center",
      render: (value: number) => {
        return <div>{value + 1}</div>;
      },
    },
    {
      title: "ID đơn ",
      key: "order_code",
      dataIndex: "order_code",
      visible: true,
      width: "130px",
      align: "center",
      render: (value: string) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`${UrlConfig.ORDER}/${value}`} style={{ whiteSpace: "nowrap" }}>
              {value}
            </Link>
          </React.Fragment>
        );
      },
    },
    {
      title: "Khách hàng",
      key: "customer_name",
      dataIndex: "customer_name",
      visible: true,
      width: "200px",
      render: (value: string) => {
        return <div>{value}</div>;
      },
    },
    {
      title: (
        <div className="productNameQuantityHeader">
          <span className="productNameWidth">Sản phẩm</span>
          <span className="mass massWidth">
            <span>Khối lượng</span>
          </span>
          <span className="quantity quantityWidth">
            <span>Số lượng</span>
          </span>
          <span className="price priceWidth">
            <span>Giá</span>
          </span>
        </div>
      ),
      dataIndex: "items",
      key: "items",
      className: "productNameQuantity",
      render: (items: Array<FulfillmentsItemModel>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td" key={i}>
                  <div className="product productNameWidth">
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                  </div>
                  <div className="mass massWidth">
                    <span>{formatCurrency(item.net_weight ? item.net_weight : 0)}</span>
                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity ? item.quantity : 0}</span>
                  </div>
                  <div className="price priceWidth">
                    <span>{formatCurrency(item.price ? item.price : 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: "25%",
    },
    {
      title: "Phí thu khách",
      key: "postage",
      dataIndex: "postage",
      visible: true,
      width: "150",
      align: "center",
      render: (value: number) => {
        return <div>{formatCurrency(value)}</div>;
      },
    },
    {
      title: "Thanh toán",
      key: "card_number",
      dataIndex: "card_number",
      visible: true,
      width: "150",
      align: "center",
      render: (value: number) => {
        return <div>{formatCurrency(value)}</div>;
      },
    },
    {
      title: "Trạng thái",
      key: "sub_status",
      dataIndex: "sub_status",
      visible: true,
      width: "150",
      align: "center",
      render: (value: any) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Ghi chú",
      key: "note",
      dataIndex: "note",
      visible: true,
      width: "150",
      align: "left",
      render: (value: string, record: GoodsReceiptsOrderListModel) => (
        <div className="orderNotes">
          <div className="inner">
            {/* <div className="single">
              <EditNote
                note={record.note}
                title="Khách hàng: "
                color={"#2a2a86"}
                onOk={(newNote) => {
                  editNote(newNote, "customer_note", record.order_id, record);
                }}
              // isDisable={record.status === OrderStatus.FINISHED}
              />
            </div> */}
            <div className="single">
              <EditNote
                note={record.note}
                title="Nội bộ: "
                color={"#2a2a86"}
                onOk={(newNote) => {
                  editNote(newNote, "note", record.order_id);
                }}
              // isDisable={record.status === OrderStatus.FINISHED}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  // const handlePrintPack = useCallback((type: string) => {
  //   if (packDetail) {
  //     dispatch(getPrintGoodsReceipts([packDetail.id], type, (data: GoodReceiptPrint[]) => {
  //       if (data && data.length > 0) {
  //         setHtmlContent(data[0].html_content);
  //         setTimeout(() => {
  //           if (handlePrint) {
  //             handlePrint();
  //           }
  //         }, 500);
  //       }
  //     }))
  //   }
  // }, [dispatch, handlePrint, packDetail]);

  const handleExportExcelOrderPack = useCallback(() => {
    let codes: any[] = [];
    packDetail && packDetail.orders && packDetail.orders.forEach((p) => codes.push(p.code));
    let queryParams = generateQuery({ code: codes });
    console.log("queryParams", queryParams)
    exportFile({
      conditions: queryParams,
      type: "EXPORT_ORDER"
      //hidden_fields: hiddenFieldsExport,
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setStatusExport(2);
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
          if (response.data && response.data.status === "FINISH") {
            window.open(response.data.url, "_self");
            setStatusExport(3);
          }
        }
      })
      .catch((error) => {
        console.log("orders export file error", error);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [listExportFile, packDetail]);

  const setParamPrint = (index: number, row: number[]) => {
    let params = {
      action: "print",
      ids: row,
      "print-type": index === 5 ? "shipment" : "stock_export",
      "print-dialog": true,
    };
    const queryParam = generateQuery(params);
    return queryParam;
  }

  const onMenuClick = useCallback(
    (index: number) => {
      if (!packDetail) return;
      //let fullfilmentPrint: number[] = [];
      let queryParam = setParamPrint(index, selectedRowOrderId);

      switch (index) {
        // case 1:
        //   handlePrintPack(typePrint.detail);
        //   break;
        // case 2:
        //   handlePrintPack(typePrint.simple);
        //   break;
        case 3:
          handleExportExcelOrderPack();
          break;
        case 4:
          if (packDetail)
            history.push(`${UrlConfig.DELIVERY_RECORDS}/${packDetail.id}/update`);
          break;
        case 5:
          {
            if (selectedRowKeys.length <= 0) {
              showError("Vui lòng chọn đơn hàng cần xử lí");
              break;
            }

            // packDetail.orders?.forEach((order) => {
            //   if (selectedRowKeys.some((p: any) => p === order.id)) {
            //     order.fulfillments?.forEach((ffm) => {
            //       fullfilmentPrint.push(ffm.id);
            //     })
            //   }
            // })
            // dispatch(showLoading());
            // changeOrderStatusToPickedService(fullfilmentPrint)
            //   .then((response) => {
            //     if (isFetchApiSuccessful(response)) {
            //       window.location.reload();
            //     } else {
            //       handleFetchApiError(response, "In phiếu giao hàng", dispatch)
            //     }
            //   })
            //   .catch((error) => {
            //     console.log("error", error);
            //   })
            //   .finally(() => {
            //     dispatch(hideLoading());
            //   });

            const printPreviewUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
            window.open(printPreviewUrl);
            break;
          }
        case 6:
          {
            if (selectedRowKeys.length <= 0) {
              showError("Vui lòng chọn đơn hàng cần xử lí");
              break;
            }

            const printPreviewUrlExport = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
            window.open(printPreviewUrlExport);
            break;
          }

        default:
          break;
      }
    },
    [packDetail, selectedRowOrderId, handleExportExcelOrderPack, history, selectedRowKeys]
  );

  const checkExportFile = useCallback(() => {

    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "FINISH") {
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setListExportFile(newListExportFile);
            setStatusExport(3);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(4);
            showError("Có lỗi xảy ra, vui lòng thử lại sau");
            // setExportError(response.data.message);
          }
        } else {
          setStatusExport(4);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      });
    });
  }, [listExportFile]);

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      const keys = selectedRows.map((row: any) => row.key);
      //const codes = selectedRows.map((row: any) => row.fulfillment_code);
      const orderIds = selectedRows.map((row: any) => row.order_id);
      console.log(selectedRows);
      setSelectedRowKeys(keys);
      // setSelectedRowCode(codes);
      setSelectedRowOrderId(orderIds);
    }
  };

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  const handleEventKeydown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) {
      if (event.target.id === "search_term") {
        console.log(event.key)
        if (event.key !== "Enter") {
          barcode = barcode + event.key;

          handleDelayActionWhenInsertTextInSearchInput(
            searchTermRef,
            () => {
              barcode = "";
            },
            300
          );
        } else if (barcode !== "") {
          const searchTermElement: any = document.getElementById("search_term");
          searchTermElement?.select();
        }
      }
    }
  }, [searchTermRef])

  useEffect(() => {
    window.addEventListener("keydown", handleEventKeydown);
    return () => {
      window.removeEventListener("keydown", handleEventKeydown);
    };
  }, [handleEventKeydown]);

  return (
    <React.Fragment>
      <StyledComponent>
        <Card title="Danh sách đơn hàng trong biên bản" className="pack-card-orders">
          <div className="order-filter">
            <div className="page-filter">
              <div className="page-filter-heading">
                <div className="page-filter-left">
                  <ActionButton menu={actions} onMenuClick={onMenuClick} />
                </div>
                <Form layout="inline" ref={formSearchOrderRef}
                  className="page-filter-right"
                  style={{ width: "40%", flexWrap: "nowrap", justifyContent: " flex-end" }}
                >
                  <Item name="search_term" style={{ width: "100%", marginRight: "10px" }}>
                    <Input
                      style={{ width: "100%" }}
                      prefix={<img src={search} alt="" />}
                      placeholder="ID đơn hàng/Mã vận đơn"
                      onChange={handleSearch}
                      onFocus={() => {
                        const searchTermElement: any = document.getElementById("search_term");
                        searchTermElement?.select();
                      }}
                    />
                  </Item>

                  <Item style={{ width: "62px", marginRight: 0 }}>
                    <Button
                      type="primary"
                      onClick={handleSearch}
                    >
                      Lọc
                    </Button>
                  </Item>
                </Form>
              </div>
            </div>
          </div>
          <Table
            dataSource={dataPackOrderList}
            scroll={{ x: 1500 }}
            columns={column}
            //pagination={false}
            bordered
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
          />
        </Card>
      </StyledComponent>

      {/* <div style={{ display: "none" }}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: htmlContent,
            }}
          >
          </div>
        </div>
      </div> */}
    </React.Fragment>
  );
};

export default PackListOrder;
