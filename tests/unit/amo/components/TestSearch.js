import { shallow } from 'enzyme';
import React from 'react';

import { SearchBase, mapStateToProps } from 'amo/components/Search';
import SearchFilters from 'amo/components/SearchFilters';
import SearchResults from 'amo/components/SearchResults';
import { setViewContext } from 'amo/actions/viewContext';
import { searchStart } from 'core/actions/search';
import Paginate from 'core/components/Paginate';
import {
  ADDON_TYPE_EXTENSION,
  ADDON_TYPE_LANG,
  ADDON_TYPE_THEME,
  SEARCH_SORT_TRENDING,
  SEARCH_SORT_TOP_RATED,
  SEARCH_SORT_POPULAR,
  VIEW_CONTEXT_EXPLORE,
} from 'core/constants';
import ErrorList from 'ui/components/ErrorList';
import {
  dispatchClientMetadata,
  dispatchSearchResults,
} from 'tests/unit/amo/helpers';
import { createStubErrorHandler, fakeI18n } from 'tests/unit/helpers';

describe(__filename, () => {
  let props;

  function render(extra = {}) {
    return shallow(<SearchBase {...{ ...props, ...extra }} />);
  }

  beforeEach(() => {
    props = {
      count: 80,
      dispatch: sinon.stub(),
      errorHandler: createStubErrorHandler(),
      filters: { page: 3, query: 'foo' },
      pathname: '/search/',
      handleSearch: sinon.spy(),
      i18n: fakeI18n(),
      loading: false,
      results: [{ name: 'Foo', slug: 'foo' }, { name: 'Bar', slug: 'bar' }],
    };
  });

  it('renders the results', () => {
    const root = render();
    const results = root.find(SearchResults);
    expect(results.prop('count')).toEqual(props.count);
    expect(results.prop('filters')).toEqual(props.filters);
    expect(results.prop('loading')).toEqual(props.loading);
    expect(results.prop('pathname')).toEqual(props.pathname);
    expect(results.prop('results')).toEqual(props.results);
    expect(Object.keys(results.props()).sort()).toEqual([
      'count',
      'filters',
      'loading',
      'pathname',
      'results',
    ].sort());
  });

  it('renders a Paginate', () => {
    const root = render();
    const paginator = root.find(Paginate);
    expect(paginator.prop('count')).toEqual(80);
    expect(paginator.prop('currentPage')).toEqual(3);
    expect(paginator.prop('pathname')).toEqual('/search/');
    expect(paginator.prop('queryParams')).toEqual({ page: 3, q: 'foo' });
  });

  it('does not render a Paginate when there is no search term', () => {
    const { store } = dispatchSearchResults({
      addons: {},
      filters: { query: null },
    });
    const root = render(mapStateToProps(store.getState()));
    const paginators = root.find(Paginate);

    expect(paginators.length).toEqual(0);
  });

  it('renders SearchFilters when there are filters and results', () => {
    const root = render();
    const sort = root.find(SearchFilters);

    expect(sort.prop('filters')).toEqual(props.filters);
    expect(sort.prop('pathname')).toEqual(props.pathname);
  });

  it('renders SearchFilters even when there are no results', () => {
    const { store } = dispatchSearchResults({ addons: {} });
    const root = render(mapStateToProps(store.getState()));

    expect(root.find(SearchFilters)).toHaveLength(1);
  });

  it('does not render SearchFilters when enableSearchFilters is false', () => {
    const root = render({ enableSearchFilters: false });

    expect(root.find(SearchFilters)).toHaveLength(0);
  });

  it('dispatches the search on mount', () => {
    render();

    sinon.assert.calledWith(props.dispatch, searchStart({
      errorHandlerId: props.errorHandler.id,
      filters: props.filters,
    }));
  });

  it('does not dispatch on mount if filters/results are loaded', () => {
    render({ filtersUsedForResults: props.filters });

    sinon.assert.neverCalledWith(props.dispatch, searchStart({
      errorHandlerId: props.errorHandler.id,
      filters: props.filters,
    }));
  });

  it('dispatches the search on props change', () => {
    const root = render();

    const newFilters = { query: 'I am a new query', page: 1 };
    root.setProps({ filters: newFilters });

    sinon.assert.calledWith(props.dispatch, searchStart({
      errorHandlerId: props.errorHandler.id,
      filters: newFilters,
    }));
  });

  it('sets the viewContext to the addonType if addonType exists', () => {
    const fakeDispatch = sinon.stub();
    const filters = { addonType: ADDON_TYPE_EXTENSION, query: 'test' };

    render({ count: 0, dispatch: fakeDispatch, filters });

    sinon.assert.calledWith(
      fakeDispatch, setViewContext(ADDON_TYPE_EXTENSION));
  });

  it('sets the viewContext to exploring if no addonType found', () => {
    const fakeDispatch = sinon.stub();
    const filters = { query: 'test' };

    render({ count: 0, dispatch: fakeDispatch, filters });

    sinon.assert.calledWith(
      fakeDispatch, setViewContext(VIEW_CONTEXT_EXPLORE));
  });

  it('should render an error', () => {
    const errorHandler = createStubErrorHandler(
      new Error('example of an error')
    );
    const root = render({ errorHandler });

    expect(root.find(ErrorList)).toHaveLength(1);
  });

  it('renders an HTML title', () => {
    const filters = {};
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Search results');
  });

  it('renders an HTML title for featured extensions', () => {
    const filters = { addonType: ADDON_TYPE_EXTENSION, featured: true };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Featured extensions');
  });

  it('renders an HTML title for featured themes', () => {
    const filters = { addonType: ADDON_TYPE_THEME, featured: true };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Featured themes');
  });

  it('renders an HTML title for featured add-ons', () => {
    const filters = { addonType: ADDON_TYPE_LANG, featured: true };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Featured add-ons');
  });

  it('renders an HTML title for trending extensions', () => {
    const filters = {
      addonType: ADDON_TYPE_EXTENSION,
      sort: SEARCH_SORT_TRENDING,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Trending extensions');
  });

  it('renders an HTML title for trending themes', () => {
    const filters = {
      addonType: ADDON_TYPE_THEME,
      sort: SEARCH_SORT_TRENDING,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Trending themes');
  });

  it('renders an HTML title for trending add-ons', () => {
    const filters = {
      addonType: ADDON_TYPE_LANG,
      sort: SEARCH_SORT_TRENDING,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Trending add-ons');
  });

  it('renders an HTML title for top rated extensions', () => {
    const filters = {
      addonType: ADDON_TYPE_EXTENSION,
      sort: SEARCH_SORT_TOP_RATED,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Top rated extensions');
  });

  it('renders an HTML title for top rated themes', () => {
    const filters = {
      addonType: ADDON_TYPE_THEME,
      sort: SEARCH_SORT_TOP_RATED,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Top rated themes');
  });

  it('renders an HTML title for top rated add-ons', () => {
    const filters = {
      addonType: ADDON_TYPE_LANG,
      sort: SEARCH_SORT_TOP_RATED,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Top rated add-ons');
  });

  it('renders an HTML title for popular extensions', () => {
    const filters = {
      addonType: ADDON_TYPE_EXTENSION,
      sort: SEARCH_SORT_POPULAR,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Popular extensions');
  });

  it('renders an HTML title for popular themes', () => {
    const filters = {
      addonType: ADDON_TYPE_THEME,
      sort: SEARCH_SORT_POPULAR,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Popular themes');
  });

  it('renders an HTML title for popular add-ons', () => {
    const filters = {
      addonType: ADDON_TYPE_LANG,
      sort: SEARCH_SORT_POPULAR,
    };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Popular add-ons');
  });

  it('renders an HTML title for search query', () => {
    const filters = { query: 'some terms' };
    const wrapper = render({ filters });
    expect(wrapper.find('title')).toHaveText('Search results for "some terms"');
  });

  describe('mapStateToProps()', () => {
    const { state } = dispatchClientMetadata();

    it('returns count, loading, and results', () => {
      expect(mapStateToProps(state)).toEqual({
        count: state.search.count,
        filtersUsedForResults: state.search.filters,
        loading: state.search.loading,
        results: state.search.results,
      });
    });
  });
});
