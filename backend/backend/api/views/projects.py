from backend.project.models import Project, TRRecord, TRInsight
from collections import defaultdict, Counter, OrderedDict
import logging 
from uuid import UUID
from datetime import datetime, timedelta, time
from django.shortcuts import get_object_or_404

logger = logging.getLogger(__name__)


class ProjectListView(ApiView):
    def get(self, request):
        person_id = query.get(request.GET, 'person_id')
        org_list = Organization.objects.filter(id__in=OrganizationAccess.objects.filter(person_id=person_id).values_list('organization_id')) 
        projs = Project.objects.filter(organization_id__in=org_list) 
        result = projs.as_dict('default_fields')
        final = []

        orgs = set([r['organization']['name'] for r in result])
        sorted_result = defaultdict(list) 

        for res in result:
            sorted_result[res['organization']['name']].append(res) 

        for org in orgs:
            final.append({'org_title': org, 'projects': sorted_result[org]})
        
        return final

class ProjectView(ApiView):
    def get(self, request, project_id):
        projs = Project.objects.get(id=project_id) 
        return projs.as_dict('default_fields')


def process_trrecord(json_data: {}):

    try: 
        record_date = datetime.strptime(json_data.get('record_date'), "%Y-%m-%dT%H:%M:%S.%fZ")
    except Exception:
        record_date = datetime.strptime(json_data.get('record_date'), "%Y-%m-%d")
    
    trrecord_data = {
        'project_id': json_data.get('projectId'), 
        'title': json_data.get('title'),
        'created_by_id': json_data.get('personId'), 
        'record_date': record_date,
        'time_went_to_bed': json_data.get('time_went_to_bed'),
        'time_wakeup': json_data.get('time_wakeup'),
        'state_of_fitness': json_data.get('state_of_fitness'),
        'anxiety': json_data.get('anxiety'),
        'stress': json_data.get('stress'),
        'training_duration': json_data.get('training_duration'),
        'running_distance': json_data.get('running_distance'),
        'sprinting_distance': json_data.get('sprinting_distance'),
        'strength_training': json_data.get('strength_training'),
        'exertion_level': json_data.get('exertion_level'),
        'training_success': json_data.get('training_success'),
        'recovery_level': json_data.get('recovery_level'),
        'has_injury': json_data.get('has_injury'),
        'existing_injury': json_data.get('existing_injury'),
        'injury_mode': json_data.get('injury_mode'),
        'injury_location': json_data.get('injury_location'),
        'injury_type': json_data.get('injury_type'),
        'circumstances': json_data.get('circumstances'),
        'athletic_participation': json_data.get('athletic_participation'),
    }

    return trrecord_data

        
class TRRecordListView(ApiView):
    def get(self, request):
        project_id = query.get(request.GET, 'project_id', default=None) 
        person_id = query.get(request.GET, 'person_id', default=None) 
        records = TRRecord.objects.filter(project_id=project_id, created_by_id=person_id) 
        records = records.order_by('-record_date')

        page = query.get(request.GET, 'page', type=int, default=1)
        count = query.get(request.GET, 'per_page', type=int, default=20)

        logger.info("TRRecord request received", extra={'project_id': project_id, 'records': len(records),
                                                        'count': count, 'page': page})
        
        return Paginator(
            records, 
            TRRecord.Serializer('default_fields', requester=self.person),
            count
        ).page(page)

    def post(self, request):
        
        trrecord_data = process_trrecord(self.json_data)
        trrecord = TRRecord.objects.create(**trrecord_data)

        return trrecord.as_dict('default_fields')


TRRECORD_ALLOWED_FIELDS = {
    'title', 'created_by_id', 'record_date', 'time_wakeup', 'time_went_to_bed'
    'state_of_fitness', 'anxiety', 'stress', 'training_duration', 'running_distance', 
    'sprinting_distance', 'strength_training', 'exertion_level', 'training_success', 
    'recovery_level', 'has_injury', 'existing_injury', 'injury_mode', 'injury_location', 
    'injury_type', 'athletic_participation', 'circumstances'
}

class TRRecordView(ApiView):
    def get(self, request, record_id):
        logger.info("TRRecord request received", extra={'id': record_id})
        trrecord = TRRecord.objects.get(id=record_id) 
        logger.info("TRRecord Get response", extra={'res': str(trrecord.as_dict('default_fields'))})
        return trrecord.as_dict('default_fields')

    def put(self, request, record_id):
        logger.info("TRRecord put (update) request received", extra={'data': self.json_data})
        trrecord = get_object_or_404(TRRecord, id=record_id)

        trrecord_data = process_trrecord(self.json_data)
        for key, val in trrecord_data.items():
            if key in TRRECORD_ALLOWED_FIELDS:
                setattr(trrecord, key, val)
        
        trrecord.save()

        logger.info("TRRecord put completed ", extra={'wakeup time': trrecord_data['time_wakeup']})
        return trrecord.as_dict('default_fields') 


    def delete(self, request, record_id):
        logger.info("TRRecord delte request received")

        TRRecord.objects.get(id=record_id).delete()

