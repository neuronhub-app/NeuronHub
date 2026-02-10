from neuronhub.apps.profiles.services.csv_optimize_tokens import csv_optimize_tokens
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CsvOptimizeTokensTest(NeuronTestCase):
    def test_replacements_apply_slash_variations(self):
        assert csv_optimize_tokens("Software development/Software engineering") == "SWE"
        assert csv_optimize_tokens("Software development / Software engineering") == "SWE"

    def test_replacements_apply_case_insensitive(self):
        assert csv_optimize_tokens("EFFECTIVE ALTRUISM") == "EA"
        assert csv_optimize_tokens("AI SAFETY") == "AIS"

    def test_replacements_apply_empty(self):
        assert csv_optimize_tokens("") == ""

    def test_replacements_apply_complex(self):
        text = "Working at The Centre for Effective Altruism in San Francisco, United States"
        result = csv_optimize_tokens(text)
        assert "CEA" in result
        assert "SF" in result
        assert "US" in result

    def test_new_replacements(self):
        assert csv_optimize_tokens("Global health & development") == "Global health"
        assert csv_optimize_tokens("Pursuing a graduate degree (e.g. Masters)") == "Grad student"
