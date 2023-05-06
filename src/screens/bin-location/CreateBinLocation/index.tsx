import {
  ArrowLeftOutlined,
  EyeOutlined,
  RightCircleFilled,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Form, Image, Input, Space, Table } from "antd";
import { RefSelectProps } from "antd/lib/select";
import ContentContainer from "component/container/content.container";
import SearchProductComponent from "component/search-product";
import UrlConfig from "config/url.config";
import { AccountResponse } from "model/account/account.model";
import { AccountStoreResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import { CreateBinLocationWrapper } from "./styles";
import BottomBarContainer from "component/container/bottom-bar.container";
import emptyProduct from "assets/icon/empty_products.svg";
import { ICustomTableColumType } from "component/table/CustomTable";
import { ImageProduct } from "screens/products/product/component";
import NumberInput from "component/custom/number-input.custom";
import { findAvatar, formatCurrency, replaceFormatString } from "utils/AppUtils";
import { AiOutlineClose } from "react-icons/ai";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { VariantResponse } from "model/product/product.model";
import { cloneDeep, isEmpty } from "lodash";
import YDConfirmModal, { YDConfirmHandle } from "component/modal/YDConfirmModal";
import ImportBinModal from "./components/ImportBinModal";
import { showError, showSuccess } from "utils/ToastUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { CreateBinLocationData, CreateBinLocationItems } from "model/bin-location";
import { createProductBinLocation } from "service/bin-location/bin-location.service";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { MAX_ITEMS } from "../helper";

type BinLocationParam = {
  storeId: string;
};

const BinLocationCreateFields = {
  action_by: "action_by",
  items: "items",
};

const CreateBinLocation: React.FC = () => {
  const { storeId } = useParams<BinLocationParam>();
  const history = useHistory();
  const dispatch = useDispatch();
  const [formCreate] = Form.useForm();
  const [keySearch, setKeySearch] = useState<string>("");
  const productAutoCompleteRef = createRef<RefSelectProps>();
  const user: AccountResponse | null = useSelector(
    (state: RootReducerType) => state.userReducer.account,
  );
  const [dataTable, setDataTable] = useState<Array<CreateBinLocationItems>>([]);
  const [isDisplay, setIsDisplay] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isChangeStore, setIsChangeStore] = useState(false);
  const confirmModalRef = useRef<YDConfirmHandle>(null);
  const fixedQuery = useMemo(() => {
    return { store_ids: Number(storeId) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChangeStore]);

  useEffect(() => {
    if (
      user &&
      user.account_stores.length > 0 &&
      user.account_stores.every((store: AccountStoreResponse) => store.store_id !== Number(storeId))
    ) {
      setIsChangeStore(true);
      history.replace(`${UrlConfig.BIN_LOCATION}/${user.account_stores[0].store_id}/create`);
    }
    formCreate.setFieldsValue({ [BinLocationCreateFields.action_by]: user ? user.code : null });
  }, [history, storeId, user, formCreate]);

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === "F3") {
        event.preventDefault();
        document.getElementById("search_product")?.focus();
        // check enter key from event keydown (not the barcode)
      }
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [formCreate]);

  const createBinLocation = async (values: Pick<CreateBinLocationData, "action_by" | "items">) => {
    if (isEmpty(values.items)) {
      showError("Vui lòng thêm sản phẩm");
      return;
    }
    try {
      dispatch(showLoading());
      const dataSubmit: CreateBinLocationData = {
        from_bin_code: `${isDisplay ? "0B" : "0A"}-01-01-01-0A`,
        to_bin_code: `${!isDisplay ? "0B" : "0A"}-01-01-01-0A`,
        items: values.items,
        action_by: values.action_by,
        updated_by: user?.code,
        updated_name: user?.code,
      };
      const response = await createProductBinLocation(dataSubmit, storeId);
      if (response.data) {
        showSuccess("Tạo vị trí bin thành công");
        setDataTable([]);
        setKeySearch("");
        formCreate.setFieldsValue({ [BinLocationCreateFields.items]: [] });
      } else if (!response.data && response.errors.length > 0) {
        response.errors.forEach((error: string) => showError(error));
      } else {
        showError("Đã có lỗi xảy ra");
      }
    } catch (err: any) {
      showError(err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const changeBinQuantity = (quantity: number | null, variantId: number) => {
    if (!quantity) {
      quantity = 1;
      showError("số lượng sản phẩm không nhỏ hơn 1");
    }
    const lineItems = cloneDeep(dataTable);
    const index = lineItems.findIndex(
      (item: CreateBinLocationItems) => item.variant_id === variantId,
    );
    if (index > -1) {
      lineItems[index].quantity = quantity;
      setDataTable(lineItems);
      formCreate.setFieldsValue({ [BinLocationCreateFields.items]: lineItems });
    }
  };

  const deleteItem = (variantId: number) => {
    const lineItems = cloneDeep(dataTable);
    const index = lineItems.findIndex(
      (item: CreateBinLocationItems) => item.variant_id === variantId,
    );
    if (index > -1) {
      lineItems.splice(index, 1);
      setDataTable(lineItems);
      formCreate.setFieldsValue({ [BinLocationCreateFields.items]: lineItems });
    }
  };

  const deleteAllItems = () => {
    setDataTable([]);
    formCreate.setFieldsValue({ [BinLocationCreateFields.items]: [] });
  };

  const updateNoteItems = (value: string, variantId: number) => {
    if (value.trim().length > 255) {
      showError("Ghi chú không được quá 255 ký tự");
      return;
    }
    const lineItems = cloneDeep(dataTable);
    const index = lineItems.findIndex(
      (item: CreateBinLocationItems) => item.variant_id === variantId,
    );
    if (index > -1) {
      lineItems[index].note = value;
      setDataTable(lineItems);
      formCreate.setFieldsValue({ [BinLocationCreateFields.items]: lineItems });
    }
  };

  const columns: Array<ICustomTableColumType<CreateBinLocationItems>> = [
    {
      title: "STT",
      width: "5%",
      align: "center",
      render: (value: string, row: CreateBinLocationItems, index: number) => {
        return dataTable.length - index;
      },
    },
    {
      title: "Ảnh",
      width: "5%",
      align: "center",
      dataIndex: "image_url",
      render: (value: string) => {
        return (
          <>
            {value ? (
              <Image
                width={40}
                height={40}
                placeholder="Xem"
                src={value ?? ""}
                preview={{ mask: <EyeOutlined /> }}
              />
            ) : (
              <ImageProduct isDisabled={true} path={value} />
            )}
          </>
        );
      },
    },
    {
      title: "Barcode",
      width: "15%",
      align: "left",
      className: "ant-col-info",
      dataIndex: "barcode",
      render: (value: string) => {
        return value;
      },
    },
    {
      title: "Sản phẩm",
      width: "25%",
      align: "left",
      className: "ant-col-info",
      dataIndex: "sku",
      render: (value: string, row: CreateBinLocationItems) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${row.product_id}/variants/${row.variant_id}`}
              >
                {value}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail ant-table-cell" title={row.name}>
                {row.name.length > 80 ? row.name.slice(0, 80) + "..." : row.name}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: () => {
        let total = 0;
        dataTable.forEach((item: CreateBinLocationItems) => (total += item.quantity));
        return (
          <>
            <div>Số lượng</div>
            <div>({formatCurrency(total)})</div>
          </>
        );
      },
      width: "15%",
      align: "center",
      dataIndex: "quantity",
      render: (value: number, row: CreateBinLocationItems) => {
        return (
          <Input.Group compact className="input-group">
            <div
              className="input-group-btn"
              onClick={() => changeBinQuantity(value - 1, row.variant_id)}
            >
              -
            </div>
            <NumberInput
              isFloat={false}
              id={`item-${row.variant_id}`}
              min={0}
              style={{ textAlign: "center" }}
              maxLength={6}
              value={value}
              placeholder="0"
              className="input-group-number"
              onChange={(value) => {
                changeBinQuantity(value, row.variant_id);
              }}
              format={(value: string) => formatCurrency(!Number(value) ? "1" : `${value}`)}
              replace={(a: string) => replaceFormatString(a)}
            />
            <div
              className="input-group-btn"
              onClick={() => changeBinQuantity(value + 1, row.variant_id)}
            >
              +
            </div>
          </Input.Group>
        );
      },
    },
    {
      title: "Lý do",
      width: "25%",
      align: "center",
      dataIndex: "note",
      render: (value: string, row: CreateBinLocationItems) => {
        return (
          <Input
            className="border-input"
            value={value}
            onChange={(e) => {
              updateNoteItems(e.target.value, row.variant_id);
            }}
          />
        );
      },
    },
    {
      title: () => {
        return (
          <span className="delete-all" onClick={deleteAllItems}>
            Xóa hết
          </span>
        );
      },
      align: "center",
      width: "10%",
      render: (value: string, row: CreateBinLocationItems) => {
        return (
          <>
            {
              <Button
                onClick={() => deleteItem(row.variant_id)}
                className="product-item-delete"
                icon={<AiOutlineClose color="#ff4d4f" />}
              />
            }
          </>
        );
      },
    },
  ];

  const onSelectProduct = (variant: VariantResponse | undefined) => {
    if (variant) {
      const dataTableClone = cloneDeep(dataTable);
      if (!dataTableClone.some((e: CreateBinLocationItems) => e.variant_id === variant.id)) {
        const item: CreateBinLocationItems = {
          variant_id: variant.id,
          name: variant.name ?? "",
          code: variant.code,
          image_url: findAvatar(variant.variant_images),
          note: "",
          sku: variant.sku,
          quantity: 1,
          product_id: variant.product_id,
          barcode: variant.barcode,
        };
        dataTableClone.unshift(item);
      } else {
        const index = dataTableClone.findIndex(
          (item: CreateBinLocationItems) => item.variant_id === variant.id,
        );
        dataTableClone[index].quantity = dataTableClone[index].quantity + 1;
      }
      if (dataTableClone.length > MAX_ITEMS) {
        showError("Không thể thêm quá 200 sản phẩm, vui lòng bỏ bớt sản phẩm");
        return;
      }
      setDataTable(dataTableClone);
      formCreate.setFieldsValue({ [BinLocationCreateFields.items]: dataTableClone });
    }
  };

  const openImportModal = () => {
    if (dataTable.length >= MAX_ITEMS) {
      showError("Không thể thêm quá 200 sản phẩm, vui lòng bỏ bớt sản phẩm");
      return;
    }
    setIsVisible(true);
  };

  return (
    <ContentContainer
      title="Thêm mới chuyển vị trí"
      breadcrumb={[
        {
          name: "Kho hàng",
        },
        {
          name: "Chuyển vị trí",
          path: `${UrlConfig.BIN_LOCATION}/list`,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <CreateBinLocationWrapper>
        <Form form={formCreate} onFinish={createBinLocation}>
          <Card>
            <div className="form-search">
              <Form.Item noStyle>
                <SearchProductComponent
                  keySearch={keySearch}
                  setKeySearch={setKeySearch}
                  ref={productAutoCompleteRef}
                  id="search_product"
                  onSelect={onSelectProduct}
                  storeId={Number(storeId)}
                  dataSource={dataTable}
                />
              </Form.Item>
              <Form.Item name={BinLocationCreateFields.items} noStyle hidden>
                <Input />
              </Form.Item>
              <Button
                className="import-btn"
                onClick={openImportModal}
                icon={<UploadOutlined style={{ fontSize: "16px" }} />}
                type="primary"
              >
                Import excel
              </Button>
            </div>
            <Table
              className="inventory-table"
              rowClassName="product-table-row"
              tableLayout="fixed"
              locale={{
                emptyText: (
                  <Empty description="Không có sản phẩm" image={<img src={emptyProduct} alt="" />}>
                    <div style={{ textAlign: "left", marginBottom: 10 }}>
                      <div>
                        <RightCircleFilled className="list-icon" />
                        Nhấn <span className="short-cut-key">F3</span> để bắt đầu thêm sản phẩm
                      </div>
                    </div>
                  </Empty>
                ),
              }}
              dataSource={dataTable}
              columns={columns}
              pagination={false}
              sticky={{
                offsetScroll: 5,
                offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
              }}
              summary={(data: any) => {
                let total = 0;
                data.forEach((el: any) => {
                  total += el.quantity;
                });
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="center">
                      <b>{formatCurrency(total)}</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} colSpan={2}></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />

            <div className="form-account">
              <div className="form-account-label">Người chuyển:</div>
              <Form.Item
                name={BinLocationCreateFields.action_by}
                rules={[{ required: true, message: "Vui lòng chọn người chuyển" }]}
              >
                <AccountSearchPaging
                  fixedQuery={fixedQuery}
                  placeholder="Chọn người chuyển"
                  style={{ width: 250 }}
                />
              </Form.Item>
            </div>
          </Card>
        </Form>
        <BottomBarContainer
          leftComponent={
            <span className="back-btn" onClick={() => confirmModalRef.current?.openModal()}>
              <ArrowLeftOutlined className="back-btn-icon" />
              Quay lại danh sách
            </span>
          }
          rightComponent={
            <Space>
              <Button
                onClick={() => {
                  setIsDisplay(false);
                  formCreate.submit();
                }}
                ghost
                type="primary"
              >
                Cất vào kho
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setIsDisplay(true);
                  formCreate.submit();
                }}
              >
                Trưng ra sàn
              </Button>
            </Space>
          }
        />
        <YDConfirmModal
          ref={confirmModalRef}
          type="warning"
          onOk={() => history.push(`${UrlConfig.BIN_LOCATION}/list`)}
          onCancel={() => confirmModalRef.current?.closeModal()}
          subTitle="Bạn có muốn rời khỏi trang này."
          description="Các dữ liệu trong trang sẽ bị xóa hết."
        />
        {isVisible && (
          <ImportBinModal
            isVisible={isVisible}
            formCreate={formCreate}
            setIsVisible={setIsVisible}
            dataTable={dataTable}
            setDataTable={setDataTable}
          />
        )}
      </CreateBinLocationWrapper>
    </ContentContainer>
  );
};

export default CreateBinLocation;
