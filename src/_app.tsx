import React, { type PropsWithChildren } from 'react';
import { Granite, type InitialProps } from '@granite-js/react-native';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <>{children}</>;
}

export default Granite.registerApp(AppContainer, {
  appName: 'dayword-mbti',
  context,
  getInitialUrl: (schemeUri) => {
    const pathPart = schemeUri.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i, '');
    if (!pathPart || pathPart === '/') {
      return undefined;
    }
    return schemeUri;
  },
  router: {
    initialState: {
      index: 0,
      routes: [{ name: '/home' }],
    },
  },
});
