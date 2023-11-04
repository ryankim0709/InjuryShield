import openai 
from jinja2 import Template 
from typing import List, Union, Optional, Tuple
import os
import re
from django.conf import settings
from wolf.project.gpt.constants import (
    MULTIPLE_INSIGHT_INSTRUCTION,
    MULTIPLE_PREDICTION_INSTRUCTION,
    COACHING_SUMMARY_INSTRUCTION,
    EXAMPLE_COACHING_SUMMARY,
    RESPONSE_TOKEN_LIMIT
)
from backend.project.gpt.exception import (
    GPTRateLimitError,
    GPTTokenLimitError,
    GPTResponseParsingError
)
import csv

DEFAULT_MODEL = "gpt-3.5-turbo-16k-0613" 

def render_template_string(templates_subpaths: List[str], fname: str, context: dict={}) -> str:
    rendered_template = Template(
        open(
            os.path.join(
                os.path.abspath(os.path.dirname(__file__)),
                "gpt",
                *templates_subpaths,
                fname,
            ),
        ).read(),
    ).render(context)
    
    return rendered_template

def render_gpt_string(fname: str, context: dict ={}) -> str:
    return render_template_string([], fname, context)

def get_gpt_model_for_context(service_name: str, body: dict=None, logger=None) -> str:
    models = {
       'daily_insight': "gpt-3.5-turbo",
       'daily_prediction': "gpt-3.5-turbo-16k-0613",
       'coaching_summary': "gpt-4"
    }
    return models.get(service_name, DEFAULT_MODEL)

def get_token_limit(model_name: str) -> int:
    if re.match("gpt-4-32k", model_name):
        return 32768
    if re.match("gpt-3.5-turbo-16k.*", model_name):
        return 16384
    if re.match("gpt-3.*", model_name):
        return 4096
    if re.match("gpt-4.*", model_name):
        return 8192
    else:
        return 4096

    
def initialize_openai(context: str, default: Optional[dict]=None, model_override: str=None, backend_override: str=None) -> dict:
    """ project id with gpt_config """
    global openai 
    model = model_override or get_gpt_model_for_context(context) 

    gpt_config = {}
    backend = backend_override or 'open_ai'

    if backend == 'open_ai':
        openai.api_type="open_ai"
        openai.api_base = "https://api.openai.com/v1"
        openai.api_version = None
        openai.api_key = settings.OPENAI_APIKEY
    
    openai_kwargs = {
        'model': model,
        'max_tokens': RESPONSE_TOKEN_LIMIT,
        'temperature': 0.1,
        'frequency_penalty': 0,
        'presence_penalty': 0,
    }

    openai_kwargs.update(default or {})

    return openai_kwargs

def make_simple_openai_request(llm_kwargs, messages):
    try:
        response = openai.ChatCompletion.create(**llm_kwargs, messages=messages)
        return response
    except openai.error.RateLimitError as e:
        raise GPTRateLimitError() from e
    except openai.error.InvalidRequestError as e:
        raise GPTTokenLimitError(extra={"messages": messages})

def get_openai_response_content(response):
    try:
        return response.get('choices', [])[0].get('message', {}).get('content')
    except:
        raise GPTResponseParsingError
    
def load_elite_data():
    data_list = []
    fname = 'elite.csv'
    fname_full = os.path.join(os.path.abspath(os.path.dirname(__file__)), "gpt", fname);

    with open(fname_full, mode='r') as f: 
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            data_list.append(row)

    return data_list

def get_daily_insights_prompt(prompt_context) -> Tuple[str, str]:
    prompt_instructions = (
        prompt_context.get('daily_insight_instructions') or
        MULTIPLE_INSIGHT_INSTRUCTION
    )
    prompt_system = render_gpt_string('multi_insight_system.txt', {
        'cotext': prompt_context.get('context'), 
        'user_type': prompt_context.get('user_type'),
        'instructions': prompt_instructions
    })

    prompt_transcript = render_gpt_string('training.txt', {
        'trrecord': prompt_context.get('trrecord') 
    })

    prompt_transcript += '\n\nThe JSON Response:'
    return (prompt_system, prompt_transcript)

def get_prediction_prompt(prompt_context) -> Tuple[str, str, str]:
    prompt_instructions = (
        prompt_context.get('daily_prediction_instructions') or
        MULTIPLE_PREDICTION_INSTRUCTION
    )
    prompt_system = render_gpt_string('multi_prediction_system.txt', {
        'cotext': prompt_context.get('context'), 
        'user_type': prompt_context.get('user_type'),
        'instructions': prompt_instructions
    })

    prompt_transcript = render_gpt_string('training_elite.txt', {
        'trrecord': load_elite_data() 
    })
    prompt_transcript += '\n\n'+ render_gpt_string('training.txt', {
        'trrecord': prompt_context.get('trrecord') 
    })

    prompt_transcript += '\n\nThe JSON Response:'
    return (prompt_system, prompt_transcript)


def get_coaching_summary_prompt(prompt_context) -> Tuple[str, str, str]:

    prompt_instructions = (
        prompt_context.get('coaching_summary_instructions') or
        COACHING_SUMMARY_INSTRUCTION
    )
    prompt_system = render_gpt_string('coaching_system.txt', {
        'cotext': prompt_context.get('context'), 
        'user_type': prompt_context.get('user_type'),
        'instructions': prompt_instructions
    })

    prompt_system += f'\n{EXAMPLE_COACHING_SUMMARY}'

    prompt_transcript = render_gpt_string('coaching_user.txt', {
        'insight': prompt_context.get('insight'), 
        'injury': prompt_context.get('injury'), 
        'prevention': prompt_context.get('prevention'), 
    })
    prompt_transcript += '\n\n'+ render_gpt_string('training.txt', {
        'trrecord': prompt_context.get('trrecord') 
    })

    prompt_transcript += '\n\nThe JSON Response:'
    return (prompt_system, prompt_transcript)
