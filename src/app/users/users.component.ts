import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent {
  foo = 'Hello';
  bar = 'World';
  
  changeFn(e) {
    this.foo = e.target.value;
  }
  modelChangeFn(e) {
    this.bar = e;
  }

}
