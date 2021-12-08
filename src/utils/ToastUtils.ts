import cogoToast from 'cogo-toast';

const option: Partial<{
	hideAfter: number;
	position:
		| 'top-left'
		| 'top-center'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right';
	heading: string;
	role: string;
	toastContainerID: string;
	renderIcon: Function;
	bar: Partial<{
		size: string;
		style: 'solid' | 'dashed' | 'dotted';
		color: string;
	}>}> = {
  position: 'top-right'
};


export const showSuccess = (msg: string) => {
  cogoToast.success(msg, option)
}

export const showError = (msg: string) => {
  cogoToast.error(msg, option)
}

export const showWarning = (msg: string) => {
  cogoToast.warn(msg, option)
}

export const showInfo = (msg: string) => {
	cogoToast.info(msg, option)
  }