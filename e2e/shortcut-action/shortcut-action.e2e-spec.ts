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

import { ShortcutActionPage } from './shortcut-action.po';
import { browser, protractor } from 'protractor';

describe('ShortcutAction', function () {
  let page: ShortcutActionPage;
  let mod;

  beforeEach(() => {
    page = new ShortcutActionPage();
    page.navigateTo('/');
    browser.driver.executeScript(function () {
      return (window.navigator && window.navigator.platform.indexOf('Mac')) >= 0 ? 'Mac' : 'Linux/Windows';
    }).then(info => {
      mod = info === 'Mac' ? protractor.Key.COMMAND : protractor.Key.CONTROL;
    });
  });

  it(`should add a new row under table using 'alt+a' shortcut`, () => {
    page.getNumberOfChildRowsbyId('/keywords')
      .then(tableRowsNum => {
        const inputElem = page.getChildOfElementByCss(page.getElementById('/keywords/0'), 'span[contenteditable=true]');
        inputElem.sendKeys(protractor.Key.chord(protractor.Key.ALT, 'a'));
        const newTableRowsNumPromise = page.getNumberOfChildRowsbyId('/keywords');
        expect(newTableRowsNumPromise).toEqual(tableRowsNum + 1);
      });
  });

  it(`should add a new row under table using 'mod+shift+a' shortcut`, () => {
    page.getNumberOfChildRowsbyId('/arxiv_eprints')
      .then(tableRowsNum => {
        const inputElem = page.getChildOfElementByCss(page.getElementById('/arxiv_eprints/0/value'), 'span[contenteditable=true]');
        inputElem.sendKeys(protractor.Key.chord(mod, protractor.Key.SHIFT, 'a'));
        const newTableRowsNumPromise = page.getNumberOfChildRowsbyId('/arxiv_eprints');
        expect(newTableRowsNumPromise).toEqual(tableRowsNum + 1);
      });
  });

  it(`should add a new row under table using 'mod+shift+b' shortcut`, () => {
    const currentRowPromise = page.getValuesOfChildrenById('/keywords/1');
    const inputElem = page.getChildOfElementByCss(page.getElementById('/keywords/0/value'), 'span[contenteditable=true]');
    inputElem.sendKeys(protractor.Key.chord(mod, protractor.Key.SHIFT, 'b'));
    currentRowPromise
      .then(currentRow => {
        const targetRow = page.getValuesOfChildrenById('/keywords/1');
        expect(targetRow).not.toEqual(currentRow);
      });
  });

  it(`should move row up using 'mod+shift+up' shortcut`, () => {
    const currentFirstRowPromise = page.getValuesOfChildrenById('/external_system_identifiers/0');
    const currentSecondRowPromise = page.getValuesOfChildrenById('/external_system_identifiers/1');
    const currentElem = page
      .getChildOfElementByCss(page.getElementById('/external_system_identifiers/1/value'), 'span[contenteditable=true]');
    currentElem.sendKeys(protractor.Key.chord(mod, protractor.Key.SHIFT, protractor.Key.UP));
    const targetFirstRowPromise = page.getValuesOfChildrenById('/external_system_identifiers/0');
    const targetSecondRowPromise = page.getValuesOfChildrenById('/external_system_identifiers/1');
    expect(targetFirstRowPromise).toEqual(currentSecondRowPromise);
    expect(targetSecondRowPromise).toEqual(currentFirstRowPromise);
    // Test for issue of overriding the new value with the old one when moving up because of triggering the commitValueChange()
    // on blur with the old values. As a result the switched cells have the same values
    expect(targetSecondRowPromise).not.toEqual(targetFirstRowPromise);
  });

  it(`should move row down using 'mod+shift+down' shortcut`, () => {
    const currentRowPromise = page.getValuesOfChildrenById('/external_system_identifiers/0');
    let currentElem = page.getChildOfElementByCss(page.getElementById('/external_system_identifiers/0/value'), 'span[contenteditable=true]');
    currentElem.sendKeys(protractor.Key.chord(mod, protractor.Key.SHIFT, protractor.Key.DOWN));
    currentElem = page.getChildOfElementByCss(page.getElementById('/external_system_identifiers/1/value'), 'span[contenteditable=true]');
    // Trigger move down shortcut two time in a row to test issue of not updating tabindexes correctly on sequential
    // trigger of the shortcut. As a result the shortcut was not working properly.
    currentElem.sendKeys(protractor.Key.chord(mod, protractor.Key.SHIFT, protractor.Key.DOWN));
    const targetRowPromise = page.getValuesOfChildrenById('/external_system_identifiers/2');
    expect(targetRowPromise).toEqual(currentRowPromise);
  });

  it(`should delete the current row in table  using 'mod+backspace' shortcut`, () => {
    const elem = page.getChildOfElementByCss(page.getElementById('/keywords/0/value'), 'span[contenteditable=true]');
    const elemBeforeDeletionThatWillBeShifted = page
      .getChildOfElementByCss(page.getElementById('/keywords/1/value'), 'span[contenteditable=true]')
      .getText();
    const elemValuePromise = elem.getText();
    elem.sendKeys(protractor.Key.chord(mod, protractor.Key.BACK_SPACE));
    const elemAfterDeletionAndThatWasShifted = page
      .getChildOfElementByCss(page.getElementById('/keywords/0/value'), 'span[contenteditable=true]');
    expect(elemAfterDeletionAndThatWasShifted.getText()).not.toEqual(elemValuePromise);
    expect(elemAfterDeletionAndThatWasShifted.getText()).toEqual(elemBeforeDeletionThatWillBeShifted);
  });

  it(`should copy new row under abstracts.0 table using 'alt+c' shortcut.
    The copied cell under the focused one must be empty and the remaining cells must be exactly copied.`, () => {
      const currentRowPromise = page.getValuesOfChildrenById('/imprints/0');
      const inputElem = page.getChildOfElementByCss(page.getElementById('/imprints/0/date'), 'span[contenteditable=true]');
      inputElem.sendKeys(protractor.Key.chord(protractor.Key.ALT, 'c'));
      const targetRowPromise = page.getValuesOfChildrenById('/imprints/1');
      protractor.promise.all([currentRowPromise, targetRowPromise])
        .then(data => {
          const currentRow = data[0];
          const targetRow = data[1];
          expect(targetRow[0]).toEqual('');
          expect(targetRow.slice(1, targetRow.length)).toEqual(currentRow.slice(1, currentRow.length));
        });
    });

  it(`should copy new row under references table using 'mod+alt+r' shortcut.
    It must copy the exact value of the root element eg Copy the whole element under the focused one.`, () => {
      const inputElem = page.getChildOfElementByCss(page.getElementById('/imprints/0/date'), 'span[contenteditable=true]');
      const numberOfContentEditableElementsBeforeCopyPromise = page.getNumberOfContentEditableElementsById('/imprints/0');
      const numberOfInputElementsBeforeCopyPromise = page.getNumberOfInputElementsById('/imprints/0');
      inputElem.sendKeys(protractor.Key.chord(mod, protractor.Key.ALT, 'r'));
      const afterCopyInputElemValue = page.getChildOfElementByCss(page.getElementById('/imprints/1/date'), 'span[contenteditable=true]')
        .getText();
      expect(inputElem.getText()).toEqual(afterCopyInputElemValue);
      const numberOfContentEditableElementsAfterCopyPromise = page.getNumberOfContentEditableElementsById('/imprints/1');
      const numberOfInputElementsAfterCopyPromise = page.getNumberOfInputElementsById('/imprints/1');
      expect(numberOfContentEditableElementsBeforeCopyPromise).toEqual(numberOfContentEditableElementsAfterCopyPromise);
      expect(numberOfInputElementsBeforeCopyPromise).toEqual(numberOfInputElementsAfterCopyPromise);
    });
});
