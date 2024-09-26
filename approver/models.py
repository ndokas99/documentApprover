from django.db import models


class Notification(models.Model):
    Id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, default='user')
    doc_name = models.CharField(max_length=50)
    curr_approvals = models.IntegerField(default=0)
    total_approvals = models.IntegerField()
    approved = models.CharField(max_length=200, default='')
    awaiting_approval = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='Not Started')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.username}-{self.Id}'


class Task(models.Model):
    Id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, default='user')
    doc_name = models.CharField(max_length=50)
    file = models.FileField(upload_to='docs/', default=None)
    filetype = models.CharField(max_length=50)
    curr_approvals = models.IntegerField(default=0)
    total_approvals = models.IntegerField()
    approve_list = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='Not Started')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.username}-{self.Id}'


class Approver(models.Model):
    Id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    email = models.EmailField()
    role = models.CharField(max_length=50)

    def __str__(self):
        return f'{self.name}-{self.Id}'
