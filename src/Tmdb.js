// @flow

import xfetch from 'xfetch';
import qs from 'qs';
import deepMapKeys from 'deep-map-keys';
import {
  camelCase
} from 'lodash';
import {
  createDebug
} from './factories';
import {
  NotFoundError,
  RemoteError,
  UnexpectedResponseError,
  Unimplemented
} from './errors';
import type {
  MovieType
} from './types';

const debug = createDebug('Tmdb');

type QueryType = {
  [key: string]: string | number
};

const isResponseValid = async (intermediateResponse) => {
  if (!String(intermediateResponse.status).startsWith('2') && !String(intermediateResponse.status).startsWith('3') && intermediateResponse.status !== 400) {
    if (intermediateResponse.status === 404) {
      throw new NotFoundError();
    }

    const response = await intermediateResponse.json();

    throw new RemoteError(response.status_message, response.status_code);
  }

  return true;
};

class Tmdb {
  apiKey: string;
  language: string;

  constructor (apiKey: string, language: string = 'en') {
    this.apiKey = apiKey;
    this.language = language;
  }

  // eslint-disable-next-line flowtype/no-weak-types
  async get (resource: string, parameters: QueryType = {}): Object {
    const requestQuery = qs.stringify({
      // eslint-disable-next-line id-match
      api_key: this.apiKey,
      ...parameters
    });

    const body = await xfetch('https://api.themoviedb.org/3/' + resource + '?' + requestQuery, {
      isResponseValid,
      responseType: 'json'
    });

    return deepMapKeys(body, camelCase);
  }

  async findId (resourceType: 'movie', externalSource: 'imdb', externalId: string): Promise<number> {
    if (resourceType !== 'movie') {
      throw new Unimplemented();
    }

    if (externalSource !== 'imdb') {
      throw new Unimplemented();
    }

    const result = await this.get('find/' + externalId, {
      external_source: externalSource
    });

    if (result.movieResults.length === 0) {
      throw new NotFoundError();
    }

    if (result.movieResults.length > 1) {
      throw new UnexpectedResponseError();
    }

    return Number(result.movieResults[0].id);
  }

  async getMovie (movieId: number): Promise<MovieType> {
    debug('retrieving movie by TMDb ID %d', movieId);

    const movie = await this.get('movie/' + movieId, {
      language: this.language
    });

    return movie;
  }
}

export default Tmdb;
