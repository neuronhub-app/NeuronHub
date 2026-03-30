export type TestId = string;

// todo refac: gen values from keys
export namespace ids {
  export const layout = {
    sidebar: "layout.sidebar",
  };

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

  export const job = {
    list: "job.list",
    searchInput: "job.search-input",
    card: {
      container: "job.card.container",
      tags: "job.card.tags",
    },
    alert: {
      subscribeBtn: "job.alert.subscribe-btn",
      subscribeBtnMobile: "job.alert.subscribe-btn-mobile",
      emailInput: "job.alert.email-input",
      submitBtn: "job.alert.submit-btn",
    },
    versions: {
      container: "job.versions.container",
      card: "job.versions.card",
      selectAllCheckbox: "job.versions.select-all",
      approveBtn: "job.versions.approve-btn",
      emptyState: "job.versions.empty-state",
    },
    subscriptions: {
      list: "job.subscriptions.list",
      card: "job.subscriptions.card",
      // todo ? refac-name: `btn.toggle` and `btn.delete`
      toggleBtn: "job.subscriptions.toggle-btn",
      removeBtn: "job.subscriptions.remove-btn",
      status: {
        inactive: "job.subscriptions.status.inactive",
        active: "job.subscriptions.status.active",
      },
      unsubscribed: { alert: "job.subscriptions.unsubscribed.alert" },
    },
  } as const;

  export const profile = {
    list: "profile.list",
    searchInput: "profile.search-input",
    listControls: {
      sort: "profile.list.controls.sort",
      sortDefault: "profile.list.controls.sort.default",
      sortAiScore: "profile.list.controls.sort.ai-score",
      sortYourScore: "profile.list.controls.sort.your-score",
    },
    card: {
      container: "profile.card.container",
      contentMarkdown: "profile.card.content-markdown",
      contentSnippet: "profile.card.content-snippet",
      contentCollapsibleTrigger: "profile.card.content-collapsible-trigger",
      unfoldBtn: "profile.card.unfold-btn",
      tags: "profile.card.tags",
    },
    llm: {
      progressBar: "profile.llm.progress-bar",
      triggerButton: "profile.llm.trigger-button",
      modelSelect: "profile.llm.model-select",
      limitInput: "profile.llm.limit-input",
      submitButton: "profile.llm.submit-button",
      cancelButton: "profile.llm.cancel-button",
    },
  } as const;

  export const facet = {
    checkbox(value: string) {
      return `facet.checkbox.${value}` as TestId;
    },
  };

  export const auth = {
    login: {
      username: "auth.login.username",
      password: "auth.login.password",
      submit: "auth.login.submit",
      error: "auth.login.error",
    },
    // todo ? refac: move to ids.layout.sidebar
    logout: {
      btn: "auth.logout.btn",
    },
  } as const;

  export function selector<S extends TestId>(id: S): `[data-testid="${S}"]` {
    return `[data-testid="${id}"]`;
  }

  export function set<S extends TestId>(id?: S): { "data-testid": S } | ObjectEmpty {
    if (id === undefined) {
      return {};
    }
    return { "data-testid": id };
  }

  type ObjectEmpty = Record<keyof never, never>;

  export function setInput<Id extends TestId>(id: Id): { inputProps: { "data-testid": Id } } {
    return { inputProps: { "data-testid": id } };
  }
}
