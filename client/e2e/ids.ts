export namespace ids {
  export const post = {
    vote: {
      up: "post.vote.up",
      down: "post.vote.down",
      count: "post.vote.count",
    },
    btn: {
      readingList: "post.btn.reading-list",
      library: "post.btn.library",
      submit: "post.btn.submit",
    },
    card: {
      container: "post.card.container",
      type: "post.card.type",
      link: "post.card.link",
    },
  } as const;

  export const review = {
    form: {
      parentTitle: "review.form.parent-title-input",
      titleInput: "review.form.title-input",
      contentTextarea: "review.form.content-textarea",
      usageStatusSelector: "review.form.usage-status-selector",
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

  export function selector<S extends string>(id: S): `[data-testid="${S}"]` {
    return `[data-testid="${id}"]`;
  }

  export function set<S extends string>(id: S): { "data-testid": S } {
    return { "data-testid": id };
  }

  export function setInputId<Id extends string>(id: Id): { inputProps: { "data-testid": Id } } {
    return { inputProps: { "data-testid": id } };
  }
}
