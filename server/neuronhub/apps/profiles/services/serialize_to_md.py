from typing import TYPE_CHECKING

from neuronhub.apps.profiles.services.csv_optimize_tokens import csv_optimize_tokens


if TYPE_CHECKING:
    from neuronhub.apps.profiles.models import Profile


def serialize_profile_to_markdown(profile: Profile) -> str:
    parts = []
    is_m2m_can_be_used = profile.id

    if profile.job_title:
        parts.append(f"Job title: {csv_optimize_tokens(profile.job_title)}")
    if profile.company:
        parts.append(f"Company: {csv_optimize_tokens(profile.company)}")
    if profile.career_stage:
        optimized_stages = [csv_optimize_tokens(stage) for stage in profile.career_stage]
        parts.append(f"Career stage: {'; '.join(optimized_stages)}")

    if is_m2m_can_be_used:
        skills = profile.get_tag_skills_names()
        if skills and is_m2m_can_be_used:
            optimized_skills = [csv_optimize_tokens(skill) for skill in skills]
            parts.append(f"Skills: {'; '.join(optimized_skills)}")
        interests = profile.get_tag_interests_names()
        if interests:
            optimized_interests = [csv_optimize_tokens(interest) for interest in interests]
            parts.append(f"Interests: {'; '.join(optimized_interests)}")

    if profile.biography:
        parts.append(
            serialize_to_md_xml_field("bio", text=csv_optimize_tokens(profile.biography))
        )
    if profile.seeks:
        parts.append(serialize_to_md_xml_field("seeks", text=csv_optimize_tokens(profile.seeks)))
    if profile.offers:
        parts.append(
            serialize_to_md_xml_field("offers", text=csv_optimize_tokens(profile.offers))
        )

    optimized_first_name = csv_optimize_tokens(profile.first_name)
    optimized_last_name = csv_optimize_tokens(profile.last_name)

    return serialize_to_md_xml_field(
        tag_name="Profile",
        text="\n\n".join(parts),
        attributes={
            "id": profile.id or "N/A",
        },
        indent="\t",
    )


def serialize_to_md_xml_field(
    tag_name: str,
    text: str,
    attributes: dict | None = None,
    indent: str = "",
) -> str:
    xml_attrs_str = ""
    if attributes:
        pairs = [f'{attr}="{attr_val}"' for attr, attr_val in attributes.items()]
        xml_attrs_str = " " + " ".join(pairs)

    open_tag = f"{indent}<{tag_name}{xml_attrs_str}>"
    close_tag = f"</{tag_name}>"

    inner_indent = indent + "\t"
    lines = [open_tag]
    for line in text.splitlines():
        lines.append(f"{inner_indent}{line}")
    lines.append(f"{indent}{close_tag}")
    return "\n".join(lines)


def serialize_to_md_field(name: str, text: str | list):
    if not text:
        return ""
    if type(text) is list:
        text = ", ".join(text)
    return f"**{name}**: {text}"
