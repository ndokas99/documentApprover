from json import loads
from approver.models import *
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt


def index(request):
    return render(request, "index.html")


@csrf_exempt
def login(request):
    if request.method == "POST":
        data = loads(request.body)
        username = data["username"]
        password = data["password"]

        if authenticate(username=username, password=password):
            return JsonResponse({'result': 'success'})
        else:
            return JsonResponse({'result': 'fail'})


@csrf_exempt
def approvers(request):
    if request.method == "POST":
        data = loads(request.body)
        name = data["name"]
        email = data["email"]
        position = data["position"]
        if not Approver.objects.filter(name=name, email=email, role=position).exists():
            Approver.objects.create(name=name, email=email, role=position).save()
            return JsonResponse({'result': 'success'})
        else:
            return JsonResponse({'result': 'fail'})
    else:
        response = list(
            Approver.objects.all().order_by('name').values()
        )
        return JsonResponse(response, safe=False)


@csrf_exempt
def tasks(request):
    if request.method == "POST":
        username, docName, apps, file = request.POST["username"], request.POST['docName'], request.POST['apps'], \
        request.FILES['doc']
        approve_list = ";".join([f"{item['name']}::{item['role']}" for item in loads(apps)])
        if not Task.objects.filter(doc_name=docName).exists():
            Task.objects.create(
                username=username,
                doc_name=docName,
                file=file,
                filetype=file.content_type,
                approve_list=approve_list,
                total_approvals=len(approve_list.split(';'))
            ).save()
            Notification.objects.create(
                username=username,
                doc_name=docName,
                total_approvals=len(approve_list.split(';')),
                awaiting_approval=approve_list
            )
            return JsonResponse({
                'result': 'success',
                'username': username,
                'doc_name': docName,
                'approver': approve_list.split(';')[0],
                'type': file.content_type
            })
        else:
            return JsonResponse({'result': 'fail'})
    else:
        data = loads(request.body)
        task_set = Task.objects.filter(username=data['username'])
        task_filter = data['filter']
        if task_filter == 'All':
            response = task_set.all().values()
        else:
            if task_filter == 'Monthly':
                response = task_set.filter(timestamp__month=timezone.now().month).values()
            elif task_filter == 'Today':
                response = task_set.filter(timestamp__day=timezone.now().day).values()
            else:
                response = task_set.filter(status=task_filter).values()
        return JsonResponse(list(response), safe=False)


def send_email(file, appr, context, filetype, item=None, task=None):
    with file.open():
        email = EmailMessage(
            subject="Request for document approval",
            body=render_to_string(template_name="email_template.html",
                                  context=context),
            attachments=[(file.name[5:], file.read(), filetype)],
            from_email=settings.EMAIL_HOST_USER,
            to=[appr.email],
        )
        email.content_subtype = "html"
        email.send()

        if item and task:
            item.save()
            task.save()


@csrf_exempt
def process_email(request):
    if request.method == "POST":
        try:
            data = loads(request.body)
            username = data['username']
            doc_name = data['doc_name']
            approver = data['approver']
            filetype = data['type']

            file = Task.objects.filter(doc_name=doc_name).first().file
            name = approver.split('::')[0]
            appr = Approver.objects.get(name=name)
            user = User.objects.get(username=username)

            context = {
                'addr': settings.ALLOWED_HOSTS[0],
                "name": appr.name,
                "doc": doc_name,
                "first": user.first_name,
                "last": user.last_name,
            }
            send_email(file, appr, context, filetype, None, None)
            return JsonResponse({'result': 'success'})
        except Exception as _:
            return JsonResponse({'result': 'fail'})


@csrf_exempt
def notifications(request):
    if request.method == "POST":
        username = loads(request.body)["username"]
        response = list(Notification.objects.filter(username=username).all().values())
        return JsonResponse(response, safe=False)


def process_notification(item):
    awaiting = item.awaiting_approval.split(';')
    approved = list(filter(lambda x: x != "", item.approved.split(';')))
    appr = awaiting.pop(0)
    approved.append(appr)
    item.approved = ';'.join(approved)
    item.awaiting_approval = ';'.join(awaiting)
    item.curr_approvals += 1
    if item.curr_approvals == item.total_approvals:
        item.status = 'Complete'
    else:
        item.status = 'Pending'
    return appr


def process_task(task):
    if task.curr_approvals == task.total_approvals:
        pass
    else:
        task.curr_approvals += 1
        if task.curr_approvals == task.total_approvals:
            task.status = 'Complete'
        else:
            task.status = 'Pending'
        return task


@csrf_exempt
def approve(request, doc_name):
    item = Notification.objects.filter(doc_name=doc_name).first()
    task = Task.objects.filter(doc_name=doc_name).first()
    if item.curr_approvals == item.total_approvals:
        return render(request, "complete.html")
    else:
        name = process_notification(item).split('::')[0]
        task = process_task(task)
        file = task.file
        username = task.username
        filetype = task.filetype

        appr = Approver.objects.get(name=name)
        user = User.objects.get(username=username)

        context = {
            'addr': settings.ALLOWED_HOSTS[0],
            "name": appr.name,
            "doc": doc_name,
            "first": user.first_name,
            "last": user.last_name,
        }
        send_email(file, appr, context, filetype, item, task)
        return render(request, "approved.html")
