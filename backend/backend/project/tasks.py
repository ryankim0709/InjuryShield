from django.db.models import Q
from backend.project.models import TRRecord, Project, TRInsight
from backend.project.pipeline import (
    get_daily_insights_prompt,
    get_prediction_prompt,
    get_coaching_summary_prompt,
    make_simple_openai_request,
    initialize_openai,
    get_openai_response_content
)
import logging
from django.conf import settings
import json
from backend.project.gpt.exception import GPTResponseParsingError

logger = logging.getLogger(__name__)

def generate_coaching_summary(project_id, person_id, enforced=False):
    if TRInsight.objects.filter(person_id=person_id, 
                                project_id=project_id, 
                                date=today(), 
                                pipeline_type=TRInsight.PipelineType.COACHING_SUMMARY.value
                                ).exists() and not enforced:
        return 

    project = Project.objects.get(id=project_id) 
    trrecords = TRRecord.objects.filter(project_id=project_id, created_by_id=person_id)
    prompt_context = project.setting.prompt_context
    trrecords_for_context = trrecords.as_dict('default_fields')
    num_days = len(trrecords_for_context)
    if num_days < 7:
        TRInsight.objects.update_or_create(project_id=project_id, 
                                           person_id=person_id, 
                                           date=today(),
                                           pipeline_type=TRInsight.PipelineType.COACHING_SUMMARY.value)
        return

    # get insight summary
    insight_summary = TRInsight.objects.filter(project_id=project_id, 
                                           person_id=person_id, 
                                           pipeline_type=TRInsight.PipelineType.DAILY_INSIGHT.value).first()
    # get injury summary
    injury_summary = TRInsight.objects.filter(project_id=project_id, 
                                           person_id=person_id, 
                                           pipeline_type=TRInsight.PipelineType.DAILY_PREDICTION.value).first()
    
    prompt_context.update({'trrecord': trrecords_for_context, 
                           'days': num_days,
                           'insight': insight_summary.output['content'][0]['overall_performance']['summary'],
                           'injury': injury_summary.output['content'][0]['injury_prediction']['summary'],
                           'prevention': injury_summary.output['content'][0]['injury_avoidance'].values()
                           })

    # build the prompt / message 
    prompt_system, prompt_transcript = get_coaching_summary_prompt(prompt_context)
    messages = [
        {"role": "system", "content": prompt_system},
        {"role": "user", "content": prompt_transcript}
    ]

    # initialize openai and call its endpoint call
    openai_kwargs = initialize_openai('coaching_summary')
    response = make_simple_openai_request(openai_kwargs, messages)

    output = get_openai_response_content(response) 

    if output is None:
        return

    output_json = json.loads(output)
    
    TRInsight.objects.create(project_id=project_id, 
                            person_id=person_id, 
                            date=today(),
                            pipeline_type=TRInsight.PipelineType.COACHING_SUMMARY.value,
                            output={'content': output_json})

    # store the coaching summary into trinsight.. 
    logger.info("[COACHING SUMMARY] Successful call to openAI", extra={'my_input': messages, 'my_output': output})



