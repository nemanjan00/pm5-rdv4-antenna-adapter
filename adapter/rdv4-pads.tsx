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
 * Each pad is a ROUND contact pad with a central hole holding a press-fit
 * THREADED PCB INSERT (M1.6). An M1.6 screw passes through the antenna pad and
 * this pad into the insert; the screw clamps the antenna pad against this pad →
 * that clamp is the electrical contact. So the hole must be sized for the
 * insert's knurled press-fit OD (bigger than the 1.6 mm thread), and the insert
 * body sits on the back — leave keep-out on the reverse.
 *
 * The center connector is unused electrically but its body still occupies space,
 * so the adapter must leave clearance there.
 *
 * ⚠️ Geometry read off the dimensioned drawing; CONFIRM against hardware.
 */

// ── Mechanical constants (from images/rdv4-antenna-physical.webp) ──────────
// TODO: confirm every value against the physical RDV4 antenna.
// M1.6 press-fit threaded PCB insert: the hole takes the insert's knurled OD
// (> 1.6 mm thread), and the insert body protrudes on the back — reserve
// ~5 mm back-side keep-out per pad.
// TODO: pick the exact insert (e.g. an M1.6 press-fit / SMT standoff) and set
// the hole to its datasheet press-fit Ø; model the reverse-side keep-out.
// NB: PAD_OUTER_D must stay < the smallest pad pitch (4.4 mm) or the round pads
// overlap. TODO: confirm the real insert knurl Ø and pad Ø from datasheets.
const INSERT_PRESSFIT_D = 2.5; // mm, HOLE sized for M1.6 insert knurl OD   TODO
const PAD_OUTER_D = 3.5; // mm, round contact-pad OD (< 4.4 mm pitch)       TODO

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
					{/* Round contact pad + hole for the M1.6 press-fit threaded
					    insert. The screw clamp through it is the electrical
					    contact. */}
					{PADS.map((pad, index) => (
						<platedhole
							key={pad.port}
							portHints={[String(index + 1)]}
							pcbX={baseX}
							pcbY={yOf(pad.down)}
							holeDiameter={INSERT_PRESSFIT_D}
							outerDiameter={PAD_OUTER_D}
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
