/*globals tinymce,tinyMCEPopup*/

(function (window, tinymce, tinyMCEPopup) {
	"use strict";
	tinyMCEPopup.params['plugin_url'] = '../itptextblockeditor'
	tinyMCEPopup.requireLangPack();
	var oldInsertTable = window.insertTable;

	window.insertTable = function () {
		var editor = tinyMCEPopup.editor,
			dom = editor.dom,
			formObj = document.forms[0],
			table,
			autosize,
			headerRow, footerRow,
			firstColumn, lastColumn,
			style;

		oldInsertTable();

		table = dom.getParent(editor.selection.getNode(), 'table');
		autosize = formObj.elements.autosize.checked;
		headerRow = formObj.elements.headerrow.checked;
		footerRow = formObj.elements.footerrow.checked;
		firstColumn = formObj.elements.firstcolumn.checked;
		lastColumn = formObj.elements.lastcolumn.checked;
		style = 'normal';

		dom.setAttribs(table, {
			"data-itp-autosize": autosize,
			"data-itp-headerRow": headerRow,
			"data-itp-footerRow": footerRow,
			"data-itp-firstColumn": firstColumn,
			"data-itp-lastColumn": lastColumn,
			"data-itp-style": style
		});

		// Artificially trigger a "change" event after our changes.
		editor.nodeChanged();
	};

	function hideTableRowsWithElements(dom, elementsIds) {
		tinymce.each(elementsIds, function (elementId) {
			var parentTableRow = dom.getParent(elementId, "tr");

			dom.hide(parentTableRow);
		});
	}

	function addFields(dom) {
		var table = dom.select("div#general_panel table tbody")[0],
			row;

		//autosize input checkbox element
		row = dom.create("tr", { },
			dom.create("td", { },
				dom.create("label", { id: "autosizelabel", "for": "autosize" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.table_autosize', "Autosize")))));
		dom.add(row,
			dom.create("td", { }, '<input id="autosize" name="autosize" type="checkbox" class="checkbox" value="true" />'));
		dom.add(table, row);

		//firstColumn and lastColumn checkbox elements
		row = dom.create("tr", { },
			dom.create("td", { },
				dom.create("label", { id: "firstcolumnlabel", "for": "firstcolumn" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.table_first_column', "First column")))));
		dom.add(row,
			dom.create("td", { }, '<input id="firstcolumn" name="firstcolumn" type="checkbox" class="checkbox" value="true" />'));
		dom.add(row,
			dom.create("td", { },
				dom.create("label", { id: "lastcolumnlabel", "for": "lastcolumn" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.table_last_column', "Last column")))));
		dom.add(row,
			dom.create("td", { }, '<input id="lastcolumn" name="lastcolumn" type="checkbox" class="checkbox" value="true" />'));
		dom.add(table, row);

		//headerRow and footerRow checkbox elements
		row = dom.create("tr", { },
			dom.create("td", { }, dom.create("label", { id: "headerrowlabel", "for": "headerrow" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.table_header_row', "Header row")))));
		dom.add(row,
			dom.create("td", { }, '<input id="headerrow" name="headerrow" type="checkbox" class="checkbox" value="true" />'));
		dom.add(row,
			dom.create("td", { },
				dom.create("label", { id: "footerrowlabel", "for": "footerrow" }, dom.encode(tinyMCEPopup.getLang('itptextblockeditor_dlg.table_footer_row', "Footer row")))));
		dom.add(row,
			dom.create("td", { }, '<input id="footerrow" name="footerrow" type="checkbox" class="checkbox" value="true" />'));
		dom.add(table, row);
	}

	function init() {
		var editor = tinyMCEPopup.editor,
			dom = editor.dom,
			dialogDom = tinyMCEPopup.dom,
			action,
			formObj = document.forms[0],
			table = dom.getParent(editor.selection.getNode(), "table");

		dialogDom.hide("advanced_panel");
		dialogDom.hide("advanced_tab");
		hideTableRowsWithElements(dialogDom, ["cellpaddinglabel", "alignlabel", "widthlabel", "classlabel", "caption"]);

		addFields(dialogDom);

		action = tinyMCEPopup.getWindowArg('action');
		if (!action) {
			action = table ? "update" : "insert";
		}

		if (table && action !== "insert") {
			formObj.autosize.checked = dom.getAttrib(table, 'data-itp-autosize') === "true";
			formObj.firstcolumn.checked = dom.getAttrib(table, 'data-itp-firstcolumn') === "true";
			formObj.lastcolumn.checked = dom.getAttrib(table, 'data-itp-lastcolumn') === "true";
			formObj.headerrow.checked = dom.getAttrib(table, 'data-itp-headerrow') === "true";
			formObj.footerrow.checked = dom.getAttrib(table, 'data-itp-footerrow') === "true";
		}
	}

	tinyMCEPopup.onInit.add(init);

}(window, tinymce, tinyMCEPopup));
