import { Component } from '@angular/core';
import { NbSidebarService, NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ChattyGoPro';

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
      title: 'GoPro Explorer',
      icon: 'bar-chart-2-outline',
      link: '/focus1'
    }
  ];

  constructor(private readonly sidebarService: NbSidebarService){
  }
  
  toggleSidebar():boolean {
    this.sidebarService.toggle();
    return false;
  }
}