def merge_counters(counter_dict, normal_dict):
    for key, value in counter_dict.items():
        if key in normal_dict:
            normal_dict[key] += value
        else:
            normal_dict[key] = value

    return normal_dict

injury_type_converter = {
    TRRecord.InjuryType.NONE.value: 0,
    TRRecord.InjuryType.MILD.value: 1,
    TRRecord.InjuryType.MEDIUM.value: 2,
    TRRecord.InjuryType.SERIOUS.value: 3,
    TRRecord.InjuryType.EMERGENCY.value: 4,
}

def get_ordered_dates_between(start, end):
    enumerated_dates = OrderedDict()
    current_date = start
    while current_date <= end:
        enumerated_dates[current_date.strftime('%b %d')] = 0
        current_date += timedelta(days=1)
    return enumerated_dates 

class TRInsightSummaryView(ApiView):
    def get(self, request):
        project_id = query.get(request.GET, 'project_id', default=None) 
        person_id = query.get(request.GET, 'person_id', default=None) 
        pipeline_type = query.get(request.GET, 'pipeline_type', default=None) 
        trinsight = TRInsight.objects.filter(project_id=project_id, person_id=person_id, pipeline_type=pipeline_type).first()
        
        if trinsight is None:
            return {}
        # getting a relevant TR records (last 7-10 trrecords)
        trrecords = TRRecord.objects.filter(
            project_id=project_id, created_by_id=person_id).order_by('record_date')

        result = trinsight.as_dict('default_fields')
        num_result = len(trrecords.all())

        # formulate an chart_info per pipeline
        chart_info = defaultdict(dict) 
        if pipeline_type in (TRInsight.PipelineType.COACHING_SUMMARY.value, TRInsight.PipelineType.DAILY_INSIGHT.value):
            accumul = 0 
            dates_accumul = 0
            ordered_dates = OrderedDict()
            if trrecords.exists(): 
                first_record = trrecords[0]
                last_record = trrecords.reverse()[0]
                ordered_dates = get_ordered_dates_between(first_record.record_date, last_record.record_date)
            for tr in trrecords.all():
                cur_date = tr.record_date.strftime('%b %d')
                chart_info['running'][cur_date] = tr.running_distance 
                chart_info['running_acc'][cur_date] = accumul + tr.running_distance 
                accumul += tr.running_distance
                ordered_dates[cur_date] = 1 

            prev_date = 0
            for key, value in ordered_dates.items():
                ordered_dates[key] = value + prev_date
                prev_date = ordered_dates[key]

            chart_info['diary_record'] = ordered_dates

        if pipeline_type == TRInsight.PipelineType.DAILY_INSIGHT.value:
            exertion_level_acc = 0
            training_success_acc = 0
            recovery_level_acc = 0
            strength_training_acc = 0
            training_duration_acc = timedelta()
            anxiety_values = []
            stress_values = []
            for tr in trrecords.all():
                cur_date = tr.record_date.strftime('%b %d')
                # emotion status
                anxiety_values.append(tr.anxiety.value)
                stress_values.append(tr.stress.value)

                # injury status 
                chart_info['injury_type_converted'][cur_date] = injury_type_converter[tr.injury_type.value]
                chart_info['training_duration'][cur_date] = tr.training_duration.hour * 60 + tr.training_duration.minute
                chart_info['strength_training'][cur_date] = tr.strength_training.value
                strength_training_acc += (1 if tr.strength_training.value == 'yes' else 0)
                # training
                exertion_level_acc += tr.exertion_level
                training_success_acc += tr.training_success
                recovery_level_acc += tr.recovery_level
                training_duration_acc += timedelta(hours=tr.training_duration.hour, minutes=tr.training_duration.minute)
                total_hours, remainder = divmod(training_duration_acc.seconds, 3600)
                total_minutes, total_seconds = divmod(remainder, 60)
                chart_info['training_duration_acc'][cur_date] = f"{total_hours:02d}:{total_minutes:02d}:{total_seconds:02d}"

            # emtion stats
            chart_info['anxiety'] = merge_counters(Counter(anxiety_values), {key: 0 for key in [member.value for member in TRRecord.Anxiety]})
            chart_info['stress'] = merge_counters(Counter(stress_values), {key: 0 for key in [member.value for member in TRRecord.Stress]})
            # trend improvement
            chart_info['exertion_level_avg'] = round(exertion_level_acc / num_result, 2)
            chart_info['recovery_level_avg'] = round(recovery_level_acc / num_result, 2)
            chart_info['training_success_avg'] = round(training_success_acc / num_result, 2)
            chart_info['strength_training_avg'] = round(strength_training_acc / num_result, 2) * 100 # percentage
        
        if pipeline_type in (TRInsight.PipelineType.DAILY_PREDICTION.value, TRInsight.PipelineType.COACHING_SUMMARY.value):
            injury_types = []
            for tr in trrecords.all():
                cur_date = tr.record_date.strftime('%b %d')
                injury_types.append(tr.injury_type.value.capitalize()) 
            chart_info['injury_type'] = merge_counters(Counter(injury_types), {key: 0 for key in [member.value.capitalize() for member in TRRecord.InjuryType]})
        result.update({'chart_info': chart_info})

        return result 

