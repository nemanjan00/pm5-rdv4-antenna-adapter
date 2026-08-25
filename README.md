# PM5 RDV4 Antenna Adapter

## Antenna interface

> **Viewpoint convention:** unless stated otherwise, all orientations in this
> document — both **RDV4** and **PM5** — are as seen **from the top**. (The one
> exception is the PM5 10P header pinout below, which keeps the orientation
> stated in the proxmark3 docs.)

Both the Proxmark3 RDV4 and the PM5 expose **two 3-pin antenna connectors** —
one for the HF antenna and one for the LF antenna — each with the same signals:

| Pin       | Description         |
| --------- | ------------------- |
| GND       | Ground              |
| RAW       | Raw antenna signal  |
| PWR (DRV) | Drive / power       |

On the RDV4 the pins are labelled `GND` / `LF_RAW` / `LF_PWR` (and the `HF_*`
equivalents); on the PM5 silkscreen the drive pin is labelled `DRV`.

> **Note — pin order differs between boards.** Top-down, the PM5 runs both bands
> in the same direction (`DRV` → `RAW` → `GND`). The RDV4 does **not** match this
> on both bands, so do not assume the RDV4 order matches the PM5 when wiring an
> adapter.

On the RDV4, viewed **top-down**, the **left** antenna connection is **HF** and
the **right** is **LF**. Reading left-to-right:

| Band       | Left → right           |
| ---------- | ---------------------- |
| HF (left)  | `GND` → `RAW` → `PWR`   |
| LF (right) | `PWR` → `RAW` → `GND`   |

So the two RDV4 bands are mirrored, and the LF order is reversed relative to the
PM5's `GND` → `RAW` → `DRV`.

### RDV4 antenna interface

![RDV4 antenna interface](images/rdv4-antenna-interface.webp)

Physical interface with dimensions:

![RDV4 physical antenna interface](images/rdv4-antenna-physical.webp)

> The **center connector** (LF_IN, PWR_HI, PWR_OE1, VMID, 5V, USB, etc.) is
> **not used for the antenna** — only the six outer pads (LF: `GND`/`RAW`/`PWR`,
> HF: `PWR`/`RAW`/`GND`) form the antenna interface.

### PM5 (ICX301) antenna interface

![PM5 ICX301 antenna interface](images/icx301-interface.webp)

The PM5 uses ICX301 connectors:

| Part number    | Gender | Mounted on                          |
| -------------- | ------ | ----------------------------------- |
| ICX301PT-MGY   | Male   | PM5 board (carries the center pins) |
| ICX301PT-FGY   | Female | Antenna (pins mate into it)         |

The PM5 board carries the **male** connector — it has the actual center pins —
and the antenna carries the **female** connector that those pins mate into.

#### Extra connector on the PM5 antenna

Unlike the RDV4 antenna, the PM5 antenna also carries a **10-pin (2x5) 2.54 mm**
header, with the **male pins on the antenna** side. Viewed from the top, it sits
on the **far left** side, beyond the ICX301 connectors (LF left, HF right).

This mates with the PM5 **main board 10P Connect header** — a general-purpose
breakout, not antenna-specific. On the shipped antenna the antenna controller
uses the **I2C SDA/SCL** lines (system I2C bus) to talk to the host; the rest of
the pins are unused by the antenna.

**Pinout** (per the proxmark3 docs — orientation: directly viewing the 10P
connector with the machine's decorative side facing up, ICX301 connectors on the
right):

```
 UART_TX   UART_RX   I2C_SDA   SWDIO   SWCLK
 MCU_RST  DBG_PWR_ON  VCC5V4   I2C_SCL   GND
```

