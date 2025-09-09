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
      submit: "post.btn.submit", // todo refac: drop, use .form
      edit: "post.btn.edit",
    },
    card: {
      container: "post.card.container",
      id: "post.card.id",
      image: "post.card.image",
      link: {
        detail: "post.card.link.detail",
        edit: "post.card.link.edit",
      },
    },
    form: {
      title: "post.form.title",
      image: "post.form.image",
      tags: {
        container: "post.form.tags.container",
        tag: {
          vote: {
            up: "post.form.tags.tag.vote.up",
            down: "post.form.tags.tag.vote.down",
          },
          comment: "post.form.tags.tag.comment",
          remove: "post.form.tags.tag.remove",
        },
      },
      btn: {
        submit: "post.form.btn.submit",
      },
    },
  } as const;

  export const form = {
    input: {
      error: "form.input.error",
    },
  } as const;

  export const review = {
    form: {
      title: "review.form.title",
      content: "review.form.content",
      tags: "review.form.tags",
      review_tags: "review.form.review_tags",
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
      textarea: "comment.form.textarea",
      submitBtn: "comment.form.submit-btn",
      saveBtn: "comment.form.save-btn",
      cancelBtn: "comment.form.cancel-btn",
    },
    edit: {
      btn: "comment.edit.btn",
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
