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
