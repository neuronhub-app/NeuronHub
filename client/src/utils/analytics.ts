import type { Hit } from "instantsearch.js/es/types";
import { posthog, type Properties } from "posthog-js";
import { useEffect } from "react";
import type { SendEventForHits } from "instantsearch.js/es/lib/utils";

import { errors } from "@/utils/errors";
import { ID } from "@/gql-tada";

export const ev = analytics.ev;

/**
 * #draft
 *
 * Collects consistent Event names + easy DX.
 *
 * Example [[analytics.events]]:
 * - analytics.captureClick(ev.job, ev.job_url_ext, { id }) => job__clicked__
 * - analytics.capture(ev.job, ev.search_converted, { id }, { sendEvent }) => job__search_converted
 *
 * In most of `eventDetail` Enum values overlaps are ok <- typed as a strict union of N Sets.
 * But prevent non-unique names, eg in [[Location]] and [[Field]] - may poison your analytics with ambiguous values.
 * todo ? refac: add a static uniqueness check of clashing enums (eg neighbors, where in-between enums as as [[View]] will not help to differentiate the resutling string)
 *
 * FYI: Not used TS literals (or literal templates) <- hard to rename/restructure.
 */
export namespace analytics {
  export function capture(
    eventDetail:
      | [Model, Action, Field?, Location?]
      | [Model, Action, Field?, FieldAction?, Location?]
      | [Model, Action, Location?]
      | [Model, View, Action, Field?, Location?]
      | [Model, View, Action, Field?, FieldAction?, Location?],
    props?: AnalyticProps,
    opts?: { sendEvent: SendEventForHits; hit: Hit | Hit[] },
  ) {
    try {
      const model: Model = eventDetail[0];
      const propsExtended = addPropsIdByModelType({ props, model });

      const eventName = eventDetail.join("__");
      posthog.capture(eventName, propsExtended);

      if (opts?.sendEvent) {
        opts?.sendEvent("click", opts.hit, eventName);
      }
    } catch (error) {
      errors.report(error, { isShowFeedbackPopup: false });
    }
  }

  export function captureClick(
    eventDetail: [ElementType, ElementId, Location?],
    props?: AnalyticProps,
  ) {
    try {
      const eventDetailExtended = [Action.clicked, ...eventDetail];
      posthog.capture(eventDetailExtended.join("__"), props);
    } catch (error) {
      errors.report(error, { isShowFeedbackPopup: false });
    }
  }

  export type AnalyticProps = Properties & {
    id?: ID;
    action_subject_id?: ID;
  };

  /**
   * @param ID is optional <- Modals are often mounted as `isOpen = false` wo/ ID
   */
  export function useViewedCapture(eventDetail: [Model, ID?, Location?], props?: AnalyticProps) {
    const id = eventDetail[1];

    useEffect(() => {
      try {
        const [model, id, location] = eventDetail;
        if (id) {
          if (location) {
            capture([model, Action.viewed, location], { ...props, id });
          } else {
            capture([model, Action.viewed], { ...props, id });
          }
        }
      } catch (error) {
        errors.report(error, { isShowFeedbackPopup: false });
      }
    }, [id]);
  }

  export enum Model {
    job = "job",
    job_subscription = "job_subscription",
    profile = "profile",

    // apps.posts
    vote = "vote",
    tag = "tag",
    // Post projections
    post = "post",
    tool = "tool",
    review = "review",
    comment = "comment",
  }
  export enum View {
    list = "list",
    detail = "detail", // the default for most [[analytics.capture]]
  }

  /**
   * Members are named in the Past tense -> avoids enum clashing in [[analytics.capture]].
   */
  export enum Action {
    // CRUD
    created = "created",
    updated = "updated",
    deleted = "deleted",
    viewed = "viewed",

    // see below [[ElementType]] actions
    clicked = "clicked",
    searched = "searched",
    sorted = "sorted",
    filtered = "filtered",

    // Algolia
    // see [available types](https://algolia.com/doc/guides/sending-events/concepts/event-types)
    search_converted = "search_converted",
  }
  export enum ElementType {
    link = "link",
    button = "button",
    input = "input",
    select = "select",
  }
  export enum ElementId {
    job_url_ext = "job_url_ext",
  }
  export enum Field {
    name = "name",
    content = "content",
    tags = "tags",
    visibility = "visibility",
  }
  export enum FieldAction {
    add = "add",
    remove = "remove",
    change = "change",
  }
  export enum Location {
    job_card = "job_card",
    job_search = "job_search",
    job_subscribe = "job_subscribe",
    sidebar = "sidebar",
    facets = "facets",
  }

  export const events = {
    ...ElementType,
    ...ElementId,
    ...Model,
    ...View,
    ...Action,
    ...Field,
    ...FieldAction,
    ...Location,
  };
  export const ev = events;

  /**
   * Dedups defining on `model` both `.id` and `.{model}_id`.
   *
   * todo ? refac: generate by [[Model]] values
   */
  function addPropsIdByModelType({ props, model }: { props?: AnalyticProps; model: Model }) {
    if (!props?.id) {
      return props;
    }
    switch (model) {
      case Model.job:
        return { ...props, job_id: props.id };
      case Model.job_subscription:
        return { ...props, job_subscription_id: props.id };
      case Model.profile:
        return { ...props, profile_id: props.id };

      // apps.posts
      case Model.post:
        return { ...props, post_id: props.id };
      case Model.tool:
        return { ...props, tool_id: props.id };
      case Model.review:
        return { ...props, review_id: props.id };
      case Model.comment:
        return { ...props, comment_id: props.id };
      case Model.vote:
        return { ...props, vote_id: props.id };
      case Model.tag:
        return { ...props, tag_id: props.id };
    }
  }
}
