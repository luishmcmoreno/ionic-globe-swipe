import { campus } from './../../models/campus';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  static readonly rotateTime = 50;
  static readonly rotateUpdateTime = 1;
  static readonly FIXEDLAT = -10;
  
  globe: any;
  canvas: HTMLCanvasElement;
  currentInterval: number;
  index = 0;
  campus = campus;
  currentLat;
  currentLng;
  intervals: number[] = [];
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
    this.animationClasses.slideOutRight = true;
    setTimeout(() => {
      this.zone.run(() => {
        Object.keys(this.animationClasses).forEach((aClass) => {
          this.animationClasses[aClass] = false;
        });
        this.animationClasses.slideInLeft = true;
      });
    }, 400);
    console.log('rotating to left');
    const diference = Math.abs(this.currentLng - country.lng);
    const step = diference/(HomePage.rotateTime/HomePage.rotateUpdateTime);
    const interval = setInterval(() => {
      this.zone.run(() => {
        if (this.currentLng - step > country.lng) {
          this.currentLng -= step;
        } else {
          this.currentLng = country.lng;
          clearInterval(interval);
        }
        this.globe.projection.rotate([-this.currentLng, HomePage.FIXEDLAT]);
      });
    }, HomePage.rotateUpdateTime);
    this.intervals.push(interval);
  }

  rotateLngToRight(country) {
    this.animationClasses.slideOutLeft = true;
    setTimeout(() => {
      this.zone.run(() => {
        Object.keys(this.animationClasses).forEach((aClass) => {
          this.animationClasses[aClass] = false;
        });
        this.animationClasses.slideInRight = true;
      });
    }, 400);
    console.log('rotating to right');
    const diference = Math.abs(this.currentLng - country.lng);
    const step = diference/(HomePage.rotateTime/HomePage.rotateUpdateTime);
    const interval = setInterval(() => {
      this.zone.run(() => {
        if (this.currentLng + step < country.lng) {
          this.currentLng += step;
        } else {
          this.currentLng = country.lng;
          clearInterval(interval);
        }
        this.globe.projection.rotate([-this.currentLng, HomePage.FIXEDLAT]);
      });
    }, HomePage.rotateUpdateTime);
    this.intervals.push(interval);
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
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    clearInterval(this.currentInterval);
    if (this.currentLat && this.currentLng) {
      this.rotateLng(country);
    }
    this.intervals = [];
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

    // var somePlugin = function(planet) {
    //   planet.onDraw(function() {
    //     planet.withSavedContext(function(context) {
    //       context.beginPath();
    //       planet.path.context(context)({type: 'Sphere'});
    //       console.log(context);
          
    //       context.beginPath();
    //       context.moveTo(0,0);
    //       context.lineTo(180,0);
    //       context.stroke();
    //     });
    //   });
    // };

    // this.globe.loadPlugin(somePlugin);

    this.globe.loadPlugin(planetaryjs.plugins.pings());
    this.globe.loadPlugin(planetaryjs.plugins.zoom({
      scaleExtent: [100, 300]
    }));

    const country = this.campus[this.index];
    this.currentLat = country.lat;
    this.currentLng = country.lng;

    this.currentInterval = setInterval(() => {
      this.globe.plugins.pings.add(country.lng, country.lat, { color: '#ee3442', ttl: 2000, angle: Math.random() * 10 });
    }, 500);

    this.globe.projection.scale(175).translate([200, 200]).rotate([country.lng * -1, HomePage.FIXEDLAT]);
    this.canvas = document.getElementById('rotatingGlobe') as HTMLCanvasElement;
    this.globe.draw(this.canvas);
    
  }

  ionViewDidLoad() {
    this.initGlobe();
  }

}
