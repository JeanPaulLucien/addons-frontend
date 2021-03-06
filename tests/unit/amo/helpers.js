import { normalize } from 'normalizr';
import config from 'config';

import createStore from 'amo/store';
import {
  setClientApp, setLang, setAuthToken, setUserAgent,
} from 'core/actions';
import { addon as addonSchema } from 'core/api';
import {
  ADDON_TYPE_EXTENSION,
  ADDON_TYPE_THEME,
  CLIENT_APP_ANDROID,
  CLIENT_APP_FIREFOX,
  ENABLED,
  OS_ALL,
} from 'core/constants';
import { searchLoad, searchStart } from 'core/actions/search';
import { autocompleteLoad, autocompleteStart } from 'core/reducers/autocomplete';
import { loadUserProfile } from 'core/reducers/user';

import {
  createStubErrorHandler,
  createUserProfileResponse,
  userAuthToken,
  sampleUserAgent,
  signedInApiState as coreSignedInApiState,
} from '../helpers';


export const fakeAddon = Object.freeze({
  authors: [{
    id: 98811255,
    name: 'Krupa',
    picture_url: 'https://addons.cdn.mozilla.net/static/img/anon_user.png',
    url: 'http://olympia.dev/en-US/firefox/user/krupa/',
    username: 'krupa',
  }],
  average_daily_users: 100,
  categories: { firefox: ['other'] },
  current_beta_version: null,
  current_version: {
    compatibility: {},
    id: 123,
    license: { name: 'tofulicense', url: 'http://license.com/' },
    version: '2.0.0',
    files: [{
      created: '2014-11-22T10:09:01Z',
      hash: 'a1b2c3d4',
      id: 57721,
      is_restart_required: false,
      is_webextension: true,
      permissions: ['activeTab', 'webRequest'],
      platform: OS_ALL,
      status: 'public',
      url: 'https://a.m.o/files/321/addon.xpi',
    }],
    is_strict_compatibility_enabled: false,
  },
  description: 'This is a longer description of the chill out add-on',
  default_locale: 'en-US',
  edit_url: 'https://addons.m.o/addon/chill-out/edit',
  guid: '1234@my-addons.firefox',
  has_eula: true,
  has_privacy_policy: true,
  homepage: 'http://hamsterdance.com/',
  id: 1234,
  icon_url: 'https://addons.cdn.mozilla.net/webdev-64.png',
  is_disabled: false,
  is_experimental: false,
  is_featured: false,
  is_source_public: true,
  last_updated: '2014-11-22T10:09:01Z',
  name: 'Chill Out',
  previews: [{
    id: 1234778,
    caption: 'Chill out control panel',
    image_url: 'https://addons.cdn.mozilla.net/123/image.png',
    thumbnail_url: 'https://addons.cdn.mozilla.net/7123/image.png',
  }],
  public_stats: true,
  ratings: {
    count: 10,
    average: 3.5,
  },
  requires_payment: false,
  review_url: 'https://addons.m.o/en-US/editors/review/2377',
  slug: 'chill-out',
  status: 'public',
  summary: 'This is a summary of the chill out add-on',
  support_email: null,
  support_url: 'http://support.hampsterdance.com/',
  tags: ['chilling'],
  type: ADDON_TYPE_EXTENSION,
  url: 'https://addons.m.o/addon/chill-out/',
  weekly_downloads: 900023,
});

export const fakeTheme = Object.freeze({
  ...fakeAddon,
  authors: [{
    name: 'MaDonna',
    url: 'http://olympia.dev/en-US/firefox/user/madonna/',
    username: 'MaDonna',
  }],
  current_version: {
    ...fakeAddon.current_version,
    version: '0',
  },
  description: 'This is the add-on description',
  guid: 'dancing-daisies-theme@my-addons.firefox',
  id: 54321,
  name: 'Dancing Daisies by MaDonna',
  slug: 'dancing-daisies',
  theme_data: {
    accentcolor: '#71eafa',
    author: 'MaDonna',
    category: 'Nature',
    description: 'This is theme_data description',
    detailURL: 'https://addons.m/o/dancing-daisies-by-madonna/',
    footer: 'https://addons.cdn.mozilla.net/610804/footer.png',
    footerURL: 'https://addons.cdn.mozilla.net/610804/footer.png',
    header: 'https://addons.cdn.mozilla.net/610804/header.png',
    headerURL: 'https://addons.cdn.mozilla.net/610804/header.png',
    iconURL: 'https://addons.cdn.mozilla.net/610804/icon.png',
    id: 54321,
    name: 'Dancing Daisies by MaDonna',
    previewURL: 'https://addons.cdn.mozilla.net/610804/preview.png',
    textcolor: '#ffffff',
    updateURL: 'https://versioncheck.m.o/themes/update-check/610804',
    version: '1.0',
  },
  type: ADDON_TYPE_THEME,
});

