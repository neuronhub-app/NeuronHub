/**
 * Separate from JobDraftsReview.tsx for e2e import wo Node ESM evaluating `diff2html/lib/types`
 * (its `exports` map omits the `.js`-less subpath that Vite tolerates).
 */
import { graphql } from "@/gql-tada";

export const JobDraftsQuery = graphql.persisted(
  "JobVersionsPending",
  graphql(`
    query JobVersionsPending {
      job_versions_pending {
        id
        draft_markdown
        published_markdown
        draft {
          id
          title
          is_pending_removal
          url_external
          org {
            id
            name
            logo {
              url
            }
          }
        }
        published {
          id
          title
        }
      }
    }
  `),
);

export const JobDraftsApproveMutation = graphql.persisted(
  "JobVersionsApprove",
  graphql(`
    mutation JobVersionsApprove($draft_ids: [Int!]!) {
      job_versions_approve(draft_ids: $draft_ids)
    }
  `),
);
