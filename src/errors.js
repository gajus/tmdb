// @flow

import ExtendableError from 'es6-error';

export class TmdbError extends ExtendableError {

}

export class Unimplemented extends TmdbError {
  constructor () {
    super('Method/ behaviour is not implemented.');
  }
}

export class UnexpectedResponseError extends TmdbError {
  constructor () {
    super('Remote service produced an unexpected response.');
  }
}

export class NotFoundError extends TmdbError {
  constructor () {
    super('Resource not found.');
  }
}

export class RemoteError extends TmdbError {
  code: number;

  message: string;

  constructor (message: string, code: number) {
    super();

    this.code = code;
    this.message = message;
  }
}
