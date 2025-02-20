import Ajv from 'ajv';
import fs from 'fs';
import addFormats from 'ajv-formats';

const scenarios = JSON.parse(
  fs.readFileSync(`./test/data/RedbellyCredential.json`, 'utf-8')
);

const credentialSchema = JSON.parse(
  fs.readFileSync(
    `./redbellyCredential/credential/RedbellyCredential-v1.json`,
    'utf-8'
  )
);

const ajv = new Ajv({ strict: false, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(credentialSchema);

describe(`Testcases for RedbellyCredentials.json: `, () => {
  scenarios.forEach(
    (scenario: { name?: any; data?: any; expectedValid?: any }) => {
      test(scenario.name, async () => {
        const { data, expectedValid } = scenario;
        const valid = validate(data);

        const errors = validate.errors
          ? validate.errors
              .map((error) => `${error.instancePath} ${error.message}`)
              .join(', ')
          : 'An Unknown error occured';

        if (!valid) {
          console.log(`Validation failed for ${scenario.name}:`, errors);
        }
        expect(valid).toBe(expectedValid);
      });
    }
  );
});
