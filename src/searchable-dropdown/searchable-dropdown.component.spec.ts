/*
 * This file is part of ng2-json-editor.
 * Copyright (C) 2016 CERN.
 *
 * ng2-json-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * ng2-json-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ng2-json-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
*/

import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { SearchableDropdownComponent } from './searchable-dropdown.component';

import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { FilterByPrefixPipe } from '../shared/pipes';

describe('SearchableDropdownComponent', () => {

  let fixture: ComponentFixture<SearchableDropdownComponent>;
  let component: SearchableDropdownComponent;
  let nativeEl: HTMLElement;
  let inputEl: HTMLInputElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SearchableDropdownComponent
      ],
      providers: [
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchableDropdownComponent);
    component = fixture.componentInstance;
    component.value = 'default';
    component.items = [];
    fixture.detectChanges();

    nativeEl = fixture.nativeElement;
    inputEl = nativeEl
      .querySelector('input') as HTMLInputElement;
  })

  it('should map shortcut to correct value when pressed enter', () => {
    component.shortcutMap = {
      s: 'shortcut'
    };

    // input change, to update component.prefix;
    inputEl.value = 's';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // trigger Enter key press
    let enterPressedEvent = new Event('keypress');
    enterPressedEvent['key'] = 'Enter';
    inputEl.dispatchEvent(enterPressedEvent);

    expect(component.value).toEqual('shortcut');
  });

  it('should show all items if prefix is empty', () => {
    // set enum.items
    let items = ['First', 'Second'];
    component.items = items;
    fixture.detectChanges();
    let dropdownItems = Array.prototype
      .slice.call(nativeEl.querySelectorAll('.dropdown-item'))
      .map((item: HTMLElement) => item.textContent);
    expect(dropdownItems).toEqual(items);
  });

  it('should show filtered items by pipe if prefix is not empty', () => {
    component.items = ['a1', 'a2', 'b1'];
    let itemsStartsWithA = ['a1', 'a2'];
    inputEl.value = 'a';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    let dropdownItems = Array.prototype
      .slice.call(nativeEl.querySelectorAll('.dropdown-item'))
      .map((item: HTMLElement) => item.textContent);
    expect(dropdownItems).toEqual(itemsStartsWithA);
  });
});
