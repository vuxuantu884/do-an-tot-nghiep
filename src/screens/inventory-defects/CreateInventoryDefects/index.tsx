import { Button, Card, Col, Form, Image, Input, Row, Select, Space, Table } from "antd";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Link, useHistory } from "react-router-dom";
import arrowLeft from "assets/icon/arrow-back.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import ModalConfirm from "component/modal/ModalConfirm";
import { callApiNative } from "utils/ApiUtils";
import { ConvertFullAddress } from "utils/ConvertAddress";
import { useDispatch, useSelector } from "react-redux";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { searchVariantsApi } from "service/product/product.service";
import { VariantResponse } from "model/product/product.model";
import { showError, showSuccess } from "utils/ToastUtils";
import {
  findAvatar,
  formatCurrency,
  handleDelayActionWhenInsertTextInSearchInput,
  replaceFormatString,
} from "utils/AppUtils";
import { InventoryDefectFields, LineItemDefect } from "model/inventory-defects";
import { cloneDeep } from "lodash";
import { createInventoryDefect } from "service/inventory/defect/index.service";
import ImageProduct from "screens/products/product/component/ImageProduct";
import { RootReducerType } from "model/reducers/RootReducerType";
import SearchProductComponent from "component/search-product";
import { RefSelectProps } from "antd/lib/select";
import { InventoryDefectWrapper } from "./style";
import { Store } from "model/inventory/transfer";

export interface SummaryDefect {
  total_defect: number;
  total_on_hand: number;
  total_available: number;
}

let barCode = "";

