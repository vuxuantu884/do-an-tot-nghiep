import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  FormInstance,
  Input,
  Row,
  Spin,
} from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import _, { cloneDeep, debounce } from "lodash";
import {
  DataType,
  GiftProductEntitlements,
} from "model/promotion/gift.model";
import { GiftEntitlementForm } from "model/promotion/gift.model";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import {
  searchVariantsOrderRequestAction,
} from "domain/actions/product/products.action";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { findAvatar, findPrice } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import { AppConfig } from "config/app.config";
import { RefSelectProps } from "antd/lib/select";

import imgDefault from "assets/icon/img-default.svg";


interface Props {
  form: FormInstance;
  name: number;
}
const GiftProduct = (props: Props) => {
  const { name, form } = props;
  const dispatch = useDispatch();

  const [giftDataSource, setGiftDataSource] = useState<Array<DataType>>([]);

  const dataSourceForm: Array<GiftProductEntitlements> =
    form.getFieldValue("entitlements")[name]?.selectedGifts;

  useEffect(() => {
    if (dataSourceForm && Array.isArray(dataSourceForm)) {
      const giftDataSourceForm: Array<DataType> = dataSourceForm.map(item => {
        return (
          {
            sku: item.sku,
            variant_title: item.variant_title,
            product_id: item.product_id,
            variant_id: item.variant_id || item.product_id,
          }
        )
      })
      setGiftDataSource(giftDataSourceForm);
    }
  }, [dataSourceForm, setGiftDataSource]);


  const updateGiftFieldValue = useCallback((selectedGifts: any) => {
    const entitlementFormValue: Array<GiftEntitlementForm> = form.getFieldValue("entitlements");
    entitlementFormValue[name].selectedGifts = selectedGifts;
    entitlementFormValue[name].entitled_gift_ids = selectedGifts.map((item: any) => item.variant_id);

    // change reference for re-render form
    setGiftDataSource(selectedGifts);
    form.setFieldsValue({ entitlements: _.cloneDeep(entitlementFormValue) });
  }, [form, name]);

  const handleAdd = () => {
    if (giftDataSource?.length && !giftDataSource[giftDataSource?.length - 1].variant_id) {
      const element: any = document.getElementById("auto-complete-search-variant");
      element?.focus();
    } else {
      const newData: DataType = {
        sku: "",
        variant_title: "",
        product_id: null,
        variant_id: null,
      };
      setGiftDataSource([...giftDataSource, newData]);
    }
  };

  const handleDelete = useCallback((index: number) => {
    const newGiftDataSource = cloneDeep(giftDataSource);
    newGiftDataSource.splice(index, 1);
    updateGiftFieldValue(newGiftDataSource);
  }, [giftDataSource, updateGiftFieldValue]);
  
  /** render product column */
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
  const [autoCompleteValue, setAutoCompleteValue] = useState("");

  const [resultSearchVariant, setResultSearchVariant] = useState<Array<VariantResponse>>(
    [],
  );

  const RenderProductColumn = useCallback((giftProduct: any, index: number) => {
    if (giftProduct?.product_id) {
      const productDetailLink = giftProduct?.variant_id ?
        `${UrlConfig.PRODUCT}/${giftProduct?.product_id}/variants/${giftProduct?.variant_id}`
        :
        `${UrlConfig.PRODUCT}/${giftProduct?.product_id}`
      return (
        <div>
          <Link
            target="_blank"
            to={productDetailLink}
          >
            {giftProduct.variant_title || giftProduct.sku}
          </Link>
        </div>
      );
    }
    
    const autoCompleteRef = createRef<RefSelectProps>();

    const onInputSearchProductFocus = () => {
      setIsInputSearchProductFocus(true);
    };

    const onInputSearchProductBlur = () => {
      setIsInputSearchProductFocus(false);
    };

    const initQueryVariant: VariantSearchQuery = {
      page: 1,
      limit: 100,
      status: "active",
      saleable: true,
    };

    const updateProductResult = (result: any) => {
      setIsSearching(false);
      if (result?.items) {
        setResultSearchVariant(result.items);
      }
    };

    const handleErrorSearchProduct = () => {
      setIsSearching(false);
    };

    const onChangeProductSearch = (value: string) => {
      if (value?.length >= 3) {
        initQueryVariant.info = value;
        setIsSearching(true);
        setResultSearchVariant([]);
        dispatch(
          searchVariantsOrderRequestAction(
            initQueryVariant,
            updateProductResult,
            handleErrorSearchProduct,
          ),
        );
      }
    };

    const handleOnSearchProduct = debounce((value: string) => {
      onChangeProductSearch(value);
    }, 800);

    const onChangeAutoCompleteValue = (value: any) => {
      if (typeof(value) === "string") {
        setAutoCompleteValue(value);
      }
    };

    const onSearchVariantSelect = (idItemSelected: any) => {
      const itemSelected = resultSearchVariant?.find((item) => item.id?.toString() === idItemSelected?.toString());
      if (itemSelected) {
        const isGiftSelected = giftDataSource.some((item: any) => item.sku === itemSelected.sku);
        if (isGiftSelected) {
          showError("Quà tặng này đã được chọn.");
        } else {
          const newGift = {
            sku: itemSelected.sku,
            variant_title: itemSelected.name,
            product_id: itemSelected.product_id,
            variant_id: itemSelected.id,
          }
          const newGiftDataSource = cloneDeep(giftDataSource);
          newGiftDataSource[index] = newGift;
          updateGiftFieldValue(newGiftDataSource);
          
          // Comment để hiển thị danh sách sản phẩm quà tặng tìm kiếm trước đó
          // setAutoCompleteValue("");
          // setResultSearchVariant([]);
          setIsInputSearchProductFocus(false);
          autoCompleteRef.current?.blur();
        }
      } else {
        showError("Có lỗi khi chọn quà tặng này. Vui lòng thử lại.");
      }
    };

    const renderSearchVariant = (item: VariantResponse) => {
      let avatar = findAvatar(item.variant_images);
      return (
        <Row
          gutter={24}
          style={{
            padding: "10px",
            lineHeight: "16px",
            flexWrap: "nowrap",
          }}
        >
          <Col span={2} style={{ width: "50px" }}>
            <img
              src={avatar === "" ? imgDefault : avatar}
              alt="anh"
              placeholder={imgDefault}
              style={{ width: "40px", height: "40px", borderRadius: 5 }}
            />
          </Col>
          <Col span={16} style={{ whiteSpace: "break-spaces" }}>
            <div style={{ marginBottom: "5px" }}>{item.name}</div>
            <div style={{ color: "#95a1ac" }}>SKU: {item.sku}</div>
          </Col>
          <Col span={6} style={{ width: "150px", textAlign: "right",  }}>
            <span>
              {`${findPrice(item.variant_prices, AppConfig.currency)} `}
              <span style={{ color: "#737373" }}>VNĐ</span>
            </span>
          </Col>
        </Row>
      );
    };

    const convertResultSearchVariant = () => {
      let options: any[] = [];
      resultSearchVariant?.forEach((item: VariantResponse) => {
        options.push({
          label: renderSearchVariant(item),
          value: Number(item.id),
        });
      });
      return options;
    };

    return (
      <AutoComplete
        notFoundContent={isSearching ? <Spin size="small" /> : "Không tìm thấy sản phẩm"}
        id="auto-complete-search-variant"
        autoFocus={true}
        ref={autoCompleteRef}
        value={autoCompleteValue}
        onChange={onChangeAutoCompleteValue}
        onSelect={onSearchVariantSelect}
        dropdownClassName="search-layout dropdown-search-header"
        dropdownMatchSelectWidth={360}
        onSearch={handleOnSearchProduct}
        options={convertResultSearchVariant()}
        maxLength={255}
        open={isInputSearchProductFocus}
        onFocus={onInputSearchProductFocus}
        onBlur={onInputSearchProductBlur}
        dropdownRender={(menu) => <div>{menu}</div>}
        style={{ width: "100%" }}
      >
        <Input
          placeholder="Tìm kiếm theo tên, sku sản phẩm"
          prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
        />
      </AutoComplete>
    );
  }, [
    dispatch,
    giftDataSource,
    // setGiftDataSource,
    isInputSearchProductFocus,
    isSearching,
    resultSearchVariant,
    autoCompleteValue,
    updateGiftFieldValue,
  ]);
  /** end render product column */

  const columns: Array<ICustomTableColumType<any>> = useMemo(() => {
    return [
      {
        title: "STT",
        align: "center",
        render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
        width: "70px",
      },
      {
        title: "Tên sản phẩm",
        className: "ant-col-info",
        align: "left",
        render: (value: any, item: any, index: number) => RenderProductColumn(item, index),
      },
      {
        title: "",
        align: "center",
        width: "70px",
        render: (value: string, item, index: number) => (
          <Button
            style={{ margin: "0 auto" }}
            onClick={() => handleDelete(index)}
            className="product-item-delete"
            icon={<AiOutlineClose />}
          />
        ),
      },
    ]
  }, [RenderProductColumn, handleDelete])
  

  return (
    <div>
      <div style={{ marginBottom: "12px"}}><b>QUÀ TẶNG ÁP DỤNG</b></div>
      <CustomTable
        className="product-table"
        bordered
        rowKey={(record) => record?.sku}
        rowClassName="product-table-row"
        columns={columns}
        dataSource={giftDataSource}
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: 300 }}
        footer={() => {
          return (
            <Button
              onClick={() => handleAdd()}
              icon={<PlusOutlined />}
            >
              Thêm quà tặng
            </Button>
          )
        }}
      />
    </div>
  );
};

export default GiftProduct;
