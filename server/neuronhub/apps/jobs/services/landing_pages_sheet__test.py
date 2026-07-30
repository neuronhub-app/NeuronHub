from neuronhub.apps.jobs.services.landing_pages_sheet import build_landing_page_specs


class TestLandingPageSpecs:
    def test_page_set_is_exactly_56(self):
        slugs = [spec.slug for spec in build_landing_page_specs()]

        assert len(slugs) == 56, f"expected 56 rows, got {len(slugs)}"
        assert len(set(slugs)) == len(slugs), "slugs are unique"

    def test_every_page_has_a_filter(self):
        unfiltered = [
            spec.slug
            for spec in build_landing_page_specs()
            if not any(spec.names_by_tag_category.values())
            and not spec.location_names
            and not spec.org_type
        ]
        assert unfiltered == [], "a filter-less page would list every job"
