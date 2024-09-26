# Generated by Django 4.1 on 2024-09-21 19:15

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("approver", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("Id", models.AutoField(primary_key=True, serialize=False)),
                ("username", models.CharField(max_length=150)),
                ("doc_name", models.CharField(max_length=50)),
                ("curr_approvals", models.IntegerField()),
                ("total_approvals", models.IntegerField()),
                ("approved", models.CharField(max_length=200)),
                ("awaiting_approval", models.CharField(max_length=200)),
                ("status", models.CharField(max_length=50)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.RenameModel(
            old_name="Approvers",
            new_name="Approver",
        ),
        migrations.RenameModel(
            old_name="Tasks",
            new_name="Task",
        ),
        migrations.DeleteModel(
            name="Notifications",
        ),
    ]
