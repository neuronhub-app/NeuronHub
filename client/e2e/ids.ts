// todo refac: gen values from keys
export namespace ids {
  export const post = {
    list: "post.list",
    vote: {
      up: "post.vote.up",
      down: "post.vote.down",
      count: "post.vote.count",
    },
    btn: {
      readingList: "post.btn.reading-list",
      library: "post.btn.library",
      submit: "post.btn.submit",
      edit: "post.btn.edit",
    },
    card: {
      container: "post.card.container",
      id: "post.card.id",
      link: {
        detail: "post.card.link.detail",
        edit: "post.card.link.edit",
      },
    },
  } as const;

  export const form = {
    input: {
      error: "form.input.error",
    },
  } as const;

  export const review = {
    // todo rename to `post.form`, ie the main Post form
    form: {
      parentTitle: "review.form.parentTitle",
      title: "review.form.title",
      source: "review.form.source",
      content: "review.form.content",
      usageStatus: "review.form.usageStatus",
      rating: "review.form.rating",
    },
    tag: {
      container: "review.tag.container",
      item: "review.tag.item",
      authorVotePlus: "review.tag.author-vote-plus",
      authorVoteMinus: "review.tag.author-vote-minus",
    },
  } as const;

  export const comment = {
    vote: {
      up: "comment.vote.up",
      down: "comment.vote.down",
    },
    form: {
      textarea: "comment.form.content-textarea",
      submitBtn: "comment.form.submit-btn",
    },
  } as const;

  export const tool = {
    tag: {
      item: "tool.tag.item",
    },
  } as const;

  export const auth = {
    login: {
      username: "auth.login.username",
      password: "auth.login.password",
      submit: "auth.login.submit",
      error: "auth.login.error",
    },
    logout: {
      btn: "auth.logout.btn",
    },
  } as const;

  export function selector<S extends string>(id: S): `[data-testid="${S}"]` {
    return `[data-testid="${id}"]`;
  }

  export function set<S extends string>(id: S): { "data-testid": S } {
    return { "data-testid": id };
  }

  export function setInput<Id extends string>(id: Id): { inputProps: { "data-testid": Id } } {
    return { inputProps: { "data-testid": id } };
  }
}
