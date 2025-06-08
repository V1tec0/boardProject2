from rest_framework import serializers
from api.models import Message, News, User, BellTemplate, BellSchedule, Client, LogEntry


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['pk_message', 'text', 'isprimary', 'isshowing']
        read_only_fields = ['pk_message']  # Если идентификатор не должен изменяться

    def create(self, validated_data):
        # Используем данные из validated_data, включая isshowing
        return Message.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Обновляем только переданные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['pk_client', 'name', 'token', 'floor', 'building']

class NewsSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = [
            'pk_news',
            'title',
            'small_text',
            'main_text',
            'image',
            'image_url',
            'is_displayed',
            'display_order',
            'created_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


    def create(self, validated_data):
        news = News.objects.create(title=validated_data.get('title'), small_text=validated_data.get('small_text'), main_text=validated_data.get('main_text'))
        news.save()
        return news

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.small_text = validated_data.get('small_text', instance.small_text)
        instance.main_text = validated_data.get('main_text', instance.main_text)
        instance.save()
        return instance

class LogEntrySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = '__all__'

    def get_user(self, obj):
        return obj.user.email if obj.user else None

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'confirm_password', 'firstname', 'lastname', 'is_admin', 'is_active']

        extra_kwargs = {
            'email': {
                'validators': []  # Отключаем валидаторы для PATCH-запросов
            },
            'is_admin': {'required': False},  # Разрешить частичное обновление
            'is_active': {'required': False},
        }

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if confirm_password is not None:  # проверяем только если передан confirm_password
            if password != confirm_password:
                raise serializers.ValidationError('Пароли не совпадают!')
        return attrs

    def validate_email(self, value):
        request = self.context.get('request', None)
        if request and request.user and request.user.email == value:
            return value  # email не изменился — валидно

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует!')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data.get('email'),
            lastname=validated_data.get('lastname'),
            firstname=validated_data.get('firstname'),
            middlename=validated_data.get('middlename', ''),
            password=validated_data.get('password'),
        )
        user.is_active = False
        user.is_admin = False
        user.save()
        return user

    def update(self, instance, validated_data):
        # Обновляем только переданные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class BellTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BellTemplate
        fields = ['id', 'name', 'description']

    def create(self, validated_data):
        template = BellTemplate.objects.create(name=validated_data.get('name'), description=validated_data.get('description'))
        template.save()
        return template

class BellScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BellSchedule
        fields = ['id', 'template', 'bell_type', 'scheduled_time', 'message', 'active']

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'firstname', 'lastname', 'is_active', 'is_admin']

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.middlename = validated_data.get('middlename', instance.middlename)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_admin = validated_data.get('is_admin', instance.is_admin)
        instance.save()
