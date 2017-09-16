// @flow

import test from 'ava';
import nock from 'nock';
import Tmdb from '../../src/Tmdb';

test('retrieves movie resource', async (t) => {
  const apiKey = 'foo';
  const tmdb = new Tmdb(apiKey);

  const scope = nock('https://api.themoviedb.org')
    .get('/3/movie/1?api_key=foo&language=en')
    .reply(200, {
      id: 1,
      imdb_id: 'tt1'
    });

  const movie = await tmdb.getMovie(1);

  t.true(scope.isDone());
  t.true(movie.id === 1);
  t.true(movie.imdbId === 'tt1');
});
