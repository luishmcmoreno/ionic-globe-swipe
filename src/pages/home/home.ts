import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  globe: any;
  canvas: HTMLCanvasElement;
  currentInterval: number;
  currentCP = 'Campus Party Africa';

  constructor(public navCtrl: NavController) {

  }

  onSwipe(ev) {
    if (ev.offsetDirection === 2 || ev.offsetDirection === 4) {
      if (this.currentInterval) {
        clearInterval(this.currentInterval);
      }
    }
    if (ev.offsetDirection === 2) {
      this.changeToRight();
    } else if (ev.offsetDirection === 4) {
      this.changeToLeft();
    }
  }

  changeToLatLng(lng, lat) {
    console.log('changing to right');
    this.globe.projection.rotate([lng * - 1, lat * -1]);
    this.currentInterval = setInterval(() => {
      console.log('interval to right');
      this.globe.plugins.pings.add(lng, lat, { color: '#FFFF33', ttl: 2000, angle: Math.random() * 10 });
    }, 500);
  }

  changeToRight() {
    this.currentCP = 'Campus Party Japão';
    var lat = 39.3024886;
    var lng = 137.8805624;
    this.changeToLatLng(lng, lat);
  }

  changeToLeft() {
    var lat = -20.1793608;
    var lng = -46.9537133;
    console.log(this.globe.projection);
    this.globe.projection.rotate([lng * - 1, lat * -1]);
    this.currentCP = 'Campus Party Brasil';
    this.currentInterval = setInterval(() => {
      console.log('interval to left');
      this.globe.plugins.pings.add(lng, lat, { color: '#FFFF33', ttl: 2000, angle: Math.random() * 10 });
    }, 500);
  }

  initGlobe() {
    this.globe = planetaryjs.planet();
    console.log(this.globe);
    this.globe.loadPlugin(planetaryjs.plugins.earth({
      topojson: { file:   '/assets/js/world-110m.json' },
      oceans:   { fill:   '#000080' },
      land:     { fill:   '#339966' },
      borders:  { stroke: '#008000' }
    }));
    this.globe.loadPlugin(planetaryjs.plugins.pings());
    this.globe.loadPlugin(planetaryjs.plugins.zoom({
      scaleExtent: [100, 300]
    }));

    var lat = 13.0180523;
    var lng = 6.6422333;

    this.currentInterval = setInterval(() => {
      this.globe.plugins.pings.add(lng, lat, { color: '#FFFF33', ttl: 2000, angle: Math.random() * 10 });
    }, 500);

    this.globe.projection.scale(175).translate([200, 200]).rotate([lat, lng, 0]);
    this.canvas = document.getElementById('rotatingGlobe') as HTMLCanvasElement;
    this.globe.draw(this.canvas);
    
  }

  ionViewDidLoad() {
    console.log('oi');
    this.initGlobe();
  }

}
