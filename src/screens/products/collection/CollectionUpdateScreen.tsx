import { Button, Card, Col, Form, FormInstance, Input, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  collectionDetailAction,
  getProductsCollectionAction,
  updateProductsCollectionAction,
} from "domain/actions/product/collection.action";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import { CollectionUpdateRequest, CollectionResponse } from "model/product/collection.model";
import ContentContainer from "component/container/content.container";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import BottomBarContainer from "component/container/bottom-bar.container";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import PickManyProductModal from "component/modal/PickManyProductModal";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import PlusOutline from "assets/icon/plus-outline.svg";
import { PageResponse } from "model/base/base-metadata.response";
import ProductItem from "component/custom/ProductItem";
import { searchProductWrapperRequestAction } from "domain/actions/product/products.action";
import { Link } from "react-router-dom";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { debounce } from "lodash";
import { dangerColor } from "utils/global-styles/variables";
import CustomPagination from "component/table/CustomPagination";
import { callApiNative } from "utils/ApiUtils";
import { updateCollectionApi } from "service/product/collection.service";
import { backAction } from "../helper";

type CollectionParam = {
  id: string;
};

const GroupUpdate: React.FC = () => {
  const { id } = useParams<CollectionParam>();
  let idNumber = parseInt(id);

  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [detail, setDetail] = useState<CollectionResponse | null>(null);
  const [isError, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const isFirstLoad = useRef(true);
  const [keySearch, setKeySearch] = useState<string>("");
  const [isVisibleManyProduct, setIsVisibleManyProduct] = useState<boolean>(false);
  const [resultSearch, setResultSearch] = useState<PageResponse<ProductResponse> | any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selected, setSelected] = useState<Array<ProductResponse>>([]);
  const productSearchRef = createRef<CustomAutoComplete>();
  const [isLoadingSearchProduct, setIsLoadingSearchProduct] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [dataProductItem, setDataProductItem] = useState<PageResponse<ProductResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: ProductResponse) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const onSuccess = useCallback(
    (result: CollectionResponse) => {
      if (result) {
        setDetail(result);
        formRef.current?.setFieldsValue(result);
        showSuccess("Sửa nhóm hàng thành công");
        history.push(`${UrlConfig.COLLECTIONS}`);
      }
    },
    [history, formRef],
  );

  const updateCollection = useCallback(
    async (values: CollectionUpdateRequest) => {
      setIsLoading(true);
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        updateCollectionApi,
        idNumber.toString(),
        values,
      );
      if (res) {
        onSuccess(res);
      }
      setIsLoading(false);
    },
    [dispatch, idNumber, onSuccess],
  );

  const onGetDetailSuccess = useCallback((data: false | CollectionResponse) => {
    setIsLoadingData(false);
    if (!data) {
      setError(true);
    } else {
      setDetail(data);
    }
  }, []);

  const onSearchProduct = (value: string) => {
    setIsLoadingSearchProduct(true);
    dispatch(
      searchProductWrapperRequestAction(
        {
          status: "active",
          limit: 10,
          page: 1,
          info: value.trim(),
        },
        (res) => {
          setIsLoadingSearchProduct(false);
          setResultSearch(res);
        },
      ),
    );
  };

  const ActionComponent = useMemo(() => {
    let Component = () => <span>Sản phẩm</span>;
    if (selected?.length > 0) {
      Component = () => (
        <div>
          {`Đã chọn ${selected.length} `}
          <Button
            icon={<DeleteOutlined />}
            type="default"
            style={{ color: dangerColor, paddingLeft: 5, paddingRight: 5 }}
            onClick={() => {
              setIsConfirmDelete(true);
            }}
          >
            Xóa
          </Button>
        </div>
      );
    }
    return <Component />;
  }, [selected]);

  const defaultColumns: Array<ICustomTableColumType<ProductResponse>> = useMemo(() => {
    return [
      {
        title: ActionComponent,
        className: "ant-col-info",
        dataIndex: "name",
        render: (value: string, record: ProductResponse) => {
          return (
            <div>
              <div>
                <div className="product-item-sku">
                  <Link target="_blank" to={`${UrlConfig.PRODUCT}/${record.id}`}>
                    {record.code}
                  </Link>
                </div>
                <div className="product-item-name">
                  <span className="product-item-name-detail">{value}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        align: "right",
        title: "SL Phiên bản",
        dataIndex: "variants",
        width: 120,
        render: (value: Array<VariantResponse>, record: ProductResponse) => (
          <>
            <div>{record.num_variant}</div>
          </>
        ),
        visible: true,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        align: "center",
        width: 150,
        render: (value: string, row: ProductResponse) => (
          <div className={row.status === "active" ? "text-success" : "text-error"}>
            {value === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
          </div>
        ),
        visible: true,
      },
      {
        title: "Ngày tạo",
        align: "left",
        dataIndex: "created_date",
        render: (value) => ConvertUtcToLocalDate(value, "DD/MM/YYYY"),
        width: 120,
        visible: true,
      },
    ];
  }, [ActionComponent]);

  const changeSelectedRows = useCallback((selectedRow: Array<ProductResponse>) => {
    const selectedRowKeys = selectedRow.filter((e) => e !== undefined).map((row) => row.id);
    setSelectedRowKeys(selectedRowKeys);

    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  const onResulProduct = useCallback((result: PageResponse<ProductResponse>) => {
    if (result) {
      setDataProductItem({ ...result });
    }
    setIsTableLoading(false);
  }, []);

  const getProductCollection = useCallback(
    (key, page, size) => {
      setIsTableLoading(true);
      dispatch(
        getProductsCollectionAction(
          {
            status: "active",
            limit: size,
            page: page,
            collections: detail?.code,
            info: key || key === "" ? key.trim() : keySearch?.trim(),
          },
          onResulProduct,
        ),
      );
    },
    [onResulProduct, dispatch, keySearch, detail],
  );

  const onResultUpdateProduct = useCallback(
    (res) => {
      setIsTableLoading(false);
      if (res) {
        dispatch(collectionDetailAction(idNumber, onGetDetailSuccess));
        getProductCollection(null, dataProductItem.metadata.page, dataProductItem.metadata.limit);
      }
    },
    [dispatch, idNumber, onGetDetailSuccess, dataProductItem, getProductCollection],
  );

  const selectProduct = useCallback(
    (value: string) => {
      setIsTableLoading(true);

      if (detail && detail.code) {
        let request = {
          ...formRef.current?.getFieldsValue(),
          collection_code: detail.code,
          add_product_ids: [parseInt(value)],
          remove_product_ids: [],
        } as CollectionUpdateRequest;

        dispatch(updateProductsCollectionAction(request, onResultUpdateProduct));
      }
    },
    [dispatch, onResultUpdateProduct, detail, formRef],
  );

  const filterProduct = useCallback(
    (key: string) => {
      getProductCollection(key, dataProductItem.metadata.page, dataProductItem.metadata.limit);
    },
    [dataProductItem, getProductCollection],
  );

  const debounceSearchVariant = useMemo(
    () =>
      debounce((code: string) => {
        filterProduct(code);
      }, 300),
    [filterProduct],
  );

  const pickManyProduct = useCallback(
    (result: Array<ProductResponse>) => {
      const products = result?.map((item) => item.id);

      if (detail && detail.code) {
        let request = {
          ...formRef.current?.getFieldsValue(),
          collection_code: detail.code,
          add_product_ids: products,
          remove_product_ids: [],
        } as CollectionUpdateRequest;

        dispatch(updateProductsCollectionAction(request, onResultUpdateProduct));

        setIsVisibleManyProduct(false);
      }
    },
    [detail, dispatch, formRef, onResultUpdateProduct],
  );

  const deleteProduct = useCallback(() => {
    setIsTableLoading(true);

    if (detail && detail.code) {
      let request = {
        ...formRef.current?.getFieldsValue(),
        collection_code: detail.code,
        add_product_ids: [],
        remove_product_ids: selectedRowKeys,
      } as CollectionUpdateRequest;

      dispatch(updateProductsCollectionAction(request, onResultUpdateProduct));
    }
    showSuccess("Xóa thành công");
    setSelectedRowKeys([]);
    setSelected([]);
    setIsConfirmDelete(false);
  }, [selectedRowKeys, detail, formRef, dispatch, onResultUpdateProduct]);

  const changePage = useCallback(
    (page, size) => {
      setDataProductItem({
        ...dataProductItem,
        metadata: { ...dataProductItem.metadata, page: page, limit: size },
      });
      getProductCollection(null, page, size);
    },
    [dataProductItem, getProductCollection],
  );

  const changeKeySearch = useCallback(
    (code) => {
      debounceSearchVariant(code);
    },
    [debounceSearchVariant],
  );

  useEffect(() => {
    if (isFirstLoad.current) {
      if (!isNaN(idNumber)) {
        dispatch(collectionDetailAction(idNumber, onGetDetailSuccess));
      } else {
        setError(true);
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, idNumber, onGetDetailSuccess]);

  useEffect(() => {
    if (detail && detail.code) {
      getProductCollection(null, 1, 30);
    }
  }, [detail, getProductCollection]);

  return (
    <ContentContainer
      isLoading={isLoadingData}
      isError={isError}
      title="Sửa nhóm hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Nhóm hàng",
          path: `${UrlConfig.COLLECTIONS}`,
        },
        {
          name: detail !== null ? detail.name : "",
        },
      ]}
    >
      {detail !== null && (
        <Form ref={formRef} onFinish={updateCollection} initialValues={detail} layout="vertical">
          <Card>
            <Row gutter={50}>
              <Col span={12}>
                <Form.Item name="version" hidden></Form.Item>
                <Form.Item
                  rules={[
                    { max: 500, message: "Không được nhập quá 500 ký tự" },
                    { required: true, message: "Vui lòng nhập tên nhóm hàng" },
                    {
                      pattern: RegUtil.STRINGUTF8,
                      message: "Tên nhóm hàng không gồm kí tự đặc biệt",
                    },
                  ]}
                  label="Tên nhóm hàng"
                  name="name"
                >
                  <Input placeholder="Nhập nhóm hàng" maxLength={255} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ max: 500, message: "Không được nhập quá 500 ký tự" }]}
                >
                  <TextArea placeholder="Mô tả nhóm hàng" autoSize={{ minRows: 1, maxRows: 1 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card title="Thông tin sản phẩm" bordered={false} className="product">
            <Input.Group className="display-flex">
              <CustomAutoComplete
                loading={isLoadingSearchProduct}
                dropdownClassName="product"
                placeholder="Thêm sản phẩm vào nhóm hàng"
                onSearch={onSearchProduct}
                dropdownMatchSelectWidth={456}
                style={{ width: "100%" }}
                showAdd={true}
                textAdd="Thêm mới sản phẩm"
                onSelect={selectProduct}
                options={renderResult}
                ref={productSearchRef}
                onClickAddNew={() => {
                  window.open(`${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`, "_blank");
                }}
              />
              <Button
                onClick={() => {
                  setIsVisibleManyProduct(true);
                }}
                style={{ width: 132, marginLeft: 10 }}
                icon={<img src={PlusOutline} alt="" />}
              >
                &nbsp;&nbsp; Chọn nhiều
              </Button>
              <Input
                name="key_search"
                value={keySearch}
                onChange={(e) => {
                  setKeySearch(e.target.value);
                  changeKeySearch(e.target.value);
                }}
                style={{ marginLeft: 8 }}
                placeholder="Tìm kiếm sản phẩm trong phiếu"
                addonAfter={
                  <SearchOutlined
                    onClick={() => {
                      changeKeySearch(null);
                    }}
                    style={{ color: "#2A2A86" }}
                  />
                }
              />
            </Input.Group>
            <CustomTable
              isLoading={isTableLoading}
              isRowSelection
              bordered
              style={{ marginTop: 20 }}
              rowClassName="product-table-row"
              tableLayout="fixed"
              scroll={{ y: 300 }}
              columns={defaultColumns}
              dataSource={dataProductItem.items}
              onSelectedChange={(selectedRows) => changeSelectedRows(selectedRows)}
              rowKey={(item: ProductResponse) => item.id}
              pagination={false}
            />
            <CustomPagination
              pagination={{
                showSizeChanger: true,
                pageSize: dataProductItem.metadata.limit,
                current: dataProductItem.metadata.page,
                total: dataProductItem.metadata.total,
                onChange: changePage,
                onShowSizeChange: changePage,
              }}
            />
          </Card>
          <PickManyProductModal
            selected={dataProductItem.items}
            onSave={pickManyProduct}
            onCancel={() => setIsVisibleManyProduct(false)}
            visible={isVisibleManyProduct}
          />
          <ModalDeleteConfirm
            onCancel={() => setIsConfirmDelete(false)}
            onOk={deleteProduct}
            title="Bạn chắc chắn xóa sản phẩm?"
            visible={isConfirmDelete}
          />
          <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={() => backAction(formRef.current?.getFieldsValue(), detail, setModalConfirm, history, UrlConfig.COLLECTIONS)}
            rightComponent={
              <AuthWrapper acceptPermissions={[ProductPermission.categories_update]}>
                <Button loading={isLoading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              </AuthWrapper>
            }
          />
        </Form>
      )}
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default GroupUpdate;
