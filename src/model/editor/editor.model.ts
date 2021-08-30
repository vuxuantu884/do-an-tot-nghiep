export interface keywordsModel {
  name: string;
  value: string;
  preview_value?: string;
  isShow?: boolean;
  key?: number | string;
}

export interface productKeywordsModel {
  name: string;
  value: string;
  preview_value: string;
  isShow?: boolean;
  preview_value_format?: string[];
}

export interface listKeywordsModel {
  name: string;
  list?: keywordsModel[];
}

export interface EditorModel {
  initialHtmlContent: string;
  onChange: (data: string) => void;
  listKeywords?: listKeywordsModel;
}

export interface EditorModalType {
  isModalVisible: boolean;
  handleCancel: () => void;
  insertKeyword: (text: string) => void;
  listKeywords?: listKeywordsModel[];
  listProductKeywords?: productKeywordsModel[];
}

export interface PrintEditorModel {
  initialValue?: string;
  onChange: (value: string) => void;
}

export interface PrintPreviewModel {
  htmlContent: string;
  listKeywords?: listKeywordsModel[];
  listProductKeywords?: {
    name: string;
    list: productKeywordsModel[];
  };
  previewHeaderHeight?: number;
  isShowEditor?: boolean;
  onChangeShowEditor: (isShow: boolean) => void;
}
