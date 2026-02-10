import hashlib

from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.db import models
from django_choices_field import TextChoicesField
from simple_history.models import HistoricalRecords

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.profiles.services.serialize_to_md import serialize_profile_to_markdown
from neuronhub.apps.users.graphql.types_lazy import UserListName
from neuronhub.apps.users.models import User


class CareerStage(models.TextChoices):
    Employed = "Employed"
    SelfEmployed = "Self-employed"
    UnemployedLooking = "Not employed, looking"
    Working0to5y = "Working 0-5y"
    Working6to15y = "Working 6-15y"
    Working15yPlus = "Working 15y+"
    PhDStudent = "PhD student"
    GradStudent = "Grad student"
    Undergrad = "Undergrad"


class Profile(models.Model):
    user = models.OneToOneField(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="profile"
    )

    first_name = models.CharField(max_length=300)
    last_name = models.CharField(max_length=300, blank=True)

    company = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=600, blank=True)

    career_stage = ArrayField(
        models.CharField(max_length=50, choices=CareerStage.choices),
        default=list,
        blank=True,
    )

    biography = models.TextField(blank=True, verbose_name="Bio")

    skills = models.ManyToManyField("posts.PostTag", related_name="profiles_skilled", blank=True)
    interests = models.ManyToManyField(
        "posts.PostTag", related_name="profiles_interested", blank=True
    )

    seeks = models.TextField(blank=True)
    offers = models.TextField(blank=True)

    seeking_work = models.CharField(max_length=200, blank=True)
    recruitment = models.TextField(blank=True)

    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)

    url_linkedin = models.CharField(blank=True, max_length=400, verbose_name="LN")
    url_conference = models.CharField(blank=True, max_length=400, verbose_name="SC")

    visibility = TextChoicesField(Visibility, default=Visibility.PRIVATE)
    visible_to_users = models.ManyToManyField(User, related_name="profiles_visible", blank=True)

    bookmarked_by_users = models.ManyToManyField(
        User, related_name=UserListName.profiles_bookmarked.value, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    profile_for_llm_md = models.TextField(blank=True)

    match_hash = models.CharField(max_length=64, db_index=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["match_hash"]),
        ]

    def save(self, **kwargs):
        self.profile_for_llm_md = serialize_profile_to_markdown(self)
        super().save(**kwargs)

    def get_tag_skills_names(self) -> list[str]:
        return [tag.name for tag in self.skills.all()]

    def get_tag_interests_names(self) -> list[str]:
        return [tag.name for tag in self.interests.all()]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    # todo ! refac: dedup with Post.get_visible_to
    def get_visible_to(self) -> list[str]:
        if self.visibility is Visibility.PRIVATE:
            assert self.user
            return [self.user.username]

        if self.visibility in [Visibility.INTERNAL, Visibility.PUBLIC]:
            return [f"group/{self.visibility.value}"]

        visible_to: list[str] = []

        if self.visibility in [Visibility.USERS_SELECTED, Visibility.CONNECTIONS]:
            visible_to.extend(list(*self.visible_to_users.all().values_list("username")))

        if self.visibility is Visibility.CONNECTIONS:
            assert self.user
            for group in self.user.connection_groups.all():
                visible_to.extend(list(*group.connections.all().values_list("username")))

        return visible_to

    def is_needs_llm_reprocessing(self, user: User) -> bool:
        match = ProfileMatch.objects.filter(user=user, profile=self).first()
        if match is None or match.match_processed_at is None:
            return True

        return self.match_hash != self.compute_content_hash()

    def compute_content_hash(self) -> str:
        content = "|".join(
            [
                self.biography,
                "; ".join(sorted(self.get_tag_skills_names())),
                "; ".join(sorted(self.get_tag_interests_names())),
                self.seeks,
                self.offers,
            ]
        )
        return hashlib.sha256(content.encode()).hexdigest()


class ProfileMatch(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile_matches")
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="matches")

    match_score_by_llm = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Score",
    )
    match_reason_by_llm = models.TextField(blank=True)

    match_score = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Score Adj",
    )
    match_review = models.TextField(
        blank=True,
        verbose_name="Review",
        help_text="Usually why I scored it lower than LLM. Can be opinions, or pos feedback.",
    )

    match_batch_id = models.CharField(max_length=64, blank=True, db_index=True)
    match_processed_at = models.DateTimeField(null=True, blank=True)

    history = HistoricalRecords()

    class Meta:
        unique_together = ["user", "profile"]

    def __str__(self):
        return f"Match: {self.user} → {self.profile}"


class ProfileMessage(models.Model):
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_profile_messages"
    )
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_profile_messages"
    )
    sent_at = models.DateTimeField(auto_now_add=True)
