// script.js

/**
 * Вспомогательная функция для создания элементов <picture> с тегами <source> и <img>.
 * @param {string} path - Базовый путь к файлу (например, './Elements/Clouds/icon').
 * @param {string} altText - Текст для атрибута alt.
 * @param {string} className - Класс для тега <img>.
 * @returns {HTMLPictureElement} Созданный элемент <picture>.
 */
function createPictureElement(path, altText, className) {
  const picture = document.createElement('picture');

  // Source WebP
  const sourceWebp = document.createElement('source');
  sourceWebp.setAttribute('type', 'image/webp');
  sourceWebp.setAttribute('srcset', `${path}.webp`);
  picture.appendChild(sourceWebp);

  // Source JPEG
  const sourceJpeg = document.createElement('source');
  sourceJpeg.setAttribute('type', 'image/jpeg');
  sourceJpeg.setAttribute('srcset', `${path}.jpeg`);
  picture.appendChild(sourceJpeg);

  // Image
  const img = document.createElement('img');
  img.className = className;
  img.setAttribute('src', `${path}.jpeg`);
  img.setAttribute('alt', altText);
  img.setAttribute('loading', 'lazy'); // Оптимизация загрузки
  picture.appendChild(img);

  return picture;
}

/**
 * Стрелочная функция, которая возвращает текущую дату в формате ддммгггг (слитно).
 * @returns {string} Строка даты в формате DDMMYYYY.
 */
const formatCurrentDate = () => {
  const date = new Date();

  // Получаем день, месяц и год
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = date.getFullYear();

  // Соединяем в формат ДДММГГГГ
  return `${day}${month}${year}`;
};


/**
 * Функция для управления доступом к сайту через пароль.
 * Блокирует контент блюром и показывает модальное окно.
 */
function signBlur() {
  // 1. КОНФИГУРАЦИЯ
  const CORRECT_PASSWORD = formatCurrentDate(); // Ваш пароль
  const CONTENT_SELECTOR = '#app'; // Элемент, который нужно заблюрить (можно использовать '#app')

  // 2. ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ
  const content = document.querySelector(CONTENT_SELECTOR);
  const modal = document.getElementById('auth-modal');
  const input = document.getElementById('password-input');
  const submitButton = document.getElementById('submit-password');
  const message = document.getElementById('auth-message');

  if (!content || !modal) {
    console.error("Не найдены элементы контента или модального окна.");
    return;
  }

  // 3. ПРИМЕНЕНИЕ БЛУРА И ПОКАЗ МОДАЛЬНОГО ОКНА
  function applyBlur() {
    // Проверяем, если контент еще не разблокирован
    if (sessionStorage.getItem('isUnlocked') !== 'true') {
      content.style.filter = 'blur(12px)';
      content.style.pointerEvents = 'none'; // Отключаем взаимодействие с заблюренным контентом
      modal.style.display = 'flex';
      input.focus();
    } else {
      removeBlur();
    }
  }

  // 4. СНЯТИЕ БЛУРА И СКРЫТИЕ МОДАЛЬНОГО ОКНА
  function removeBlur() {
    content.style.filter = 'none';
    content.style.pointerEvents = 'auto'; // Включаем взаимодействие
    modal.style.display = 'none';
    sessionStorage.setItem('isUnlocked', 'true'); // Сохраняем состояние разблокировки
  }

  // 5. ЛОГИКА ПРОВЕРКИ ПАРОЛЯ
  function checkPassword() {
    const enteredPassword = input.value.trim();

    if (enteredPassword === CORRECT_PASSWORD) {
      message.textContent = '';
      removeBlur();
      // Удаляем слушателей, чтобы не выполнялась повторная проверка
      submitButton.removeEventListener('click', checkPassword);
      input.removeEventListener('keypress', handleKeypress);
    } else {
      message.textContent = 'Неверный пароль. Попробуйте снова.';
      message.style.opacity = 1;
      input.value = ''; // Очищаем поле
      input.focus();
    }
  }

  // Обработка нажатия Enter
  function handleKeypress(event) {
    if (event.key === 'Enter') {
      checkPassword();
    }
  }

  // 6. УСТАНОВКА СЛУШАТЕЛЕЙ
  submitButton.addEventListener('click', checkPassword);
  input.addEventListener('keypress', handleKeypress);

  // Инициализация: применяем блюр при запуске
  applyBlur();
}

/**
 * Рекурсивная функция для создания вложенной разметки на основе JSON.
 * @param {object} data - Текущий объект данных из JSON.
 * @param {string} currentPath - Текущий путь к папке для построения URL изображений.
 * @param {number} level - Текущий уровень вложенности (для определения тега).
 * @returns {HTMLElement|null} Созданный корневой элемент для текущего уровня.
 */
