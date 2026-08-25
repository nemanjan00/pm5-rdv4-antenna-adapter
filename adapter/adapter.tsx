/**
 * PM5 ↔ RDV4 antenna adapter board.
 *
 *   PM5 mainboard (ICX301 male)
 *        │  plugs into
 *   ┌────────────────────────────────┐
 *   │ RDV4 col    ICX301-F x2 (LF/HF) │
 *   │ (left edge)      (inboard)      │
 *   │   …function-to-function RF…     │  optional trim pads (DNP)
 *   └────────────────────────────────┘
 *   RDV4 side = one vertical column of 6 round M1.6 SMT-nut lands
 *   (LF trio top, HF trio bottom); the antenna screws/clamps onto them.
 *
 * Wiring is FUNCTION-TO-FUNCTION per band (never straight-through by position,
 * because the two boards mirror + band-swap — see README):
 *   PM5 DRV(PWR) → RDV4 PWR
 *   PM5 RAW      → RDV4 RAW
 *   PM5 GND      → RDV4 GND
 *
 * Matching is drive-first (PM5 BOOST); the three passive footprints per band are
 * DO-NOT-PLACE fallbacks only.
 *
 * ⚠️ All placement coordinates and the board outline are STUBS pending the
 * ICX301PT-FGY datasheet and a real mechanical layout.
 */

import { Icx301 } from "./icx301";
import { Rdv4Interface } from "./rdv4-pads";

// ── Board / placement stubs ───────────────────────────────────────────────
// TODO: real layout once ICX301PT-FGY + RDV4 mechanicals are confirmed.
const BOARD_W = 42; // mm  TODO
const BOARD_H = 45; // mm  TODO
// RDV4 pad column sits on the board EDGE (like the antenna's own drawing) so the
// antenna lines up flush; ICX301 connectors sit inboard of it.
const RDV4_X = -(BOARD_W / 2) + 3; // mm, RDV4 column ~3 mm from left edge  TODO
const CONN_X = 6; // mm, PM5-side ICX301 connectors (inboard)  TODO
const LF_Y = 9; // mm, LF connector Y (aligns w/ upper RDV4 trio)  TODO
const HF_Y = -9; // mm, HF connector Y (aligns w/ lower RDV4 trio)  TODO

// Single RDV4 interface component; refdes reused by every band's traces.
const RDV4 = "RDV4";

/**
 * One band's traces + optional trim footprints. The PM5 connector is placed by
 * the caller; here we wire it function-to-function to the shared RDV4 interface.
 *
 * @param {object} props
 * @param {string} props.band - "LF" or "HF" (used for refdes + RDV4 port prefix)
 * @param {number} props.jx   - PM5 connector X (mm)
 * @param {number} props.jy   - PM5 connector Y (mm)
 */
const Band = (props: { band: string; jx: number; jy: number }) => {
	const j = "J_" + props.band; // PM5-side ICX301
	const p = props.band; // RDV4 port prefix (LF_* / HF_*)

	return (
		<>
			<Icx301 name={j} pcbX={props.jx} pcbY={props.jy} schX={-6} schY={props.jy} />

			{/* Function-to-function RF path — primary, always connected.
			    This is the whole adapter electrically. */}
			<trace from={"." + j + " > .PWR"} to={"." + RDV4 + " > ." + p + "_PWR"} />
			<trace from={"." + j + " > .RAW"} to={"." + RDV4 + " > ." + p + "_RAW"} />
			<trace from={"." + j + " > .GND"} to={"." + RDV4 + " > ." + p + "_GND"} />

			{/* Optional trim footprints — DO NOT PLACE, but CONNECTED in the
			    schematic at their intended positions (each sits in parallel with
			    the direct trace above, so the RF path works unpopulated; to insert
			    one, cut the direct trace and populate the part):
			      R_*_DRV  → series-R in the DRV path (damping/Q)
			      C_*_RAW  → series-C in the RAW/sense path
			      C_*_TRIM → shunt-C, DRV→GND (f0 re-tune)
			    TODO: relocate C_*_TRIM to the RAW-GND (resonant) node — see the
			    README "Trim-C placement footgun" note. */}
			<resistor
				name={"R_" + p + "_DRV"}
				resistance="0"
				footprint="0805"
				doNotPlace
				pcbX={-13}
				pcbY={props.jy}
				schX={0}
				schY={props.jy}
				connections={{
					pin1: "." + j + " > .PWR",
					pin2: "." + RDV4 + " > ." + p + "_PWR",
				}}
			/>
			<capacitor
				name={"C_" + p + "_RAW"}
				capacitance="1nF"
				footprint="0805"
				doNotPlace
				schOrientation="vertical"
				pcbX={-9}
				pcbY={props.jy}
				schX={0}
				schY={props.jy - 1.5}
				connections={{
					pin1: "." + j + " > .RAW",
					pin2: "." + RDV4 + " > ." + p + "_RAW",
				}}
			/>
			<capacitor
				name={"C_" + p + "_TRIM"}
				capacitance="1nF"
				footprint="0805"
				doNotPlace
				schOrientation="vertical"
				pcbX={-5}
				pcbY={props.jy}
				schX={2}
				schY={props.jy - 3}
				connections={{
					pin1: "." + j + " > .PWR",
					pin2: "." + j + " > .GND",
				}}
			/>
		</>
	);
};

export const Adapter = () => (
	<board width={BOARD_W} height={BOARD_H}>
		{/* RDV4 antenna interface — single vertical pad column; the six M1.6
		    SMT-nut lands also mechanically mount the antenna (no separate
		    mounting holes needed). */}
		<Rdv4Interface name={RDV4} pcbX={RDV4_X} pcbY={0} schX={8} schY={0} />

		<Band band="LF" jx={CONN_X} jy={LF_Y} />
		<Band band="HF" jx={CONN_X} jy={HF_Y} />
	</board>
);

export default Adapter;
