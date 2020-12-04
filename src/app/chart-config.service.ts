import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartConfigService {

  constructor() { }

  public streamIds = {
    goPro: ["acceleration", "gyroscope", "gps"],
    miq: ["fork_compression", "fork_rebound", "shock_compression", "shock_rebound"]
  }


  public configs = [
    // list with all required streams
    {
      name: 'Edinburgh',
      parser: 'gopro', // or parseMIQ
      streamIds: this.streamIds.goPro,
      contextView: {
        streamId: 'gps_alt', // use variable name
        lineColor: '#e41a1c',
      },
      focusCharts: [
        {
          name: 'Acceleration (m/s2)',
          id: 'f1',
          height: 170,
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
      name: "Cardiff",
      parser: "miq",
      streamIds: this.streamIds.miq,
      contextView: {
        streamId: 'gps_alt', // simply use name of variable available 
        streamColor: '#e41a1c',
      }
    }

  ]
}


'gyro_y'
'gyro_z'

'accl_x'
'accl_y'
'accl_z'


// // Example
// // check wiki for list of available streamId’s
// contextView: {
//     streamId: ‘gps_alt’,
//     streamColor: <hexColor>}
// focus: {
//             focusLabel:  ‘Acceleration (m/s2)’,
// streams : [
// {streamId: accel_y,
// streamLabel: ‘y,
// streamColor: <hexColor>},
// {streamId: accel_x,
// streamLabel: ‘x,
// streamColor: <hexColor>},
// {streamId: accel_z,
// streamLabel: ‘z,
// streamColor: <hexColor>}]
//                 }
//                 focus: ..
// focus: ..

/*{

chatty = {
    'speaker': id,
    'sensors': {
        'fork_compression': {
            'p1': row['p1_fork_c'],
            'p2': row['p2_fork_c'],
            'gforce': row['gforce_fork_c'],
            'slope3': row['slope3_fork_c'],
            'slopeMax': row['slopeMax_fork_c'],
            'pMaxSpeed': row['pMaxSpeed_fork_c'],
        },
        "fork_rebound": {
            'p1': row['p1_fork_r'],
            'p2': row['p2_fork_r'],
            'gforce': row['gforce_fork_r'],
            'slope3': row['slope3_fork_r'],
            'slopeMax': row['slopeMax_fork_r'],
            'pMaxSpeed': row['pMaxSpeed_fork_r'],
        },
        "shock_compression": {
            'p1': row['p1_shock_c'],
            'p2': row['p2_shock_c'],
            'gforce': row['gforce_shock_c'],
            'slope3': row['slope3_shock_c'],
            'slopeMax': row['slopeMax_shock_c'],
            'pMaxSpeed': row['pMaxSpeed_shock_c'],
        },
        "shock_rebound": {
            'p1': row['p1_shock_r'],
            'p2': row['p2_shock_r'],
            'gforce': row['gforce_shock_r'],
            'slope3': row['slope3_shock_r'],
            'slopeMax': row['slopeMax_shock_r'],
            'pMaxSpeed': row['pMaxSpeed_shock_r'],
        },
        "time": {
            'timestamp': int(row['timestamp'])
        },
        "status": {
            "status": "offline"
        }
    }
}

// Example
// check wiki for list of available streamId’s
contextView: {
    streamId: ‘gps_alt’,
    streamColor: <hexColor>}
focus: {
            focusLabel:  ‘Acceleration (m/s2)’,
streams : [
{streamId: accel_y,
streamLabel: ‘y,
streamColor: <hexColor>},
{streamId: accel_x,
streamLabel: ‘x,
streamColor: <hexColor>},
{streamId: accel_z,
streamLabel: ‘z,
streamColor: <hexColor>}]
                }
                focus: ..
focus: .. }*/