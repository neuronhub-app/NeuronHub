### v0.3.0.0

- Sharing: content, highlights, library, upvotes, ...
- Notifications
- User.aliases
- User.avatar
- Security review
	- extra tests for `filter_posts_by_user`
	- drop .history fields? good for debug, bad for privacy

### v0.3.1.0

- Recurring exports
- OAuth Apple/Google

### TBD

- [refactor-pending](/docs/refactor-pending.md)
- Post.tags voting on list pages
- field `Review.review_experience`
- field `Vote.is_changed_my_mind`
- LLM moderation
- field `Tag.is_show_parent_name`
- expire Posts
- `Post.alternatives` votes & comments
- `Post.Type.Quote`
	- show "Quotes" under "Posts" in left menu, default is "All"
	- eg HN comments
