export type TestId = string;

// todo refac: gen values from keys
export namespace ids {
  export const post = {
    list: "post.list",
    listControls: {
      sort: "post.list.controls.sort",
      dateRange: "post.list.controls.date-range",
    },
    vote: {
      up: "post.vote.up",
      down: "post.vote.down",
      count: "post.vote.count",
    },
    btn: {
      readingList: "post.btn.reading-list",
      library: "post.btn.library",
      edit: "post.btn.edit",
      importRefresh: "post.btn.import-refresh",
    },
    toast: {
      created: "post.toast.created",
      createFailed: "post.toast.create-failed",
    },
    card: {
      container: "post.card.container",
      id: "post.card.id",
      image: "post.card.image",
      content_polite: "post.card.content_polite",
      content_direct: "post.card.content_direct",
      content_rant: "post.card.content_rant",
      link: {
        detail: "post.card.link.detail",
        edit: "post.card.link.edit",
      },
    },
    form: {
      title: "post.form.title",
      content_polite: "post.form.content_polite",
      content_direct: "post.form.content_direct",
      content_rant: "post.form.content_rant",
      image: "post.form.image",
      category: "post.form.category",
      tags: "post.form.tags",
      sharingFieldsToggle: "post.form.sharing-fields-toggle",
      visibility: {
        private: "post.form.visibility.private",
        usersSelected: "post.form.visibility.users-selected",
        connections: "post.form.visibility.connections",
        subscribersPaid: "post.form.visibility.subscribers-paid",
        subscribers: "post.form.visibility.subscribers",
        internal: "post.form.visibility.internal",
        public: "post.form.visibility.public",
      },
      visibleTo: "post.form.visible-to",
      recommendTo: "post.form.recommend-to",
      tag: {
        container: "post.form.tag.container",
        vote: {
          up: "post.form.tag.vote.up",
          down: "post.form.tag.vote.down",
        },
        comment: "post.form.tag.comment",
        remove: "post.form.tag.remove",
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
    notification: {
      success: "form.notification.success",
    },
  } as const;

  export const review = {
    form: {
      title: "review.form.title",
      tags: "review.form.tags",
      review_tags: "review.form.review_tags",
      // Note: .review_tags voting uses ids.post.form.tag
    },
    tag: {
      container: "review.tag.container",
      item: "review.tag.item",
      authorVotePlus: "review.tag.author-vote-plus",
      authorVoteMinus: "review.tag.author-vote-minus",
    },
  } as const;

  export const comment = {
    // todo refac-name: .btn.upvote and .btn.downvote
    vote: {
      up: "comment.vote.up",
      down: "comment.vote.down",
    },
    form: {
      textarea: "comment.form.textarea",
      textareaEdit: "comment.form.textarea.edit",
      submitBtn: "comment.form.submit-btn",
      saveBtn: "comment.form.save-btn",
      cancelBtn: "comment.form.cancel-btn",
    },
    btn: {
      edit: "comment.btn.edit",
      reply: "comment.btn.reply",
    },
    thread: {
      line: "comment.thread.line",
      toggleButton: "comment.thread.toggle-button",
      container: "comment.thread.container",
    },
  } as const;

  export const highlighter = {
    btn: {
      save: "highlighter.btn.save",
      delete: "highlighter.btn.delete",
    },
    span: "highlighter.span",
  } as const;

  export const profile = {
    list: "profile.list",
    card: {
      container: "profile.card.container",
      contentMarkdown: "profile.card.content-markdown",
      contentSnippet: "profile.card.content-snippet",
      tags: "profile.card.tags",
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

  export function selector<S extends TestId>(id: S): `[data-testid="${S}"]` {
    return `[data-testid="${id}"]`;
  }

  export function set<S extends TestId>(id: S): { "data-testid": S } {
    return { "data-testid": id };
  }

  export function setInput<Id extends TestId>(id: Id): { inputProps: { "data-testid": Id } } {
    return { inputProps: { "data-testid": id } };
  }
}
