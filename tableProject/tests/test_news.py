import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder

# URL вашего API для загрузки новостей
url = "http://localhost:8000/api/news/"

# Пути к тестовым файлам
text_file_path = "./images/Йцу.docx"  # Текстовый файл для чтения
image_paths = [
    "./images/image1.jpg",
    "./images/image2.jpg",
]

# Формируем данные для запроса
fields = {
    # Убираем явное указание полей, они будут парситься из файла
}

# Добавляем текстовый файл с правильным MIME-типом
fields["file_text"] = ("Йцу.docx", open(text_file_path, "rb"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

# Добавляем изображения
for idx, image_path in enumerate(image_paths):
    fields[f"images[{idx}]"] = (image_path.split("/")[-1], open(image_path, "rb"), "image/jpeg")

# Создаём MultipartEncoder
multipart_data = MultipartEncoder(fields=fields)

# Выполняем POST-запрос
# response = requests.post(
#     url,
#     data=multipart_data,
#     headers={"Content-Type": multipart_data.content_type}
# )

response = requests.get(
    url
)

# Выводим результаты
print("Status Code:", response.status_code)
try:
    print("Response JSON:", response.json())
except ValueError:
    print("Response Text:", response.text)
