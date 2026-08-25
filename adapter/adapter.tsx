/**
 * PM5 ↔ RDV4 antenna adapter board.
 *
 *   PM5 mainboard (ICX301 male)
 *        │  plugs into
 *   ┌──────────────────────────────┐
 *   │ RDV4 │  trim pads (DNP)  │ J_LF ├─
 *   │ col  │  …func-to-func…   ├──────┤
 *   │(left)│                   │ J_HF ├─
 *   └──────────────────────────────┘
 *   PM5 side  = two ICX301-F connectors on the RIGHT edge (~22.1 mm apart),
 *   mating face pointing off-board (rotated 270°).
 *   RDV4 side = one vertical column of 6 round M1.6 SMT-nut lands on the LEFT
 *   edge (LF trio top, HF trio bottom); the antenna screws/clamps onto them.
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
const BOARD_W = 34; // mm  TODO
const BOARD_H = 46; // mm  TODO
// RDV4 pad column on the LEFT edge (matches the antenna's own drawing).
const RDV4_X = -(BOARD_W / 2) + 3; // mm, RDV4 column ~3 mm from left edge  TODO
// PM5 ICX301 connectors on the RIGHT edge (opposite the antenna), mating face
// pointing off-board (+X). The footprint's own insertionDirection is +Y, so the
// part is rotated 270° to face +X. Side-by-side at the PM5's real centre pitch:
// LF-DRV↔HF-DRV 16 mm + 6.1 mm blade pitch = ~22.1 mm
// (proxmark3/doc/img/pm5/icx301-and-10p-header.jpg).
const CONN_PITCH = 22.1; // mm, LF↔HF connector centre pitch  [PM5 drawing]
const CONN_X = BOARD_W / 2 - 4; // mm, right edge
const CONN_ROTATION = 270; // deg, so the +Y mating face points +X (off-board)
const LF_Y = CONN_PITCH / 2; // ≈ +11 (upper)
const HF_Y = -CONN_PITCH / 2; // ≈ -11 (lower)
// Trim passives sit mid-board (x offsets: R_DRV, C_RAW, C_TRIM), per-band Y.
const PASSIVE_X = [-6, -2, 2];

// Single RDV4 interface component; refdes reused by every band's traces.
const RDV4 = "RDV4";

/**
 * One band's traces + optional trim footprints. The PM5 connector is placed by
 * the caller; here we wire it function-to-function to the shared RDV4 interface.
 *
 * @param {object} props
 * @param {string} props.band     - "LF" or "HF" (refdes + RDV4 port prefix)
 * @param {number} props.connY    - ICX301 connector Y on the right edge (mm)
 * @param {number} props.passiveY - Y for this band's mid-board trim passives (mm)
 */
const Band = (props: { band: string; connY: number; passiveY: number }) => {
	const j = "J_" + props.band; // PM5-side ICX301
	const p = props.band; // RDV4 port prefix (LF_* / HF_*)

	return (
		<>
			<Icx301
				name={j}
				pcbX={CONN_X}
				pcbY={props.connY}
				pcbRotation={CONN_ROTATION}
				schX={-6}
				schY={props.passiveY}
			/>

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
				pcbX={PASSIVE_X[0]}
				pcbY={props.passiveY}
				schX={0}
				schY={props.passiveY}
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
				pcbX={PASSIVE_X[1]}
				pcbY={props.passiveY}
				schX={0}
				schY={props.passiveY - 1.5}
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
				pcbX={PASSIVE_X[2]}
				pcbY={props.passiveY}
				schX={2}
				schY={props.passiveY - 3}
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

		<Band band="LF" connY={LF_Y} passiveY={7} />
		<Band band="HF" connY={HF_Y} passiveY={-7} />
	</board>
);

export default Adapter;
