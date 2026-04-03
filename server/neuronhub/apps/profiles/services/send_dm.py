from neuronhub.apps.profiles.models import ProfileMessage
from neuronhub.apps.sites.services.send_email import send_email
from neuronhub.apps.users.models import User


async def send_profile_dm(*, user_sender: User, receiver: User, message: str):
    await ProfileMessage.objects.acreate(sender=user_sender, receiver=receiver)

    await send_email(
        subject=f"NeuronHub: message from {user_sender.username}",
        message_html=message,
        email_from=user_sender.email,
        email_to=receiver.email,
        email_reply_to=user_sender.email,
    )
