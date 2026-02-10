export enum ImportDomain {
  HackerNews = 'HackerNews'
}

export enum Ordering {
  Asc = 'ASC',
  AscNullsFirst = 'ASC_NULLS_FIRST',
  AscNullsLast = 'ASC_NULLS_LAST',
  Desc = 'DESC',
  DescNullsFirst = 'DESC_NULLS_FIRST',
  DescNullsLast = 'DESC_NULLS_LAST'
}

export enum PostCategory {
  Knowledge = 'Knowledge',
  News = 'News',
  Opinion = 'Opinion',
  Question = 'Question'
}

export enum PostTypeEnum {
  Comment = 'Comment',
  Post = 'Post',
  Review = 'Review',
  Tool = 'Tool'
}

export enum ToolType {
  App = 'App',
  Material = 'Material',
  Other = 'Other',
  Product = 'Product',
  Program = 'Program',
  SaaS = 'SaaS'
}

export enum UsageStatus {
  Interested = 'INTERESTED',
  NotInterested = 'NOT_INTERESTED',
  Used = 'USED',
  Using = 'USING',
  WantToUse = 'WANT_TO_USE'
}

export enum UserListName {
  Library = 'library',
  PostsCollapsed = 'posts_collapsed',
  ProfilesBookmarked = 'profiles_bookmarked',
  ReadLater = 'read_later'
}

export enum Visibility {
  Connections = 'CONNECTIONS',
  Internal = 'INTERNAL',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Subscribers = 'SUBSCRIBERS',
  SubscribersPaid = 'SUBSCRIBERS_PAID',
  UsersSelected = 'USERS_SELECTED'
}
