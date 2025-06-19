import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, Observable, combineLatest, forkJoin } from 'rxjs';
import { filter, map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MockDataService } from './mock-data.service';

interface Character {
  name: string;
  [key: string]: any;
}

interface Planet {
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  searchTermByCharacters = new Subject<string>();
  charactersResults$!: Observable<Character[]>;
  planetAndCharactersResults$!: Observable<(Character | Planet)[]>;
  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.initLoadingState();
    this.initCharacterEvents();
  }

  changeCharactersInput(element: Event): void {
    const target = element.target as HTMLInputElement;
    const inputValue: string = target.value;
    // YOUR CODE STARTS HERE
    this.searchTermByCharacters.next(inputValue);
    // YOUR CODE ENDS HERE
  }

  initCharacterEvents(): void {
    this.charactersResults$ = this.searchTermByCharacters
        .pipe(
        // YOUR CODE STARTS HERE
        filter((searchTerm: string) => searchTerm.length >= 3),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => this.mockDataService.getCharacters(searchTerm))
        // YOUR CODE ENDS HERE
        );
  }

  loadCharactersAndPlanet(): void {
    // YOUR CODE STARTS HERE
    this.planetAndCharactersResults$ = forkJoin({
      characters: this.mockDataService.getCharacters(''),
      planets: this.mockDataService.getPlanets()
    }).pipe(
      map((results: { characters: Character[], planets: Planet[] }) => [
        ...results.characters,
        ...results.planets
      ])
    );
    // YOUR CODE ENDS HERE
  }

  initLoadingState(): void {
    // YOUR CODE STARTS HERE
    const loadingSubscription = combineLatest([
      this.mockDataService.getCharactersLoader(),
      this.mockDataService.getPlanetLoader()
    ]).subscribe((loadingStates: boolean[]) => {
      this.isLoading = this.areAllValuesTrue(loadingStates);
    });
    
    this.subscriptions.push(loadingSubscription);
    // YOUR CODE ENDS HERE
  }

  ngOnDestroy(): void {
    // YOUR CODE STARTS HERE
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    // YOUR CODE ENDS HERE
  }

  areAllValuesTrue(elements: boolean[]): boolean {
    return elements.every((el: boolean) => el);
  }
}