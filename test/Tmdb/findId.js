// @flow

import test from 'ava';
import nock from 'nock';
import Tmdb from '../../src/Tmdb';
import {
  NotFoundError,
  UnexpectedResponseError
} from '../../src/errors';

test('finds TMDb movie record ID using IMDb ID', async (t) => {
  const apiKey = 'foo';
  const tmdb = new Tmdb(apiKey);

  const scope = nock('https://api.themoviedb.org')
    .get('/3/find/tt1?api_key=foo&external_source=imdb')
    .reply(
      200,
      {
        movie_results: [
          {
            id: 1
          }
        ]
      },
      {
        'x-ratelimit-remaining': 1
      }
    );

  const movieId = await tmdb.findId('movie', 'imdb', 'tt1');

  t.true(scope.isDone());

  t.true(movieId === 1);
});

test('throws NotFoundError if resource cannot be found', async (t) => {
  const apiKey = 'foo';
  const tmdb = new Tmdb(apiKey);

  const scope = nock('https://api.themoviedb.org')
    .get('/3/find/tt1?api_key=foo&external_source=imdb')
    .reply(
      200,
      {
        movie_results: []
      },
      {
        'x-ratelimit-remaining': 1
      }
    );

  const error = await t.throws(tmdb.findId('movie', 'imdb', 'tt1'));

  t.true(scope.isDone());

  t.true(error instanceof NotFoundError);
});

test('throws UnexpectedResponseError if multiple results are returned', async (t) => {
  const apiKey = 'foo';
  const tmdb = new Tmdb(apiKey);

  const scope = nock('https://api.themoviedb.org')
    .get('/3/find/tt1?api_key=foo&external_source=imdb')
    .reply(
      200,
      {
        movie_results: [
          {
            id: 1
          },
          {
            id: 2
          }
        ]
      },
      {
        'x-ratelimit-remaining': 1
      }
    );

  const error = await t.throws(tmdb.findId('movie', 'imdb', 'tt1'));

  t.true(scope.isDone());

  t.true(error instanceof UnexpectedResponseError);
});
