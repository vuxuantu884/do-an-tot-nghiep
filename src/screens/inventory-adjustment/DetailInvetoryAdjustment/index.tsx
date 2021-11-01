import { createRef, FC, useCallback, useEffect, useMemo, useState } from "react";
import { StyledWrapper } from "./styles";
import UrlConfig from "config/url.config";
import { Button, Card, Col, Row, Space, Table, Tag, Input, Tabs } from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import PlusOutline from "assets/icon/plus-outline.svg";
import {
  PaperClipOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import BottomBarContainer from "component/container/bottom-bar.container";
import RowDetail from "screens/products/product/component/RowDetail";
import { useHistory, useParams } from "react-router";
import { useDispatch } from "react-redux";
import {
  inventoryGetVariantByStoreAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryAdjustmentDetailItem, LineItemAdjustment } from "model/inventoryadjustment";
import { Link } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import InventoryAdjustmentTimeLine from "./conponents/InventoryAdjustmentTimeLine";
import { VariantResponse } from "model/product/product.model";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { showError, showSuccess } from "utils/ToastUtils";
import ProductItem from "screens/purchase-order/component/product-item";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import _, { parseInt } from "lodash";
import { INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY, STATUS_INVENTORY_ADJUSTMENT } from "../ListInventoryAdjustment/constants";
import { PageResponse } from "model/base/base-metadata.response";
import InventoryAdjustmentHistory from "./conponents/InventoryAdjustmentHistory";
import InventoryAdjustmentListAll from "./conponents/InventoryAdjustmentListAll";
import { adjustInventoryAction, getDetailInventoryAdjustmentAction, updateItemOnlineInventoryAction, updateOnlineInventoryAction } from "domain/actions/inventory/inventory-adjustment.action";
import CustomTable from "component/table/CustomTable";
import { STATUS_INVENTORY_ADJUSTMENT_CONSTANTS } from "../constants";
const { TabPane } = Tabs;


export interface InventoryParams {
  id: string;
}

export interface SummaryData {
  total: number;
  partly: number;
}

const DetailInvetoryAdjustment: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<InventoryAdjustmentDetailItem>();

  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [dataTable, setDataTable] = useState<Array<LineItemAdjustment> | any>(
    [] as Array<LineItemAdjustment>
  );
  const [searchVariant, setSearchVariant] = useState<Array<LineItemAdjustment> | any>(
    [] as Array<LineItemAdjustment>
  );
  const [keySearch, setKeySearch] = useState<string | any>("");
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [objSummary, setObjSummary] = useState<SummaryData>();
  const [hasError, setHasError] = useState<boolean>(false);
  const [editRealOnHand, setEditRealOnHand] = useState<boolean>(false);

  const onRealQuantityChange = (quantity: number | any, index: number) => {
    let dataEdit = (searchVariant && (searchVariant.length > 0 || (keySearch !== ""))) ? [...searchVariant] : [...dataTable];

    quantity = (quantity ?? 0);
    const dataTableClone = _.cloneDeep(dataEdit);
    dataTableClone[index].real_on_hand = quantity;
    let totalDiff = 0;
    totalDiff = quantity - dataTableClone[index].on_hand;
    if (totalDiff === 0) {
      dataTableClone[index].on_hand_adj = null;
      dataTableClone[index].on_hand_adj_dis = null;
    }
    else if (dataTableClone[index].on_hand < quantity) {
      dataTableClone[index].on_hand_adj = totalDiff;
      dataTableClone[index].on_hand_adj_dis = `+${totalDiff}`;
    } else if (dataTableClone[index].on_hand > quantity) {
      dataTableClone[index].on_hand_adj = totalDiff;
      dataTableClone[index].on_hand_adj_dis = `${totalDiff}`;
    }
    setEditRealOnHand(true);
    if (searchVariant && (searchVariant.length > 0 || keySearch !== "")) {
      setSearchVariant(dataTableClone);
    } else {
      setDataTable(dataTableClone);
    }

    // dispatch(updateItemOnlineInventoryAction(data?.id, dataTableClone[index], (result) => {
    //   if (result) {
    //     showSuccess("Nhập tồn thực tế thành công.");
    //   }
    // }));
  }

  const [resultSearch, setResultSearch] = useState<
    PageResponse<VariantResponse> | any
  >();

  const onSearchProduct = (value: string) => {
    const storeId = data?.adjusted_store_id;
    if (!storeId) {
      showError("Vui lòng chọn kho gửi");
      return;
    } else if ((value.trim() !== "") && (value.length >= 3)) {
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

  let textTag = '';
  let classTag = '';
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
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const onSelectProduct = (value: string) => {
    const dataTemp = [...dataTable];
    const selectedItem = resultSearch?.items?.find(
      (variant: VariantResponse) => variant.id.toString() === value
    );
    if (
      !dataTemp.some(
        (variant: VariantResponse) => variant.id === selectedItem.id
      )
    ) {
      setDataTable((prev: any) => prev.concat([selectedItem]));
      setHasError(false);
    }
  };

  const onPickManyProduct = (result: Array<VariantResponse>) => {
    const newResult = result?.map((item) => {
      return {
        ...item,
        variant_id: item.id,
        variant_name: item.name,
        real_on_hand: 0,
        on_hand_adj: 0 - (item.on_hand ?? 0),
        on_hand_adj_dis: (0 - (item.on_hand ?? 0)).toString()
      };
    });
    const dataTemp = [...dataTable, ...newResult];

    const arrayUnique = [
      ...new Map(dataTemp.map((item) => [item.id, item])).values(),
    ];

    setDataTable(arrayUnique);
    setHasError(false);
    setVisibleManyProduct(false);
  };

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: string, record: VariantResponse, index: number) =>
        index + 1,
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
                to={`${UrlConfig.PRODUCT}/inventory#3?condition=${record.sku}&store_ids${data?.adjusted_store_id}&page=1`}
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
      // filteredValue: filteredInfo || null,
      onFilter: (value, record) => record.name.includes(value),
    },
    {
      title: "Tồn trong kho",
      width: 100,
      align: "right",
      dataIndex: "on_hand",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "Tồn thực tế",
      dataIndex: "real_on_hand",
      align: "right",
      width: 100,
      render: (value, row, index: number) => {
        if (data?.status === STATUS_INVENTORY_ADJUSTMENT_CONSTANTS.DRAFT) {
          return <Input
            type="number"
            id={`item-quantity-${index}`
            }
            min={0}
            value={value ? value : 0}
            onChange={(event) => {
              onRealQuantityChange(event.target.value, index);
            }}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                dispatch(updateItemOnlineInventoryAction(data?.id, row, (result) => {
                  if (result) {
                    showSuccess("Nhập tồn thực tế thành công.");
                  }
                }));
              }
            }}
            onBlur={() => {
              if (editRealOnHand) {
                dispatch(updateItemOnlineInventoryAction(data?.id, row, (result) => {
                  if (result) {
                    showSuccess("Nhập tồn thực tế thành công.");
                  }
                }));
                setEditRealOnHand(false);
              }

            }}
          />
        }
        return value || "";
      },
    },
    {
      title: "Thừa/Thiếu",
      align: "center",
      width: 200,
      render: (value, item, index: number) => {
        if (!item.on_hand_adj || item.on_hand_adj === 0) {
          return null
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{ color: 'red' }}>{item.on_hand_adj}</div>;
        }
        else {
          return <div style={{ color: 'green' }}>+{item.on_hand_adj}</div>;
        }
      }
    }
  ];

  const onResult = useCallback(
    (result) => {
      setLoading(false);
      if (!result) {
        setError(true);
        return;
      } else {
        setDataTable(result.line_items);
        // setSearchVariant(result.line_items);
        setHasError(false);
        setData(result);
        let dataDis = result?.line_items?.filter((e: LineItemAdjustment) => {
          return e.on_hand_adj !== 0
        }) || [];

        let total = result?.line_items.length || 0;

        setObjSummary({
          partly: dataDis.length,
          total: total
        });
      }
    },
    []
  );

  const onUpdateOnlineInventory = useCallback(() => {
    setLoading(true);
    dispatch(updateOnlineInventoryAction(data?.id ?? 0, (result) => {
      setLoading(false);
      if (result) {
        window.location.reload();
        showSuccess("Hoàn thành kiểm kho thành công.");
      }
    }));

  }, [data, dispatch]);

  const onAdjustInventory = useCallback(() => {
    setLoading(true);
    dispatch(adjustInventoryAction(data?.id ?? 0, (result) => {
      setLoading(false);
      if (result) {
        window.location.reload();
        showSuccess("Cân tồn kho thành công.");
      }
    }));
  }, [dispatch, data?.id]);

  const onEnterFilterVariant = useCallback(() => {
    let dataSearch = [...dataTable.filter((e: LineItemAdjustment) => {
      return e.on_hand === parseInt(keySearch)
        || e.variant_name?.includes(keySearch)
        || e.sku?.includes(keySearch)
        || e.code?.includes(keySearch)
        || e.barcode?.includes(keySearch)
    })];

    setSearchVariant(dataSearch);
  }, [keySearch, dataTable]);

  useEffect(() => {
    dispatch(getDetailInventoryAdjustmentAction(idNumber, onResult));

  }, [idNumber, onResult, dispatch]);
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
            path: `${UrlConfig.INVENTORY_ADJUSTMENT}`,
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
                >
                  <Row gutter={24} className="pt8">
                    <Col span={16}>
                      <RowDetail title="Kho kiểm" value={data.adjusted_store_name} />
                      <RowDetail
                        title="Địa chỉ"
                        value={data.store.address}
                      />
                    </Col>
                    <Col span={8}>
                      <RowDetail title="Loại kiểm" value={INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find(e => e.value === data.audit_type)?.name ?? ""} />
                      <RowDetail
                        title="Mã CH"
                        value={data.store.code}
                      />
                      <RowDetail
                        title="SĐT"
                        value={data.store.hotline}
                      />
                    </Col>
                  </Row>
                </Card>
                {
                  //case trạng thái
                  data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status
                    || data.status === STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status ?
                    <Card>
                      <Tabs
                        style={{ overflow: "initial" }}
                        activeKey={activeTab}
                        onChange={(active) =>
                          setActiveTab(active)
                        }
                      >
                        <TabPane tab={`Thừa/Thiếu (${objSummary?.partly})`} key="1">
                          <InventoryAdjustmentHistory
                            data={data}
                          />
                        </TabPane>
                        <TabPane tab={`Tất cả (${objSummary?.total})`} key="2">
                          <InventoryAdjustmentListAll
                            data={data}
                          />
                        </TabPane>
                      </Tabs>
                    </Card>
                    : <Card
                      title="Thông tin sản phẩm"
                      bordered={false}
                    >
                      <Input.Group
                        style={{ paddingTop: 16 }}
                        className="display-flex">
                        <CustomAutoComplete
                          id="#product_search_variant"
                          dropdownClassName="product"
                          placeholder="Thêm sản phẩm vào phiếu kiểm"
                          onSearch={onSearchProduct}
                          dropdownMatchSelectWidth={456}
                          style={{ width: "100%" }}
                          showAdd={true}
                          textAdd="Thêm mới sản phẩm"
                          onSelect={onSelectProduct}
                          options={renderResult}
                          ref={productSearchRef}
                        />
                        <Button
                          onClick={() => {
                            setVisibleManyProduct(true);
                            return;
                          }}
                          style={{ width: 132, marginLeft: 10 }}
                          icon={<img src={PlusOutline} alt="" />}
                        >
                          &nbsp;&nbsp; Chọn nhiều
                        </Button>

                        <Input
                          name="key_search"
                          onBlur={() => {
                            onEnterFilterVariant()
                          }}
                          onChange={(e) => {
                            setKeySearch(e.target.value);
                            //onEnterFilterVariant()
                          }}
                          onKeyPress={event => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              onEnterFilterVariant()
                            }
                          }}
                          style={{ marginLeft: 8 }}
                          placeholder="Tìm kiếm sản phẩm trong phiếu (enter để tìm kiếm)"
                        />
                      </Input.Group>
                      <CustomTable
                        rowClassName="product-table-row"
                        tableLayout="fixed"
                        style={{ paddingTop: 20 }}
                        scroll={{ y: 300 }}
                        pagination={false} 
                        summary={() => {
                          let data = (searchVariant && (searchVariant.length > 0 || (keySearch !== ""))) ? [...searchVariant] : [...dataTable];

                          let totalExcess = 0, totalMiss = 0,
                            totalQuantity = 0, totalReal = 0;
                          data.forEach((element: LineItemAdjustment) => {
                            totalQuantity += element.on_hand;
                            totalReal += parseInt(element.real_on_hand.toString()) ?? 0;
                            if (element.on_hand_adj > 0) {
                              totalExcess += element.on_hand_adj;
                            } if (element.on_hand_adj < 0) {
                              totalMiss += -element.on_hand_adj;
                            }
                          });

                          return (
                            <Table.Summary fixed>
                              <Table.Summary.Row >
                                <Table.Summary.Cell index={0} colSpan={2}>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align={"left"} index={2}>
                                  <b>Tổng:</b>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align={"right"} index={3}>
                                  {totalQuantity}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align={"right"} index={4}>
                                  {totalReal}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align={"center"} index={5}>
                                  <Space>
                                    {
                                      totalExcess === 0 ? null :
                                        <div style={{ color: '#27AE60' }}>
                                          +{totalExcess}</div>
                                    }
                                    {totalExcess && totalMiss ? <Space>/</Space> : null}
                                    {
                                      totalMiss === 0 ? null :
                                        <div style={{ color: 'red' }}>
                                          -{totalMiss}</div>
                                    }
                                  </Space>
                                </Table.Summary.Cell>
                              </Table.Summary.Row>
                            </Table.Summary>
                          )
                        }}
                        columns={columns}
                        dataSource={(searchVariant && (searchVariant.length > 0 || (keySearch !== ""))) ? searchVariant : dataTable}
                      />
                    </Card>

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
                    <RowDetail title="ID Phiếu" value={data.code} />
                    <RowDetail title="Người tạo" value={data.created_by} />
                    <RowDetail title="Người kiểm" value={data.audited_by.toString()} />
                  </Col>
                </Card>
                <Card
                  title={"GHI CHÚ"}
                  bordered={false}
                  className={"inventory-note"}
                >
                  <Row
                    className=""
                    gutter={5}
                    style={{ flexDirection: "column" }}
                  >
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>Ghi chú nội bộ:</b>
                    </Col>
                    <Col span={24}>
                      <span
                        className="text-focus"
                        style={{ wordWrap: "break-word" }}
                      >
                        {(data?.note !== "" && data?.note !== "string") ? data?.note : "Không có ghi chú"}
                      </span>
                    </Col>
                  </Row>

                  <Row
                    className="margin-top-10"
                    gutter={5}
                    style={{ flexDirection: "column" }}
                  >
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>File đính kèm:</b>
                    </Col>
                    <Col span={24}>
                      <span className="text-focus">
                        {data.attached_files?.map(
                          (link: string, index: number) => {
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
                          }
                        )}
                      </span>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <BottomBarContainer
              leftComponent={
                <div onClick={() => history.push(`${UrlConfig.INVENTORY_ADJUSTMENT}`)} style={{ cursor: "pointer" }}>
                  <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  <Button
                    type="default"
                    onClick={() => {
                      history.push(
                        `${UrlConfig.INVENTORY_ADJUSTMENT}/${data?.id}`
                      );
                    }}
                  >
                    <Space><PrinterOutlined /> In phiếu</Space>
                  </Button>
                  {
                    data.status === STATUS_INVENTORY_ADJUSTMENT.DRAFT.status ?
                      <Button
                        type="primary"
                        onClick={onUpdateOnlineInventory}
                        loading={isLoading} disabled={hasError || isLoading}
                      >
                        Hoàn thành
                      </Button> : null
                  }
                  {
                    data.status === STATUS_INVENTORY_ADJUSTMENT.AUDITED.status ?
                      <Button
                        type="primary"
                        onClick={onAdjustInventory}
                        loading={isLoading} disabled={hasError || isLoading}
                      >
                        Cân tồn kho
                      </Button> : null
                  }

                </Space>
              }
            />
            {visibleManyProduct && (
              <PickManyProductModal
                storeID={data?.adjusted_store_id}
                selected={[]}
                onSave={onPickManyProduct}
                onCancel={() => setVisibleManyProduct(false)}
                visible={visibleManyProduct}
              />
            )}
          </>
        )}
      </ContentContainer>
    </StyledWrapper >
  );
};

export default DetailInvetoryAdjustment;
