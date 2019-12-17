// @flow

/**
 * @file A promitive script used to generate Flow type declarations using TMDb OAS output.
 */

import got from 'got';
import {
  camelCase,
} from 'lodash';

const typeMap = {
  ImagePathType: (data) => {
    return data.definitions['image-path'].type;
  },
  MovieBackdropImageType: (data) => {
    return data.paths['/movie/{movie_id}/images'].get.responses['200'].schema.properties.backdrops.items.properties;
  },
  MovieCastCreditType: (data) => {
    return data.paths['/movie/{movie_id}/credits'].get.responses['200'].schema.properties.cast.items.properties;
  },
  MovieCrewCreditType: (data) => {
    return data.paths['/movie/{movie_id}/credits'].get.responses['200'].schema.properties.crew.items.properties;
  },
  MoviePosterImageType: (data) => {
    return data.paths['/movie/{movie_id}/images'].get.responses['200'].schema.properties.posters.items.properties;
  },
  MovieType: (data) => {
    return data.paths['/movie/{movie_id}'].get.responses['200'].schema.properties;
  },
  MovieVideoType: (data) => {
    return data.paths['/movie/{movie_id}/videos'].get.responses['200'].schema.properties.results.items.properties;
  },
  PersonType: (data) => {
    return data.paths['/person/{person_id}'].get.responses['200'].schema.properties;
  },
};

const definitionMap = {
  '#/definitions/image-path': 'ImagePathType',
};

const typeNames = Object.keys(typeMap);

const createFlowType = (typeDefinition) => {
  if (Array.isArray(typeDefinition)) {
    return typeDefinition.map(createFlowType).join(' | ');
  } else if (typeof typeDefinition === 'string') {
    // eslint-disable-next-line no-use-before-define
    return getPrimitiveFlowType(typeDefinition);
  } else if (typeof typeDefinition === 'object' && typeDefinition !== null) {
    // eslint-disable-next-line no-use-before-define
    return createFlowObject(typeDefinition);
  }

  throw new Error('Unexpected type definition.');
};

// eslint-disable-next-line flowtype/no-weak-types
const createFlowObject = (resource: Object) => {
  const propertyNames = Object.keys(resource);

  propertyNames.sort();

  const types = [];

  for (const propertyName of propertyNames) {
    const property = resource[propertyName];

    // eslint-disable-next-line no-use-before-define
    types.push('+' + camelCase(propertyName) + ': ' + getPropertyFlowType(property));
  }

  return '{|\n' + types.join(',\n') + '\n|}';
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

// eslint-disable-next-line flowtype/no-weak-types
const getPropertyFlowType = (property: Object) => {
  if (property.$ref) {
    const mappedType = definitionMap[property.$ref];

    if (!mappedType) {
      // eslint-disable-next-line no-console
      console.log('property.$ref', property.$ref);

      throw new Error('Unmapped definition.');
    }

    return mappedType;
  }

  if (Array.isArray(property.type)) {
    return property.type.map(getPrimitiveFlowType).join(' | ');
  }

  if (property.type === 'array') {
    return '$ReadOnlyArray<' + getPropertyFlowType(property.items) + '>';
  }

  if (property.type === 'object' && property.properties) {
    return createFlowObject(property.properties);
  }

  return getPrimitiveFlowType(property.type);
};

const run = async () => {
  const oas = await got('https://api.stoplight.io/v1/versions/9WaNJfGpnnQ76opqe/export/oas.json', {
    json: true,
  });

  for (const typeName of typeNames) {
    const resourceResolver = typeMap[typeName];

    if (!resourceResolver) {
      throw new Error('Unexpected state.');
    }

    const typeDefinition = resourceResolver(oas.body);

    if (!typeDefinition) {
      throw new Error('Unexpected state.');
    }

    // eslint-disable-next-line no-console
    console.log('export type ' + typeName + ' = ' + createFlowType(typeDefinition) + ';');
  }
};

run();
