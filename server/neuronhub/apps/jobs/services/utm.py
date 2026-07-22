import strawberry


@strawberry.input
class UtmParamsInput:
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    utm_content: str | None = None
