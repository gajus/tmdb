// @flow

/**
 * @file A promitive script used to generate Flow type declarations using TMDb OAS output.
 */

import xfetch from 'xfetch';
import {
  camelCase
} from 'lodash';

const typeMap = {
  MovieType: (data) => {
    return data.paths['/movie/{movie_id}'].get.responses['200'].schema.properties;
  }
};

const typeNames = Object.keys(typeMap);

// eslint-disable-next-line flowtype/no-weak-types
const createFlowObject = (resource: Object) => {
  const propertyNames = Object.keys(resource);

  propertyNames.sort();

  const types = [];

  for (const propertyName of propertyNames) {
    const property = resource[propertyName];

    // eslint-disable-next-line no-use-before-define
    types.push(camelCase(propertyName) + ': ' + getFlowType(property));
  }

  return '{|\n' + types.join(',\n') + '\n|};';
};

const getPrimitiveFlowType = (typeName: string) => {
  if (typeName === 'boolean' || typeName === 'string' || typeName === 'null' || typeName === 'number') {
    return typeName;
  }

  if (typeName === 'object') {
    return 'Object';
  }

  if (typeName === 'integer') {
    return 'number';
  }

  throw new Error('Unexpected input type.');
};

const getFlowType = (property: *) => {
  // @todo Support $ref
  if (property.$ref) {
    return 'any';
  }

  if (Array.isArray(property.type)) {
    return property.type.map(getPrimitiveFlowType).join(' | ');
  }

  if (property.type === 'array') {
    return '$ReadOnlyArray<' + getFlowType(property.items) + '>';
  }

  if (property.type === 'object' && property.properties) {
    return createFlowObject(property.properties);
  }

  return getPrimitiveFlowType(property.type);
};

const run = async () => {
  const oas = await xfetch('https://api.stoplight.io/v1/versions/9WaNJfGpnnQ76opqe/export/oas.json', {
    responseType: 'json'
  });

  for (const typeName of typeNames) {
    const resourceResolver = typeMap[typeName];

    if (!resourceResolver) {
      throw new Error('Unexpected state.');
    }

    const properties = resourceResolver(oas);

    if (!properties) {
      throw new Error('Unexpected state.');
    }

    // eslint-disable-next-line no-console
    console.log('type ' + typeName + ' = ' + createFlowObject(properties));
  }
};

run();
