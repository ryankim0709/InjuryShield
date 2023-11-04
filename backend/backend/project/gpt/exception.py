import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)

class GPTException(Exception):
    gpt_exit_code = -1
    user_friendly_msg = (
        "Unknown failure encountered."
    )
    default_message = "Unknown failure encountered from external LLM service."

    def __init__(self, error_message: str = None, *args: object) -> None:
        if error_message is None:
            error_message = self.default_message
        super().__init__(error_message, *args)


class GPTRateLimitError(GPTException):
    gpt_exit_code = 1
    user_friendly_msg = (
        "We are experiencing high volume and will re-run this insight shortly."
    )

    def __init__(self, *args: object) -> None:
        "Rate limit exceeded.", *args


class GPTTokenLimitError(Exception):
    gpt_exit_code = 2
    user_friendly_msg = (
       "This record is too long to be processed." 
    )

    def __init__(self, *args: object) -> None:
        super().__init__(
            "Token limit exceeded.", *args
        )

class GPTResponseParsingError(Exception):
    gpt_exit_code = 3
    user_friendly_msg = "The response was not in the expected format."

    def __init__(self, *args: object, response: Optional[Any]=None) -> None:
        super().__init__(
            "Malformed response received.", *args
        )
        if response:
            self.response = response