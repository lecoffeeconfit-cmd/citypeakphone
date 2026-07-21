import type { CityEnhancedData, CitySourceConfiguration, GovernmentOfficial, OfficialSourceLink } from "./types";

/**
 * Provider selection is data, not UI logic. Enhanced-city configurations can
 * be added by an administrator or a server-side registry without new screens.
 */
export const nationwideSourceConfiguration: CitySourceConfiguration = {
  weatherProvider: "nws",
  airQualityProvider: "open-meteo-cams-air-quality",
  demographicsProvider: "census-acs",
  emergencyProviders: ["nws"],
};

const longBeachOfficialsSource = "https://www.longbeach.gov/officials/";
const longBeachVerifiedAt = "2026-07-20T00:00:00.000Z";

function official(id: string, name: string, role: string, district?: string): GovernmentOfficial {
  return {
    id, cityId: "us-ca-long-beach", name, normalizedRole: role.toLowerCase().replace(/[^a-z0-9]+/g, "_"), displayedTitle: role,
    district, officialProfileUrl: longBeachOfficialsSource, officialContactUrl: longBeachOfficialsSource,
    sourceUrl: longBeachOfficialsSource, sourceProviderId: "long-beach-officials", lastCheckedAt: longBeachVerifiedAt,
    lastVerifiedAt: longBeachVerifiedAt, verificationStatus: "verified",
  };
}

const longBeachOfficialLinks: OfficialSourceLink[] = [
  { id: "lb-city-news", label: "City of Long Beach updates", description: "Official city announcements and services.", url: "https://www.longbeach.gov/", classification: "official_update", agencyType: "city" },
  { id: "lb-police-news", label: "Long Beach Police news", description: "Official police press releases and blotter updates.", url: "https://www.longbeach.gov/police/", classification: "official_update", agencyType: "police" },
  { id: "lb-fire", label: "Long Beach Fire Department", description: "Official fire and preparedness information.", url: "https://www.longbeach.gov/fire/", classification: "official_update", agencyType: "fire" },
  { id: "lb-alert", label: "Alert Long Beach", description: "Official local emergency notification information.", url: "https://www.longbeach.gov/disasterpreparedness/", classification: "official_update", agencyType: "emergency_management" },
];

const longBeachEnhancedData: CityEnhancedData = {
  officials: [
    official("lb-mayor", "Rex Richardson", "Mayor"),
    official("lb-d1", "Mary Zendejas", "City Council", "1st District"),
    official("lb-d2", "Cindy Allen", "City Council", "2nd District"),
    official("lb-d3", "Kristina Duggan", "City Council", "3rd District"),
    official("lb-d4", "Daryl Supernaw", "City Council", "4th District"),
    official("lb-d5", "Megan Kerr", "City Council", "5th District"),
    official("lb-d6", "Suely Saro", "City Council", "6th District"),
    official("lb-d7", "Roberto Uranga", "City Council", "7th District"),
    official("lb-d8", "Tunua Thrash-Ntuk", "City Council", "8th District"),
    official("lb-d9", "Joni Ricks-Oddie", "City Council", "9th District"),
    official("lb-manager", "Tom Modica", "City Manager"),
    official("lb-clerk", "Monique DeLaGarza", "City Clerk"),
  ],
  officialLinks: longBeachOfficialLinks,
  crimeSource: { id: "lb-crime-dashboard", label: "LBPD crime incident map", description: "Official Long Beach Police Department incident dashboard. It is updated weekly; CityPeak does not calculate a citywide comparison from this live incident map.", url: "https://www.longbeach.gov/police/crime-info/crime-incidents/", classification: "official_dashboard", agencyType: "police" },
  serviceRequestSource: { id: "lb-service-requests", label: "Go Long Beach service requests", description: "Official open-data service-request records and the city reporting service.", url: "https://data.longbeach.gov/explore/dataset/service-requests/", classification: "official_service", agencyType: "public_works" },
  meetingSource: { id: "lb-meetings", label: "Council meetings and agendas", description: "Official Long Beach meetings, agendas, and minutes.", url: "https://www.longbeach.gov/cityclerk/meetings/", classification: "official_directory", agencyType: "city" },
  lastVerifiedAt: longBeachVerifiedAt,
};

const nationwideCrimeSource: OfficialSourceLink = {
  id: "fbi-crime-data-explorer",
  label: "FBI Crime Data Explorer",
  description: "Official FBI agency-level crime data. Select the correct law-enforcement agency and review its coverage before comparing periods.",
  url: "https://cde.ucr.cjis.gov/",
  classification: "official_dashboard",
  agencyType: "police",
};

