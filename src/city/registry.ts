import type { CityEnhancedData, CitySourceConfiguration, GovernmentOfficial, OfficialSourceLink } from "./types";

/**
 * Provider selection is data, not UI logic. Enhanced-city configurations can
 * be added by an administrator or a server-side registry without new screens.
 */
export const nationwideSourceConfiguration: CitySourceConfiguration = {
  weatherProvider: "nws",
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

export const enhancedCitySourceConfigurations: Record<string, CitySourceConfiguration> = {
  "us-ca-long-beach": {
    crimeProvider: "long-beach-police-dashboard",
    serviceRequestProvider: "long-beach-open-data",
    officialsProvider: "long-beach-officials",
    newsProviders: ["long-beach-city", "long-beach-police", "long-beach-fire"],
    enhancedData: longBeachEnhancedData,
  },
};

export function sourceConfigurationForCity(cityId: string): CitySourceConfiguration {
  return { ...nationwideSourceConfiguration, ...(enhancedCitySourceConfigurations[cityId] || {}) };
}
