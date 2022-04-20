import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Form, FormInstance, Input, Modal, ModalProps, Row, Select, Table } from 'antd'
import BaseSelectPaging from 'component/base/BaseSelect/BaseSelectPaging'
import NumberInput from 'component/custom/number-input.custom'
import CustomSelect from 'component/custom/select.custom'
import useFetchColors from 'hook/useFetchColor'
import useFetchSizes from 'hook/useFetchSizes'
import _ from 'lodash'
import { ColorResponse } from 'model/product/color.model'
import { VariantRequestView, VariantResponse } from 'model/product/product.model'
import { SizeResponse } from 'model/product/size.model'
import { RootReducerType } from 'model/reducers/RootReducerType'
import React, { useEffect } from 'react'
import { BiTrash } from 'react-icons/bi'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { formatCurrencyForProduct, replaceFormatString } from 'utils/AppUtils'
import { ProductParams } from '../ProductDetailScreen'

const { Item } = Form
const { Option } = Select

type Props = ModalProps & {
    form: FormInstance;
    onFinish: (value: any) => void;
}

function AddVariantsModal(props: Props) {
    const { form, onFinish, onCancel, onOk, ...rest } = props
    const { id } = useParams<ProductParams>();
    const productId = parseInt(id);
    /**
     * Nếu cần custom nhiều hơn thì đưa các action ra ngoài, vd: button đóng mở, button lưu ...
     * Tạm thời để gọn trong 1 component cho đỡ rối code ở component cha
     */
    const [visible, setVisible] = React.useState(false);
    const [sizeSelectedList, setSizeSelectedList] = React.useState<SizeResponse[]>([])
    const [colorSelectedList, setColorSelectedList] = React.useState<ColorResponse[]>([])

    const [variantTempList, setVariantTempList] = React.useState<VariantRequestView[]>([])

    const modalInputField = "variantsInput";

    const exitedVariants: Array<VariantResponse> = form.getFieldValue("variants");

    const currencyList = useSelector(
        (state: RootReducerType) => state.bootstrapReducer.data?.currency
    );
    const weightUnitList = useSelector(
        (state: RootReducerType) => state.bootstrapReducer.data?.weight_unit
    );
    const lengthUnitList = useSelector(
        (state: RootReducerType) => state.bootstrapReducer.data?.length_unit
    );

    const { fetchColor, color, isColorLoading } = useFetchColors();
    const { fetchSizes, sizes, isSizeLoading } = useFetchSizes();

    const onClose = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setVisible(false);
        onCancel?.(e)
    }

    const onOpen = () => {
        form.setFieldsValue({
            [modalInputField]: {
                color_id: [],
                size_id: []
            }
        })
        setVariantTempList([]);
        setVisible(true);
    }

    const handleSubmitAddVariants = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        /**
         * validate and get data
         */
        form.validateFields(
            [[modalInputField, "weight"],
            [modalInputField, "retail_price"],
            [modalInputField, "currency_code"]
            ]

        ).then(values => {
            const modalValue = form.getFieldValue(modalInputField);
            console.log("validate success ", modalValue);
            /**
             * Validate success
             */
            const { cost_price,
                currency_code,
                import_price,
                tax_percent,
                retail_price,
                wholesale_price,
                height,
                length,
                length_unit,
                weight,
                weight_unit,
                width
            } = modalValue;
            /**
             * mapping variant data
             */

            const variantList = variantTempList.map(variant => ({
                ...variant,
                id: null,
                variant_images: [],
                quantity: 0,
                status: "active",
                composite: false,
                composites: [],
                product_id: productId,
                saleable: true,
                variant_prices: [
                    {
                        cost_price,
                        currency_code,
                        import_price,
                        retail_price,
                        tax_percent,
                        wholesale_price
                    }
                ],
                height,
                length,
                length_unit,
                weight,
                weight_unit,
                width
            }))
            form.setFieldsValue({
                variants: [...exitedVariants, ...variantList]
            })
            setVisible(false);

            /**
             * Nếu có sp mới thêm vào thì focus vào sp mới thêm và thay đổi cở isChange
             */
            if (variantList.length > 0) {
                onOk?.(e);
            }
        }).catch(info => {
            console.log("Validate Failed:", info)
        })
    }

    const removeDuplicateVariant = () => {
        const variantList: VariantRequestView[] = variantTempList.filter(variant => typeof variant.color_id !== "number" || typeof variant.size_id === "number");
        setVariantTempList(variantList);
    }

    const handleCombineVariants = (colorIdList: number[], sizeIdList: number[],
        colorSelectedList: ColorResponse[], sizeSelectedList: SizeResponse[]) => {
        const variantName = form.getFieldValue("name");
        const variantCode = form.getFieldValue("code");

        /**
         * Load color list by id
         */


        if (variantName && variantCode) {
            const newVariants: Array<any> = [];
            /**
             * Case có màu và không có size
             */
            if (colorIdList.length > 0 && sizeIdList.length === 0) {
                colorIdList.forEach(colorId => {
                    if (!checkVariantExisted(colorId, null)) {
                        const color = colorSelectedList.find((cs) => cs.id === colorId);
                        if (color) {
                            const sku = `${variantCode}-${color.code}`;
                            newVariants.push({
                                name: `${variantName} - ${color.name}`,
                                color_id: color.id,
                                color: color.name,
                                size_id: null,
                                size: null,
                                sku: sku,
                            })
                        }
                    }
                })
            }

            /**
             * Case có size và không có màu
             */
            if (colorIdList.length === 0 && sizeIdList.length > 0) {
                sizeIdList.forEach(sizeId => {
                    if (!checkVariantExisted(null, sizeId)) {
                        const size = sizeSelectedList.find((cs) => cs.id === sizeId);
                        if (size) {
                            const sku = `${variantCode}-${size.code}`;
                            newVariants.push({
                                name: `${variantName} - ${size.code}`,
                                color_id: null,
                                color: null,
                                size_id: size.id,
                                size: size.code,
                                sku: sku,
                            })
                        }
                    }
                })
            }
            if (colorIdList.length > 0 && sizeIdList.length > 0) {
                removeDuplicateVariant();
                colorIdList.forEach((colorId) => {
                    const color = colorSelectedList.find((cs) => cs.id === colorId);
                    if (color) {
                        sizeIdList.forEach((sizeId) => {
                            if (!checkVariantExisted(color.id, sizeId)) {
                                const size = sizeSelectedList.find((ss) => ss.id === sizeId);
                                if (size) {

                                    const sku = `${variantCode}-${color.code}-${size.code}`;
                                    newVariants.push({
                                        name: `${variantName} - ${color.name} - ${size.code}`,
                                        color_id: color.id,
                                        color: color.name,
                                        size_id: size.id,
                                        size: size.code,
                                        sku: sku,
                                    });
                                }
                            }
                        });
                    }
                });
            }

            /**
             * Add new variants to temp list
             * make list unique by sku
             */
            setVariantTempList((prev) => {
                const newVariantList = _.uniqBy([...prev, ...newVariants], 'sku');
                return newVariantList
            });
        }
    }

    /**
     * Nếu có 1 variant trùng color và size thì return true
     * @param colorId 
     * @param sizeId 
     * @returns boolean
     */
    const checkVariantExisted = (colorId: number | null, sizeId: number | null) => {
        return exitedVariants?.find(variant => {
            return variant.color_id === colorId && variant.size_id === sizeId
        });
    }

    const onSizeChange = (values: number[]) => {
        if (Array.isArray(values) && values.length === 0) {
            return;
        }
        const lastSizeId = values[values.length - 1];
        /**
         * Set size selected
         * Vì select color/size dạng pagging nên sẽ mất item khi thay đổi page nên phải lưu lại những item đã chọn để combine variants
         */
        const selectedSize = sizes?.items?.find(i => i.id === lastSizeId);
        let newSizeSelectedList: SizeResponse[] = [];
        if (selectedSize) {
            newSizeSelectedList = [...sizeSelectedList, selectedSize];
            setSizeSelectedList((prev) => newSizeSelectedList)
        }

        /**
         * Check if size is selected and color list is selected
         * => combine variants by last size selected and color list
         */
        const inputtingColor = form.getFieldValue([modalInputField, "color_id"]);

        handleCombineVariants(inputtingColor, values, colorSelectedList, newSizeSelectedList);
    }

    const onColorChange = (values: number[]) => {
        if (Array.isArray(values) && values.length === 0) {
            return;
        }
        const lastColorId = values[values.length - 1];
        /**
         * Set color selected
         * Vì select color/size dạng pagging nên sẽ mất item khi thay đổi page nên phải lưu lại những item đã chọn để combine variants
         */

        const selectedColor = color?.items?.find(i => i.id === lastColorId)
        let newSelectedColorList: ColorResponse[] = []
        if (selectedColor) {
            newSelectedColorList = [...colorSelectedList, selectedColor]
            setColorSelectedList(newSelectedColorList)
        }

        /**
         * Check if color is selected and size list is selected
         * => combine variants by last color selected and size list
         */
        const inputtingSize = form.getFieldValue([modalInputField, "size_id"]);
        // if (typeof lastColorId === "number" && Array.isArray(inputtingSize) && inputtingSize.length > 0) {
        handleCombineVariants(values, inputtingSize, newSelectedColorList, sizeSelectedList);
        // }
    }

    const handleRemoveItemTable = (sku: string) => {
        const newVariantList = variantTempList.filter((v) => v.sku !== sku);
        setVariantTempList(newVariantList);
    }

    useEffect(() => {
        form.setFieldsValue({
            [modalInputField]: {
                currency_code: "VNĐ",
                weight_unit: "g",
                length_unit: "cm",
                color_id: [],
                size_id: []
            }
        })
    }, [form]);

    return (
        <>
            <Button
                onClick={onOpen}
                type="link"
                icon={<PlusOutlined />}
            >
                Thêm phiên bản
            </Button>
            <Modal
                visible={visible}
                onCancel={onClose}
                onOk={handleSubmitAddVariants}
                title="Thêm phiên bản sản phẩm"
                okText="Thêm mới"
                width={900}
                {...rest}>
                <Form layout='vertical' form={form} onFinish={onFinish}>
                    <Row gutter={20}>
                        <Col md={12}>
                            <Item
                                required
                                label="Khối lượng"
                                tooltip={{
                                    title: "Nhập khối lượng của sản phẩm",
                                    icon: <InfoCircleOutlined />,
                                }}
                            >
                                <Input.Group compact>
                                    <Item
                                        rules={[
                                            {
                                                required: true,
                                                message: "Khối lượng không được để trống",
                                            },
                                        ]}
                                        name={[modalInputField, "weight"]}
                                        noStyle
                                    >
                                        <NumberInput
                                            isFloat
                                            maxLength={6}
                                            placeholder="Khối lượng"
                                            style={{
                                                width: "calc(100% - 100px)",
                                            }}
                                        />
                                    </Item>
                                    <Item name={[modalInputField, "weight_unit"]} noStyle>
                                        <Select
                                            placeholder="Đơn vị"
                                            style={{ width: "100px" }}
                                            value="gram"
                                        >
                                            {weightUnitList?.map((item) => (
                                                <Select.Option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Item>
                                </Input.Group>
                            </Item>
                        </Col>
                        <Col md={12}>
                            <Item
                                label="Kích thước (dài, rộng, cao)"
                                tooltip={{
                                    title:
                                        "Thông tin kích thước khi đóng gói sản phẩm",
                                    icon: <InfoCircleOutlined />,
                                }}
                            >
                                <Input.Group compact>
                                    <Item name={[modalInputField, "length"]} noStyle>
                                        <NumberInput
                                            isFloat
                                            maxLength={6}
                                            style={{
                                                width: "calc((100% - 100px) / 3)",
                                            }}
                                            placeholder="Dài"
                                        />
                                    </Item>
                                    <Item name={[modalInputField, "width"]} noStyle>
                                        <NumberInput
                                            isFloat
                                            maxLength={6}
                                            style={{
                                                width: "calc((100% - 100px) / 3)",
                                            }}
                                            placeholder="Rộng"
                                        />
                                    </Item>
                                    <Item name={[modalInputField, "height"]} noStyle>
                                        <NumberInput
                                            isFloat
                                            maxLength={6}
                                            placeholder="Cao"
                                            style={{
                                                width: "calc((100% - 100px) / 3)",
                                            }}
                                        />
                                    </Item>
                                    <Item name={[modalInputField, "length_unit"]} noStyle>
                                        <Select
                                            placeholder="Đơn vị"
                                            style={{ width: "100px" }}
                                        >
                                            {lengthUnitList?.map((item) => (
                                                <Select.Option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Item>
                                </Input.Group>
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col md={4}>
                            <Item
                                label="Giá bán"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Giá bán không được để trống",
                                    },
                                ]}
                                name={[modalInputField, "retail_price"]}
                                tooltip={{
                                    title: (
                                        <div>
                                            <b>Giá bán lẻ</b> là giá mà bạn
                                            sẽ bán sản phẩm này cho những
                                            khách hàng đơn lẻ..
                                        </div>
                                    ),
                                    icon: <InfoCircleOutlined />,
                                }}
                            >
                                <NumberInput
                                    format={(a: string) =>
                                        formatCurrencyForProduct(a)
                                    }
                                    replace={(a: string) =>
                                        replaceFormatString(a)
                                    }
                                    placeholder="VD: 100,000"
                                    maxLength={15}
                                />
                            </Item>
                        </Col>
                        <Col md={4}>
                            <Item
                                name={[modalInputField, "wholesale_price"]}
                                label="Giá buôn"
                                tooltip={{
                                    title: () => (
                                        <div>
                                            <b>Giá buôn</b> là giá mà bạn sẽ
                                            bán sản phẩm này cho những khách
                                            hàng mua hàng với số lượng lớn.
                                        </div>
                                    ),
                                    icon: <InfoCircleOutlined />,
                                }}
                            >
                                <NumberInput
                                    format={(a: string) =>
                                        formatCurrencyForProduct(a)
                                    }
                                    replace={(a: string) =>
                                        replaceFormatString(a)
                                    }
                                    placeholder="VD: 100,000"
                                    maxLength={15}
                                />
                            </Item>
                        </Col>
                        <Col md={4}>
                            <Item
                                name={[modalInputField, "import_price"]}
                                label="Giá nhập"
                                tooltip={{
                                    title: () => (
                                        <div>
                                            <b>Giá nhập</b> là giá mà nhập
                                            sản phẩm từ đơn mua hàng của nhà
                                            cung cấp.
                                        </div>
                                    ),
                                    icon: <InfoCircleOutlined />,
                                }}
                            >
                                <NumberInput
                                    format={(a: string) =>
                                        formatCurrencyForProduct(a)
                                    }
                                    replace={(a: string) =>
                                        replaceFormatString(a)
                                    }
                                    placeholder="VD: 100,000"
                                    maxLength={15}
                                />
                            </Item>
                        </Col>
                        <Col md={4}>
                            <Item
                                name={[modalInputField, "cost_price"]}
                                label="Giá vốn"
                                tooltip={{
                                    title: () => (
                                        <div>
                                            <b>Giá vốn</b> là tổng của những
                                            loại chi phí để đưa hàng có mặt
                                            tại kho. Chúng bao gồm giá mua
                                            của nhà cung cấp, thuế giá trị
                                            gia tăng, chi phí vận chuyển,
                                            bảo hiểm,...
                                        </div>
                                    ),
                                    icon: <InfoCircleOutlined />,
                                }}
                            >
                                <NumberInput
                                    format={(a: string) =>
                                        formatCurrencyForProduct(a)
                                    }
                                    replace={(a: string) =>
                                        replaceFormatString(a)
                                    }
                                    placeholder="VD: 100,000"
                                    maxLength={15}
                                />
                            </Item>
                        </Col>
                        <Col md={4}>
                            <Item
                                label="Thuế"
                                name={[modalInputField, "tax_percent"]}
                                rules={[
                                    {
                                        type: "number",
                                        max: 100,
                                        message: "Phần trăm thuế phải nhỏ hơn 100",
                                    },
                                ]}
                            >
                                <NumberInput
                                    placeholder="VD: 10"
                                    suffix={<span>%</span>}
                                    maxLength={15}
                                />
                            </Item>
                        </Col>
                        <Col md={4}>
                            <Item
                                label="Đơn vị tiền tệ"
                                tooltip={{
                                    title: "Tooltip",
                                    icon: <InfoCircleOutlined />,
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Đơn vị tiền tệ không được để trống",
                                    },
                                ]}
                                name={[modalInputField, "currency_code"]}
                            >
                                <CustomSelect
                                    placeholder="Đơn vị tiền tệ"

                                >
                                    {currencyList?.map((item) => (
                                        <CustomSelect.Option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.name}
                                        </CustomSelect.Option>
                                    ))}
                                </CustomSelect>
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col md={12}>
                            <Item name={[modalInputField, "color_id"]} label="Màu sắc">
                                <BaseSelectPaging<ColorResponse> mode='multiple' onChange={onColorChange}
                                    fetchData={fetchColor}
                                    metadata={color.metadata}
                                    data={color.items}
                                    renderItem={(item) => (
                                        <Option key={item.code} value={item.id}>
                                            {item.code} - {item.name}
                                        </Option>
                                    )}
                                    onSearch={(value) => {
                                        fetchColor({ info: value })
                                    }}
                                    filterOption={() => true}
                                    showArrow
                                    loading={isColorLoading}
                                    placeholder="Chọn màu sắc"
                                />
                            </Item>
                        </Col>
                        <Col md={12}>
                            <Item name={[modalInputField, "size_id"]} label="Kích cỡ">
                                <BaseSelectPaging<SizeResponse> mode='multiple' onChange={onSizeChange}
                                    fetchData={fetchSizes}
                                    metadata={sizes.metadata}
                                    data={sizes.items}
                                    renderItem={(item) => (
                                        <Option key={item.code} value={item.id}>
                                            {item.code}
                                        </Option>
                                    )}
                                    onSearch={(value) => {
                                        fetchSizes({ code: value })
                                    }}
                                    filterOption={() => true}
                                    showArrow
                                    loading={isSizeLoading}
                                    placeholder="Chọn sizes"
                                />
                            </Item>
                        </Col>
                    </Row>
                    <Table dataSource={variantTempList}
                        pagination={false}
                        columns={
                            [
                                {
                                    title: "Mã phiên bản",
                                    dataIndex: "sku",
                                },
                                {
                                    title: "Tên sản phẩm",
                                    dataIndex: "name",
                                },
                                {
                                    title: "Màu sắc",
                                    dataIndex: "color"
                                },
                                {
                                    title: "Size",
                                    dataIndex: "size"
                                },
                                {
                                    title: "Thao tác",
                                    dataIndex: "sku",
                                    render: (sku: any) => (
                                        <div>
                                            <Button icon={<BiTrash />} onClick={() => handleRemoveItemTable(sku)} />
                                        </div>
                                    )
                                }
                            ]
                        }
                    >
                    </Table>
                </Form>
            </Modal>

        </>
    )
}

export default AddVariantsModal