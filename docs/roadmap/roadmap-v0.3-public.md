### v0.3.0.0

- [!!] Meilisearch fuzzy match
- [!!] User.aliases
	- [#54](/.claude/issues/not-started/54-user-aliases.md)
	- User profile .avatar
- PostCard .tags voting
- Post styles, eg split as `content` -> `content_polite` + `content_direct`
	- styles visibility settings
- [!!] Meilisearch tags facets
- `Post.alternatives` votes
- [!] recurring export
- [!!] Security review
	- extra tests for `filter_posts_by_user`
	- drop .history fields? good for debug, bad for privacy

### v0.3.1.0

- OAuth Apple/Google

### TBD

- notifications
- `review.review_experience` field
- `vote.is_changed_my_mind` field
- LLM moderation
- `Post.Type.Quote`
	- show "Quotes" under "Posts" in left menu, default is "All"
	- eg HN comments
- `Post.alternatives` comments
- `Tag.is_show_parent_name` field
- "expire" content
