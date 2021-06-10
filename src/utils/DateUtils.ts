import moment from 'moment';


export const convertUtcToLocalDate = (date: Date | string | number) => {
  let dateChange = moment.utc(date).format('DD/MM/YYYY HH:mm:ss');
  return dateChange;
}

export const convertDateToUtc = (date: Date | string | number) => {
  return moment(date).utc().format()
}