### v0.3.0.0

- User.aliases #54
	- User profile .avatar
- User settings for Post.content_direct and _polite Visibility
- Post.tags voting on list pages
- Recurring exports
- Security review
	- extra tests for `filter_posts_by_user`
	- drop .history fields? good for debug, bad for privacy

### v0.3.1.0

- OAuth Apple/Google

### TBD

- Add Review.review_experience field
- Add Vote.is_changed_my_mind field
- LLM moderation
- `Post.Type.Quote`
	- show "Quotes" under "Posts" in left menu, default is "All"
	- eg HN comments
- `Post.alternatives` comments
- `Tag.is_show_parent_name` field
- "expire" content
- Post.alternatives votes
