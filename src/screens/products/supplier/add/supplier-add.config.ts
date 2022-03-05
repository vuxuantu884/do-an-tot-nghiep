import { ComponentType, FormFields, FormFieldType } from "./supplier-add.type";
import { RegUtil } from "../../../../utils/RegUtils";
import { SupplierCreateRequest } from "../../../../model/core/supplier.model";
import { AppConfig } from "../../../../config/app.config";
import { VietNamId } from "../../../../utils/Constants";

const DefaultCountry = VietNamId;

export const FormConfigs: FormFieldType = {
  INFO: {
    key: "info",
    title: "Thông tin cơ bản",
    extra: true,
    formGroups: [
      [
        {
          name: FormFields.type,
          label: "Loại nhà cung cấp",
          placeholder: "",
          type: "text",
          componentType: ComponentType.Radio,
          rules: [
            {
              required: true,
              message: "Vui lòng chọn loại nhà cung cấp",
            },
          ],
        },
        {
          name: FormFields.code,
          label: "Mã nhà cung cấp",
          placeholder: "Nhập mã nhà cung cấp",
          type: "text",
          componentType: ComponentType.Input,
          disabled: true,
        },
      ],
      [
        {
          name: FormFields.name,
          label: "Tên nhà cung cấp",
          placeholder: "Nhập tên nhà cung cấp",
          type: "text",
          componentType: ComponentType.Input,
          rules: [
            {
              required: true,
              message: "Vui lòng nhập tên nhà cung cấp",
            },
          ],
        },
        {
          name: FormFields.scorecard,
          label: "Phân cấp nhà cung cấp",
          placeholder: "Chọn phân cấp nhà cung cấp",
          type: "text",
          componentType: ComponentType.Select,
        },
      ],
      [
        {
          name: FormFields.pic_code,
          label: "Merchandiser",
          placeholder: "Chọn merchandiser",
          type: "text",
          componentType: ComponentType.SelectPaging,
          rules: [
            {
              required: true,
              message: "Vui lòng chọn Merchandiser",
            },
          ],
        },
        {
          name: FormFields.tax_code,
          label: "Mã số thuế",
          placeholder: "Nhập mã số thuế",
          type: "text",
          componentType: ComponentType.Input,
          rules: [
            {
              pattern: RegUtil.NUMBERREG,
              message: "Mã số thuế chỉ được phép nhập số",
            },
            {
              required: true,
              message: "Nhà cung cấp là doanh nghiệp phải nhập mã số thuế",
            },
          ],
        },
      ],
      [
        {
          name: FormFields.phone,
          label: "Số điện thoại",
          placeholder: "Nhập số điện thoại",
          type: "text",
          componentType: ComponentType.Input,
          rules: [
            { required: true, message: "Vui lòng nhập số điện thoại" },
            { validator: undefined },
          ],
        },
        {
          name: FormFields.collection_id,
          label: "Nhóm hàng",
          placeholder: "Nhập nhóm hàng",
          type: "text",
          componentType: ComponentType.SelectPaging,
        },
      ],
    ],
  },
  ADDRESS: {
    key: "addresses",
    title: "Địa chỉ nhà cung cấp",
    extra: false,
    formGroups: [
      [
        {
          name: FormFields.country_id,
          label: "Quốc gia",
          placeholder: "Chọn quốc gia",
          type: "select",
          componentType: ComponentType.Select,
          rules: [
            {
              required: true,
              message: "Quốc gia không được để trống",
            },
          ],
        },
        {
          name: FormFields.city_id,
          label: "",
          placeholder: "",
          type: "input",
          componentType: ComponentType.Input,
          hidden: true,
        },
        {
          name: FormFields.district_id,
          label: "Khu vực",
          placeholder: "Chọn khu vực",
          type: ComponentType.Select,
          componentType: ComponentType.Select,
        },
      ],
      [
        {
          name: FormFields.address,
          label: "Địa chỉ",
          placeholder: "Nhập địa chỉ",
          type: "text",
          componentType: ComponentType.Input,
          rules: [
            {
              required: true,
              message: "Vui lòng nhập địa chỉ",
            },
          ],
          fullWidth: true,
        },
      ],
    ],
  },
  DETAIL: {
    key: "detail",
    title: "Chi tiết nhà cung cấp",
    extra: false,
    formGroups: [
      [
        {
          name: FormFields.moq,
          label: "Số lượng đặt hàng tối thiểu",
          placeholder: "Nhập số lượng",
          type: "select",
          componentType: ComponentType.Select,
        },
        {
          name: FormFields.moq_unit,
          label: "Thời gian công nợ",
          placeholder: "Nhập thời gian công nợ",
          type: "input",
          componentType: ComponentType.Input,
        },
      ],
      [
        {
          name: FormFields.debt_time_unit,
          label: "Ghi chú",
          placeholder: "Nhập ghi chú",
          type: "text",
          componentType: ComponentType.InputArea,
          maxLength: 500,
          fullWidth: true,
        },
      ],
    ],
  },
  CONTACT: {
    key: "contacts",
    title: "Thông tin liên hệ",
    extra: false,
    formGroups: [
      [
        {
          name: FormFields.contact_name,
          label: "Tên người liên hệ",
          placeholder: "Nhập tên người liên hệ",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
      [
        {
          name: FormFields.contact_position,
          label: "Chức vụ",
          placeholder: "Nhập chức vụ",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
          rules: [{required: true}]
        },
      ],
      [
        {
          name: FormFields.contact_phone,
          label: "SĐT người liên hệ",
          placeholder: "Nhập số điện thoại liên hệ",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
      [
        {
          name: FormFields.contact_fax,
          label: "Fax",
          placeholder: "Nhập số fax liên hệ",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
      [
        {
          name: FormFields.contact_email,
          label: "Email",
          placeholder: "Nhập email",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
      [
        {
          name: FormFields.contact_website,
          label: "Website",
          placeholder: "Nhập website",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
    ],
  },
  PAYMENT: {
    key: "payments",
    title: "Thông tin thanh toán",
    extra: false,
    formGroups: [
      [
        {
          name: FormFields.payment_name,
          label: "Ngân hàng",
          placeholder: "",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
      [
        {
          name: FormFields.payment_brand,
          label: "Chi nhánh",
          placeholder: "",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
      [
        {
          name: FormFields.payment_number,
          label: "Số tài khoản",
          placeholder: "Nhập số tài khoản",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
      [
        {
          name: FormFields.payment_beneficiary,
          label: "Người thụ hưởng",
          placeholder: "Nhập chủ tài khoản",
          type: "input",
          componentType: ComponentType.Input,
          maxLength: 225,
        },
      ],
    ],
  },
};

export const initialSupplierForm: SupplierCreateRequest = {
  bank_brand: "",
  bank_name: "",
  bank_number: "",
  beneficiary_name: "",
  certifications: [],
  debt_time: null,
  debt_time_unit: null,
  goods: [AppConfig.FASHION_INDUSTRY],
  person_in_charge: null,
  collection_id: null,
  moq: null,
  note: "",
  name: "",
  scorecard: null,
  status: "active",
  tax_code: "",
  type: "",
  addresses: [
    {
      id: null,
      address: "",
      city_id: null,
      country_id: DefaultCountry,
      district_id: null,
      is_default: true,
      supplier_id: null,
    },
  ],
  contacts: [
    {
      id: null,
      name: "",
      email: "",
      fax: "",
      is_default: true,
      phone: "",
      website: "",
      supplier_id: null,
      position: "",
    },
  ],
  payments: [
    {
      id: null,
      name: "",
      beneficiary: "",
      brand: "",
      number: "",
      supplier_id: null,
    },
  ],
};
