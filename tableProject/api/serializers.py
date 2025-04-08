from rest_framework import serializers
from api.models import Message, News, Image, User, DisplayedNews, BellTemplate, BellSchedule, Video, Client


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


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['pk_image', 'title', 'image_url']

    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        # Получаем абсолютный URL изображения
        request = self.context.get('request')
        if obj.title and request:
            return request.build_absolute_uri(f'/media/news/{obj.title}')
        return None

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['pk_client', 'name', 'token', 'floor', 'building']

class NewsSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = ['pk_news', 'title', 'small_text', 'main_text', 'images']

    def get_images(self, obj):
        # Вручную получаем связанные изображения
        images = Image.objects.filter(fk_news=obj.pk_news)
        return ImageSerializer(
            images,
            many=True,
            context={'request': self.context.get('request')}
        ).data

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

class DisplayedNewsSerializer(serializers.ModelSerializer):
    news = NewsSerializer(source='fk_news', read_only=True)

    class Meta:
        model = DisplayedNews
        fields = ['news', 'created_at']

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

class VideoSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['pk_video', 'title', 'description', 'file', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if obj.file else None


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
