document.getElementById('newsForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    const form = event.target;
    const formData = new FormData();

    // Добавляем текстовые данные
    formData.append('title', form.title.value);
    formData.append('small_text', form.small_text.value);
    formData.append('main_text', form.main_text.value);

    // Добавляем файлы
    const files = form.images.files;
    for (let i = 0; i < files.length; i++) {
        formData.append(`images[${i}]`, files[i], files[i].name);
    }

    try {
        // Отправляем данные на сервер
        const response = await fetch('http://localhost:8000/api/news/', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        // Вывод результата
        document.getElementById('response').innerText = JSON.stringify(result, null, 2);

        if (response.ok) {
            alert('News with images created successfully!');
        } else {
            alert('Error occurred: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the form.');
    }
});
