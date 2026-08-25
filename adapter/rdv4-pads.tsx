/**
 * RDV4 antenna landing interface — the side the RDV4 antenna solders/bolts onto.
 *
 * Modelled to MATCH the RDV4 antenna's actual footprint (see
 * images/rdv4-antenna-physical.webp): a SINGLE VERTICAL COLUMN of six round
 * ~M1.6 pads on the antenna's edge, NOT two little horizontal connectors.
 *
 *   GND     (LF)  ─┐
 *   LF_RAW         │  LF trio
 *   LF_PWR        ─┘
 *   ┄┄ center connector (LF_IN/PWR_HI/…/VUSB) — NOT used for the antenna ┄┄
 *   HF_PWR        ─┐
 *   HF_RAW         │  HF trio
 *   GND     (HF)  ─┘
 *
 * Each pad is a round SMD land carrying an M1.6 **SMT nut** (e.g. PEM ReelFast
 * SMTSO-M1.6-1ET), reflow- or hand-soldered on. The screw passes through the
 * antenna pad and threads into this nut, clamping the antenna pad down → that
 * clamp (and the soldered nut) is the electrical contact. So the footprint is
 * the nut's solder land + a centre screw-clearance hole; the nut body sits on
 * this side — leave keep-out around it.
 *
 * The center connector is unused electrically but its body still occupies space,
 * so the adapter must leave clearance there.
 *
 * ⚠️ Geometry read off the dimensioned drawing; CONFIRM against hardware, and
 * pull the exact land/clearance from the SMT-nut datasheet.
 */

// ── Mechanical constants (from images/rdv4-antenna-physical.webp) ──────────
// TODO: confirm every value against the physical RDV4 antenna.
// M1.6 SMT nut (PEM SMTSO-M1.6-1ET or equivalent): round solder land + a centre
// clearance hole for the screw. The nut body protrudes on this side — reserve
// keep-out around it. NB: NUT_LAND_D must stay < the smallest pad pitch (4.4 mm)
// or the round lands overlap.
// TODO: set NUT_LAND_D and SCREW_CLEARANCE_D from the SMT-nut datasheet land.
const NUT_LAND_D = 3.2; // mm, round SMD land for the nut barrel (< 4.4 pitch) TODO
const SCREW_CLEARANCE_D = 1.8; // mm, centre hole for the M1.6 screw          TODO

// Vertical pad-to-pad spacings, top → bottom (mm). TODO: confirm.
const GAP_GND_LFRAW = 5.0; // GND → LF_RAW
const GAP_LFRAW_LFPWR = 4.5; // LF_RAW → LF_PWR
const GAP_LFPWR_HFPWR = 14.8; // LF_PWR → HF_PWR (spans center connector)
const GAP_HFPWR_HFRAW = 4.4; // HF_PWR → HF_RAW
const GAP_HFRAW_GND = 4.4; // HF_RAW → GND

// Center connector keep-out (unused for antenna, but body needs clearance).
const CENTER_KEEPOUT_W = 8.0; // mm  TODO
const CENTER_KEEPOUT_H = 12.0; // mm TODO

// Pads top → bottom with cumulative downward offset from the top pad.
const PADS = [
	{ port: "LF_GND", down: 0 },
	{ port: "LF_RAW", down: GAP_GND_LFRAW },
	{ port: "LF_PWR", down: GAP_GND_LFRAW + GAP_LFRAW_LFPWR },
	{ port: "HF_PWR", down: GAP_GND_LFRAW + GAP_LFRAW_LFPWR + GAP_LFPWR_HFPWR },
	{
		port: "HF_RAW",
		down: GAP_GND_LFRAW + GAP_LFRAW_LFPWR + GAP_LFPWR_HFPWR + GAP_HFPWR_HFRAW,
	},
	{
		port: "HF_GND",
		down:
			GAP_GND_LFRAW +
			GAP_LFRAW_LFPWR +
			GAP_LFPWR_HFPWR +
			GAP_HFPWR_HFRAW +
			GAP_HFRAW_GND,
	},
];

const COLUMN_HEIGHT = PADS[PADS.length - 1].down;

// Center of the keep-out sits between LF_PWR and HF_PWR.
const CENTER_KEEPOUT_DOWN =
	(PADS[2].down + PADS[3].down) / 2;

/**
 * RDV4 antenna landing interface (all six pads + center-connector keep-out).
 *
 * Ports: LF_GND, LF_RAW, LF_PWR, HF_PWR, HF_RAW, HF_GND.
 *
 * @param {object} props
 * @param {string} props.name  - refdes (e.g. "RDV4")
 * @param {number} [props.pcbX]
 * @param {number} [props.pcbY] - board Y of the column centre
 */
export const Rdv4Interface = (props: {
	name: string;
	pcbX?: number;
	pcbY?: number;
}) => {
	const baseX = props.pcbX ?? 0;
	const baseY = props.pcbY ?? 0;
	// pcbY increases upward, so map "down" offsets to negative Y, centred.
	const yOf = (down: number) => baseY + COLUMN_HEIGHT / 2 - down;

	return (
		<chip
			name={props.name}
			pinLabels={PADS.reduce((labels, pad, index) => {
				labels[String(index + 1)] = pad.port;
				return labels;
			}, {} as Record<string, string>)}
			footprint={
				<footprint>
					{/* SMT-nut land: annular ring (nut solders to it) + centre
					    screw-clearance hole. Modelled as an annular plated hole to
					    avoid the pad/hole overlap DRC a separate smtpad+hole hits. */}
					{PADS.map((pad, index) => (
						<platedhole
							key={pad.port}
							portHints={[String(index + 1)]}
							pcbX={baseX}
							pcbY={yOf(pad.down)}
							holeDiameter={SCREW_CLEARANCE_D}
							outerDiameter={NUT_LAND_D}
							shape="circle"
						/>
					))}
					{/* Center connector — unused for antenna; keep-out for its body. */}
					<silkscreenrect
						pcbX={baseX}
						pcbY={yOf(CENTER_KEEPOUT_DOWN)}
						width={CENTER_KEEPOUT_W}
						height={CENTER_KEEPOUT_H}
					/>
				</footprint>
			}
		/>
	);
};

export default Rdv4Interface;
