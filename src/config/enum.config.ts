enum EnumImportStatus {
  error = "ERROR",
  success = "SUCCESS",
  done = "DONE",
  processing = "PROCESSING",
  removed = "REMOVED",
}

enum EnumUploadStatus {
  error = "error",
  success = "success",
  done = "done",
  uploading = "uploading",
  removed = "removed",
}

enum EnumJobStatus {
  finish = "FINISH",
  error = "ERROR",
  success = "SUCCESS",
  processing = "PROCESSING",
}

export {EnumUploadStatus, EnumImportStatus, EnumJobStatus};
