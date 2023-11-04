import uuid 
import datetime
import enum
from enum import Enum

from typing import Optional
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField, CIEmailField, CITextField
from django.db.models import JSONField
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.utils.text import slugify
from django.db import models
from django.db import transaction
from django.db.models import Q, F, Case, When, QuerySet, Value
from django.db.models.expressions import Func

import logging 
logger = logging.getLogger(__name__)


class Project(Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
    organization = models.ForeignKey('org.Organization', null=True, blank=True, on_delete=models.CASCADE, related_name='organization_project')
    title = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey('org.Person', null=True, blank=True, on_delete=models.SET_NULL, related_name='created_project')
    chat = models.ForeignKey('issue.Chat', null=True, blank=True, on_delete=models.SET_NULL, related_name='chat_project')

    gpt_preview = JSONField(blank=True, null=True, default=dict, encoder=WolfJSONEncoder) 
    setting = models.ForeignKey('project.ProjectSetting', null=True, blank=True, on_delete=models.SET_NULL, related_name='setting_project')

    is_demo = models.BooleanField(default=False)
     
    class Serializer(BaseSerializer):
        default_fields = ('id', 'title', 'organization', 'created_by', 'chat')

    def __str__(self):
        return self.title or ''
    
    def save(self, *args, **kwargs):
        """ Should we move this to managers? """
        from backend.issue.models import Chat
        from backend.org.models import Team, TeamAccess

        # find any default chat exists or not
        if self.chat_id is None:
            # create a default team and team access
            team = Team.objects.create(name=self.title, organization=self.organization)
            TeamAccess.objects.create(team=team, person=self.created_by, 
                                      access_type=TeamAccess.AccessType.ADMIN.value)
             
            # create a default chat
            default_chat = Chat.objects.create(slug=self.title, 
                                               project_id=self.id,
                                               organization=self.organization,
                                               author=self.created_by,
                                               title=self.title,
                                               team=team)
            self.chat = default_chat

        if self.setting_id is None:
            default_setting = ProjectSetting.objects.create(project_id=self.id, 
                                                           title=self.title,
                                                           organization_id=self.organization_id)
            self.setting = default_setting
            
        super().save(*args, **kwargs)

class ProjectSetting(Model):
    '''
    This include GPT settings
    Store all the rule for every pipeline
    - current pipeline or type
        .daily insight
        .
    '''
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
    title = models.CharField(max_length=128, null=True)
    organization = models.ForeignKey('org.Organization', on_delete=models.CASCADE)

    project = models.ForeignKey('project.Project', on_delete=models.CASCADE)

    ## GPT Setting ##
    gpt_config = JSONField(blank=True, null=True, default=dict, encoder=WolfJSONEncoder)
    prompt_context = JSONField(default=dict, blank=True)
    
    is_daily_insight_enabled = models.BooleanField(default=True)
    is_emotion_analysis_enabled = models.BooleanField(default=True)
    is_injury_prediction_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.organization} - {self.project} - {self.title}"

    class Serializer(BaseSerializer):
        display_field = ('id', 'title', 'project')
        default_fields = ('title', 'organization', 'project', 'gpt_config', 'prompt_context',
                          'is_daily_insight_enabled', 'is_emotion_anlysis_enabled', 
                          'is_injury_prediction_enabled')

    def run_in_bulk(self):
        pass

    def run_in_day(self):
        pass

