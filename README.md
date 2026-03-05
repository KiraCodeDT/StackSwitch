# StackSwitch

StackSwitch is a deterministic CLI that helps developers understand unfamiliar repositories quickly.

## MVP Commands

- `stack-switch` (alias to `stack-switch summary`)
- `stack-switch summary [--path <repo>] [--json]`
- `stack-switch explain [--path <repo>] [--json]`
- `stack-switch graph [--path <repo>] [--format dot|svg] [--out file] [--json]`
- `stack-switch plan <targetPair> [--path <repo>] [--json]`

## Why Deterministic

StackSwitch does not guess with AI. It scans files, parses source code, extracts static signals, and applies deterministic detector/analyzer rules.

## Output Trust Model

- Every major detection includes evidence.
- Confidence is scored by signal strength.
- Low-confidence detections resolve to `unknown`.

## Performance Controls

`stackswitch.config.json` supports:

- `ignore`
- `confidenceThreshold`
- `limits.maxFiles`
- `limits.maxAstNodes`
- `limits.scanTimeoutMs`

## Local Development

```bash
npm install
npm run build
node dist/cli/index.js
```
