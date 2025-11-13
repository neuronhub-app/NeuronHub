### v0.3.0.0

- Algolia fuzzy match
- [!!] User.aliases #54
	- User profile .avatar
	- Post.content_direct and polite Visibility settings
- Post.tags voting on list page
- Tag by `.is_important`
	- author "stars" `.is_important` in UI
    - extend by author & user votes
- Algolia tags facets
- Post.alternatives votes
- [!] recurring export
- [!!] Security review
	- extra tests for `filter_posts_by_user`
	- drop .history fields? good for debug, bad for privacy

### v0.3.1.0

- OAuth Apple/Google

### TBD

- notifications
- Add Review.review_experience field
- Add Vote.is_changed_my_mind field
- LLM moderation
- `Post.Type.Quote`
	- show "Quotes" under "Posts" in left menu, default is "All"
	- eg HN comments
- `Post.alternatives` comments
- `Tag.is_show_parent_name` field
- "expire" content
