import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

const theme = extendTheme({
  components: {
    Tabs: {
      baseStyle: {
        tab: {
          _selected: {
            bg: '#243286',
            color: 'white',
          },
          _hover: {
            bg: '#243286',
            color: 'white',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'full',
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: 'full',
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 'full',
        bg: '#243286',
        color: 'white',
        _hover: {
          bg: '#1f2d60',
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter> {/* Wrap your app with BrowserRouter */}
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
);
