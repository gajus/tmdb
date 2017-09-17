# TMDb

[![Travis build status](http://img.shields.io/travis/gajus/tmdb/master.svg?style=flat-square)](https://travis-ci.org/gajus/tmdb)
[![Coveralls](https://img.shields.io/coveralls/gajus/tmdb.svg?style=flat-square)](https://coveralls.io/github/gajus/tmdb)
[![NPM version](http://img.shields.io/npm/v/tmdb.svg?style=flat-square)](https://www.npmjs.org/package/tmdb)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

[The Movie Database](https://www.themoviedb.org/) (TMDb) SDK.

## Features

* Automatic rate-throttling
* Strict types

## Usage

```js
import {
  Tmdb
} from 'tmdb';

/**
 * @see https://developers.themoviedb.org/3/getting-started/authentication
 */
const apiKey: string = '';

const tmdb = new Tmdb(apiKey);

```

### API

Refer to the [source code](./src/Tmdb.js) and the [type definitions](./src/types.js).

> Note: Only a subset of the API is implemented. I will be adding new methods as needed.
> If you need a method added, raise a PR. Alternatively, you can use the low-level `get`
> method to construct any API calls.

### Handling errors

Methods that are expected to return a specific resource will throw `NotFoundError` if the resource is not found.

```js
import {
  Tmdb,
  NotFoundError
} from 'tmdb';

const tmdb = new Tmdb([..]);

try {
  await tmdb.getMovie(1);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Movie TMDb ID #1 not found.');
  } else {
    throw error;
  }
}

```
