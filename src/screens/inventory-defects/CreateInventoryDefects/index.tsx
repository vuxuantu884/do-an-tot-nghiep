import { Button, Card, Col, Form, Image, Input, Row, Select, Space, Table } from "antd"
import { Store } from "antd/lib/form/interface"
import ContentContainer from "component/container/content.container"
import CustomAutoComplete from "component/custom/autocomplete.cusom"
import NumberInput from "component/custom/number-input.custom"
import CustomSelect from "component/custom/select.custom"
import { ICustomTableColumType } from "component/table/CustomTable"
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config"
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react"
import { AiOutlineClose } from "react-icons/ai"
import { Link, useHistory } from "react-router-dom"
import arrowLeft from "assets/icon/arrow-back.svg";
import BottomBarContainer from "component/container/bottom-bar.container"
import ModalConfirm from "component/modal/ModalConfirm"
import { callApiNative } from "utils/ApiUtils"
import { ConvertFullAddress } from "utils/ConvertAddress";
import { useDispatch } from "react-redux"
import { getStoreApi } from "service/inventory/transfer/index.service"
import { searchVariantsApi } from "service/product/product.service"
import { VariantResponse } from "model/product/product.model"
import ProductItem from "screens/purchase-order/component/product-item"
import { showError, showSuccess } from "utils/ToastUtils"
import { findAvatar } from "utils/AppUtils"
import { InventoryDefectFields, LineItemDefect } from "model/inventory-defects"
import { cloneDeep } from "lodash"
import { createInventoryDefect } from "service/inventory/defect/index.service"
import ImageProduct from "screens/products/product/component/image-product.component"

export interface SummaryDefect {
  total_defect: number;
  total_on_hand: number;
}