| Signal        | MCU pin        | Notes                                                  |
| ------------- | -------------- | ------------------------------------------------------ |
| UART_TX / RX  | `PA2` / `PA3`  | UART or GPIO; 3.3 V                                     |
| I2C_SDA / SCL | `PC7` / `PC6`  | System I2C bus — antenna controller talks here; 3.3 V  |
| SWDIO / SWCLK | `PA13` / `PA14`| SWD debug / flash; 3.3 V                                |
| MCU_RST       | MCU RESET      | 3.3 V pull-up; pull low to reset MCU                   |
| DBG_PWR_ON    | —              | Debug power-on (2.0–15 V high); overrides power switch |
| VCC5V4        | —              | ~5.4 V DCDC output only (<300 mA); do not feed power in|
| GND           | —              | Ground                                                 |

Source: `proxmark3/doc/md/Development/PM5_VERE_Hardware_RM.md` §5.1 and the
antenna controller manual `proxmark3/doc/md/PM5_Controllers/PM5_ANT_Controller_RM.md`
(I2C slave `0x51`).

#### Physical pin layout (PM5)

Viewed from the **top** of the board, the LF connector is on the **left** and the
HF connector is on the **right**. On both connectors the pins read `DRV`, `RAW`,
`GND` from left to right:

```
        (viewed from top)

        LF                    HF
   DRV  RAW  GND         DRV  RAW  GND
```

## Adapter

The adapter connects a PM5 mainboard to an RDV4 (dumb/passive) antenna. The RF
path is a straight pass-through per band; the PM5's antenna-controller I2C bus is
optional and can be emulated so the PM5 sees a valid antenna controller.

```mermaid
flowchart LR
    subgraph PM5["PM5 mainboard — ICX301 + pads"]
        RF_OUT["LF/HF DRV · RAW · GND"]
        CTRL_OUT["I2C SDA/SCL · VCC · GND"]
        BOOST["Adjustable drive voltage<br/>FPGA PWMOUT / PDP_EN"]
    end

    subgraph ADAPTER["Adapter"]
        RFPATH["RF pass-through<br/>DRV·RAW·GND per band<br/>(function-to-function)"]
        RSER["Series-R on DRV<br/>(opt, damping/Q)"]
        CSER["Series-C on RAW<br/>(opt, sense trim)"]
        CTRIM["Shunt-C DRV→GND<br/>(opt, re-tune f0)"]
        EMU["pm5_antx emulator (OPTIONAL)<br/>I2C slave 0x51<br/>ID + ACK-and-mirror<br/>2 blue LEDs (opt.)"]
    end

    subgraph RDV4["RDV4 antenna — dumb / passive"]
        TANK["LF tank L2/C3/R2<br/>HF tank L1/C1/C2/R1<br/>own freq/Q switches"]
    end

    RF_OUT -->|"drive / sense / gnd"| RFPATH
    RFPATH --- RSER
    RFPATH --- CSER
    RFPATH --- CTRIM
    RFPATH -->|"function-to-function<br/>mind the mirror"| TANK
    CTRL_OUT -.->|"optional"| EMU
    BOOST ==>|"drive-first: sets peak V, PM5 side"| RF_OUT

    classDef opt stroke-dasharray:4 4;
    class EMU,RSER,CSER,CTRIM opt;
```

