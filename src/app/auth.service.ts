import { Injectable } from '@angular/core';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User = new User();
  userStatus = new BehaviorSubject<User>(this.currentUser);

  constructor(private socialAuth: SocialAuthService) { }

  async doLogin() {
    // Login success
    try {
      let socialUser = await this.socialAuth.signIn(GoogleLoginProvider.PROVIDER_ID);
      this.currentUser.setUser(true, socialUser);
      console.log(JSON.stringify(socialUser));
      this.userStatus.next(this.currentUser);
    } catch {

    }
  }
  // checkLogin(){ }  - Pull model

  doRegister() {

  }

  async doLogout() {
    await this.socialAuth.signOut();
    this.currentUser.setUser(false, null);
    this.userStatus.next(this.currentUser);
  }

}

export class User {
  isLoggedIn: boolean = false;
  details: any = null;
  setUser(isLoggedIn, details) {
    this.isLoggedIn = isLoggedIn;
    this.details = details;
  }
}