export const fakeInstalledAddon = Object.freeze({
  downloadProgress: 0,
  error: undefined,
  guid: 'installed-addon@company',
  isPreviewingTheme: false,
  needsRestart: false,
  status: ENABLED,
  themePreviewNode: undefined,
  url: 'https://a.m.o/addon/detail/view',
});

export const fakeReview = Object.freeze({
  id: 8876,
  // The API only provides a minimal add-on representation.
  addon: {
    id: fakeAddon.id,
    slug: fakeAddon.slug,
  },
  created: '2017-01-09T21:49:14Z',
  rating: 3,
  version: fakeAddon.current_version,
  user: {
    id: 1234,
    name: 'fred',
    url: 'http://some.com/link/to/profile',
  },
  is_latest: false,
  body: 'It is Okay',
  title: 'Review Title',
});

export const fakeCategory = Object.freeze({
  application: CLIENT_APP_FIREFOX,
  description: 'I am a cool category for doing things',
  id: 5,
  misc: false,
  name: 'Testing category',
  slug: 'test',
  type: ADDON_TYPE_THEME,
  weight: 1,
});

/*
 * Redux store state for when a user has signed in.
 */
export const signedInApiState = Object.freeze({
  ...coreSignedInApiState,
  clientApp: CLIENT_APP_FIREFOX,
});

export function dispatchClientMetadata({
  store = createStore().store,
  clientApp = CLIENT_APP_ANDROID,
  lang = 'en-US',
  userAgent = sampleUserAgent,
} = {}) {
  store.dispatch(setClientApp(clientApp));
  store.dispatch(setLang(lang));
  store.dispatch(setUserAgent(userAgent));

  return {
    store,
    state: store.getState(),
  };
}

export function dispatchSignInActions({
  authToken = userAuthToken(),
  userId = 12345,
  username = 'user-1234',
  displayName = null,
  ...otherArgs
} = {}) {
  const { store } = dispatchClientMetadata(otherArgs);

  store.dispatch(setAuthToken(authToken));
  store.dispatch(loadUserProfile({
    profile: createUserProfileResponse({ id: userId, username, displayName }),
  }));

  return {
    store,
    state: store.getState(),
  };
}

export function dispatchSearchResults({
  addons = {
    [fakeAddon.slug]: fakeAddon,
    'some-other-slug': { ...fakeAddon, slug: 'some-other-slug' },
  },
  filters = { query: 'test' },
  store = dispatchClientMetadata().store,
} = {}) {
  store.dispatch(searchStart({
    errorHandlerId: createStubErrorHandler().id,
    filters,
  }));
  store.dispatch(searchLoad({
    entities: { addons },
    result: {
      count: Object.keys(addons).length,
      results: Object.keys(addons),
    },
  }));

  return { store };
}

export function createAddonsApiResult(results) {
  // Return a normalized add-ons response just like many utility functions do.
  // For example: core.api.featured(), core.api.search()...
  return normalize({ results }, { results: [addonSchema] });
}

export function createFakeAutocompleteResult({ name = 'suggestion-result' } = {}) {
  return {
    id: Date.now(),
    icon_url: `${config.get('amoCDN')}/${name}.png`,
    name,
    url: `https://example.org/en-US/firefox/addons/${name}/`,
  };
}

export function createFakeAddon({
  files = [...fakeAddon.current_version.files], ...overrides
} = {}) {
  return {
    ...fakeAddon,
    current_version: {
      ...fakeAddon.current_version,
      files: files.map((fileProps) => {
        return {
          ...fakeAddon.current_version.files[0],
          ...fileProps,
        };
      }),
    },
    ...overrides,
  };
}

export function dispatchAutocompleteResults({
  filters = { query: 'test' },
  store = dispatchClientMetadata().store,
  results = [],
} = {}) {
  store.dispatch(autocompleteStart({
    errorHandlerId: createStubErrorHandler().id,
    filters,
  }));
  store.dispatch(autocompleteLoad({ results }));

  return { store };
}

export const createFakeCollectionDetail = ({ name = 'My Addons' } = {}) => {
  return {
    addon_count: 123,
    author: {
      id: Date.now(),
      name: 'John Doe',
      url: 'http://olympia.dev/en-US/firefox/user/johndoe/',
      username: 'johndoe',
    },
    default_locale: 'en-US',
    description: 'some description',
    id: Date.now(),
    modified: Date.now(),
    name,
    public: true,
    slug: 'my-addons',
    url: `https://example.org/en-US/firefox/collections/johndoe/my-addons/`,
    uuid: 'ef7e1344-1c3d-4bbb-bbd8-df9d8c9020ec',
  };
};

export const createFakeCollectionAddons = ({ addons = [fakeAddon] } = {}) => {
  return {
    count: addons.length,
    results: addons.map((addon) => ({
      addon,
      downloads: 0,
      notes: null,
    })),
  };
};
