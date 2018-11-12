import DBHelper from "./dbhelper";
import dbPromise from "./dbpromise";

function handleClick() {
    const restaurantId = this.dataset.id;
    const fav = this.getAttribute('aria-pressed') == 'true';
    const url = `${DBHelper.API_URL}/restaurants/${restaurantId}/?is_favorite=${!fav}`;
    const PUT = {method: 'PUT'};

    // TODO: use Background Sync to sync data with API server
    return fetch(url, PUT).then(response => {
        if (!response.ok) return Promise.reject("We couldn't mark restaurant as favorite.");
        return response.json();
    }).then(updatedRestaurant => {
        dbPromise.putRestaurants(updatedRestaurant);
        // change state of toggle button
        this.setAttribute('aria-pressed', !fav);
    })
}

export default function favoriteButton(restaurant) {
    const button = document.createElement('button');
    button.innerHTML = "&#x2764;";
    button.className = "fav";
    button.dataset.id = restaurant.id;
    button.setAttribute('aria-label', `Favorite ${restaurant.name}`);
    button.setAttribute('aria-pressed', restaurant.is_favorite);
    button.onclick = handleClick;
    return button;
}