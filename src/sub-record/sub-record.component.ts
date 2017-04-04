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

import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Map, Set } from 'immutable';

import { PathCache } from '../shared/interfaces';
import { JsonStoreService, AppGlobalsService } from '../shared/services';

@Component({
  selector: 'sub-record',
  styleUrls: [
    './sub-record.component.scss'
  ],
  templateUrl: './sub-record.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubRecordComponent implements OnInit {
  @Input() value: Map<string, any>;
  @Input() schema: Object;
  @Input() enableAdminModeSwitch: boolean;
  @Input() isPreviewerHidden: boolean;
  @Input() isPreviewerDisabled: boolean;
  @Input() tabName = '';

  keysByType: { others: Set<string>, toggles: Set<string> };
  allKeys: Set<string>;
  pathCache: PathCache = {};

  constructor(public jsonStoreService: JsonStoreService,
    public appGlobalsService: AppGlobalsService) { }

  ngOnInit() {
    this.value = this.value || Map<string, any>();
    this.allKeys = this.value.keySeq().toSet();
    if (this.allKeys.isEmpty()) {
      this.keysByType = { toggles: Set<string>(), others: Set<string>() };
    } else {
      this.keysByType = this.allKeys
        .groupBy(key => this.isToggle(key) ? 'toggles' : 'others')
        .toObject() as any;
    }
  }

  // delete only work for others, not toggles (UPDATE: config comment if this changes)
  deleteField(field: string) {
    this.jsonStoreService.removeIn(this.getPathForField(field));
    this.keysByType.others = this.keysByType.others.remove(field);
  }

  getPathForField(field: string): Array<any> {
    if (!this.pathCache[field]) {
      this.pathCache[field] = [field];
    }
    return this.pathCache[field];
  }

  onFieldAdd(field: string) {
    if (this.isToggle(field)) {
      this.keysByType.toggles = this.keysByType.toggles.add(field);
    } else {
      this.keysByType.others = this.keysByType.others.add(field);
    }
  }

  onToggleValueChange(field: string, value: boolean) {
    this.jsonStoreService.setIn(this.getPathForField(field), value);
  }

  get rightContainerColMdClass(): string {
    if (this.isPreviewerDisabled) {
      return 'col-md-10';
    } else {
      return this.isPreviewerHidden ? 'col-md-9 col-md-override-9-8' : 'col-md-9';
    }
  }

  get leftContainerColMdClass(): string {
    if (this.isPreviewerDisabled) {
      return 'col-md-2';
    }
    return this.isPreviewerHidden ? 'col-md-3 col-md-override-2-2' : 'col-md-3';
  }

  private isToggle(field: string): boolean {
    return this.schema['properties'][field]['toggleColor'] !== undefined;
  }
}
