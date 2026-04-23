declare module '@apps-in-toss/native-modules' {
  export function getTossShareLink(scheme: string): Promise<string>;
  export function share(params: { message: string }): Promise<void>;

  export interface PaymentRequest {
    productId: string;
    productName: string;
    amount: number;
    productType: 'consumable' | 'non-consumable' | 'subscription';
  }
  export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    errorCode?: string;
    errorMessage?: string;
  }
  export function requestPayment(params: PaymentRequest): Promise<PaymentResult>;

  // 키-값 저장소 (유저 식별키 기반 데이터 영속화)
  export const Storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clearItems(): Promise<void>;
  };

  // 결제 내역 조회 (기기 변경 시에도 유지)
  export interface PurchaseHistoryItem {
    transactionId: string;
    productId: string;
    productName: string;
    amount: number;
    purchasedAt: string;
    status: 'completed' | 'cancelled' | 'refunded';
  }
  export function getPurchaseHistory(): Promise<PurchaseHistoryItem[]>;

  // 결제 복원 (기기 변경 후 기존 결제 데이터 복원)
  export function restorePurchases(): Promise<PurchaseHistoryItem[]>;
}

declare module '@apps-in-toss/framework' {
  import type { FC } from 'react';

  export interface InlineAdProps {
    adGroupId: string;
    theme?: 'light' | 'dark';
    tone?: 'blackAndWhite' | 'color';
    variant?: 'card' | 'banner';
    impressFallbackOnMount?: boolean;
    onNoFill?: () => void;
    onAdFailedToRender?: () => void;
  }
  export const InlineAd: FC<InlineAdProps>;

  // 전면 광고 (리워드 광고 포함)
  export interface FullScreenAdEvent {
    type: 'loaded' | 'show' | 'failedToShow' | 'impression' | 'clicked' | 'dismissed' | 'userEarnedReward' | 'requested';
    data?: unknown;
  }
  export interface FullScreenAdParams {
    options: { adGroupId: string };
    onEvent: (event: FullScreenAdEvent) => void;
    onError: (error: Error) => void;
  }
  export function loadFullScreenAd(params: FullScreenAdParams): () => void;
  export function showFullScreenAd(params: FullScreenAdParams): () => void;
}

declare module '@apps-in-toss/framework/plugins' {
  export interface AppsInTossConfig {
    appType: 'general' | 'game';
    brand: {
      displayName: string;
      primaryColor: string;
      icon: string;
    };
    permissions: string[];
    navigationBar: {
      withBackButton: boolean;
      withHomeButton: boolean;
    };
    bridgeColorMode?: 'basic' | 'extended';
  }
  export function appsInToss(config: AppsInTossConfig): import('@granite-js/plugin-core').GranitePlugin;
}
