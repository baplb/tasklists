(function ($) {

    $.fn.kanban = function (options) {

        // defaults

        var $this = $(this);

        var settings = $.extend({
            titles: ['Block 1', 'Block 2', 'Block 3', 'Block 4'],
            colours: [],
            items: [],
            context: 0,
            rootdoc: ""
        }, options)

        var classes = {
            kanban_board_class: "cd_kanban_board",
            kanban_board_titles_class: "cd_kanban_board_titles",
            kanban_board_title_class: "cd_kanban_board_title",
            kanban_board_blocks_class: "cd_kanban_board_blocks",
            kanban_board_block_class: "cd_kanban_board_block",
            kanban_board_item_class: "cd_kanban_board_block_item",
            kanban_board_item_placeholder_class: "cd_kanban_board_block_item_placeholder",
            kanban_board_item_title_class: "cd_kanban_board_block_item_title",
            kanban_board_item_priority_class: "cd_kanban_board_block_item_priority",
            kanban_board_item_footer_class: "cd_kanban_board_block_item_footer"
        };

        function build_kanban() {

            $this.addClass(classes.kanban_board_class);
            $this.append('<div class="' + classes.kanban_board_titles_class + '"></div>');
            $this.append('<div class="' + classes.kanban_board_blocks_class + '"></div>');

            build_titles();
            build_blocks();
            build_items();

        }

        function build_titles() {

            settings.titles.forEach(function (item, index, array) {
                var title = '<div id="adddialog"></div><div id="title' + item.id + '" style="background: ' + settings.colours[item.id] + '" class="'
                    + classes.kanban_board_title_class + '"><p><a id="showadddialog' + item.id + '" href="#"><i class="fa fa-plus-circle fa-white"></i></a>&nbsp;' + item.title + '</p>' + '</div>';
                $this.find('.' + classes.kanban_board_titles_class).append(title);
                $(function () {
                    $("#adddialog").dialog({
                        autoOpen: false,
                        modal: true,
                        resizable: true,
                        draggable: true,
                        height: 500,
                        width: 800
                    });

                    $("a#showadddialog" + item.id).click(function () {
                        // Use this to get href
                        var href = settings.rootdoc + "/plugins/tasklists/ajax/seetask.php?plugin_tasklists_taskstates_id=" + item.id +"&plugin_tasklists_tasktypes_id=" + settings.context;
                        $("#dialog").load(href).dialog("open");
                    });
                });
            });

        }

        function build_blocks() {
            settings.titles.forEach(function (item, index, array) {
                var item = '<div class="' + classes.kanban_board_block_class + '" data-block="' + item.id + '"></div>';
                $this.find('.' + classes.kanban_board_blocks_class).append(item);
            });

            $("." + classes.kanban_board_block_class).sortable({
                connectWith: "." + classes.kanban_board_block_class,
                // containment: "." + classes.kanban_board_blocks_class,
                // placeholder: classes.kanban_board_item_placeholder_class,
                scroll: true,
                cursor: "move",
                receive: function (event, ui) {
                    var data_destblock = ui.item[0].parentElement.dataset.block;
                    var data_id = ui.item[0].dataset.id;
                    var data = {data_destblock, data_id};
                    $.ajax({
                        data: data,
                        type: 'POST',
                        url: '../ajax/movetask.php'
                    });
                }
            }).disableSelection();

        }

        function build_items() {

            settings.items.forEach(function (item, index, array) {
                var block = $this.find('.' + classes.kanban_board_block_class + '[data-block="' + item.block + '"]');
                var append = '<div id="div' + item.id + '" class="' + classes.kanban_board_item_class + '" data-id="' + item.id + '">';
                append += '<div class="' + classes.kanban_board_item_title_class + '">'
                    + '<div id="dialog"></div><a id="showdialog' + item.id + '" href="#">' + item.title + '</a>' + '</div>';

                if (item.description) {
                    append += '<div class="kanbancomment">' + item.description + '</div>';
                }
                // if (item.link) {
                //     append += '<a target="_blank" href="' + item.link + '">' + item.link_text + '</a>';
                // }

                if (item.priority) {
                    append += '<div style=background-color:'
                        + item.bgcolor + ' class="' + classes.kanban_board_item_priority_class + '">' + item.priority + '</div>';
                }

                if (item.footer) {
                    append += '<div class="' + classes.kanban_board_item_footer_class + '">' +
                        '<div align="pull-right"><input type="text" id="percent' + item.id + '" readonly style="border:0; color:#CCC; font-weight:bold;"></div>'+
                        '<div align="center"><div class="kanban_slider" id="slider' + item.id + '"></div></div>' +
                        item.footer + '</div>';

                }

                append += '</div>';


                block.append(append);

                $(document).ready(function(){

                    $("#dialog").dialog({
                        autoOpen: false,
                        modal: true,
                        resizable: true,
                        draggable: true,
                        height: 650,
                        width: 800
                    });

                    $("a#showdialog" + item.id).click(function () {
                        // Use this to get href
                        var href = settings.rootdoc + "/plugins/tasklists/ajax/seetask.php?id=" + item.id;
                        $("#dialog").load(href).dialog("open");
                    });
                });

                $( "#slider" + item.id).slider({
                    min: 0,
                    max: 100,
                    step: 10,
                    range: "min",
                    animate:"slow",
                    value: item.percent,
                    slide: function( event, ui ) {
                        $( "#percent"+ item.id ).val( ui.value + "%");

                        var percent_done = ui.value;
                        var data_id = item.id;
                        var data = {percent_done, data_id};
                        $.ajax({
                            data: data,
                            type: 'POST',
                            url: '../ajax/updatetask.php'
                        });
                    }
                });
                $( "#percent"+ item.id ).val( $( "#slider" + item.id).slider( "value" ) + "%");


            });
        }

        build_kanban();

    }

}(jQuery));