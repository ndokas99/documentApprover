# Generated by Django 4.1 on 2024-09-21 20:25

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("approver", "0003_task_timestamp"),
    ]

    operations = [
        migrations.AddField(
            model_name="approver",
            name="username",
            field=models.CharField(default="user", max_length=50),
        ),
        migrations.AddField(
            model_name="task",
            name="username",
            field=models.CharField(default="user", max_length=50),
        ),
        migrations.AlterField(
            model_name="notification",
            name="username",
            field=models.CharField(default="user", max_length=50),
        ),
    ]
