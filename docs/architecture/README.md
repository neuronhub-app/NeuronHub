## Tech Stack

- Server: Django v5.2, Strawberry GraphQL, PostgreSQL, pytest, uv, mypy
- Client: React Router v7, @chakra-ui v3, react-hook-form, Zod, Valtio, Apollo, gql-tada, pnpm, Biome
- Search: Algolia
- DevOps: Mise, GitHub CI, Docker, Sentry

## Overview

NeuronHub (NHA, Neuron) is privacy-first directory platform for: news, tools, products, profiles, jobs, etc. Users limit the visibility of their `models.Post` (Posts, Reviews, Comments) by selected User groups (akin Google Circles).

## Core Django Models

```mermaid

classDiagram
    `Post.Type` -- Post: type
    Post ..|> PostTool: type = Tool
    Post ..|> PostReview: type = Review
    Post ..|> PostComment: type = Comment
    Post --> PostComment
    PostReview --> PostComment

    namespace posts {
        class `Post.Type` {
            <<enumeration>>
            Post
            Tool
            Review
            Comment
        }

        class Post {
            id
            type: Post.Type
            parent?: Post
            author: User
            tags: M2M~PostTag~
        %% CharFields
            title: str
            source: str
            content_polite
            content_direct
            content_rant
            content_private
        %% Sharable fields
            visibility = Visibility.INTERNAL
            visible_to_users: M2M~User~
            visible_to_groups: M2M~UserConnectionGroup~
            recommended_to_users: M2M~User~
            recommended_to_groups: M2M~UserConnectionGroup~
        }

        class PostTool {
            <<projection>>
            parent: null
            tool_type = ToolType.Program
            company: ToolCompany
            github_url
        }

        class PostReview {
            <<projection>>
            parent: Post | PostTool
            review_usage_status: UsageStatus
            review_rating: int
            review_importance: int
            review_tags: M2M~PostTag~
            is_review_later
        }

        class PostComment {
            <<projection>>
            parent_root: Post
            parent: Post | PostComment
            author: User
            content_polite: str
        }

        class PostVote {
            post: Post
            author: User
            is_vote_positive
            is_changed_my_mind
        }

        class PostTag {
            tag_parent: PostTag
            name: str
            is_review_tag
            is_important
        }

        class PostTagVote {
            post: Post
            tag: PostTag
            author: User
            comment: str
            is_vote_positive
            is_changed_my_mind
        }
    }

    PostTag --> PostTagVote: votes
    Post --> PostTag: tags
    PostReview --> PostTag: review_tags
    Post --> PostVote: votes
    User o-- Post: author
    class User {
        username
        password
        aliases: M2M~User~
        areas: M2M~Area~
    }

    Post -- PostSource

    namespace importer {
        class PostSource {
            user_source: importer.UserSource
            id_external: int
            domain: ImportDomain.HackerNews
            rank: int
            url: str
            url_of_source: str
        }
    }

    User o-- Profile : user (O2O)
    Profile --> PostTag : skills, interests
    Profile --> ProfileMatch
    User o-- ProfileMatch : user (FK)

    namespace profiles {
        class Profile {
            first_name, last_name

            biography, seeks, offers

            company: str
            job_title: str

            career_stage: Enum

            skills: M2M~PostTag~
            interests: M2M~PostTag~

            profile_for_llm_md: str?

            visibility = Visibility.PRIVATE
            visible_to_users: M2M~User~
        }

        class ProfileMatch {
            profile: FK~Profile~
            match_score_by_llm: int
            match_reason_by_llm: str

			%% review by User
            match_score: int
            match_review: str
        }
    }

    Job --> PostTag : tags (M2M)
    JobAlert --> PostTag : tags (M2M)
    JobAlert --> Job : jobs_clicked (M2M)
    JobAlertLog --> JobAlert : job_alert (FK)
    JobAlertLog --> Job : job (FK)

    namespace jobs {
        class Job {
            title: str
            org: FK~Org~
            author?: FK~User~
            is_remote: bool?
            salary_min: int?
            posted_at, closes_at: datetime?
            tags_skill, tags_area: M2M~PostTag~
            visible_to_users: M2M~User~
            visible_to_groups: M2M~UserConnectionGroup~
            bookmarked_by_users: M2M~User~
        }

        class JobAlert {
            id_ext: UUID
            email: str
            tags: M2M~PostTag~
            is_orgs_highlighted: bool?
            is_remote: bool?
            salary_min: int?
            is_active: bool
            tz: TimeZoneField?
            jobs_clicked: M2M~Job~
        }

        class JobAlertLog {
            job_alert: FK~JobAlert~
            job: FK~Job~
            email_hash: str
            sent_at: datetime
        }
    }
```

## Specific docs

You must read each top-level doc before its children.

- [./backend](./backend/README.md)
    - [Profiles app](./backend/profiles.md)
- [./frontend](./frontend/README.md)
    - [How to structure a React Component](./frontend/React-component-structure.md)
    - [How to use GraphQL](./frontend/GraphQL.md)
    - [How to use Chakra UI](frontend/Chakra-UI.md)
- [./tests](./tests.md)
    - [How to use pytest](./backend/pytest.md)
    - [How to use Playwright](./frontend/Playwright.md)
- [Algolia integration](./Algolia.md) - used on all FE list pages (posts, jobs, profiles) for InstantSearch, Facets, and Pagination.
- [LLM spec logs](/docs/src/pages/development/reference/LLM-spec-logs/) - historical ticket-prompts LLM received and their Git history - ie it's complimentary to the Git log. Named as `{id}-{type}-{name}.mdx` - `#{id}` is from the Git logs.
- [./frontend/docs-site](./frontend/docs-site.md) - the `docs/` site (docs.neuronhub.app)