> **Matching is drive-first.** The passive footprints above are unpopulated by
> default — the primary way to match the RDV4 tank to the PM5 is the PM5's
> adjustable BOOST drive voltage, not a series/shunt network. See
> [Matching strategy](#matching-strategy--drive-first-passives-as-fallback).

### Signal mapping (function-to-function)

Wire by **function**, not by physical position — the boards' pin orders differ
(see the pin-order note above), so `PWR`/`DRV`, `RAW`, and `GND` must be matched
across, not straight-through.

The three RF nets are **not** symmetric — each carries a different (optional,
unpopulated-by-default) passive footprint. LF band drawn; HF is identical:

```mermaid
flowchart LR
    subgraph LF["LF band (HF identical)"]
        direction LR
        P_DRV["PM5 DRV"] --- RS["R series<br/>(opt, damping/Q)"] --- R_DRV["RDV4 PWR"]
        P_RAW["PM5 RAW"] --- CS["C series<br/>(opt, sense trim)"] --- R_RAW["RDV4 RAW"]
        P_GND["PM5 GND"] --- R_GND["RDV4 GND"]
        RS -.-|"shunt"| CT["C trim<br/>(opt, re-tune f0)"]
        CT -.- P_GND
    end

    classDef drv fill:#FAECE7,stroke:#993C1D,color:#4A1B0C;
    classDef raw fill:#E1F5EE,stroke:#0F6E56,color:#04342C;
    classDef gnd fill:#F1EFE8,stroke:#5F5E5A,color:#2C2C2A;
    classDef opt fill:#FAEEDA,stroke:#854F0B,color:#412402,stroke-dasharray:4 4;
    class P_DRV,R_DRV drv;
    class P_RAW,R_RAW raw;
    class P_GND,R_GND gnd;
    class RS,CS,CT opt;
```

#### Matching strategy — drive-first, passives-as-fallback

Do **not** reach for a matching network first. The RDV4 tank already resonates
near ~124 kHz and its own R2 (8.2 Ω) sets its damping/Q; the PM5 uses the same
`DRV`/`RAW`/`GND` architecture, so f₀ should stay put when plugged in. The
measured LF ring difference (RDV4 ~37 V vs PM5 ~24 V) is a **drive** difference,
not a Q difference — and drive is corrected on the PM5 side via its adjustable
**BOOST** voltage (FPGA `PWMOUT` / `PDP_EN`), which is strictly better than
burning signal in a series resistor.

So: **populate nothing by default; match via the PM5 drive-voltage knob, and
only fall back to passives if drive adjustment can't get you there.**

| Footprint         | Net       | Populate only to…                                    |
| ----------------- | --------- | ---------------------------------------------------- |
| Series-R          | DRV       | **reduce** Q if PM5 overdrives a too-high-Q tank — costs field |
| Trim-C (shunt)    | DRV → GND | re-land f₀ if measured resonance shifts off-band on PM5 |
| Series-C          | RAW       | fix sense loading if PM5's sense input misbehaves — likely never |
| —                 | GND       | nothing; straight through                            |

> The series-R is a **de-tuning** tool (adds damping), not a signal booster —
> adding it *lowers* the field. If the PM5 tank is under-driven, turn up the
> BOOST drive voltage instead.

## Reference measurements — Proxmark3 RDV4 default antenna

Output of `hw tune` on a Proxmark3 RDV4 with the stock/default antenna, used
as a baseline reference. Q factor must be measured **without a tag on the
antenna**.

### LF Antenna (RDV4)

| Measurement            | Value     |
| ---------------------- | --------- |
| 125.00 kHz             | 36.84 V   |
| 134.83 kHz             | 25.92 V   |
| 123.71 kHz (optimal)   | 36.88 V   |
| Frequency bandwidth    | 5.7       |
| Peak voltage           | 6.4       |
| LF antenna             | ok        |

### HF Antenna (RDV4)

| Measurement            | Value     |
| ---------------------- | --------- |
| 13.56 MHz              | 48.46 V   |
| Peak voltage           | 8.5       |
| HF antenna             | ok        |

### LF tuning graph (RDV4)

- Orange line — divisor 95 / 125.00 kHz
- Blue line — divisor 88 / 134.83 kHz

## Reference measurements — PM5 default antenna

Output of `hw tune` on a PM5 with the stock/default antenna. Q factor must be
measured **without a tag on the antenna**.

### LF Antenna (PM5)

| Measurement            | Value     |
| ---------------------- | --------- |
| 125.00 kHz             | 23.83 V   |
| 134.83 kHz             | 18.30 V   |
| 121.21 kHz (optimal)   | 24.15 V   |
| Frequency bandwidth    | 3.9       |
| Peak voltage           | 7.0       |
| LF antenna             | ok        |

### HF Antenna (PM5)

| Measurement            | Value     |
| ---------------------- | --------- |
| 13.56 MHz              | 41.78 V   |
| Peak voltage           | 12.1      |
| HF antenna             | ok        |

### LF tuning graph (PM5)

- Orange line — divisor 95 / 125.00 kHz
- Blue line — divisor 88 / 134.83 kHz
