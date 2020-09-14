import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  user: User;
  
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.userStatus.subscribe((usr) => {
      this.user = usr;
    })
  }

}
