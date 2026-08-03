from django import template

from neuronhub.apps.jobs.models import JobLocation


register = template.Library()


@register.filter()
def job_locations_shortened(locations: list[JobLocation]) -> str:
    """
    Eg `Remote, USA; USA; New York NY, USA` becomes `Remote, US • New York, US`.
    """
    locations_remote_first = sorted(
        _drop_redundant_for_reader_duplicated_country_locations(locations),
        key=lambda loc: (loc.type != JobLocation.LocationType.REMOTE, loc.name),
    )
    return " • ".join(_shorten_location(loc) for loc in locations_remote_first)


def _drop_redundant_for_reader_duplicated_country_locations(
    locations: list[JobLocation],
) -> list[JobLocation]:
    """
    [[airtable_sync_jobs]]._parse_location_field saves to DB not only a City, but its Country as 2 models.
    This was likely done for the Algolia's separate country filter.

    Eg instead of `USA • New York NY, USA` this outputs  `New York NY, USA`.
    """
    country_dups = set()
    for loc in locations:
        if is_might_hold_primary_country_name := loc.type != JobLocation.LocationType.COUNTRY:
            country_dups.add(loc.country)

    locations_deduped = []
    for loc in locations:
        is_not_dup = loc.country not in country_dups
        is_might_hold_primary_country_name = loc.type != JobLocation.LocationType.COUNTRY
        if is_not_dup or is_might_hold_primary_country_name:
            locations_deduped.append(loc)

    return locations_deduped


def _shorten_location(location: JobLocation) -> str:
    match location.type:
        case JobLocation.LocationType.COUNTRY:
            return _country_code_by_name.get(location.name) or location.name
        case JobLocation.LocationType.REMOTE:
            city_or_remote_name = "Remote"
        case _:
            city_or_remote_name = location.city.replace("D.C.", "DC")

    country_code = _country_code_by_name.get(location.country, location.country)
    return f"{city_or_remote_name}, {country_code}" if country_code else city_or_remote_name


_country_code_by_name = {
    "USA": "US",
    "Denmark": "DK",
    "France": "FR",
    "Germany": "DE",
    "Japan": "JP",
    "Switzerland": "CH",
    "United Kingdom": "UK",
    "Global": "",
}
