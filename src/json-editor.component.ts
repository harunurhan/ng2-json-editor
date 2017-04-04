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
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  TemplateRef
} from '@angular/core';
import { Http } from '@angular/http';

import * as _ from 'lodash';
import { fromJS, Map, Set } from 'immutable';
import 'rxjs/add/operator/skipWhile';


import { AbstractTrackerComponent } from './abstract-tracker';

import {
  AppGlobalsService,
  JsonStoreService,
  JsonUtilService,
  JsonSchemaService,
  RecordFixerService,
  SchemaFixerService,
  ShortcutService,
  TabsUtilService
} from './shared/services';

import { JsonEditorConfig, Preview, SchemaValidationErrors, PathCache } from './shared/interfaces';


@Component({
  selector: 'json-editor',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './json-editor.component.scss'
  ],
  templateUrl: './json-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class JsonEditorComponent extends AbstractTrackerComponent implements OnInit {

  @Input() config: JsonEditorConfig;
  @Input() record: Object;
  @Input() schema: Object;
  @Input() errorMap: SchemaValidationErrors = {};
  @Input() templates: { [templateName: string]: TemplateRef<any> } = {};


  @Output() onRecordChange: EventEmitter<Object> = new EventEmitter<Object>();

  _record: Map<string, any>;
  tabNameToSubRecordMap: Map<string, Map<string, any>>;
  tabNameToSubSchema: {};
  tabNames: Array<string>;
  keyToTabName: { [key: string]: string };
  previews: Array<Preview>;
  isPreviewerHidden: boolean;
  pathCache: PathCache = {};

  constructor(public http: Http,
    public appGlobalsService: AppGlobalsService,
    public jsonStoreService: JsonStoreService,
    public jsonUtilService: JsonUtilService,
    public jsonSchemaService: JsonSchemaService,
    public recordFixerService: RecordFixerService,
    public schemaFixerService: SchemaFixerService,
    public shortcutsService: ShortcutService,
    public tabsUtilService: TabsUtilService) {
    super();
  }

  ngOnInit() {
    if (!(this.schema && this.record)) {
      throw new Error(`[schema] or [record] is undefined 
        if you are fetching them async then please consider using:
          <json-editor *ngIf="mySchema && myRecord" ...> </json-editor>
        in order to wait for them to be fetched before initializing json-editor
      `);
    } else if (!this.config) {
      this.config = {};
      console.warn(`[config] is undefined, make sure that is intended.`);
    }

    this.schema = this.schemaFixerService.fixSchema(this.schema, this.config.schemaOptions);
    this.record = this.recordFixerService.fixRecord(this.record, this.schema);
    this.extractPreviews();
    // set errors that is used by other components
    this.appGlobalsService.globalErrors = this.errorMap;
    this.appGlobalsService.templates = this.templates;

    // use fromJS to convert input to immutable then pass it to the store
    this._record = fromJS(this.record);
    this.jsonStoreService.setJson(this._record);
    // listen for all changes on json
    this.jsonStoreService.jsonChange
      .skipWhile(json => json === this._record)
      .subscribe(json => {
        this._record = json;
        if (this.config.tabsConfig) {
          // update tab groups!
          this.tabNameToSubRecordMap = this.tabsUtilService.getTabNameToSubRecordMap(json, this.keyToTabName);
        }
        // emit the change as plain JS object
        this.onRecordChange.emit(json.toJS());
      });
    this.jsonSchemaService.setSchema(this.schema);

    // setup variables need for tab grouping.
    if (this.config.tabsConfig) {
      this.keyToTabName = this.tabsUtilService.getKeyToTabName(this.config.tabsConfig, this.schema);
      this.tabNameToSubRecordMap = this.tabsUtilService.getTabNameToSubRecordMap(this._record, this.keyToTabName);
      this.tabNameToSubSchema = this.tabsUtilService.getTabNameToSubSchema(this.schema, this.keyToTabName);
      this.tabNames = this.tabsUtilService.getTabNames(this.config.tabsConfig);
    }

  }

  /**
   * Converts PreviewConfig instances to Preview instances and appends to `previews` array.
   */
  private extractPreviews() {
    if (!this.isPreviewerDisabled) {
      // if url is not set directly, populate it
      this.previews = [];
      this.config.previews
        .forEach(previewConfig => {
          let url: string;
          if (previewConfig.url) {
            url = previewConfig.url;
          } else if (previewConfig.getUrl) {
            url = previewConfig.getUrl(this.record);
          } else if (previewConfig.urlPath) {
            try {
              url = this.jsonUtilService.getValueInPath(this.record, previewConfig.urlPath);
            } catch (error) {
              console.warn(`Path ${previewConfig.urlPath} in preview config is not present in the input record`);
            }
          } else {
            throw new Error('Either url, urlPath or getUrl should be set for a preview');
          }
          if (url) {
            this.previews.push({
              name: previewConfig.name,
              type: previewConfig.type,
              url: url
            });
          }
        });
    }
  }

  get shortcuts() {
    return this.shortcutsService.getShortcutsWithConfig(this.config.shortcuts);
  }

  get isPreviewerDisabled(): boolean {
    return this.config.previews === undefined || this.config.previews.length === 0;
  }

  get rightContainerColMdClass(): string {
    return this.isPreviewerHidden ? 'col-md-1' : 'col-md-4';
  }

  get leftContainerColMdClass(): string {
    if (!this.isPreviewerDisabled) {
      return this.isPreviewerHidden ? 'col-md-11 nav-tabs-col-md-9-8' : 'col-md-8 nav-tabs-col-md-9';
    } else {
      return 'col-md-12 nav-tabs-col-md-10';
    }
  }

  set activeTabName(tabName: string) {
    this.appGlobalsService.activeTabName = tabName;
  }

}
