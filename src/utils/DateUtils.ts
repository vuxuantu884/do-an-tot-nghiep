import moment from 'moment';


export const convertToLocalDate = (date: Date | string | number) => {
  let dateChange = moment.utc(date).format('DD/MM/YYYY HH:mm:ss');
  return dateChange;
}

export const convertDateToUTC = (date: Date | string | number) => {
  return moment(date).toISOString()
}