const InventoryDefectCreate: React.FC = () => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([]);
  const [dataTable, setDataTable] = useState<Array<LineItemDefect> | any>(
    [] as Array<LineItemDefect>,
  );

  const [formStoreData, setFormStoreData] = useState<Store | null>();
  const [isShowModalChangeStore, setIsShowModalChangeStore] = useState<boolean>(false);
  const [defectStoreIdBak, setDefectStoreIdBak] = useState<number>();
  const [objSummaryTable, setObjSummaryTable] = useState<SummaryDefect>({
    total_defect: 0,
    total_on_hand: 0,
    total_available: 0,
  });
  const [keySearch, setKeySearch] = useState<string>("");
  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const productAutoCompleteRef = createRef<RefSelectProps>();

  const history = useHistory();

  const columns: Array<ICustomTableColumType<LineItemDefect>> = [
    {
      title: "Ảnh",
      width: "60px",
      align: "center",
      dataIndex: "image_url",
      render: (value: string) => {
        return (
          <>
            {value ? (
              <Image width={40} height={40} placeholder="Xem" src={value ?? ""} />
            ) : (
              <ImageProduct isDisabled={true} path={value} />
            )}
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
                {value}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail ant-table-cell" title={record.variant_name}>
                {record.variant_name.length > 40
                  ? record.variant_name.slice(0, 40) + "..."
                  : record.variant_name}
              </span>
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
            <div>Có thể bán</div>
            <div>{`${objSummaryTable.total_available ?? "0"}`}</div>
          </>
        );
      },
      dataIndex: "available",
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
            maxLength={6}
            value={value}
            placeholder="0"
            className="border-input"
            onChange={(value) => {
              if (value === null) value = 0;
              updateDataTable(value, row, InventoryDefectFields.defect);
            }}
            format={(value: string) => formatCurrency(value)}
            replace={(a: string) => replaceFormatString(a)}
          />
        );
      },
    },
    {
      title: "Lý do",
      width: 100,
      align: "center",
      dataIndex: "note",
      render: (value: any, row: LineItemDefect, index: number) => {
        return (
          <Form.Item
            name={`note-${index}`}
            rules={[
              {
                max: 255,
                message: "Ghi chú không được quá 255 ký tự",
              },
            ]}
          >
            <Input
              className="border-input"
              onChange={(e) => {
                updateDataTable(e.target.value, row, InventoryDefectFields.note);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "",
      fixed: dataTable?.length !== 0 && "right",
      width: 50,
      render: (value: string, row) => {
        return (
          <>
            {
              <Button
                onClick={() => onDeleteItem(row.id)}
                className="product-item-delete"
                icon={<AiOutlineClose />}
              />
            }
          </>
        );
      },
    },
  ];
  useEffect(() => {
    const getStores = async () => {
      const response = await callApiNative({ isShowError: true }, dispatch, getStoreApi, {
        status: "active",
        simple: true,
      });
      if (response && response.length > 0) {
        setStores(response);
        if (myStores.length === 1) {
          const userStore: Store = response.find(
            (store: Store) => store.id === myStores[0].store_id,
          );
          form.setFieldsValue({
            store_id: userStore.id,
          });
          setFormStoreData(userStore);
          setDefectStoreIdBak(userStore.id);
        }
      }
    };
    getStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    return () => {
      setDataTable([]);
      setStores([]);
    };
  }, []);

  const createDefectItems = async () => {
    if (dataTable.length === 0) {
      showError("Chưa có sản phẩm nào được chọn");
      return;
    }
    if (!formStoreData) {
      showError("Bạn chưa chọn kho hàng");
      return;
    }
    let error = false;
    dataTable.forEach((element: LineItemDefect) => {
      if (element.defect > element.available) {
        showError(`Mã sản phẩm ${element.sku} có số lỗi nhiều hơn có thể bán`);
        error = true;
        return;
      }
    });
    if (error) return;
    if (dataTable.some((el: LineItemDefect) => el.defect <= 0)) {
      showError("Số lượng hàng lỗi không được nhỏ hơn 1");
      return;
    }
    setIsLoading(true);
    const itemsDefect = dataTable.map((item: LineItemDefect) => {
      return {
        defect: item.defect,
        note: item.note,
        sku: item.sku,
        code: item.code,
        variant_id: item.variant_id,
        product_id: item.product_id,
        barcode: item.barcode,
        available: item.available,
      };
    });
    const dataSubmit = {
      store_id: formStoreData.id,
      store: formStoreData.name,
      items: itemsDefect,
    };
    const res = await callApiNative(
      { isShowError: true },
      dispatch,
      createInventoryDefect,
      dataSubmit,
    );
    if (!res) {
      setIsLoading(false);
      return;
    }
    //Phía BE cần xử lý bất đồng bộ cho ES nên cần FE delay 3s
    setTimeout(() => {
      setIsLoading(false);
      showSuccess("Thêm sản phẩm lỗi thành công");
      history.push(`${UrlConfig.INVENTORY_DEFECTS}`);
    }, 3000);
  };

  const calculatingDefectAndInventory = useCallback((data: Array<LineItemDefect>) => {
    let totalDefect = 0,
      totalOnHand = 0,
      totalAvailable = 0;

    data?.forEach((element: LineItemDefect) => {
      totalDefect += element.defect;
      if (element.on_hand === null || element.on_hand === undefined) element.on_hand = 0;
      totalOnHand += element.on_hand * 1;
      totalAvailable += (element?.available || 0) * 1;
    });

    setObjSummaryTable({
      total_defect: totalDefect,
      total_on_hand: totalOnHand,
      total_available: totalAvailable,
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
    [dataTable, calculatingDefectAndInventory],
  );

  const updateDataTable = useCallback(
    (value: any, row: LineItemDefect, field: string) => {
      const dataTableClone = cloneDeep(dataTable);
      dataTableClone.forEach((item: LineItemDefect) => {
        if (item.id === row.id) {
          item[field] = value;
        }
      });
      setDataTable(dataTableClone);
      calculatingDefectAndInventory(dataTableClone);
    },
    [dataTable, calculatingDefectAndInventory],
  );

  const onSelectProduct = useCallback(
    (selectedItem: VariantResponse | undefined, dataSource: any) => {
      if (Number(selectedItem?.available) <= 0) {
        showError(`Mã sản phẩm ${selectedItem?.sku || ""} không đủ SL có thể bán`);
        return;
      }
      const storeId = form.getFieldValue("store_id");
      if (!storeId && typeof storeId !== "number") {
        showError("Vui lòng chọn cửa hàng");
        return;
      }
      const store = stores.find((e: Store) => e.id === Number.parseInt(storeId));
      if (selectedItem && store) {
        if (!dataSource.some((e: VariantResponse) => e.variant_id === selectedItem.id)) {
          const item: LineItemDefect = {
            id: selectedItem.id,
            variant_id: selectedItem.id,
            variant_name: selectedItem.name ?? selectedItem.variant_name,
            code: selectedItem.code,
            image_url: findAvatar(selectedItem.variant_images),
            note: "",
            on_hand: selectedItem.on_hand,
            sku: selectedItem.sku,
            defect: 1,
            store: store.name,
            store_id: store.id,
            product_id: selectedItem.product_id,
            barcode: selectedItem.barcode,
            available: selectedItem.available || 0,
          };
          calculatingDefectAndInventory(dataTable.concat([{ ...item }]));
          setDataTable((prev: Array<LineItemDefect>) => prev.concat([{ ...item }]));
        } else {
          const dataTableClone = cloneDeep(dataTable);
          const itemExist = dataTableClone.find(
            (variant: LineItemDefect) => variant.id === selectedItem.id,
          );
          const index = dataTableClone.findIndex(
            (variant: LineItemDefect) => variant.id === selectedItem.id,
          );
          const newItem = {
            ...itemExist,
            defect: itemExist.defect + 1,
          };
          dataTableClone[index] = newItem;
          setDataTable(dataTableClone);
          calculatingDefectAndInventory(dataTableClone);
        }
      }
    },
    [calculatingDefectAndInventory, dataTable, form, stores],
  );

  const onChangeStore = useCallback(() => {
    const storeId = form.getFieldValue("store_id");
    setDefectStoreIdBak(storeId);
    const store = stores.find((e) => e.id.toString() === storeId?.toString());
    store && store !== null ? setFormStoreData(store) : setFormStoreData(null);
    setIsShowModalChangeStore(false);
    setKeySearch("");
    setObjSummaryTable({
      total_defect: 0,
      total_on_hand: 0,
      total_available: 0,
    });
    setDataTable([]);
  }, [form, stores]);

  const handleSearchProduct = useCallback(
    async (keyCode: string, code: string) => {
      barCode = "";

      if (keyCode === "Enter" && code) {
        const storeId = form.getFieldValue("store_id");
        if (!storeId) {
          showError("Vui lòng chọn cửa hàng");
          return;
        }
        let res = await callApiNative({ isShowLoading: false }, dispatch, searchVariantsApi, {
          barcode: code,
          store_ids: storeId ?? null,
        });

        if (res && res.items && Array.isArray(res.items) && res.items.length > 0) {
          onSelectProduct(res.items[0], dataTable);
          setKeySearch(res.items[0].sku);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [form, dispatch, onSelectProduct, dataTable],
  );

  const eventKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barCode = barCode + event.key;
        } else if (event && event.key === "Enter") {
          handleSearchProduct(event.key, barCode);
        }
        return;
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, handleSearchProduct],
  );

  const eventKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        // k call khi input được focus
        if (document.activeElement && document.activeElement.id !== "search_product") {
          if (event.key !== "Enter") {
            barCode = barCode + event.key;
          }
          handleDelayActionWhenInsertTextInSearchInput(
            productAutoCompleteRef,
            () => handleSearchProduct(event.key, barCode),
            400,
          );
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSearchProduct],
  );

  useEffect(() => {
    window.addEventListener("keypress", eventKeyPress);
    window.addEventListener("keydown", eventKeydown);
    return () => {
      window.removeEventListener("keydown", eventKeydown);
      window.removeEventListener("keypress", eventKeyPress);
    };
  }, [eventKeyPress]);

  const onChooseStore = useCallback(
    (value: number, option) => {
      if (defectStoreIdBak && value !== defectStoreIdBak && dataTable.length > 0) {
        setIsShowModalChangeStore(true);
        return;
      }
      setDefectStoreIdBak(value);
      const store = stores.find((e) => e.id.toString() === value?.toString());
      store && store !== null ? setFormStoreData(store) : setFormStoreData(null);
    },
    [dataTable, defectStoreIdBak, stores],
  );

  const goBackToListDefect = () => {
    if (dataTable.length === 0 && !formStoreData) {
      history.push(`${UrlConfig.INVENTORY_DEFECTS}`);
      return;
    }
    setIsVisibleModalWarning(true);
  };

  return (
    <ContentContainer
      title="Hàng lỗi"
      breadcrumb={[
        {
          name: "Kho hàng",
          // path: UrlConfig.HOME,
        },
        {
          name: "Hàng lỗi",
          path: UrlConfig.INVENTORY_DEFECTS,
        },
        {
          name: "Thêm hàng lỗi",
        },
      ]}
    >
      <InventoryDefectWrapper>
        <Form form={form} onFinish={createDefectItems} scrollToFirstError={true}>
          <Card title="CỬA HÀNG">
            <Row gutter={24}>
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
                    autoClearSearchValue={false}
                    placeholder="Chọn cửa hàng"
                    showArrow
                    optionFilterProp="children"
                    showSearch
                    allowClear={true}
                    onChange={onChooseStore}
                  >
                    {Array.isArray(myStores) && myStores.length > 0
                      ? myStores.map((item, index) => (
                          <Option key={"store_id" + index} value={item.store_id}>
                            {item.store}
                          </Option>
                        ))
                      : stores.map((item, index) => (
                          <Option key={"store_id" + index} value={item.id}>
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
                    <span>
                      {formStoreData.code} - {formStoreData.hotline} -{" "}
                      {ConvertFullAddress(formStoreData)}
                    </span>
                  </div>
                </Col>
              </Row>
            )}
          </Card>

          <Card title="THÔNG TIN SẢN PHẨM" bordered={false}>
            <Form.Item noStyle shouldUpdate={(prev, current) => prev.status !== current.status}>
              <SearchProductComponent
                keySearch={keySearch}
                setKeySearch={setKeySearch}
                ref={productAutoCompleteRef}
                id="search_product"
                onSelect={onSelectProduct}
                storeId={defectStoreIdBak}
                dataSource={dataTable}
                reloadVariantDataFlag={defectStoreIdBak}
              />
            </Form.Item>
            <Table
              style={{ marginTop: 20 }}
              className="inventory-table"
              rowClassName="product-table-row"
              tableLayout="fixed"
              pagination={false}
              columns={columns}
              dataSource={dataTable}
            />
          </Card>

          <BottomBarContainer
            leftComponent={
              <div onClick={goBackToListDefect} style={{ cursor: "pointer" }}>
                <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                {"Quay lại danh sách"}
              </div>
            }
            rightComponent={
              <Space>
                <Button loading={isLoading} disabled={isLoading} htmlType="submit" type="primary">
                  Thêm sản phẩm lỗi
                </Button>
              </Space>
            }
          />
        </Form>
      </InventoryDefectWrapper>
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
            form.setFieldsValue({ store_id: defectStoreIdBak });
            const store = stores.find((e) => e.id.toString() === defectStoreIdBak?.toString());
            store && store !== null ? setFormStoreData(store) : setFormStoreData(null);
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
  );
};

export default InventoryDefectCreate;
