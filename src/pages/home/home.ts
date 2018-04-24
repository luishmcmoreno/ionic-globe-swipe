import { campus } from './../../models/campus';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  static readonly rotateTime = 10;
  static readonly FIXEDLAT = -10;
  
  globe: any;
  isRotatingLeft: boolean = false;
  isRotatingRight: boolean = false;
  canvas: HTMLCanvasElement;
  currentInterval: number;
  index = 0;
  campus = campus;
  currentCountry;
  currentLat;
  currentLng;
  animationClasses = {
    slideInLeft: false,
    slideOutRight: false,
    slideOutLeft: false,
    slideInRight: false,
  };

  constructor(
    public navCtrl: NavController,
    public zone: NgZone,
  ) {}


  rotateLng(country) {
    const lng1 = this.currentLng;
    const lng2 = country.lng;
    if (lng1 > lng2) {
      if (Math.abs(lng1 - lng2) >= 180 && Math.abs(lng1 - lng2) <= 360) {
        this.rotateLngToRight(country);
      } else {
        this.rotateLngToLeft(country);
      }
    } else {
      if (Math.abs(-lng1 + lng2) >= 180 && Math.abs(-lng1 + lng2) <= 360) {
        this.rotateLngToLeft(country);
      } else {
        this.rotateLngToRight(country);
      }
    }
  }

  rotateLngToLeft(country) {
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.animationClasses.slideOutRight = true;
    setTimeout(() => {
      this.zone.run(() => {
        Object.keys(this.animationClasses).forEach((aClass) => {
          this.animationClasses[aClass] = false;
        });
        this.animationClasses.slideInLeft = true;
      });
    }, 400);
    this.isRotatingLeft = true;
  }

  rotateLngToRight(country) {
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.animationClasses.slideOutLeft = true;
    setTimeout(() => {
      this.zone.run(() => {
        Object.keys(this.animationClasses).forEach((aClass) => {
          this.animationClasses[aClass] = false;
        });
        this.animationClasses.slideInRight = true;
      });
    }, 400);
    this.isRotatingRight = true;
  }

  onSwipe(ev) {
    ev.preventDefault();
    if (ev.offsetDirection === 2) {
      this.index = (this.index + 1) % campus.length;
    } else if (ev.offsetDirection === 4) {
      this.index = (this.index - 1) % campus.length;
    }
    if (this.index < 0) {
      this.index = campus.length - 1;
    }
    this.loadCountry(this.campus[this.index]);
  }

  loadCountry(country) {
    const lat = country.lat;
    const lng = country.lng;

    clearInterval(this.currentInterval);
    if (this.currentLat && this.currentLng) {
      this.rotateLng(country);
    }
    this.globe.plugins.pings.add(lng, lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
    this.currentInterval = setInterval(() => {
      this.globe.plugins.pings.add(lng, lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
      this.globe.plugins.pings.add(lng, lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
      this.globe.plugins.pings.add(lng, lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
      this.globe.plugins.pings.add(lng, lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
      this.globe.plugins.pings.add(lng, lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
      this.globe.plugins.pings.add(lng, lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
    }, 500);
  }

  initGlobe() {
    this.globe = planetaryjs.planet();
    this.globe.loadPlugin(planetaryjs.plugins.earth({
      topojson: { file:   'assets/js/world-110m.json' },
      oceans:   { fill:   '#ffffff' },
      land:     { fill:   '#B9B9B9' },
      borders:  { stroke: '#ffffff' }
    }));
    
    this.globe.loadPlugin(planetaryjs.plugins.pings());
    this.globe.loadPlugin(planetaryjs.plugins.zoom({
      scaleExtent: [100, 300]
    }));

    let country = this.campus[this.index];
    this.currentLat = country.lat;
    this.currentLng = country.lng;

    this.currentInterval = setInterval(() => {
      this.globe.plugins.pings.add(country.lng, country.lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
    }, 500);

    this.globe.projection.scale(175).translate([200, 200]).rotate([country.lng * -1, HomePage.FIXEDLAT]);
    this.canvas = document.getElementById('rotatingGlobe') as HTMLCanvasElement;
    this.globe.draw(this.canvas);
    this.currentCountry = country;

    this.globe.onDraw(() => {
      if (!this.isRotatingLeft && !this.isRotatingRight) {
        return;
      }

      const diference = Math.abs(this.currentLng - country.lng);
      const step = diference/(HomePage.rotateTime);
      country = this.campus[this.index];

      // Rotating to Left
      if (this.currentLng - step > country.lng) {
        this.currentLng -= step;
      } else if (this.isRotatingLeft) {
        this.currentLng = country.lng;
        this.isRotatingLeft = false;
        this.currentCountry = country;
      }

      // Rotating to Right
      if (this.currentLng + step < country.lng) {
        this.currentLng += step;
      } else if (this.isRotatingRight) {
        this.currentLng = country.lng;
        this.isRotatingRight = false;
        this.currentCountry = country;
      }

      this.globe.projection.rotate([-this.currentLng, HomePage.FIXEDLAT]);
    });

  }

  ionViewDidLoad() {
    this.initGlobe();
  }

}
