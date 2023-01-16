import {
  AccountJobResponse,
  AccountResponse,
  AccountStoreResponse,
} from "model/account/account.model";

const getTypicalStore = (accountStore: AccountStoreResponse[], defaultTypicalOption: number) => {
  let stores: string[] = [];
  let otherOptionStore = 0;
  if (Array.isArray(accountStore)) {
    if (accountStore.length <= defaultTypicalOption) {
      stores = accountStore.map(({ store }) => store as string);
    } else {
      for (let index = 0; index < defaultTypicalOption; index++) {
        stores.push(accountStore[index].store as string);
      }
    }
    otherOptionStore = accountStore.length - stores.length;
  }

  return {
    stores,
    otherOptionStore,
  };
};

const getTypicalDepartment = (accountJob: AccountJobResponse[], defaultTypicalOption: number) => {
  let departments: string[] = [];
  let otherOptionDepartment = 0;

  if (Array.isArray(accountJob)) {
    const myDeparments = accountJob.filter((job) => job.department);
    if (myDeparments.length <= defaultTypicalOption) {
      departments = myDeparments.map(({ department }) => department as string);
    } else {
      for (let index = 0; index < defaultTypicalOption; index++) {
        departments.push(myDeparments[index].department as string);
      }
      otherOptionDepartment = myDeparments.length - departments.length;
    }
  }

  return {
    departments,
    otherOptionDepartment,
  };
};

const getTypicalPosition = (accountJob: AccountJobResponse[], defaultTypicalOption: number) => {
  let positions: string[] = [];
  let otherOptionPosition = 0;
  if (Array.isArray(accountJob)) {
    const myPositions = accountJob.filter((job) => job.position);
    if (myPositions.length <= defaultTypicalOption) {
      positions = myPositions.map(({ position }) => position as string);
    } else {
      for (let index = 0; index < defaultTypicalOption; index++) {
        positions.push(myPositions[index].position as string);
      }
      otherOptionPosition = myPositions.length - positions.length;
    }
  }

  return {
    positions,
    otherOptionPosition,
  };
};

export const convertDataApiToDataSrcTable = (
  accountResponseList: AccountResponse[],
  defaultTypicalOption: number,
) => {
  const dataSrc = accountResponseList.map((account) => {
    return {
      ...account,
      ...getTypicalStore(account.account_stores, defaultTypicalOption),
      ...getTypicalDepartment(account.account_jobs, defaultTypicalOption),
      ...getTypicalPosition(account.account_jobs, defaultTypicalOption),
    };
  });
  return dataSrc;
};

export const ACTIONS_KEY_SELECT_ACCOUNT = {
  DELETE: 1,
  RESET_PASSWORD: 2,
};
