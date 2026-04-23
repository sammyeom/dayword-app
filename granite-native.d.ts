declare module '@granite-js/native' {
  import type { FC } from 'react';
  import type { StyleProp, ViewStyle } from 'react-native';

  export interface BannerAdProps {
    unitId: string;
    onAdLoaded?: () => void;
    onAdFailedToLoad?: (error: unknown) => void;
    style?: StyleProp<ViewStyle>;
  }
  export const BannerAd: FC<BannerAdProps>;

  export function loadAppsInTossAdMob(): void;
  export function showAppsInTossAdMob(): Promise<void>;

  export interface TossShareLinkParams {
    title: string;
    description?: string;
    imageUrl?: string;
  }
  export function getTossShareLink(params: TossShareLinkParams): Promise<string>;

  export interface ContactsViralParams {
    shareLink: string;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }
  export function contactsViral(params: ContactsViralParams): Promise<void>;
}
