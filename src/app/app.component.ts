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
      title: 'd3 chart',
      icon: 'bar-chart-outline',
      link: '/d3-chart'
    }
  ];

  constructor(private readonly sidebarService: NbSidebarService){
  }
  
  toggleSidebar():boolean {
    this.sidebarService.toggle();
    return false;
  }
}

