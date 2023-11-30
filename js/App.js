import EasyHTTP from './EasyHTTP.js';
import BootswatchSelector from './BootswatchSelector.js';
class CalorieTracker {
    constructor() {
        this._storage = new Storage();
        this._init()
    }
    // public methods / API
    async addMeal(meal) {
        this._meals.push(meal);
        this._totalCalories += meal.calories;
        await this._storage.updateTotalCalories(this._totalCalories);
        await this._storage.storeMeal(meal);
        this._displayNewMeal(meal);
        this._render();
    }
    async addWorkout(workout) {
        this._workouts.push(workout);
        this._totalCalories -= workout.calories;
        await this._storage.updateTotalCalories(this._totalCalories);
        await this._storage.storeWorkout(workout);
        this._displayNewWorkout(workout);
        this._render();
    }
    async removeMeal(id) {
        const index = this._meals.findIndex(meal => meal.id === id);
        if(index !== -1) {
            const meal = this._meals[index];
            this._totalCalories -= meal.calories;
            await this._storage.updateTotalCalories(this._totalCalories);
            this._meals.splice(index, 1);
            await this._storage.deleteMeal(id);
            this._render();
        }
    }
    async removeWorkout(id) {
        const index = this._workouts.findIndex(workout => workout.id === id);
        if(index !== -1) {
            const workout = this._workouts[index];
            this._totalCalories -= workout.calories;
            await this._storage.updateTotalCalories(this._totalCalories);
            this._workouts.splice(index, 1);
            await this._storage.deleteWorkout(id);
            this._render();
        }
    }
    async reset() {
        await this._storage.clear();
        this._render();
    }
    async setLimit(calorieLimit) {
        this._calorieLimit = calorieLimit;
        await this._storage.setCalorieLimit(calorieLimit);
        this._displayCalorieLimit();
        this._render();
    }
    loadItems() {
        this._getData().then(data => {
            this._calorieLimit = data.calorieLimit;
            this._totalCalories = data.totalCalories;
            this._meals = data.meals;
            this._workouts = data.workouts;
            this._meals.forEach(meal => this._displayNewMeal(meal));
            this._workouts.forEach(workout => this._displayNewWorkout(workout));
        });
    }
    // private methods
    async _init() {
        await this._getData();
        this._displayCalorieLimit();
        this._displayTotalCalories();
        this._displayCaloriesConsumed();
        this._displayCaloriesBurned();
        this._displayCaloriesRemaining();
        this._displayCaloriesProgress();
        document.querySelector('#limit').value = this._calorieLimit;
    }
    async _getData() {
        this._calorieLimit = await this._storage.getCalorieLimit();
        this._totalCalories = await this._storage.getTotalCalories(0);
        this._meals = await this._storage.getMeals();
        this._workouts = await this._storage.getWorkouts();
        return {calorieLimit: this._calorieLimit, totalCalories: this._totalCalories, meals: this._meals, workouts: this._workouts}
    }
    _displayTotalCalories() {
        const _totalCaloriesElement = document.querySelector('#calories-total');
        _totalCaloriesElement.innerHTML = this._totalCalories;
    }
    _displayCalorieLimit() {
        const calorieLimitElement = document.querySelector('#calories-limit');
        calorieLimitElement.innerHTML = this._calorieLimit;
    }
    _displayCaloriesConsumed() {
        const caloriesConsumedElement = document.querySelector('#calories-consumed');
        const consumed = this._meals.reduce((total, meal) => total + meal.calories, 0);
        caloriesConsumedElement.innerHTML = consumed;
    }
    _displayCaloriesBurned() {
        const caloriesBurnedElement = document.querySelector('#calories-burned');
        const burned = this._workouts.reduce((total, workout) => total + workout.calories, 0);
        caloriesBurnedElement.innerHTML = burned;
    }
    _displayCaloriesRemaining() {
        const caloriesRemainingElement = document.querySelector('#calories-remaining');
        const caloriesProgressElement = document.querySelector('#calorie-progress');
        const remaining = this._calorieLimit - this._totalCalories;
        caloriesRemainingElement.innerHTML = remaining;
        if(remaining <= 0) {
            caloriesRemainingElement.parentElement.parentElement.classList.remove('bg-light');
            caloriesRemainingElement.parentElement.parentElement.classList.add('bg-danger');
            caloriesProgressElement.classList.remove('bg-success');
            caloriesProgressElement.classList.add('bg-danger');
        } else {
            caloriesRemainingElement.parentElement.parentElement.classList.remove('bg-danger');
            caloriesRemainingElement.parentElement.parentElement.classList.add('bg-light');
            caloriesProgressElement.classList.remove('bg-danger');
            caloriesProgressElement.classList.add('bg-success');
        }
    }
    _displayCaloriesProgress() {
        const caloriesProgressElement = document.querySelector('#calorie-progress');
        const percentage = this._totalCalories / this._calorieLimit * 100;
        const width = Math.min(percentage, 100);
        caloriesProgressElement.style.width = `${width}%`
    }
    _displayNewMeal(meal) {
        const mealsElement = document.querySelector('#meal-items');
        const mealElement = document.createElement('div');
        mealElement.classList.add('card', 'my-2');
        mealElement.setAttribute('data-id', meal.id);
        mealElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mx-1">${meal.name}</h4>
                    <div class="fs-1 bg-primary text-white text-center rounded-2 px-2 px-sm-5">
                        ${meal.calories}
                    </div>
                    <button class="delete btn btn-danger btn-sm mx-2">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
        mealsElement.appendChild(mealElement);
    }
    _displayNewWorkout(workout) {
        const workoutsElement = document.querySelector('#workout-items');
        const workoutElement = document.createElement('div');
        workoutElement.classList.add('card', 'my-2');
        workoutElement.setAttribute('data-id', workout.id);
        workoutElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mx-1">${workout.name}</h4>
                    <div class="fs-1 bg-secondary text-white text-center rounded-2 px-2 px-sm-5">
                        ${workout.calories}
                    </div>
                    <button class="delete btn btn-danger btn-sm mx-2">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
        workoutsElement.appendChild(workoutElement);
    }
    _render() {
        this._displayTotalCalories();
        this._displayCaloriesConsumed();
        this._displayCaloriesBurned();
        this._displayCaloriesRemaining();
        this._displayCaloriesProgress();
    }
}
class Meal {
    constructor(name, calories) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calories = calories;
    }
}
class Workout {
    constructor(name, calories) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calories = calories;
    }
}
class Storage {
    async getCalorieLimit() {
        try {
            const response = await EasyHTTP.get('http://localhost:3000/calorieLimit');
            return response.calories;
        } catch(error) {
            console.error('Error fetching calorie limit:', error);
            return 2000;
        }
    }
    async setCalorieLimit(calorieLimit) {
        try {
            await EasyHTTP.put('http://localhost:3000/calorieLimit', {calories: calorieLimit});
        } catch(error) {
            console.error('Error setting calorie limit:', error);
        }
    }
    async getTotalCalories() {
        try {
            const response = await EasyHTTP.get('http://localhost:3000/totalCalories');
            return response.calories;
        } catch(error) {
            console.error('Error fetching total calories:', error);
            return 0;
        }
    }
    async updateTotalCalories(calories) {
        try {
            await EasyHTTP.put('http://localhost:3000/totalCalories', { calories: calories });
        } catch(error) {
            console.error('Error updating total calories:', error);
        }
    }
    async getMeals() {
        try {
            const response = await EasyHTTP.get('http://localhost:3000/meals');
            return response;
        } catch(error) {
            console.error('Error fetching meals:', error);
            return [];
        }
    }
    async storeMeal(meal) {
        try {
            await EasyHTTP.post('http://localhost:3000/meals', meal);
        } catch(error) {
            console.error('Error storing meal:', error);
        }
    }
    async deleteMeal(id) {
        try {
            await EasyHTTP.delete(`http://localhost:3000/meals/${id}`);
        } catch(error) {
            console.error('Error deleting meal:', error);
        }
    }
    async getWorkouts() {
        try {
            const response = await EasyHTTP.get('http://localhost:3000/workouts');
            return response;
        } catch(error) {
            console.error('Error fetching workouts:', error);
            return [];
        }
    }
    async storeWorkout(workout) {
        try {
            await EasyHTTP.post('http://localhost:3000/workouts', workout);
        } catch(error) {
            console.error('Error storing workout:', error);
        }
    }
    async deleteWorkout(id) {
        try {
            await EasyHTTP.delete(`http://localhost:3000/workouts/${id}`);
        } catch(error) {
            console.error('Error deleting workout:', error);
        }
    }
    async clear() {
        this.setCalorieLimit(2000);
        this.updateTotalCalories(0);
        this._meals = await this.getMeals();
        this._workouts = await this.getWorkouts();
        this._meals.forEach(meal => this.deleteMeal(meal.id));
        this._workouts.forEach(workout => this.deleteWorkout(workout.id));
    }
}
class App {
    constructor() {
        BootswatchSelector.init('united');
        this._storage = new Storage();
        this._tracker = new CalorieTracker();
        this._loadEventListeners();
        this._tracker.loadItems();
    }
    _loadEventListeners() {
        document.querySelector('#meal-form').addEventListener('submit', this._newItem.bind(this, 'meal'));
        document.querySelector('#workout-form').addEventListener('submit', this._newItem.bind(this, 'workout'));
        document.querySelector('#meal-items').addEventListener('click', this._removeItem.bind(this, 'meal'));
        document.querySelector('#workout-items').addEventListener('click', this._removeItem.bind(this, 'workout'));
        document.querySelector('#filter-meals').addEventListener('keyup', this._filterItems.bind(this, 'meal'));
        document.querySelector('#filter-workouts').addEventListener('keyup', this._filterItems.bind(this, 'workout'));
        document.querySelector('#reset').addEventListener('click', this._reset.bind(this));
        document.querySelector('#limit-form').addEventListener('submit', this._setLimit.bind(this));
    }
    _newItem(type, event) {
        event.preventDefault();
        const name = document.querySelector(`#${type}-name`);
        const calories = document.querySelector(`#${type}-calories`);
        // validate inputs
        if(name.value === '' || calories.value === '') {
            alert('At least one field is empty.');
            return;
        }
        if(type === 'meal') {
            const meal = new Meal(name.value, +calories.value);
            this._tracker.addMeal(meal);
        } else {
            const workout = new Workout(name.value, +calories.value);
            this._tracker.addWorkout(workout);
        }
        name.value = '';
        calories.value = '';
        const collapseItem = document.querySelector(`#collapse-${type}`);
        const BootstrapCollapse = new bootstrap.Collapse(collapseItem, {
            toggle: false,
        });
        BootstrapCollapse.toggle();
    }
    _removeItem(type, event) {
        if(event.target.classList.contains('delete') || event.target.classList.contains('fa-xmark')) {
            if(confirm('Are you sure?')) {
                const id = event.target.closest('.card').getAttribute('data-id');
                console.log('Item ID to be deleted:', id);
                type === 'meal' ? this._tracker.removeMeal(id) : this._tracker.removeWorkout(id);
                event.target.closest('.card').remove();
            }
        }
    }
    _filterItems(type, event) {
        const text = event.target.value.toLowerCase();
        document.querySelectorAll(`#${type}-items .card`).forEach(item => {
            const name = item.firstElementChild.firstElementChild.textContent;
            if(name.toLowerCase().indexOf(text) !== -1) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    _reset() {
        this._tracker.reset();
        document.querySelector('#meal-items').innerHTML = '';
        document.querySelector('#workout-items').innerHTML = '';
        document.querySelector('#filter-meals').value = '';
        document.querySelector('#filter-workouts').value = '';
    }
    _setLimit(event) {
        event.preventDefault();
        const limit = document.querySelector('#limit');
        if(limit.value == '') {
            alert('You didn\'t enter a limit.');
            return;
        }
        this._tracker.setLimit(+limit.value);
        limit.value = '';
        const modalElement = document.querySelector('#limit-modal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    }
}
export default new App();