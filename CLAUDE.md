# Claude Code Notes

## Before pushing / publishing

Always run prettier on any modified files before committing:

```
yarn prettier --write <file>
```

The CI build runs ESLint with prettier rules and will fail if formatting is wrong.
