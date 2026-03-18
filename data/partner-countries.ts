/**
 * AIESEC in Bardo — partner country data.
 *
 * id:          ISO 3166-1 numeric code (matches world-atlas TopoJSON)
 * alpha2:      ISO 3166-1 alpha-2 code (for display / future use)
 * name:        Display name
 * coordinates: [longitude, latitude] — used as arc endpoint
 * color:       accent color for the connection arc (cycles through brand palette)
 */

export interface PartnerCountry {
  id: string;
  alpha2: string;
  name: string;
  coordinates: [number, number];
  color: string;
}

const ARC_COLORS = ["#F85A40", "#F48924", "#0CB9C1"] as const;

const raw: Omit<PartnerCountry, "color">[] = [
  // Europe
  { id: "250", alpha2: "FR", name: "France",       coordinates: [2.35,   48.85] },
  { id: "276", alpha2: "DE", name: "Germany",      coordinates: [13.40,  52.52] },
  { id: "826", alpha2: "GB", name: "United Kingdom", coordinates: [-0.13, 51.51] },
  { id: "380", alpha2: "IT", name: "Italy",         coordinates: [12.50,  41.90] },
  { id: "724", alpha2: "ES", name: "Spain",         coordinates: [-3.70,  40.42] },
  { id: "528", alpha2: "NL", name: "Netherlands",   coordinates: [4.90,   52.37] },
  { id: "056", alpha2: "BE", name: "Belgium",       coordinates: [4.35,   50.85] },
  { id: "620", alpha2: "PT", name: "Portugal",      coordinates: [-9.14,  38.72] },
  { id: "616", alpha2: "PL", name: "Poland",        coordinates: [21.01,  52.23] },
  { id: "642", alpha2: "RO", name: "Romania",       coordinates: [26.10,  44.43] },
  { id: "300", alpha2: "GR", name: "Greece",        coordinates: [23.73,  37.98] },
  { id: "040", alpha2: "AT", name: "Austria",       coordinates: [16.37,  48.21] },
  { id: "756", alpha2: "CH", name: "Switzerland",   coordinates: [7.45,   46.95] },
  { id: "752", alpha2: "SE", name: "Sweden",        coordinates: [18.07,  59.33] },
  { id: "578", alpha2: "NO", name: "Norway",        coordinates: [10.75,  59.91] },
  { id: "208", alpha2: "DK", name: "Denmark",       coordinates: [12.57,  55.68] },
  { id: "246", alpha2: "FI", name: "Finland",       coordinates: [25.00,  60.17] },
  { id: "203", alpha2: "CZ", name: "Czech Republic", coordinates: [14.42, 50.08] },
  { id: "348", alpha2: "HU", name: "Hungary",       coordinates: [19.04,  47.50] },
  { id: "804", alpha2: "UA", name: "Ukraine",       coordinates: [30.52,  50.45] },
  { id: "792", alpha2: "TR", name: "Turkey",        coordinates: [32.86,  39.93] },
  // Americas
  { id: "840", alpha2: "US", name: "United States", coordinates: [-95.71, 37.09] },
  { id: "076", alpha2: "BR", name: "Brazil",        coordinates: [-47.93, -15.78] },
  { id: "484", alpha2: "MX", name: "Mexico",        coordinates: [-99.13, 19.43] },
  { id: "032", alpha2: "AR", name: "Argentina",     coordinates: [-58.38, -34.60] },
  { id: "170", alpha2: "CO", name: "Colombia",      coordinates: [-74.08,  4.71] },
  { id: "152", alpha2: "CL", name: "Chile",         coordinates: [-70.67, -33.45] },
  { id: "604", alpha2: "PE", name: "Peru",          coordinates: [-77.04,  -12.05] },
  { id: "124", alpha2: "CA", name: "Canada",        coordinates: [-75.70,  45.42] },
  // Asia & Middle East
  { id: "356", alpha2: "IN", name: "India",         coordinates: [77.21,  28.63] },
  { id: "156", alpha2: "CN", name: "China",         coordinates: [116.40, 39.91] },
  { id: "392", alpha2: "JP", name: "Japan",         coordinates: [139.69, 35.69] },
  { id: "410", alpha2: "KR", name: "South Korea",   coordinates: [126.98, 37.57] },
  { id: "682", alpha2: "SA", name: "Saudi Arabia",  coordinates: [46.68,  24.69] },
  { id: "784", alpha2: "AE", name: "UAE",           coordinates: [54.37,  24.47] },
  { id: "586", alpha2: "PK", name: "Pakistan",      coordinates: [73.04,  33.72] },
  { id: "360", alpha2: "ID", name: "Indonesia",     coordinates: [106.84, -6.21] },
  { id: "458", alpha2: "MY", name: "Malaysia",      coordinates: [101.69,  3.14] },
  { id: "764", alpha2: "TH", name: "Thailand",      coordinates: [100.52, 13.75] },
  { id: "704", alpha2: "VN", name: "Vietnam",       coordinates: [105.85, 21.03] },
  { id: "050", alpha2: "BD", name: "Bangladesh",    coordinates: [90.41,  23.72] },
  { id: "566", alpha2: "NG", name: "Nigeria",       coordinates: [7.49,    9.06] },
  // Africa
  { id: "818", alpha2: "EG", name: "Egypt",         coordinates: [31.24,  30.06] },
  { id: "504", alpha2: "MA", name: "Morocco",       coordinates: [-6.85,  33.99] },
  { id: "012", alpha2: "DZ", name: "Algeria",       coordinates: [3.04,   36.74] },
  { id: "710", alpha2: "ZA", name: "South Africa",  coordinates: [28.04, -26.20] },
  { id: "404", alpha2: "KE", name: "Kenya",         coordinates: [36.82,  -1.29] },
  { id: "288", alpha2: "GH", name: "Ghana",         coordinates: [-0.19,   5.56] },
  { id: "800", alpha2: "UG", name: "Uganda",        coordinates: [32.58,   0.32] },
  { id: "834", alpha2: "TZ", name: "Tanzania",      coordinates: [39.29,  -6.37] },
  { id: "024", alpha2: "AO", name: "Angola",        coordinates: [13.23, -8.84] },
  { id: "426", alpha2: "LS", name: "Lesotho",       coordinates: [27.48, -29.32] },
];

export const partnerCountries: PartnerCountry[] = raw.map((c, i) => ({
  ...c,
  color: ARC_COLORS[i % ARC_COLORS.length],
}));

/** Set of numeric IDs for fast O(1) lookup in Geography render */
export const partnerCountryIds = new Set(partnerCountries.map((c) => c.id));

/** Tunisia — the hub */
export const TUNISIA: PartnerCountry = {
  id: "788",
  alpha2: "TN",
  name: "Tunisia",
  coordinates: [9.54, 33.89],
  color: "#ff3131",
};
