import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {

  constructor() { }


  public parseGoProData(data){
    console.log(data);
    var gyro_x = [],
        gyro_y = [],
        gyro_z = [],
        accl_x = [],
        accl_y = [],
        accl_z = [],
        gps_alt= [];

    data.forEach((d:any) => {
      var date = d3.timeParse("%Q")(d.sensorData.sensor_data.time.timestamp);
      var sensorData = d.sensorData.sensor_data;

      gyro_x.push({date: date, val: sensorData.gyroscope.x});
      gyro_y.push({date: date, val: sensorData.gyroscope.y});
      gyro_z.push({date: date, val: sensorData.gyroscope.z});
      accl_x.push({date: date, val: sensorData.acceleration.x});
      accl_y.push({date: date, val: sensorData.acceleration.y});
      accl_z.push({date: date, val: sensorData.acceleration.z});
      gps_alt.push({date: date, val: sensorData.gps.alt});
    });

    // Downsample streams
    var downsampleThres = 6000;
    gyro_x = this.largestTriangleThreeBucket(gyro_x, downsampleThres, "date", "val");
    gyro_y = this.largestTriangleThreeBucket(gyro_y, downsampleThres, "date", "val");
    gyro_z = this.largestTriangleThreeBucket(gyro_z, downsampleThres, "date", "val");
    accl_x = this.largestTriangleThreeBucket(accl_x, downsampleThres, "date", "val");
    accl_y = this.largestTriangleThreeBucket(accl_y, downsampleThres, "date", "val");
    accl_z = this.largestTriangleThreeBucket(accl_z, downsampleThres, "date", "val");
    gps_alt = this.largestTriangleThreeBucket(gps_alt, downsampleThres, "date", "val");

    // Compute domains
    var gyro_domain = d3.extent(d3.extent(gyro_x, (d) => { return d.val }).concat(
                      d3.extent(gyro_y, (d) => { return d.val; }),
                      d3.extent(gyro_z, (d) => { return d.val; })));

    var accl_domain = d3.extent(d3.extent(accl_x, (d) => { return d.val }).concat(
                        d3.extent(accl_y, (d) => { return d.val }),
                        d3.extent(accl_z, (d) => { return d.val })));

    var alt_domain = d3.extent(gps_alt, d => { return d.val; });

    // Any stream should do (not entirely sure tho!)
    var date_domain = d3.extent(gyro_x, d => { return d.date; });
    console.log("date domain", date_domain);

    return {gyro:[gyro_x, gyro_y, gyro_z],
            accl:[accl_x, accl_y, accl_z],
            gps_alt: gps_alt,
            gyro_domain: gyro_domain,
            accl_domain: accl_domain,
            alt_domain: alt_domain,
            date_domain: date_domain};    
  }

  private largestTriangleThreeBucket(data, threshold, xProperty, yProperty) {
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
                d:number = m((e + 2) * p) + 1,
                d:number = d < f ? d : f,
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
