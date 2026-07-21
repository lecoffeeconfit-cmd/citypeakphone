export type City = {
  id: string;
  name: string;
  stateCode: string;
  stateFips?: string;
  countyFips?: string;
  placeFips?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

export type Availability = "available" | "limited" | "external_link" | "community_only" | "unavailable";
export type DataHealth = "healthy" | "stale" | "limited" | "failed" | "manual_review" | "disabled";

export type DataSourceStatus = {
  cityId: string;
  dataType: string;
  providerId: string;
  sourceUrl: string;
  lastCheckedAt?: string;
  lastSuccessfulFetchAt?: string;
  sourceLastModifiedAt?: string;
  dataPeriodStart?: string;
  dataPeriodEnd?: string;
  expectedUpdateFrequency?: string;
  etag?: string;
  contentHash?: string;
  status: DataHealth;
  failureCount: number;
  lastErrorCode?: string;
};

export type SourceMeta = {
  name: string;
  url: string;
  status: DataSourceStatus;
};

export type WeatherSummary = {
  temperature?: number;
  unit?: string;
  shortForecast?: string;
  forecast: { label: string; temperature?: number; unit?: string; summary?: string }[];
  source: SourceMeta;
};

export type Demographics = {
  population?: number;
  medianHouseholdIncome?: number;
  medianAge?: number;
  medianHomeValue?: number;
  source: SourceMeta;
};

export type EmergencyAlert = {
  id: string;
  event: string;
  severity?: string;
  urgency?: string;
  certainty?: string;
  affectedAreas?: string;
  headline?: string;
  effective?: string;
  expires?: string;
  url?: string;
};

export type CityDataConnector<T> = {
  providerId: string;
  supports(city: City): Promise<boolean>;
  fetch(city: City): Promise<T>;
};

export type CityOverviewData = {
  city: City;
  weather?: WeatherSummary;
  demographics?: Demographics;
  alerts: EmergencyAlert[];
  statuses: DataSourceStatus[];
  enhanced?: CityEnhancedData;
  cache?: {
    isStale: boolean;
    savedAt?: string;
  };
  availability: Record<"weather" | "airQuality" | "demographics" | "alerts" | "crime" | "issues" | "government" | "news", Availability>;
};

export type CrimeCategory =
  | "violent_crime" | "homicide" | "rape" | "robbery" | "aggravated_assault"
  | "property_crime" | "burglary" | "larceny_theft" | "motor_vehicle_theft"
  | "arson" | "other";

export type CrimeCoverageStatus = "complete" | "mostly_complete" | "partial" | "unknown" | "insufficient";

export type CrimeStatistic = {
  id: string;
  cityId: string;
  providerId: string;
  sourceAgencyId?: string;
  sourceAgencyName: string;
  geographicScope: "city" | "police_jurisdiction" | "county" | "reporting_district" | "unknown";
  offenseCode?: string;
  category: CrimeCategory;
  categoryLabel: string;
  incidentCount: number;
  populationUsed?: number;
  ratePer100k?: number;
  periodStart: string;
  periodEnd: string;
  comparisonRatePer100k?: number;
  comparisonGeography?: string;
  percentageDifferenceFromComparison?: number;
  percentageChangeFromPriorPeriod?: number;
  reportingCoveragePercent?: number;
  coverageStatus: CrimeCoverageStatus;
  sourceUrl: string;
  sourcePublishedAt?: string;
  fetchedAt: string;
};

export type GovernmentOfficial = {
  id: string;
  cityId: string;
  name: string;
  normalizedRole: string;
  displayedTitle: string;
  district?: string;
  photoUrl?: string;
  officialProfileUrl?: string;
  officialContactUrl?: string;
  termStart?: string;
  termEnd?: string;
  sourceUrl: string;
  sourceProviderId: string;
  sourceLastModifiedAt?: string;
  lastCheckedAt: string;
  lastVerifiedAt?: string;
  verificationStatus: "verified" | "possible_change" | "pending_review" | "unavailable";
};

export type OfficialChangeReview = {
  id: string;
  cityId: string;
  officialRecordId?: string;
  detectedChangeType: "name" | "title" | "profile_url" | "term" | "added" | "removed" | "unknown";
  previousValue?: unknown;
  proposedValue?: unknown;
  sourceUrl: string;
  detectedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: string;
  reviewedBy?: string;
};

export type CityServiceRequest = {
  id: string;
  externalId?: string;
  cityId: string;
  providerId: string;
  sourceType: "official_311" | "official_open_data" | "community_report";
  category: string;
  originalCategory?: string;
  title: string;
  description?: string;
  status: "open" | "acknowledged" | "in_progress" | "closed" | "unknown";
  originalStatus?: string;
  latitude?: number;
  longitude?: number;
  approximateLocation?: string;
  reportedAt?: string;
  updatedAt?: string;
  closedAt?: string;
  sourceUrl?: string;
  fetchedAt: string;
};

export type CityNewsItem = {
  id: string;
  cityId: string;
  providerId: string;
  classification: "official_update" | "local_news" | "community_report";
  agencyType?: "city" | "police" | "fire" | "emergency_management" | "public_works" | "transportation" | "county" | "other";
  title: string;
  summary?: string;
  sourceName: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  sourceUpdatedAt?: string;
  fetchedAt: string;
};

export type OfficialSourceLink = {
  id: string;
  label: string;
  description: string;
  url: string;
  classification: "official_update" | "official_service" | "official_dashboard" | "official_directory";
  agencyType?: CityNewsItem["agencyType"];
};

export type CityEnhancedData = {
  officials: GovernmentOfficial[];
  officialLinks: OfficialSourceLink[];
  crimeSource?: OfficialSourceLink;
  serviceRequestSource?: OfficialSourceLink;
  meetingSource?: OfficialSourceLink;
  lastVerifiedAt?: string;
};

export type CitySourceConfiguration = {
  weatherProvider?: string;
  airQualityProvider?: string;
  demographicsProvider?: string;
  emergencyProviders?: string[];
  crimeProvider?: string;
  serviceRequestProvider?: string;
  officialsProvider?: string;
  newsProviders?: string[];
  enhancedData?: CityEnhancedData;
};
