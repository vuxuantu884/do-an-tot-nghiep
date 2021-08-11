export interface PrintEditorModel {
  initialValue?: string;
  onChange: (value: string) => void;
}

export interface PrintPreviewModel {
  htmlContent?: string;
}
