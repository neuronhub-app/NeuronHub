from neuronhub.apps.profiles.services.csv_optimize_tokens import csv_normalize_for_db
from neuronhub.apps.profiles.services.csv_optimize_tokens import csv_optimize_tokens
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CsvOptimizeTokensTest(NeuronTestCase):
    def test_replacements_apply_slash_variations(self):
        assert csv_optimize_tokens("Software development/Software engineering") == "SWE"
        assert csv_optimize_tokens("Software development / Software engineering") == "SWE"

    def test_replacements_apply_case_insensitive(self):
        assert csv_optimize_tokens("AI SAFETY") == "AIS"

    def test_replacements_apply_empty(self):
        assert csv_optimize_tokens("") == ""

    def test_new_replacements(self):
        assert csv_optimize_tokens("Global health & development") == "Global health"
        assert csv_optimize_tokens("Pursuing a graduate degree (e.g. Masters)") == "Grad student"


class CsvNormalizeForDbTest(NeuronTestCase):
    def test_keep_items_applied(self):
        assert csv_normalize_for_db("United States") == "US"
        assert csv_normalize_for_db("United Kingdom") == "UK"
        assert csv_normalize_for_db("Working (6–15 years of experience)") == "Working 6-15y"

    def test_db_specific_values_differ_from_llm(self):
        # LLM: "SWE", DB: "Software Engineering"
        assert (
            csv_normalize_for_db("Software development/Software engineering")
            == "Software Engineering"
        )
        assert csv_optimize_tokens("Software development/Software engineering") == "SWE"

        # LLM: "PM", DB: "Project management"
        assert (
            csv_normalize_for_db("Project management/Program management") == "Project management"
        )
        assert csv_optimize_tokens("Project management/Program management") == "PM"

        # LLM: "Global coordination", DB: "Global coordination & peace"
        assert (
            csv_normalize_for_db("Global coordination & peace-building")
            == "Global coordination & peace"
        )
        assert (
            csv_optimize_tokens("Global coordination & peace-building") == "Global coordination"
        )

        # LLM: "Global health", DB: "Global health & dev"
        assert csv_normalize_for_db("Global health & development") == "Global health & dev"
        assert csv_optimize_tokens("Global health & development") == "Global health"

    def test_empty(self):
        assert csv_normalize_for_db("") == ""
