import cogoToast from 'cogo-toast';
import { ReactNode } from 'react';

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


export const showSuccess = (msg: ReactNode) => {
  cogoToast.success(msg, option)
}

export const showError = (msg: ReactNode) => {
  cogoToast.error(msg, option)
}

export const showWarning = (msg: ReactNode) => {
  cogoToast.warn(msg, option)
}

export const showInfo = (msg: ReactNode) => {
	cogoToast.info(msg, option)
  }