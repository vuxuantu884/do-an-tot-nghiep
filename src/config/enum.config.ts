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

enum EnumStore {
  ANH,
  TUNG,
  HIEU,
}

enum EnumEnvironment {
  DEV = "DEV",
  UAT = "UAT",
  PROD = "PROD",
}

enum EnumStoreAnh {
  DEV = 363,
  UAT = 198,
  PROD = 17,
}

enum EnumStoreTung {
  DEV = 364,
  UAT = 197,
  PROD = 16,
}

enum EnumStoreHieu {
  DEV = 365,
  UAT = 200,
  PROD = 19,
}

export {
  EnumUploadStatus,
  EnumImportStatus,
  EnumJobStatus,
  EnumStore,
  EnumEnvironment,
  EnumStoreAnh,
  EnumStoreTung,
  EnumStoreHieu,
};
