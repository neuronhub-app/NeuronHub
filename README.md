NeuronHub is privacy-first directory for: news, tools, products, profiles, jobs, etc. Users limit the visibility of their `models.Post` (Posts, Reviews, Comments) by selected User groups (akin Google Circles).

<details>
<summary>UML diagram</summary>

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
```

</details>

## Tech Stack

- Server: Django v5.2, Strawberry GraphQL, PostgreSQL, pytest, uv, mypy
- Client: React Router v7, @chakra-ui, react-hook-form, Zod, Valtio, Apollo, gql-tada, Bun, Biome
- Search: Algolia
- DevOps: Mise, Docker Compose, GitHub CI

### Documentation

See [docs/architecture/README.md](/docs/architecture/README.md).


Development Setup
--------------------------------

### Linux & Docker

1. Install <a href="https://mise.jdx.dev/getting-started" rel="nofollow">Mise</a>, eg `curl https://mise.run | sh`
2. Install <a href="https://nushell.sh" rel="nofollow">Nushell</a>, eg `brew install nushell`
3. `git clone {url}`
4. `cd neuronhub`
5. ```shell
	mise trust
	mise install
	mise run install-deps
	mise run dev:db:setup # FYI slow due to db_stubs_repopulate 
	mise run dev:db:e2e:setup 
	mise run dev
	```

dev URLs:
- http://localhost:8000/admin
    - login/pass: admin/admin
- http://localhost:3000

The [mise.toml](/mise.toml) has all tasks and scripts.

### Algolia

FE will work only partially without an Algolia app.

- <a href="https://dashboard.algolia.com/users/sign_in" rel="nofollow">Create a free account</a>
- `cp mise.local.toml.example mise.local.toml`
- In this file populate App ID, API key, and Search API key
- `mise run django:algolia-reindex`

### MacOS

To run without Docker, after `git clone`:
- `cp devops/env-examples/mise.macos.toml.example mise.local.toml`

The rest is same as for Linux.

Documentation
--------------------------------

See the [docs/ dir](/docs/).
