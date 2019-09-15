import {Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild} from '@angular/core';
import {OpeningHours} from "../../../model/openingHours.model";
import {PlaceAddDto} from "../../../model/placeAddDto.model";
import {CategoryDto} from "../../../model/category.model";
import {LocationDto} from "../../../model/locationDto.model";
import {WeekDays} from "../../../model/weekDays.model";
import {PlaceWithUserModel} from "../../../model/placeWithUser.model";
import {ModalService} from "../_modal/modal.service";
import {CategoryService} from "../../../service/category.service";
import {UserService} from "../../../service/user/user.service";
import {NgForm} from "@angular/forms";
import {NgSelectComponent} from "@ng-select/ng-select";
import {MapsAPILoader, MouseEvent} from "@agm/core";
import {PlaceService} from "../../../service/place/place.service";
import {BreakTimes} from "../../../model/breakTimes.model";
import {MatDialog} from "@angular/material";

@Component({
  selector: 'app-propose-cafe',
  templateUrl: './propose-cafe.component.html',
  styleUrls: ['./propose-cafe.component.css']
})
export class ProposeCafeComponent implements OnInit {
  name: any;
  placeName: any;
  place: PlaceAddDto;
  location: LocationDto;
  openingHoursList: OpeningHours[] = [];
  weekDays: WeekDays[] = [WeekDays.MONDAY, WeekDays.TUESDAY, WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY,
    WeekDays.SATURDAY, WeekDays.SUNDAY];
  openingHours: OpeningHours = new OpeningHours();
  breakTimes: BreakTimes = new BreakTimes();
  categories: any;
  category: CategoryDto;
  string: null;
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  submitButtonEnabled: boolean;
  isBreakTime = false;

  @Output() newPlaceEvent = new EventEmitter<PlaceWithUserModel>();
  @ViewChild('saveForm', {static: true}) private saveForm: NgForm;
  @ViewChild(NgSelectComponent, {static: true}) ngSelectComponent: NgSelectComponent;
  @ViewChild('search', {static: true})
  public searchElementRef: ElementRef;

  addTypeCategory = (term) => ({name: term});

  constructor(private modalService: ModalService, private placeService: PlaceService, private categoryService: CategoryService,
              private uService: UserService, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    this.category = new CategoryDto();
    this.location = new LocationDto();
    this.place = new PlaceAddDto();
    this.place.category = this.category;
    this.submitButtonEnabled = true;
  }

  ngOnInit() {
    console.log(this.place.openingHoursList);
    this.categoryService.findAllCategory().subscribe(data => {
      this.categories = data;
    });

    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['address']
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //  set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  add(openingHours: OpeningHours, breakTimes: BreakTimes) {
    console.log(openingHours);
    if (openingHours.closeTime < openingHours.openTime || breakTimes.endTime < breakTimes.startTime) {
      alert('Second time have to be late than first. Please, try again.');
      return;
    }

    let openingHours1 = new OpeningHours();
    openingHours1.closeTime = openingHours.closeTime;
    openingHours1.openTime = openingHours.openTime;
    openingHours1.weekDay = openingHours.weekDay;
    if (breakTimes.endTime && breakTimes.startTime !== undefined) {
      if (breakTimes.startTime > openingHours1.openTime && breakTimes.endTime < openingHours1.closeTime) {
        console.log(openingHours1.breakTime);
        console.log(breakTimes);
        openingHours1.breakTime = breakTimes;
        console.log(openingHours1.breakTime);
      } else {
        alert('Invalid break time.');
        return;
      }
    }
    let weekDaysNew: WeekDays[] = [];
    this.weekDays.forEach(val => {
      if (val !== openingHours1.weekDay) {
        weekDaysNew.push(val);
        console.log(this.weekDays);
      }
    });
    this.weekDays = weekDaysNew;
    console.log(openingHours1);
    this.openingHoursList.push(openingHours1);
    this.openingHours = new OpeningHours();
    this.breakTimes = new BreakTimes();
    console.log(this.openingHoursList);
    this.isBreakTime = false;
  }

  switch() {
    console.log('switch');
    this.isBreakTime = !this.isBreakTime;
  }

  delete(openingHours: OpeningHours) {
    this.openingHoursList = this.openingHoursList.filter(item => item !== openingHours);
  }

  onSubmit() {
    this.submitButtonEnabled = false;
    this.place.openingHoursList = this.openingHoursList;
    this.place.category.name = this.name;
    this.location.address = this.address;
    this.location.lat = this.latitude;
    this.location.lng = this.longitude;
    this.place.location = this.location;
    this.place.name = this.placeName;
    console.log(this.place);
    this.placeService.save(this.place);
    this.closeModal('custom-_modal-1');
  }

  closeModal(id: string) {
    this.modalService.close(id);
    this.saveForm.onReset();
    console.log(this.openingHoursList);
    this.ngSelectComponent.handleClearClick();
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({location: {lat: latitude, lng: longitude}}, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }
}
