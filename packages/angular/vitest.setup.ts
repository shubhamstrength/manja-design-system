// Pulls in the JIT compiler so TestBed can compile the test host components.
// Library code itself is AOT-compiled by ng-packagr and never needs this.
import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
