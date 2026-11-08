// core (MUI)
import {
  // frFR as frFRCore,
  viVN as viVNCore,
  zhCN as zhCNCore,
  // arSA as arSACore,
  koKR as koKRCore,
  jaJP as jaJPCore,
} from '@mui/material/locale';

// date pickers (MUI)
import {
  enUS as enUSDate,
  // frFR as frFRDate,
  viVN as viVNDate,
  zhCN as zhCNDate,
  koKR as koKRDate,
  jaJP as jaJPDate,
} from '@mui/x-date-pickers/locales';

// data grid (MUI)
import {
  enUS as enUSDataGrid,
  // frFR as frFRDataGrid,
  viVN as viVNDataGrid,
  zhCN as zhCNDataGrid,
  // arSD as arSDDataGrid,
  koKR as koKRDataGrid,
  jaJP as jaJPDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'US',
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'ko',
    label: '한국어',
    countryCode: 'KR',
    adapterLocale: 'ko',
    numberFormat: { code: 'ko-KR', currency: 'KRW' },
    systemValue: {
      components: { ...koKRCore.components, ...koKRDate.components, ...koKRDataGrid.components },
    },
  },
  {
    value: 'vi',
    label: 'Tiếng Việt',
    countryCode: 'VN',
    adapterLocale: 'vi',
    numberFormat: { code: 'vi-VN', currency: 'VND' },
    systemValue: {
      components: { ...viVNCore.components, ...viVNDate.components, ...viVNDataGrid.components },
    },
  },
  {
    value: 'ja',
    label: '日本語',
    countryCode: 'JP',
    adapterLocale: 'ja',
    numberFormat: { code: 'ja-JP', currency: 'JPY' },
    systemValue: {
      components: { ...jaJPCore.components, ...jaJPDate.components, ...jaJPDataGrid.components },
    },
  },
  {
    value: 'zh',
    label: '中文',
    countryCode: 'CN',
    adapterLocale: 'zh-cn',
    numberFormat: { code: 'zh-CN', currency: 'CNY' },
    systemValue: {
      components: { ...zhCNCore.components, ...zhCNDate.components, ...zhCNDataGrid.components },
    },
  },
  // {
  //   value: 'fr',
  //   label: 'French',
  //   countryCode: 'FR',
  //   adapterLocale: 'fr',
  //   numberFormat: { code: 'fr-FR', currency: 'EUR' },
  //   systemValue: {
  //     components: { ...frFRCore.components, ...frFRDate.components, ...frFRDataGrid.components },
  //   },
  // },
  // {
  //   value: 'ar',
  //   label: 'Arabic',
  //   countryCode: 'SA',
  //   adapterLocale: 'ar-sa',
  //   numberFormat: { code: 'ar', currency: 'AED' },
  //   systemValue: {
  //     components: { ...arSACore.components, ...arSDDataGrid.components },
  //   },
  // },
];


/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
