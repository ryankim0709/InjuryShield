from django.contrib.auth.models import User 
import logging 

logger = logging.getLogger(__name__)

class UserListView(ApiView):
    def get(self, request, org_id):
        users = User.objects.all()
        return users.as_dict('default_fields')

class UserView(ApiView):
    def get(self, request, user_id):
        users = User.objects.get(project_id=user_id) 
        return users.as_dict('default_fields')
