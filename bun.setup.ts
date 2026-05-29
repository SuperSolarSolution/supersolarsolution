import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

const localStorageMock = {
  getItem: () => {},
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => {}
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});
