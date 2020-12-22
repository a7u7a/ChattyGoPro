import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {

  constructor() { }

  public parseAnnotations(rawAnnotations) {
    var annotations = {};
    rawAnnotations.forEach(annotation => {
      annotations[annotation._id] = {
        startDateEpoch: annotation.startDate,
        startDate: d3.timeParse("%Q")(annotation.startDate),
        endDateEpoch: annotation.endDate,
        endDate: d3.timeParse("%Q")(annotation.endDate),
        subtheme: annotation.subtheme,
        notes: annotation.notes,
        object: annotation.object,
        theme: annotation.theme
      };
    });
    return annotations;
  }

  public parseThemes(rawAnnotations) {
    // remove duplicates and sort alphabetically
    var themes = [];
    var c = 0;
    rawAnnotations.forEach(annotObj => {
      themes.push(annotObj.theme)
    });
    // sort alphabetically
    themes.sort((a, b) => a.localeCompare(b))
    // remove duplicates
    var themesSet = new Set(themes)
    var backToArray = [...themesSet]
    return backToArray
  }

  public parse_gpmf_miq(data) {
    var dataStreams = {
      gyro_x: [],
      gyro_y: [],
      gyro_z: [],
      accl_x: [],
      accl_y: [],
      accl_z: [],
      front_axle: [],
      rear_axle: [],
      g_force: [],
      rear_sensor: [],
      clusters: []
    };

    data.forEach((d: any) => {
      var date = d3.timeParse("%Q")(d.sensorData.sensor_data.time.timestamp);
      var sensorData = d.sensorData;

      dataStreams.gyro_x.push({ date: date, val: sensorData.sensor_data.gyroscope.x });
      dataStreams.gyro_y.push({ date: date, val: sensorData.sensor_data.gyroscope.y });
      dataStreams.gyro_z.push({ date: date, val: sensorData.sensor_data.gyroscope.z });
      dataStreams.accl_x.push({ date: date, val: sensorData.sensor_data.acceleration.x });
      dataStreams.accl_y.push({ date: date, val: sensorData.sensor_data.acceleration.y });
      dataStreams.accl_z.push({ date: date, val: sensorData.sensor_data.acceleration.z });
      dataStreams.front_axle.push({ date: date, val: sensorData.sensor_data.front_axle });
      dataStreams.rear_axle.push({ date: date, val: sensorData.sensor_data.rear_axle });
      dataStreams.g_force.push({ date: date, val: sensorData.sensor_data.g_force });
      dataStreams.rear_sensor.push({ date: date, val: sensorData.sensor_data.rear_sensor });
      if ('computed' in sensorData) {
        dataStreams.clusters.push({ date: date, val: sensorData.computed.fake_clusters });
      }
    });

    // Downsample streams
    var downsampleThres = 1000;
    Object.keys(dataStreams).forEach(function (key) {
      dataStreams[key] = this.largestTriangleThreeBucket(dataStreams[key], downsampleThres, "date", "val");
    }.bind(this));

    return dataStreams;
  }


  public parseMIQ(data) { // clearly not very elegant - could be improved

    var dataStreams = {
      fork_compression_p1: [],
      fork_compression_p2: [],
      fork_compression_gforce: [],
      fork_compression_slope3: [],
      fork_compression_slopeMax: [],
      fork_compression_pMaxSpeed: [],
      fork_rebound_p1: [],
      fork_rebound_p2: [],
      fork_rebound_gforce: [],
      fork_rebound_slope3: [],
      fork_rebound_slopeMax: [],
      fork_rebound_pMaxSpeed: [],
      shock_compression_p1: [],
      shock_compression_p2: [],
      shock_compression_gforce: [],
      shock_compression_slope3: [],
      shock_compression_slopeMax: [],
      shock_compression_pMaxSpeed: [],
      shock_rebound_p1: [],
      shock_rebound_p2: [],
      shock_rebound_gforce: [],
      shock_rebound_slope3: [],
      shock_rebound_slopeMax: [],
      shock_rebound_pMaxSpeed: [],
      clusters: []
    }

    data.forEach((d: any) => {
      var date = d3.timeParse("%Q")(d.sensorData.sensor_data.time.timestamp);
      var sensorData = d.sensorData;

      dataStreams.fork_compression_p1.push({ date: date, val: sensorData.sensor_data.fork_compression.p1 });
      dataStreams.fork_compression_p2.push({ date: date, val: sensorData.sensor_data.fork_compression.p2 });
      dataStreams.fork_compression_gforce.push({ date: date, val: sensorData.sensor_data.fork_compression.gforce });
      dataStreams.fork_compression_slope3.push({ date: date, val: sensorData.sensor_data.fork_compression.slope3 });
      dataStreams.fork_compression_slopeMax.push({ date: date, val: sensorData.sensor_data.fork_compression.slopeMax });
      dataStreams.fork_compression_pMaxSpeed.push({ date: date, val: sensorData.sensor_data.fork_compression.pMaxSpeed });
      dataStreams.fork_rebound_p1.push({ date: date, val: sensorData.fork_rebound.sensor_data.p1 });
      dataStreams.fork_rebound_p2.push({ date: date, val: sensorData.fork_rebound.sensor_data.p2 });
      dataStreams.fork_rebound_gforce.push({ date: date, val: sensorData.fork_rebound.sensor_data.gforce });
      dataStreams.fork_rebound_slope3.push({ date: date, val: sensorData.fork_rebound.sensor_data.slope3 });
      dataStreams.fork_rebound_slopeMax.push({ date: date, val: sensorData.fork_rebound.sensor_data.slopeMax });
      dataStreams.fork_rebound_pMaxSpeed.push({ date: date, val: sensorData.fork_rebound.sensor_data.pMaxSpeed });
      dataStreams.shock_compression_p1.push({ date: date, val: sensorData.shock_compression.sensor_data.p1 });
      dataStreams.shock_compression_p2.push({ date: date, val: sensorData.shock_compression.sensor_data.p2 });
      dataStreams.shock_compression_gforce.push({ date: date, val: sensorData.shock_compression.sensor_data.gforce });
      dataStreams.shock_compression_slope3.push({ date: date, val: sensorData.shock_compression.sensor_data.slope3 });
      dataStreams.shock_compression_slopeMax.push({ date: date, val: sensorData.shock_compression.sensor_data.slopeMax });
      dataStreams.shock_compression_pMaxSpeed.push({ date: date, val: sensorData.shock_compression.sensor_data.pMaxSpeed });
      dataStreams.shock_rebound_p1.push({ date: date, val: sensorData.shock_rebound.sensor_data.p1 });
      dataStreams.shock_rebound_p2.push({ date: date, val: sensorData.shock_rebound.sensor_data.p2 });
      dataStreams.shock_rebound_gforce.push({ date: date, val: sensorData.shock_rebound.sensor_data.gforce });
      dataStreams.shock_rebound_slope3.push({ date: date, val: sensorData.shock_rebound.sensor_data.slope3 });
      dataStreams.shock_rebound_slopeMax.push({ date: date, val: sensorData.shock_rebound.sensor_data.slopeMax });
      dataStreams.shock_rebound_pMaxSpeed.push({ date: date, val: sensorData.shock_rebound.sensor_data.pMaxSpeed });
      if ('computed' in sensorData) {
        dataStreams.clusters.push({ date: date, val: sensorData.computed.fake_clusters });
      }
    });

    var downsampleThres = 1000;
    Object.keys(dataStreams).forEach(function (key) {
      dataStreams[key] = this.largestTriangleThreeBucket(dataStreams[key], downsampleThres, "date", "val");
    }.bind(this));

    return dataStreams
  }

  public parseGoPro(data) {
    var dataStreams = {
      gyro_x: [],
      gyro_y: [],
      gyro_z: [],
      accl_x: [],
      accl_y: [],
      accl_z: [],
      gps_alt: [],
      clusters: []
    };

    data.forEach((d: any) => {
      var date = d3.timeParse("%Q")(d.sensorData.sensor_data.time.timestamp);
      var sensorData = d.sensorData;

      dataStreams.gyro_x.push({ date: date, val: sensorData.sensor_data.gyroscope.x });
      dataStreams.gyro_y.push({ date: date, val: sensorData.sensor_data.gyroscope.y });
      dataStreams.gyro_z.push({ date: date, val: sensorData.sensor_data.gyroscope.z });
      dataStreams.accl_x.push({ date: date, val: sensorData.sensor_data.acceleration.x });
      dataStreams.accl_y.push({ date: date, val: sensorData.sensor_data.acceleration.y });
      dataStreams.accl_z.push({ date: date, val: sensorData.sensor_data.acceleration.z });
      dataStreams.gps_alt.push({ date: date, val: sensorData.sensor_data.gps.alt });
      if ('computed' in sensorData) {
        dataStreams.clusters.push({ date: date, val: sensorData.computed.fake_clusters });
      }
    });

    // Downsample streams
    var downsampleThres = 1000;
    Object.keys(dataStreams).forEach(function (key) {
      dataStreams[key] = this.largestTriangleThreeBucket(dataStreams[key], downsampleThres, "date", "val");
    }.bind(this));

    return dataStreams;
  }

  public largestTriangleThreeBucket(data, threshold, xProperty, yProperty) {
    /**
     * This method is adapted from the 
     * "Largest Triangle Three Bucket" algorithm by Sveinn Steinarsson
     * In his 2013 Masters Thesis - "Downsampling Time Series for Visual Representation"
     * http://skemman.is/handle/1946/15343
     *
     * The MIT License
     *  
     * Copyright (c) 2013 by Sveinn Steinarsson
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     * --------------------------------------------------------------------------------------------------------
     */
    yProperty = yProperty || 0;
    xProperty = xProperty || 1;

    var m = Math.floor,
      y = Math.abs,
      f = data.length;

    if (threshold >= f || 0 === threshold) {
      return data;
    }

    var n = [],
      t = 0,
      p = (f - 2) / (threshold - 2),
      c = 0,
      v,
      u,
      w;

    n[t++] = data[c];

    for (var e = 0; e < threshold - 2; e++) {

      for (var g = 0,
        h = 0,
        a = m((e + 1) * p) + 1,
        d: number = m((e + 2) * p) + 1,
        d: number = d < f ? d : f,
        k = d - a; a < d; a++) {
        g += +data[a][xProperty], h += +data[a][yProperty];
      }

      for (var g = g / k,
        h = h / k,
        a = m((e + 0) * p) + 1,
        d = m((e + 1) * p) + 1,
        k = +data[c][xProperty],
        x = +data[c][yProperty],
        c = -1; a < d; a++) {
        "undefined" != typeof data[a] &&
          (u = .5 * y((k - g) * (data[a][yProperty] - x) - (k - data[a][xProperty]) * (h - x)),
            u > c && (c = u, v = data[a], w = a));
      }

      n[t++] = v;
      c = w;
    }

    n[t++] = data[f - 1];

    return n;
  };

}
