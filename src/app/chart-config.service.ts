import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartConfigService {

  constructor() { }

  public streamIds = {
    goPro: ["acceleration", "gyroscope", "gps"],
    miq: ["fork_compression", "fork_rebound", "shock_compression", "shock_rebound"],
    gpmf_miq: ["acceleration", "gyroscope","front_axle","rear_axle","g_force","rear_sensor"]
  }

  public configs = [
    {
      name: 'GoPro chart',
      parser: 'gopro', 
      streamIds: this.streamIds.goPro, // List of fields to add in request
      clusterView: true,
      contextView: {
        streamId: 'gps_alt', // use variable name as apperas in data-parser
        streamLabel: 'Altitude',
        lineColor: '#e41a1c',
      },
      focusCharts: [
        {
          name: 'Acceleration (m/s2)',
          id: 'f1',
          height: 100,
          streams: [
            {
              streamId: 'accl_x',
              streamLabel: 'x',
              lineColor: '#e41a1c'
            },
            {
              streamId: 'accl_y',
              streamLabel: 'y',
              lineColor: '#377eb8'
            },
            {
              streamId: 'accl_z',
              streamLabel: 'z',
              lineColor: '#4daf4a'
            }
          ]
        },
        {
          name: 'Gyroscope (rad/s)',
          id: 'f2',
          height: 170,
          streams: [
            {
              streamId: 'gyro_x',
              streamLabel: 'x',
              lineColor: '#e41a1c'
            },
            {
              streamId: 'gyro_y',
              streamLabel: 'y',
              lineColor: '#377eb8'
            },
            {
              streamId: 'gyro_z',
              streamLabel: 'z',
              lineColor: '#4daf4a'
            }
          ]
        },
        {
          name: 'Altitude',
          id: 'f3',
          height: 170,
          streams: [
            {
              streamId: 'gps_alt',
              streamLabel: '(mts)',
              lineColor: '#e41a1c'
            }
          ]
        },
      ]
    },
    {
      name: "MIQ chart",
      parser: "miq",
      streamIds: this.streamIds.miq,
      clusterView: false,
      contextView: {
        streamId: 'shock_compression_slope3', // simply use name of variable available 
        streamLabel: 'Slope',
        lineColor: '#e41a1c',
      },
      focusCharts: [
        {
          name: 'Fork compression',
          id: 'f1',
          height: 170,
          streams: [
            {
              streamId: 'fork_compression_p1',
              streamLabel: 'p1',
              lineColor: '#e41a1c'
            },
            {
              streamId: 'fork_compression_p2',
              streamLabel: 'p2',
              lineColor: '#377eb8'
            },
            {
              streamId: 'fork_compression_gforce',
              streamLabel: 'gforce',
              lineColor: '#4daf4a'
            }
          ]
        },
        {
          name: 'Shock rebound',
          id: 'f2',
          height: 80,
          streams: [
            {
              streamId: 'shock_rebound_pMaxSpeed',
              streamLabel: 'pMaxSpeed',
              lineColor: '#e41a1c'
            }
          ]
        },
        {
          name: 'Shock compression',
          id: 'f3',
          height: 170,
          streams: [
            {
              streamId: 'shock_compression_p1',
              streamLabel: 'p1',
              lineColor: '#e41a1c'
            },
            {
              streamId: 'shock_compression_p2',
              streamLabel: 'p2',
              lineColor: '#377eb8'
            },
            {
              streamId: 'shock_compression_gforce',
              streamLabel: 'gforce',
              lineColor: '#4daf4a'
            }
          ]
        },

      ]
    },
    {
      name: "GoPro + MIQ chart",
      parser: "parse_gpmf_miq",
      streamIds: this.streamIds.gpmf_miq,
      clusterView: false,
      contextView: {
        streamId: 'front_axle', // simply use name of variable available 
        streamLabel: 'Front Axle',
        lineColor: '#e41a1c',
      },
      focusCharts: [
        {
          name: 'Acceleration (m/s2)',
          id: 'f1',
          height: 80,
          streams: [
            {
              streamId: 'accl_x',
              streamLabel: 'x',
              lineColor: '#e41a1c'
            },
            {
              streamId: 'accl_y',
              streamLabel: 'y',
              lineColor: '#377eb8'
            },
            {
              streamId: 'accl_z',
              streamLabel: 'z',
              lineColor: '#4daf4a'
            }
          ]
        },
        {
          name: 'Gyroscope (rad/s)',
          id: 'f2',
          height: 80,
          streams: [
            {
              streamId: 'gyro_x',
              streamLabel: 'x',
              lineColor: '#e41a1c'
            },
            {
              streamId: 'gyro_y',
              streamLabel: 'y',
              lineColor: '#377eb8'
            },
            {
              streamId: 'gyro_z',
              streamLabel: 'z',
              lineColor: '#4daf4a'
            }
          ]
        },
        {
          name: 'Front Axle',
          id: 'f3',
          height: 80,
          streams: [
            {
              streamId: 'front_axle',
              lineColor: '#E74C3C'
            }
          ]
        },
        {
          name: 'Rear Axle',
          id: 'f4',
          height: 80,
          streams: [
            {
              streamId: 'rear_axle',
              lineColor: '#A569BD'
            }
          ]
        },
        {
          name: 'G force',
          id: 'f5',
          height: 80,
          streams: [
            {
              streamId: 'g_force',
              lineColor: '#2E86C1'
            }
          ]
        },
        {
          name: 'Rear Sensor',
          id: 'f6',
          height: 80,
          streams: [
            {
              streamId: 'rear_sensor',
              lineColor: '#F5B041'
            }
          ]
        }
      ]
    }
  ]
}

/*
chatty = {
  'speaker':id,  #TODO: Fix IDs!
  'sensors': {
      'acceleration': {
          'x':row['acceleration_x'],
          'y':row['acceleration_y'],
          'z':row['acceleration_z']
      },
      "gyroscope":{ # TODO: check against description
          'x':row['gyroscope_x'],
          'y':row['gyroscope_y'],
          'z':row['gyroscope_z']
      },
      "orientation":{ #TODO: check against description
          'x':row['orientation_x'],
          'y':row['orientation_y'],
          'z':row['orientation_z'],
      },
      "shutter":row['orientation_z'],
      "image_uniformity":row['image_uniformity'],
      "front_axle": row['front_axle'],
      "rear_axle":row['rear_axle'],
      "g_force":row['g_force'],
      "rear_sensor":row['rear_sensor'],
      "time": {
          'timestamp':int(row['timestamp'])
      },
      "status": {
          "status":"offline"
      }
  }
}
*/