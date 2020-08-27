import { Component } from '@angular/core';
import { NbSidebarService, NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'nebulartest';

  items: NbMenuItem[] =[
    {
      title: 'Home',
      icon: 'home-outline',
      link: '/home',
      home: true
    },
    {
      title: 'Users',
      icon: 'people-outline',
      link: '/users'
    },
    {
      title: 'Base example',
      icon: 'bar-chart-outline',
      link: '/d3-chart'
    },
    {
      title: 'Dots + Axis',
      icon: 'bar-chart-2-outline',
      link: '/d3-time-series'
    },
    {
      title: 'Multi-line',
      icon: 'bar-chart-2-outline',
      link: '/multi-line'
    },
    {
      title: 'Simple brush zoom',
      icon: 'bar-chart-2-outline',
      link: '/simple-zoom'
    }
  ];

  constructor(private readonly sidebarService: NbSidebarService){
  }
  
  toggleSidebar():boolean {
    this.sidebarService.toggle();
    return false;
  }
}