def generate_injury_schedule_prediction(project_id, person_id, enforced=False):
    if TRInsight.objects.filter(person_id=person_id, 
                                project_id=project_id, 
                                date=today(), 
                                pipeline_type=TRInsight.PipelineType.DAILY_PREDICTION.value
                                ).exists() and not enforced:
        return 

    project = Project.objects.get(id=project_id) 
    trrecords = TRRecord.objects.filter(project_id=project_id, created_by_id=person_id)  #over timeframe parameter..
    prompt_context = project.setting.prompt_context
    trrecords_for_context = trrecords.as_dict('default_fields')
    num_days = len(trrecords_for_context)
    if num_days < 7:
        TRInsight.objects.update_or_create(project_id=project_id, 
                                           person_id=person_id, 
                                           date=today(),
                                           pipeline_type=TRInsight.PipelineType.DAILY_PREDICTION.value)
        return

    prompt_context.update({'trrecord': trrecords_for_context, 'days': num_days})

    # build the prompt / message 
    prompt_system, prompt_record = get_prediction_prompt(prompt_context)
    messages = [
        {"role": "system", "content": prompt_system},
        {"role": "user", "content": prompt_record}
    ]

    # initialize openai and call its endpoint call
    openai_kwargs = initialize_openai('daily_prediction')
    response = make_simple_openai_request(openai_kwargs, messages)

    output = get_openai_response_content(response) 

    if output is None:
        return

    try: 
        output = output.split('JSON Response:')[-1].strip('\n')
        output_json = json.loads(output)
    except json.JSONDecodeError as json_error:
        raise GPTResponseParsingError(extra={"json_error": json_error}) 
    except ValueError as value_error:
        print(f"ValueError: {value_error}")
        raise
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise
    
    TRInsight.objects.create(project_id=project_id, 
                            person_id=person_id, 
                            date=today(),
                            pipeline_type=TRInsight.PipelineType.DAILY_PREDICTION.value,
                            output={'content': output_json})

    # store the prediction into trinsight.. 
    logger.info("[Prediction] Successful call to openAI", extra={'my_input': messages, 'my_output': output})


def generate_training_insights(project_id, person_id, enforced=False):

    if TRInsight.objects.filter(person_id=person_id, 
                                project_id=project_id, 
                                date=today(), 
                                pipeline_type=TRInsight.PipelineType.DAILY_INSIGHT.value
                                ).exists() and not enforced:
        return 

    # first build a preview of the record within the json
    project = Project.objects.get(id=project_id) 
    trrecords = TRRecord.objects.filter(project_id=project_id, created_by_id=person_id)  #over timeframe parameter..
    prompt_context = project.setting.prompt_context
    trrecords_for_context = trrecords.as_dict('default_fields')
    num_days = len(trrecords_for_context)
    if num_days < 7:
        TRInsight.objects.update_or_create(project_id=project_id, 
                                           person_id=person_id, 
                                           date=today(),
                                           pipeline_type=TRInsight.PipelineType.DAILY_INSIGHT.value)
        return

    prompt_context.update({'trrecord': trrecords_for_context, 'days': num_days})

    # build the prompt / message 
    prompt_system, prompt_record = get_daily_insights_prompt(prompt_context)
    messages = [
        {"role": "system", "content": prompt_system},
        {"role": "user", "content": prompt_record}
    ]

    # initialize openai and call its endpoint call
    openai_kwargs = initialize_openai('daily_insight')
    response = make_simple_openai_request(openai_kwargs, messages)

    output = get_openai_response_content(response) 

    if output is None:
        return

    output_json = json.loads(output)
    
    TRInsight.objects.create(project_id=project_id, 
                            person_id=person_id, 
                            date=today(),
                            pipeline_type=TRInsight.PipelineType.DAILY_INSIGHT.value,
                            output={'content': output_json})

    # store it into trinsight.. 
    logger.info("[Insight] Successful call to openAI", extra={'my_input': messages, 'my_output': output})


def run_daily_insights():
    # for all active projects generate insights for each person. 
    for project in Project.objects.all():
        for person_id in project.organization.all_people(): 
            generate_training_insights(project.id, person_id)

def run_daily_injury_prediction():
    for project in Project.objects.all():
        for person_id in project.organization.all_people(): 
            generate_injury_schedule_prediction(project.id, person_id)
    return
                

def run_daily_coaching_summary():
    for project in Project.objects.all():
        for person_id in project.organization.all_people(): 
            generate_coaching_summary(project.id, person_id)

def generate_demo_training_record(project_id):
    if project_id is None:
        return
    
    generator = TrainingRecordGenerator(project_id=project_id)
    generator.generate()
    logger.info("Demo training record generated", extra={'project_id': project_id,
                                                         'date': today()})
    return
    
                
def run_training_records_generator():
    for project in Project.objects.filter(is_demo=True):
        generate_demo_training_record(project.id)
