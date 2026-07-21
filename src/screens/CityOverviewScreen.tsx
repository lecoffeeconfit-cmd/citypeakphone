import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { loadCityOverview } from "../city/service";
import type { Availability, CityOverviewData, OfficialSourceLink, SourceMeta } from "../city/types";

type CitySection = "Overview" | "Safety" | "Issues" | "Government" | "News" | "Community";
const sections: CitySection[] = ["Overview", "Safety", "Issues", "Government", "News", "Community"];

type Props = { cityId: string; selectedArea: string; communityPostCount: number; onOpenCommunity: () => void; onChangeCity: () => void };
const numbers = new Intl.NumberFormat("en-US");
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function time(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Not available" : date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function period(status: SourceMeta["status"]) {
  if (!status.dataPeriodStart || !status.dataPeriodEnd) return "Current conditions";
  const start = new Date(status.dataPeriodStart);
  const end = new Date(status.dataPeriodEnd);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) return "Current reporting period";
  const format = (value: Date) => value.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${format(start)}–${format(end)}`;
}

function openUrl(url?: string) {
  if (url?.startsWith("https://")) Linking.openURL(url).catch(() => undefined);
}

function Card({ eyebrow, title, children, accent = "#77D8F4" }: { eyebrow?: string; title: string; children: React.ReactNode; accent?: string }) {
  return <View style={{ backgroundColor: "rgba(20,42,64,0.66)", borderWidth: 1, borderColor: "rgba(163,217,237,0.22)", borderRadius: 22, padding: 17, marginBottom: 13, shadowColor: "#000", shadowOpacity: 0.13, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 }}>
    {eyebrow ? <Text style={{ color: accent, fontSize: 11, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{eyebrow}</Text> : null}
    <Text style={{ color: "#F7FCFF", fontSize: 18, fontWeight: "900", letterSpacing: -0.2 }}>{title}</Text>
    {children}
  </View>;
}

function SourceDetails({ source }: { source: SourceMeta }) {
  const status = source.status;
  const tone = status.status === "healthy" ? "#65D7B1" : status.status === "failed" ? "#F59E0B" : "#A7C7D8";
  const statusLabel = status.status === "healthy" ? "Available" : status.status === "stale" ? "Cached — refresh needed" : status.status === "failed" ? "Unavailable" : "Limited";
  return <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: "rgba(186,230,253,0.16)", paddingTop: 10 }}>
    <Text accessibilityLabel={`Source status: ${statusLabel}`} style={{ color: tone, fontWeight: "800", fontSize: 12 }}>{source.name} · {statusLabel}</Text>
    <Text style={{ color: "#8EA9BC", fontSize: 11, lineHeight: 17, marginTop: 3 }}>Data period: {period(status)}</Text>
    {status.sourceLastModifiedAt ? <Text style={{ color: "#8EA9BC", fontSize: 11, lineHeight: 17 }}>Source updated: {time(status.sourceLastModifiedAt)}</Text> : null}
    <Text style={{ color: "#8EA9BC", fontSize: 11, lineHeight: 17 }}>CityPeak checked: {time(status.lastCheckedAt)}</Text>
    {source.url ? <Pressable accessibilityRole="link" accessibilityLabel={`Open ${source.name}`} onPress={() => openUrl(source.url)} hitSlop={8}><Text style={{ color: "#77D8F4", fontWeight: "800", marginTop: 7, fontSize: 12 }}>View source ↗</Text></Pressable> : null}
  </View>;
}

function AvailabilityCard({ title, availability, description, actionLabel, onAction }: { title: string; availability: Availability; description: string; actionLabel?: string; onAction?: () => void }) {
  const label = availability === "community_only" ? "Community reports" : availability === "external_link" ? "Official link" : availability === "unavailable" ? "Not currently available" : "Limited official data";
  return <Card eyebrow={label} title={title} accent={availability === "community_only" ? "#C6B4FF" : "#F7BD61"}>
    <Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>{description}</Text>
    {actionLabel && onAction ? <Pressable style={{ marginTop: 14, alignSelf: "flex-start", backgroundColor: "rgba(119,216,244,0.14)", borderWidth: 1, borderColor: "rgba(119,216,244,0.35)", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9 }} onPress={onAction}><Text style={{ color: "#AEEAFF", fontWeight: "900" }}>{actionLabel}</Text></Pressable> : null}
  </Card>;
}

function OfficialLinkCard({ link, eyebrow = "Official source" }: { link: OfficialSourceLink; eyebrow?: string }) {
  return <Card eyebrow={eyebrow} title={link.label} accent="#8EDCF1">
    <Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>{link.description}</Text>
    <Pressable accessibilityRole="link" accessibilityLabel={`Open ${link.label}`} onPress={() => openUrl(link.url)} style={{ marginTop: 14, alignSelf: "flex-start", backgroundColor: "rgba(119,216,244,0.14)", borderWidth: 1, borderColor: "rgba(119,216,244,0.35)", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9 }}><Text style={{ color: "#AEEAFF", fontWeight: "900" }}>Open official source ↗</Text></Pressable>
  </Card>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={{ width: "47%", flexGrow: 1 }}><Text style={{ color: "#91AFC1", fontSize: 11, fontWeight: "800" }}>{label}</Text><Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900", marginTop: 3 }}>{value}</Text></View>;
}

function Overview({ data }: { data: CityOverviewData }) {
  const weather = data.weather;
  const airQuality = data.airQuality;
  const demographics = data.demographics;
  const weatherTitle = weather ? `${weather.temperature ?? "—"}°${weather.unit || ""} · ${weather.shortForecast || "Weather"}` : "Weather";
  return <>
    {weather ? <Card eyebrow="Current conditions" title={weatherTitle}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>{weather.forecast.map((period) => <View key={period.label} style={{ minWidth: "44%", flexGrow: 1, backgroundColor: "rgba(5,17,32,0.35)", borderRadius: 14, padding: 10 }}><Text style={{ color: "#AFC6D5", fontSize: 11, fontWeight: "800" }}>{period.label}</Text><Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 3 }}>{period.temperature ?? "—"}°{period.unit || ""}</Text><Text numberOfLines={1} style={{ color: "#9CB5C6", fontSize: 11, marginTop: 2 }}>{period.summary || "Forecast"}</Text></View>)}</View>
      <SourceDetails source={weather.source} />
    </Card> : <AvailabilityCard title="Weather" availability={data.availability.weather} description="Weather could not be loaded right now. Try again shortly." />}
    {airQuality ? <Card eyebrow="Air-quality model estimate" title={`US AQI ${airQuality.usAqi} · ${airQuality.category}`} accent={airQuality.usAqi <= 50 ? "#65D7B1" : airQuality.usAqi <= 100 ? "#F7BD61" : "#FF9C7C"}>
      <Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>A regional model estimate for the closest forecast grid, not a local AirNow monitoring-station observation.</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}><Metric label="PM2.5" value={airQuality.pm25 === undefined ? "—" : `${airQuality.pm25.toFixed(1)} μg/m³`} /><Metric label="PM10" value={airQuality.pm10 === undefined ? "—" : `${airQuality.pm10.toFixed(1)} μg/m³`} /><Metric label="Ozone" value={airQuality.ozone === undefined ? "—" : `${airQuality.ozone.toFixed(1)} μg/m³`} /><Metric label="Model time" value={airQuality.observedAt || "—"} /></View>
      <SourceDetails source={airQuality.source} />
    </Card> : <AvailabilityCard title="Air quality" availability={data.availability.airQuality} description="Air-quality data could not be loaded for this location. Try again shortly." />}
    {demographics ? <Card eyebrow="Census demographics" title="City at a glance">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}><Metric label="Population" value={demographics.population ? numbers.format(demographics.population) : "—"} /><Metric label="Median income" value={demographics.medianHouseholdIncome ? dollars.format(demographics.medianHouseholdIncome) : "—"} /><Metric label="Median age" value={demographics.medianAge ? `${demographics.medianAge} years` : "—"} /><Metric label="Median home value" value={demographics.medianHomeValue ? dollars.format(demographics.medianHomeValue) : "—"} /></View>
      <SourceDetails source={demographics.source} />
    </Card> : <AvailabilityCard title="Demographics" availability={data.availability.demographics} description="Census place data is not currently mapped for this city." />}
  </>;
}

function Safety({ data }: { data: CityOverviewData }) {
  const crimeSource = data.enhanced?.crimeSource;
  const crimeTrend = data.crimeTrend;
  return <>
    <Card eyebrow={data.alerts.length ? "Official weather alerts" : "No active weather alerts"} title={data.alerts.length ? `${data.alerts.length} active alert${data.alerts.length === 1 ? "" : "s"}` : "No active official weather alerts"} accent={data.alerts.length ? "#FFBA65" : "#65D7B1"}>
      {data.alerts.length ? data.alerts.map((alert) => <Pressable key={alert.id} accessibilityRole={alert.url ? "link" : undefined} accessibilityLabel={`${alert.event}${alert.severity ? `, ${alert.severity}` : ""}${alert.url ? ", open official details" : ""}`} onPress={() => openUrl(alert.url)} disabled={!alert.url} style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(186,230,253,0.14)" }}><Text style={{ color: "#FFF", fontWeight: "900" }}>{alert.event}{alert.severity ? ` · ${alert.severity}` : ""}</Text><Text style={{ color: "#BED1DE", marginTop: 4, lineHeight: 19 }}>{alert.headline || "View official details."}</Text>{alert.affectedAreas ? <Text style={{ color: "#9EB9C9", marginTop: 4, fontSize: 11 }}>Area: {alert.affectedAreas}</Text> : null}<Text style={{ color: "#8EA9BC", marginTop: 4, fontSize: 11 }}>Expires: {time(alert.expires)}</Text></Pressable>) : <Text style={{ color: "#BED1DE", marginTop: 8, lineHeight: 21 }}>This reflects active National Weather Service alerts for the selected point; it does not cover every local emergency source.</Text>}
    </Card>
    {crimeTrend ? <Card eyebrow={crimeTrend.source.status.status === "healthy" ? "Official police open data" : "Reporting delay"} title="Reported incidents across matched periods" accent={crimeTrend.source.status.status === "healthy" ? "#65D7B1" : "#F7BD61"}>
      <Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>Citywide police-jurisdiction reports, not convictions, a crime rate, or a safety score. Both periods are 28 days long.</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}><Metric label="Latest 28 days" value={numbers.format(crimeTrend.currentCount)} /><Metric label="Previous 28 days" value={numbers.format(crimeTrend.priorCount)} /><Metric label="Change" value={crimeTrend.percentageChange === undefined ? "—" : `${crimeTrend.percentageChange >= 0 ? "+" : ""}${crimeTrend.percentageChange.toFixed(1)}%`} /><Metric label="Reports through" value={time(crimeTrend.reportingThrough)} /></View>
      <SourceDetails source={crimeTrend.source} />
    </Card> : crimeSource ? <OfficialLinkCard link={crimeSource} eyebrow="Official crime dashboard" /> : <AvailabilityCard title="Crime trends" availability={data.availability.crime} description="Limited official data available. CityPeak does not infer crime rates, mix reporting periods, or label a city safe or unsafe." />}
    {crimeTrend || crimeSource ? <Card eyebrow="About crime data" title="Clear, careful comparisons"><Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>Reported incidents are not convictions. CityPeak does not label a city safe or unsafe, mix incompatible reporting periods, or calculate crime rates without verified population and reporting coverage.</Text></Card> : null}
  </>;
}

function Issues({ data, onOpenCommunity }: { data: CityOverviewData; onOpenCommunity: () => void }) {
  const source = data.enhanced?.serviceRequestSource;
  const summary = data.serviceRequests;
  return <>
    {summary ? <Card eyebrow="Official 311 aggregate" title={`${numbers.format(summary.totalCount)} requests in the last 7 days`} accent="#65D7B1">
      <Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>Counts are grouped by the city data portal. CityPeak does not load or display individual reports, addresses, photos, or reporter details.</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}><Metric label="Open / acknowledged" value={numbers.format(summary.openCount)} /><Metric label="In progress" value={numbers.format(summary.inProgressCount)} /><Metric label="Closed" value={numbers.format(summary.closedCount)} /></View>
      {summary.topCategories.length ? <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: "rgba(186,230,253,0.16)", paddingTop: 10 }}><Text style={{ color: "#91AFC1", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 }}>Most-reported categories</Text>{summary.topCategories.map((category) => <View key={category.label} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingTop: 8 }}><Text style={{ color: "#E6F3F8", flex: 1, fontWeight: "700" }} numberOfLines={1}>{category.label}</Text><Text style={{ color: "#AEEAFF", fontWeight: "900" }}>{numbers.format(category.count)}</Text></View>)}</View> : null}
      <SourceDetails source={summary.source} />
    </Card> : source ? <OfficialLinkCard link={source} eyebrow="Official service" /> : <AvailabilityCard title="Service requests" availability={data.availability.issues} description="Official service-request data is not currently available in CityPeak for this city." />}
    {summary && source ? <OfficialLinkCard link={source} eyebrow="Report an issue" /> : null}
    <Card eyebrow="CityPeak community reports" title="Share a local issue"><Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>Community posts are never presented as city records. Use them to discuss an issue, then report non-emergency problems through the official service when one is available.</Text><Pressable onPress={onOpenCommunity} style={{ marginTop: 15, backgroundColor: "rgba(198,180,255,0.16)", borderWidth: 1, borderColor: "rgba(198,180,255,0.38)", borderRadius: 999, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 10 }}><Text style={{ color: "#DECFFF", fontWeight: "900" }}>Open community reports</Text></Pressable></Card>
  </>;
}

function Government({ data }: { data: CityOverviewData }) {
  const officials = data.enhanced?.officials || [];
  const directoryLinks = (data.enhanced?.officialLinks || []).filter((link) => link.classification === "official_directory");
  const mayor = officials.find((official) => official.normalizedRole === "mayor");
  const council = officials.filter((official) => official.normalizedRole === "city_council");
  const leaders = officials.filter((official) => official.normalizedRole !== "mayor" && official.normalizedRole !== "city_council");
  if (!officials.length) return <>
    {directoryLinks.length ? directoryLinks.map((link) => <OfficialLinkCard key={link.id} link={link} eyebrow="Official government directory" />) : <AvailabilityCard title="Government directory" availability={data.availability.government} description="Verified records are not currently available for this city. CityPeak only displays officials after manual verification against an official government source." />}
    {data.enhanced?.meetingSource ? <OfficialLinkCard link={data.enhanced.meetingSource} eyebrow="Official meetings" /> : null}
  </>;
  return <>
    {mayor ? <Card eyebrow="Verified official" title={mayor.name} accent="#65D7B1"><Text style={{ color: "#E9F8FB", fontWeight: "800", marginTop: 7 }}>{mayor.displayedTitle}</Text><Text style={{ color: "#9EB9C9", marginTop: 10, fontSize: 12 }}>Verified against an official city source · {time(mayor.lastVerifiedAt)}</Text><Pressable accessibilityRole="link" onPress={() => openUrl(mayor.officialProfileUrl || mayor.sourceUrl)} style={{ marginTop: 14 }}><Text style={{ color: "#77D8F4", fontWeight: "900" }}>Official profile and contact ↗</Text></Pressable></Card> : null}
    {council.length ? <Card eyebrow="Verified directory" title="City Council" accent="#65D7B1"><View style={{ marginTop: 10, gap: 0 }}>{council.map((official) => <Pressable key={official.id} accessibilityRole="link" accessibilityLabel={`Open official profile for ${official.name}`} onPress={() => openUrl(official.officialProfileUrl || official.sourceUrl)} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "rgba(186,230,253,0.12)" }}><View style={{ flex: 1 }}><Text style={{ color: "#F6FCFF", fontWeight: "800" }}>{official.name}</Text><Text style={{ color: "#9EB9C9", marginTop: 2, fontSize: 12 }}>{official.district || official.displayedTitle}</Text></View><Text style={{ color: "#77D8F4", fontWeight: "900" }}>View ↗</Text></Pressable>)}</View></Card> : null}
    {leaders.length ? <Card eyebrow="Verified directory" title="City leadership" accent="#65D7B1">{leaders.map((official) => <Pressable key={official.id} accessibilityRole="link" onPress={() => openUrl(official.officialProfileUrl)} style={{ paddingVertical: 9 }}><Text style={{ color: "#F6FCFF", fontWeight: "800" }}>{official.name}</Text><Text style={{ color: "#9EB9C9", marginTop: 2, fontSize: 12 }}>{official.displayedTitle}</Text></Pressable>)}</Card> : null}
    {directoryLinks.map((link) => <OfficialLinkCard key={link.id} link={link} eyebrow="Official government directory" />)}
    {data.enhanced?.meetingSource ? <OfficialLinkCard link={data.enhanced.meetingSource} eyebrow="Official meetings" /> : null}
  </>;
}

function News({ data, onOpenCommunity }: { data: CityOverviewData; onOpenCommunity: () => void }) {
  const links = data.enhanced?.officialLinks || [];
  return <>
    {links.length ? <Card eyebrow="Official updates" title="Follow trusted sources"><Text style={{ color: "#AFC6D5", marginTop: 8, lineHeight: 20 }}>These open the publishing agency directly. CityPeak does not label local news or community posts as official updates.</Text><View style={{ marginTop: 10 }}>{links.map((link) => <Pressable key={link.id} accessibilityRole="link" onPress={() => openUrl(link.url)} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(186,230,253,0.12)" }}><Text style={{ color: "#F6FCFF", fontWeight: "800" }}>{link.label} ↗</Text><Text style={{ color: "#9EB9C9", marginTop: 3, fontSize: 12 }}>{link.description}</Text></Pressable>)}</View></Card> : <AvailabilityCard title="Official updates" availability={data.availability.news} description="Official feeds have not been configured for this city yet." />}
    <Card eyebrow="Local conversation" title="Community reports"><Text style={{ color: "#C5D5E2", lineHeight: 21, marginTop: 8 }}>Community reports follow CityPeak’s existing moderation rules and are visually separate from government sources.</Text><Pressable onPress={onOpenCommunity} style={{ marginTop: 15, alignSelf: "flex-start" }}><Text style={{ color: "#C6B4FF", fontWeight: "900" }}>Open community reports →</Text></Pressable></Card>
  </>;
}

export function CityOverviewScreen({ cityId, selectedArea, communityPostCount, onOpenCommunity, onChangeCity }: Props) {
  const [section, setSection] = useState<CitySection>("Overview");
  const [data, setData] = useState<CityOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const load = (force = false) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(false);
    loadCityOverview(cityId, force)
      .then((nextData) => { if (requestId.current === currentRequest) setData(nextData); })
      .catch(() => { if (requestId.current === currentRequest) setError(true); })
      .finally(() => { if (requestId.current === currentRequest) setLoading(false); });
  };
  useEffect(() => {
    load();
    return () => { requestId.current += 1; };
  }, [cityId]);
  const cityName = data?.city.name || selectedArea;
  const content = useMemo(() => {
    if (!data) return null;
    if (section === "Overview") return <Overview data={data} />;
    if (section === "Safety") return <Safety data={data} />;
    if (section === "Issues") return <Issues data={data} onOpenCommunity={onOpenCommunity} />;
    if (section === "Government") return <Government data={data} />;
    if (section === "News") return <News data={data} onOpenCommunity={onOpenCommunity} />;
    return <Card eyebrow="CityPeak community" title={`${communityPostCount} local post${communityPostCount === 1 ? "" : "s"}`} accent="#C6B4FF"><Text style={{ color: "#C5D5E2", marginTop: 8, lineHeight: 21 }}>Community posts remain separate from official information. Open the local feed to read, post, and discuss what matters in {cityName}.</Text><Pressable onPress={onOpenCommunity} style={{ marginTop: 15, backgroundColor: "#77D8F4", borderRadius: 999, alignSelf: "flex-start", paddingHorizontal: 15, paddingVertical: 10 }}><Text style={{ color: "#092236", fontWeight: "900" }}>Open community feed</Text></Pressable></Card>;
  }, [data, section, communityPostCount, cityName, onOpenCommunity]);
  return <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 128 }}>
    <View style={{ paddingTop: 8, paddingBottom: 18 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}><View style={{ flex: 1 }}><Text style={{ color: "#77D8F4", fontSize: 11, fontWeight: "900", letterSpacing: 1.3 }}>CITY INFORMATION</Text><Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900", letterSpacing: -0.8, marginTop: 4 }}>{cityName}, {data?.city.stateCode || ""}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Change city" onPress={onChangeCity} style={{ backgroundColor: "rgba(119,216,244,0.13)", borderRadius: 999, borderWidth: 1, borderColor: "rgba(119,216,244,0.32)", paddingHorizontal: 12, paddingVertical: 9 }}><Text style={{ color: "#AEEAFF", fontSize: 12, fontWeight: "900" }}>Change</Text></Pressable></View><Text style={{ color: "#AFC6D5", marginTop: 7, lineHeight: 20 }}>Official context and local conversation, clearly separated.</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>{sections.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: section === item }} onPress={() => setSection(item)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: section === item ? "#77D8F4" : "rgba(15,38,59,0.78)", borderWidth: 1, borderColor: section === item ? "#77D8F4" : "rgba(163,217,237,0.20)" }}><Text style={{ color: section === item ? "#092236" : "#D8ECF5", fontWeight: "900", fontSize: 13 }}>{item}</Text></Pressable>)}</ScrollView>
    {loading ? <View accessibilityLabel="Loading city information" accessibilityLiveRegion="polite" style={{ gap: 13 }}>{[1, 2, 3].map((item) => <View key={item} style={{ height: item === 1 ? 160 : 120, borderRadius: 22, backgroundColor: "rgba(93,137,162,0.16)", justifyContent: "center" }}><ActivityIndicator color="#77D8F4" /></View>)}</View> : error || !data ? <AvailabilityCard title="City information is unavailable" availability="unavailable" description="We could not reach the public data sources. Your community feed is unaffected." actionLabel="Try again" onAction={() => load(true)} /> : <>{data.cache?.isStale ? <View accessibilityLiveRegion="polite" style={{ borderRadius: 16, padding: 12, marginBottom: 13, backgroundColor: "rgba(245,158,11,0.12)", borderWidth: 1, borderColor: "rgba(245,158,11,0.35)" }}><Text style={{ color: "#F7BD61", fontWeight: "900" }}>Showing saved city information</Text><Text style={{ color: "#D7E3EC", marginTop: 4, lineHeight: 19 }}>Some live sources could not be refreshed. Check each card’s freshness details before relying on it.</Text></View> : null}{content}<Pressable accessibilityRole="button" onPress={() => load(true)} style={{ alignSelf: "center", padding: 12 }}><Text style={{ color: "#8FCDE1", fontWeight: "800" }}>Refresh city information</Text></Pressable></>}
  </ScrollView>;
}
