// @flow

import got from 'got';
import deepMapKeys from 'deep-map-keys';
import {
  delay,
} from 'bluefeather';
import {
  camelCase,
} from 'lodash';
import Logger from './Logger';
import {
  NotFoundError,
  RemoteError,
  UnexpectedResponseError,
  Unimplemented,
} from './errors';
import type {
  MovieBackdropImageType,
  MovieCastCreditType,
  MovieCrewCreditType,
  MoviePosterImageType,
  MovieType,
  MovieVideoType,
  PersonType,
} from './types';

type QueryType = {
  [key: string]: string | number | null,
  ...
};

const log = Logger.child({
  namespace: 'Tmdb',
});

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
      const response = await got('https://api.themoviedb.org/3/' + resource, {
        responseType: 'json',
        searchParams: {
          // eslint-disable-next-line id-match
          api_key: this.apiKey,

          // eslint-disable-next-line no-extra-parens, flowtype/no-weak-types
          ...(parameters: Object),
        },
        throwHttpErrors: false,
      });

      if (!String(response.statusCode).startsWith('2')) {
        if (response.headers['x-ratelimit-remaining']) {
          const rateLimitRemaining = Number(response.headers['x-ratelimit-remaining']);

          if (!rateLimitRemaining) {
            const currentTime = Math.round(new Date().getTime() / 1000);
            const rateLimitReset = Number(response.headers['x-ratelimit-reset']);

            // The minimum 30 seconds cooldown ensures that in case 'x-ratelimit-reset'
            // time is wrong, we don't bombard the TMDb server with requests.
            const cooldownTime = Math.max(rateLimitReset - currentTime, 30);

            log.debug('reached rate limit; waiting %d seconds', cooldownTime);

            await delay(cooldownTime * 1000);

            // eslint-disable-next-line no-continue
            continue;
          }
        }

        if (response.statusCode === 404) {
          throw new NotFoundError();
        }

        throw new RemoteError(response.body.status_message, response.body.status_code);
      }

      return deepMapKeys(response.body, camelCase);
    }
  }

  async getMovie (movieId: number): Promise<MovieType> {
    const movie = await this.get('movie/' + movieId, {
      language: this.language,
    });

    return {
      ...movie,

      // Revenue can be 0, e.g. https://gist.github.com/gajus/b396a7e1af22977b0d98f4c63a664d44#file-response-json-L94
      revenue: movie.revenue || null,

      // Runtime can be 0, e.g. https://gist.github.com/gajus/b396a7e1af22977b0d98f4c63a664d44#file-response-json-L95
      runtime: movie.runtime || null,
    };
  }

  async getMovieBackdropImages (movieId: number, includeImageLanguage: $ReadOnlyArray<string>): Promise<$ReadOnlyArray<MovieBackdropImageType>> {
    const movie = await this.get('movie/' + movieId + '/images', {
      include_image_language: includeImageLanguage ? includeImageLanguage.join(',') : null,
      language: this.language,
    });

    return movie.backdrops;
  }

  async getMovieCastCredits (movieId: number): Promise<$ReadOnlyArray<MovieCastCreditType>> {
    const movieCredits = await this.get('movie/' + movieId + '/credits', {
      language: this.language,
    });

    return movieCredits.cast;
  }

  async getMovieCrewCredits (movieId: number): Promise<$ReadOnlyArray<MovieCrewCreditType>> {
    const movieCredits = await this.get('movie/' + movieId + '/credits', {
      language: this.language,
    });

    return movieCredits.crew;
  }

  async getMoviePosterImages (movieId: number, includeImageLanguage: $ReadOnlyArray<string>): Promise<$ReadOnlyArray<MoviePosterImageType>> {
    const movie = await this.get('movie/' + movieId + '/images', {
      include_image_language: includeImageLanguage ? includeImageLanguage.join(',') : null,
      language: this.language,
    });

    return movie.posters;
  }

  async getMovieVideos (movieId: number): Promise<$ReadOnlyArray<MovieVideoType>> {
    const movie = await this.get('movie/' + movieId + '/videos', {
      language: this.language,
    });

    return movie.results;
  }

  async getPerson (personId: number): Promise<PersonType> {
    const person = await this.get('person/' + personId, {
      language: this.language,
    });

    return person;
  }

  async findId (resourceType: 'movie' | 'person', externalSource: 'imdb', externalId: string): Promise<number> {
    if (resourceType !== 'movie' && resourceType !== 'person') {
      throw new Unimplemented();
    }

    if (externalSource !== 'imdb') {
      throw new Unimplemented();
    }

    const result = await this.get('find/' + externalId, {
      external_source: externalSource + '_id',
    });

    let results;

    if (resourceType === 'movie') {
      results = result.movieResults;
    } else if (resourceType === 'person') {
      results = result.personResults;
    } else {
      throw new Error('Unexpected state.');
    }

    if (results.length === 0) {
      throw new NotFoundError();
    }

    if (results.length > 1) {
      throw new UnexpectedResponseError();
    }

    return Number(results[0].id);
  }
}

export default Tmdb;
