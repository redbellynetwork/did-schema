import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import jsf from 'json-schema-faker';

const redbellyCredentialSchema = JSON.parse(
  fs.readFileSync('./redbellyCredential/credential/RedbellyCredential-v1.json', 'utf-8')
);

function generateRedbellyCredential(callback?: (data: any) => void): any {
  const data = jsf.generate(redbellyCredentialSchema) as any;

  data['@context'] =
    'https://raw.githubusercontent.com/redbellynetwork/did-schema/refs/heads/main/redbellyCredential/credential/v1.jsonld';

    data.id = faker.string.uuid();
    data.type = ['VerifiableCredential', 'DriversLicenceCredential'];
    data.issuanceDate = faker.date.past().toISOString();
    data.expirationDate = faker.date.future().toISOString();
    data.issuer = { id: faker.internet.url() };
    data.credentialSchema = {
      id: 'https://raw.githubusercontent.com/redbellynetwork/did-schema/refs/heads/main/redbellyCredential/credential/RedbellyCredential-v1.json',
      type: 'JsonSchemaValidator2018',
    };
    data.credentialStatus = {
      id: faker.internet.url(),
      type: 'CredentialStatusList2021',
    };
    data.subjectPosition = faker.helpers.arrayElement(['none', 'index', 'value']);
    data.merklizationRootPosition = faker.helpers.arrayElement([
      'none',
      'index',
      'value',
    ]);
    data.revNonce = faker.number.int();
    data.version = faker.number.int();
    data.updatable = faker.datatype.boolean();
  
    data.credentialSubject = {
      id: faker.string.uuid(),
      publicAddress: faker.finance.ethereumAddress(),
    };

  if (callback) {
    callback(data);
  }

  return data;
}

const redbellyCredentialTestScenarios = [
  {
    name: 'Valid Credential',
    data: generateRedbellyCredential(),
    expectedValid: true,
  },
  {
    name: 'Missing Required Field',
    data: generateRedbellyCredential((data) => {
      delete data.credentialSubject.publicAddress;
    }),
    expectedValid: false,
  },
  {
    name: 'Extra Undefined Field',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.unknownField = 'randomValue';
    }),
    expectedValid: true,
  },
  {
    name: 'Wrong Data Type',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = 12345;
    }),
    expectedValid: false,
  },
  // {
  //   name: 'Malformed Context: Invalid string',
  //   data: generateRedbellyCredential((data) => {
  //     data['@context'] = 'invalid_context';
  //   }),
  //   expectedValid: false, 
  // },
  // {
  //   name: 'Malformed Context: Empty array',
  //   data: generateRedbellyCredential((data) => {
  //     data['@context'] = [];
  //   }),
  //   expectedValid: false,
  // },
  {
    name: 'Malformed Context: undefined',
    data: generateRedbellyCredential((data) => {
      data['@context'] = undefined;
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid URL in id',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.id = 'not_a_url';
    }),
    expectedValid: false,
  },
  {
    name: 'Null Values',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = null;
    }),
    expectedValid: false,
  },
  {
    name: 'Array Instead of String',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = ['pass', 'fail'];
    }),
    expectedValid: false,
  },
  // {
  //   name: 'Invalid IRI Reference',
  //   data: generateRedbellyCredential((data) => {
  //     data['aml-vocab'] = 'invalid-iri';
  //   }),
  //   expectedValid: false,
  // },
  // {
  //   name: 'Injection Attack (XSS)',
  //   data: generateRedbellyCredential((data) => {
  //     data.credentialSubject.publicAddress = "<script>alert('XSS')</script>";
  //   }),
  //   expectedValid: false,
  // },
  // {
  //   name: 'Invalid @type',
  //   data: generateRedbellyCredential((data) => {
  //     data.credentialSubject.type = 'SomeOtherType';
  //   }),
  //   expectedValid: false,
  // },
  {
    name: 'Missing id',
    data: generateRedbellyCredential((data) => {
      delete data.credentialSubject.id;
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid publicAddress: Too short',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = "0x123";
    }),
    expectedValid: false,
  },
  {
    name: 'Leading/Trailing Spaces',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = ' 0xAbCdEf1234567890ABCDEF1234567890abcdef12 ';
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid credentialSubject.publicAddress: Contains non-hex characters',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = "0xGHIJKL7890abcdef1234567890abcdef12345678";
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid credentialSubject.publicAddress: Missing 0x prefix',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = "1234567890abcdef1234567890abcdef12345678";
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid credentialSubject.publicAddress: Uppercase 0X prefix',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = "0XABCDEF1234567890ABCDEF1234567890ABCDEF12";
    }),
    expectedValid: false,
  },
  {
    name: 'Valid credentialSubject.publicAddress: Mixed case (allowed in Ethereum)',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = "0xAbCdEf1234567890ABCDEF1234567890abcdef12";
    }),
    expectedValid: true,
  },
  {
    name: 'Empty Fields',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.publicAddress = '';
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid credentialSubject.id: Missing hyphens',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.id = "550e8400e29b41d4a716446655440000";
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid credentialSubject.id: Too short',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.id = "550e8400-e29b-41d4-a716-44665544";
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid credentialSubject.id: Too long',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.id = "550e8400-e29b-41d4-a716-44665544000000";
    }),
    expectedValid: false,
  },
  {
    name: 'Invalid credentialSubject.id: Contains non-hex character (G)',
    data: generateRedbellyCredential((data) => {
      data.credentialSubject.id = "550e8400-e29b-41d4-a716-44665544G000";
    }),
    expectedValid: false,
  },
];


if (!fs.existsSync('./test/data')) {
  fs.mkdirSync('./test/data');
}

  const filePath = path.join('./test/data', `RedbellyCredential.json`);
  fs.writeFileSync(filePath, JSON.stringify(redbellyCredentialTestScenarios, null, 2));
  console.log(`Written: ${filePath}`);

console.log('Test scenarios generated successfully.');
