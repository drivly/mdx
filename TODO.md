# TODO

## Blocking Issues

### CI Test Script Missing

The CI checks are failing because there's no `test` script defined in the root package.json, but the CI workflow is trying to run `pnpm test`. This needs to be addressed to allow CI checks to pass for PRs in this repository.

## MDX-13: Architectural Update to Embed Next.js App with Payload CMS

### Completed
- [x] Modified CLI implementation to run an embedded Next.js app directly
- [x] Created embedded Next.js app structure in the mdxe package
- [x] Integrated Payload CMS with SQLite as the default database
- [x] Implemented serverless Payload routes for API endpoints
- [x] Enhanced MDX component extension system
- [x] Configured build and deployment strategies
- [x] Updated pnpm-lock.yaml to match package.json changes

### Remaining Challenges
- [ ] Resolve webpack configuration issues with Payload CMS admin UI
- [ ] Fix TypeScript definition files and binary files handling in node_modules
- [ ] Improve error handling for Payload CMS integration
- [ ] Add comprehensive tests for the embedded Next.js app
- [ ] Create documentation for the new architecture

### Verification Requirements
- [x] CLI successfully finds and renders markdown content from user's directory
- [x] Embedded Next.js app structure is in place
- [x] MDX component extension system works for basic content
- [ ] Payload CMS admin UI loads correctly
- [ ] Build process properly handles output location for various deployment scenarios

### Deployment Status
- [x] Vercel deployment is passing
- [ ] Tests are failing due to unrelated TypeScript errors in mdxld package