function createStructure(data, currentPath, level) {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  // Определяем корневой тег для текущего уровня вложенности
  let rootElement = null;
  let titleTag = null;
  let imgClassName = '';
  let isCard = false;

  switch (level) {
    case 1: // 'data' (игнорируем, так как это просто контейнер)
      break;
    case 2: // 'Elements' -> <section>
      rootElement = document.createElement('section');
      titleTag = 'h2';
      imgClassName = 'icon';
      break;
    case 3: // 'Clouds', 'ocean' -> <article>
      rootElement = document.createElement('article');
      titleTag = 'h3';
      imgClassName = 'icon';
      break;
    case 4: // 'Arcus_cloud', 'sky' -> <div class="card">
      rootElement = document.createElement('div');
      rootElement.className = 'card';
      titleTag = 'h4';
      isCard = true;
      break;
    default:
      break;
  }

  // Обработка объекта (уровни 1, 2, 3)
  if (Array.isArray(data) === false) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const nextPath = `${currentPath}/${key}`;
        const childElement = createStructure(data[key], nextPath, level + 1);

        if (level < 4 && childElement) { // Уровни <section> и <article>
          // Добавляем заголовок с иконкой для <section> (h2) и <article> (h3)
          if (level >= 2 && titleTag) {
            const title = document.createElement(titleTag);
            title.textContent = key;
            // Добавляем иконку
            const iconPath = `${nextPath}/icon`;
            title.insertAdjacentElement('afterbegin', (createPictureElement(iconPath, `${key} icon`, 'icon')));
            childElement.prepend(title);
          }

          // Добавляем большое изображение <bigImg>
          if (level >= 2 && level < 4) {
            const themePath = `${nextPath}/theme`;
            childElement.insertAdjacentElement('afterbegin', (createPictureElement(themePath, `${key} theme`, 'bigImg')));
          }

          // Добавляем дочерний элемент к текущему корневому элементу, если он есть
          if (rootElement) {
            rootElement.appendChild(childElement);
          } else {
            // Если это первый уровень ('data'), то просто передаем дочерние элементы
            return childElement;
          }
        } else if (level === 4) { // Уровень <div class="card">
          // Если это card-level, ключ - это название элемента (например, "Elements"), а data[key] - это массив
          // Мы обрабатываем этот уровень как массив ниже, игнорируя пустые объекты (например, "Culture": {})
          if (Array.isArray(data[key])) {
            const listContainer = document.createElement('div');
            listContainer.className = 'card-list';
            const children = createStructure(data[key], nextPath, level + 1);
            if (children) {
              // Если это card-level, мы добавляем дочерний список к 'article'
              rootElement.appendChild(children);
            }
          }
        } else if (level === 5 && rootElement) { // Уровень с картинками внутри card
          rootElement.appendChild(childElement);
        } else if (level === 6 && rootElement) { // Уровень с картинками внутри card
          rootElement.appendChild(childElement);
        }
      }
    }
  }
  // Обработка массива (уровни 4, 5)
  else if (Array.isArray(data)) {
    const wrapper = document.createElement('div'); // Враппер для cards внутри article (для flexbox)

    data.forEach(item => {
      const [itemName, flag] = item;
      const itemPath = `${currentPath}/${itemName}`;

      // <div class="card">
      const card = document.createElement('div');
      card.className = 'card';

      // <h4>Item Name - <span>Flag: <em>"flag_value"</em></span></h4>
      const h4 = document.createElement('h4');
      h4.textContent = itemName + ' - ';

      const span = document.createElement('span');
      span.textContent = 'Flag: ';

      const em = document.createElement('em');
      em.textContent = `"${flag}"`;
      em.className = `flag-${flag}`; // Класс для стилизации маркеров

      span.appendChild(em);
      h4.appendChild(span);
      card.appendChild(h4);

      // <div> с картинками
      const imagesContainer = document.createElement('div');
      imagesContainer.className = 'card-images-container';

      // Изображения 'image' и 'antipod'
      ['image', 'antipod'].forEach(imgName => {
        const imgDiv = document.createElement('div');
        const h5 = document.createElement('h5');
        h5.textContent = imgName;
        imgDiv.appendChild(h5);

        const imgPath = `${itemPath}/${imgName}`;
        imgDiv.appendChild(createPictureElement(imgPath, `${imgName} ${itemName}`, 'bigImg'));
        imagesContainer.appendChild(imgDiv);
      });

      card.appendChild(imagesContainer);
      wrapper.appendChild(card);
    });

    return wrapper; // Возвращаем контейнер с карточками
  }


  return rootElement;
}

/**
 * Основная функция для загрузки данных и рендеринга.
 */
async function loadAndRender() {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('Элемент с id="app" не найден.');
    return;
  }

  try {
    const response = await fetch('structura.json');
    if (!response.ok) {
      throw new Error(`Ошибка загрузки JSON: ${response.status} ${response.statusText}`);
    }
    const jsonData = await response.json();

    // Начинаем построение структуры с корневого объекта 'data'
    const structure = createStructure(jsonData, '.', 1);

    // Очищаем контейнер и добавляем новую структуру
    appContainer.innerHTML = '';
    if (structure) {
      // Поскольку level 1 ('data') возвращает контейнер с секциями, добавляем его содержимое
      Array.from(structure.children).forEach(child => {
        appContainer.appendChild(child);
      });
    }

  } catch (error) {
    console.error('Ошибка при обработке данных:', error);
    appContainer.textContent = 'Ошибка загрузки данных.';
  };
  signBlur(); // Вызываем функцию блокировки сайта
}

// Запускаем процесс рендеринга после загрузки DOM
document.addEventListener('DOMContentLoaded', loadAndRender);