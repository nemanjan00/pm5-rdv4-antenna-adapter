# CLAUDE.md — PM5 ↔ RDV4 antenna adapter

## What this is
A tscircuit PCB that adapts a **PM5 mainboard** (ICX301 connectors) to a passive
**RDV4 antenna**. Design rationale, pinouts, measurements, and matching strategy
live in [README.md](./README.md). The proxmark3 source is a submodule under
`proxmark3/` (reference docs only).

## Toolchain: tscircuit
- Board source is in `adapter/` (`.tsx`, JSX/ESM + React JSX runtime).
- Build: `yarn build` (→ `tsci build adapter/adapter.tsx`, output in `dist/`).
- Dev/preview: `yarn dev`.
- `typescript` is pinned to **v5** — tscircuit's rollup plugin is incompatible
  with the TS 7 native preview. `three` is a required peer of the 3D export.
- **Use `yarn`, not `npm`.** npm floods `ERESOLVE` peer-dependency warnings
  because tscircuit's early (`0.0.x`) sub-packages pin mismatched `circuit-json`
  ranges; yarn classic resolves them quietly. Do **not** `npm audit fix --force`
  — the reported vulns are in the build-tooling tree (nothing deployed), and the
  `--force` upgrades will break tscircuit.

## `/implement-js` skill — usage and deviation
Per the parent `/home/nemanjan00/CLAUDE.md`, JS/TS work uses the `/implement-js`
skill, and it should always be used for code here. **Deviation, by necessity:**
tscircuit requires JSX/TSX + ESM, so the skill's Node-backend conventions
(CommonJS, `forever`/herokuish/Procfile, services layout, no-JSX) do **not**
apply. We keep the skill's general hygiene: tabs + double quotes, `.gitignore`
node_modules, `yarn`, constants-at-top, `// TODO` markers, this file kept in sync.

## Status: SKELETON
Structure and net topology are in place; **mechanical geometry is stubbed.**
Open TODOs (search `TODO` in `adapter/`):
- `adapter/icx301.tsx` — ALL ICX301PT-FGY pad dimensions/pitch are guesses.
  ICX301 is **not** an XT30 (distributors mislabel it); no stock footprint fits,
  so this is hand-built from the datasheet. Confirm against the real drawing.
- `adapter/rdv4-pads.tsx` — RDV4 landing-pad geometry approximated from the
  physical drawing; confirm.
- `adapter/adapter.tsx` — board outline, placement, M1.6 hole positions are
  stubs. Build currently emits stub-geometry DRC warnings (a trace crosses a pad;
  no courtyards) that resolve with real placement.
- Trim footprints (`R_*_DRV`, `C_*_RAW`, `C_*_TRIM`) are DNP + unconnected
  fallback lands; `C_*_TRIM` should move to the RAW-GND resonant node (README).

## Key design invariants (do not regress)
- Wire **function-to-function** per band (`DRV`↔`PWR`, `RAW`↔`RAW`, `GND`↔`GND`),
  never straight-through — the boards mirror + band-swap.
- The connector is **hand-soldered** (not on LCSC / not JLC-assembled); pads are
  drawn extended for iron access.
- Matching is **drive-first** (PM5 BOOST); passives are fallback only.
- No controlled-impedance PCB needed (lumped regime at 125 kHz / 13.56 MHz).