class TRRecord(Model):
    class InjuryLocation(enum.Enum):
        NONE = 'none'
        CALF = 'calf'
        KNEE = 'knee'
        ANKLE = 'ankle'
        HIP = 'hip'
        THIGH = 'thigh'
        SHIN = 'shin'
        LOWERBACK = 'lowerback'
        FOOT = 'foot'

    class Fitness(enum.Enum):
        NORMAL = 'normal'
        FATIGUE = 'fatigue'
        PAIN = 'pain'
        
    class Anxiety(enum.Enum):
        NONE = 'none'
        CONCERN = 'concern'
        TENSION = 'tension'
        CONFIDENT = 'confident'

    class Stress(enum.Enum):
        NONE = 'none'
        LOW = 'low'
        MEDIUM = 'medium'
        HIGH = 'high'
        
    class InjuryType(enum.Enum):
        NONE = 'none'
        MILD = 'mild'
        MEDIUM = 'medium'
        SERIOUS = 'serious'
        EMERGENCY = 'emergency'

    class InjuryMode(enum.Enum):
        NONE = 'none'
        SUDDEN = 'sudden'
        GRADUAL = 'gradual'
        
    class Participation(enum.Enum):
        FULL = 'full'
        PART = 'part'
        HOBBY = 'hobby'
        NONE = 'none'

    class Circumstance(enum.Enum):
        TRAINING = 'training'
        COMPETITION = 'competition'
        NONATHLETIC = 'nonathletic'
        
    class RadioGroup(enum.Enum):
        YES = 'yes'
        NO = 'no'
        NONE = 'none'
        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
    project = models.ForeignKey('project.Project', null=True, blank=True, on_delete=models.CASCADE, related_name='training_record')
    title = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey('org.Person', null=True, blank=True, on_delete=models.SET_NULL, related_name='training_record')

    # general
    record_date = models.DateField(default=None)

    # sleep details
    time_went_to_bed = models.TimeField(default=None, blank=True)
    time_wakeup = models.TimeField(default=None, blank=True)

    # emotion
    state_of_fitness = EnumField(Fitness, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    anxiety = EnumField(Anxiety, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    stress = EnumField(Stress, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value')
    
    # training details
    training_duration = models.TimeField(blank=True, null=True)
    running_distance = models.FloatField(blank=True, null=True)
    sprinting_distance = models.FloatField(blank=True, null=True)
    strength_training = EnumField(RadioGroup, models.CharField(max_length=10), null=True, blank=True, store_attr='value', label_attr='value')
    exertion_level = models.IntegerField(blank=True, null=True)
    training_success = models.IntegerField(blank=True, null=True)
    recovery_level = models.IntegerField(blank=True, null=True) 

    # injury details
    has_injury = EnumField(RadioGroup, models.CharField(max_length=10), null=True, blank=True, store_attr='value', label_attr='value')
    existing_injury = EnumField(RadioGroup, models.CharField(max_length=10), null=True, blank=True, store_attr='value', label_attr='value')
    circumstances = EnumField(Circumstance, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    injury_mode = EnumField(InjuryMode, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    injury_location = EnumField(InjuryLocation, models.TextField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    injury_type = EnumField(InjuryType, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    athletic_participation = EnumField(Participation, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    
    class Meta:
        verbose_name_plural = 'Training Records' 

    class Serializer(BaseSerializer):
        default_fields = ('id', 'project', 'title', 'created_by', 'record_date', 'time_went_to_bed',
                          'time_wakeup', 'state_of_fitness', 'anxiety', 'stress', 'training_duration',
                          'running_distance', 'sprinting_distance', 'strength_training', 'exertion_level',
                          'training_success', 'recovery_level', 'has_injury', 'existing_injury', 'circumstances',
                          'injury_mode', 'injury_location', 'injury_type', 'athletic_participation')
        insight_fields = ('record_date', 'title', 'running_distance', 'has_injury')

    def __str__(self):
        return self.title or ''
    

class TRInsight(Model):
    class Status(Enum):
        UNSTARTED = 'UNSTARTED'
        QUEUED = 'QUEUED'
        PREPROCESSING = 'PREPROCESSING'
        RUNNING = 'RUNNING'
        SUCCEEDED = 'SUCCEEDED'
        FAILED = 'FAILED'
        FLAGGED = 'FLAGGED'
    
    class PipelineType(Enum):
        DAILY_INSIGHT = 'daily_insight'
        DAILY_PREDICTION = 'daily_prediction'
        COACHING_SUMMARY = 'coaching_summary'
        
    # general
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
    project = models.ForeignKey('project.Project', null=True, blank=True, on_delete=models.CASCADE, related_name='insight_project')
    person = models.ForeignKey('org.Person', null=True, blank=True, on_delete=models.SET_NULL, related_name='insight_person')
    date = models.DateField(default=None)

    # pipeline specific
    pipeline_type = EnumField(PipelineType, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 
    status = EnumField(Status, models.CharField(max_length=32), null=True, blank=True, store_attr='value', label_attr='value') 

    # output
    output = JSONField(default=dict, blank=True)

    class Meta:
        verbose_name_plural = 'Training Insights' 

    class Serializer(BaseSerializer):
        default_fields = ('id', 'project_id', 'person_id', 'date', 'pipeline_type', 'status', 'output')

    def __str__(self):
        return f'{self.project_id} {self.person_id} for pipeline of {self.pipeline_type}'
