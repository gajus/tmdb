// @flow

/* eslint-disable flowtype/no-weak-types */

export type ErrorResponseType = {|
  statusCode: number,
  statusMessage: string
|};

export type ImagePathType = string | null;

export type MovieCastCreditType = {|
  +castId: number,
  +character: string,
  +creditId: string,
  +gender: number | null,
  +id: number,
  +name: string,
  +order: number,
  +profilePath: ImagePathType
|};

export type MovieCrewCreditType = {|
  +creditId: string,
  +department: string,
  +gender: number | null,
  +id: number,
  +job: string,
  +name: string,
  +profilePath: ImagePathType
|};

export type MovieType = {|
  +adult: boolean,
  +backdropPath: ImagePathType,
  +belongsToCollection: null | Object,
  +budget: number,
  +genres: $ReadOnlyArray<{|
    +id: number,
    +name: string
  |}>,
  +homepage: string | null,
  +id: number,
  +imdbId: string | null,
  +originalLanguage: string,
  +originalTitle: string,
  +overview: string | null,
  +popularity: number,
  +posterPath: ImagePathType,
  +productionCompanies: $ReadOnlyArray<{|
    +id: number,
    +name: string
  |}>,
  +productionCountries: $ReadOnlyArray<{|
    +iso31661: string,
    +name: string
  |}>,
  +releaseDate: string,
  +revenue: number,
  +runtime: number | null,
  +spokenLanguages: $ReadOnlyArray<{|
    +iso6391: string,
    +name: string
  |}>,
  +status: string,
  +tagline: string | null,
  +title: string,
  +video: boolean,
  +voteAverage: number,
  +voteCount: number
|};
