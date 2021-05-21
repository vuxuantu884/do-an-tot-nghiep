interface BaseResponse<T> {
  code: number;
  message: String;
  data: T;
  response_time: Date;
  errors: any
  request_id: String
}

export default BaseResponse;
