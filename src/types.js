// @flow

/* eslint-disable flowtype/no-weak-types */

export type ErrorResponseType = {|
  statusCode: number,
  statusMessage: string
|};

export type MovieType = {|
  adult: boolean,
  backdropPath: any,
  belongsToCollection: null | Object,
  budget: number,
  genres: $ReadOnlyArray<{|id: number,
  name: string|}>,
  homepage: string | null,
  id: number,
  imdbId: string | null,
  originalLanguage: string,
  originalTitle: string,
  overview: string | null,
  popularity: number,
  posterPath: any,
  productionCompanies: $ReadOnlyArray<{|
    id: number,
    name: string
  |}>,
  productionCountries: $ReadOnlyArray<{|
    iso31661: string,
    name: string
  |}>,
  releaseDate: string,
  revenue: number,
  runtime: number | null,
  spokenLanguages: $ReadOnlyArray<{|iso6391: string,
  name: string|}>,
  status: string,
  tagline: string | null,
  title: string,
  video: boolean,
  voteAverage: number,
  voteCount: number
|};
