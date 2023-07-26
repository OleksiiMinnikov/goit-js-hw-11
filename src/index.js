
import './css/style.css';
import { PixabayAPI } from './js/pixabay_api';
import Notiflix from 'notiflix';
import createGallery from '../src/templates/cardGallery.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

// Вибір DOM-елементів
const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const btnLoadMoreEl = document.querySelector('.load-more');

// Створення нового екземпляра класу PixabayAPI
const pixabayAPI = new PixabayAPI();

// Ініціалізація SimpleLightbox на галереї
let gallery = new SimpleLightbox('.gallery a');

// Обробник події для форми пошуку
formEl.addEventListener('submit', handleFormSubmit);

// Обробник події для кнопки "Завантажити ще"
btnLoadMoreEl.addEventListener('click', handleLoadMoreBtnClick);

// Функція для обробки відправки форми
function handleFormSubmit(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';
  btnLoadMoreEl.classList.add('is-hidden');
  const form = event.currentTarget;
  const searchQuery = form.elements['searchQuery'].value.trim();
  pixabayAPI.page = 1; // Скидання властивості сторінки до 1 для нових пошуків
  pixabayAPI.q = searchQuery;

  if (!searchQuery) {
    Notiflix.Notify.failure(
      'На жаль, не знайдено зображень за вашим запитом. Будь ласка, спробуйте ще раз.'
    );
    return;
  }

  searchGallery();
}

// Функція для пошуку зображень
async function searchGallery() {
  try {
    const { data } = await pixabayAPI.fetchImgs();

    if (data.totalHits === 0) {
      Notiflix.Notify.failure(
        'На жаль, не знайдено зображень за вашим запитом. Будь ласка, спробуйте ще раз.'
      );
      return;
    }
    galleryEl.innerHTML = createGallery(data.hits);

    Notiflix.Notify.success(`Ура! Ми знайшли ${data.totalHits} зображень.`);

    gallery.refresh();

    if (data.totalHits > pixabayAPI.per_page) {
      btnLoadMoreEl.classList.remove('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

// Функція для обробки кліку на кнопку "Завантажити ще"
function handleLoadMoreBtnClick() {
  pixabayAPI.page += 1;
  searchLoadMoreImg();
}

// Функція для завантаження додаткових зображень
async function searchLoadMoreImg() {
  try {
    const { data } = await pixabayAPI.fetchImgs();

    galleryEl.insertAdjacentHTML('beforeend', createGallery(data.hits));
    gallery.refresh();

    if (data.hits.length < pixabayAPI.per_page) {
      btnLoadMoreEl.classList.add('is-hidden');
      return Notiflix.Notify.info(
        'Вибачте, але ви дійшли до кінця результатів пошуку.'
      );
    }
  } catch (error) {
    console.log(error);
  }
}
