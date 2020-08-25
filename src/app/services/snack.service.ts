import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SnackService {
  constructor(private snackBar: MatSnackBar, private router: Router) {}

  authError() {
    this.showMessage('You must be logged in!', 'OK');

    return this.snackBar._openedSnackBarRef
      .onAction()
      .pipe(tap(() => this.router.navigate(['/login'])))
      .subscribe();
  }

  adminError() {
    this.showMessage('You must have admin role!', 'OK');

    return this.snackBar._openedSnackBarRef
      .onAction()
      .pipe(tap(() => this.router.navigate(['/'])))
      .subscribe();
  }

  showMessage(message: string, action?: string): void {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  processError<T>(error: T): void {
    if (typeof error === 'string') {
      this.showMessage(error);
    } else if (error instanceof Error) {
      this.showMessage(error.message);
      console.error(error);
    } else {
      this.showMessage('Failed to complete your action.');
      console.error(error);
    }
  }
}
