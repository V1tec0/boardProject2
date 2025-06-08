# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser

class UserManager(BaseUserManager):
    def create_user(self, email, lastname, firstname, middlename, password=None):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError("Users must have an email address")

        user = self.model(
            email=self.normalize_email(email),
            lastname=lastname,
            firstname=firstname,
            middlename=middlename,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, lastname, firstname, middlename, password=None):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.model(
            email=self.normalize_email(email),
            lastname=lastname,
            firstname=firstname,
            middlename=middlename,
            password=password,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    activation_code = models.CharField(max_length=6, blank=True, null=True)
    reset_code = models.CharField(max_length=6, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["firstname", "lastname", 'password', 'is_admin']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin

class LogEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='api_log_entries')
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    data = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.user or 'Аноним'} — {self.method} {self.path}"

    class Meta:
        db_table = 'log_entries'

class BellTemplate(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)  # Добавляем флаг активности

    class Meta:
        db_table = 'bell_template'

    def __str__(self):
        return self.name

class Client(models.Model):
    pk_client = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    token = models.CharField(max_length=420)
    floor = models.IntegerField()
    building = models.IntegerField()

    class Meta:
        db_table = 'client'

class BellSchedule(models.Model):
    BELL_TYPE_CHOICES = [
        ('lesson', 'Звонок на урок'),
        ('break', 'Звонок на перемену'),
    ]
    template = models.ForeignKey(BellTemplate, on_delete=models.CASCADE, related_name='schedules')
    bell_type = models.CharField(max_length=10, choices=BELL_TYPE_CHOICES)
    scheduled_time = models.TimeField()  # время звонка (ежедневно)
    message = models.TextField()  # сообщение для показа; сюда можно вставлять текст из заранее подготовленного списка
    active = models.BooleanField(default=True)

    class Meta:
        db_table = 'bell_schedule'

    def __str__(self):
        return f"{self.get_bell_type_display()} в {self.scheduled_time}"

class Message(models.Model):
    pk_message = models.AutoField(primary_key=True)
    text = models.TextField()
    isprimary = models.IntegerField()
    isshowing = models.IntegerField(default=0)

    class Meta:
        db_table = 'message'


class News(models.Model):
    pk_news = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    small_text = models.TextField()
    main_text = models.TextField()
    image = models.ImageField(upload_to='news/', blank=True, null=True)  # путь к одному изображению
    is_displayed = models.BooleanField(default=False)  # заменяет DisplayedNews
    display_order = models.IntegerField(null=True, blank=True)  # опционально: порядок отображения
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'news'
