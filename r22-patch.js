"use strict";
/* BG-RehaManager Südwest 4.6 / R22 – Sprachschule + Fahrschul-Erweiterung */
(() => {
  const segment = "Berufliche Teilhabe / Arbeitsintegration";
  const oldLanguage = "Deutsch & Berufssprache";
  const languageLabel = "Sprachschule / Deutsch & Berufssprache";
  const truckBus = "Berufskraftfahrer / LKW & Bus";
  const multilingualCar = "Mehrsprachige Fahrschule / PKW";

  const uniquePush = (arr, ...items) => items.forEach(item => {
    if (Array.isArray(arr) && !arr.includes(item)) arr.push(item);
  });
  const replaceFirst = (arr, oldValue, newValue) => {
    if (!Array.isArray(arr)) return;
    const i = arr.indexOf(oldValue);
    if (i >= 0) arr[i] = newValue;
    else if (!arr.includes(newValue)) arr.push(newValue);
  };

  if (typeof GROUP_ALIASES !== "undefined") {
    GROUP_ALIASES[languageLabel] = [
      oldLanguage, languageLabel, "Berufssprachkurs (BSK)", "B2 mit Brückenelement",
      "Job-BSK / arbeitsplatzbezogene Sprachförderung", "Berufssprache", "Berufsdeutsch"
    ];
    GROUP_ALIASES[truckBus] = [
      truckBus, "LKW-Führerschein", "C/CE", "C1/C1E", "Busführerschein", "D/DE", "D1/D1E",
      "Berufskraftfahrerqualifikation", "Beschleunigte Grundqualifikation", "BKF-Weiterbildung", "BKF", "BKrFQG"
    ];
    GROUP_ALIASES[multilingualCar] = [
      multilingualCar, "PKW-Führerschein", "Klasse B", "B197", "Theorie mehrsprachig",
      "Praxis mehrsprachig", "Lern-App mehrsprachig", "Umschreibung ausländischer Fahrerlaubnis"
    ];
  }

  if (typeof SEGMENT_FACETS !== "undefined" && Array.isArray(SEGMENT_FACETS[segment])) {
    const facets = SEGMENT_FACETS[segment];
    replaceFirst(facets, oldLanguage, languageLabel);
    uniquePush(facets,
      truckBus, "LKW-Führerschein", "C/CE", "C1/C1E", "Busführerschein", "D/DE", "D1/D1E",
      "Berufskraftfahrerqualifikation", "Beschleunigte Grundqualifikation", "BKF-Weiterbildung", "ADR", "AZAV", "Bildungsgutschein",
      multilingualCar, "PKW-Führerschein", "Klasse B", "B197", "Theorie mehrsprachig", "Praxis mehrsprachig",
      "Lern-App mehrsprachig", "Umschreibung ausländischer Fahrerlaubnis"
    );
  }

  if (typeof PRACTICAL_MEASURES !== "undefined") {
    replaceFirst(PRACTICAL_MEASURES, oldLanguage, languageLabel);
    uniquePush(PRACTICAL_MEASURES, truckBus, multilingualCar,
      "LKW-Führerschein", "Busführerschein", "Berufskraftfahrerqualifikation", "PKW-Führerschein",
      "Umschreibung ausländischer Fahrerlaubnis");
  }

  if (typeof DASHBOARD_SECTIONS !== "undefined") {
    const lta = DASHBOARD_SECTIONS.find(row => row && row[0] === "kpisLta");
    if (lta && Array.isArray(lta[2])) {
      replaceFirst(lta[2], oldLanguage, languageLabel);
      uniquePush(lta[2], truckBus, multilingualCar);
    }
  }

  if (typeof CASE_NEEDS !== "undefined") {
    CASE_NEEDS[languageLabel] = {
      groups:[segment],
      terms:["deutsch","berufssprache","sprachkurs","b1","b2","bsk","job-bsk","arbeitsplatzbezogene sprachförderung","migration"]
    };
    CASE_NEEDS[truckBus] = {
      groups:[segment],
      terms:["berufskraftfahrer","lkw","bus","c/ce","c1/c1e","d/de","d1/d1e","bkf","bkrfqg","adr","bildungsgutschein","azav"]
    };
    CASE_NEEDS[multilingualCar] = {
      groups:[segment],
      terms:["fahrschule","pkw","klasse b","b197","mehrsprachig","englisch","türkisch","russisch","umschreibung","migration"]
    };
  }

  if (typeof SEARCH_SYNONYMS !== "undefined") {
    SEARCH_SYNONYMS["sprachschule"] = ["deutsch","berufssprache","sprachkurs","b1","b2","bsk"];
    SEARCH_SYNONYMS["lkw"] = ["berufskraftfahrer","c","ce","c1","c1e","güterverkehr","bkf"];
    SEARCH_SYNONYMS["bus"] = ["berufskraftfahrer","d","de","d1","d1e","personenverkehr","personenbeförderung","bkf"];
    SEARCH_SYNONYMS["berufskraftfahrer"] = ["lkw","bus","c","ce","d","de","bkf","bkrfqg"];
    SEARCH_SYNONYMS["fahrschule"] = ["führerschein","pkw","klasse b","b197","lkw","bus","mehrsprachig"];
    SEARCH_SYNONYMS["migrant"] = ["mehrsprachig","deutsch","englisch","türkisch","russisch","farsi","umschreibung","sprachkurs"];
    SEARCH_SYNONYMS["migration"] = SEARCH_SYNONYMS["migrant"];
    SEARCH_SYNONYMS["umschreibung"] = ["ausländischer führerschein","ausländische fahrerlaubnis","fahrschule","pkw"];
  }

  // Falls die Daten extrem schnell geladen wurden, UI nachziehen. Normalerweise greift
  // die Konfiguration bereits vor initUI(), weil data.json über den Service Worker zusammengeführt wird.
  const refresh = () => {
    try {
      if (typeof facilities !== "undefined" && Array.isArray(facilities) && facilities.length) {
        if (typeof fillSelectors === "function") fillSelectors();
        if (typeof renderKpis === "function") renderKpis();
        if (typeof renderStats === "function") renderStats();
        if (typeof renderQuality === "function") renderQuality();
      }
    } catch (e) {
      console.warn("R22 UI-Nachzug nicht erforderlich/fehlgeschlagen:", e);
    }
  };
  setTimeout(refresh, 700);
})();
