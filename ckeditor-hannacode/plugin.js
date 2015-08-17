/*
 * Hanna Code plugin for CKEditor
 *
 * Hanna Code plugin is intended to work as a helper for using Hanna codes
 * on your site in an RTE. It adds a context menu item "Hanna Code", which
 * opens a dialog with select menu consisting of all available Hanna codes.
 *
 * Note: this plugin is only intended for use with ProcessWire CMS/CMF with
 * Hanna Code module and additional helper module installed. Both of these
 * can be downloaded/cloned from GitHub:
 * 
 * - https://github.com/ryancramerdesign/ProcessHannaCode
 * - https://github.com/teppokoivula/HannaCodeHelper
 *
 * @author Teppo Koivula <teppo@flamingruby.com>
 * @copyright Copyright (c) 2013, Teppo Koivula
 *
 * ProcessWire 2.x 
 * Copyright (C) 2013 by Ryan Cramer 
 * Licensed under GNU/GPL v2, see LICENSE.TXT
 * 
 * http://processwire.com
 *
 */

CKEDITOR.plugins.add('hannacode', {
    lang: ['fi', 'en'],
    init: function(editor) {

        // add new dialog
        CKEDITOR.dialog.add('HannaCodeDialog', function(editor) {
            return {
                // CKEDITOR.dialog.definition
                title: editor.lang.hannacode.dialogTitle,
                minWidth: 390,
                minHeight: 130,
                contents: [
                    {
                        id: 'tags',
                        label: editor.lang.hannacode.tagsLabel,
                        title: editor.lang.hannacode.tagsTitle,
                        expand: true,
                        padding: 0,
                        elements: [
                            { type: 'html', html: editor.lang.hannacode.tagsHTML },
                            { type: 'select', id: 'tag', items: hanna_code_tags },
                            { type: 'html', html: editor.lang.hannacode.iconHTML },
                            { type: 'select', id: 'icons', items: hanna_code_icons },
                            { type: 'html', html: editor.lang.hannacode.iconColorHTML },
                            { type: 'select', id: 'icon_color', items: [ ['teal'], ['yellow'], ['red']], 'default': 'teal' },
                            { type: 'html', html: editor.lang.hannacode.textHTML },
                            { type: 'textarea', id: 'taxt', rows: 15 }
                        ]
                    }
                ],
                onOk: function() {
                    // "this" is now a CKEDITOR.dialog object
                    var tag = this.getValueOf('tags', 'tag');
                    var icon = 'icon="' + this.getValueOf('tags', 'icons') + '"';
                    var icon_color = 'icon_color="' + this.getValueOf('tags', 'icon_color') + '"';
                    var text = this.getValueOf('tags','taxt');
                    text.replace('"', '\"');
                    tag = tag.replace('text=""', 'text="' + text + '"');
                    tag = tag.replace('icon=""', icon);
                    tag = tag.replace('icon_color="teal"', icon_color);
                    tag = tag.replace('icon_color=""', icon_color);

                    editor.insertHtml(tag);
                }
            };
        });
        
        // add dialog command
        // editor.addCommand(
        //     'HannaCodeCommand', 
        //     new CKEDITOR.dialogCommand('HannaCodeDialog')
        // );
        
        editor.addCommand(
            'HannaCodeCommand', 
            {exec: loadIframeHannaInserter}
        );
        //Custom to this site
        //Add button 
        editor.ui.addButton('HannaCodeBtn', {
            label: "Hanna",
            command: "HannaCodeCommand", 
            icon: this.path + 'icon.png'
        });


        // add context menu item
        if (editor.contextMenu) {
            editor.addMenuGroup('HannaCodeGroup', 10);
            editor.addMenuItem('HannaCodeItem', {
                label: editor.lang.hannacode.menuLabel,
                command: 'HannaCodeCommand',
                group: 'insert',
                icon: this.path + 'icon.png'
            });
            editor.contextMenu.addListener(function(element) {
                return { HannaCodeItem: CKEDITOR.TRISTATE_OFF };
            });
        }
        
    }
    
});

function loadIframeHannaInserter(editor) {

        var pageID = $("#Inputfield_id").val();

        // language support
        var $textarea = $('#' + editor.name); // get textarea of this instance
        var selection = editor.getSelection(true);
        var node = selection.getStartElement();
        var nodeName = node.getName(); // will typically be 'a', 'img' or 'p' 
        var selectionText = selection.getSelectedText();

        // build the modal URL
        var modalUrl = config.urls.admin + 'page/hanna-insertion/?id=' + pageID + '&modal=1';

    
        // labels
        var insertLinkLabel = editor.lang.hannacode.label;
        var cancelLabel = config.InputfieldCKEditor.pwlink.cancel;
        var $iframe; // set after modalSettings down

        // action when insert link button is clicked
        function clickInsert() {

            // var $i = $iframe.contents();
            // var $a = $($("#link_markup", $i).text());
            // if($a.attr('href') && $a.attr('href').length) {
            //     $a.html(selectionText);
            //     var html = $("<div />").append($a).html();
            //     editor.insertHtml(html);
            // }
        
            $iframe.dialog("close");
        }
    
        // settings for modal window
        var modalSettings = {
            title: "<i class='fa fa-link'></i> " + insertLinkLabel,
            open: function() {
                if($(".cke_maximized").length > 0) {
                    // the following is required when CKE is maximized to make sure dialog is on top of it
                    $('.ui-dialog').css('z-index', 9999);
                    $('.ui-widget-overlay').css('z-index', 9998);
                }
            },
            buttons: [ {
                class: "pw_link_submit_insert", 
                html: "<i class='fa fa-link'></i> " + insertLinkLabel,
                click: clickInsert
            }, {
                html: "<i class='fa fa-times-circle'></i> " + cancelLabel,
                click: function() { $iframe.dialog("close"); },
                class: 'ui-priority-secondary'
                }
            ]
        };
    
        // create modal window
        var $iframe = pwModalWindow(modalUrl, modalSettings, 'medium'); 
    
        // modal window load event
        $iframe.load(function() {
            
            var $i = $iframe.contents();
            $i.find("#ProcessPageEditLinkForm").data('iframe', $iframe);
        
            // capture enter key in main URL text input
            $("#link_page_url", $i).keydown(function(event) {
                var $this = $(this);
                var val = $.trim($this.val());
                if (event.keyCode == 13) {
                    event.preventDefault();
                    if(val.length > 0) clickInsert();
                    return false;
                }
            });

        }); // load

    } // function loadIframeLinkPicker(editor) {