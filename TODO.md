# TODO

## Blocking Issues

### TypeScript Errors in mdxai Package

The CI checks are failing due to TypeScript errors in the `mdxai` package, which is unrelated to the changes made in the `mdxdb` package for ticket MDX-8. The errors are:

```
src/cli.ts(51,14): error TS7006: Parameter 'targetPath' implicitly has an 'any' type.
src/cli.ts(76,15): error TS7006: Parameter 'pattern' implicitly has an 'any' type.
src/cli.ts(103,30): error TS7006: Parameter 'directory' implicitly has an 'any' type.
```

These errors need to be fixed in the `mdxai` package to allow CI checks to pass for PRs in this repository.

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
