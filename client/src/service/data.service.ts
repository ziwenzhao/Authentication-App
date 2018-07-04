import { Subject } from 'rxjs';
import { Recipe } from '../models/recipe.model';

export class DataService {

    // The event of togglling recipe favorite. 
    // It can both emit an event and be subscribed, which can be used to transfer data between differnet pages and components.
    public toggleFavSubject = new Subject<{ value: boolean, recipe: Recipe }>();
}