declare module 'react-native-toast-message' {
  import React from 'react';
  
  export type ToastType = 'success' | 'error' | 'info';
  
  export interface ToastProps {
    type: ToastType;
    position?: 'top' | 'bottom';
    text1?: string;
    text2?: string;
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
    onShow?: () => void;
    onHide?: () => void;
    onPress?: () => void;
    props?: any;
  }
  
  export interface ToastConfigParams<T = any> {
    type: ToastType;
    text1?: string;
    text2?: string;
    props?: T;
    position?: 'top' | 'bottom';
    onPress?: () => void;
    onShow?: () => void;
    onHide?: () => void;
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
    isVisible?: boolean;
    hide?: () => void;
  }
  
  export interface ToastConfig {
    success?: (params: ToastConfigParams) => React.ReactNode;
    error?: (params: ToastConfigParams) => React.ReactNode;
    info?: (params: ToastConfigParams) => React.ReactNode;
    [key: string]: ((params: ToastConfigParams) => React.ReactNode) | undefined;
  }
  
  export interface ToastShowParams extends ToastProps {
    type: ToastType;
    position?: 'top' | 'bottom';
    text1?: string;
    text2?: string;
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
    onShow?: () => void;
    onHide?: () => void;
  }
  
  export interface Toast {
    show(params: ToastShowParams): void;
    hide(): void;
    setRef(ref: any): void;
  }
  
  // Toast component
  export default class ToastMessage extends React.Component<{
    config?: ToastConfig;
    ref?: React.RefObject<any>;
  }> {
    static setRef(ref: any): void;
    static show(params: ToastShowParams): void;
    static hide(): void;
  }
} 