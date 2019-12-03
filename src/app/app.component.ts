import { Component, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4geodata_italyHigh from '@amcharts/amcharts4-geodata/italyHigh';
import FB_DATA from '../assets/all_fb.json';
import IG_DATA from '../assets/all_ig.json';
import TW_DATA from '../assets/all_tw.json';
import YT_DATA from '../assets/all_yt.json';
import FREQ from '../assets/freq_univ.json';

am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private chart: am4maps.MapChart;

  constructor(private zone: NgZone) {}

  private _prov = false;
  private _social = 'fb';

  readonly MAX_FREQUENZA = 5;
  readonly formula = `$$ V = \\frac{ \\frac{Followers}{Residenti} + \\frac{Frequenza\\_Post}{max\\_frequenza\\_post} }{2} $$`;

  mappaCollapse = true;
  noteCollapse = true;
  statsCollapse = true;

  private getColor(value: number): string {

    if (value === null || isNaN(value)) {
      return 'rgb(255, 255, 255)';
    }

    switch(this._social) {
      case 'fb':
        return 'rgba(0, 60, 143,     ' + (value + 0.2) + ')';
      case 'ig':
        return 'rgba(188, 24, 136,   ' + (value + 0.2) + ')';
      case 'tw':
        return 'rgba(29, 161, 242,   ' + (value + 0.2) + ')';
      case 'yt':
        return 'rgba(252, 1, 0,      ' + (value + 0.2) + ')';
      default:
        return 'rgba(255, 255, 255, 1)';
    }

  }

  onlyProv(value: boolean) {
    this._prov = value;
    this.loadChartData(null);
  }

  private getDataSocial(social: string) {
    switch(social) {
      case 'fb':
        return FB_DATA;
      case 'ig':
        return IG_DATA;
      case 'tw':
        return TW_DATA;
      case 'yt':
        return YT_DATA;
      default:
        return null;
    }
  }

  private getValue(i) {
    let param1 = (+i.Followers / +i.Residenti);

    if (isNaN(i.Followers)) {
      param1 = (+i.Likes / +i.Residenti);
    }

    if (this._social !== 'yt') {
      let frequenza = i.Frequenza != '' ? i.Frequenza.trim().toLowerCase() : i.Frequenza;
      frequenza = FREQ[frequenza] != null ? FREQ[frequenza] : 0;

      const param2 = frequenza / this.MAX_FREQUENZA;

      return (param1 + param2) / 2;
    } else {
      const param2 = +i['Numero di views totali'] / +i.Residenti;

      if (isNaN(param1)) {
        param1 = 0;
      }

      return (param1 + param2) / 2;
    }
  }

  loadChartData(social: string|null) {

    if (social) {
      this._social = social;
    }

    const SOCIAL_DATA = this.getDataSocial(this._social);
    const mapData = [];
    const province = ['Catania', 'Agrigento', 'Trapani', 'Enna', 'Ragusa', 'Caltanissetta', 'Siracusa', 'Palermo', 'Messina'];

    for (const i of SOCIAL_DATA) {
      if (this._prov && !province.includes(i['Nome Comune'])) {
        continue;
      }

      mapData.push({
        id: i['Prov.'] + '-' + i.Comune,
        name: i['Nome Comune'],
        value: i.Residenti,
        color: this.getColor(this.getValue(i)),
        latitude: i.Latitudine,
        longitude: i.Longitudine
      });
    }

    if (this.chart.series.length > 1) {
      this.chart.series.removeIndex(1);
    }

    const imageSeries = this.chart.series.push(new am4maps.MapImageSeries());
    imageSeries.data = mapData;
    imageSeries.dataFields.value = 'value';

    const imageTemplate = imageSeries.mapImages.template;
    imageTemplate.propertyFields.latitude = 'latitude';
    imageTemplate.propertyFields.longitude = 'longitude';
    imageTemplate.nonScaling = true;

    const circle = imageTemplate.createChild(am4core.Circle);
    circle.propertyFields.fill = 'color';
    circle.tooltipText = '{name}: [bold]{value}[/]';
    circle.horizontalCenter = 'middle';
    circle.verticalCenter = 'bottom';
    circle.align = 'left';
    circle.tooltipPosition = 'fixed';
    circle.tooltipX = 0;
    circle.tooltipY = 0;

    imageSeries.heatRules.push({
      target: circle,
      property: 'radius',
      min: 5,
      max: 40,
      dataField: 'value'
    });
  }

  private initChart(): void {

    if (this.chart) {
      this.chart.dispose();
    }

    const am4geodata_sicilyHigh = {
      type: 'FeatureCollection',
      features: [am4geodata_italyHigh.features[22]] // Sicily feature
    };

    const chart = am4core.create('chartdiv', am4maps.MapChart);
    chart.geodata = am4geodata_sicilyHigh;
    chart.projection = new am4maps.projections.Miller();

    const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.events.on('hit', (ev) => {
      chart.zoomToMapObject(ev.target);
    });

    this.chart = chart;
    this.loadChartData(null);
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

}