const InventoryDefectCreate: React.FC = () => {
  const { Option } = Select
  const [form] = Form.useForm();
  const dispatch = useDispatch()
  const productSearchRef = createRef<CustomAutoComplete>();
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [dataTable, setDataTable] = useState<Array<LineItemDefect> | any>(
    [] as Array<LineItemDefect>
  );
  const [variantData, setVariantData] = useState<Array<VariantResponse>>([])
  const [formStoreData, setFormStoreData] = useState<Store | null>();
  const [isShowModalChangeStore, setIsShowModalChangeStore] = useState<boolean>(false);
  const [defectStoreIdBak, setDefectStoreIdBak] = useState<number | null>(null);
  const [objSummaryTable, setObjSummaryTable] = useState<SummaryDefect>({
    total_defect: 0,
    total_on_hand: 0
  });

  const history = useHistory()
  const columns: Array<ICustomTableColumType<LineItemDefect>> = [
    {
      title: "Ảnh",
      width: "60px",
      align: "center",
      dataIndex: "image_url",
      render: (value: string) => {
        return (
          <>
          {value ? <Image width={40} height={40} placeholder="Xem" src={value ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={value} />}
          </>
        );
      },
    },
    {
      title: "Mã SKU",
      width: "150px",
      align: "center",
      className: "ant-col-info",
      dataIndex: "sku",
      render: (value: string, record: LineItemDefect, index: number) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{record.variant_name}</span>
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
            <div>{`${objSummaryTable.total_on_hand ?? "0"}`}</div>
          </>
        );
      },
      dataIndex: "on_hand",
      align: "center",
      width: 100,
      render: (value: any) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Số lỗi</div>
            <div>{`${objSummaryTable.total_defect ?? "0"}`}</div>
          </>
        );
      },
      width: 100,
      align: "center",
      dataIndex: "defect",
      render: (value: any, row: LineItemDefect, index: number) => {
        return (
          <NumberInput
            isFloat={false}
            id={`item-defect-${index}`}
            min={0}
            value={value}
            placeholder="0"
            className="border-input"
            onChange={(value) => {
              if (value === null) value = 0
              updateDataTable(value, row, InventoryDefectFields.defect)

            }}
            format={value => value === null ? "0" : value.toString()}
          />
        )
      },
    },
    {
      title: "Lý do",
      width: 100,
      align: "center",
      dataIndex: "note",
      render: (value: any, row: LineItemDefect, index: number) => (
        <Input
          className="border-input"
          onChange={(e) => {
            updateDataTable(e.target.value, row, InventoryDefectFields.note)
          }}
        />
      ),
    },
    {
      title: "",
      fixed: dataTable?.length !== 0 && "right",
      width: 50,
      render: (value: string, row) => {
        return <>
          {
            <Button
              onClick={() => onDeleteItem(row.id)}
              className="product-item-delete"
              icon={<AiOutlineClose color="red" />}
            />
          }
        </>
      }
    },
  ];
  useEffect(() => {
    const getStores = async () => {
      const response = await callApiNative({ isShowError: true }, dispatch, getStoreApi, { status: "active", simple: true });
      if (response) {
        setStores(response)
      }
    }
    getStores()
  }, [dispatch])

  useEffect(() => {
    return () => {
      setDataTable([])
      setStores([])
      setVariantData([])
    }
  }, [])

  const onFinish = async () => {
    if (!formStoreData || dataTable.length === 0 || !formStoreData.id || !formStoreData.name) {
      showError('Chưa có sản phẩm nào được chọn')
      return
    }
    setIsLoading(true)
    const itemsDefect = dataTable.map((item: LineItemDefect) => {
      return {
        defect: item.defect,
        note: item.note,
        sku: item.sku,
        code: item.code,
        variant_id: item.variant_id,
        product_id: item.product_id,
        barcode: item.barcode
      }
    })
    const dataSubmit = {
      store_id: formStoreData.id,
      store: formStoreData.name,
      items: itemsDefect
    }
    await callApiNative({ isShowError: true }, dispatch, createInventoryDefect, dataSubmit)
    setIsLoading(false)
    showSuccess("Thêm sản phẩm lỗi thành công");
    history.push(`${UrlConfig.INVENTORY_DEFECTS}`);
  }

  const calculatingDefectAndInventory = useCallback((data: Array<LineItemDefect>) => {
    let totalDefect = 0,
      totalOnHand = 0;

    data?.forEach((element: LineItemDefect) => {
      totalDefect += element.defect;
      if (element.on_hand === null || element.on_hand === undefined) element.on_hand = 0
      totalOnHand += element.on_hand * 1
    });

    setObjSummaryTable({
      total_defect: totalDefect,
      total_on_hand: totalOnHand
    });
  }, []);


  const onDeleteItem = useCallback(
    (variantId: number) => {
      // delete row
      const temps = [...dataTable];
      temps.forEach((row, index, array) => {
        if (row.id === variantId) {
          array.splice(index, 1);
        }
      });

      setDataTable(temps);
      calculatingDefectAndInventory(temps);
    },
    [dataTable, calculatingDefectAndInventory]
  );

  const onSearch = useCallback(
    async (value: string) => {
      if (!defectStoreIdBak) {
        showError("Vui lòng chọn cửa hàng");
        return;
      } else if (value.trim() !== "" && value.length > 2) {
        setLoadingSearch(true);
        const response = await callApiNative({ isShowError: true }, dispatch, searchVariantsApi, {
          status: "active",
          limit: 10,
          page: 1,
          store_ids: defectStoreIdBak ?? 0,
          info: value.trim(),
        })
        if (response) {
          setVariantData(response.items)
        }
      } else {
        setVariantData([]);
      }
      setLoadingSearch(false);
    },
    [dispatch, defectStoreIdBak]
  );

  const renderProductResult = useMemo(() => {
    let options: any[] = [];
    variantData?.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;

  }, [variantData]);


  const updateDataTable = useCallback((value: any, row: LineItemDefect, field: string) => {
    const dataTableClone = cloneDeep(dataTable)
    dataTableClone.forEach((item: LineItemDefect) => {
      if (item.id === row.id) {
        item[field] = value
      }
    })
    setDataTable(dataTableClone)
    calculatingDefectAndInventory(dataTableClone)
  }, [dataTable, calculatingDefectAndInventory])

  const onSelectProduct = useCallback(async (value: string) => {
    const selectedItem = variantData?.find(
      (variant: VariantResponse) => variant.id.toString() === value
    );
    if (formStoreData && selectedItem) {
      let item: any = {}
      if (!dataTable.some((variant: VariantResponse) => variant.id === selectedItem.id)) {
        item = {
          id: selectedItem.id,
          variant_id: selectedItem.id,
          variant_name: selectedItem.name ?? selectedItem.variant_name,
          code: selectedItem.code,
          image_url: findAvatar(selectedItem.variant_images),
          note: "",
          on_hand: selectedItem.on_hand,
          sku: selectedItem.sku,
          defect: 1,
          store: formStoreData.name,
          store_id: formStoreData.id,
          product_id: selectedItem.product_id
        }
        calculatingDefectAndInventory(dataTable.concat([{ ...item }]));
        setDataTable((prev: Array<LineItemDefect>) =>
          prev.concat([{ ...item }])
        );
      } else {
        const dataTableClone = cloneDeep(dataTable);
        const itemExist = dataTableClone.find((variant: LineItemDefect) => variant.id === selectedItem.id)
        const index = dataTableClone.findIndex((variant: LineItemDefect) => variant.id === selectedItem.id)
        item = {
          ...itemExist,
          defect: itemExist.defect + 1
        }
        // const newDataTable = cloneDeep(dataTable)
        dataTableClone[index] = item
        setDataTable(dataTableClone)
        calculatingDefectAndInventory(dataTableClone);
      }
    }
  }, [dataTable, variantData, calculatingDefectAndInventory, formStoreData]);

  const onChangeStore = useCallback(() => {
    const storeId = form.getFieldValue("store_id");

    setDefectStoreIdBak(storeId);
    setIsShowModalChangeStore(false);
    setDataTable([]);
    setVariantData([])

  }, [form])

  return (
    <ContentContainer
      title="Hàng lỗi"
      breadcrumb={[
        {
          name: "Kho hàng",
          path: UrlConfig.HOME,
        },
        {
          name: "Hàng lỗi",
          path: UrlConfig.INVENTORY_DEFECTS,
        },
        {
          name: "Thêm hàng lỗi"
        }
      ]}
    >
      <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
        <Card
          title="CỬA HÀNG"
        >
          <Row gutter={24} >
            <Col span={3} className="pt8" style={{ paddingTop: 10 }}>
              <b>
                Chọn cửa hàng <span style={{ color: "red" }}>*</span>
              </b>
            </Col>
            <Col span={21}>
              <Form.Item
                name="store_id"
                label=""
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn cửa hàng",
                  },
                ]}
                labelCol={{ span: 24, offset: 0 }}
              >
                <CustomSelect
                  placeholder="Chọn cửa hàng"
                  showArrow
                  optionFilterProp="children"
                  showSearch
                  allowClear={true}
                  onChange={(value: number, option) => {
                    if (defectStoreIdBak && value !== defectStoreIdBak && dataTable.length > 0) {
                      setIsShowModalChangeStore(true);
                    } else {
                      setDefectStoreIdBak(value);
                    }

                    const store = stores.find(
                      (e) => e.id.toString() === value?.toString()
                    );
                    store && store !== null
                      ? setFormStoreData(store)
                      : setFormStoreData(null);
                  }}
                >
                  {Array.isArray(stores) &&
                    stores.length > 0 &&
                    stores.map((item, index) => (
                      <Option
                        key={"store_id" + index}
                        value={item.id.toString()}
                      >
                        {item.name}
                      </Option>
                    ))}
                </CustomSelect>
              </Form.Item>
            </Col>
          </Row>
          {formStoreData && (
            <Row gutter={24}>
              <Col span={3}></Col>
              <Col span={21}>
                <div style={{ wordBreak: "break-word" }}>
                  <strong>{formStoreData.name}: </strong>
                  <span>{formStoreData.code} - {formStoreData.hotline} - {ConvertFullAddress(formStoreData)}</span>
                </div>
              </Col>
            </Row>
          )}
        </Card>

        <Card
          title="THÔNG TIN SẢN PHẨM"
          bordered={false}
        >
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.status !== current.status}
          >
            <Input.Group className="display-flex">
              <CustomAutoComplete
                loading={loadingSearch}
                id="#product_search"
                dropdownClassName="product"
                placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F3)"
                onSearch={onSearch}
                dropdownMatchSelectWidth={456}
                style={{ width: "100%", paddingBottom: 15 }}
                showAdd={true}
                textAdd="Thêm mới sản phẩm"
                onSelect={onSelectProduct}
                options={renderProductResult}
                ref={productSearchRef}
                onClickAddNew={() => {
                  window.open(
                    `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                    "_blank"
                  );
                }}
              />
            </Input.Group>
          </Form.Item>
          <Table
            className="product-table"
            rowClassName="product-table-row"
            tableLayout="fixed"
            pagination={false}
            columns={columns}
            // loading={isLoadingTable}
            dataSource={dataTable}
          />
          {/* <div className={"sum-qty"}>
            <span>Tổng số lượng:</span> <b>{getTotalQuantity()}</b>
          </div> */}
        </Card>

        <BottomBarContainer
          leftComponent={
            <div
              onClick={() => {
                if (dataTable.length === 0 && !formStoreData) {
                  history.push(`${UrlConfig.INVENTORY_DEFECTS}`)
                  return
                }
                setIsVisibleModalWarning(true)
              }}
              style={{ cursor: "pointer" }}
            >
              <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
              {"Quay lại danh sách"}
            </div>
          }
          rightComponent={
            <Space>
              <Button
                loading={isLoading}
                disabled={isLoading}
                htmlType="submit"
                type="primary"
              >
                Thêm sản phẩm lỗi
              </Button>
            </Space>
          }
        />
      </Form>
      {isVisibleModalWarning && (
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalWarning(false);
          }}
          onOk={() => history.push(`${UrlConfig.INVENTORY_DEFECTS}`)}
          okText="Đồng ý"
          cancelText="Tiếp tục"
          title={`Bạn có muốn rời khỏi trang?`}
          subTitle="Thông tin trên trang này sẽ không được lưu."
          visible={isVisibleModalWarning}
        />
      )}
      {isShowModalChangeStore && (
        <ModalConfirm
          onCancel={() => {
            setIsShowModalChangeStore(false);
            form.setFieldsValue({ defect_store_id: defectStoreIdBak });
            const store = stores.find(
              (e) => e.id.toString() === defectStoreIdBak?.toString()
            );
            store && store !== null
              ? setFormStoreData(store)
              : setFormStoreData(null);
          }}
          onOk={onChangeStore}
          okText="Đồng ý"
          cancelText="Hủy"
          title={`Bạn có chắc chắn đổi cửa hàng?`}
          subTitle="Thông tin sản phẩm trong phiếu sẽ không được lưu."
          visible={isShowModalChangeStore}
        />
      )}
    </ContentContainer>
  )
}

export default InventoryDefectCreate