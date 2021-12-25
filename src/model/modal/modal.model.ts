import { FormInstance } from "antd";
import BaseResponse from "base/base.response";
import { FilterConfig } from "model/other";

export type modalActionType = "create" | "edit" | "delete" | "onlyedit";

export interface CustomModalFormModel {
  visible: boolean;
  modalAction: modalActionType;
  formItem: any;
  form: FormInstance<any>;
  moreFormArguments?: any;
  lstConfigFilter? : Array<FilterConfig>
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
  lstConfigFilter?: Array<FilterConfig>
}
