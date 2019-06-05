/*globals tinymce, tinyMCEPopup, Validator*/

(function (window, tinymce, tinyMCEPopup, Validator) {
	"use strict";
	tinyMCEPopup.params['plugin_url'] = '../itptextblockeditor'
    tinyMCEPopup.requireLangPack();
	    var oldUpdateAction = window.updateAction,
		columnWidthUnit = tinyMCEPopup.editor.getParam('itp_table_column_width_unit', 'cm');

	window.updateAction = function () {
		var formObj = document.forms[0],
			columnWidthIsEmpty,
			columnWidthIsValid = false,
			columnWidth,
			columnWidthInInches = '';

		tinyMCEPopup.restoreSelection();

		columnWidthIsEmpty = !tinymce.trim(formObj.colwidth.value).length;
		if (!columnWidthIsEmpty) {
            formObj.colwidth.value = formObj.colwidth.value.replace(",", ".");
			columnWidth = parseFloat(formObj.colwidth.value);
			columnWidthIsValid = columnWidth > 0 && Validator.isNumber(formObj.colwidth.value);
		}

		if (!columnWidthIsEmpty && columnWidthIsValid) {
			if (columnWidthUnit === 'cm') {
				columnWidthInInches = convertFromCentimetersToInches(columnWidth) + 'in';
			} else {
				columnWidthInInches = columnWidth + 'in';
			}
		}

		formObj.width.value = columnWidthInInches;
		formObj.action.value = "col";

		oldUpdateAction();
	};

	function hideTableRowsWithElements(dom, elementsIds) {
		tinymce.each(elementsIds, function (elementId) {
			var parentTableRow = dom.getParent(elementId, "tr");

			dom.hide(parentTableRow);
		});
	}

	function convertFromInchesToCentimeters(inches) {
		return inches * 2.54;
	}

	function convertFromCentimetersToInches(centimeters) {
		return centimeters / 2.54;
	}

	function recalculateWidth(newUnit) {
		var formObj = document.forms[0],
			oldWidth = parseFloat(formObj.colwidth.value);

		if (oldWidth) {
			if (newUnit === 'in') {
				formObj.colwidth.value = convertFromCentimetersToInches(oldWidth).toFixed(2);
			} else {
				formObj.colwidth.value = convertFromInchesToCentimeters(oldWidth).toFixed(2);
			}
		}
	}

	function addFields(dom) {
		var table = dom.select("div#general_panel table tbody")[0],
			row,
			column,
			inchesOption,
			centimetersOption;

		dom.removeClass(dom.select('.mceFocus'), 'mceFocus');

		row = dom.create("tr");
		dom.add(row,
			dom.create("td", { },
				dom.create("label", { id: "colwidthlabel", "for": "colwidth" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.column_width', "Column width")))));
		dom.add(row,
			dom.create("td", { }, '<input id="colwidth" name="colwidth" type="text" value="" size="7" maxlength="7" class="mceFocus number" />'));
		
		column = dom.create('td', {}, '<input id="colwidthunit-cm" name="colwidthunit" type="radio" value="cm" class="radio" />');
		dom.add(column, dom.create("label", { "for": "colwidthunit-cm" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.column_width_unit_centimeters', "centimeters"))));
		dom.add(row, column);

		column = dom.create('td', {}, '<input id="colwidthunit-in" name="colwidthunit" type="radio" value="in" class="radio" />');
		dom.add(column, dom.create("label", { "for": "colwidthunit-in" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.column_width_unit_inches', "inches"))));
		dom.add(row, column);

		dom.add(table, row);

		centimetersOption = dom.get('colwidthunit-cm');
		inchesOption = dom.get('colwidthunit-in');

		centimetersOption.checked = (columnWidthUnit === centimetersOption.value);
		inchesOption.checked = (columnWidthUnit === inchesOption.value);

		// Fixes IE (<=) 8 issues with change event on radio buttons: http://www.ridgesolutions.ie/index.php/2011/03/02/ie8-chage-jquery-event-not-firing/
		tinymce.each([centimetersOption, inchesOption], function (item) {
			dom.bind(item, 'click', function (e) {
				e.target.blur();
				e.target.focus();
			});
		});

		tinymce.each([centimetersOption, inchesOption], function (item) {
			dom.bind(item, 'change', function (e) {
				if (e.target.value !== columnWidthUnit) {
					recalculateWidth(e.target.value);
					columnWidthUnit = e.target.value;
				}
			});
		});
	}

	function init() {
		var editor = tinyMCEPopup.editor,
			dom = editor.dom,
			dialogDom = tinyMCEPopup.dom,
			table = dom.getParent(editor.selection.getNode(), "table"),
			el, tdElm, action,
			widthObject;
		dialogDom.hide("advanced_panel");
		dialogDom.hide("advanced_tab");
		dialogDom.hide("action");
		hideTableRowsWithElements(dialogDom, ["align", "valign", "width", "class"]);
		addFields(dialogDom);

		action = tinyMCEPopup.getWindowArg('action');
		if (!action) {
			action = table ? "update" : "insert";
		}

		if (table && action !== "insert") {
			tinyMCEPopup.restoreSelection();
			el = editor.selection.getStart();
			tdElm = editor.dom.getParent(el, "td,th");

			if (tdElm.style.width) {
				widthObject = tinymce.plugins.ItpTextBlockEditor.parseCssDimension(tdElm.style.width);
				if (widthObject.unit === "in") {
                    var val;
					if (columnWidthUnit === "in") {
                         val =  widthObject.value.toFixed(2);
					} else {
						val =  convertFromInchesToCentimeters(widthObject.value).toFixed(2);
					}
                    val = val.replace(".", getLocalDecimalSeparator())
                    dialogDom.setAttrib('colwidth', 'value',val );
                    
				}
			}
		}
	}

    function getLocalDecimalSeparator() {
            switch (tinymce.settings.language) {
                case 'en':
                case 'ja':
                    return '.';
                case 'de':
                case 'es':
                case 'fr':
                case 'it':
                case 'nl':
                case 'pt':
                default:
                    return ',';
            }
        }
	tinyMCEPopup.onInit.add(init);

}(window, tinymce, tinyMCEPopup, Validator));
