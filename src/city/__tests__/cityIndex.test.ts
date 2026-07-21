import { cityForArea, findCityIndexItem } from "../../data/cityIndex";

describe("city identity lookup", () => {
  it("keeps same-name cities distinct when a state is supplied", () => {
    const cities = [
      { id: "us-or-springfield", city: "Springfield", state: "OR" },
      { id: "us-il-springfield", city: "Springfield", state: "IL" },
    ];
    expect(findCityIndexItem(cities, "Springfield", "IL")?.id).toBe("us-il-springfield");
    expect(findCityIndexItem(cities, "Springfield", "OR")?.id).toBe("us-or-springfield");
  });

  it("does not fabricate a stable record for an unsupported city", () => {
    expect(cityForArea("Not A City, CA")).toBeUndefined();
    expect(cityForArea("Long Beach, CA")?.id).toBe("us-ca-long-beach");
    expect(cityForArea("Hollywood")?.placeFips).toBeUndefined();
  });
});
