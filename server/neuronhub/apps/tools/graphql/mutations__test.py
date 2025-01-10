from neuronhub.apps.tests.test_cases import NeuronTestCase


class ToolMutationTest(NeuronTestCase):
    def test_mutation(self):
        payload = """
        {
          "rating": 75,
          "reviewed_at": "2025-01-08",
          "type": "Program",
          "usage_status": "interested",
          "visibility": "private",
          "is_review_later": "on",
          "tool": {
            "title": "program name",
            "domain": "domain.com",
            "github_url": "github.com/project/test",
            "crunchbase_url": "",
            "description": "Description of the program.",
            "alternatives": [
              {
                "id": "2",
                "name": "Gitea",
                "__typename": "ToolType"
              }
            ]
          },
          "title": "it's fine",
          "content": "really",
          "source": "hn",
          "content_private": "just a note",
          "tags": [
            {
              "id": "1",
              "name": "TypeScript",
              "__typename": "ToolTagType",
              "is_vote_positive": false
            },
            {
              "id": "Area / Psychology",
              "name": "Area / Psychology",
              "is_vote_positive": true,
              "comment": "test comment"
            }
          ],
          "recommend_to": [
            {
              "id": "3",
              "label": "Alex",
              "user": {
                "id": "3",
                "name": "Alex",
                "email": "alex@gmail.com",
                "__typename": "UserType"
              },
              "group": null,
              "message": null
            },
          ]
        }
        """
