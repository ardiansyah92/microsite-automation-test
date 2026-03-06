# Enutri Automation Tests

Playwright E2E automation tests for Enutri CMS applications.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Configure environment variables:
```bash
# The .env.dev file is already configured with dev credentials
# For other environments, create .env.staging or .env.prod based on .env.example
cp .env.example .env.staging
# Edit .env.staging with staging credentials
```

## Environment Files

- `.env.dev` - Development environment credentials (already configured)
- `.env.example` - Example configuration file
- `.env.staging` - Staging environment (create as needed)
- `.env.prod` - Production environment (create as needed)

## Running Tests

### Run all tests in dev environment
```bash
npm run test:dev
```

### Run tests with headed browser (visible UI)
```bash
npm run test:headed
```

### Run tests in Playwright Test UI mode
```bash
npm run test:ui
```

### Debug tests
```bash
npm run test:debug
```

### Run tests in specific environment
```bash
# Using staging environment
npm run test -- --env-file=.env.staging
```

## Project Structure

```
enutri-automation-test/
├── e2e/                    # E2E test files
│   └── cms/               # CMS-specific tests
│       └── login.spec.ts  # Login page tests
├── .env.dev               # Dev environment credentials
├── .env.example           # Example environment configuration
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies and scripts
├── playwright.config.ts   # Playwright configuration
└── tsconfig.json          # TypeScript configuration
```

## Test Scenarios

### CMS Login Tests (`e2e/cms/login.spec.ts`)

1. **Successful Login** - Tests valid credential login
2. **Invalid Credentials** - Tests error handling for wrong credentials
3. **Required Email Field** - Tests email validation
4. **Required Password Field** - Tests password validation

## Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

## Credentials

The `.env.dev` file contains:
- **URL**: https://enutridev.danone.id/cms/login
- **Email**: superadmin@enutri.com
- **Password**: 3Nutr1D4n0neBOff1cE-12-25

## Adding New Tests

1. Create a new test file in `e2e/` directory
2. Use the environment variables from your `.env` file:
```typescript
const email = process.env.CMS_EMAIL;
const password = process.env.CMS_PASSWORD;
```
3. Run tests to verify

## Troubleshooting

### Browser installation issues
```bash
npx playwright install --force
```

### Tests not finding environment variables
- Ensure `.env.dev` or appropriate env file exists
- Check that `playwright.config.ts` loads the correct env file
- Verify the env file is in the project root

### Tests timing out
- Increase timeout in test files: `test.setTimeout(30000)`
- Check network connectivity to the target URL
- Verify the CMS is accessible

## CI/CD Integration

For GitLab CI, add to `.gitlab-ci.yml`:

```yaml
e2e-tests:
  script:
    - npm ci
    - npx playwright install --with-deps
    - npm run test:dev
  artifacts:
    when: always
    paths:
      - playwright-report/
```

## Security Notes

- Never commit `.env` files with real credentials
- Use `.env.example` as a template
- Rotate credentials regularly
- Use different credentials for different environments
