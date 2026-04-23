import '@granite-js/react-native';

declare module '@granite-js/react-native' {
  export interface Navigation {
    navigate(path: string, params: Record<string, unknown>): void;
    goBack(): void;
  }
  export function useNavigation(): Navigation;

  export interface RouteOptions<T> {
    validateParams: (params: unknown) => T;
    component: React.ComponentType;
  }
  export interface RouteObject<T> {
    useParams(): T;
  }
  export function createRoute<T>(path: string, options: RouteOptions<T>): RouteObject<T>;
}
