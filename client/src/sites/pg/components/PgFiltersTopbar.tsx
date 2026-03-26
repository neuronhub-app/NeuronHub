import { Flex, Grid, Stack, Switch } from "@chakra-ui/react";
import { useRange, useRefinementList, useToggleRefinement } from "react-instantsearch";
import { proxy, useSnapshot } from "valtio";
import { PgFacetSalary, salaryFilterState } from "@/sites/pg/components/PgFacetSalary";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import type { UseRefinementListProps } from "react-instantsearch";
import { PgFacetAttribute } from "@/sites/pg/components/PgFacetAttribute";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";
import { LuMapPin } from "react-icons/lu";

const sortAlpha = ["name:asc", "count:desc"] satisfies UseRefinementListProps["sortBy"];

const roleTypeOrder = [
  "Full-Time",
  "Part-Time (50–80% FTE)",
  "Part-Time (<50% FTE)",
  "Internship",
  "Fellowship",
  "Volunteer",
  "Funding",
  "Training",
  "Graduate Program",
  "Expression of Interest",
];

const educationOrder = ["Undergraduate Degree or Less", "Master's Degree", "Doctoral Degree"];

function sortByCustomOrder<T extends { label: string }>(items: T[], order: string[]): T[] {
  return items.toSorted((a, b) => {
    const indexA = order.indexOf(a.label);
    const indexB = order.indexOf(b.label);
    if (indexA === -1 && indexB === -1) {
      return 0;
    }
    if (indexA === -1) {
      return 1;
    }
    if (indexB === -1) {
      return -1;
    }
    return indexA - indexB;
  });
}

const transformRoleType: UseRefinementListProps["transformItems"] = items =>
  sortByCustomOrder(items, roleTypeOrder);

const transformEducation: UseRefinementListProps["transformItems"] = items =>
  sortByCustomOrder(items, educationOrder);

export const otherFiltersState = proxy({
  excludeCareerCapital: false,
  excludeProfitForGood: false,
});

export function resetOtherFilters() {
  otherFiltersState.excludeCareerCapital = false;
  otherFiltersState.excludeProfitForGood = false;
}

type FacetOrder = { base?: number; lg?: number };

export function PgFiltersTopbar() {
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
      columnGap="gap.md"
      rowGap={{ base: "3.5", md: "2" }}
    >
      <CauseAreaFacet order={{ base: 1, lg: 1 }} />
      <RoleTypeFacet order={{ base: 3, lg: 2 }} />
      <ExperienceFacet order={{ base: 7, lg: 3 }} />
      <SalaryFacet order={{ base: 9, lg: 4 }} />
      <SkillSetFacet order={{ base: 2, lg: 5 }} />
      <RemoteFacet order={{ base: 4, lg: 6 }} />
      <CountryFacet order={{ base: 5, lg: 7 }} />
      <CityFacet order={{ base: 6, lg: 8 }} />
      <EducationFacet order={{ base: 8, lg: 9 }} />
      <OtherFiltersFacet order={{ base: 10 }} />
    </Grid>
  );
}

function CauseAreaFacet(props: { order: FacetOrder }) {
  const causeArea = useRefinementList({ attribute: "tags_area.name" });
  return (
    <PgFacetPopover label="Cause Area" disabled={!causeArea.canRefine} order={props.order}>
      <PgFacetAttribute attribute="tags_area.name" label="Cause Area" sortBy={sortAlpha} />
    </PgFacetPopover>
  );
}

function RoleTypeFacet(props: { order: FacetOrder }) {
  const roleType = useRefinementList({ attribute: "tags_workload.name" });
  return (
    <PgFacetPopover label="Role Type" disabled={!roleType.canRefine} order={props.order}>
      <PgFacetAttribute
        attribute="tags_workload.name"
        label="Role Type"
        transformItems={transformRoleType}
      />
    </PgFacetPopover>
  );
}

function CountryFacet(props: { order: FacetOrder }) {
  return (
    <PgFacetPopover label="Country" order={props.order} icon={<LuMapPin />}>
      <PgFacetAttribute
        attribute="locations_facet"
        label="Country"
        isSearchEnabled
        operator="or"
        allowedValues={locationCountryNames}
      />
    </PgFacetPopover>
  );
}

function ExperienceFacet(props: { order: FacetOrder }) {
  const experience = useRefinementList({ attribute: "tags_experience.name" });
  return (
    <PgFacetPopover label="Experience" disabled={!experience.canRefine} order={props.order}>
      <PgFacetAttribute attribute="tags_experience.name" label="Experience" />
    </PgFacetPopover>
  );
}

function SalaryFacet(props: { order: FacetOrder }) {
  const salary = useRange({ attribute: "salary_min" });
  return (
    <PgFacetPopover
      label="Minimum Salary"
      disabled={!salary.canRefine}
      onClose={() => {
        salaryFilterState.showInfo = false;
      }}
      contentMaxW="var(--reference-width)"
      order={props.order}
    >
      <PgFacetSalary />
    </PgFacetPopover>
  );
}

