import './sass/main.scss';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchBox = document.querySelector('#search-form');
const search = document.querySelector('input[name="searchQuery"]');
const button = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');
let inputValue = search.value;

let perPage = 40;
let page = 1;

const lightbox = () =>
  new SimpleLightbox('.gallery a', {
    captionPosition: 'outside',
    captionsData: 'alt',
    captionDelay: '250',
  });

button.style.display = 'none';

const fetchImages = async (searching, page) => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=25046418-504824fa9a0ce8e27b2b9010d&q=${searching}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const searchImages = async event => {
  event.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  inputValue = search.value;

  fetchImages(inputValue, page)
    .then(inputValue => {
      let images = inputValue.hits.length;
      
      let totalPages = Math.ceil(inputValue.totalHits / perPage);
      
      if (images > 0) {
        Notiflix.Notify.success(`Hooray! We found ${inputValue.totalHits} images.`);
        renderImages(inputValue);
        lightbox();
        button.style.display = 'block';
        if (page < totalPages) {
          button.style.display = 'block';
        } else {
         button.style.display = 'none';
          Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
      } else {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
        gallery.innerHTML = '';
        button.style.display = 'none';
      }
    })
    .catch(error => console.log(error));
};

searchBox.addEventListener('submit', searchImages);

const renderImages = inputValue => {
  const markup = inputValue.hits
    .map(hit => {
      return `<div class="photo-card">
      <a class="gallery__item" href="${hit.largeImageURL}"> <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <p class="info-item__desc"><b >Likes</b> ${hit.likes}</p>
        </p>
        <p class="info-item">
          <p class="info-item__desc"><b>Views</b> ${hit.views}</p>
        </p>
        <p class="info-item">
          <p class="info-item__desc"><b>Comments</b> ${hit.comments}</p>
        </p>
        <p class="info-item">
          <p class="info-item__desc"><b>Downloads</b> ${hit.downloads}</p>
        </p>
      </div>
    </div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
};

const loadMore = () => {
  inputValue = search.value;
  page += 1;
  fetchImages(inputValue, page).then(inputValue => {
    let totalPages = Math.ceil(inputValue.totalHits / perPage);
    renderImages(inputValue);
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    lightbox().refresh();

    if (page >= totalPages) {
      button.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  });
};

button.addEventListener('click', loadMore);