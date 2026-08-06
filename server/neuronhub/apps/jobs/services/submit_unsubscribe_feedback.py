from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobAlertUnsubscribeFeedback
from neuronhub.apps.jobs.models import JobAlertUnsubscribeReason


async def submit_unsubscribe_feedback(
    alert: JobAlert,
    reason_ids: list[int],
    comment: str = "",
) -> JobAlertUnsubscribeFeedback | None:
    reasons = [
        reason
        async for reason in JobAlertUnsubscribeReason.objects.filter(
            id__in=reason_ids, is_active=True
        )
    ]
    # Without it a stale client would overwrite a stored answer with an empty one.
    if not reasons:
        return None

    is_comment_asked = any(
        reason.comment_prompt != JobAlertUnsubscribeReason.CommentPrompt.NONE
        for reason in reasons
    )

    feedback, _ = await JobAlertUnsubscribeFeedback.objects.aupdate_or_create(
        alert=alert,
        defaults={"email": alert.email, "comment": comment if is_comment_asked else ""},
    )
    await feedback.reasons.aset(reasons)
    return feedback
