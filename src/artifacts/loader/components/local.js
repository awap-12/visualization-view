//region Webpack loading fixtures.
import GlobalAnnual from "../fixtures/base01/HadCRUT-global-annual.csv";
import GlobalMonthly from "../fixtures/base01/HadCRUT-global-monthly.csv";
import NHAnnual from "../fixtures/base01/HadCRUT-northern-hemisphere-annual.csv";
import NHMonthly from "../fixtures/base01/HadCRUT-northern-hemisphere-monthly.csv";
import SHAnnual from "../fixtures/base01/HadCRUT-southern-hemisphere-annual.csv";
import SHMonthly from "../fixtures/base01/HadCRUT-southern-hemisphere-monthly.csv";

import NHTemperature from "../fixtures/base02/northern-hemisphere-temperature-reconstruction.csv";

import Co2Annual from "../fixtures/base03/Mauna-Loa-co2-annual.csv";
import Co2Monthly from "../fixtures/base03/Mauna-Loa-co2-monthly.csv";

import DE08IceCore from "../fixtures/base04/DE08-ice-core.csv";
import DE082IceCore from "../fixtures/base04/DE08-2-ice-core.csv";
import DSSIceCore from "../fixtures/base04/DSS-ice-core.csv";

import VostokIceCore from "../fixtures/base05/Vostok-ice-core.csv";

import AntarcticIceCore from "../fixtures/base06/antarctic-ice-cores.csv";

import AntarcticTemperature from "../fixtures/base07/antarctic-temperature.csv";
import Co2 from "../fixtures/base07/carbon-dioxide.csv";
import GAST from "../fixtures/base07/GAST.csv";

import CarbonEmission from "../fixtures/base08/national-carbon-emissions.csv";

import Co2EmissionLayer1 from "../fixtures/base09/co2-emission-layer1.csv";
import Co2EmissionLayer2 from "../fixtures/base09/co2-emission-layer2.csv";
import Co2EmissionLayer3 from "../fixtures/base09/co2-emission-layer3.csv";

import HumanEvolution from "../fixtures/base10/human-evolution-and-activities.csv";
import useFetchStrategyLoader from "./fetch";

//endregion

const dataSheet = {
    base01: {
        GlobalAnnual, GlobalMonthly, NHAnnual, NHMonthly, SHAnnual, SHMonthly
    },
    base02: {
        GlobalAnnual, GlobalMonthly, NHAnnual, NHMonthly, SHAnnual, SHMonthly, NHTemperature
    },
    base03: {
        Co2Annual, Co2Monthly
    },
    base04: {
        Co2Annual, Co2Monthly, DE08IceCore, DE082IceCore, DSSIceCore
    },
    base05: {
        VostokIceCore
    },
    base06: {
        AntarcticIceCore
    },
    base07: {
        AntarcticTemperature, Co2, GAST
    },
    base08: {
        CarbonEmission
    },
    base09: {
        Co2EmissionLayer1, Co2EmissionLayer2, Co2EmissionLayer3
    },
    base10: {
        HumanEvolution
    }
}

/**
 * @return {object}
 */
function useLocalStrategyLoader({
    src
}) {
    return useFetchStrategyLoader(src);
}

export default useLocalStrategyLoader;
