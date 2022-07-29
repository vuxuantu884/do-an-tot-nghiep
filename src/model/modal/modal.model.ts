import { FormInstance } from "antd";
import { FilterConfig } from "model/other";
import { OrderSourceModel } from "model/response/order/order-source.response";

export type modalActionType = "create" | "edit" | "delete" | "onlyedit";

export interface CustomModalFormModel {
  visible: boolean;
  modalAction: modalActionType;
  formItem: any;
  form: FormInstance<any>;
  moreFormArguments?: any;
  lstConfigFilter?: Array<FilterConfig>;
  onEdit?: (value: OrderSourceModel) => void;
  onCreate?: (value: OrderSourceModel) => void;
  setVisibleForm?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface CustomModalType {
  visible: boolean;
  onCreate: (formValue: any) => void;
  onEdit: (formValue: any) => void;
  onDelete: (formValue: any) => void;
  onCancel: (formValue: any) => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  modalAction: modalActionType;
  modalTypeText: string;
  deletedItemTitle?: string;
  componentForm: React.FC<CustomModalFormModel>;
  formItem: any;
  moreFormArguments?: any;
  createText?: string;
  updateText?: string;
  lstConfigFilter?: Array<FilterConfig>;
}
