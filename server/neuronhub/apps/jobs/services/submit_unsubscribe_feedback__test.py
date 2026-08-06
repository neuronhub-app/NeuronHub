from neuronhub.apps.jobs.models import JobAlertUnsubscribeFeedback
from neuronhub.apps.jobs.models import JobAlertUnsubscribeReason
from neuronhub.apps.jobs.services.submit_unsubscribe_feedback import submit_unsubscribe_feedback
from neuronhub.apps.tests.test_cases import NeuronTestCase


class SubmitUnsubscribeFeedbackTest(NeuronTestCase):
    async def test_reasons_attached_and_email_snapshotted(self):
        alert = await self.gen.jobs.job_alert(email="unsub@example.com")
        reason_job = await self.gen.jobs.unsubscribe_reason(label="I got a job!")
        reason_noise = await self.gen.jobs.unsubscribe_reason(label="Too many emails")

        feedback = await submit_unsubscribe_feedback(
            alert, reason_ids=[reason_job.pk, reason_noise.pk]
        )

        assert feedback.email == "unsub@example.com"
        assert await _reason_ids(feedback) == [reason_job.pk, reason_noise.pk]

    async def test_reason_inactive_is_ignored(self):
        alert = await self.gen.jobs.job_alert()
        reason_active = await self.gen.jobs.unsubscribe_reason()
        reason_inactive = await self.gen.jobs.unsubscribe_reason(is_active=False)

        feedback = await submit_unsubscribe_feedback(
            alert, reason_ids=[reason_active.pk, reason_inactive.pk]
        )

        assert await _reason_ids(feedback) == [reason_active.pk]

    async def test_comment_kept_only_for_reason_asking_for_it(self):
        reason_plain = await self.gen.jobs.unsubscribe_reason()
        reason_other = await self.gen.jobs.unsubscribe_reason(
            comment_prompt=JobAlertUnsubscribeReason.CommentPrompt.REQUIRED
        )

        feedback_dropped = await submit_unsubscribe_feedback(
            await self.gen.jobs.job_alert(), reason_ids=[reason_plain.pk], comment="ignored"
        )
        assert feedback_dropped.comment == ""

        feedback_kept = await submit_unsubscribe_feedback(
            await self.gen.jobs.job_alert(),
            reason_ids=[reason_other.pk],
            comment="too many AI roles",
        )
        assert feedback_kept.comment == "too many AI roles"

    async def test_resubmit_overwrites_the_single_row_of_the_alert(self):
        alert = await self.gen.jobs.job_alert()
        reason_first = await self.gen.jobs.unsubscribe_reason(
            comment_prompt=JobAlertUnsubscribeReason.CommentPrompt.REQUIRED
        )
        reason_second = await self.gen.jobs.unsubscribe_reason(
            comment_prompt=JobAlertUnsubscribeReason.CommentPrompt.REQUIRED
        )

        await submit_unsubscribe_feedback(
            alert, reason_ids=[reason_first.pk], comment="changed my mind"
        )
        feedback = await submit_unsubscribe_feedback(
            alert, reason_ids=[reason_second.pk], comment="I got a job"
        )

        assert await JobAlertUnsubscribeFeedback.objects.filter(alert=alert).acount() == 1
        assert await _reason_ids(feedback) == [reason_second.pk]
        assert feedback.comment == "I got a job"

    async def test_submit_wo_active_reasons_keeps_the_stored_answer(self):
        alert = await self.gen.jobs.job_alert()
        reason = await self.gen.jobs.unsubscribe_reason(
            comment_prompt=JobAlertUnsubscribeReason.CommentPrompt.REQUIRED
        )
        stored = await submit_unsubscribe_feedback(
            alert, reason_ids=[reason.pk], comment="I got a job"
        )

        assert await submit_unsubscribe_feedback(alert, reason_ids=[]) is None

        stored_after = await JobAlertUnsubscribeFeedback.objects.aget(pk=stored.pk)
        assert await _reason_ids(stored_after) == [reason.pk]
        assert stored_after.comment == "I got a job"


async def _reason_ids(feedback: JobAlertUnsubscribeFeedback) -> list[int]:
    return [reason.pk async for reason in feedback.reasons.all()]
