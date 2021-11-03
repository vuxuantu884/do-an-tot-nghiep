export interface YodyAction {
  type: string,
  payload: any
}

function BaseAction (type: string, payload: any): YodyAction {
  let action: YodyAction = {type: type, payload: payload};
  return action;
}

export default BaseAction;
