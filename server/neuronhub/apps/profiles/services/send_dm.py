from asgiref.sync import sync_to_async
from django.core.mail import send_mail

from neuronhub.apps.profiles.models import ProfileMessage
from neuronhub.apps.users.models import User


async def send_profile_dm(*, user_sender: User, receiver: User, message: str):
    await ProfileMessage.objects.acreate(sender=user_sender, receiver=receiver)

    await sync_to_async(send_mail)(
        subject=f"NeuronHub: message from {user_sender.username}",
        message=message,
        from_email=user_sender.email,
        recipient_list=[receiver.email],
    )
