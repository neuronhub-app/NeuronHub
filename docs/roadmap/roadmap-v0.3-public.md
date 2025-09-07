### v0.3.0.0

- [!!] Meilisearch fuzzy match
- [!!] User.aliases
    - [#54](/.claude/issues/not-started/54-user-aliases.md)
- User profile
	- .avatar
	- detail view
- PostCard .tags voting
- Post styles, eg split as `content` -> `content_polite` + `content_direct`
	- styles visibility settings
- [!!] Meilisearch tags facets
- `Post.alternatives` votes
- [!] import-export
- [!!] Security review
	- filter_posts_by_user.py tests
	- drop .history fields? good for debug, bad for privacy

### v0.3.1.0

- OAuth Apple/Google

### TBD

- notifications
- `review.review_experience` field
- `vote.is_changed_my_mind` field
- LLM flagging: posts, tags
- `Post.Type.Quote`
	- show "Quotes" under "Posts" in left menu, default is "All"
	- eg HN comments
- `Post.alternatives` comments
- `tag.is_show_parent_name` field
- refactor `client/` file names structure #59. Also rename `server` to `backend`, and `client` to `frontend`.