function SkillSetFacet(props: { order: FacetOrder }) {
  const skillSet = useRefinementList({ attribute: "tags_skill.name" });
  return (
    <PgFacetPopover label="Skill Set" disabled={!skillSet.canRefine} order={props.order}>
      <PgFacetAttribute
        attribute="tags_skill.name"
        label="Skill Set"
        isSearchEnabled
        sortBy={sortAlpha}
      />
    </PgFacetPopover>
  );
}

function RemoteFacet(props: { order: FacetOrder }) {
  return (
    <PgFacetPopover label="Remote" order={props.order} icon={<LuMapPin />}>
      <PgFacetAttribute
        attribute="locations_facet"
        label="Remote"
        operator="or"
        allowedValues={locationRemoteNames}
      />
    </PgFacetPopover>
  );
}

function CityFacet(props: { order: FacetOrder }) {
  return (
    <PgFacetPopover label="City" order={props.order} icon={<LuMapPin />}>
      <PgFacetAttribute
        attribute="locations_facet"
        label="City"
        isSearchEnabled
        operator="or"
        allowedValues={locationCityNames}
      />
    </PgFacetPopover>
  );
}

// todo ! feat: backend should expose full location lists (mirroring Airtable) via API
export const locationRemoteNames = [
  "Remote, Global",
  "Remote, USA",
  "Remote, UK",
  "Remote, Europe",
];

const locationCountryNames = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Bahamas",
  "Bangladesh",
  "Barbados",
  "Belgium",
  "Belize",
  "Benin",
  "Bolivia",
  "Bosnia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Côte d'Ivoire",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gaza",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Laos",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Mali",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Mongolia",
  "Morocco",
  "Mozambique",
  "Multiple Locations: Africa",
  "Multiple Locations: APAC Region",
  "Multiple Locations: Europe",
  "Multiple Locations: Latin America",
  "Myanmar",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Niger",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Rwanda",
  "Saint Lucia",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "The Gambia",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Zambia",
  "Zimbabwe",
];

