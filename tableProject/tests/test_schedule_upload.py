import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder

# URL вашего API
url = "http://localhost:8000/api/schedule/"

# Пути к тестовым файлам и соответствующие типы расписаний
files_with_types = [
    {"file_path": "./test_file1.png", "type": "s"},  # Основное расписание
    {"file_path": "./test_file2.png", "type": "p"},  # Для преподавателей
    {"file_path": "./test_file3.png", "type": "z"},  # Для заочников
]

# Формируем данные для отправки
fields = {}
for idx, file_info in enumerate(files_with_types):
    file_path = file_info["file_path"]
    schedule_type = file_info["type"]
    fields[f"files[{idx}]"] = (file_path.split("/")[-1], open(file_path, "rb"), "image/png")
    fields[f"type[{idx}]"] = schedule_type

multipart_data = MultipartEncoder(fields=fields)
print(multipart_data)

# Отправка POST-запроса
# response = requests.post(
#     url,
#     data=multipart_data,
#     headers={"Content-Type": multipart_data.content_type}
# )

response = requests.get(
    url
)

print(response)
print(response.json())