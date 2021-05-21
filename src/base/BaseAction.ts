export interface YodyAction {
  type: String,
  payload: any
}

function BaseAction (type: String, payload: any): YodyAction {
  let action: YodyAction = {type: type, payload: payload};
  return action;
}

export default BaseAction;