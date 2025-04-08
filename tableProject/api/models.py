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

class BellTemplate(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)  # Добавляем флаг активности

    class Meta:
        managed = False
        db_table = 'bell_template'

    def __str__(self):
        return self.name

class Video(models.Model):
    pk_video = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='videos/')  # Хранение файлов в `media/videos`
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'video'

class Client(models.Model):
    pk_client = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    token = models.CharField(max_length=420)
    floor = models.IntegerField(max_length=1)
    building = models.IntegerField(max_length=1)

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
        managed = False
        db_table = 'bell_schedule'

    def __str__(self):
        return f"{self.get_bell_type_display()} в {self.scheduled_time}"

class DisplayedNews(models.Model):
    fk_news = models.OneToOneField('News', models.DO_NOTHING, db_column='fk_news', primary_key=True)
    created_at = models.DateTimeField()
    display_order = models.IntegerField()  # новое поле

    class Meta:
        managed = False
        db_table = 'displayed_news'

class Image(models.Model):
    pk_image = models.AutoField(primary_key=True)
    title = models.CharField(max_length=45)
    fk_news = models.ForeignKey('News', models.DO_NOTHING, db_column='fk_news')

    class Meta:
        managed = False
        db_table = 'image'


class Message(models.Model):
    pk_message = models.AutoField(primary_key=True)
    text = models.TextField()
    isprimary = models.IntegerField()
    isshowing = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'message'


class News(models.Model):
    pk_news = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    small_text = models.TextField()
    main_text = models.TextField()

    class Meta:
        managed = False
        db_table = 'news'
