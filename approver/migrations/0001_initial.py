# Generated by Django 4.1 on 2024-09-21 01:56

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Notifications",
            fields=[
                ("Id", models.AutoField(primary_key=True, serialize=False)),
                ("doc_name", models.CharField(max_length=50)),
                ("curr_approvals", models.IntegerField()),
                ("total_approvals", models.IntegerField()),
                ("approved", models.CharField(max_length=200)),
                ("awaiting_approval", models.CharField(max_length=200)),
                ("status", models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name="Tasks",
            fields=[
                ("Id", models.AutoField(primary_key=True, serialize=False)),
                ("doc_name", models.CharField(max_length=50)),
                ("curr_approvals", models.IntegerField()),
                ("total_approvals", models.IntegerField()),
                ("approve_list", models.CharField(max_length=200)),
                ("status", models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name="Approvers",
            fields=[
                ("Id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=50)),
                ("email", models.EmailField(max_length=254)),
                ("role", models.CharField(max_length=50)),
                ("tasks", models.ManyToManyField(to="approver.tasks")),
            ],
        ),
    ]
