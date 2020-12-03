import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {

  constructor() { }

  public parseMIQ(data) { // clearly not very elegant - could be improved

    var fork_compression_p1 = [],
      fork_compression_p2 = [],
      fork_compression_gforce = [],
      fork_compression_slope3 = [],
      fork_compression_slopeMax = [],
      fork_compression_pMaxSpeed = [],
      fork_rebound_p1 = [],
      fork_rebound_p2 = [],
      fork_rebound_gforce = [],
      fork_rebound_slope3 = [],
      fork_rebound_slopeMax = [],
      fork_rebound_pMaxSpeed = [],
      shock_compression_p1 = [],
      shock_compression_p2 = [],
      shock_compression_gforce = [],
      shock_compression_slope3 = [],
      shock_compression_slopeMax = [],
      shock_compression_pMaxSpeed = [],
      shock_rebound_p1 = [],
      shock_rebound_p2 = [],
      shock_rebound_gforce = [],
      shock_rebound_slope3 = [],
      shock_rebound_slopeMax = [],
      shock_rebound_pMaxSpeed = []

    data.forEach((d: any) => {
      var date = d3.timeParse("%Q")(d.sensorData.sensor_data.time.timestamp);
      var sensorData = d.sensorData.sensor_data;

      fork_compression_p1.push({ date: date, val: sensorData.fork_compression.p1 });
      fork_compression_p2.push({ date: date, val: sensorData.fork_compression.p2 });
      fork_compression_gforce.push({ date: date, val: sensorData.fork_compression.gforce });
      fork_compression_slope3.push({ date: date, val: sensorData.fork_compression.slope3 });
      fork_compression_slopeMax.push({ date: date, val: sensorData.fork_compression.slopeMax });
      fork_compression_pMaxSpeed.push({ date: date, val: sensorData.fork_compression.pMaxSpeed });
      fork_rebound_p1.push({ date: date, val: sensorData.fork_compression.p1 });
      fork_rebound_p2.push({ date: date, val: sensorData.fork_compression.p2 });
      fork_rebound_gforce.push({ date: date, val: sensorData.fork_compression.gforce });
      fork_rebound_slope3.push({ date: date, val: sensorData.fork_compression.slope3 });
      fork_rebound_slopeMax.push({ date: date, val: sensorData.fork_compression.slopeMax });
      fork_rebound_pMaxSpeed.push({ date: date, val: sensorData.fork_compression.pMaxSpeed });
      shock_compression_p1.push({ date: date, val: sensorData.fork_compression.p1 });
      shock_compression_p2.push({ date: date, val: sensorData.fork_compression.p2 });
      shock_compression_gforce.push({ date: date, val: sensorData.fork_compression.gforce });
      shock_compression_slope3.push({ date: date, val: sensorData.fork_compression.slope3 });
      shock_compression_slopeMax.push({ date: date, val: sensorData.fork_compression.slopeMax });
      shock_compression_pMaxSpeed.push({ date: date, val: sensorData.fork_compression.pMaxSpeed });
      shock_rebound_p1.push({ date: date, val: sensorData.fork_compression.p1 });
      shock_rebound_p2.push({ date: date, val: sensorData.fork_compression.p2 });
      shock_rebound_gforce.push({ date: date, val: sensorData.fork_compression.gforce });
      shock_rebound_slope3.push({ date: date, val: sensorData.fork_compression.slope3 });
      shock_rebound_slopeMax.push({ date: date, val: sensorData.fork_compression.slopeMax });
      shock_rebound_pMaxSpeed.push({ date: date, val: sensorData.fork_compression.pMaxSpeed });
    });
  }

  public parseGoPro(data) {

    var dataStreams = {
      gyro_x: [],
      gyro_y: [],
      gyro_z: [],
      accl_x: [],
      accl_y: [],
      accl_z: [],
      gps_alt: []
    };

    data.forEach((d: any) => {
      var date = d3.timeParse("%Q")(d.sensorData.sensor_data.time.timestamp);
      var sensorData = d.sensorData.sensor_data;

      dataStreams.gyro_x.push({ date: date, val: sensorData.gyroscope.x });
      dataStreams.gyro_y.push({ date: date, val: sensorData.gyroscope.y });
      dataStreams.gyro_z.push({ date: date, val: sensorData.gyroscope.z });
      dataStreams.accl_x.push({ date: date, val: sensorData.acceleration.x });
      dataStreams.accl_y.push({ date: date, val: sensorData.acceleration.y });
      dataStreams.accl_z.push({ date: date, val: sensorData.acceleration.z });
      dataStreams.gps_alt.push({ date: date, val: sensorData.gps.alt });
    });

    // Downsample streams
    var downsampleThres = 1000;
    Object.keys(dataStreams).forEach(function (key) {
      // console.log("test",this.largestTriangleThreeBucket)  
      dataStreams[key] = this.largestTriangleThreeBucket(dataStreams[key], downsampleThres, "date", "val");
      // dataStreams[key] = "hrnlo";
    }.bind(this));

    return dataStreams;

    // var gyro_x = [],
    //   gyro_y = [],
    //   gyro_z = [],
    //   accl_x = [],
    //   accl_y = [],
    //   accl_z = [],
    //   gps_alt = [];

    // Downsample streams
    // var downsampleThres = 1000;
    // dataStreams.gyro_x = this.largestTriangleThreeBucket(dataStreams.gyro_x, downsampleThres, "date", "val");
    // dataStreams.gyro_y = this.largestTriangleThreeBucket(dataStreams.gyro_y, downsampleThres, "date", "val");
    // dataStreams.gyro_z = this.largestTriangleThreeBucket(dataStreams.gyro_z, downsampleThres, "date", "val");
    // dataStreams.accl_x = this.largestTriangleThreeBucket(dataStreams.accl_x, downsampleThres, "date", "val");
    // dataStreams.accl_y = this.largestTriangleThreeBucket(dataStreams.accl_y, downsampleThres, "date", "val");
    // dataStreams.accl_z = this.largestTriangleThreeBucket(dataStreams.accl_z, downsampleThres, "date", "val");
    // dataStreams.gps_alt = this.largestTriangleThreeBucket(dataStreams.gps_alt, downsampleThres, "date", "val");

    // compute domains
    // var gyro_domain = d3.extent(d3.extent(dataStreams.gyro_x, (d) => { return d.val }).concat(
    //   d3.extent(dataStreams.gyro_y, (d) => { return d.val; }),
    //   d3.extent(dataStreams.gyro_z, (d) => { return d.val; })));

    // var accl_domain = d3.extent(d3.extent(dataStreams.accl_x, (d) => { return d.val }).concat(
    //   d3.extent(dataStreams.accl_y, (d) => { return d.val }),
    //   d3.extent(dataStreams.accl_z, (d) => { return d.val })));

    // var alt_domain = d3.extent(dataStreams.gps_alt, d => { return d.val; });

    // any stream should do (not entirely sure tho!)
    // var date_domain = d3.extent(gyro_x, d => { return d.date; });

    // console.log("Current date domain", date_domain);

    // return {
    //   gyro: [gyro_x, gyro_y, gyro_z],
    //   accl: [accl_x, accl_y, accl_z],
    //   gps_alt: gps_alt,
    //   gyro_domain: gyro_domain,
    //   accl_domain: accl_domain,
    //   alt_domain: alt_domain,
    //   date_domain: date_domain
    // };
  }

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