const locationCityNames = [
  "Abidjan",
  "Abuja",
  "Accra",
  "Addis Ababa",
  "Allschwil",
  "Amdjarass",
  "Amman",
  "Amsterdam",
  "Andhra Pradesh",
  "Antananarivo",
  "Arlington VA",
  "Atlanta GA",
  "Atlantic City NJ",
  "Austin TX",
  "Baltimore MD",
  "Bamako",
  "Bangalore",
  "Bangkok",
  "Bangui",
  "Banjul",
  "Barcelona",
  "Basel",
  "Beijing",
  "Beirut",
  "Bengaluru",
  "Berkeley CA",
  "Berlin",
  "Bern",
  "Bethesda MD",
  "Bhopal",
  "Bilthoven",
  "Birmingham",
  "Birnin Kebbi",
  "Bitkine",
  "Bocaranga",
  "Bogotá",
  "Bonn",
  "Boston MA",
  "Boulder CO",
  "Brisbane",
  "Brisbane CA",
  "Brooklyn NY",
  "Broomfield CO",
  "Brussels",
  "Bryan TX",
  "Budapest",
  "Buenos Aires",
  "Buhumuza",
  "Bujumbura",
  "Bukavu",
  "Burunga",
  "Cairo",
  "Cambridge",
  "Cambridge MA",
  "Cape Town",
  "Cardiff",
  "Chicago IL",
  "Christchurch",
  "Coimbatore",
  "Conakry",
  "Copenhagen",
  "Cotonou",
  "Covina CA",
  "Dakar",
  "Dar es Salaam",
  "Darlington",
  "Decatur GA",
  "Delhi",
  "Dhaka",
  "Dodoma",
  "Dublin",
  "Durham NC",
  "Edinburgh",
  "Edmonton",
  "Emeryville CA",
  "Entebbe",
  "Florence",
  "Fort Lupton CO",
  "Fort-de-France",
  "Freetown",
  "Gaithersburg MD",
  "Gebze",
  "Geneva",
  "Ghent",
  "Gicumbi",
  "Gitega",
  "Grenoble",
  "Guatemala City",
  "Gujarat",
  "Gütersloh",
  "Guwahati",
  "Hamburg",
  "Hanoi",
  "Harare",
  "Haywards Heath",
  "Heidelberg",
  "Himachal Pradesh",
  "Hinxton",
  "Ho Chi Minh",
  "Houston TX",
  "Hpa-An",
  "Huehuetenango",
  "Hyderabad",
  "Islamabad",
  "Jabi",
  "Jakarta",
  "Johannesburg",
  "Juba",
  "Kabul",
  "Kadiogo",
  "Kaduna",
  "Kambia",
  "Kampala",
  "Karachi",
  "Karnataka",
  "Karongi",
  "Kathmandu",
  "Katsina",
  "Kebbi",
  "Kigali",
  "Kinshasa",
  "Kirkland WA",
  "Koch",
  "Kolkata",
  "Kyiv",
  "Lagos",
  "Lahore",
  "Lilongwe",
  "Lincoln NE",
  "Lisbon",
  "Livermore CA",
  "London",
  "Los Angeles CA",
  "Lucknow",
  "Lusaka",
  "Maharashtra",
  "Mainz",
  "Makati City",
  "Manakara",
  "Manchester",
  "Manila",
  "Maputo",
  "Maryland MD",
  "Mbale",
  "Mbarara",
  "Mekelle",
  "Melbourne",
  "Milton Park",
  "Mogadishu",
  "Moka",
  "Monguno",
  "Monrovia",
  "Monterey CA",
  "Montgomery County MD",
  "Montpellier",
  "Montreal",
  "Montserrado",
  "Mountain View CA",
  "Mumbai",
  "Munich",
  "N'Djamena",
  "Nairobi",
  "Nalanda",
  "Nashik",
  "New Delhi",
  "New Haven CT",
  "New York",
  "New York NY",
  "Ngororero",
  "Niamey",
  "Niger State",
  "Norwich",
  "Nyabihu",
  "Oakland CA",
  "Opfikon",
  "Oslo",
  "Ottawa",
  "Ouagadougou",
  "Oxford",
  "Palo Alto CA",
  "Panama City FL",
  "Paris",
  "Patna",
  "Phnom Penh",
  "Pittsburgh PA",
  "Port Sudan",
  "Port-au-Prince",
  "Prague",
  "Pretoria",
  "Princeton NJ",
  "Provence",
  "Pune",
  "Quebec",
  "Quezon City",
  "Rabat",
  "Rajasthan",
  "Ramat Gan",
  "Ranchi",
  "Remscheid",
  "Rio de Janeiro",
  "Rome",
  "Rotterdam",
  "Sacramento CA",
  "Salt Lake City UT",
  "Sambalpur",
  "San Diego CA",
  "San Francisco CA",
  "San Jose CA",
  "San Mateo CA",
  "Santa Monica CA",
  "São Paulo",
  "Seattle WA",
  "Sejong",
  "Seoul",
  "Shanghai",
  "Sheffield",
  "Silver Spring MD",
  "Singapore",
  "Sokoto",
  "Somerville MA",
  "Steyning",
  "Stockholm",
  "Stuttgart",
  "Sydney",
  "Tallinn",
  "Tel Aviv",
  "Thane",
  "Tharparkar",
  "The Hague",
  "Thiès",
  "Tokyo",
  "Toronto",
  "Tripoli",
  "Tübingen",
  "Ujjain",
  "Uppsala",
  "Utrecht",
  "Uttar Pradesh",
  "Vancouver WA",
  "Vienna",
  "Vijayawada",
  "Vilnius",
  "Visakhapatnam",
  "Warsaw",
  "Washington D.C.",
  "West Sussex",
  "Wolverhampton",
  "Yangon",
  "Yaoundé",
  "Zurich",
];

function EducationFacet(props: { order: FacetOrder }) {
  const education = useRefinementList({ attribute: "tags_education.name" });
  return (
    <PgFacetPopover label="Education" disabled={!education.canRefine} order={props.order}>
      <PgFacetAttribute attribute="tags_education.name" label="Education" />
    </PgFacetPopover>
  );
}

function OtherFiltersFacet(props: { order: FacetOrder }) {
  const highlighted = useToggleRefinement({ attribute: "org.is_highlighted", on: true });
  const snap = useSnapshot(otherFiltersState);
  return (
    <PgFacetPopover label="Other Filters" disabled={!highlighted.canRefine} order={props.order}>
      <Stack gap="gap.sm">
        <BooleanSwitch
          label="Show only roles at highlighted orgs"
          checked={highlighted.value.isRefined}
          onToggle={() => highlighted.refine(highlighted.value)}
        />
        <BooleanSwitch
          label="Exclude career capital roles"
          checked={snap.excludeCareerCapital}
          onToggle={() => {
            otherFiltersState.excludeCareerCapital = !otherFiltersState.excludeCareerCapital;
          }}
        />
        <BooleanSwitch
          label="Exclude Profit-for-Good roles"
          checked={snap.excludeProfitForGood}
          onToggle={() => {
            otherFiltersState.excludeProfitForGood = !otherFiltersState.excludeProfitForGood;
          }}
        />
      </Stack>
    </PgFacetPopover>
  );
}

function BooleanSwitch(props: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Switch.Root checked={props.checked} onCheckedChange={props.onToggle}>
      <Switch.HiddenInput />
      <Flex w="full" justify="space-between" align="center" gap="gap.md">
        <Switch.Label {...facetStyle.value}>{props.label}</Switch.Label>
        <Switch.Control bg="brand.green.subtle" _checked={{ bg: "brand.green.light" }}>
          <Switch.Thumb />
        </Switch.Control>
      </Flex>
    </Switch.Root>
  );
}
