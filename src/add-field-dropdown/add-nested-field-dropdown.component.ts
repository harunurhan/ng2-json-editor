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

import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Set } from 'immutable';

import { DomUtilService, EmptyValueService, PathUtilService, JsonStoreService } from '../shared/services';
import { JSONSchema } from '../shared/interfaces';

@Component({
  selector: 'add-nested-field-dropdown',
  styleUrls: [
    './add-field-dropdown.component.scss'
  ],
  templateUrl: './add-nested-field-dropdown.component.html'
})
export class AddNestedFieldDropdownComponent {

  tabPadding = 8;
  initialPadding = 20;

  // for now order here is important
  // first string value ones then the object ones.
  mockMap = {
    raw_refs: '/references/0/raw_refs',
    record: '',
    reference: {
      arxiv_eprints: '/references/0/reference/arxiv_eprints',
      publication_info: '/references/0/reference/publication_info',
      book_series: '/references/0/reference/book_series',
      collaborations: '/references/0/reference/collaborations',
      document_type: '/references/0/reference/document_type',
      imprint: '/references/0/reference/imprint',
      isbn: '/references/0/reference/isbn',
      persistent_identifiers: '/references/0/reference/persistent_identifiers',
      report_number: '/references/0/reference/report_number',
      texkey: '/references/0/reference/texkey',
      title: '/references/0/reference/title',
      urls: '/references/0/reference/urls',
      authors: {
        inspire_role: '/references/0/reference/authors/*/role'
      }
    }
  };

  // could be a pipe later
  keys = Object.keys;

  constructor(public jsonStoreService: JsonStoreService,
    public pathUtilService: PathUtilService,
    public emptyValueService: EmptyValueService) { }

  onFieldSelect(pathString: string) {
    let path = this.pathUtilService.toPathArray(pathString);
    delete this.mockMap[path[2]][path[3]];
    this.jsonStoreService.setIn(path, ['']);
  }

  // could be a pipe later
  typeOf(value: any): string {
    return typeof value;
  }
}
