// @flow

import xfetch from 'xfetch';
import qs from 'qs';
import deepMapKeys from 'deep-map-keys';
import {
  delay
} from 'bluefeather';
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
  MovieCastCreditType,
  MovieCrewCreditType,
  MovieType,
  MovieVideoType,
  PersonType
} from './types';

const debug = createDebug('Tmdb');

type QueryType = {
  [key: string]: string | number
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const requestQuery = qs.stringify({
        // eslint-disable-next-line id-match
        api_key: this.apiKey,
        ...parameters
      });

      const response = await xfetch('https://api.themoviedb.org/3/' + resource + '?' + requestQuery, {
        isResponseValid: () => {
          return true;
        },
        responseType: 'full'
      });

      if (!response.headers.has('x-ratelimit-remaining')) {
        throw new UnexpectedResponseError();
      }

      if (!String(response.status).startsWith('2')) {
        const rateLimitRemaining = Number(response.headers.get('x-ratelimit-remaining'));

        if (!rateLimitRemaining) {
          const currentTime = Math.round(new Date().getTime() / 1000);
          const rateLimitReset = Number(response.headers.get('x-ratelimit-reset'));

          // The minimum 30 seconds cooldown ensures that in case 'x-ratelimit-reset'
          // time is wrong, we don't bombard the TMDb server with requests.
          const cooldownTime = Math.max(rateLimitReset - currentTime, 30);

          debug('reached rate limit; waiting %d seconds', cooldownTime);

          await delay(cooldownTime * 1000);

          // eslint-disable-next-line no-continue
          continue;
        }

        if (response.status === 404) {
          throw new NotFoundError();
        }

        const errorBody = await response.json();

        throw new RemoteError(errorBody.status_message, errorBody.status_code);
      }

      const body = await response.json();

      return deepMapKeys(body, camelCase);
    }
  }

  async getMovieCastCredits (movieId: number): Promise<$ReadOnlyArray<MovieCastCreditType>> {
    const movieCredits = await this.get('movie/' + movieId + '/credits', {
      language: this.language
    });

    return movieCredits.cast;
  }

  async getMovieCrewCredits (movieId: number): Promise<$ReadOnlyArray<MovieCrewCreditType>> {
    const movieCredits = await this.get('movie/' + movieId + '/credits', {
      language: this.language
    });

    return movieCredits.crew;
  }

  async getMovie (movieId: number): Promise<MovieType> {
    const movie = await this.get('movie/' + movieId, {
      language: this.language
    });

    return movie;
  }

  async getMovieVideos (movieId: number): Promise<$ReadOnlyArray<MovieVideoType>> {
    const movie = await this.get('movie/' + movieId + '/videos', {
      language: this.language
    });

    return movie.results;
  }

  async getPerson (personId: number): Promise<PersonType> {
    const person = await this.get('person/' + personId, {
      language: this.language
    });

    return person;
  }

  async findId (resourceType: 'movie', externalSource: 'imdb', externalId: string): Promise<number> {
    if (resourceType !== 'movie') {
      throw new Unimplemented();
    }

    if (externalSource !== 'imdb') {
      throw new Unimplemented();
    }

    const result = await this.get('find/' + externalId, {
      external_source: externalSource + '_id'
    });

    if (result.movieResults.length === 0) {
      throw new NotFoundError();
    }

    if (result.movieResults.length > 1) {
      throw new UnexpectedResponseError();
    }

    return Number(result.movieResults[0].id);
  }
}

export default Tmdb;
