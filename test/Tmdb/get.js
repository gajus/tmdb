// @flow

import test from 'ava';
import nock from 'nock';
import Tmdb from '../../src/Tmdb';
import {
  NotFoundError,
  RemoteError
} from '../../src/errors';

test('creates a GET request using apiKey', async (t) => {
  const apiKey = 'foo';
  const tmdb = new Tmdb(apiKey);

  const scope = nock('https://api.themoviedb.org')
    .get('/3/bar?api_key=foo')
    .reply(200, {});

  await tmdb.get('bar');

  t.true(scope.isDone());
});

test('throws NotFoundError if response is 404', async (t) => {
  const apiKey = 'foo';
  const tmdb = new Tmdb(apiKey);

  nock('https://api.themoviedb.org')
    .get('/3/bar?api_key=foo')
    .reply(404, {
      status_code: 34,
      status_message: 'The resource you requested could not be found.'
    });

  const error = await t.throws(tmdb.get('bar'));

  t.true(error instanceof NotFoundError);
  t.true(error.message === 'Resource not found.');
});

test('throws RemoteError if response is non-200', async (t) => {
  const apiKey = 'foo';
  const tmdb = new Tmdb(apiKey);

  nock('https://api.themoviedb.org')
    .get('/3/bar?api_key=foo')
    .reply(401, {
      status_code: 7,
      status_message: 'Invalid API key: You must be granted a valid key.',
      success: false
    });

  const error = await t.throws(tmdb.get('bar'));

  t.true(error instanceof RemoteError);
  t.true(error.code === 7);
  t.true(error.message === 'Invalid API key: You must be granted a valid key.');
});
