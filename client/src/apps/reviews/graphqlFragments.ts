import { graphql } from "@/gql-tada";

export const ReviewFragment = graphql(`
  fragment ToolReview on ToolReviewType @_unmask {
    id
    title
    content
    content_pros
    content_cons
    importance
    is_private
    is_review_later
    usage_status
    rating
    source
    reviewed_at
    experience_hours
    author {
      id
      username
      avatar {
        url
      }
    }
    votes {
      id
      is_vote_positive
    }
    tool {
      id
      name
      github_url
      crunchbase_url
      tags {
        id
        name
        description
        is_important
        tag_parent {
          id
          name
        }
        author {
          id
          username
        }
        votes {
          id
          author {
            id
            username
          }
          is_vote_positive
        }
      }
    }
  }
`);
