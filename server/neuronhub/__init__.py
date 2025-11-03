import warnings

# placing here as mypy ignores settings.py
warnings.filterwarnings(
    action="ignore",
    message="Core Pydantic V1 functionality isn't compatible.*",
    category=UserWarning,
    module="strawberry.experimental.pydantic._compat",
)
