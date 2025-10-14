// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

import { mount } from 'cypress/react18';
import { getStore } from '../../src/services/store';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { MountOptions, MountReturn } from 'cypress/react';
import { EnhancedStore } from '@reduxjs/toolkit';
import { RootState } from '../../src/services/store';
import {
  BrowserRouter,
  BrowserRouterProps,
  MemoryRouter,
  MemoryRouterProps
} from 'react-router-dom';

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount(
        component: ReactNode,
        options?: MountOptions & { reduxStore?: EnhancedStore<RootState> } & {
          routerProps?: MemoryRouterProps;
        }
      ): Cypress.Chainable<MountReturn>;
    }
  }
}

Cypress.Commands.add('mount', (component, options = {}) => {
  const {
    reduxStore = getStore(),
    routerProps = { initialEntries: ['/'] },
    ...mountOptions
  } = options;

  const wrapped = (
    <MemoryRouter {...routerProps}>
      <Provider store={reduxStore}>{component}</Provider>
    </MemoryRouter>
  );

  return mount(wrapped, mountOptions);
});

// Example use:
// cy.mount(<MyComponent />)
