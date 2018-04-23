import { campus } from './../../models/campus';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  static readonly rotateTime = 200;
  static readonly rotateUpdateTime = 10;

  globe: any;
  canvas: HTMLCanvasElement;
  currentInterval: number;
  index = 0;
  campus = campus;
  currentLat;
  currentLng;

  constructor(
    public navCtrl: NavController,
    public zone: NgZone,
  ) {}

  rotateLat(country) {
    const lat1 = this.currentLng;
    const lat2 = country.lng;
    if (lat1 > lat2) {
      if (Math.abs(lat1 - lat2) >= 90 && Math.abs(lat1 - lat2) <= 180) {
        this.rotateLatToTop(country);
      } else {
        this.rotateLatToBottom(country);
      }
    } else {
      if (Math.abs(-lat1 + lat2) >= 90 && Math.abs(-lat1 + lat2) <= 180) {
        this.rotateLatToBottom(country);
      } else {
        this.rotateLatToTop(country);
      }
    }
  }

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
        this.globe.projection.rotate([-this.currentLng, -this.currentLat]);
      });
    }, HomePage.rotateUpdateTime);
  }

  rotateLngToRight(country) {
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
        this.globe.projection.rotate([-this.currentLng, -this.currentLat]);
      });
    }, HomePage.rotateUpdateTime);
  }

  rotateLatToTop(country) {
    console.log('Rotating to Top');
    const diference = Math.abs(this.currentLat - country.lat);
    const step = diference/(HomePage.rotateTime/HomePage.rotateUpdateTime);
    const interval = setInterval(() => {
      this.zone.run(() => {
        if (this.currentLat + step < country.lat) {
          this.currentLat += step;
        } else {
          this.currentLat = country.lat;
          clearInterval(interval);
        }
        this.globe.projection.rotate([-this.currentLng, -this.currentLat]);
      });
    }, HomePage.rotateUpdateTime);
  } 

  rotateLatToBottom(country) {
    console.log('rotating to bottom');
    const diference = Math.abs(this.currentLat - country.lat);
    const step = diference/(HomePage.rotateTime/HomePage.rotateUpdateTime);
    const interval = setInterval(() => {
      this.zone.run(() => {
        if (this.currentLat - step > country.lat) {
          this.currentLat -= step;
        } else {
          this.currentLat = country.lat;
          clearInterval(interval);
        } 
        this.globe.projection.rotate([-this.currentLng, -this.currentLat]);
      });
    }, HomePage.rotateUpdateTime);
  }

  onSwipe(ev) {
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
      this.rotateLat(country);
      this.rotateLng(country);
    }
    this.globe.plugins.pings.add(lng, lat, { color: '#0099FF', ttl: 2000, angle: Math.random() * 10 });
    this.currentInterval = setInterval(() => {
      this.globe.plugins.pings.add(lng, lat, { color: '#0099FF', ttl: 2000, angle: Math.random() * 10 });
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

    var somePlugin = function(planet) {
      planet.onDraw(function() {
        planet.withSavedContext(function(context) {
          context.beginPath();
          planet.path.context(context)({type: 'Sphere'});
          console.log(context);
          
          context.beginPath();
          context.moveTo(0,0);
          context.lineTo(180,0);
          context.stroke();
        });
      });
    };

    this.globe.loadPlugin(somePlugin);

    this.globe.loadPlugin(planetaryjs.plugins.pings());
    this.globe.loadPlugin(planetaryjs.plugins.zoom({
      scaleExtent: [100, 300]
    }));

    const country = this.campus[this.index];
    this.currentLat = country.lat;
    this.currentLng = country.lng;

    this.currentInterval = setInterval(() => {
      this.globe.plugins.pings.add(country.lng, country.lat, { color: '#0099FF', ttl: 2000, angle: Math.random() * 10 });
    }, 500);

    this.globe.projection.scale(175).translate([200, 200]).rotate([country.lng * -1, country.lat * -1]);
    this.canvas = document.getElementById('rotatingGlobe') as HTMLCanvasElement;
    this.globe.draw(this.canvas);
    
  }

  ionViewDidLoad() {
    this.initGlobe();
  }

}