function citySourceLinks(cityId: string, cityName: string, officialUrl: string, service?: OfficialSourceLink): CityEnhancedData {
  return {
    officials: [],
    officialLinks: [
      { id: `${cityId}-directory`, label: `${cityName} government directory`, description: "Official city government departments, elected officials, and public-contact information.", url: officialUrl, classification: "official_directory", agencyType: "city" },
      { id: `${cityId}-updates`, label: `${cityName} official updates`, description: "Official city announcements, meetings, notices, and services.", url: officialUrl, classification: "official_update", agencyType: "city" },
      ...(service ? [service] : []),
    ],
    crimeSource: nationwideCrimeSource,
    serviceRequestSource: service,
  };
}

const citywideOfficialSourceConfigurations: Record<string, CitySourceConfiguration> = {
  "us-ca-los-angeles": { enhancedData: citySourceLinks("us-ca-los-angeles", "City of Los Angeles", "https://lacity.gov/", { id: "la-311", label: "Los Angeles 311", description: "Official City of Los Angeles non-emergency reporting and service information.", url: "https://lacity.gov/311", classification: "official_service", agencyType: "public_works" }) },
  "us-ca-alhambra": { enhancedData: citySourceLinks("us-ca-alhambra", "City of Alhambra", "https://www.cityofalhambra.org/") },
  "us-ca-irvine": { enhancedData: citySourceLinks("us-ca-irvine", "City of Irvine", "https://www.cityofirvine.org/") },
  "us-ca-santa-monica": { enhancedData: citySourceLinks("us-ca-santa-monica", "City of Santa Monica", "https://www.santamonica.gov/") },
  "us-ca-san-diego": { enhancedData: citySourceLinks("us-ca-san-diego", "City of San Diego", "https://www.sandiego.gov/") },
  "us-ca-hollywood": { enhancedData: citySourceLinks("us-ca-hollywood", "City of Los Angeles (Hollywood neighborhood)", "https://lacity.gov/", { id: "hollywood-la-311", label: "Los Angeles 311", description: "Hollywood is a Los Angeles neighborhood; use the City of Los Angeles official non-emergency service.", url: "https://lacity.gov/311", classification: "official_service", agencyType: "public_works" }) },
  "us-ca-pasadena": { enhancedData: citySourceLinks("us-ca-pasadena", "City of Pasadena", "https://www.cityofpasadena.net/") },
  "us-ca-anaheim": { enhancedData: citySourceLinks("us-ca-anaheim", "City of Anaheim", "https://www.anaheim.net/") },
  "us-ca-san-francisco": { enhancedData: citySourceLinks("us-ca-san-francisco", "City and County of San Francisco", "https://www.sf.gov/") },
  "us-ny-new-york": { serviceRequestProvider: "nyc-open-data-311", enhancedData: citySourceLinks("us-ny-new-york", "City of New York", "https://www.nyc.gov/", { id: "nyc-311", label: "NYC 311", description: "Official New York City non-emergency reporting, service status, and request information.", url: "https://portal.311.nyc.gov/", classification: "official_service", agencyType: "public_works" }) },
  "us-il-chicago": { serviceRequestProvider: "chicago-open-data-311", enhancedData: citySourceLinks("us-il-chicago", "City of Chicago", "https://www.chicago.gov/", { id: "chicago-311", label: "Chicago 311", description: "Official City of Chicago non-emergency reporting and service-request information.", url: "https://311.chicago.gov/", classification: "official_service", agencyType: "public_works" }) },
  "us-fl-miami": { enhancedData: citySourceLinks("us-fl-miami", "City of Miami", "https://www.miami.gov/") },
};

export const enhancedCitySourceConfigurations: Record<string, CitySourceConfiguration> = {
  "us-ca-long-beach": {
    crimeProvider: "long-beach-police-dashboard",
    serviceRequestProvider: "long-beach-open-data",
    officialsProvider: "long-beach-officials",
    newsProviders: ["long-beach-city", "long-beach-police", "long-beach-fire"],
    enhancedData: longBeachEnhancedData,
  },
  ...citywideOfficialSourceConfigurations,
};

export function sourceConfigurationForCity(cityId: string): CitySourceConfiguration {
  return { ...nationwideSourceConfiguration, ...(enhancedCitySourceConfigurations[cityId] || {}) };
}
