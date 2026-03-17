/**
 * #draft, untested
 */
import { PostFragmentType } from "@/graphql/fragments/posts";
import type { ErrorLike } from "@apollo/client";
import { EmptyState } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import { ReactNode } from "react";
import toastLib from "react-hot-toast";
import { IconType } from "react-icons";
import { GoAlert, GoInfo } from "react-icons/go";
import * as Sentry from "@sentry/react";

export namespace errors {
  export function report(error: Error | unknown, opts = { isShowFeedbackPopup: true }) {
    const messageToUser = buildMessageToUser(error);

    captureException(error, { fingerprint: [messageToUser] });

    if (opts.isShowFeedbackPopup) {
      showSentryFeedbackWidget().then();
    }
  }

  export function ErrorReport(props: {
    error: Error | unknown;
    isShowToast?: boolean;
    toastMsg?: string;
    type?: GraphqlTypename;
    icon?: IconType;
    isShowFeedbackPopup?: boolean;
  }): ReactNode {
    const messageToUser = buildMessageToUser(props.error);

    captureException(props.error, {
      fingerprint: [messageToUser, props.type ?? ""],
      extra: { type: props.type },
    });

    if (props.isShowToast ?? true) {
      errors.toast(props.toastMsg ?? messageToUser);
    }
    if (props.isShowFeedbackPopup ?? true) {
      showSentryFeedbackWidget().then();
    }
    return <ErrorEmptyState component={props.type} message={messageToUser} icon={props.icon} />;
  }

  export function ErrorOrNotFoundReport(props: Parameters<typeof ErrorReport>[0]): ReactNode {
    return errors.ErrorReport({
      ...props,
      error: props.error ?? new GraphqlError404(props.type),
      icon: GoInfo,
    });
  }

  export function toast(
    message?: string | ErrorLike | unknown,
    opts = { isAskToTryAgain: true },
  ) {
    toastLib.error(buildMessageToUser(message, opts));
  }

  export function buildMessageToUser(
    error?: string | ErrorLike | unknown,
    opts = { isAskToTryAgain: true },
  ) {
    let message: string;
    if (typeof error === "string") {
      message = error ?? "An error occurred";
    } else {
      // @ts-expect-error #bad-infer JS lacks Error types
      message = error?.message ?? "An error occurred";
    }
    return opts.isAskToTryAgain ? `${message}, please try again` : message;
  }

  function ErrorEmptyState(props: {
    component?: string | GraphqlTypename;
    message: string;
    icon?: IconType;
  }) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            {props.icon ? <props.icon /> : <GoAlert />}
          </EmptyState.Indicator>
          <EmptyState.Title>
            {props.component ? `Error loading ${props.component}` : "Error"}
          </EmptyState.Title>
          <EmptyState.Description>{props.message}</EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  async function showSentryFeedbackWidget() {
    const feedback = Sentry.getFeedback();
    if (!feedback) {
      return null;
    }

    const widget = feedback.createWidget({
      onSubmitSuccess: () => {
        setTimeout(() => {
          widget.hide();
        }, 5_000);
      },
    });
    widget.appendToDom();
    widget.show();
  }
}

export class GraphqlError404 extends Error {
  constructor(
    public typename?: GraphqlTypename,
    errorMsg = "GraphQL Error 404",
  ) {
    super(typename ? `${errorMsg} type=${typename}` : errorMsg);
  }
}

export type GraphqlTypename = PostFragmentType["__typename"];
