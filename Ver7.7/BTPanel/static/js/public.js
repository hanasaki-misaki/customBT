$(function(){
    $.fn.extend({
        fixedThead:function(options){
            var _that = $(this);
            var option = {
                height:400,
                shadow:true,
                resize:true
            };
            options = $.extend(option,options);
            if($(this).find('table').length === 0){
                return false;
            }
            var _height = $(this)[0].style.height,_table_config = _height.match(/([0-9]+)([%\w]+)/);
            if(_table_config === null){
                _table_config = [null,options.height,'px'];
            }else{
                $(this).css({
                    'boxSizing': 'content-box',
                    'paddingBottom':$(this).find('thead').height()
                });
            }
            $(this).css({'position':'relative'});
            var _thead = $(this).find('thead')[0].outerHTML,
                _tbody = $(this).find('tbody')[0].outerHTML,
                _thead_div = $('<div class="thead_div"><table class="table table-hover mb0"></table></div>'),
                _shadow_top = $('<div class="tbody_shadow_top"></div>'),
                _tbody_div = $('<div class="tbody_div" style="height:'+ _table_config[1] + _table_config[2] +';"><table class="table table-hover mb0" style="margin-top:-'+ $(this).find('thead').height() +'px"></table></div>'),
                _shadow_bottom = $('<div class="tbody_shadow_bottom"></div>');
            _thead_div.find('table').append(_thead);
            _tbody_div.find('table').append(_thead);
            _tbody_div.find('table').append(_tbody);
            $(this).html('');
            $(this).append(_thead_div);
            $(this).append(_shadow_top);
            $(this).append(_tbody_div);
            $(this).append(_shadow_bottom);
            var _table_width = _that.find('.thead_div table')[0].offsetWidth,
                _body_width = _that.find('.tbody_div table')[0].offsetWidth,
                _length = _that.find('tbody tr:eq(0)>td').length;
            $(this).find('tbody tr:eq(0)>td').each(function(index,item){
                var _item = _that.find('thead tr:eq(0)>th').eq(index);
                if(index === (_length-1)){
                	_item.attr('width',$(item)[0].clientWidth + (_table_width - _body_width));
                }else{
                	_item.attr('width',$(item)[0].offsetWidth);
                }
            });
            if(options.resize){
                $(window).resize(function(){
            		var _table_width = _that.find('.thead_div table')[0].offsetWidth,
	                _body_width = _that.find('.tbody_div table')[0].offsetWidth,
	                _length = _that.find('tbody tr:eq(0)>td').length;
		            _that.find('tbody tr:eq(0)>td').each(function(index,item){
		                var _item = _that.find('thead tr:eq(0)>th').eq(index);
		                if(index === (_length-1)){
		                	_item.attr('width',$(item)[0].clientWidth + (_table_width - _body_width));
		                }else{
		                	_item.attr('width',$(item)[0].offsetWidth);
		                }
		            });
	            });	
            }
            if(options.shadow){
                var table_body = $(this).find('.tbody_div')[0];
                if(_table_config[1] >= table_body.scrollHeight){
                    $(this).find('.tbody_shadow_top').hide();
                    $(this).find('.tbody_shadow_bottom').hide();
                }else{
                    $(this).find('.tbody_shadow_top').hide();
                    $(this).find('.tbody_shadow_bottom').show();
                }
                $(this).find('.tbody_div').scroll(function(e){
                    var _scrollTop = $(this)[0].scrollTop,
                        _scrollHeight  = $(this)[0].scrollHeight,
                        _clientHeight = $(this)[0].clientHeight,
                        _shadow_top = _that.find('.tbody_shadow_top'),
                        _shadow_bottom = _that.find('.tbody_shadow_bottom');
                    if(_scrollTop == 0){
                        _shadow_top.hide();
                        _shadow_bottom.show();
                    }else if(_scrollTop > 0 && _scrollTop < (_scrollHeight - _clientHeight)){
                        _shadow_top.show();
                        _shadow_bottom.show();
                    }else if(_scrollTop == (_scrollHeight - _clientHeight)){
                        _shadow_top.show();
                        _shadow_bottom.hide();
                    }
                })
            }
        }
        
    });
    
}(jQuery))

$(document).ready(function() {
	$(".sub-menu a.sub-menu-a").click(function() {
		$(this).next(".sub").slideToggle("slow").siblings(".sub:visible").slideUp("slow");
	});
});
var aceEditor = {
	layer_view:'', 
	aceConfig:{},  //ace????????????
	editor: null,
	pathAarry:[],
	editorLength: 0,
	isAceView:true,
	ace_active:'',
	is_resizing:false,
	menu_path:'', //???????????????????????????
	refresh_config:{
		el:{}, // ???????????????????????????,???DOM??????
		path:'',// ?????????????????????????????????
		group:1,// ???????????????????????????css????????????
		is_empty:true
	}, //??????????????????
	// ???????????????-?????????????????????
	eventEditor: function () {
		var _this = this,_icon = '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>';
		$(window).resize(function(){
			if(_this.ace_active != undefined) _this.setEditorView()
			if( $('.aceEditors .layui-layer-maxmin').length >0){
            	$('.aceEditors').css({
                	'top':0,
                	'left':0,
                	'width':$(this)[0].innerWidth,
                	'height':$(this)[0].innerHeight
                });
            }
		})
		$(document).click(function(e){
			$('.ace_toolbar_menu').hide();
			$('.ace_conter_editor .ace_editors').css('fontSize', _this.aceConfig.aceEditor.fontSize + 'px');
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
		});
		$('.ace_editor_main').on('click',function(){
            $('.ace_toolbar_menu').hide();
        });
		$('.ace_toolbar_menu').click(function(e){
			e.stopPropagation();
			e.preventDefault();
		});
		// ???????????????
		$('.ace_header .pull-down').click(function(){
			if($(this).find('i').hasClass('glyphicon-menu-down')){
                $('.ace_header').css({'top':'-35px'});
                $('.ace_overall').css({'top':'0'});
                $(this).css({'top':'35px','height':'40px','line-height':'40px'});
				$(this).find('i').addClass('glyphicon-menu-up').removeClass('glyphicon-menu-down');
			}else{
				$('.ace_header').css({'top':'0'});
                $('.ace_overall').css({'top':'35px'});
                $(this).removeAttr('style');
				$(this).find('i').addClass('glyphicon-menu-down').removeClass('glyphicon-menu-up');
			}
			_this.setEditorView();
		});
		// ??????TAB??????
		$('.ace_conter_menu').on('click', '.item', function (e) {
			var _id = $(this).attr('data-id'),_item = _this.editor[_id]
			$('.item_tab_'+ _id).addClass('active').siblings().removeClass('active');
			$('#ace_editor_'+ _id).addClass('active').siblings().removeClass('active');
			_this.ace_active = _id;
			_this.currentStatusBar(_id);
			_this.is_file_history(_item);
		});
		// ??????TAB????????????????????????????????????
		$('.ace_conter_menu').on('mouseover', '.item .icon-tool', function () {
			var type = $(this).attr('data-file-state');
			if (type != '0') {
				$(this).removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
			}
		});
		// ??????tab????????????????????????????????????
		$('.ace_conter_menu').on('mouseout', '.item .icon-tool', function () {
			var type = $(this).attr('data-file-state');
			if (type != '0') {
				$(this).removeClass('glyphicon-remove').addClass('glyphicon-exclamation-sign');
			}
		});
		// ??????????????????
		$('.ace_conter_menu').on('click', '.item .icon-tool', function (e) {
			var file_type = $(this).attr('data-file-state');
			var file_title = $(this).attr('data-title');
			var _id = $(this).parent().parent().attr('data-id');
			switch (file_type) {
				// ????????????
				case '0':
					_this.removeEditor(_id);
				break;
					// ?????????
				case '1':
					var loadT = layer.open({
						type: 1,
						area: ['400px', '180px'],
						title: '??????',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">???????????????&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + file_title + '">' + file_title + '</span>&nbsp????????????</div>\
							<div class="clear-tips">????????????????????????????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">???????????????</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">??????</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">????????????</button>\
							</div>\
						</div>',
						success: function (layers, index) {
							$('.ace-clear-btn .btn').click(function () {
								var _type = $(this).attr('data-type'),
									_item = _this.editor[_id];
								switch (_type) {
									case '0': //????????????
										_this.saveFileMethod(_item);
									break;
									case '1': //????????????
										layer.close(index);
									break;
									case '2': //????????????
										_this.removeEditor(_id);
										layer.close(index);
									break;
								}
							});
						}
					});
				break;
			}
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.stopPropagation();
			e.preventDefault();
		});
		$(window).keyup(function(e){
			if(e.keyCode === 116 && $('#ace_conter').length == 1){
				layer.msg('?????????????????????????????????????????????????????????');
			}
		});
		// ?????????????????????
		$('.ace_editor_add').click(function () {
			_this.addEditorView();
		});
		// ???????????????????????????
		$('.ace_conter_toolbar .pull-right span').click(function (e) {
			var _type = $(this).attr('data-type'),
				_item = _this.editor[_this.ace_active];
			$('.ace_toolbar_menu').show();
			switch (_type) {
				case 'cursor':
					$('.ace_toolbar_menu').hide();
					$('.ace_header .jumpLine').click();
				break;
				
				case 'history':
					$('.ace_toolbar_menu').hide();
					if(_item.historys.length === 0){
						layer.msg('??????????????????',{icon:0});
						return false;
					}
					_this.layer_view = layer.open({
						type: 1,
						area: '550px',
						title: '??????????????????[ '+ _item.fileName +' ]',
						skin:'historys_layer',
						content: '<div class="pd20">\
							<div class="divtable">\
								<table class="historys table table-hover">\
									<thead><tr><th>?????????</th><th>????????????</th><th style="text-align:right;">??????</th></tr></thead>\
									<tbody></tbody>\
								</table>\
							</div>\
						</div>',
						success:function(layeo,index){
							var _html = '';
							for(var i=0;i<_item.historys.length;i++){
								_html += '<tr><td><span class="size_ellipsis" style="max-width:200px">'+ _item.fileName +'</span></td><td>'+ bt.format_data(_item.historys[i]) +'</td><td align="right"><a href="javascript:;" class="btlink open_history_file" data-time="'+ _item.historys[i] +'">????????????</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="btlink recovery_file_historys" data-history="'+ _item.historys[i] +'" data-path="'+ _item.path +'">??????</a></td></tr>'
							}
							if(_html === '') _html += '<tr><td colspan="3">???????????????????????????</td></tr>'
							$('.historys tbody').html(_html);
							$('.historys_layer').css('top', ($(window).height()/2)-($('.historys_layer').height()/2)+'px')
							$('.open_history_file').click(function(){
								var _history = $(this).attr('data-time');
								_this.openHistoryEditorView({filename:_item.path,history:_history},function(){
									layer.close(index);
									$('.ace_conter_tips').show();
									$('.ace_conter_tips .tips').html('????????????????????????'+ _item.path +'??????????????? [ '+ bt.format_data(new Number(_history)) +' ]<a href="javascript:;" class="ml35 btlink" data-path="'+ _item.path +'" data-history="'+ _history +'">??????????????????????????????</a>');
								});
							});
							$('.recovery_file_historys').click(function(){
								_this.event_ecovery_file(this);
							});
						}
					});
				break;
				case 'tab':
					$('.ace_toolbar_menu .menu-tabs').show().siblings().hide();
					$('.tabsType').find(_item.softTabs?'[data-value="nbsp"]':'[data-value="tabs"]').addClass('active').append(_icon);
					$('.tabsSize [data-value="'+ _item.tabSize +'"]').addClass('active').append(_icon);
				break;
				case 'encoding':
					_this.getEncodingList(_item.encoding);
					$('.ace_toolbar_menu .menu-encoding').show().siblings().hide();
				break;
				case 'lang':
					$('.ace_toolbar_menu').hide();
					layer.msg('?????????????????????????????????????????????!',{icon:6});
				break;
			}
			e.stopPropagation();
			e.preventDefault();
		});
		// ????????????
		$('.tips_fold_icon .glyphicon').click(function(){
			if($(this).hasClass('glyphicon-menu-left')){
				$('.ace_conter_tips').css('right','0');
				$('.tips_fold_icon').css('left','0');
				$(this).removeClass('glyphicon-menu-left').addClass('glyphicon-menu-right');
			}else{
				$('.ace_conter_tips').css('right','-100%');
				$('.tips_fold_icon').css('left','-25px');
				$(this).removeClass('glyphicon-menu-right').addClass('glyphicon-menu-left');
			}
		});
		// ???????????????
		$('.menu-tabs').on('click','li',function(e){
			var _val = $(this).attr('data-value'),_item =  _this.editor[_this.ace_active];
			if($(this).parent().hasClass('tabsType')){
				_item.ace.getSession().setUseSoftTabs(_val == 'nbsp');
				_item.softTabs = _val == 'nbsp';
			}else{
				_item.ace.getSession().setTabSize(_val);
				_item.tabSize = _val;
			}
			$(this).siblings().removeClass('active').find('.icon').remove();
			$(this).addClass('active').append(_icon);
			_this.currentStatusBar(_item.id);
			e.stopPropagation();
			e.preventDefault();
		});
		// ??????????????????
		$('.menu-encoding').on('click','li',function(e){
			var _item = _this.editor[_this.ace_active];
			layer.msg('?????????????????????' + $(this).attr('data-value'));
			$('.ace_conter_toolbar [data-type="encoding"]').html('?????????<i>'+ $(this).attr('data-value') +'</i>');
			$(this).addClass('active').append(_icon).siblings().removeClass('active').find('span').remove();
			_item.encoding = $(this).attr('data-value');
			_this.saveFileMethod(_item);
		});
		// ????????????????????????
		$('.menu-files .menu-input').keyup(function () {
			_this.searchRelevance($(this).val());
			if($(this).val != ''){
				$(this).next().show();
			}else{
				$(this).next().hide();
			}
		});
		// ????????????????????????
		$('.menu-files .menu-conter .fa').click(function(){
			$('.menu-files .menu-input').val('').next().hide();
			_this.searchRelevance();
		});
		// ???????????????
		$('.ace_header>span').click(function (e) {
			var type =  $(this).attr('class'),_item =  _this.editor[_this.ace_active];
			if(_this.ace_active == '' && type != 'helps'){
				return false;
			}
			switch(type){
				case 'saveFile': //??????????????????
					_this.saveFileMethod(_item);
				break;
				case 'saveFileAll': //????????????
					var loadT = layer.open({
						type: 1,
						area: ['350px', '180px'],
						title: '??????',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">???????????????????????????????????????</div>\
							<div class="clear-tips">????????????????????????????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >??????</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">????????????</button>\
							</div>\
						</div>',
						success: function (layers, index) {
							$('.clear-btn').click(function(){
								layer.close(index);
							});
							$('.save-all-btn').click(function(){
								var _arry = [],editor = aceEditor['editor'];
								for(var item in editor){
									_arry.push({
										path: editor[item]['path'],
										data: editor[item]['ace'].getValue(),
										encoding: editor[item]['encoding'],
									})
								}
								_this.saveAllFileBody(_arry,function(){
									$('.ace_conter_menu>.item').each(function (el,index) {
										$(this).find('i').attr('data-file-state','0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
										_item.fileType = 0;
									});
									layer.close(index);
								});
							});
						}
					});
				break;
				case 'refreshs': //????????????
					if(_item.fileType === 0 ){
						aceEditor.getFileBody({path:_item.path},function(res){
							_item.ace.setValue(res.data);
							_item.fileType = 0;
							$('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
							layer.msg('????????????',{icon:1});
						});
						return false;
					}
					var loadT = layer.open({
						type: 1,
						area: ['350px', '180px'],
						title: '??????',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">????????????????????????</div>\
							<div class="clear-tips">???????????????????????????????????????,???????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >??????</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">??????</button>\
							</div>\
						</div>',
						success: function (layers, index) {
							$('.clear-btn').click(function(){
								layer.close(index);
							});
							$('.save-all-btn').click(function(){
								aceEditor.getFileBody({path:_item.path},function(res){
									layer.close(index);
									_item.ace.setValue(res.data);
									_item.fileType == 0;
									$('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
									layer.msg('????????????',{icon:1});
								});
							});
						}
					});
				break;
				// ??????
				case 'searchs':
					_item.ace.execCommand('find');
				break;
				// ??????
				case 'replaces':
					_item.ace.execCommand('replace');
				break;
				// ?????????
				case 'jumpLine':
					$('.ace_toolbar_menu').show().find('.menu-jumpLine').show().siblings().hide();
					$('.set_jump_line input').val('').focus();
				    var _cursor = aceEditor.editor[aceEditor.ace_active].ace.selection.getCursor();
				    $('.set_jump_line .jump_tips span:eq(0)').text(_cursor.row);
				    $('.set_jump_line .jump_tips span:eq(1)').text(_cursor.column);
				    $('.set_jump_line .jump_tips span:eq(2)').text(aceEditor.editor[aceEditor.ace_active].ace.session.getLength());
					$('.set_jump_line input').unbind('keyup').on('keyup',function(e){
					    var _val = $(this).val();
						if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)){
						    if(_val != '' && typeof parseInt(_val) == 'number'){
						        _item.ace.gotoLine(_val);
						    };
						}
					});
				break;
				// ??????
				case 'fontSize':
					$('.ace_toolbar_menu').show().find('.menu-fontSize').show().siblings().hide();
					$('.menu-fontSize .set_font_size input').val(_this.aceConfig.aceEditor.fontSize).focus();
					$('.menu-fontSize set_font_size input').unbind('keypress onkeydown').on('keypress onkeydown',function (e){
						var _val = $(this).val();
						if(_val == ''){
							$(this).css('border','1px solid red');
							$(this).next('.tips').text('?????????????????? 12-45');
						}else if(!isNaN(_val)){
							$(this).removeAttr('style');
							if(parseInt(_val) > 11 && parseInt(_val) <45){
								$('.ace_conter_editor .ace_editors').css('fontSize', _val+'px')
							}else{
								$('.ace_conter_editor .ace_editors').css('fontSize','13px');
								$(this).css('border','1px solid red');
								$(this).next('.tips').text('?????????????????? 12-45');
							}
						}else{
							$(this).css('border','1px solid red');
							$(this).next('.tips').text('?????????????????? 12-45');
						}
						e.stopPropagation();
						e.preventDefault();
					});
					$('.menu-fontSize .menu-conter .set_font_size input').unbind('change').change(function (){
						var _val = $(this).val();
						$('.ace_conter_editor .ace_editors').css('fontSize',_val+'px');
					});
					$('.set_font_size .btn-save').unbind('click').click(function(){
						var _fontSize = $('.set_font_size input').val();
						_this.aceConfig.aceEditor.fontSize = parseInt(_fontSize);
						_this.saveAceConfig(_this.aceConfig,function(res){
							if(res.status){
								$('.ace_editors').css('fontSize',_fontSize +'px');
								layer.msg('????????????', {icon: 1});
							}
						});
					}); 
				break;
				//??????
				case 'themes':
					$('.ace_toolbar_menu').show().find('.menu-themes').show().siblings().hide();
					var _html = '',_arry = ['????????????','????????????'];
					for(var i=0;i<_this.aceConfig.themeList.length;i++){
						if(_this.aceConfig.themeList[i] != _this.aceConfig.aceEditor.editorTheme){
							_html += '<li data-value="'+ _this.aceConfig.themeList[i] +'">'+ _this.aceConfig.themeList[i] +'???'+ _arry[i] +'???</li>';
						}else{
							_html += '<li data-value="'+ _this.aceConfig.themeList[i] +'" class="active">'+ _this.aceConfig.themeList[i] +'???'+ _arry[i] +'???'+ _icon +'</li>';
						}
					}
					$('.menu-themes ul').html(_html);
					$('.menu-themes ul li').click(function(){
						var _theme = $(this).attr('data-value');
                        $(this).addClass('active').append(_icon).siblings().removeClass('active').find('.icon').remove();
						_this.aceConfig.aceEditor.editorTheme = _theme;
						_this.saveAceConfig(_this.aceConfig,function(res){
							for(var item in _this.editor){
								_this.editor[item].ace.setTheme("ace/theme/"+_theme);
							}
							layer.msg('????????????', {icon: 1});
						});
					});
				break;
				case 'setUp':
					$('.ace_toolbar_menu').show().find('.menu-setUp').show().siblings().hide();
					$('.menu-setUp .editor_menu li').each(function(index,el){
						var _type = _this.aceConfig.aceEditor[$(el).attr('data-type')];
						if(_type) $(el).addClass('active').append(_icon);
					})
					$('.menu-setUp .editor_menu li').unbind('click').click(function(){
						var _type = $(this).attr('data-type');
						_this.aceConfig.aceEditor[_type] = !$(this).hasClass('active');
						if($(this).hasClass('active')){
							$(this).removeClass('active').find('.icon').remove();
						}else{
							$(this).addClass('active').append(_icon);
						}
						_this.saveAceConfig(_this.aceConfig,function(res){
							for(var item in _this.editor){
								_this.editor[item].ace.setOption(_type,_this.aceConfig.aceEditor[_type]);
							}
							layer.msg('????????????', {icon: 1});
						});
					});
				break;
				case 'helps':
					if(!$('[data-type=shortcutKeys]').length != 0){
						_this.addEditorView(1,{title:'???????????????',html:aceShortcutKeys.innerHTML});
					}else{
						$('[data-type=shortcutKeys]').click();
					}
				break;
			}
			
			e.stopPropagation();
			e.preventDefault();
		});
		
		// ??????????????????
		$('.ace_catalogue_list').on('click','.has-children .file_fold',function(e){
			var _layers = $(this).attr('data-layer'),_type = $(this).find('data-type'),_path = $(this).parent().attr('data-menu-path'),_menu = $(this).find('.glyphicon'),_group = parseInt($(this).attr('data-group')),_file = $(this).attr('data-file'),_tath = $(this);
			var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group');
			if(_active.length>0 && $(this).attr('data-edit') === undefined){
				switch(_active.attr('data-edit')){
					case '2':
						_active.find('.file_input').siblings().show();
						_active.find('.file_input').remove();
						_active.removeClass('edit_file_group').removeAttr('data-edit');
					break;
					case '1':
					case '0':
						_active.parent().remove();
					break;
				}
				layer.closeAll('tips');
			}
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			if($(this).hasClass('edit_file_group')) return false;
			$('.ace_catalogue_list .has-children .file_fold').removeClass('bg');
			$(this).addClass('bg');
			if($(this).attr('data-file') == 'Dir'){
				if(_menu.hasClass('glyphicon-menu-right')){
					_menu.removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
					$(this).next().show();
					if($(this).next().find('li').length == 0) _this.reader_file_dir_menu({el:$(this).next(),path:_path,group:_group+1});
				}else{
					_menu.removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
					$(this).next().hide();
				}
			}else{
				_this.openEditorView(_path,function(res){
					if(res.status) _tath.addClass('active');
				});
			}
			e.stopPropagation();
			e.preventDefault();
		});
		
		// ????????????????????????????????????
		$('.ace_catalogue').bind("selectstart",function(e){
			var omitformtags = ["input", "textarea"];
			omitformtags = "|" + omitformtags.join("|") + "|";
			if (omitformtags.indexOf("|" + e.target.tagName.toLowerCase() + "|") == -1) {
				return false;
			}else{
				return true;
			}
		});
		// ???????????????????????????????????????
		$('.ace_dir_tools').on('click','.upper_level',function(){
			var _paths = $(this).attr('data-menu-path');
			_this.reader_file_dir_menu({path:_paths,is_empty:true});
			$('.ace_catalogue_title').html('?????????'+ _paths).attr('title',_paths);
		});
		// ???????????????????????????????????????
		$('.ace_dir_tools').on('click','.new_folder',function(e){
			var _paths = $(this).parent().find('.upper_level').attr('data-menu-path');
			$(this).find('.folder_down_up').show();
			$(document).click(function(){
				$('.folder_down_up').hide();
				$(this).unbind('click');
				return false;
			});
			$('.ace_toolbar_menu').hide();
			$('.ace_catalogue_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.stopPropagation();
			e.preventDefault();
		});
		// ???????????? (?????????????????????)
		$('.ace_dir_tools').on('click','.refresh_dir',function(e){
			_this.refresh_config = {
				el:$('.cd-accordion-menu')[0],
				path:$('.ace_catalogue_title').attr('title'),
				group:1,
				is_empty:true
			}
			_this.reader_file_dir_menu(_this.refresh_config,function(){
				layer.msg('????????????',{icon:1});
			});
		});
		// ???????????? (?????????????????????)
		$('.ace_dir_tools').on('click','.search_file',function(e){
			if($(this).parent().find('.search_input_view').length == 0){
				$(this).siblings('div').hide();
				$(this).css('color','#ec4545').attr({'title':'??????'}).find('.glyphicon').removeClass('glyphicon-search').addClass('glyphicon-remove').next().text("??????");
				$(this).before('<div class="search_input_title">??????????????????</div>');
				$(this).after('<div class="search_input_view">\
					<form>\
                        <input type="text" id="search_input_val" class="ser-text pull-left" placeholder="">\
                        <button type="button" class="ser-sub pull-left"></button>\
                    </form>\
                    <div class="search_boxs">\
                        <input id="search_alls" type="checkbox">\
                        <label for="search_alls"><span>?????????????????????</span></label>\
                    </div>\
                </div>');
				$('.ace_catalogue_list').css('top','150px');
				$('.ace_dir_tools').css('height','110px');
				$('.cd-accordion-menu').empty();
			}else{
				$(this).siblings('div').show();
				$(this).parent().find('.search_input_view,.search_input_title').remove();
				$(this).removeAttr('style').attr({'title':'????????????'}).find('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-search').next().text("??????");
				$('.ace_catalogue_list').removeAttr('style');
				$('.ace_dir_tools').removeAttr('style');
				_this.refresh_config = {
					el:$('.cd-accordion-menu')[0],
					path:$('.ace_catalogue_title').attr('title'),
					group:1,
					is_empty:true
				}
				_this.reader_file_dir_menu(_this.refresh_config);
			}
		});
		
		// ??????????????????
		$('.ace_dir_tools').on('click','.search_input_view button',function(e){
			var path = _this.menu_path,
				search = $('#search_input_val').val();
				_this.reader_file_dir_menu({
					el:$('.cd-accordion-menu')[0],
					path:path,
					group:1,
					search:search,
					all:$('#search_alls').is(':checked')?'True':'False',
					is_empty:true
				})
		});
		
		// ?????????????????????????????????????????????
		$('.ace_dir_tools').on('click','.folder_down_up li',function(e){
			var _type = parseInt($(this).attr('data-type')),element = $('.cd-accordion-menu'),group = 0;
			if($('.file_fold.bg').length > 0 && $('.file_fold.bg').data('file') != 'files'){
				element = $('.file_fold.bg');
				group = parseInt($('.file_fold.bg').data('group'));
			}
			switch(_type){
				case 2:
					_this.newly_file_type_dom(element,group,0);
				break;
				case 3:
					_this.newly_file_type_dom(element,group,1);
				break;
			}
			_this.refresh_config = {
				el:$('.cd-accordion-menu')[0],
				path:$('.ace_catalogue_title').attr('title'),
				group:1,
				is_empty:true
			}
			$(this).parent().hide();
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.preventDefault();
			e.stopPropagation();
		});
		// ???????????????????????????
		$('.ace_catalogue_drag_icon .drag_icon_conter').on('mousedown', function (e) {
			var _left = $('.aceEditors')[0].offsetLeft;
			$('.ace_gutter-layer').css('cursor','col-resize');
			$('#ace_conter').unbind().on('mousemove',function(ev){
				var _width = (ev.clientX+1) -_left;
				if(_width >= 265 && _width <= 450){
					$('.ace_catalogue').css({'width':_width,'transition':'none'});
					$('.ace_editor_main').css({'marginLeft':_width,'transition':'none'});
					$('.ace_catalogue_drag_icon ').css('left',_width);
					$('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 -5)-20-30-53);
				}
			}).on('mouseup', function (ev){
				$('.ace_gutter-layer').css('cursor','inherit');
			    $('.ace_catalogue').css('transition','all 500ms');
                $('.ace_editor_main').css('transition','all 500ms');
				$(this).unbind('mouseup mousemove');
			});
		});
		// ???????????????????????????
        $('.ace_catalogue_drag_icon .fold_icon_conter').on('click',function (e) {
            if($('.ace_overall').hasClass('active')){
                $('.ace_overall').removeClass('active');
                $('.ace_catalogue').css('left','0');
                $(this).removeClass('active').attr('title','??????????????????');
                $('.ace_editor_main').css('marginLeft',$('.ace_catalogue').width());
            }else{
                $('.ace_overall').addClass('active');
                $('.ace_catalogue').css('left','-'+$('.ace_catalogue').width()+'px');
                $(this).addClass('active').attr('title','??????????????????');
                $('.ace_editor_main').css('marginLeft',0);
            }
            setTimeout(function(){
            	 if(_this.ace_active != '') _this.editor[_this.ace_active].ace.resize();
            },600);
        });
		// ??????????????????
		$('.ace_conter_tips').on('click','a',function(){
			_this.event_ecovery_file(this);
		});
		// ????????????
		$('.ace_catalogue_list').on('mousedown','.has-children .file_fold',function(e){
			var x = e.clientX,y = e.clientY,_left = $('.aceEditors')[0].offsetLeft,_top = $('.aceEditors')[0].offsetTop,_that = $('.ace_catalogue_list .has-children .file_fold'),_active =$('.ace_catalogue_list .has-children .file_fold.edit_file_group');
			$('.ace_toolbar_menu').hide();
			if(e.which === 3){
				if($(this).hasClass('edit_file_group')) return false;
				$('.ace_catalogue_menu').css({'display':'block','left':x-_left,'top':y-_top});
				_that.removeClass('bg');
				$(this).addClass('bg');
				_active.attr('data-edit') != '2'?_active.parent().remove():'';
				_that.removeClass('edit_file_group').removeAttr('data-edit');
				_that.find('.file_input').siblings().show();
				_that.find('.file_input').remove();
				$('.ace_catalogue_menu li').show();
				if($(this).attr('data-file') == 'Dir'){
					$('.ace_catalogue_menu li:nth-child(6)').hide();
				}else{
					$('.ace_catalogue_menu li:nth-child(-n+4)').hide();
				}
				$(document).click(function(){
					$('.ace_catalogue_menu').hide();
					$(this).unbind('click');
					return false;
				});
				_this.refresh_config = {
					el:$(this).parent().parent()[0],
					path:_this.get_file_dir($(this).parent().attr('data-menu-path'),1),
					group:parseInt($(this).attr('data-group')),
					is_empty:true
				}
			}
		});
		// ????????????????????????
		$('.ace_catalogue_menu li').click(function(e){
			_this.newly_file_type(this);
		});
		// ??????????????????????????????
		$('.ace_catalogue_list').on('click','.has-children .edit_file_group .glyphicon-ok',function(){
			var _file_or_dir = $(this).parent().find('input').val(),
			_file_type = $(this).parent().parent().attr('data-file'),
			_path = $('.has-children .file_fold.bg').parent().attr('data-menu-path'),
			_type = parseInt($(this).parent().parent().attr('data-edit'));
			if($(this).parent().parent().parent().attr('data-menu-path') === undefined && parseInt($(this).parent().parent().attr('data-group')) === 1){
			    console.log('?????????')
			    _path = $('.ace_catalogue_title').attr('title');
			}
// 			return false;
			if(_file_or_dir === ''){
				$(this).prev().css('border','1px solid #f34a4a');
				layer.tips(_type===0?'????????????????????????':(_type===1?'?????????????????????':'?????????????????????'),$(this).prev(),{tips: [1,'#f34a4a'],time:0});
				return false;
			}else if($(this).prev().attr('data-type') == 0){
				return false;
			}
			switch(_type){
				case 0: //???????????????
					_this.event_create_dir({ path:_path+'/'+_file_or_dir });
				break;
				case 1: //????????????
					_this.event_create_file({ path:_path+'/'+_file_or_dir });
				break;
				case 2: //?????????
					_this.event_rename_currency({ sfile:_path,dfile:_this.get_file_dir(_path,1)+'/'+_file_or_dir});
				break;
			}
		});
		// ??????????????????????????????
		$('.ace_catalogue_list').on('keyup','.has-children .edit_file_group input',function(e){
			var _type = $(this).parent().parent().attr('data-edit'),
			_arry = $('.has-children .file_fold.bg+ul>li');
			if(_arry.length == 0 && $(this).parent().parent().attr('data-group') == 1) _arry = $('.cd-accordion-menu>li')
			if(_type != 2){
				for(var i=0;i<_arry.length;i++){
					if($(_arry[i]).find('.file_title span').html() === $(this).val()){
						$(this).css('border','1px solid #f34a4a');
						$(this).attr('data-type',0);
						layer.tips(_type == 0?'??????????????????????????????':'??????????????????????????????',$(this)[0],{tips: [1,'#f34a4a'],time:0});
						return false
					}
				}
			}
			if(_type == 1 && $(this).val().indexOf('.')) $(this).prev().removeAttr('class').addClass(_this.get_file_suffix($(this).val())+'-icon');
			$(this).attr('data-type',1);
			$(this).css('border','1px solid #528bff');
			layer.closeAll('tips');
			if(e.keyCode === 13) $(this).next().click();
			$('.ace_toolbar_menu').hide();
			$('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
			e.stopPropagation();
			e.preventDefault();
		});
		// ??????????????????????????????????????????
		$('.ace_catalogue_list').on('click','.has-children .edit_file_group .glyphicon-remove',function(){
			layer.closeAll('tips');
			if($(this).parent().parent().parent().attr('data-menu-path')){
				$(this).parent().parent().removeClass('edit_file_group').removeAttr('data-edit');
				$(this).parent().siblings().show();
				$(this).parent().remove();
				return false;
			}
			$(this).parent().parent().parent().remove();
		});
		//???????????????????????????
		$('.ace_catalogue_list')[0].oncontextmenu=function(){
			return false;
		}
		$('.ace_conter_menu').dragsort({
			dragSelector:'.icon_file',
			itemSelector:'li'
		});
		this.setEditorView();
		this.reader_file_dir_menu();
	},
    // 	?????????????????????????????????type???session???local
	setStorage:function(type,key,val){
	    if(type != "local" && type != "session")  val = key,key = type,type = 'session';
	    window[type+'Storage'].setItem(key,val);
	},
	//???????????????????????????????????????type???session???local
	getStorage:function(type,key){
	    if(type != "local" && type != "session")  key = type,type = 'session';
	    return window[type+'Storage'].getItem(key);
	},
	//???????????????????????????????????????type???session???local
	removeStorage:function(type,key){
	    if(type != "local" && type != "session")  key = type,type = 'session';
	    window[type+'Storage'].removeItem(key);
	},
    // 	???????????????????????????????????????
	clearStorage:function(type){
	    if(type != "local" && type != "session")  key = type,type = 'session';
	    window[type+'Storage'].clear();
	},
	
	// ??????????????????
	newly_file_type:function(that){
		var _type = parseInt($(that).attr('data-type')),
			_active = $('.ace_catalogue .ace_catalogue_list .has-children .file_fold.bg'),
			_group = parseInt(_active.attr('data-group')),
			_path = _active.parent().attr('data-menu-path'), //?????????????????????
			_this = this;
			console.log(_type);
		switch(_type){
			case 0: //????????????
				_active.next().empty();
				_this.reader_file_dir_menu({
					el:_active.next(),
					path:_path,
					group:parseInt(_active.attr('data-group')) + 1,
					is_empty:true
				},function(){
					layer.msg('????????????',{icon:1});
				});
			break;
			case 1: //????????????
				_this.menu_path = _path;
				_this.reader_file_dir_menu({
					el:'.cd-accordion-menu',
					path:_this.menu_path,
					group:1,
					is_empty:true
				});
			break;
			case 2: //????????????
			case 3:
				if(this.get_file_dir(_path,1) != this.menu_path){ //????????????????????????????????????????????????
					this.reader_file_dir_menu({el:_active,path:_path,group:_group+1},function(res){
						_this.newly_file_type_dom(_active,_group, _type == 2?0:1);
					});
				}else{
					_this.newly_file_type_dom(_active,_group,_type == 2?0:1);
				}
			break;
			case 4: //???????????????
				var _types = _active.attr('data-file');
				if(_active.hasClass('active')){
					layer.msg('???????????????????????????????????????',{icon:0});
					return false;
				}
				_active.attr('data-edit',2);
				_active.addClass('edit_file_group');
				_active.find('.file_title').hide();
				_active.find('.glyphicon').hide();
				_active.prepend('<span class="file_input"><i class="'+ (_types === 'Dir'?'folder':(_this.get_file_suffix(_active.find('.file_title span').html()))) +'-icon"></i><input type="text" class="newly_file_input" value="'+ (_active.find('.file_title span').html()) +'"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>')
				$('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 -5)-20-30-53);
				$('.file_fold .newly_file_input').focus();
			break;
			case 5:
				window.open('/download?filename=' + encodeURIComponent(_path));
			break;
			case 6:
				var is_files =  _active.attr('data-file') === 'Files'
				layer.confirm(lan.get(is_files?'recycle_bin_confirm':'recycle_bin_confirm_dir', [_active.find('.file_title span').html()]), { title: is_files?lan.files.del_file:lan.files.del_dir, closeBtn: 2, icon: 3 }, function (index) {
					_this[is_files?'del_file_req':'del_dir_req']({path:_path},function(res){
						layer.msg(res.msg,{icon:res.status?1:2});
						if(res.status){
							if(_active.attr('data-group') != 1) _active.parent().parent().prev().addClass('bg')
							_this.reader_file_dir_menu(_this.refresh_config,function(){
								layer.msg(res.msg,{icon:1});
							});
						}
					});
				});
			break;
		}
	},
	// ????????????????????????
	newly_file_type_dom:function(_active,_group,_type,_val){
		var _html = '',_this = this,_nextLength = _active.next(':not(.ace_catalogue_menu)').length;
		if(_nextLength > 0){
			_active.next().show();
			_active.find('.glyphicon').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
		}
		_html += '<li class="has-children children_'+ (_group+1) +'"><div class="file_fold edit_file_group group_'+ (_group+1) +'" data-group="'+ (_group+1) +'" data-edit="'+ _type +'"><span class="file_input">';
		_html += '<i class="'+ (_type == 0?'folder':(_type == 1?'text':(_this.get_file_suffix(_val || '')))) +'-icon"></i>'
		_html += '<input type="text" class="newly_file_input" value="'+ (_val != undefined?_val:'') +'">'
		_html += '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span></div></li>'
		if(_nextLength > 0){
			_active.next().prepend(_html);
		}else{
			_active.prepend(_html);
		}
		setTimeout(function(){
		    $('.newly_file_input').focus()
		},100)
		$('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 -5)-20-30-53);
		return false;
	},
	// ?????????????????????
	event_rename_currency:function(obj){
		var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group'),_this = this;
		this.rename_currency_req({sfile:obj.sfile,dfile:obj.dfile},function(res){
			layer.msg(res.msg,{icon:res.status?1:2});
			if(res.status){
				_this.reader_file_dir_menu(_this.refresh_config,function(){
					layer.msg(res.msg,{icon:1});
				});
			}else{
				_active.find('.file_input').siblings().show();
				_active.find('.file_input').remove();
				_active.removeClass('edit_file_group').removeAttr('data-edit');
			}
		})
	},
	// ????????????????????????
	event_create_dir:function(obj){
		var _this = this;
		this.create_dir_req({path:obj.path},function(res){
			layer.msg(res.msg,{icon:res.status?1:2});
			if(res.status){
				_this.reader_file_dir_menu(_this.refresh_config,function(){
					layer.msg(res.msg,{icon:1});
				});
			}
		})
	},
	// ??????????????????
	event_create_file:function(obj){
		var _this = this;
		this.create_file_req({path:obj.path},function(res){
			layer.msg(res.msg,{icon:res.status?1:2});
			if(res.status){
				_this.reader_file_dir_menu(_this.refresh_config,function(){
					layer.msg(res.msg,{icon:1});
					_this.openEditorView(obj.path);
				});
			}
		})
	},
	// ???????????????
	rename_currency_req:function(obj,callback){
		var loadT = layer.msg('??????????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=MvFile",{
			sfile:obj.sfile,
			dfile:obj.dfile,
			rename:'true'
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},	
	// ??????????????????
	create_file_req:function(obj,callback){
		var loadT = layer.msg('??????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=CreateFile",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ??????????????????
	create_dir_req:function(obj,callback){
		var loadT = layer.msg('??????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=CreateDir",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ??????????????????
	del_file_req:function(obj,callback){
		var loadT = layer.msg('??????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=DeleteFile",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ??????????????????
	del_dir_req:function(obj,callback){
		var loadT = layer.msg('????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=DeleteDir",{
			path:obj.path
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ??????????????????
	auto_save_temp:function(obj,callback){
		// var loadT = layer.msg('??????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=auto_save_temp",{
			filename:obj.filename,
			body:obj.body
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ????????????????????????
	get_auto_save_body:function(obj,callback){
		var loadT = layer.msg('????????????????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=get_auto_save_body",{
			filename:obj.filename
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ????????????????????????
	event_ecovery_file:function(that){
		var _path = $(that).attr('data-path'),_history = new Number($(that).attr('data-history')),_this =this;
		var loadT = layer.open({
			type: 1,
			area: ['400px', '180px'],
			title: '??????????????????',
			content: '<div class="ace-clear-form">\
				<div class="clear-icon"></div>\
				<div class="clear-title">????????????????????????&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + bt.format_data(_history) + '">' + bt.format_data(_history) + '</span>?</div>\
				<div class="clear-tips">????????????????????????????????????????????????????????????</div>\
				<div class="ace-clear-btn" style="">\
					<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">??????</button>\
					<button type="button" class="btn btn-sm btn-success" data-type="0">??????????????????</button>\
				</div>\
			</div>',
			success:function (layero,index) {
				$('.ace-clear-btn .btn').click(function () {
					var _type = $(this).attr('data-type');
					switch (_type) {
						case '0':
							_this.recovery_file_history({
								filename:_path,
								history:_history
							},function(res){
								layer.close(index);
								layer.msg(res.status?'????????????????????????':'????????????????????????',{icon:res.status?1:2});
								if(res.status){
									if(_this.editor[_this.ace_active].historys_file){
										_this.removeEditor(_this.ace_active);
									}
									if($('.ace_conter_menu>[title="'+ _path +'"]').length>0){
										$('.ace_header .refreshs').click();
										layer.close(_this.layer_view);
									}
								}
							});
						break;
						case '1':
							layer.close(index);
						break;
					}
				});
			}
		});
	},
	// ???????????????????????????
	is_file_history:function(_item){
		if(_item == undefined) return false;
		if(_item.historys_file){
			$('.ace_conter_tips').show();
			$('#ace_editor_'+_item.id).css('bottom','50px');
			$('.ace_conter_tips .tips').html('????????????????????????'+ _item.path +'??????????????? [ '+ bt.format_data(new Number(_item.historys_active)) +' ]<a href="javascript:;" class="ml35 btlink" style="margin-left:35px" data-path="'+ _item.path +'" data-history="'+ _item.historys_active +'">??????????????????????????????</a>');
		}else{
			$('.ace_conter_tips').hide();
		}
	},
	// ????????????????????????
	is_file_open:function(path,callabck){
		var is_state = false
		for(var i=0;i<this.pathAarry.length;i++){
			if(path === this.pathAarry[i]) is_state = true
		}
		if(callabck){
			callabck(is_state);
		}else{
			return is_state;
		}
	},
	// ??????????????????
	recovery_file_history:function(obj,callback){
		var loadT = layer.msg('????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']});
		$.post("/files?action=re_history",{
			filename:obj.filename,
			history:obj.history
		},function(res){
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ??????????????????
	get_file_dir_list:function(obj,callback){
		var loadT = layer.msg('????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		if(obj['p'] === undefined) obj['p'] = 1;
		if(obj['showRow'] === undefined) obj['showRow'] = 200;
		if(obj['sort'] === undefined) obj['sort'] = 'name';
		if(obj['reverse'] === undefined) obj['reverse'] = 'False';
		if(obj['search'] === undefined) obj['search'] = '';
		if(obj['all'] === undefined) obj['all'] = 'False';
		$.post("/files?action=GetDir&tojs=GetFiles",{p:obj.p,showRow:obj.showRow,sort:obj.sort,reverse:obj.reverse,path:obj.path,search:obj.search}, function(res) {
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ??????????????????
	get_file_history:function(obj,callback){
		var loadT = layer.msg('??????????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		$.post("/files?action=read_history",{filename:obj.filename,history:obj.history}, function(res) {
			layer.close(loadT);
			if(callback) callback(res);
		});
	},
	// ??????????????????
	reader_file_dir_menu:function(obj,callback){
		var _path = getCookie('Path'),_this = this;
		if(obj === undefined) obj = {}
		if(obj['el'] === undefined) obj['el'] = '.cd-accordion-menu';
		if(obj['group'] === undefined) obj['group'] = 1;
		if(obj['p'] === undefined) obj['p'] = 1;
		if(obj['path'] === undefined) obj['path'] = _path;
		if(obj['search'] === undefined) obj['search'] = '';
		if(obj['is_empty'] === undefined) obj['is_empty'] = false;
		if(obj['all'] === undefined) obj['all'] = 'False'
		this.get_file_dir_list({p:obj.p,path:obj.path,search:obj.search,all:obj.all},function (res){
			var _dir = res.DIR,_files = res.FILES,_dir_dom = '',_files_dom = '',_html ='';
			_this.menu_path = res.PATH;
			for(var i=0;i<_dir.length;i++){
				var _data = _dir[i].split(';');
				if(_data[0] === '__pycache__') continue;
				_dir_dom += '<li class="has-children children_'+ obj.group +'" title="'+ (obj.path+'/'+_data[0]) +'" data-menu-path="'+ (obj.path+'/'+_data[0])+'" data-size="'+ (_data[1]) +'">\
					<div class="file_fold group_'+ obj.group +'" data-group="'+ obj.group +'" data-file="Dir">\
						<span class="glyphicon glyphicon-menu-right"></span>\
						<span class="file_title"><i class="folder-icon"></i><span>'+ _data[0] +'</span></span>\
					</div>\
					<ul data-group=""></ul>\
					<span class="has_children_separator"></span>\
				</li>';
			}
			for(var j=0;j<_files.length;j++){
				var _data = _files[j].split(';');
				if(_data[0].indexOf('.pyc') !== -1) continue;
				_files_dom += '<li class="has-children" title="'+ (obj.path+'/'+_data[0]) +'" data-menu-path="'+ (obj.path+'/'+_data[0])+'" data-size="'+ (_data[1]) +'" data-suffix="'+ _this.get_file_suffix(_data[0]) +'">\
					<div class="file_fold  group_'+ obj.group +'" data-group="'+ obj.group +'" data-file="Files">\
						<span class="file_title"><i class="'+ _this.get_file_suffix(_data[0]) +'-icon"></i><span>'+ _data[0] +'</span></span>\
					</div>\
				</li>';
			}
			if(res.PATH !== '/' && obj['group'] === 1){
				$('.upper_level').attr('data-menu-path',_this.get_file_dir(res.PATH,1));
				$('.ace_catalogue_title').html('?????????'+ res.PATH).attr('title',res.PATH);
				$('.upper_level').html('<i class="glyphicon glyphicon-share-alt" aria-hidden="true"></i>?????????')
			}else if(res.PATH === '/'){
				$('.upper_level').html('<i class="glyphicon glyphicon-hdd" aria-hidden="true"></i>?????????')
			}
			if(obj.is_empty) $(obj.el).empty();
			$(obj.el).append(_html+_dir_dom+_files_dom);
			if(callback) callback(res);
		});
	},
	// ????????????????????????
	get_file_dir:function(path,num){
		var _arry = path.split('/');
		if(path === '/') return '/';
		_arry.splice(-1,num);
		return _arry == ''?'/':_arry.join('/');
	},
	// ??????????????????
	get_file_suffix:function(fileName){
		var filenames = fileName.match(/\.([0-9A-z]*)$/);
		filenames = (filenames == null?'text':filenames[1]);
		for (var name in this.aceConfig.supportedModes) {
			var data = this.aceConfig.supportedModes[name],suffixs = data[0].split('|'),filename = name.toLowerCase();
			for (var i = 0; i < suffixs.length; i++) {
				if (filenames == suffixs[i]) return filename;
			}
		}
		return 'text';
	},
    // ?????????????????????
    setEditorView:function () {
    	var aceEditorHeight = $('.aceEditors').height(),_this = this;
    	var autoAceHeight = setInterval(function(){
    		var page_height = $('.aceEditors').height();
	        var ace_conter_menu = $('.ace_conter_menu').height();
	        var ace_conter_toolbar = $('.ace_conter_toolbar').height();
	        var _height = page_height - ($('.pull-down .glyphicon').hasClass('glyphicon-menu-down')?35:0) - ace_conter_menu - ace_conter_toolbar - 42;
	        $('.ace_conter_editor').height(_height);
	        if(aceEditorHeight == $('.aceEditors').height()){
	        	if(_this.ace_active) _this.editor[_this.ace_active].ace.resize();
	        	clearInterval(autoAceHeight);
	        }else {
	        	aceEditorHeight = $('.aceEditors').height();
	        }
    	},200);
    },
	// ????????????????????????
	getEncodingList: function (type) {
		var _option = '';
		for (var i = 0; i < this.aceConfig.encodingList.length; i++) {
			var item = this.aceConfig.encodingList[i] == type.toUpperCase();
			_option += '<li data- data-value="' + this.aceConfig.encodingList[i] + '" ' + (item ? 'class="active"' : '') + '>' + this.aceConfig.encodingList[i] + (item ?'<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>';
		}
		$('.menu-encoding ul').html(_option);
	},
	// ????????????????????????
	getRelevanceList: function (fileName) {
		var _option = '', _top = 0, fileType = this.getFileType(fileName), _set_tops = 0;
		for (var name in this.aceConfig.supportedModes) {
			var data = this.aceConfig.supportedModes[name],item = (name == fileType.name);
			_option += '<li data-height="' + _top + '" data-rule="' + this.aceConfig.supportedModes[name] + '" data-value="' + name + '" ' + (item ? 'class="active"' : '') + '>' + (this.aceConfig.nameOverrides[name] || name) + (item ?'<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>'
			if (item) _set_tops = _top
			_top += 35;
		}
		$('.menu-files ul').html(_option);
		$('.menu-files ul').scrollTop(_set_tops);
	},
	// ??????????????????
	searchRelevance: function (search) {
		if(search == undefined) search = '';
		$('.menu-files ul li').each(function (index, el) {
			var val = $(this).attr('data-value').toLowerCase(),
				rule = $(this).attr('data-rule'),
				suffixs = rule.split('|'),
				_suffixs = false;
				search = search.toLowerCase();
			for (var i = 0; i < suffixs.length; i++) {
				if (suffixs[i].indexOf(search) > -1) _suffixs = true 
			}
			if (search == '') {
				$(this).removeAttr('style');
			} else {
				if (val.indexOf(search) == -1) {
					$(this).attr('style', 'display:none');
				} else {
					$(this).removeAttr('style');
				}
				if (_suffixs)  $(this).removeAttr('style')
			}
		});
	},
	// ??????????????????
	setEncodingType: function (encode) {
		this.getEncodingList('UTF-8');
		$('.menu-encoding ul li').click(function (e) {
			layer.msg('?????????????????????' + $(this).attr('data-value'));
			$(this).addClass('active').append('<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>').siblings().removeClass('active').find('span').remove();
		});
	},
	// ???????????????
	currentStatusBar: function(id){
		var _item = this.editor[id];
		if(_item == undefined){
			this.removerStatusBar();
			return false;
		}
		$('.ace_conter_toolbar [data-type="cursor"]').html('???<i class="cursor-row">1</i>,???<i class="cursor-line">0</i>');
		$('.ace_conter_toolbar [data-type="history"]').html('???????????????<i>'+ (_item.historys.length === 0?'???':_item.historys.length+'???') +'</i>');
		$('.ace_conter_toolbar [data-type="path"]').html('???????????????<i title="'+ _item.path +'">'+ _item.path +'</i>');
		$('.ace_conter_toolbar [data-type="tab"]').html(_item.softTabs?'?????????<i>'+ _item.tabSize +'</i>':'??????????????????<i>'+ _item.tabSize +'</i>');
		$('.ace_conter_toolbar [data-type="encoding"]').html('?????????<i>'+ _item.encoding.toUpperCase() +'</i>');
		$('.ace_conter_toolbar [data-type="lang"]').html('?????????<i>'+ _item.type +'</i>');
		$('.ace_conter_toolbar span').attr('data-id',id);
		$('.file_fold').removeClass('bg');
		$('[data-menu-path="'+ (_item.path) +'"]').find('.file_fold').addClass('bg');
		if(_item.historys_file){
			$('.ace_conter_toolbar [data-type="history"]').hide();
		}else{
			$('.ace_conter_toolbar [data-type="history"]').show();
		}
		_item.ace.resize();
	},
	// ???????????????
	removerStatusBar:function(){
		$('.ace_conter_toolbar [data-type="history"]').html('');
		$('.ace_conter_toolbar [data-type="path"]').html('');
		$('.ace_conter_toolbar [data-type="tab"]').html('');
		$('.ace_conter_toolbar [data-type="cursor"]').html('');
		$('.ace_conter_toolbar [data-type="encoding"]').html('');
		$('.ace_conter_toolbar [data-type="lang"]').html('');
	},
	// ??????ACE?????????-??????
	creationEditor: function (obj, callabck) {
		var _this = this;
		$('#ace_editor_' + obj.id).text(obj.data || '');
		$('.ace_conter_editor .ace_editors').css('fontSize', _this.fontSize+'px');
		if(this.editor == null) this.editor = {};
		this.editor[obj.id] = {
			ace: ace.edit("ace_editor_" + obj.id, {
				theme: "ace/theme/"+_this.aceConfig.aceEditor.editorTheme, //??????
				mode: "ace/mode/" + (obj.fileName != undefined ? obj.mode : 'text'), // ????????????
				wrap: _this.aceConfig.aceEditor.wrap,
				showInvisibles:_this.aceConfig.aceEditor.showInvisibles,
				showPrintMargin: false,
				enableBasicAutocompletion: true,
				enableSnippets: _this.aceConfig.aceEditor.enableSnippets,
				enableLiveAutocompletion: _this.aceConfig.aceEditor.enableLiveAutocompletion,
				useSoftTabs:_this.aceConfig.aceEditor.useSoftTabs,
				tabSize:_this.aceConfig.aceEditor.tabSize,
				keyboardHandler:'sublime',
				readOnly:obj.readOnly === undefined?false:obj.readOnly
			}), //ACE???????????????
			id: obj.id,
			wrap: _this.aceConfig.aceEditor.wrap, //????????????
			path:obj.path,
			tabSize:_this.aceConfig.aceEditor.tabSize,
			softTabs:_this.aceConfig.aceEditor.useSoftTabs,
			fileName:obj.fileName,
			enableSnippets: true, //??????????????????
			encoding: (obj.encoding != undefined ? obj.encoding : 'utf-8'), //????????????
			mode: (obj.fileName != undefined ? obj.mode : 'text'), //????????????
			type:obj.type,
            fileType: 0, //???????????? 
			historys: obj.historys,
			historys_file:obj.historys_file === undefined?false:obj.historys_file,
			historys_active:obj.historys_active === ''?false:obj.historys_active
		};
		var ACE = this.editor[obj.id];
		ACE.ace.moveCursorTo(0, 0); //??????????????????
		ACE.ace.focus();//????????????
		ACE.ace.resize(); //???????????????
		ACE.ace.commands.addCommand({
			name: '????????????',
			bindKey: {
				win: 'Ctrl-S',
				mac: 'Command-S'
			},
			exec: function (editor) {
				_this.saveFileMethod(ACE);
			},
			readOnly: false // ????????????????????????????????????????????????false
		});
		ACE.ace.commands.addCommand({
			name: '?????????',
			bindKey: {
				win: 'Ctrl-I',
				mac: 'Command-I'
			},
			exec: function (editor) {
				$('.ace_header .jumpLine').click();
			},
			readOnly: false // ????????????????????????????????????????????????false
		})
		// ??????????????????
		ACE.ace.getSession().selection.on('changeCursor', function(e) {
			var _cursor = ACE.ace.selection.getCursor();
			$('[data-type="cursor"]').html('???<i class="cursor-row">'+ (_cursor.row + 1) +'</i>,???<i class="cursor-line">'+ _cursor.column +'</i>');
		});

		// ??????????????????
		ACE.ace.getSession().on('change', function (editor) {
			$('.item_tab_' + ACE.id + ' .icon-tool').addClass('glyphicon-exclamation-sign').removeClass('glyphicon-remove').attr('data-file-state', '1');
			ACE.fileType = 1;
			$('.ace_toolbar_menu').hide();
		});
		this.currentStatusBar(ACE.id);
		this.is_file_history(ACE);
	},
	// ??????????????????
	saveFileMethod:function(ACE){
		if($('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state') == 0){
			layer.msg('????????????????????????????????????!');
			return false;
		}
		$('.item_tab_' + ACE.id + ' .icon-tool').attr('title','???????????????????????????..').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-repeat');
		layer.msg('???????????????????????????<img src="/static/img/ns-loading.gif" style="width:15px;margin-left:5px">',{icon:0});
		this.saveFileBody({
			path: ACE.path,
			data: ACE.ace.getValue(),
			encoding: ACE.encoding
		}, function (res) {
			ACE.fileType = 0;
			$('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state','0').removeClass('glyphicon-repeat').addClass('glyphicon-remove');
		},function(res){
			ACE.fileType = 1;
			$('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state','1').removeClass('glyphicon-remove').addClass('glyphicon-repeat');
		});
	},
	// ??????????????????
	getFileType: function (fileName) {
		var filenames = fileName.match(/\.([0-9A-z]*)$/);
		filenames = (filenames == null?'text':filenames[1]);
		for (var name in this.aceConfig.supportedModes) {
			var data = this.aceConfig.supportedModes[name],suffixs = data[0].split('|'),filename = name.toLowerCase();
			for (var i = 0; i < suffixs.length; i++) {
				if (filenames == suffixs[i]){
					return { name: name,mode: filename };
				}
			}
		}
		return {name:'Text',mode:'text'};
	},
	// ?????????????????????-??????
	addEditorView: function (type,conifg) {
		if(type == undefined) type = 0
		var _index = this.editorLength,_id = bt.get_random(8);
		$('.ace_conter_menu .item').removeClass('active');
		$('.ace_conter_editor .ace_editors').removeClass('active');
		$('.ace_conter_menu').append('<li class="item active item_tab_'+_id+'" data-type="shortcutKeys" data-id="'+ _id +'" >\
			<div class="ace_item_box">\
				<span class="icon_file"><i class="text-icon"></i></span>\
				<span>'+ (type?conifg.title:('????????????-'+ _index)) +'</span>\
				<i class="glyphicon icon-tool glyphicon-remove" aria-hidden="true" data-file-state="0" data-title="'+ (type?conifg.title:('????????????-'+ _index)) +'"></i>\
			</div>\
		</li>');
		$('#ace_editor_' + _id).siblings().removeClass('active');
		$('.ace_conter_editor').append('<div id="ace_editor_'+_id+'" class="ace_editors active">'+ (type?aceShortcutKeys.innerHTML:'') +'</div>');
		switch(type){
			case 0:
				this.creationEditor({ id: _id });
				this.editorLength = this.editorLength + 1;
			break;
			case 1:
				this.removerStatusBar();
				this.editorLength = this.editorLength + 1;
			break;
		}
	},
	// ?????????????????????-??????
	removeEditor: function (id) {
		if(id == undefined) id = this.ace_active;
		if ($('.item_tab_' + id).next().length != 0 && this.editorLength != 1) {
			$('.item_tab_' + id).next().click();
		} else if($('.item_tab_' + id).prev.length !=  0 && this.editorLength != 1){
			$('.item_tab_' + id).prev().click();
		}
		$('.item_tab_' + id).remove();
		$('#ace_editor_' + id).remove();
		this.editorLength --;
		if(this.editor[id] == undefined) return false;
		for(var i=0;i<this.pathAarry.length;i++){
		    if(this.pathAarry[i] == this.editor[id].path){
		        this.pathAarry.splice(i,1);
		    }
		}
		if(!this.editor[id].historys_file) $('[data-menu-path="'+ (this.editor[id].path) +'"]').find('.file_fold').removeClass('active bg');
		this.editor[id].ace.destroy();
		delete this.editor[id];
		if(this.editorLength === 0){
			this.ace_active = '';
			this.pathAarry = [];
			this.removerStatusBar();
		}else{
			this.currentStatusBar(this.ace_active);
		}
		if(this.ace_active != '') this.is_file_history(this.editor[this.ace_active]);
	},
	// ????????????????????????-??????
	openHistoryEditorView: function (obj,callback) {
		// ???????????????type????????????JavaScript??? ??????????????????mode????????????text?????????????????????id,?????????x8AmsnYn?????????????????????index,?????????0?????????????????? (path????????????/www/root/)
		var _this = this,path = obj.filename,paths = path.split('/'),_fileName = paths[paths.length - 1],_fileType = this.getFileType(_fileName),_type = _fileType.name,_mode = _fileType.mode,_id = bt.get_random(8),_index = this.editorLength;
		this.get_file_history({filename:obj.filename,history:obj.history}, function (res) {
			_this.pathAarry.push(path);
			$('.ace_conter_menu .item').removeClass('active');
			$('.ace_conter_editor .ace_editors').removeClass('active');
			$('.ace_conter_menu').append('<li class="item active item_tab_' + _id +'" title="'+ path +'" data-type="'+ _type +'" data-mode="'+ _mode +'" data-id="'+ _id +'" data-fileName="'+ _fileName +'">'+
				'<div class="ace_item_box">'+
					'<span class="icon_file"><img src="/static/img/ico-history.png"></span><span title="'+ path + ' ????????????[ '+ bt.format_data(obj.history) +' ]' +'">' + _fileName +'</span>'+
					'<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>'+
				'</div>'+
			'</li>');
			$('.ace_conter_editor').append('<div id="ace_editor_'+_id +'" class="ace_editors active"></div>');
			$('[data-paths="'+ path +'"]').find('.file_fold').addClass('active bg');
			_this.ace_active = _id;
			_this.editorLength = _this.editorLength + 1;
			_this.creationEditor({id: _id,fileName: _fileName,path: path,mode:_mode,encoding: res.encoding,data: res.data,type:_type,historys:res.historys,readOnly:true,historys_file:true,historys_active:obj.history});
			if(callback) callback(res);
		});
	},
	// ?????????????????????-??????
	openEditorView: function (path,callback) {
		if(path == undefined) return false;
		// ???????????????type????????????JavaScript??? ??????????????????mode????????????text?????????????????????id,?????????x8AmsnYn?????????????????????index,?????????0?????????????????? (path????????????/www/root/)
	    var _this = this,paths = path.split('/'),_fileName = paths[paths.length - 1],_fileType = this.getFileType(_fileName),_type = _fileType.name,_mode = _fileType.mode,_id = bt.get_random(8),_index = this.editorLength;
		_this.is_file_open(path,function(is_state){
			if(is_state){
				$('.ace_conter_menu').find('[title="'+ path +'"]').click();
			}else{
				_this.getFileBody({path: path}, function (res) {
				    _this.pathAarry.push(path);
				    $('.ace_conter_menu .item').removeClass('active');
		    		$('.ace_conter_editor .ace_editors').removeClass('active');
		    		$('.ace_conter_menu').append('<li class="item active item_tab_' + _id +'" title="'+ path +'" data-type="'+ _type +'" data-mode="'+ _mode +'" data-id="'+ _id +'" data-fileName="'+ _fileName +'">'+
		    			'<div class="ace_item_box">'+
			    			'<span class="icon_file"><i class="'+ _mode +'-icon"></i></span><span title="'+ path +'">' + _fileName + '</span>'+
			    			'<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>'+
			    		'</div>'+
		    		'</li>');
		    		$('.ace_conter_editor').append('<div id="ace_editor_'+_id +'" class="ace_editors active" style="font-size:'+ aceEditor.aceConfig.aceEditor.fontSize +'px"></div>');
					$('[data-menu-path="'+ path +'"]').find('.file_fold').addClass('active bg');
					_this.ace_active = _id;
				    _this.editorLength = _this.editorLength + 1;
					_this.creationEditor({id: _id,fileName: _fileName,path: path,mode:_mode,encoding: res.encoding,data: res.data,type:_type,historys:res.historys});
					if(callback) callback(res);
				});
			}
		});
		$('.ace_toolbar_menu').hide();
	},
	// ?????????????????????-??????
	getFavoriteList: function () {},
	// ??????????????????-??????
	getFileList: function () {},
	// ??????????????????-??????
	getFileBody: function (obj, callback) {
		var loadT = layer.msg('????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		$.post("/files?action=GetFileBody", "path=" + encodeURIComponent(obj.path), function(res) {
			layer.close(loadT);
			if (!res.status) {
				if(_this.editorLength == 0) layer.closeAll();
				layer.msg(res.msg, {icon: 2});
				
				return false;
			}else{
				if(!aceEditor.isAceView){
				    var _path =  obj.path.split('/');
					layer.msg('??????????????????'+ (_path[_path.length-1]) +'???');
				}
			}
			if (callback) callback(res);
		});
	},
	// ??????????????????-??????
	saveFileBody: function (obj,success,error) {
		$.ajax({
			type:'post',
			url:'/files?action=SaveFileBody',
			timeout: 7000, //????????????????????????
			data:{
				data:obj.data,
				encoding:obj.encoding.toLowerCase(),
				path:obj.path
			},
			success:function(rdata){
				if(rdata.status){
					if(success) success(rdata)
				}else{
					if(error) error(rdata)
				}
				if(!obj.tips) layer.msg(rdata.msg,{icon:rdata.status?1:2});
			},
			error:function(err){
			    if(error) error(err)
			}
		});
	},
// 	??????ace??????
	saveAceConfig:function(data,callback){
		var loadT = layer.msg('????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		this.saveFileBody({
			path:'/www/server/panel/BTPanel/static/ace/ace.editor.config.json',
			data:JSON.stringify(data),
			encoding:'utf-8',
			tips:true,
		},function(rdata){
			layer.close(loadT);
			_this.setStorage('aceConfig',JSON.stringify(data));
			if(callback) callback(rdata);
		});
	},
	// ??????????????????
	getAceConfig:function(callback){
		var loadT = layer.msg('????????????????????????????????????...',{time: 0,icon: 16,shade: [0.3, '#000']}),_this = this;
		this.getFileBody({path:'/www/server/panel/BTPanel/static/ace/ace.editor.config.json'},function(rdata){
			layer.close(loadT);
			_this.setStorage('aceConfig',JSON.stringify(rdata.data));
			if(callback) callback(JSON.parse(rdata.data));
		});
	},
	// ??????????????????
	saveAllFileBody:function(arry,num,callabck) {
		var _this = this;
		if(typeof num == "function"){
			callabck = num; num = 0;
		}else if(typeof num == "undefined"){
			num = 0;
		}
		if(num == arry.length){
			if(callabck) callabck();
			layer.msg('??????????????????',{icon:1});
			return false;
		}
		aceEditor.saveFileBody({
			path: arry[num].path,
			data: arry[num].data,
			encoding: arry[num].encoding
		},function(){
			num = num + 1;
			aceEditor.saveAllFileBody(arry,num,callabck);
		});
	}
}

function openEditorView(type,path){
	var paths = path.split('/'),
	_fileName = paths[paths.length -1], 
		_aceTmplate = document.getElementById("aceTmplate").innerHTML;
		_aceTmplate = _aceTmplate.replace(/\<\\\/script\>/g,'</script>');
	if(aceEditor.editor !== null){
		if(aceEditor.isAceView == false){
			aceEditor.isAceView = true;
			$('.aceEditors .layui-layer-max').click();
		}
		aceEditor.openEditorView(path);
		return false;
	}
	var r = layer.open({
		type: 1,
		maxmin: true,
		shade:false,
		area: ['80%','80%'],
		title: "?????????????????????",
		skin:'aceEditors',
		zIndex:19999,
		content: _aceTmplate,
		success:function(layero,index){
			function set_edit_file(){
				aceEditor.ace_active = '';
				aceEditor.eventEditor();
				ace.require("/ace/ext/language_tools");
				ace.config.set("modePath", "/static/ace");
				ace.config.set("workerPath", "/static/ace");
				ace.config.set("themePath", "/static/ace");
				aceEditor.openEditorView(path);
				$('#ace_conter').addClass(aceEditor.aceConfig.aceEditor.editorTheme);
				$('.aceEditors .layui-layer-min').click(function (e){
					aceEditor.setEditorView();
				});
				$('.aceEditors .layui-layer-max').click(function (e){
					aceEditor.setEditorView();
				});
			}
			var aceConfig =  aceEditor.getStorage('aceConfig');
			if(aceConfig == null){
				// ?????????????????????
				aceEditor.getAceConfig(function(res){
					aceEditor.aceConfig = res; // ??????????????????
					set_edit_file();
				});
            }else{
            	aceEditor.aceConfig = JSON.parse(aceConfig);
            	typeof aceEditor.aceConfig == 'string'?aceEditor.aceConfig = JSON.parse(aceEditor.aceConfig):''
                set_edit_file();
			}
		},
		cancel:function(){
			for(var item in aceEditor.editor){
				if(aceEditor.editor[item].fileType == 1){
					layer.open({
						type: 1,
						area: ['400px', '180px'],
						title: '????????????',
						content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">??????????????????????????????????????????????????????</div>\
							<div class="clear-tips">????????????????????????????????????</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">???????????????</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">??????</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">????????????</button>\
							</div>\
						</div>',
						success: function (layers, indexs) {
							$('.ace-clear-btn button').click(function(){
								var _type = $(this).attr('data-type');
								switch(_type){
									case '2':
										aceEditor.editor = null;
										aceEditor.editorLength = 0;
										aceEditor.pathAarry = [];
										layer.closeAll();
									break;
									case '1':
										layer.close(indexs);
									break;
									case '0':
										var _arry = [],editor = aceEditor['editor'];
										for(var item in editor){
											_arry.push({
												path: editor[item]['path'],
												data: editor[item]['ace'].getValue(),
												encoding: editor[item]['encoding'],
											})
										}
										aceEditor.saveAllFileBody(_arry,function(){
											$('.ace_conter_menu>.item').each(function (el,indexx) {
												var _id = $(this).attr('data-id');
												$(this).find('i').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove').attr('data-file-state','0')
												aceEditor.editor[_id].fileType = 0;
											});
											aceEditor.editor = null;
											aceEditor.pathAarry = [];
											layer.closeAll();
										});
									break;
								}
							});
						}
					});
					return false;
				}
			}
		},
		end:function(){
		    aceEditor.ace_active = '';
		    aceEditor.editor = null;
		    aceEditor.pathAarry = [];
		    aceEditor.menu_path = '';
		}
	});
}


/**
 * AES??????
 * @param {string} s_text ????????????????????????
 * @param {string} s_key 16?????????
 * @param {array} ctx ?????????????????? { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
 * @return {string} 
 */
function aes_encrypt(s_text,s_key,ctx){
	if(ctx == undefined) ctx = { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
	var key = CryptoJS.enc.Utf8.parse(s_key);
	var encrypt_data = CryptoJS.AES.encrypt(s_text,key,ctx);
	return encrypt_data.toString();
}

/**
 * AES??????
 * @param {string} s_text ?????????????????????
 * @param {string} s_key 16?????????
 * @param {array} ctx ?????????????????? { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
 * @return {string}
 */
function aes_decrypt(s_text,s_key,ctx){
	if(ctx == undefined) ctx = { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
	var key = CryptoJS.enc.Utf8.parse(s_key);
	var decrypt_data = CryptoJS.AES.decrypt(s_text,key,ctx);
	return decrypt_data.toString(CryptoJS.enc.Utf8);
}

/**
 * ajax????????????
 * @param {string} data ?????????????????????
 * @param {string} stype ajax????????????????????????
 * @return {string} ????????????????????????
 */
function ajax_decrypt(data,stype){
	if(!data) return data;
	if(data.substring(0,6) == "BT-CRT"){
		var token = $("#request_token_head").attr("token")
		var pwd = token.substring(0,8) + token.substring(40,48)
		data = aes_decrypt(data.substring(6),pwd);
		if(stype == undefined){
			stype = '';
		}
		if(stype.toLowerCase() != 'json'){
			data =  JSON.parse(data);
		}
	}
	return data
}
/**
 * ?????????form_data??????????????????
 * @param {string} form_data ????????????form_data??????
 * @return {string} ????????????form_data??????
 */
function format_form_data(form_data){
	var data_tmp = form_data.split('&');
	var form_info = {}
	var token = $("#request_token_head").attr("token")
	if(!token) return form_data;
	var pwd = token.substring(0,8) + token.substring(40,48)
	for(var i=0;i<data_tmp.length;i++){
		var tmp = data_tmp[i].split('=');
		if(tmp.length < 2) continue;
		var val = decodeURIComponent(tmp[1].replace(/\+/g,'%20'));
		if(val.length > 3){
			form_info[tmp[0]] = 'BT-CRT' + aes_encrypt(val,pwd);
		}else{
			form_info[tmp[0]] = val;
		}
		
	}
	return $.param(form_info);
}

function ajax_encrypt(request){
	if(!this.type || !this.data || !this.contentType) return;
	if($("#panel_debug").attr("data") == 'True') return;
	if($("#panel_debug").attr("data-pyversion") == '2') return;
	if(this.type == 'POST' && this.data.length > 1){
		this.data = format_form_data(this.data);
	}
}


function ajaxSetup() {
    var my_headers = {};
    var request_token_ele = document.getElementById("request_token_head");
    if (request_token_ele) {
        var request_token = request_token_ele.getAttribute('token');
        if (request_token) {
            my_headers['x-http-token'] = request_token
        }
    }
    request_token_cookie = getCookie('request_token');
    if (request_token_cookie) {
        my_headers['x-cookie-token'] = request_token_cookie
    }

    if (my_headers) {
		$.ajaxSetup({ 
			headers: my_headers,
			error: function(jqXHR, textStatus, errorThrown) {
				if(!jqXHR.responseText) return;
				if(typeof(String.prototype.trim) === "undefined"){
					String.prototype.trim = function() 
					{
						return String(this).replace(/^\s+|\s+$/g, '');
					};
				}
				
				error_key = 'We need to make sure this has a favicon so that the debugger does';
				error_find = jqXHR.responseText.indexOf(error_key)
				if(jqXHR.status == 500 && (jqXHR.responseText.indexOf('?????????????????????') != -1 || error_find != -1)){
					if(jqXHR.responseText.indexOf('????????????????????????!') != -1){
						if($('.libLogin').length > 0  || $('.radio_account_view').length > 0) return false;
						bt.pub.bind_btname(function(){
							window.location.reload();
						});
						return;
					}
					if(error_find != -1){
						var error_body = jqXHR.responseText.split('<!--')[2].replace('-->','')
						var tmp = error_body.split('During handling of the above exception, another exception occurred:')
						error_body = tmp[tmp.length-1];
						var error_msg = '<div>\
						<h3 style="margin-bottom: 10px;">??????????????????????????????????????????</h3>\
						<pre style="height:635px;word-wrap: break-word;white-space: pre-wrap;margin: 0 0 0px">'+error_body.trim()+'</pre>\
						<ul class="help-info-text">\
							<li style="list-style: none;"><b>????????????????????????????????????????????????????????????????????????????????????????????????</b></li>\
							<li style="list-style: none;">1??????[??????]????????????????????????????????????????????????????????????</li>\
							<li style="list-style: none;">2?????????????????????????????????????????????????????????????????????????????????????????????, ???????????????<a class="btlink" href="https://www.bt.cn/bbs" target="_blank">https://www.bt.cn/bbs</a></li>\
						</ul>\
					</div>'

					}else{
						var error_msg = jqXHR.responseText;
					}
					$(".layui-layer-padding").parents('.layer-anim').remove();
					$(".layui-layer-shade").remove();
					setTimeout(function(){
						layer.open({
							title: false,
							content: error_msg,
							closeBtn:2,
							area: ["1200px","800px"],
							btn:false,
							shadeClose:false,
							shade:0.3,
							success:function(){
								$('pre').scrollTop(100000000000)
							}
						});
					},100)
				}
			}
		});
	}
}
ajaxSetup();

function RandomStrPwd(b) {
	b = b || 32;
	var c = "AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz2345678";
	var a = c.length;
	var d = "";
	for(i = 0; i < b; i++) {
		d += c.charAt(Math.floor(Math.random() * a))
	}
	return d
}

function repeatPwd(a) {
	$("#MyPassword").val(RandomStrPwd(a))
}

function refresh() {
	window.location.reload()
}

function GetBakPost(b) {
	$(".baktext").hide().prev().show();
	var c = $(".baktext").attr("data-id");
	var a = $(".baktext").val();
	if(a == "") {
		a = lan.bt.empty;
	}
	setWebPs(b, c, a);
	$("a[data-id='" + c + "']").html(a);
	$(".baktext").remove()
}

function setWebPs(b, e, a) {
	var d = layer.load({
		shade: true,
		shadeClose: false
	});
	var c = "ps=" + a;
	$.post("/data?action=setPs", "table=" + b + "&id=" + e + "&" + c, function(f) {
		if(f == true) {
			if(b == "sites") {
				getWeb(1)
			} else {
				if(b == "ftps") {
					getFtp(1)
				} else {
					getData(1)
				}
			}
			layer.closeAll();
			layer.msg(lan.public.edit_ok, {
				icon: 1
			});
		} else {
			layer.msg(lan.public.edit_err, {
				icon: 2
			});
			layer.closeAll();
		}
	});
}

$(".menu-icon").click(function() {
	$(".sidebar-scroll").toggleClass("sidebar-close");
	$(".main-content").toggleClass("main-content-open");
	if($(".sidebar-close")) {
		$(".sub-menu").find(".sub").css("display", "none")
	}
});
var Upload, percentage;

Date.prototype.format = function(b) {
	var c = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		S: this.getMilliseconds()
	};
	if(/(y+)/.test(b)) {
		b = b.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
	}
	for(var a in c) {
		if(new RegExp("(" + a + ")").test(b)) {
			b = b.replace(RegExp.$1, RegExp.$1.length == 1 ? c[a] : ("00" + c[a]).substr(("" + c[a]).length))
		}
	}
	return b
};

function getLocalTime(a) {
	a = a.toString();
	if(a.length > 10) {
		a = a.substring(0, 10)
	}
	return new Date(parseInt(a) * 1000).format("yyyy/MM/dd hh:mm:ss")
}

function ToSize(a) {
	var d = [" B", " KB", " MB", " GB", " TB", " PB"];
	var e = 1024;
	for(var b = 0; b < d.length; b++) {
		if(a < e) {
			return(b == 0 ? a : a.toFixed(2)) + d[b]
		}
		a /= e
	}
}


function ChangePath(d) {
	setCookie("SetId", d);
	setCookie("SetName", "");
	var c = layer.open({
		type: 1,
		area: "650px",
		title: lan.bt.dir,
		closeBtn: 2,
		shift: 5,
		shadeClose: false,
		content: "<div class='changepath'><div class='path-top'><button type='button' class='btn btn-default btn-sm' onclick='BackFile()'><span class='glyphicon glyphicon-share-alt'></span> "+lan.public.return+"</button><div class='place' id='PathPlace'>"+lan.bt.path+"???<span></span></div></div><div class='path-con'><div class='path-con-left'><dl><dt id='changecomlist' onclick='BackMyComputer()'>"+lan.bt.comp+"</dt></dl></div><div class='path-con-right'><ul class='default' id='computerDefautl'></ul><div class='file-list divtable'><table class='table table-hover' style='border:0 none'><thead><tr class='file-list-head'><th width='40%'>"+lan.bt.filename+"</th><th width='20%'>"+lan.bt.etime+"</th><th width='10%'>"+lan.bt.access+"</th><th width='10%'>"+lan.bt.own+"</th><th width='10%'></th></tr></thead><tbody id='tbody' class='list-list'></tbody></table></div></div></div></div><div class='getfile-btn' style='margin-top:0'><button type='button' class='btn btn-default btn-sm pull-left' onclick='CreateFolder()'>"+lan.bt.adddir+"</button><button type='button' class='btn btn-danger btn-sm mr5' onclick=\"layer.close(getCookie('ChangePath'))\">"+lan.public.close+"</button> <button type='button' class='btn btn-success btn-sm' onclick='GetfilePath()'>"+lan.bt.path_ok+"</button></div>"
	});
	setCookie("ChangePath", c);
	var b = $("#" + d).val();
	tmp = b.split(".");
	if(tmp[tmp.length - 1] == "gz") {
		tmp = b.split("/");
		b = "";
		for(var a = 0; a < tmp.length - 1; a++) {
			b += "/" + tmp[a]
		}
		setCookie("SetName", tmp[tmp.length - 1])
	}
	b = b.replace(/\/\//g, "/");
	GetDiskList(b);
	ActiveDisk()
}

function GetDiskList(b) {
	var d = "";
	var a = "";
	var c = "path=" + b + "&disk=True&showRow=500";
	$.post("/files?action=GetDir", c, function(h) {
		if(h.DISK != undefined) {
			for(var f = 0; f < h.DISK.length; f++) {
				a += "<dd onclick=\"GetDiskList('" + h.DISK[f].path + "')\"><span class='glyphicon glyphicon-hdd'></span>&nbsp;<span>" + h.DISK[f].path + "</span></div></dd>"
			}
			$("#changecomlist").html(a)
		}
		for(var f = 0; f < h.DIR.length; f++) {
			var g = h.DIR[f].split(";");
			var e = g[0];
			if(e.length > 20) {
				e = e.substring(0, 20) + "..."
			}
			if(isChineseChar(e)) {
				if(e.length > 10) {
					e = e.substring(0, 10) + "..."
				}
			}
			d += "<tr><td onclick=\"GetDiskList('" + h.PATH + "/" + g[0] + "')\" title='" + g[0] + "'><span class='glyphicon glyphicon-folder-open'></span>" + e + "</td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td><span class='delfile-btn' onclick=\"NewDelFile('" + h.PATH + "/" + g[0] + "')\">X</span></td></tr>"
		}
		if(h.FILES != null && h.FILES != "") {
			for(var f = 0; f < h.FILES.length; f++) {
				var g = h.FILES[f].split(";");
				var e = g[0];
				if(e.length > 20) {
					e = e.substring(0, 20) + "..."
				}
				if(isChineseChar(e)) {
					if(e.length > 10) {
						e = e.substring(0, 10) + "..."
					}
				}
				d += "<tr><td title='" + g[0] + "'><span class='glyphicon glyphicon-file'></span><span>" + e + "</span></td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td></td></tr>"
			}
		}
		$(".default").hide();
		$(".file-list").show();
		$("#tbody").html(d);
		if(h.PATH.substr(h.PATH.length - 1, 1) != "/") {
			h.PATH += "/"
		}
		$("#PathPlace").find("span").html(h.PATH);
		ActiveDisk();
		return
	})
}

function CreateFolder() {
	var a = "<tr><td colspan='2'><span class='glyphicon glyphicon-folder-open'></span> <input id='newFolderName' class='newFolderName' type='text' value=''></td><td colspan='3'><button id='nameOk' type='button' class='btn btn-success btn-sm'>"+lan.public.ok+"</button>&nbsp;&nbsp;<button id='nameNOk' type='button' class='btn btn-default btn-sm'>"+lan.public.cancel+"</button></td></tr>";
	if($("#tbody tr").length == 0) {
		$("#tbody").append(a)
	} else {
		$("#tbody tr:first-child").before(a)
	}
	$(".newFolderName").focus();
	$("#nameOk").click(function() {
		var c = $("#newFolderName").val();
		var b = $("#PathPlace").find("span").text();
		newTxt = b.replace(new RegExp(/(\/\/)/g), "/") + c;
		var d = "path=" + newTxt;
		$.post("/files?action=CreateDir", d, function(e) {
			if(e.status == true) {
				layer.msg(e.msg, {
					icon: 1
				})
			} else {
				layer.msg(e.msg, {
					icon: 2
				})
			}
			GetDiskList(b)
		})
	});
	$("#nameNOk").click(function() {
		$(this).parents("tr").remove()
	})
}

function NewDelFile(c) {
	var a = $("#PathPlace").find("span").text();
	newTxt = c.replace(new RegExp(/(\/\/)/g), "/");
	var b = "path=" + newTxt + "&empty=True";
	$.post("/files?action=DeleteDir", b, function(d) {
		if(d.status == true) {
			layer.msg(d.msg, {
				icon: 1
			})
		} else {
			layer.msg(d.msg, {
				icon: 2
			})
		}
		this.get_file_list(a);
	})
}

function ActiveDisk() {
	var a = $("#PathPlace").find("span").text().substring(0, 1);
	switch(a) {
		case "C":
			$(".path-con-left dd:nth-of-type(1)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "D":
			$(".path-con-left dd:nth-of-type(2)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "E":
			$(".path-con-left dd:nth-of-type(3)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "F":
			$(".path-con-left dd:nth-of-type(4)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "G":
			$(".path-con-left dd:nth-of-type(5)").css("background", "#eee").siblings().removeAttr("style");
			break;
		case "H":
			$(".path-con-left dd:nth-of-type(6)").css("background", "#eee").siblings().removeAttr("style");
			break;
		default:
			$(".path-con-left dd").removeAttr("style")
	}
}

function BackMyComputer() {
	$(".default").show();
	$(".file-list").hide();
	$("#PathPlace").find("span").html("");
	ActiveDisk()
}

function BackFile() {
	var c = $("#PathPlace").find("span").text();
	if(c.substr(c.length - 1, 1) == "/") {
		c = c.substr(0, c.length - 1)
	}
	var d = c.split("/");
	var a = "";
	if(d.length > 1) {
		var e = d.length - 1;
		for(var b = 0; b < e; b++) {
			a += d[b] + "/"
		}
		GetDiskList(a.replace("//", "/"))
	} else {
		a = d[0]
	}
	if(d.length == 1) {}
}

function GetfilePath() {
	var a = $("#PathPlace").find("span").text();
	a = a.replace(new RegExp(/(\\)/g), "/");
	setCookie('path_dir_change',a);
	$("#" + getCookie("SetId")).val(a + getCookie("SetName"));
	layer.close(getCookie("ChangePath"))
}

function setCookie(a, c) {
	var b = 30;
	var d = new Date();
	d.setTime(d.getTime() + b * 24 * 60 * 60 * 1000);
	var is_https = window.location.protocol == 'https:'
	var samesite = ';Secure; Path=/; SameSite=None'
	document.cookie = a + "=" + escape(c) + ";expires=" + d.toGMTString() + (is_https?samesite:'')
}

function getCookie(b) {
	var a, c = new RegExp("(^| )" + b + "=([^;]*)(;|$)");
	if(a = document.cookie.match(c)) {
		return unescape(a[2])
	} else {
		return null
	}
}

function aotuHeight() {
	var a = $("body").height() - 50;
	$(".main-content").css("min-height", a)
}
$(function() {
	aotuHeight()
});
$(window).resize(function() {
	aotuHeight()
});

function showHidePwd() {
	var a = "glyphicon-eye-open",
		b = "glyphicon-eye-close";
	$(".pw-ico").click(function() {
		var g = $(this).attr("class"),
			e = $(this).prev();
		if(g.indexOf(a) > 0) {
			var h = e.attr("data-pw");
			$(this).removeClass(a).addClass(b);
			e.text(h)
		} else {
			$(this).removeClass(b).addClass(a);
			e.text("**********")
		}
		var d = $(this).next().position().left;
		var f = $(this).next().position().top;
		var c = $(this).next().width();
		$(this).next().next().css({
			left: d + c + "px",
			top: f + "px"
		})
	})
}

function openPath(a) {
	setCookie("Path", a);
	window.location.href = "/files"
}

function OnlineEditFile(k, f) {
	if(k != 0) {
		var l = $("#PathPlace input").val();
		var h = encodeURIComponent($("#textBody").val());
		var a = $("select[name=encoding]").val();
		var loadT = layer.msg(lan.bt.save_file, {
			icon: 16,
			time: 0
		});
		$.post("/files?action=SaveFileBody", "data=" + h + "&path=" + encodeURIComponent(f) + "&encoding=" + a, function(m) {
			if(k == 1) {
				layer.close(loadT);
			}
			layer.msg(m.msg, {
				icon: m.status ? 1 : 2
			});
		});
		return
	}
	var e = layer.msg(lan.bt.read_file, {
		icon: 16,
		time: 0
	});
	var g = f.split(".");
	var b = g[g.length - 1];
	var d;
	switch(b) {
		case "html":
			var j = {
				name: "htmlmixed",
				scriptTypes: [{
					matches: /\/x-handlebars-template|\/x-mustache/i,
					mode: null
				}, {
					matches: /(text|application)\/(x-)?vb(a|script)/i,
					mode: "vbscript"
				}]
			};
			d = j;
			break;
		case "htm":
			var j = {
				name: "htmlmixed",
				scriptTypes: [{
					matches: /\/x-handlebars-template|\/x-mustache/i,
					mode: null
				}, {
					matches: /(text|application)\/(x-)?vb(a|script)/i,
					mode: "vbscript"
				}]
			};
			d = j;
			break;
		case "js":
			d = "text/javascript";
			break;
		case "json":
			d = "application/ld+json";
			break;
		case "css":
			d = "text/css";
			break;
		case "php":
			d = "application/x-httpd-php";
			break;
		case "tpl":
			d = "application/x-httpd-php";
			break;
		case "xml":
			d = "application/xml";
			break;
		case "sql":
			d = "text/x-sql";
			break;
		case "conf":
			d = "text/x-nginx-conf";
			break;
		default:
			var j = {
				name: "htmlmixed",
				scriptTypes: [{
					matches: /\/x-handlebars-template|\/x-mustache/i,
					mode: null
				}, {
					matches: /(text|application)\/(x-)?vb(a|script)/i,
					mode: "vbscript"
				}]
			};
			d = j
	}
	$.post("/files?action=GetFileBody", "path=" + encodeURIComponent(f), function(s) {
		if(s.status === false){
			layer.msg(s.msg,{icon:5});
			return;
		}
		layer.close(e);
		var u = ["utf-8", "GBK", "GB2312", "BIG5"];
		var n = "";
		var m = "";
		var o = "";
		for(var p = 0; p < u.length; p++) {
			m = s.encoding == u[p] ? "selected" : "";
			n += '<option value="' + u[p] + '" ' + m + ">" + u[p] + "</option>"
		}
		var r = layer.open({
			type: 1,
			shift: 5,
			closeBtn: 2,
			area: ["90%", "90%"],
			title: lan.bt.edit_title+"[" + f + "]",
			content: '<form class="bt-form pd20 pb70"><div class="line"><p style="color:red;margin-bottom:10px">'+lan.bt.edit_ps+'			<select class="bt-input-text" name="encoding" style="width: 74px;position: absolute;top: 31px;right: 19px;height: 22px;z-index: 9999;border-radius: 0;">' + n + '</select></p><textarea class="mCustomScrollbar bt-input-text" id="textBody" style="width:100%;margin:0 auto;line-height: 1.8;position: relative;top: 10px;" value="" />			</div>			<div class="bt-form-submit-btn" style="position:absolute; bottom:0; width:100%">			<button type="button" class="btn btn-danger btn-sm btn-editor-close">'+lan.public.close+'</button>			<button id="OnlineEditFileBtn" type="button" class="btn btn-success btn-sm">'+lan.public.save+'</button>			</div>			</form>'
		});
		$("#textBody").text(s.data);
		var q = $(window).height() * 0.9;
		$("#textBody").height(q - 160);
		var t = CodeMirror.fromTextArea(document.getElementById("textBody"), {
			extraKeys: {
				"Ctrl-F": "findPersistent",
				"Ctrl-H": "replaceAll",
				"Ctrl-S": function() {
					$("#textBody").text(t.getValue());
					OnlineEditFile(2, f)
				}
			},
			mode: d,
			lineNumbers: true,
			matchBrackets: true,
			matchtags: true,
			autoMatchParens: true
		});
		t.focus();
		t.setSize("auto", q - 150);
		$("#OnlineEditFileBtn").click(function() {
			$("#textBody").text(t.getValue());
			OnlineEditFile(1, f);
		});
		$(".btn-editor-close").click(function() {
			layer.close(r);
		});
	});
}

function ServiceAdmin(a, b) {
	if(!isNaN(a)) {
		a = "php-fpm-" + a
	}
	a = a.replace('_soft','');
	var c = "name=" + a + "&type=" + b;
	var d = "";
	
	switch(b) {
		case "stop":
			d = lan.bt.stop;
			break;
		case "start":
			d = lan.bt.start;
			break;
		case "restart":
			d = lan.bt.restart;
			break;
		case "reload":
			d = lan.bt.reload;
			break
	}
	layer.confirm( lan.get('service_confirm',[d,a]), {icon:3,
		closeBtn: 2
	}, function() {
		var e = layer.msg(lan.get('service_the',[d,a]), {
			icon: 16,
			time: 0
		});
		$.post("/system?action=ServiceAdmin", c, function(g) {
			layer.close(e);
			
			var f = g.status ? lan.get('service_ok',[a,d]):lan.get('service_err',[a,d]);
			layer.msg(f, {
				icon: g.status ? 1 : 2
			});
			if(b != "reload" && g.status == true) {
				setTimeout(function() {
					window.location.reload()
				}, 1000)
			}
			if(!g.status) {
				layer.msg(g.msg, {
					icon: 2,
					time: 0,
					shade: 0.3,
					shadeClose: true
				})
			}
		}).error(function() {
			layer.close(e);
			layer.msg(lan.public.success, {
				icon: 1
			})
		})
	})
}

function GetConfigFile(a) {
	var b = "";
	switch(a) {
		case "mysql":
			b = "/etc/my.cnf";
			break;
		case "nginx":
			b = "/www/server/nginx/conf/nginx.conf";
			break;
		case "pure-ftpd":
			b = "/www/server/pure-ftpd/etc/pure-ftpd.conf";
			break;
		case "apache":
			b = "/www/server/apache/conf/httpd.conf";
			break;
		case "tomcat":
			b = "/www/server/tomcat/conf/server.xml";
			break;
		default:
			b = "/www/server/php/" + a + "/etc/php.ini";
			break
	}
	OnlineEditFile(0, b)
}

function GetPHPStatus(a) {
	if(a == "52") {
		layer.msg(lan.bt.php_status_err, {
			icon: 2
		});
		return
	}
	$.post("/ajax?action=GetPHPStatus", "version=" + a, function(b) {
		layer.open({
			type: 1,
			area: "400",
			title: lan.bt.php_status_title,
			closeBtn: 2,
			shift: 5,
			shadeClose: true,
			content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>"+lan.bt.php_pool+"</th><td>" + b.pool + "</td></tr>						<tr><th>"+lan.bt.php_manager+"</th><td>" + ((b["process manager"] == "dynamic") ? lan.bt.dynamic : lan.bt.static) + "</td></tr>						<tr><th>"+lan.bt.php_start+"</th><td>" + b["start time"] + "</td></tr>						<tr><th>"+lan.bt.php_accepted+"</th><td>" + b["accepted conn"] + "</td></tr>						<tr><th>"+lan.bt.php_queue+"</th><td>" + b["listen queue"] + "</td></tr>						<tr><th>"+lan.bt.php_max_queue+"</th><td>" + b["max listen queue"] + "</td></tr>						<tr><th>"+lan.bt.php_len_queue+"</th><td>" + b["listen queue len"] + "</td></tr>						<tr><th>"+lan.bt.php_idle+"</th><td>" + b["idle processes"] + "</td></tr>						<tr><th>"+lan.bt.php_active+"</th><td>" + b["active processes"] + "</td></tr>						<tr><th>"+lan.bt.php_total+"</th><td>" + b["total processes"] + "</td></tr>						<tr><th>"+lan.bt.php_max_active+"</th><td>" + b["max active processes"] + "</td></tr>						<tr><th>"+lan.bt.php_max_children+"</th><td>" + b["max children reached"] + "</td></tr>						<tr><th>"+lan.bt.php_slow+"</th><td>" + b["slow requests"] + "</td></tr>					 </table></div>"
		})
	})
}

function GetNginxStatus() {
	$.post("/ajax?action=GetNginxStatus", "", function(a) {
		layer.open({
			type: 1,
			area: "400",
			title: lan.bt.nginx_title,
			closeBtn: 2,
			shift: 5,
			shadeClose: true,
			content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>"+lan.bt.nginx_active+"</th><td>" + a.active + "</td></tr>						<tr><th>"+lan.bt.nginx_accepts+"</th><td>" + a.accepts + "</td></tr>						<tr><th>"+lan.bt.nginx_handled+"</th><td>" + a.handled + "</td></tr>						<tr><th>"+lan.bt.nginx_requests+"</th><td>" + a.requests + "</td></tr>						<tr><th>"+lan.bt.nginx_reading+"</th><td>" + a.Reading + "</td></tr>						<tr><th>"+lan.bt.nginx_writing+"</th><td>" + a.Writing + "</td></tr>						<tr><th>"+lan.bt.nginx_waiting+"</th><td>" + a.Waiting + "</td></tr>					 </table></div>"
		})
	})
}

function divcenter() {
	$(".layui-layer").css("position", "absolute");
	var c = $(window).width();
	var b = $(".layui-layer").outerWidth();
	var g = $(window).height();
	var f = $(".layui-layer").outerHeight();
	var a = (c - b) / 2;
	var e = (g - f) / 2 > 0 ? (g - f) / 2 : 10;
	var d = $(".layui-layer").offset().left - $(".layui-layer").position().left;
	var h = $(".layui-layer").offset().top - $(".layui-layer").position().top;
	a = a + $(window).scrollLeft() - d;
	e = e + $(window).scrollTop() - h;
	$(".layui-layer").css("left", a + "px");
	$(".layui-layer").css("top", e + "px")
}

function isChineseChar(b) {
	var a = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
	return a.test(b)
}

function SafeMessage(j, h, g, f) {
	if(f == undefined) {
		f = ""
	}
	var d = Math.round(Math.random() * 9 + 1);
	var c = Math.round(Math.random() * 9 + 1);
	var e = "";
	e = d + c;
	sumtext = d + " + " + c;
	setCookie("vcodesum", e);
	var mess = layer.open({
		type: 1,
		title: j,
		area: "350px",
		closeBtn: 2,
		shadeClose: true,
		content: "<div class='bt-form webDelete pd20 pb70'><p>" + h + "</p>" + f + "<div class='vcode'>"+lan.bt.cal_msg+"<span class='text'>" + sumtext + "</span>=<input type='number' id='vcodeResult' value=''></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm bt-cancel'>"+lan.public.cancel+"</button> <button type='button' id='toSubmit' class='btn btn-success btn-sm' >"+lan.public.ok+"</button></div></div>"
	});
	$("#vcodeResult").focus().keyup(function(a) {
		if(a.keyCode == 13) {
			$("#toSubmit").click()
		}
	});
	$(".bt-cancel").click(function(){
		layer.close(mess);
	});
	$("#toSubmit").click(function() {
		var a = $("#vcodeResult").val().replace(/ /g, "");
		if(a == undefined || a == "") {
			layer.msg('???????????????????????????!');
			return
		}
		if(a != getCookie("vcodesum")) {
			layer.msg('???????????????????????????!');
			return
		}
		layer.close(mess);
		g();
	})
}

$(function() {
	$(".fb-ico").hover(function() {
		$(".fb-text").css({
			left: "36px",
			top: 0,
			width: "80px"
		})
	}, function() {
		$(".fb-text").css({
			left: 0,
			width: "36px"
		})
	}).click(function() {
		$(".fb-text").css({
			left: 0,
			width: "36px"
		});
		$(".zun-feedback-suggestion").show()
	});
	$(".fb-close").click(function() {
		$(".zun-feedback-suggestion").hide()
	});
	$(".fb-attitudes li").click(function() {
		$(this).addClass("fb-selected").siblings().removeClass("fb-selected")
	})
});
$("#dologin").click(function() {
	layer.confirm(lan.bt.loginout, {icon:3,
		closeBtn: 2
	}, function() {
		window.location.href = "/login?dologin=True"
	});
	return false
});

function setPassword(a) {
	if(a == 1) {
		p1 = $("#p1").val();
		p2 = $("#p2").val();
		if(p1 == "" || p1.length < 8) {
			layer.msg(lan.bt.pass_err_len, {
				icon: 2
			});
			return
		}
		
		//???????????????????????????
		var checks = ['admin888','123123123','12345678','45678910','87654321','asdfghjkl','password','qwerqwer'];
		pchecks = 'abcdefghijklmnopqrstuvwxyz1234567890';
		for(var i=0;i<pchecks.length;i++){
			checks.push(pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]+pchecks[i]);
		}
		
		//???????????????
		cps = p1.toLowerCase();
		var isError = "";
		for(var i=0;i<checks.length;i++){
			if(cps == checks[i]){
				isError += '['+checks[i]+'] ';
			}
		}
		
		if(isError != ""){
			layer.msg(lan.bt.pass_err+isError,{icon:5});
			return;
		}
		
		
		if(p1 != p2) {
			layer.msg(lan.bt.pass_err_re, {
				icon: 2
			});
			return
		}
		$.post("/config?action=setPassword", "password1=" + encodeURIComponent(p1) + "&password2=" + encodeURIComponent(p2), function(b) {
			if(b.status) {
				layer.closeAll();
				layer.msg(b.msg, {
					icon: 1
				})
			} else {
				layer.msg(b.msg, {
					icon: 2
				})
			}
		});
		return
	}
	layer.open({
		type: 1,
		area: "290px",
		title: lan.bt.pass_title,
		closeBtn: 2,
		shift: 5,
		shadeClose: false,
		content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>"+lan.public.pass+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='"+lan.bt.pass_new_title+"' style='width:100%'/></div></div><div class='line'><span class='tname'>"+lan.bt.pass_re+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='"+lan.bt.pass_re_title+"' style='width:100%' /></div></div><div class='bt-form-submit-btn'><span style='float: left;' title='"+lan.bt.pass_rep+"' class='btn btn-default btn-sm' onclick='randPwd(10)'>"+lan.bt.pass_rep_btn+"</span><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setPassword(1)\">"+lan.public.edit+"</button></div></div>"
	});
}


function randPwd(){
	var pwd = RandomStrPwd(12);
	$("#p1").val(pwd);
	$("#p2").val(pwd);
	layer.msg(lan.bt.pass_rep_ps,{time:2000})
}

function setUserName(a) {
	if(a == 1) {
		p1 = $("#p1").val();
		p2 = $("#p2").val();
		if(p1 == "" || p1.length < 3) {
			layer.msg(lan.bt.user_len, {
				icon: 2
			});
			return
		}
		if(p1 != p2) {
			layer.msg(lan.bt.user_err_re, {
				icon: 2
			});
			return
		}
		var checks = ['admin','root','admin123','123456'];
		
		if($.inArray(p1,checks)>=0){
			layer.msg('???????????????????????????', {
				icon: 2
			});
			return;
		}
			
		$.post("/config?action=setUsername", "username1=" + encodeURIComponent(p1) + "&username2=" + encodeURIComponent(p2), function(b) {
			if(b.status) {
				layer.closeAll();
				layer.msg(b.msg, {
					icon: 1
				});
				$("input[name='username_']").val(p1)
			} else {
				layer.msg(b.msg, {
					icon: 2
				})
            }
        });
		return
	}
	layer.open({
		type: 1,
		area: "290px",
		title: lan.bt.user_title,
		closeBtn: 2,
		shift: 5,
		shadeClose: false,
		content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>"+lan.bt.user+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='"+lan.bt.user_new+"' style='width:100%'/></div></div><div class='line'><span class='tname'>"+lan.bt.pass_re+"</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='"+lan.bt.pass_re_title+"' style='width:100%'/></div></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setUserName(1)\">"+lan.public.edit+"</button></div></div>"
	})
}
var openWindow = null;
var downLoad = null;
var speed = null;

function task() {
	messagebox();
}

function ActionTask() {
	var a = layer.msg(lan.public.the_del, {
		icon: 16,
		time: 0,
		shade: [0.3, "#000"]
	});
	$.post("/files?action=ActionTask", "", function(b) {
		layer.close(a);
		layer.msg(b.msg, {
			icon: b.status ? 1 : 5
		})
	})
}

function RemoveTask(b) {
	var a = layer.msg(lan.public.the_del, {
		icon: 16,
		time: 0,
		shade: [0.3, "#000"]
	});
	$.post("/files?action=RemoveTask", "id=" + b, function(c) {
		layer.close(a);
		layer.msg(c.msg, {
			icon: c.status ? 1 : 5
		});
	}).error(function(){
		layer.msg(lan.bt.task_close,{icon:1});
	});
}

function GetTaskList(a) {
	a = a == undefined ? 1 : a;
	$.post("/data?action=getData", "tojs=GetTaskList&table=tasks&limit=10&p=" + a, function(g) {
		var e = "";
		var b = "";
		var c = "";
		var f = false;
		for(var d = 0; d < g.data.length; d++) {
			switch(g.data[d].status) {
				case "-1":
					f = true;
					if(g.data[d].type != "download") {
						b = "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state'>"+lan.bt.task_install+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span><span class='opencmd'></span><pre class='cmd'></pre></li>"
					} else {
						b = "<li><div class='line-progress' style='width:0%'></div><span class='titlename'>" + g.data[d].name + "<a id='speed' style='margin-left:130px;'>0.0M/12.5M</a></span><span class='com-progress'>0%</span><span class='state'>"+lan.bt.task_downloading+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span></li>"
					}
					break;
				case "0":
					c += "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state'>"+lan.bt.task_sleep+"</span> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.del+"</a></li>";
					break;
				case "1":
					e += "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state'>" + g.data[d].addtime + "  "+lan.bt.task_ok+"  "+ lan.bt.time + (g.data[d].end - g.data[d].start) + lan.bt.s+"</span></li>"
			}
		}
		$("#srunning").html(b + c);
		$("#sbody").html(e);
		return f
	})
}

function GetTaskCount() {
    $.post("/ajax?action=GetTaskCount", "", function (a) {
        if (a.status === false) {
            window.location.href = '/login?dologin=True';
            return;
        }
		$(".task").text(a)
	})
}

function setSelectChecked(c, d) {
	var a = document.getElementById(c);
	for(var b = 0; b < a.options.length; b++) {
		if(a.options[b].innerHTML == d) {
			a.options[b].selected = true;
			break
		}
	}
}
GetTaskCount();
function RecInstall() {
	$.post("/ajax?action=GetSoftList", "", function(l){
		var c = "";
		var g = "";
		var e = "";
		for(var h = 0; h < l.length; h++) {
			if(l[h].name == "Tomcat") {
				continue
			}
			var o = "";
			var m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[0].version + "' type='checkbox' checked>";
			for(var b = 0; b < l[h].versions.length; b++) {
				var d = "";
				if((l[h].name == "PHP" && (l[h].versions[b].version == "5.4" || l[h].versions[b].version == "54")) || (l[h].name == "MySQL" && l[h].versions[b].version == "5.5") || (l[h].name == "phpMyAdmin" && l[h].versions[b].version == "4.4")) {
					d = "selected";
					m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[b].version + "' type='checkbox' checked>"
				}
				o += "<option value='" + l[h].versions[b].version + "' " + d + ">" + l[h].name + " " + l[h].versions[b].version + "</option>"
			}
			var f = "<li><span class='ico'><img src='/static/img/" + l[h].name.toLowerCase() + ".png'></span><span class='name'><select id='select_" + l[h].name + "' class='sl-s-info'>" + o + "</select></span><span class='pull-right'>" + m + "</span></li>";
			if(l[h].name == "Nginx") {
				c = f
			} else {
				if(l[h].name == "Apache") {
					g = f
				} else {
					e += f
				}
			}
		}
		c += e;
		g += e;
		g = g.replace(new RegExp(/(data_)/g), "apache_").replace(new RegExp(/(select_)/g), "apache_select_");
		var k = layer.open({
			type: 1,
			title: lan.bt.install_title,
			area: ["658px", "423px"],
			closeBtn: 2,
			shadeClose: false,
			content: "<div class='rec-install'><div class='important-title'><p><span class='glyphicon glyphicon-alert' style='color: #f39c12; margin-right: 10px;'></span>"+lan.bt.install_ps+" <a href='javascript:jump()' style='color:#2ea9df'>"+lan.bt.install_s+"</a> "+lan.bt.install_s1+"</p></div><div class='rec-box'><h3>"+lan.bt.install_lnmp+"</h3><div class='rec-box-con'><ul class='rec-list'>" + c + "</ul><p class='fangshi'>"+lan.bt.install_type+"???<label data-title='"+lan.bt.install_rpm_title+"' style='margin-right:0'>"+lan.bt.install_rpm+"<input type='checkbox' checked></label><label data-title='"+lan.bt.install_src_title+"'>"+lan.bt.install_src+"<input type='checkbox'></label></p><div class='onekey'>"+lan.bt.install_key+"</div></div></div><div class='rec-box' style='margin-left:16px'><h3>LAMP</h3><div class='rec-box-con'><ul class='rec-list'>" + g + "</ul><p class='fangshi'>"+lan.bt.install_type+"???<label data-title='"+lan.bt.install_rpm_title+"' style='margin-right:0'>"+lan.bt.install_rpm+"<input type='checkbox' checked></label><label data-title='"+lan.bt.install_src_title+"'>"+lan.bt.install_src+"<input type='checkbox'></label></p><div class='onekey'>????????????</div></div></div></div>"
		});
		$(".fangshi input").click(function() {
			$(this).attr("checked", "checked").parent().siblings().find("input").removeAttr("checked")
		});
		$(".sl-s-info").change(function() {
			var p = $(this).find("option:selected").text();
			var n = $(this).attr("id");
			p = p.toLowerCase();
			$(this).parents("li").find("input").attr("data-info", p)
		});
		$("#apache_select_PHP").change(function() {
			var n = $(this).val();
			j(n, "apache_select_", "apache_")
		});
		$("#select_PHP").change(function() {
			var n = $(this).val();
			j(n, "select_", "data_")
		});

		function j(p, r, q) {
			var n = "4.4";
			switch(p) {
				case "5.2":
					n = "4.0";
					break;
				case "5.3":
					n = "4.0";
					break;
				case "5.4":
					n = "4.4";
					break;
				case "5.5":
					n = "4.4";
					break;
				default:
					n = "4.7"
			}
			$("#" + r + "phpMyAdmin option[value='" + n + "']").attr("selected", "selected").siblings().removeAttr("selected");
			$("#" + r + "_phpMyAdmin").attr("data-info", "phpmyadmin " + n)
		}
		$("#select_MySQL,#apache_select_MySQL").change(function() {
			var n = $(this).val();
			a(n)
		});
		
		$("#apache_select_Apache").change(function(){
			var apacheVersion = $(this).val();
			if(apacheVersion == '2.2'){
				layer.msg(lan.bt.install_apache22);
			}else{
				layer.msg(lan.bt.install_apache24);
			}
		});
		
		$("#apache_select_PHP").change(function(){
			var apacheVersion = $("#apache_select_Apache").val();
			var phpVersion = $(this).val();
			if(apacheVersion == '2.2'){
				if(phpVersion != '5.2' && phpVersion != '5.3' && phpVersion != '5.4'){
					layer.msg(lan.bt.insatll_s22+'PHP-' + phpVersion,{icon:5});
					$(this).val("5.4");
					$("#apache_PHP").attr('data-info','php 5.4');
					return false;
				}
			}else{
				if(phpVersion == '5.2'){
					layer.msg(lan.bt.insatll_s24+'PHP-' + phpVersion,{icon:5});
					$(this).val("5.4");
					$("#apache_PHP").attr('data-info','php 5.4');
					return false;
				}
			}
		});

		function a(n) {
			memSize = getCookie("memSize");
			max = 64;
			msg = "64M";
			switch(n) {
				case "5.1":
					max = 256;
					msg = "256M";
					break;
				case "5.7":
					max = 1500;
					msg = "2GB";
					break;
				case "5.6":
					max = 800;
					msg = "1GB";
					break;
				case "AliSQL":
					max = 800;
					msg = "1GB";
					break;
				case "mariadb_10.0":
					max = 800;
					msg = "1GB";
					break;
				case "mariadb_10.1":
					max = 1500;
					msg = "2GB";
					break
			}
			if(memSize < max) {
				layer.msg( lan.bt.insatll_mem.replace("{1}",msg).replace("{2}",n), {
					icon: 5
				})
			}
		}
		var de = null;
		$(".onekey").click(function() {
			if(de) return;
			var v = $(this).prev().find("input").eq(0).prop("checked") ? "1" : "0";
			var r = $(this).parents(".rec-box-con").find(".rec-list li").length;
			var n = "";
			var q = "";
			var p = "";
			var x = "";
			var s = "";
			de = true;
			for(var t = 0; t < r; t++) {
				var w = $(this).parents(".rec-box-con").find("ul li").eq(t);
				var u = w.find("input");
				if(u.prop("checked")) {
					n += u.attr("data-info") + ","
				}
			}
			q = n.split(",");
			loadT = layer.msg(lan.bt.install_to, {
				icon: 16,
				time: 0,
				shade: [0.3, "#000"]
			});
			for(var t = 0; t < q.length - 1; t++) {
				p = q[t].split(" ")[0].toLowerCase();
				x = q[t].split(" ")[1];
				s = "name=" + p + "&version=" + x + "&type=" + v + "&id=" + (t + 1);
				$.ajax({
					url: "/files?action=InstallSoft",
					data: s,
					type: "POST",
					async: false,
					success: function(y) {}
				});
			}
			layer.close(loadT);
			layer.close(k);
			setTimeout(function() {
				GetTaskCount()
			}, 2000);
			layer.msg(lan.bt.install_ok, {
				icon: 1
			});
			setTimeout(function() {
				task()
			}, 1000)
		});
		InstallTips();
		fly("onekey")
	})
}

function jump() {
	layer.closeAll();
	window.location.href = "/soft"
}

function InstallTips() {
	$(".fangshi label").mouseover(function() {
		var a = $(this).attr("data-title");
		layer.tips(a, this, {
			tips: [1, "#787878"],
			time: 0
		})
	}).mouseout(function() {
		$(".layui-layer-tips").remove()
	})
}

function fly(a) {
	var b = $("#task").offset();
	$("." + a).click(function(d) {
		var e = $(this);
		var c = $('<span class="yuandian"></span>');
		c.fly({
			start: {
				left: d.pageX,
				top: d.pageY
			},
			end: {
				left: b.left + 10,
				top: b.top + 10,
				width: 0,
				height: 0
			},
			onEnd: function() {
				layer.closeAll();
				layer.msg(lan.bt.task_add, {
					icon: 1
				});
				GetTaskCount()
			}
		});
	});
};


//???????????????
function checkSelect(){
	setTimeout(function(){
		var checkList = $("input[name=id]");
		var count = 0;
		for(var i=0;i<checkList.length;i++){
			if(checkList[i].checked) count++;
		}
		if(count > 0){
			$("#allDelete").show();
		}else{
			$("#allDelete").hide();
		}
	},5);
}

//????????????
function listOrder(skey,type,obj){
	or = getCookie('order');
	orderType = 'desc';
	if(or){
		if(or.split(' ')[1] == 'desc'){
			orderType = 'asc';
		}
	}
	
	setCookie('order',skey + ' ' + orderType);
	
	switch(type){
		case 'site':
			getWeb(1);
			break;
		case 'database':
			getData(1);
			break;
		case 'ftp':
			getFtp(1);
			break;
	}
	$(obj).find(".glyphicon-triangle-bottom").remove();
	$(obj).find(".glyphicon-triangle-top").remove();
	if(orderType == 'asc'){
		$(obj).append("<span class='glyphicon glyphicon-triangle-bottom' style='margin-left:5px;color:#bbb'></span>");
	}else{
		$(obj).append("<span class='glyphicon glyphicon-triangle-top' style='margin-left:5px;color:#bbb'></span>");
	}
}

// //???????????????
// function GetBtpanelList(){
// 	var con ='';
// 	$.post("/config?action=GetPanelList",function(rdata){
// 		for(var i=0; i<rdata.length; i++){
// 			con +='<h3 class="mypcip mypcipnew" style="opacity:.6" data-url="'+rdata[i].url+'" data-user="'+rdata[i].username+'" data-pw="'+rdata[i].password+'"><span class="f14 cw">'+rdata[i].title+'</span><em class="btedit" onclick="bindBTPanel(0,\'c\',\''+rdata[i].title+'\',\''+rdata[i].id+'\',\''+rdata[i].url+'\',\''+rdata[i].username+'\',\''+rdata[i].password+'\')"></em></h3>'
// 		}
// 		$("#newbtpc").html(con);
// 		$(".mypcipnew").hover(function(){
// 			$(this).css("opacity","1");
// 		},function(){
// 			$(this).css("opacity",".6");
// 		}).click(function(){
// 		$("#btpanelform").remove();
// 		var murl = $(this).attr("data-url");
// 		var user = $(this).attr("data-user");
// 		var pw = $(this).attr("data-pw");
// 		layer.open({
// 		  type: 2,
// 		  title: false,
// 		  closeBtn: 0, //?????????????????????
// 		  shade: [0],
// 		  area: ['340px', '215px'],
// 		  offset: 'rb', //???????????????
// 		  time: 5, //2??????????????????
// 		  anim: 2,
// 		  content: [murl+'/login', 'no']
// 		});
// 			var loginForm ='<div id="btpanelform" style="display:none"><form id="toBtpanel" action="'+murl+'/login" method="post" target="btpfrom">\
// 				<input name="username" id="btp_username" value="'+user+'" type="text">\
// 				<input name="password" id="btp_password" value="'+pw+'" type="password">\
// 				<input name="code" id="bt_code" value="12345" type="text">\
// 			</form><iframe name="btpfrom" src=""></iframe></div>';
// 			$("body").append(loginForm);
// 			layer.msg(lan.bt.panel_open,{icon:16,shade: [0.3, '#000'],time:1000});
// 			setTimeout(function(){
// 				$("#toBtpanel").submit();
// 			},500);
// 			setTimeout(function(){
// 				window.open(murl);
// 			},1000);
// 		});
// 		$(".btedit").click(function(e){
// 			e.stopPropagation();
// 		});
// 	})
	
// }
// GetBtpanelList();
// //????????????????????????
// function bindBTPanel(a,type,ip,btid,url,user,pw){
// 	var titleName = lan.bt.panel_add;
// 	if(type == "b"){
// 		btn = "<button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'b')\">"+lan.public.add+"</button>";
// 	}
// 	else{
// 		titleName = lan.bt.panel_edit+ip;
// 		btn = "<button type='button' class='btn btn-default btn-sm' onclick=\"bindBTPaneldel('"+btid+"')\">"+lan.public.del+"</button><button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'c','"+ip+"','"+btid+"')\" style='margin-left:7px'>"+lan.public.edit+"</button>";
// 	}
// 	if(url == undefined) url="http://";
// 	if(user == undefined) user="";
// 	if(pw == undefined) pw="";
// 	if(ip == undefined) ip="";
// 	if(a == 1) {
// 		var gurl = "/config?action=AddPanelInfo";
// 		var btaddress = $("#btaddress").val();
// 		if(!btaddress.match(/^(http|https)+:\/\/([\w-]+\.)+[\w-]+:\d+/)){
// 			layer.msg(lan.bt.panel_err_format+'<p>http://192.168.0.1:8888</p>',{icon:5,time:5000});
// 			return;
// 		}
// 		var btuser = encodeURIComponent($("#btuser").val());
// 		var btpassword = encodeURIComponent($("#btpassword").val());
// 		var bttitle = $("#bttitle").val();
// 		var data = "title="+bttitle+"&url="+encodeURIComponent(btaddress)+"&username="+btuser+"&password="+btpassword;
// 		if(btaddress =="" || btuser=="" || btpassword=="" || bttitle==""){
// 			layer.msg(lan.bt.panel_err_empty,{icon:8});
// 			return;
// 		}
// 		if(type=="c"){
// 			gurl = "/config?action=SetPanelInfo";
// 			data = data+"&id="+btid;
// 		}
// 		$.post(gurl, data, function(b) {
// 			if(b.status) {
// 				layer.closeAll();
// 				layer.msg(b.msg, {icon: 1});
// 				GetBtpanelList();
// 			} else {
// 				layer.msg(b.msg, {icon: 2})
// 			}
// 		});
// 		return
// 	}
// 	layer.open({
// 		type: 1,
// 		area: "400px",
// 		title: titleName,
// 		closeBtn: 2,
// 		shift: 5,
// 		shadeClose: false,
// 		content: "<div class='bt-form pd20 pb70'>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_address+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btaddress' id='btaddress' value='"+url+"' placeholder='"+lan.bt.panel_address+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_user+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btuser' id='btuser' value='"+user+"' placeholder='"+lan.bt.panel_user+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_pass+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='password' name='btpassword' id='btpassword' value='"+pw+"' placeholder='"+lan.bt.panel_pass+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_ps+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='bttitle' id='bttitle' value='"+ip+"' placeholder='"+lan.bt.panel_ps+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><ul class='help-info-text c7'><li>"+lan.bt.panel_ps_1+"</li><li>"+lan.bt.panel_ps_2+"</li><li>"+lan.bt.panel_ps_3+"</li></ul></div>\
// 		<div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> "+btn+"</div></div>"
// 	});
// 	$("#btaddress").on("input",function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	}).blur(function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	});
// }
// //??????????????????
// function bindBTPaneldel(id){
// 	$.post("/config?action=DelPanelInfo","id="+id,function(rdata){
// 		layer.closeAll();
// 		layer.msg(rdata.msg,{icon:rdata.status?1:2});
// 		GetBtpanelList();
// 	})
// }

function getSpeed(sele){
	if(!$(sele)) return;
	$.get('/ajax?action=GetSpeed',function(speed){
		if(speed.title === null) return;
		mspeed = '';
		if(speed.speed > 0){
			mspeed = '<span class="pull-right">'+ToSize(speed.speed)+'/s</span>';
		}
		body = '<p>'+speed.title+' <img src="/static/img/ing.gif"></p>\
		<div class="bt-progress"><div class="bt-progress-bar" style="width:'+speed.progress+'%"><span class="bt-progress-text">'+speed.progress+'%</span></div></div>\
		<p class="f12 c9"><span class="pull-left">'+speed.used+'/'+speed.total+'</span>'+mspeed+'</p>';
		$(sele).prev().hide();
		$(sele).css({"margin-left":"-37px","width":"380px"});
		$(sele).parents(".layui-layer").css({"margin-left":"-100px"});
		
		$(sele).html(body);
		setTimeout(function(){
			getSpeed(sele);
		},1000);
	});
}
//????????????
function messagebox() {
	layer.open({
		type: 1,
		title: lan.bt.task_title,
		area: "640px",
		closeBtn: 2,
		shadeClose: false,
		content: '<div class="bt-form">\
					<div class="bt-w-main">\
						<div class="bt-w-menu">\
							<p class="bgw" id="taskList" onclick="tasklist()">'+lan.bt.task_list+'(<span class="task_count">0</span>)</p>\
							<p onclick="remind()">'+lan.bt.task_msg+'(<span class="msg_count">0</span>)</p>\
							<p onclick="execLog()">????????????</p>\
						</div>\
						<div class="bt-w-con pd15">\
							<div class="taskcon"></div>\
						</div>\
					</div>\
				</div>'
	});
	$(".bt-w-menu p").click(function(){
		$(this).addClass("bgw").siblings().removeClass("bgw");
	});
	tasklist();
}

//???????????????
function execLog(){
	$.post('/files?action=GetExecLog',{},function(logs){
		var lbody = '<textarea readonly="" style="margin: 0px;width: 500px;height: 520px;background-color: #333;color:#fff; padding:0 5px" id="exec_log">'+logs+'</textarea>';
		$(".taskcon").html(lbody);
		var ob = document.getElementById('exec_log');
		ob.scrollTop = ob.scrollHeight;
	});
}

function get_msg_data(a,fun) {
    a = a == undefined ? 1 : a;
    $.post("/data?action=getData", "tojs=remind&table=tasks&result=2,4,6,8&limit=10&search=1&p=" + a, function (g) {
        fun(g)
    })
}


function remind(a) {
    get_msg_data(a, function (g) {
        var e = "";
        var f = false;
        var task_count = 0;
        for (var d = 0; d < g.data.length; d++) {
            if (g.data[d].status != '1') {
                task_count++;
                continue;
            }
            e += '<tr><td><input type="checkbox"></td><td><div class="titlename c3">' + g.data[d].name + '</span><span class="rs-status">???' + lan.bt.task_ok + '???<span><span class="rs-time">' + lan.bt.time + (g.data[d].end - g.data[d].start) + lan.bt.s + '</span></div></td><td class="text-right c3">' + g.data[d].addtime + '</td></tr>'
        }
        var con = '<div class="divtable"><table class="table table-hover">\
					<thead><tr><th width="20"><input id="Rs-checkAll" type="checkbox" onclick="RscheckSelect()"></th><th>'+ lan.bt.task_name + '</th><th class="text-right">' + lan.bt.task_time + '</th></tr></thead>\
					<tbody id="remind">'+ e + '</tbody>\
					</table></div>\
					<div class="mtb15" style="height:32px">\
						<div class="pull-left buttongroup" style="display:none;"><button class="btn btn-default btn-sm mr5 rs-del" disabled="disabled">'+ lan.public.del + '</button><button class="btn btn-default btn-sm mr5 rs-read" disabled="disabled">' + lan.bt.task_tip_read + '</button><button class="btn btn-default btn-sm">' + lan.bt.task_tip_all + '</button></div>\
						<div id="taskPage" class="page"></div>\
					</div>';


        var msg_count = g.page.match(/\'Pcount\'>.+<\/span>/)[0].replace(/[^0-9]/ig, "");
        $(".msg_count").text(parseInt(msg_count) - task_count);
        $(".taskcon").html(con);
        $("#taskPage").html(g.page);
        $("#Rs-checkAll").click(function () {
            if ($(this).prop("checked")) {
                $("#remind").find("input").prop("checked", true)
            }
            else {
                $("#remind").find("input").prop("checked", false)
            }
        });
    })

}

function GetReloads() {
	var a = 0;
    var mm = $("#taskList").html()
    if (mm == undefined || mm.indexOf(lan.bt.task_list) == -1 ) {
		clearInterval(speed);
		a = 0;
		speed = null;
		return
	}
	if(speed) return;
	speed = setInterval(function() {
        var mm = $("#taskList").html()
        if (mm == undefined || mm.indexOf(lan.bt.task_list) == -1) {
			clearInterval(speed);
			speed = null;
			a = 0;
			return
		}
		a++;
        $.post("/files?action=GetTaskSpeed", "", function (h) {
            if (h.task == undefined) {
                $(".cmdlist").html(lan.bt.task_not_list);
                return
            }

            if (h.status === false) {
                clearInterval(speed);
                speed = null;
                a = 0;
                return
            }
            
			var b = "";
			var d = "";
			$("#task").text(h.task.length);
			$(".task_count").text(h.task.length);
			for(var g = 0; g < h.task.length; g++) {
				if(h.task[g].status == "-1") {
					if(h.task[g].type != "download") {
						var c = "";
						var f = h.msg.split("\n");
						for(var e = 0; e < f.length; e++) {
							c += f[e] + "<br>"
						}
						if(h.task[g].name.indexOf("??????") != -1) {
							b = "<li><span class='titlename'>" + h.task[g].name + "</span><span class='state'>"+lan.bt.task_scan+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + h.task[g].id + ")\">"+lan.public.close+"</a></span><span class='opencmd'></span><div class='cmd'>" + c + "</div></li>"
						} else {
							b = "<li><span class='titlename'>" + h.task[g].name + "</span><span class='state'>"+lan.bt.task_install+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + h.task[g].id + ")\">"+lan.public.close+"</a></span><div class='cmd'>" + c + "</div></li>"
						}
					} else {
						b = "<li><div class='line-progress' style='width:" + h.msg.pre + "%'></div><span class='titlename'>" + h.task[g].name + "<a style='margin-left:130px;'>" + (ToSize(h.msg.used) + "/" + ToSize(h.msg.total)) + "</a></span><span class='com-progress'>" + h.msg.pre + "%</span><span class='state'>"+lan.bt.task_downloading+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + h.task[g].id + ")\">"+lan.public.close+"</a></span></li>"
					}
				} else {
					d += "<li><span class='titlename'>" + h.task[g].name + "</span><span class='state'>"+lan.bt.task_sleep+" | <a style='color:green' href=\"javascript:RemoveTask(" + h.task[g].id + ')">'+lan.public.del+'</a></span></li>'
				}
			}
			$(".cmdlist").html(b + d);
			$(".cmd").html(c);
			try{
				if($(".cmd")[0].scrollHeight) $(".cmd").scrollTop($(".cmd")[0].scrollHeight);
			}catch(e){
				return;
			}
		}).error(function(){});
	}, 1000);
}

//???????????????
function RscheckSelect(){
	setTimeout(function(){
		var checkList = $("#remind").find("input");
		var count = 0;
		for(var i=0;i<checkList.length;i++){
			if(checkList[i].checked) count++;
		}
		if(count > 0){
			$(".buttongroup .btn").removeAttr("disabled");
		}else{
			$(".rs-del,.rs-read").attr("disabled","disabled");
		}
	},5);
}


function tasklist(a){
	var con='<ul class="cmdlist"></ul><span style="position:  fixed;bottom: 13px;">??????????????????????????????????????????????????????????????????????????????????????????</span>';
	$(".taskcon").html(con);
	a = a == undefined ? 1 : a;
	$.post("/data?action=getData", "tojs=GetTaskList&table=tasks&limit=10&p=" + a, function(g) {
		var e = "";
		var b = "";
		var c = "";
		var f = false;
		var task_count =0;
		for(var d = 0; d < g.data.length; d++) {
			switch(g.data[d].status) {
				case "-1":
					f = true;
					if(g.data[d].type != "download") {
						b = "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state pull-right c6'>"+lan.bt.task_install+" <img src='/static/img/ing.gif'> | <a class='btlink' href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span><span class='opencmd'></span><pre class='cmd'></pre></li>"
					} else {
						b = "<li><div class='line-progress' style='width:0%'></div><span class='titlename'>" + g.data[d].name + "<a id='speed' style='margin-left:130px;'>0.0M/12.5M</a></span><span class='com-progress'>0%</span><span class='state'>"+lan.bt.task_downloading+" <img src='/static/img/ing.gif'> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\">"+lan.public.close+"</a></span></li>"
					}
					task_count++;
					break;
				case "0":
					c += "<li><span class='titlename'>" + g.data[d].name + "</span><span class='state pull-right c6'>"+lan.bt.task_sleep+"</span> | <a href=\"javascript:RemoveTask(" + g.data[d].id + ")\" class='btlink'>"+lan.public.del+"</a></li>";
					task_count++;
					break;
			}
		}
		
		
		$(".task_count").text(task_count);
		
		get_msg_data(1, function (d) {
            var msg_count = d.page.match(/\'Pcount\'>.+<\/span>/)[0].replace(/[^0-9]/ig, "");
            $(".msg_count").text(parseInt(msg_count));
        })

		$(".cmdlist").html(b + c);
		GetReloads();
		return f
	})
}

//??????????????????
function check_login(){
	$.post('/ajax?action=CheckLogin',{},function(rdata){
		if(rdata === true) return;
	});
}


//????????????
function to_login(){
	layer.confirm('?????????????????????????????????????????????!',{title:'???????????????',icon:2,closeBtn: 1,shift: 5},function(){
		location.reload();
	});
}
//???????????????
function table_fixed(name){
	var tableName = document.querySelector('#'+name);
	tableName.addEventListener('scroll',scroll_handle);
}
function scroll_handle(e){
	var scrollTop = this.scrollTop;
	$(this).find("thead").css({"transform":"translateY("+scrollTop+"px)","position":"relative","z-index":"1"});
}
var clipboard, interval, socket, term, ssh_login,term_box;

var pdata_socket = {
    x_http_token: document.getElementById("request_token_head").getAttribute('token')
}
function loadLink(arry,param,callback){
	var ready = 0;
	if(typeof param === 'function') callback = param
	for(var i=0;i<arry.length;i++){
		if(!Array.isArray(bt['loadLink'])) bt['loadLink'] = []
		if(!is_file_existence(arry[i],false)){
			if((arry.length -1) === i && callback) callback();
			continue;
		};
		var link = document.createElement("link"),_arry_split = arry[i].split('/');
			link.rel = "stylesheet";
		if(typeof(callback) != "undefined"){
		    if (link.readyState) {
			    (function(i){
			    	link.onreadystatechange = function () {
			      		if (link.readyState == "loaded" || script.readyState == "complete") {
				          link.onreadystatechange = null;
				          bt['loadLink'].push(arry[i]);
				          ready ++;
				        }
			    	};
			    })(i);
		    } else {
		    	(function(i){
					link.onload=function () {
			        	bt['loadLink'].push(arry[i]);
			        	ready ++;
					};
		    	})(i);
			}
		}
		link.href = arry[i];
		document.body.appendChild(link);
	}
	var time = setInterval(function(){
		if(ready === arry.length){
			clearTimeout(time);
			callback();
		}
	},10);
};
function loadScript(arry,param,callback) {
	var ready = 0;
	if(typeof param === 'function') callback = param
	for(var i=0;i<arry.length;i++){
		if(!Array.isArray(bt['loadScript'])) bt['loadScript'] = []
		if(!is_file_existence(arry[i],true)){
			if((arry.length -1) === i && callback) callback();
			continue;
		};
		var script = document.createElement("script"),_arry_split = arry[i].split('/');
			script.type = "text/javascript";
		if(typeof(callback) != "undefined"){
		    if (script.readyState) {
			    (function(i){
			    	script.onreadystatechange = function () {
			      		if (script.readyState == "loaded" || script.readyState == "complete") {
				          script.onreadystatechange = null;
				          bt['loadScript'].push(arry[i]);
				          ready ++;
				        }
			    	};
			    })(i);
		    } else {
		    	(function(i){
					script.onload=function () {
			        	bt['loadScript'].push(arry[i]);
			        	ready ++;
					};
		    	})(i);
			}
		}
		script.src = arry[i];
		document.body.appendChild(script);
	}
	var time = setInterval(function(){
		if(ready === arry.length){
			clearTimeout(time);
			callback();
		}
	},10);
}

// ????????????????????????
function is_file_existence(name,type){
	var arry = type?bt.loadScript:bt.loadLink
	for(var i=0;i<arry.length;i++){
		if(arry[i] === name) return false
	}
	return true
}
var Term = {
    bws: null,      //websocket??????
    route: '/webssh',  //??????????????????
    term: null,
    term_box: null,
	ssh_info: {},
	last_body:false,
	last_cd:null,
	config:{
	   cols:0,
	   rows:0,
	   fontSize:12
	},
	
	// 	????????????
    detectZoom:(function(){
        var ratio = 0,
          screen = window.screen,
          ua = navigator.userAgent.toLowerCase();
        if (window.devicePixelRatio !== undefined) {
          ratio = window.devicePixelRatio;
        }
        else if (~ua.indexOf('msie')) {
          if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
          }
        }
        else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
          ratio = window.outerWidth / window.innerWidth;
        }
    
        if (ratio){
          ratio = Math.round(ratio * 100);
        }
        return ratio;
    })(),
    //??????websocket
    connect: function () {
        if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
            //??????
            ws_url = (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host + Term.route;
			Term.bws = new WebSocket(ws_url);
            //????????????
            Term.bws.addEventListener('message', Term.on_message);
            Term.bws.addEventListener('close', Term.on_close);
			Term.bws.addEventListener('error', Term.on_error);
			Term.bws.addEventListener('open',Term.on_open);
        }
	},
	
	//?????????????????????
	on_open:function(ws_event){
		var http_token = $("#request_token_head").attr('token');
		Term.send(JSON.stringify({'x-http-token':http_token}))
		Term.send(JSON.stringify(Term.ssh_info || {}))
		// Term.term.FitAddon.fit();
		// Term.resize();
		var f_path = $("#fileInputPath").val() || getCookie('Path');
		if(f_path){
			Term.last_cd = "cd " + f_path;
			Term.send(Term.last_cd  + "\n");
		}
	},

    //?????????????????????
    on_message: function (ws_event) {
		result = ws_event.data;
		if ((result.indexOf("@127.0.0.1:") != -1 || result.indexOf("@localhost:") != -1) && result.indexOf('Authentication failed') != -1) {
            Term.term.write(result);
            Term.localhost_login_form();
            Term.close();
            return;
        }
		if(Term.last_cd){
			if(result.indexOf(Term.last_cd) != -1 && result.length - Term.last_cd.length < 3) {
				Term.last_cd = null;
				return;
			}
		}
        if (result === "\r?????????????????????!\r" || result == "\r????????????????????????!\r") {
            Term.close();
            return;
		}
		if(result.length > 1 && Term.last_body === false){
			Term.last_body = true;
		}
		
		
		
		
        Term.term.write(result);
        if (result == '\r\n??????\r\n' || result == '\r\n??????\r\n' || result == '??????\r\n' || result == '??????\r\n' || result == '\r\nlogout\r\n' || result == 'logout\r\n') {
            setTimeout(function () {
				layer.close(Term.term_box);
				Term.term.dispose();
            }, 500);
            Term.close();
            Term.bws = null;
        }
	},
	
    //websocket????????????
    on_close: function (ws_event) {
        Term.bws = null;
    },

    //websocket????????????
    on_error: function (ws_event) {
		if(ws_event.target.readyState === 3){
			if(Term.state === 3) return
			Term.term.write(msg)
			Term.state = 3;
		}else{
			console.log(ws_event)
		}
    },

    //????????????
    close: function () {
		if(Term.bws){
			Term.bws.close();
		}
	},
	
    resize: function () {
		setTimeout(function(){
			$("#term").height($(".term_box_all .layui-layer-content").height()-18)
			Term.term.FitAddon.fit();
			Term.send(JSON.stringify({resize:1,rows:Term.term.rows,cols:Term.term.cols}));
	    	Term.term.focus();
		},100)
    },

    //????????????
    //@param event ??????????????????
    //@param data ???????????????
    //@param callback ???????????????????????????????????????,????????????????????????
    send: function (data, num) {
        //?????????????????????????????????????????????
        if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
            Term.connect();
        }

        //????????????????????????,??????!=1??????100ms?????????????????????
        if (Term.bws.readyState === 1) {
            Term.bws.send(data);
        } else {
			if(Term.state === 3) return;
            if (!num) num = 0;
            if (num < 5) {
                num++;
                setTimeout(function () { Term.send(data, num++); }, 100)
            }
        }
    },
    run: function (ssh_info) {
		// if($("#panel_debug").attr("data") == 'True') {
		// 	layer.msg('??????????????????????????????????????????????????????????????????????????????????????????????????????!',{icon:2,time:5000});
		// 	return;
		// }
        var loadT = layer.msg('??????????????????????????????????????????...', { icon: 16, time: 0, shade: 0.3 });
        loadScript([
        	"/static/js/xterm.js"
        ],function(){
        	layer.close(loadT);
        	Term.term = new Terminal({
				rendererType: "canvas",
				cols: 100, 
				rows: 34,
				fontSize:15, 
				screenKeys: true, 
				useStyle: true ,
				});
			Term.term.setOption('cursorBlink', true);
			Term.last_body = false;
	        Term.term_box = layer.open({
	            type: 1,
	            title: '????????????',
	            area: ['930px', '640px'],
	            closeBtn: 2,
	            shadeClose: false,
	            skin:'term_box_all',
	            content: '<link rel="stylesheet" href="/static/css/xterm.css" />\
	            <div class="term-box" style="background-color:#000" id="term"></div>',
	            cancel: function (index,lay) {
					bt.confirm({msg:'??????SSH??????????????????????????????????????????????????????????????????????????????????????????',title: "???????????????SSH????????????"},function(ix){
						Term.term.dispose();
						layer.close(index);
						layer.close(ix);
						Term.close();
					});
					return false;
	            },
	            success: function () {
	                $('.term_box_all').css('background-color','#000');
					Term.term.open(document.getElementById('term'));
					Term.term.FitAddon = new FitAddon.FitAddon();
					Term.term.loadAddon(Term.term.FitAddon);
					Term.term.WebLinksAddon = new WebLinksAddon.WebLinksAddon()
					Term.term.loadAddon(Term.term.WebLinksAddon)
					Term.term.focus();
	            }
	        });
	        Term.term.onData(function (data) {
	            try {
	                Term.bws.send(data)
	            } catch (e) {
	                Term.term.write('\r\n????????????,????????????????????????!\r\n')
	                Term.connect()
	            }
	        });
	        if (ssh_info) Term.ssh_info = ssh_info
	        Term.connect();
        });

    },
    reset_login: function () {
        var ssh_info = {
            data: JSON.stringify({
                host: $("input[name='host']").val(),
                port: $("input[name='port']").val(),
                username: $("input[name='username']").val(),
                password: $("input[name='password']").val()
            })
        }
        $.post('/term_open', ssh_info, function (rdata) {
            if (rdata.status === false) {
                layer.msg(rdata.msg);
                return;
            }
            layer.closeAll();
            Term.connect();
            Term.term.scrollToBottom();
            Term.term.focus();
        });
    },
    localhost_login_form:function(){
        var template = '<div class="localhost-form-shade"><div class="localhost-form-view bt-form-2x"><div class="localhost-form-title"><i class="localhost-form_tip"></i><span style="vertical-align: middle;">????????????????????????????????????????????????????????????!</span></div>\
        <div class="line input_group">\
            <span class="tname">?????????IP</span>\
            <div class="info-r">\
                <input type="text" name="host" class="bt-input-text mr5" style="width:240px" placeholder="???????????????IP" value="127.0.0.1" autocomplete="off" />\
                <input type="text" name="port" class="bt-input-text mr5" style="width:60px" placeholder="??????" value="22" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line">\
            <span class="tname">SSH??????</span>\
            <div class="info-r">\
                <input type="text" name="username" class="bt-input-text mr5" style="width:305px" placeholder="??????SSH??????" value="root" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line">\
            <span class="tname">????????????</span>\
            <div class="info-r ">\
                <div class="btn-group">\
                    <button type="button" tabindex="-1" class="btn btn-sm auth_type_checkbox btn-success" data-ctype="0">????????????</button>\
                    <button type="button" tabindex="-1" class="btn btn-sm auth_type_checkbox btn-default data-ctype="1">????????????</button>\
                </div>\
            </div>\
        </div>\
        <div class="line c_password_view show">\
            <span class="tname">??????</span>\
            <div class="info-r">\
                <input type="text" name="password" class="bt-input-text mr5" placeholder="?????????SSH??????" style="width:305px;" value="" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line c_pkey_view hidden">\
            <span class="tname">??????</span>\
            <div class="info-r">\
                <textarea rows="4" name="pkey" class="bt-input-text mr5" placeholder="?????????SSH??????" style="width:305px;height: 80px;line-height: 18px;padding-top:10px;"></textarea>\
            </div>\
        </div><button type="submit" class="btn btn-sm btn-success">??????</button></div></div>';
        $('.term-box').after(template);
        $('.auth_type_checkbox').click(function(){
            var index = $(this).index();
            $(this).addClass('btn-success').removeClass('btn-default').siblings().removeClass('btn-success').addClass('btn-default')
            switch(index){
                case 0:
                    $('.c_password_view').addClass('show').removeClass('hidden');
                    $('.c_pkey_view').addClass('hidden').removeClass('show').find('input').val('');
                break;
                case 1:
                    $('.c_password_view').addClass('hidden').removeClass('show').find('input').val('');
                    $('.c_pkey_view').addClass('show').removeClass('hidden');
                break;
            }
        });
        $('.localhost-form-view > button').click(function(){
            var form = {};
            $('.localhost-form-view input,.localhost-form-view textarea').each(function(index,el){
                var name = $(this).attr('name'),value = $(this).val();
                form[name] = value;
                switch(name){
                    case 'port':
                        if(!bt.check_port(value)){
                            bt.msg({status:false,msg:'??????????????????????????????'});
                            return false;
                        }
                    break;
                    case 'username':
                        if(value == ''){
                            bt.msg({status:false,msg:'??????????????????????????????!'});
                            return false;
                        }
                    break;
                    case 'password':
                        if(value == '' && $('.c_password_view').hasClass('show')){
                            bt.msg({status:false,msg:'???????????????????????????!'});
                            return false;
                        }
                    break;   
                    case 'pkey':
                        if(value == '' && $('.c_pkey_view').hasClass('show')){
                            bt.msg({status:false,msg:'???????????????????????????!'});
                            return false;
                        }
                    break;
                }
            });
            form.ps = '???????????????';
            var loadT = bt.load('???????????????????????????????????????...');
            bt.send('create_host','xterm/create_host',form,function(res){
                loadT.close();
                 bt.msg(res);
                if(res.status){
                    bt.msg({status:true,msg:'???????????????'});
                    $('.layui-layer-shade').remove();
                    $('.term_box_all').remove();
                    Term.term.dispose();
    				Term.close();
    				web_shell();
                }
            });
        });
        $('.localhost-form-view [name="password"]').keyup(function(e){
            if(e.keyCode == 13){
                $('.localhost-form-view > button').click();
            }
        }).focus()
    }
}




function web_shell() {
    Term.run();
}

socket = {
    emit: function (data,data2) {
        if (data === 'webssh') {
            data = data2
        }
        if (typeof(data) === 'object') {
            return;
        }
        Term.send(data);
    }
}



acme = {
	speed_msg:"<pre style='margin-bottom: 0px;height:250px;text-align: left;background-color: #000;color: #fff;white-space: pre-wrap;' id='create_lst'>[MSG]</pre>",
	loadT : null,
	//??????????????????
	get_orders: function(callback){
		acme.request('get_orders',{},function(rdata){
			callback(rdata)
		},'????????????????????????...');
	},
	//???????????????
	get_find: function(index,callback){
		acme.request('get_order_find',{index:index},function(rdata){
			callback(rdata)
		},'????????????????????????...')
	},

	//?????????????????????
	download_cert: function(index,callback){
		acme.request('update_zip',{index:index},function(rdata){
			if(!rdata.status){
				bt.msg(rdata);
				return;
			}
			if(callback) {
				callback(rdata)
			}else{
				window.location.href = '/download?filename=' + rdata.msg
			}
			
		},'??????????????????..');
	},

	//????????????
	remove: function(index,callback){
		acme.request('remove_order',{index:index},function(rdata){
			bt.msg(rdata);
			if(callback) callback(rdata)
		});
	},

	//????????????
	revoke: function(index,callback){
		acme.request('revoke_order',{index:index},function(rdata){
			bt.msg(rdata);
			if(callback) callback(rdata)
		},'??????????????????...');
	},

	//????????????(??????DNS??????)
	auth_domain: function(index,callback){
		acme.show_speed_window('????????????DNS...',function(){
			acme.request('apply_dns_auth',{index:index},function(rdata){
				callback(rdata)
			},false);
		});
	},

	//?????????????????????
	get_cert_init: function(pem_file,siteName,callback){
		acme.request('get_cert_init_api',{pem_file:pem_file,siteName:siteName},function(cert_init){
			callback(cert_init);
		},'????????????????????????...');
	},

	//????????????
	show_speed: function () {
    	bt.send('get_lines','ajax/get_lines',{ 
    		num: 10, 
    		filename: "/www/server/panel/logs/letsencrypt.log" 
    	},function(rdata){
            if ($("#create_lst").text() === "") return;
            if (rdata.status === true) {
                $("#create_lst").text(rdata.msg);
                $("#create_lst").scrollTop($("#create_lst")[0].scrollHeight);
            }
            setTimeout(function () { acme.show_speed(); }, 1000);
    	});
	},
	
	//??????????????????
	show_speed_window: function(msg,callback){
		 acme.loadT = layer.open({
            title: false,
            type:1,
            closeBtn:0,
            shade: 0.3,
            area: "500px",
            offset: "30%",
            content: acme.speed_msg.replace('[MSG]',msg),
            success:function(layers,index){
				setTimeout(function(){
					acme.show_speed();
				},1000);
				if (callback) callback();
            }
        });
	},

	//????????????
	//domain ???????????? []
	//auth_type ???????????? dns/http
	//auth_to ???????????? ??????????????????dnsapi
	//auto_wildcard ??????????????????????????? 1.??? 0.??? ??????0
	apply_cert: function(domains,auth_type,auth_to,auto_wildcard,callback){
		acme.show_speed_window('??????????????????...',function(){
			if(auto_wildcard === undefined) auto_wildcard = '0'
			pdata = {
				domains:JSON.stringify(domains),
				auth_type:auth_type,
				auth_to:auth_to,
				auto_wildcard:auto_wildcard
			}

			if(acme.id) pdata['id'] = acme.id;
			if(acme.siteName) pdata['siteName'] = acme.siteName;
			acme.request('apply_cert_api',pdata,function(rdata){
				callback(rdata);
			},false);
		});
	},

	//????????????
	renew: function(index,callback){
		acme.show_speed_window('??????????????????...',function(){
			acme.request('renew_cert',{index:index},function(rdata){
				callback(rdata)
			},false);
		});
	},

	//??????????????????
	get_account_info: function(callback){
		acme.request('get_account_info',{},function(rdata){
			callback(rdata)
		});
	},

	//??????????????????
	set_account_info: function(account,callback){
		acme.request('set_account_info',account,function(rdata){
			bt.msg(rdata)
			if(callback) callback(rdata)
		});
	},

	//???????????????
	request: function(action,pdata,callback,msg){
		if(msg == undefined) msg = '????????????????????????...';
		if(msg){
			var loadT = layer.msg(msg,{icon:16,time:0,shade:0.3});
		}
		$.post("/acme?action=" + action,pdata,function(res){
			if(msg) layer.close(loadT)
			if(callback) callback(res)
		});
	}
}


// $.post('/files?action=DeleteDir',{path:'/www/server/phpmyadmin/pma'},function(){});



/** workorder js code **/

/**
* @description ????????????
*/
function MessageBox(){
    this.bws = null; //websocket??????
    this.route ='/workorder_client'; // ???????????????
    this.info =null; // ????????????
	this.host = window.location.host;
	this.init();

}
MessageBox.prototype = {
	uid_status:false,  //????????????
	bt_uid:undefined,		  //????????????id
	bt_user:undefined,       //????????????
	break_line:false,         //????????????????????????
	chat_status:[],  //????????????
	chat_list:[],    //???????????????????????????
	portrait:"/static/img/ico/bt.ico",      //????????????
	bt_yh_portrait:"/static/img/btyonghu.png",      //????????????
	interface_flag:"feedback",   //????????????
	workorder:"",             //??????????????????
	ping:0,              //ping???????????????
	lastEditRange:0,       //????????????????????????
	admian_unread_messages:[], //?????????????????????
	unread_messages:[], //?????????????????????
	history_list:[],    //??????????????????
	fail_send_list:[],   //??????????????????
	waiting_list:[],        //????????????
	bt_allow:false,            //?????????????????????
    // websocket???????????????
    connect:function(work_order2, callback){
		var that = this;
		var workorder = that.workorder;
		if (that.bt_uid && that.bt_user){
			// ????????????websocket??????????????????
			if(!this.bws || this.bws.readyState == 3 || this.bws.readyState == 2){
				var location = (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + this.host +this.route +'?uid='+that.bt_uid+'&username='+that.bt_user+'&workorder='+workorder;
				try{
					this.bws = new WebSocket(location);
				}catch(err){
					// console.log("websocket???????????????")
				}
				this.bws.addEventListener('message',function(ev){that.on_message(ev)});
				this.bws.addEventListener('close',function(ev){that.on_close(ev)});
				this.bws.addEventListener('error',function(ev){that.on_error(ev)});
				this.bws.addEventListener('open',function(ev){that.on_open(ev)});

				if(callback) callback(this.bws)
			}
		}else{
			// ????????????????????????
			// console.log("???????????????????????????")
		}

    },
    //?????????????????????
    on_open:function(ws_event){
    // this.send(JSON.stringify(this.ssh_info || {}))
        // console.log(ws_event.data);
    },
    //?????????????????????
    on_message: function (ws_event){
		var _this = this;
		result = ws_event.data;
		if(_this.workorder==undefined) return;
        if(!result) return;
		// ????????????
		try{
			if(result != "pong"){
				var flag = $('#feedback-box').is(":hidden");
				var _result = JSON.parse(result);
				var window_flag = false;
				if(_this.chat_list != null){
					for(var w=0;w<_this.chat_list.length;w++){
						var _chat_list = JSON.parse(_this.chat_list[w]);
						if(_result.id==_chat_list.id&&_result.type==_chat_list.type){
							window_flag=true;
							break;
						}
					}
				}
				if(window_flag){
					// console.log("????????????");
				}else{
					if (!flag && _this.interface_flag=="chat"){
						// ????????????
						if(_result.type==1&&_result.status==undefined){
							return true;
						}else
						if(_result.type==0&&_result.status==undefined){
							return true;
						}
						_this.chat_show(result);
						// ????????????
						if(_result.type != 3){
							_this.chat_list.push(result);
						}
						//????????????????????????
						if (_result.status == 0&&_result.receiver==_this.bt_user&&_result.from_client != true){
							if(_result.type ==0||_result.type==1){
								_this.unread_messages.push(result);
							}
						}
						_this.status_clear(false,true);
					}else{
						if(_result.type == 3){
							_this.admian_unread_messages.push(result);
						}
						if(_result.type != 3){
							_this.chat_list.push(result);
						}
						if (_result.status == 0&&_result.receiver==_this.bt_user&&_result.from_client != true){
							if(_result.type != 3){
								_this.unread_messages.push(result);
							}
						}else
						if(_result.content=="close"||_result.type==6||_result.type==2){
							_this.unread_messages.push(result);
						}
						// ???????????????????????????????????????????????????
						// ????????????????????????
						var _hidden = $('.chat-number').is(":hidden");
						if (_hidden){
							$('.chat-number').show();
						}
						// ??????????????????
						try{
						var num = 0;
							for(var a=0;a<_this.unread_messages.length;a++){
								var _message = JSON.parse(_this.unread_messages[a]);
								if(_message.status==0&&_message.receiver==_this.bt_user&&_message.from_client != true){
									num = num+1;
								}else
								if(_message.type==5||_message.type==6||_message.type==2){
								    if(_message.content=="close"||_message.status==undefined){
							        	num = num+1;
								        _message.status=0
								    }
								}
							}
							if(num==0){
								$('.chat-number').hide();
							}else{
								$('.chat-number').html(num+"?????????");
							}
						}catch(err){
							// console.log("??????????????????????????????")
						}

					}
				}

				//????????????????????????????????????
				if(_result.type == 3){
					for(var i=0;i< _this.chat_list.length;i++){
						var msg = _this.chat_list[i];
						if (msg.id == _result.id){
							$('#'+msg.id).html("??????");
							msg.status = _result.status;
							break;
						}
					}
				}
			}
		}catch(err){
			// console.log("?????????????????????")
		}
    },
    //websocket????????????
    on_close: function (ws_event) {
        this.bws = null;
		// console.log("webscoket????????????");
    },
    //websocket????????????
    on_error: function (ws_event) {
        if(ws_event.target.readyState === 3){
            // var msg = '??????: ????????????WebSocket????????????????????????????????????????????????????????????';
            // layer.msg(msg,{time:5000})
            // if(Term.state === 3) return
            // Term.term.write(msg)
            // Term.state = 3;
        }else{
            // console.log(ws_event)
        }
    },
    //????????????
    //@param event ??????????????????
    //@param data ???????????????
    //@param callback ???????????????????????????????????????,????????????????????????
    send: function (data, num) {
        var that = this;
        //?????????????????????????????????????????????
        if (!this.bws || this.bws.readyState == 3 || this.bws.readyState == 2) {
            this.connect();
        }

        //????????????????????????,??????!=1??????100ms?????????????????????
        if (this.bws.readyState === 1) {
            this.send_server(that, data);
        } else {
			if(this.state === 3) return;
            if (!num) num = 0;
            if (num < 5) {
                num++;
                setTimeout(function () { that.send(data, num++); }, 100)
            }
        }
	},
	//??????????????????
	init_workorder:function(flag,success_callback){
		var _this = this;
		// ???????????????????????????????????????
		$.ajax({
			url: "/workorder/list",
			contentType: "application/json",
			dataType: 'json',
			success: function(rdata){
				if(rdata == undefined||rdata.length==0||rdata.status ==false||rdata.error_code!=undefined){
					return false;
				}else{
					_this.history_list = JSON.parse(JSON.stringify(rdata))
					if(flag){
						for (var i=0; i< rdata.length; i++){
							var _rdata = JSON.parse(rdata[i])
							if (_rdata.status == 1||_rdata.status == 0){
								_this.workorder = _rdata.workorder;
								_this.start_connect();
								break;
							}
						}
					}
				}
			}
		});

	},
	//????????????
	start_connect:function(){
		var _this = this;
		if(_this.workorder != undefined && _this.workorder != ""){
			_this.connect()
			_this.keepActive()
		}
	},
    //????????????
    close: function () {
        this.bws.close();
    },
	init:function(){
        var _this = this,
		body = $('body'), win = $(window)[0];
		body.append($('<div class="debugs"><span>??????</br>??????</span></div><span class="badge chat-number">0?????????</span>'));
		body.append($('<div class="feedback-box" id="feedback-box"></div>'));
		document.write("<script language=javascript src='/static/js/html2canvas.min.js'><\/script>");
		$('#feedback-box').hide();
		$('.chat-number').hide();
		$('.debugs').hide();
		//??????????????????
		try{
		    $.ajax({
    			url: "/workorder/get_user_info",
    			contentType: "application/json",
    			dataType: 'json',
    			success: function(rdata){
    				if(rdata.status == true&&rdata.uid != undefined){
    					_this.bt_user = rdata.username,_this.bt_uid = rdata.uid;
						_this.uid_status = true;
						_this.get_allow();
    				}else{
						$('.debugs').show();
					}
    			}
    		});
		}catch(err){
		      $('.debugs').show();
		}
		// ???????????????
		// ???????????????????????????????????????
		// bug????????????
		$('.debugs').on("click", function (e) {
		    $(this).css({"z-index":"99999998"});
			if (_this.bt_user != undefined && _this.bt_uid != undefined){
				var flag = $('#feedback-box').is(":hidden");
				if(_this.interface_flag=="feedback"){ // ??????????????????
					$("#feedback-box").fadeToggle(200);
					$('.debugs').empty();
					$('.debugs').append($(flag?'<span class="glyphicon glyphicon-chevron-down"></span>':'<span>??????</br>??????</span>'));
					$("#feedback-box").empty();
					if(_this.workorder){
						_this.animation_change_feedback2(_this.workorder,"feedback",_this.chat_list,true)
					}else{
						_this.create_chat_box(undefined,true,"feedback");
						_this.feedback_chat();
			            if(_this.bt_allow==false){
			                _this.allow_taboo();
			            }
					}
					e.stopPropagation();
				}else
				if(_this.interface_flag=="history"){
					$("#feedback-box").fadeToggle(200);
					_this.history_box(flag,"history");
				}else
				if(_this.interface_flag=="chat"){
					$("#feedback-box").fadeToggle(200);
					$('.debugs').empty();
					$('.debugs').append($(flag?'<span class="glyphicon glyphicon-chevron-down"></span>':'<img src="static/img/liaotian.png">'));
					$('.chat-content').scrollTop($(".chat-content")[0].scrollHeight);
					//????????????????????????????????????????????????
					var _admin_message = _this.admian_unread_messages;
					for(var i=0;i<_admin_message.length;i++){
						_this.chat_show(_admin_message[i])
					}
					_this.status_clear(false)
				}
			}else{
				//??????????????????
				_this.bind_btname();
			}
		});

		//????????????????????????????????????
		var hiddenProperty = 'hidden' in document ? 'hidden' :
		    'webkitHidden' in document ? 'webkitHidden' :
		    'mozHidden' in document ? 'mozHidden' :
		    null;
		var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
		var onVisibilityChange = function(){
		    if (!document[hiddenProperty]) {
		    }else{
				if(_this.interface_flag=="chat"){
					$("#feedback-box").hide(100);
					$('.debugs').empty();
					$('.debugs').append($('<img src="static/img/liaotian.png">'));
				}
		    }
		}
		document.addEventListener(visibilityChangeEvent, onVisibilityChange);
	},
	/**
	* @description ????????????
	*/
	get_allow:function(){
	    var _this = this;
    	try{
	    $.ajax({
			url: "/workorder/allow",
			contentType: "application/json",
			dataType: 'json',
			success: function(rdata){
				if(rdata.status == true){
					_this.bt_allow = rdata.status;
					_this.init_workorder(true,_this.start_connect);
				}
				$('.debugs').show();
			}
		});
		}catch(err){
		    $('.debugs').show();
		}
	},
	/**
	* @description ??????????????????????????????
	*/
	allow_taboo:function(){
	    var _this = this;
	    $(".history-list,.screenshot,.send-chat").attr("disabled",true);
	    $(".chat_html").attr("contenteditable",false);
	    $(".history-list,.screenshot").css({"cursor":"not-allowed"});
	},
	/**
	* @description ??????????????????
	*/
	feedback_chat:function(){
		var _this = this;
		_this.chat_show(JSON.stringify({"id": "feedback", "workorder": "feedback", "content": "?????????????????????????????????????????????????????????????????????????????????????????? ??????10:00-??????18:00", "receiver": "admin", "type": 0}));
		if(_this.bt_allow == false){
	    	_this.chat_show(JSON.stringify({"id": "EE", "workorder": "EE", "title":"????????????????????????,??????????????????", "content": "?????????????????????:</br>1??????????????????????????????????????????????????????????????????</br>2???????????????????????????????????????????????????????????????","btn":true,"btn_content":"?????????????????????", "receiver": "admin", "type": 0}));
		}else{
	    	_this.chat_show(JSON.stringify({"id": "feedback", "workorder": "feedback", "content": "????????????????????????????????????????????????????????????????????????????????????????????????", "receiver": "admin", "type": 0}));
		}
	},
	/**
    * @description ??????????????????
	* @param flag  ????????????
	* @param back  ????????????
    */
	history_box:function(flag,back){
		var _this = this;
		$('#feedback-box').empty();
		$('#feedback-box').append($('<div class="history-head">\
			<button type="button" class="'+(back=="history"?"history-back":"chat-back")+'"><span class="glyphicon glyphicon-chevron-left"></span></button>\
			<span class="chat-name" style="margin-left:80px;float: none;">??????????????????</span>\
			</div>\
			<div class="history-content">\
				<div class="divtable mt10">\
					<table class="table table-hover">\
						<thead>\
							<tr>\
								<th>????????????</th>\
								<th width="30%">????????????</th>\
								<th style="text-align: right;" width="100">??????</th>\
							</tr>\
						</thead>\
						<tbody id="historyTable"></tbody>\
					</table>\
				</div>\
			</div>'));
		_this.get_history(back);
		$('.debugs').empty();
		$('.debugs').append($(flag?'<span class="glyphicon glyphicon-chevron-down"></span>':'<span>??????</br>??????</span>'));
		//??????????????????
		$(".history-back").on("click", function (e) {
			_this.interface_flag = "feedback";
			_this.create_chat_box(undefined,true,"feedback");
			_this.feedback_chat()
		});
		//????????????
		$(".chat-back").on("click", function (e) {
			$('#feedback-box').empty();
			_this.interface_flag = "chat";
			_this.animation_change_feedback2(_this.workorder,"feedback",_this.chat_list);
		});
	},
	/**
	* @description ????????????
	* @param workorder  ????????????
	* @param flag  ????????????
	* @param back  ????????????
	*/
	create_chat_box:function(workorder,flag,back,callback){
		var _this = this;
	    $('#feedback-box').empty();
		$('#feedback-box').append($('<div class="chat-head">\
			<button type="button" style="'+(back=="feedback"?"display:none":"")+'" class="history-list-back"><span class="glyphicon glyphicon-chevron-left"></span></button>\
			<span class="'+(_this.interface_flag=="feedback"?"chat-name":(workorder==_this.workorder?"chat-name":"chat-history"))+'" >'+(_this.interface_flag=="feedback"?"????????????":(workorder==_this.workorder?"????????????":"??????????????????(??????????????????)"))+'</span>\
			<button type="button" class="history-list" title="????????????" style="'+(_this.interface_flag=="feedback"?"":(workorder==_this.workorder?"":"display:none"))+'"><span>????????????</span></button>\
		</div>\
		<div class="chat-content" style="'+(_this.interface_flag=="feedback"?"":(workorder==_this.workorder?"":"height: 560px;border-radius: 0px 0px 10px 10px;"))+'">\
			<div class="clear"></div>\
		</div>\
		<div class="chat-tool" style="'+(_this.interface_flag=="feedback"?"":(workorder==_this.workorder?"":"display:none"))+'">\
			<div class="text-tool">\
				<div class="tool-border">\
					<input class="tool-input screenshot" type="button" title ="??????????????????:&#10 1. ???????????????????????????????????????????????????????????????????????????&#10 2. ???????????????????????????????????????????????????&#10 3. ??????????????????????????????????????????" />\
					<div class="tool-text" style="color:#2ea9df"><img  src="/static/img/jietu.png" />??????</div></div>\
			</div>\
		</div>\
		<div class="chat-bottom" style="'+(_this.interface_flag=="feedback"?"":(workorder==_this.workorder?"":"display:none"))+'">\
			<div class="text-box">\
				<pre contenteditable="true" id="chat_html" data-backspace class="chat_html"></pre>\
			</div>\
			<div class="text-button">\
				<div class="btn-group" style="float: right;">\
					<button type="button" class="btn btn-sm btn-success  button-send send-chat" style="background-color: #01B132;outline: none;">????????????</button>\
				</div>\
				<input type="button" class="btn btn-sm btn-danger button-size stop-chat"  style="outline: none;" value="????????????"></button>\
			</div>\
		</div>'));
		$('.screenshot,.send-chat,.stop-chat,.history-list,.chat-content').unbind();
		//??????????????????
		if(_this.interface_flag=="chat"){
			if(_this.workorder==undefined){
				$('.screenshot').attr("disabled",true);
				$('.text-box pre').attr("contenteditable",false);
			}else{
				$('.screenshot').attr("disabled",false);
				$('.text-box pre').attr("contenteditable",true);
			}
		}
		//????????????
		$(".send-chat").on("click", function (e) {
			if(_this.interface_flag == "feedback"){
				_this.add_feedback();
			}else{
				if(_this.workorder !=undefined){
					_this.send_chat(workorder);
				}
			}
			e.stopPropagation();
		});
		//????????????
		$(".stop-chat").on("click", function (e) {
			if(_this.interface_flag == "feedback"){
				var _flag = $('#feedback-box').is(":hidden");
				$("#feedback-box").css("display","none");
				$('.debugs').empty();
				$('.debugs').append('<span>??????</br>??????</span>');
			}else{
				_this.stop_chat(_this.workorder);
			}
			e.stopPropagation();
		});
		//????????????
		$(".chat-content").on("click",".open-allow",function (e) {
		   	$("#feedback-box").css("display","none");
			$('.debugs').empty();
			$('.debugs').css({"z-index":"9999"});
			$('.debugs').append('<span>??????</br>??????</span>');
		    bt.soft.updata_ltd(true);
		});
// 		//????????????
// 		$(".chat-content").on("click",".not-send", function (e) {
// 				layer.confirm('???????????????????????????', {icon: 2, title:'????????????',
// 				closeBtn:2,
// 				btn: ['??????','??????'],
// 				zIndex:999999999 //????????????
// 			},function(index,layers){
// 				layer.close(layer.index);
// 				var _reply_box  = $(this).parents(".reply-box"),_id = _reply_box.attr("data-id"),_fail_send_list = _this.fail_send_list;
// 				$.each(_fail_send_list,function(index,item){
// 					if(item.id==_id){
// 						_reply_box.remove();
// 						_this.reply_chat_show(item);
// 					}
//             	});
				
// 			});
// 			e.stopPropagation();
// 		});
		//????????????
		$(".chat_html").keydown(function (e) {
			if(e.ctrlKey==1 && e.keyCode == 13) {
				e.preventDefault();
				if(_this.interface_flag == "feedback"){
					_this.add_feedback();
				}else{
					if(_this.workorder !=undefined){
						_this.send_chat(workorder);
					}
				}
			}
		});
		//????????????
		$(".chat_html").on("click","img",function (e) {
		    _this.thumbnail($(this).attr("src"))
			e.stopPropagation();
		});
// 		//??????????????????
// 		$(".chat_html").bind('input propertychange', function() {
// 		    if(_this.interface_flag=="feedback"){
// 		          localStorage.setItem("feedback",$(this).html());
// 		    }
//         });
		//Ctrl+v
		 var chat_html = document.getElementById("chat_html");
        // ?????????????????????
        chat_html.onclick = function() {
            // ??????????????????
            var selection = getSelection()
            // ????????????????????????
    		try{
    			 _this.lastEditRange = selection.getRangeAt(0)
    		}catch(err){
//    			console.log(err)
    		}
        }

        // ???????????????????????????
        chat_html.onkeyup = function() {
            // ??????????????????
            var selection = getSelection()
            // ????????????????????????
            try{
            	 _this.lastEditRange = selection.getRangeAt(0)
            }catch(err){
//            	console.log(err)
            }
        }
	    document.getElementById('chat_html').addEventListener('paste',function(e){
    		if (e.clipboardData && e.clipboardData.items) {
            for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
                var item = e.clipboardData.items[i];
                if (item.kind === "string" && item.type==="text/plain") {
                    e.preventDefault();
	                item.getAsString(function (str) {
                        _this.insertContent(document.getElementById("chat_html"), str)
                    })
                }
            }
        }
        });
		//??????????????????
		$('.history-list-back').on("click", function (e) {
			var _flag = $('#feedback-box').is(":hidden");
			_this.interface_flag = "history";
			$('#feedback-box').empty();
			if(back=="history"){
				_this.history_box(true,"history"); //??????????????????
			}else{
				_this.history_box(true,"chat");  //??????????????????
			}
			e.stopPropagation();
		});
	    //??????????????????
		$('.history-list').on("click", function (e) {
			var _flag = $('#feedback-box').is(":hidden");
			$('#feedback-box').empty();
			if(_this.interface_flag=="feedback"){
				_this.history_box(true,"history");
			}else{
				_this.history_box(true,"chat");
			}
			_this.interface_flag = "history";
			e.stopPropagation();
		});
		//??????
		$('.screenshot').on("click", function (e) {
			$("#feedback-box").hide();
			$('.debugs').empty();
			$('.debugs').append($('<img src="static/img/liaotian.png">'));
			_this.screenshot();
			e.stopPropagation();
		});
		// ??????????????????
		if(callback==true){
			_this.status_clear(true);
		}else{
			_this.status_clear(false);
		}
	},
    /**
    * @description ????????????
    */
    add_feedback:function(callback){
		var _this = this,
		_feedback = $('.chat_html').html();
		if(_feedback == ""||_feedback==null||_feedback.match(/./g)==null||_feedback.match(/^[ ]*$/)){
			layer.tips('??????????????????????????????????????????', '.send-chat', {
				tips: [1, '#e62214'],
				zIndex:9999999999999 //????????????
			});
            return false;
		}
		if(_this.bt_allow==false){
		    layer.tips('??????????????????', '.send-chat', {
				tips: [1, '#e62214'],
				zIndex:9999999999999 //????????????
			});
            return false;
		}
		_this.unread_messages=[];//???????????????????????????
		_this.chat_list=[]; //?????????????????????chat_list????????????????????????
		_this.chat_segmentation();
	},
	/**
	* @description ????????????????????????
	* @param workorder  ????????????
	* @param back  ????????????
	* @param callback
	*/
	animation_change_feedback2:function(workorder,back,messages,callback){
		var _this = this;
		_this.interface_flag = "chat";
		_this.create_chat_box(workorder,true,back,callback);
		if(callback == undefined){
			var _result = messages;
			$.each(_result,function(index,item){
				_this.chat_show(item);
			});
		}
	},
      /**
    * @description ????????????
    * @param {String} chat ??????????????????
    */
    chat_segmentation:function(workorder){
		var _this = this;
		//????????????
		var html = document.getElementById("chat_html");
		var childs = html.childNodes,text = "";
		//????????????
		var _feedback = "",image_list = [];
		reg = new RegExp("data:image/.+;base64");
		var exists_img = false;
		for(var i=0;i<childs.length;i++){
			if (childs[i].nodeName == "IMG") {
			    exists_img = true;
				// ?????????????????? ????????? text
				if (text != "" && text.trim().length>0){
					if(_this.interface_flag == "feedback"){
						_feedback = _feedback+text.trim();
					}else{
						//??????????????????
						_this.send_message(text.trim().replace(/\n/g,"<br>"),0);
					}
				}
				// ?????????????????? childs[i]
				if (reg.test(childs[i].src) == true){
					if(_this.interface_flag == "feedback"){
						image_list.push(childs[i].src)
						if(i==childs.length-1){
							_this.feedback_transfer(_feedback,image_list);
						}
					}else{
						_this.send_message(childs[i].src,1);
					}
				}else{
					var theImage = new Image(); theImage.src = childs[i].src;
					_this.imageChangBase64(childs[i].src, function (base64) {
						if(_this.interface_flag == "feedback"){
							image_list.push(base64)
							if(i==childs.length-1){
								_this.feedback_transfer(_feedback,image_list);
							}
						}else{
							_this.send_message(childs[i].src,1);
						}
					},theImage.width,theImage.height);
				}
				// ??????????????????
				text = "";
			} else if (childs[i].nodeName == "BR"){
				if(text != ""&&text !=null){
					text = text + "<br>";
				}

			} else {
				//(childs[i].nodeName == "#text")
				text = text + childs[i].textContent;
			}
		}
		if(text != "" && text.trim().length>0){
			if(_this.interface_flag=="feedback"){
				_feedback = _feedback+text.trim();
				_this.feedback_transfer(_feedback,image_list);
			}else{
				//??????????????????
				_this.send_message(text.trim().replace(/\n/g,"<br>"),0);
			}
		}else{
		    if (!exists_img){
			    layer.tips('????????????????????????,???????????????', '.send-chat', {
				    tips: [1, '#e62214'],
				    zIndex:9999999999999 //????????????add
			    });
			    $('.chat_html').empty();
		    }
		}
	},
	/**
    * @description ????????????
	* @param {String} content ????????????
	* @param {String} type ????????????
	* @param {String} id ????????????id
    */
   	send_message:function(content,type,id){
		var _this = this;
		//???????????????????????????id????????????
		if(_this.interface_flag=="chat"){
			var  _snowflake = new Snowflake(Number(1), Number(1), Number(0)),workorder = _this.workorder;
			var snow_id = _snowflake.nextId().toString();
			if(type != 3){
				var reply_message = {"id":snow_id,"type":type,"content":content,"workorder":workorder,"state":0};
				_this.reply_chat_show(reply_message);
				_this.chat_list.push(JSON.stringify(reply_message));
			}
			if(_this.bws){
				try{
					type==3?_this.send_server(_this, JSON.stringify({"id":id, "type":3,"content":content,"workorder":workorder})):_this.send_server(_this, JSON.stringify({"id":snow_id, "type":type, "content":content,"workorder":workorder,"from_client":true,"sender":_this.bt_user}));
				}catch(err){
					// console.log("??????????????????")
				}
			}
		}
	},

	send_server:function(that,data){
        //?????????????????????????????????????????????
        if (!that.bws || that.bws.readyState == 3 || that.bws.readyState == 2) {
            this.connect(null,function(bws){
				setTimeout(function(){
					that.bws.send(data);
				},200);
			});
			return;
        }

        //????????????????????????,??????!=1??????100ms?????????????????????
        if (that.bws.readyState === 1) {
            that.bws.send(data);
        }else{
			layer.msg('????????????????????????????????????????????????????????????');
		}
	},

	/**
	* @description ??????????????????
	* @param {String} message websocket????????????????????????
	*/
	chat_show:function(message,callback){
		var _this = this,
		_message = JSON.parse(message);
		switch (_this.interface_flag){
			case "feedback":
				if(_message.workorder=="feedback")_this.system_chat(_message);
				if(_message.workorder=="EE")_this.system_chat(_message);
				break;
			case "chat":
				switch (_message.type){
					case 0:
						(_message.sender==_this.bt_user&&_message.from_client==true)?_this.reply_chat_show(_message):_this.dialog_chat_show(_message)
						break;
					case 1:
						(_message.sender==_this.bt_user&&_message.from_client==true)?_this.reply_chat_show(_message):_this.dialog_chat_show(_message)
						break;
					case 2:
						$('.chat-content').append('<div class="chat-system" id="'+_message.id+'"><p>\
						????????????????????????</p></div>');
						$('.chat-content').scrollTop($(".chat-content")[0].scrollHeight);
						break;
					case 3:
						$('#'+_message.id).html("??????");
						break;
					case 4:
						break;
					case 5:
						_this.system_chat(_message);
						break;
					case 6:
						_this.system_chat(_message);
						$('.screenshot').attr("disabled",true);
						$('.text-box pre').attr("contenteditable",false);
						$('.send-chat').css({"background-color":"#ffffff","color":"#000","border-color":"#ccc"});
						$('.send-chat').attr("disabled",true);
						if(_message.workorder == _this.workorder){
							_this.disconnect();
						}
						break;
					default:
					    var _origin_id = _message.origin_id;
				    	$.each(_this.waiting_list,function(index,item){
        					if(item.origin_id ==_origin_id){
                    			$("#"+_message.origin_id).html("??????");
                    			$("#"+_message.origin_id).attr("id",_message.id);
                    			$("[name="+_origin_id+"]").remove();
                    			clearInterval(item.interval);
        					}
                    	});
				}
				break;
			}
		if(callback) callback(this._message);
	},
	/**
	* @description ????????????????????????/??????????????????
	* @param {Object} message ????????????
	*/
	dialog_chat_show:function(_message){
		var _this = this;
		$('.chat-content').append('<div class="chat-dialog-box">\
			<div class="dialog-portrait">\
				<img src="'+_this.portrait+'" class="dialog-portrait-image" />\
			</div>\
			<div class="'+(_message.type==0?"dialog-triangle":"")+'"></div>\
			<div class="chat-dialog-border">\
				<label style="'+(_message.type==1?"margin-left:16px":"")+'">???????????? '+_message.date+'</label>\
				<div class="dialog-text" style="'+(_message.type==1?"margin-left:16px;background-color:#ffffff;border: 0;":"")+'" >\
					<pre>'+(_message.type==0?_message.content.replace(/&lt;br&gt;/g,"<br>").replace(/\s/g,"&nbsp;"):'<img onclick="box.thumbnail(\'' + _message.content + '\')" src="'+_message.content+'" />')+'</pre>\
				</div>\
				<label name="chat-dialog-status" id="'+_message.id+'" style="display:none;\
				margin-top: 5px;">??????</label>\
			</div>\
		</div>');
		$('.chat-content').scrollTop($(".chat-content")[0].scrollHeight);
	},
	/**
	* @description  ??????????????????
	* @param {Object} message ????????????
	*/
	reply_chat_show:function(_message){
		var _this = this;
		var chat_waiting = '<img src="/static/img/jiazai.png" class="waiting rotate" />';
		var chat_not_send = '<span class="glyphicon glyphicon-exclamation-sign not-send"></span>';
		//???????????????
		var len = 60;
		if(_message.sent&&_message.sent==true){
		    
		}else{
			$('.chat-content').append('<div class="chat-reply-box" data-id="'+_message.id+'">\
				<div class="reply-portrait"><img src="'+_this.bt_yh_portrait+'" class="reply-portrait-image"  /></div>\
				<div class="'+(_message.type==0?"reply-triangle":"")+'"></div>\
					<div class="reply-text" style="'+(_message.type==0?"":"background-color:#ffffff;margin-top:2px;margin-right:2px;")+'">\
						<'+(_message.type==0?"pre":"p")+'>'+(_message.type==0?_message.content.replace(/&lt;br&gt;/g,"<br>").replace(/\s/g,"&nbsp;"):'<img onclick="box.thumbnail(\'' + _message.content + '\')" src="'+_message.content+'" />')+'<'+(_message.type==0?"/pre":"/p")+'>\
					</div>\
					<div class="message-send-state"  name="'+_message.id+'" >'+(_message.state==0?chat_waiting:"")+'</span></div>\
					<label name="chat-reply-status" id="'+_message.id+'" style="'+(_message.type==0?"margin-top: 5px":"margin-top: -5px")+';\
					margin-right: 62px;"">'+(_message.state==0?"?????????":(_message.status==0?"??????":"??????"))+'</label>\
				</div>\
			   </div>');
			$('.chat-content').scrollTop($(".chat-content")[0].scrollHeight);
			//???????????????
			if(_message.state==0){
			    var time = setInterval(function() {
                    len = len - 1;
                    if (len == 0) {
                        $("[name="+_message.id+"]").empty();
                        $("[name="+_message.id+"]").append(chat_not_send);
                        _this.fail_send_list.push(_message)
                        $("#"+_message.id).html("????????????");
                        clearInterval(time);
                    }
                }, 1000);
                    var reply_interval ={"origin_id":_message.id,"Interval":time}
                    _this.waiting_list.push(reply_interval);
			}
		}
	},
	/**
	* @description  ????????????/????????????/??????????????????
	* @param {Object} message ????????????
	*/
	system_chat:function(message){
		var _this = this;
		if(message.content=="close"||message.workorder=="feedback"||message.workorder=="EE"){
		   if(message.content=="close"){
		       	if(message.workorder == _this.workorder){
    					_this.disconnect();
    				}
    			_this.interface_flag="feedback";
		        message.content ="?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????";
		   }
			$('.chat-content').append('<div class="chat-dialog-box">\
				<div class="dialog-portrait">\
					<img src="'+_this.portrait+'"class="dialog-portrait-image" />\
				</div>\
				<div class="dialog-triangle" style="'+(message.workorder=="EE"?"visibility:hidden":"")+'"></div>\
				<div class="chat-dialog-border">\
					<label>????????????(????????????)</label>\
					<div class="dialog-text" style="'+(message.workorder=="EE"?"background-color:#ffffff;border-color:#dbdbdb":"")+'"><div class="dialog-text-title" style="'+(message.workorder=="EE"?"":"display:none")+'">'+(message.workorder=="EE"?message.title:"")+'</div>\
						<pre style="'+(message.workorder=="EE"?"background-color:#ffffff":"")+'">'+message.content+'</pre>\
						<button class="btn btn-sm btn-success dialog-button open-allow" style="'+(message.workorder=="EE"?"":"display:none")+'">'+(message.workorder=="EE"?message.btn_content:"")+'</button>\
					</div>\
				</div>\
			</div>');
		}else{
			$('.chat-content').append('<div class="chat-system"><p>'+message.content+'</p></div>');
			$('.chat-content').scrollTop($(".chat-content")[0].scrollHeight);
		}
		$('.chat-content').scrollTop($(".chat-content")[0].scrollHeight);
	},
   	/**
    * @description ????????????
	* @param {String} feedback ??????????????????
	* @param {String} imageList ??????????????????
    */
	feedback_transfer:function(feedback,imageList){
	var _this = this;
		var _length = imageList.length;
		var imgf,imgs,imgt;
		//??????????????????
		$('.debugs').attr("disabled",true);
		var  _snowflake = new Snowflake(Number(1), Number(1), Number(0));
        var mask = '<div class="image-span">\
					<span>+</span>\
				</div> '
		if(_length>=3){
			imgf = '<img   onclick="box.thumbnail(\'' + imageList[0] + '\')" src='+imageList[0]+'>';
			imgs = '<img   onclick="box.thumbnail(\'' + imageList[1] + '\')" src='+imageList[1]+'>';
			imgt = '<img   onclick="box.thumbnail(\'' + imageList[2] + '\')" src='+imageList[2]+'>';
			$('.feedback-border').css("border",0);
		}else
		if(_length==2){
			imgf = '<img   onclick="box.thumbnail(\'' + imageList[0] + '\')" src='+imageList[0]+'>';
			imgs = '<img   onclick="box.thumbnail(\'' + imageList[1] + '\')" src='+imageList[1]+'>';
			imgt = mask;
		}else
		if(_length==1){
			imgf = '<img   onclick="box.thumbnail(\'' + imageList[0] + '\')" src='+imageList[0]+'>';
			imgs =imgt = mask;
		}else{
			imgf=imgs =imgt = mask;
		}
		$('body').append($('<div class="feedback-mask"></div>'));
		$('body').append($('<div class="feedback-border" style="'+(_length>0?"height:360px":"")+'">\
		            <span class="layui-layer-setwin"><a class="layui-layer-ico layui-layer-close layui-layer-close2 feedback-close-span" ></a></span>\
		            <div class="feedback-head"><span>??????????????????</span></div>\
					<div class="feedback-span"><span>???????????????:</span></div>\
			    	<div class="feedback-text-input" style="'+(_length>0?"height:25%":"")+'">\
						<textarea class="feedback-text">'+feedback+'</textarea>\
					</div>\
					<div class="feedback-span"style="margin-top: 10px;"><span>????????????(????????????????????????):</span></div>\
					<div class="feedback-text-input ">\
						<div class="feedback-image-box" id="imgf" style="'+(_length>0?"border:0":"")+'">'+imgf+'</div>\
						<div class="feedback-image-box" id="imgs" style="'+(_length==0?"display:none":(_length>1?"border:0":""))+'">'+imgs+'</div>\
						<div class="feedback-image-box" id="imgt" style="margin-right:0px;'+(_length<2?"display:none":(_length>2?"border:0":""))+'">'+imgt+'</div>\
					</div>\
					<ul class="mtl0 c7" style="font-size: 12px;color: red;margin: 7px 11px 0px 19px;'+(_length==0?"":"display:none")+'">\
            		    <li style="list-style:inside disc">???????????????????????????????????????????????????????????????????????????????????????</li>\
            	    </ul>\
					<div class="feedback-bottom">\
						<button type="button" class="btn btn-sm btn-success feedback-button-group feedback-submit">????????????</button>\
						<button type="button" class="btn btn-sm btn-danger feedback-button-group feedback-close" style="right: 97px;">??????</button>\
					</div>\
			</div>'));
			$(".feedback-close,.feedback-submit,.feedback-close-span,.image-span").unbind();
			$(".feedback-text").focus();
			$(".feedback-close,.feedback-close-span").on("click", function (e) {
				$('.feedback-mask').remove();
				$('.feedback-border').remove();
				 $(".debugs").unbind("click",_this.showChang);
				e.stopPropagation();
			});
			$(".debugs").on("click",_this.showChang);
			$(".feedback-submit").on("click", function (e) {
			    var contents = [];
			    //????????????????????????
			    $(this).attr("disabled",true);
			    var imgf_flag = $("#imgf").find("img").attr("src")?true:false; imgs_flag = $("#imgs").find("img").attr("src")?true:false; imgt_flag = $("#imgt").find("img").attr("src")?true:false;
			    if(_length==0){
			        imgf_flag==true?imageList.push($("#imgf").find("img").attr("src")):"";
		            imgs_flag==true?imageList.push($("#imgs").find("img").attr("src")):"";
		            imgt_flag==true?imageList.push($("#imgt").find("img").attr("src")):"";
			    }else
			    if(_length==1){
			       imgs_flag==true?imageList.push($("#imgs").find("img").attr("src")):"";imgt_flag==true?imageList.push($("#imgt").find("img").attr("src")):"";
			    }else
			    if(_length==2){
			       imgt_flag==true?imageList.push($("#imgt").find("img").attr("src")):"";
			    }
				var _feedback = $(".feedback-text").val();
				if(_feedback == ""||_feedback==null||_feedback.match(/./g)==null||_feedback.match(/^[ ]*$/)){
					layer.tips('??????????????????????????????????????????', '.feedback-submit', {
						tips: [1, '#e62214'],
						zIndex:9999999999999 //????????????
					});
					return false;
				}
				var snow_id_text = _snowflake.nextId().toString();
				contents.push({"id":snow_id_text,"type":0,"content":_feedback});
				for(var i=0;i<imageList.length;i++){
					var snow_id_img = _snowflake.nextId().toString();
					contents.push({"id":snow_id_img,"type":1,"content":imageList[i]});
				}
				_this.feedback_submit(contents);
				e.stopPropagation();
			});
			$('.image-span').on("click", function (e) {
			    var  _id = "#"+ $(this).parent().attr("id");
				$("#feedback-box,.feedback-border,.feedback-mask").hide();
    			$('.debugs').empty();
    			$('.debugs').append($('<span>??????</br>??????</span>'));
    			_this.screenshot(_id);
    			$(this).parent().css("border",0).next().css("display","inline-block");
    			$(this).parent().find("img")
    			e.stopPropagation();
			});
	},
	showChang:function(index){
        $('.feedback-mask').fadeToggle(100);
		$('.feedback-border').fadeToggle(100);
    },
	/**
    * @description ??????????????????
    * @param {String} contents  ????????????
    */
	feedback_submit:function(contents){
		var _this = this
		try{
		    $.post("/workorder/create",{contents:JSON.stringify(contents),"collect":false},function(rdata){
    			if(rdata.error_code!=undefined&&rdata.status==false){
    				if(rdata.msg==undefined&&rdata.content==undefined){
    					rdata.msg="?????????????????????";
    				}else
    				if(rdata.msg==undefined){
    					rdata.msg =	rdata.content;
    				}
    				layer.tips(rdata.msg, '.feedback-submit', {
    					tips: [1, '#e62214'],
    					zIndex:9999999999999 //????????????
    				});
    				$(".feedback-submit").attr("disabled",false);
    			}else{
    				if(rdata.workorder!==undefined||rdata.workorder!==null){
    					_this.workorder = rdata.workorder;
    					_this.init_workorder(true)
    					_this.interface_flag="chat";
    					$(".chat_html").empty();
    					$('.feedback-mask').remove();
    					$('.feedback-border').remove();
    				}
    			}
    		});
		}catch(err){
		    //????????????????????????
			$(".feedback-submit").attr("disabled",false);
		}
		
	},
	/**
    * @description ????????????????????????
    * @param {String} workorder ??????ID
	* @param {String} status ????????????
    */
   	feedback_history:function(workorder,status,back){
		var _this = this;
		$('#feedback-box').empty();
		// ???????????????????????????ajax???????????????window.location/workorder/get_message?workorder=?
		if(status==2){
		$.ajax({
			url: "/workorder/get_messages?workorder="+workorder,
			contentType: "application/json",
			dataType: 'json',
			success: function(rdata){
			    if(rdata.status==false){
			        return false;
			    }else{
			        if(back=="history"){
    					_this.animation_change_feedback2(workorder,"history",rdata);
    				}else{
    					_this.animation_change_feedback2(workorder,"chat",rdata)
    				}
			    }
			}
		});
		}else
		if(status==1||status==0){
			//?????????????????????????????????????????????
		_this.animation_change_feedback2(_this.workorder,"feedback",_this.chat_list);
		}else{

		}
	},
	/**
    * @description ????????????????????????
	*  @param {String} back ????????????
    */
	get_history:function(back,callback){
		var _this = this;
		if(_this.history_list==null) return false;
		try{
			var rdata = JSON.parse(JSON.stringify(_this.history_list));
		}catch(err){
		}
		var rdata = JSON.parse(JSON.stringify(_this.history_list));
		$('#historyTable').empty();
		// ???????????????????????????ajax???????????????window.location/workorder/get_message?workorder=?
		$.each(rdata,function(index,item){
			if(JSON.parse(item).status !=2){
				return true;
			}
			$('#historyTable').append($(
				'<tr>\
				<td style="width: 35%;"><a onclick="box.feedback_history(\'' +JSON.parse(item).workorder+ '\',\''+JSON.parse(item).status+'\',\''+back+'\')"\
					style="color:#2ea9df;cursor: pointer;">\
					'+ (JSON.parse(item).subject.length>5?JSON.parse(item).subject.slice(0,8)+"...":JSON.parse(item).subject) +'</td>\
				<td style="width: 45%;">'+ JSON.parse(item).date +'</a></td>\
				<td style="width: 20%;text-align:right;"><a " \
				>'+(JSON.parse(item).status==0?"?????????":(JSON.parse(item).status==1?"?????????":"?????????"))+'</a></td>\
			</tr>'
			));
		});
	},
	/**
    * @description ??????????????????
    */
	bind_btname : function(callback)
	{
	    var _this = this;
	    $('#feedback-box').hide();
		$('.debugs').empty();
		$('.debugs').append($('<span>??????</br>??????</span>'));
		layer.open({
			type: 1,
			title: '????????????????????????',
			area: ['420px','360px'],
			closeBtn: 2,
			shadeClose: false,
			content:'<div class="libLogin pd20" ><div class="bt-form text-center"><div class="line mb15"><h3 class="c2 f16 text-center mtb20">????????????????????????</h3></div><div class="line"><input class="bt-input-text" name="username2" type="text" placeholder="??????" id="p1"></div><div class="line"><input autocomplete="new-password" class="bt-input-text" type="password" name="password2"  placeholder="??????" id="p2"></div><div class="line"><input class="login-button" value="??????" type="button" ></div><p class="text-right"><a class="btlink" href="https://www.bt.cn/register.html" target="_blank">????????????????????????</a></p></div></div>',
			success:function(){
			    $('.login-button').click(function(){
    				p1 = $("#p1").val();
    				p2 = $("#p2").val();
    				var loadT = bt.load(lan.config.token_get);
    				bt.send('GetToken','ssl/GetToken',{username:p1,password:p2},function(rdata){
    					loadT.close();
    					bt.msg(rdata);
    					if(rdata.status) {
    						if(callback){
    							layer.closeAll();
    							callback(rdata)
    						}
    						else{
    							window.location.reload();
    						}
    						$("input[name='btusername']").val(p1);
    					}
    				})
    			});
    			$('.libLogin input[type=password]').keyup(function(e){
    				if(e.keyCode == 13){
    					$('.login-button').click();
    				}
    			});
			}
		});
	},
	/**
    * @description ?????????base64
    * @param {Object} img ????????????
    */
	imageChangBase64:function(url,callback,w,h){
		if(typeof url === "undefined"){
			callback();
			return false;
		}
		var canvas = document.createElement("canvas");   //??????canvas DOM??????
		var ctx = canvas.getContext("2d");
		var img = new Image,
		dataURL='';
		img.crossOrigin = 'Anonymous';
		img.src = url;
		//????????????Safari?????????
		var userAgent = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
		if(userAgent) {
			var canvas= document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			var ctx=canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, w, h);
			canvas.toBlob = function(blob) {
			    try{
			        var url = URL.createObjectURL(blob);
			    }catch(err){
			    }
				callback.call(this, url); //??????????????????Base64??????
				canvas = null;
			}
		}else{
			img.onload = function () {
				canvas.height = h; //?????????????????????,?????????
				canvas.width = w; //?????????????????????????????????
				ctx.drawImage(img, 0, 0, w, h); //??????????????????
				try{
				    dataURL = canvas.toDataURL("image/");
				}catch(err){
				    // console.log("??????????????????")
				}
				callback.call(this, dataURL); //??????????????????Base64??????
				canvas = null;
			};
		}
	},
    /**
    * @description ??????????????????
    */
    send_chat:function(workorder,callback){
        var _this = this;
		var _chat_html = $('.chat_html').html();
        if(_chat_html == ''||_chat_html==null||_chat_html=='<br>'||_chat_html.match(/^[ ]*$/)||_chat_html.match(/./g)==null){
			layer.tips('????????????????????????,???????????????', '.send-chat', {
				tips: [1, '#e62214'],
				zIndex:9999999999999 //????????????add
			  });
			$('.chat_html').empty();
            return false;
		};
        _this.chat_segmentation(workorder);
        $('.chat_html').empty();
	},
	/**
    * @description ?????????????????????????????????
	* @param {boolean} flag ??????????????????
	* @param {boolean} show ?????????????????????????????????
    */
	status_clear:function(flag,show){
		var _this = this;
		// ??????????????????
		var  _unread_messages = JSON.parse(JSON.stringify(_this.unread_messages));
		for(var i=0;i<_unread_messages.length;i++){
			var _message = JSON.parse(_unread_messages[i])
			if(_message.status==1){
				continue;
			}
			if(_this.bws&&_this.bws.readyState==1){
				if(_message.type !=5&&_message.type !=6&&_message !=2){
					_this.send_message(_message.content,3,_message.id);
				}
			}
			// ??????????????????????????????????????????
			for(var j=0;j<_this.chat_list.length;j++){
				if (_message.id == _this.chat_list[j].id){
					_this.chat_list[j].status = 1;
				}
				if(!flag){
				    if(show==undefined){
			        	_this.chat_show(_unread_messages[i]);
				        break;
				    }
				}
			}
			// ????????????
			_message.status = 1;
			_this.unread_messages[i] = JSON.stringify(_message);
			try{
				var num = parseInt($('.chat-number').html())

				if (num-1 == 0){
					$('.chat-number').hide();
				}else{
					$('.chat-number').html(num-1+"?????????");
				}
			}catch(err){
			}
		}
		if(flag){
			for(var a=0;a<_this.chat_list.length;a++){
				_this.chat_show(_this.chat_list[a]);
			}
		}

	},
	/**
    * @description ????????????
	* @param {String} workorder ????????????
    */
	stop_chat:function(workorder){
		var _this = this;
		layer.confirm('????????????????????????', {icon: 2, title:'????????????',
			closeBtn:2,
			btn: ['??????','??????'],
			zIndex:999999999 //????????????
		},function(index,layers){
			layer.close(layer.index);
			var _flag = $('#feedback-box').is(":hidden");
			_this.interface_flag = "feedback";
			_this.chat_list = [];
			_this.init_workorder(false);
			if(workorder==undefined||workorder==null){
				$('#feedback-box').empty();
				_this.create_chat_box(undefined,true,"feedback");
				_this.feedback_chat();
				return false;
			}
			$.post("workorder/close",{workorder:workorder},function(rdata){
				if(rdata.status){
					if(_this.workorder !=undefined){
						_this.disconnect();
						if(_this.workorder==undefined){
							$('#feedback-box').empty();
							_this.create_chat_box(undefined,true,"feedback");
							_this.feedback_chat();
						}
					}
					_this.chat_list = [];
				}else{
					layer.tips('???????????????????????????', '.stop-chat', {
						tips: [1, '#e62214'],
						zIndex:9999999999999 //????????????
					});
					return false;
				}
			});
		});
	},
	/**
    * @description ??????????????????
    */
	insertContent:function(element, str){
	    var _this =this;
	     chat_html = element
        // ?????????????????????
        chat_html.focus()
        // ??????????????????
        var selection = getSelection()
        // ???????????????????????????????????????
        if (_this.lastEditRange) {
            // ???????????????????????????????????????????????????????????????????????????????????????????????????
            selection.removeAllRanges()
            selection.addRange(_this.lastEditRange)
        }
        // ??????????????????????????????????????????????????????
        if (selection.anchorNode.nodeName != '#text') {
            // ??????????????????????????????????????????????????????????????????
            var pasted_text = document.createTextNode(str)
            if (chat_html.childNodes.length > 0) {
                // ?????????????????????????????????0???????????????????????????????????????????????????????????????
                for (var i = 0; i < chat_html.childNodes.length; i++) {
                    if (i == selection.anchorOffset) {
                        chat_html.insertBefore(pasted_text, chat_html .childNodes[i])
                    }
                }
            } else {
                // ????????????????????????????????????
                chat_html.appendChild(pasted_text)
            }
            // ????????????????????????
            var range = document.createRange()
            // ???????????????????????????????????????????????????
            range.selectNodeContents(pasted_text)
            // ????????????????????????????????????????????????
            range.setStart(pasted_text, pasted_text.length)
            // ????????????????????????????????????
            range.collapse(true)
            // ???????????????????????????????????????
            selection.removeAllRanges()
            // ????????????????????????
            selection.addRange(range)
        } else {
            // ?????????????????????????????????????????????
			try{
				var range = selection.getRangeAt(0)
			}catch(err){
				return false;
			}
            // ??????????????????????????????????????????????????????textNode??????
            var textNode = range.startContainer;
            // ??????????????????
            var rangeStartOffset = range.startOffset;
            // ??????????????????????????????????????????????????????
            textNode.insertData(rangeStartOffset, str)
            // ?????????????????????????????????????????????????????????
            range.setStart(textNode, rangeStartOffset + str.length)
            // ?????????????????????????????????
            range.collapse(true)
            // ???????????????????????????????????????
            selection.removeAllRanges()
            // ????????????????????????
            selection.addRange(range)
        }
        // ??????????????????????????????????????????
		try{
			 _this.lastEditRange = selection.getRangeAt(0)
		}catch(err){
//				console.log(err)
		}
	},
	/**
    * @description ????????????
    */
	screenshot:function(callback){
		var _this = this;
		body = $('body'), win = $(window)[0];
		body.append('<div id="mask_bgimage" style="width:' + win.innerWidth + 'px;height:' + win.innerHeight + 'px"></div>\
		<div class="mask_view"></div>\
		<div class="mask_select_view"></div>\
		<div class="toolbar" style="right:10px;bottom:10px;">\
			<span title="???????????????"><svg xmlns="https://www.w3.org/2000/svg" focusable="false" aria-label="Drag" fill="#BDBDBD" height="56" width="16" viewBox="-2 2 12 12"><circle cx="1.5" cy="1.5" r="1.5"></circle><circle cx="1.5" cy="7.5" r="1.5"></circle><circle cx="1.5" cy="13.5" r="1.5"></circle><circle cx="6.5" cy="1.5" r="1.5"></circle><circle cx="6.5" cy="7.5" r="1.5"></circle><circle cx="6.5" cy="13.5" r="1.5"></circle></svg></span>\
			<span title="????????????" class="active">\
			<svg xmlns="https://www.w3.org/2000/svg" focusable="false" viewBox="0 0 24 24" height="30" width="30" fill="#FDD835"><path d="M3 3h18v18H3z"></path></svg>\
			<svg xmlns="https://www.w3.org/2000/svg" focusable="false" aria-label=""  viewBox="0 0 24 24" height="30" width="30" fill="#757575"><path d="M21 17h-2.58l2.51 2.56c-.18.69-.73 1.26-1.41 1.44L17 18.5V21h-2v-6h6v2zM19 7h2v2h-2V7zm2-2h-2V3.08c1.1 0 2 .92 2 1.92zm-6-2h2v2h-2V3zm4 8h2v2h-2v-2zM9 21H7v-2h2v2zM5 9H3V7h2v2zm0-5.92V5H3c0-1 1-1.92 2-1.92zM5 17H3v-2h2v2zM9 5H7V3h2v2zm4 0h-2V3h2v2zm0 16h-2v-2h2v2zm-8-8H3v-2h2v2zm0 8.08C3.9 21.08 3 20 3 19h2v2.08z"></path></svg>\
			</span>\
			<span title="??????????????????">\
			<svg xmlns="https://www.w3.org/2000/svg" focusable="false" viewBox="0 0 24 24" height="30" width="30"><path d="M3 3h18v18H3z"></path></svg>\
			<svg xmlns="https://www.w3.org/2000/svg" focusable="false" aria-label=""  viewBox="0 0 24 24" height="30" width="30" fill="#757575"><path d="M21 17h-2.58l2.51 2.56c-.18.69-.73 1.26-1.41 1.44L17 18.5V21h-2v-6h6v2zM19 7h2v2h-2V7zm2-2h-2V3.08c1.1 0 2 .92 2 1.92zm-6-2h2v2h-2V3zm4 8h2v2h-2v-2zM9 21H7v-2h2v2zM5 9H3V7h2v2zm0-5.92V5H3c0-1 1-1.92 2-1.92zM5 17H3v-2h2v2zM9 5H7V3h2v2zm4 0h-2V3h2v2zm0 16h-2v-2h2v2zm-8-8H3v-2h2v2zm0 8.08C3.9 21.08 3 20 3 19h2v2.08z"></path></svg>\          </span>\
			<span class = "finish">??????</span>\
		</div>');
		html2canvas(body[0], {useCORS: true,x:0,y:0,scale:1}).then(function (canvas) {
			// canvas.width = win.innerWidth;canvas.height = win.innerHeight;
			// $(canvas).css({ "width": win.innerWidth, "height": win.innerHeight })
			var canvas_2d = canvas.getContext("2d");
			$('#mask_bgimage').css({ "width": win.innerWidth, "height": win.innerHeight }).empty().append(canvas);
			$('.toolbar,.mask_view').show();
			$('.toolbar span').click(function () {
				var index = $(this).index();
				if (index == 1 || index == 2) {
					$(this).addClass('active').siblings().removeClass('active');
				} else if (index == 3) {
					var arry = [], scroll_top = $('#mask_bgimage').scrollTop();
					$('.mask_select_view>div').each(function () {
						var data = $(this).data();
						if ($(this).hasClass('select_area')) {
							canvas_2d.strokeStyle = "red"; // ????????????????????????
							canvas_2d.lineJoin = "round";
							canvas_2d.lineWidth = "2";// ????????????????????????
							canvas_2d.strokeRect(data.left, data.top, data.width, data.height);
						} else {
							canvas_2d.fillStyle = "#333";
							canvas_2d.fillRect(data.left, data.top, data.width, data.height);
						}
					});
					var image = new Image();
					image.setAttribute("crossOrigin",'Anonymous');
					var userAgent = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
		        	if(userAgent){
						try{
				            var src = canvas.toDataURL("image/png");
				            image.setAttribute("crossOrigin",'Anonymous');
					        image.setAttribute("src",src);
						  //  canvas.toBlob(function(blob) {
						  //      try{
        //                             var url = URL.createObjectURL(blob);
        //                             console.log("object url:" + url)
        //                             image.setAttribute("src",url);
						  //      }catch(err){
						  //          console.log("err:"+err)
						  //      }
        //                     });
						}catch(err){
							console.log("??????1?????????")
						}
					}else{
						try{
							image.src = canvas.toDataURL("image/png");
							var url = image.src;
							image.setAttribute("onclick",'box.thumbnail(\'' + url + '\')');
						}catch(err){
							console.log("??????2?????????")
						}
					}
			    	$("#feedback-box").show();
					$('.debugs').empty();
					$('.debugs').append($('<span class="glyphicon glyphicon-chevron-down"></span>'));
					if(callback != undefined){
					    $(callback).empty();
				        $(callback).append(image)
					    $(".feedback-border,.feedback-mask").show();
					}else{
					    $(".chat_html").append(image);
					}
				}
			});
			
			$('.toolbar span:eq(0)').on('mousedown', function (e) {
				e = e || window.event;
				var toolbar = $('.toolbar'), toolbar_left = toolbar.offset().left, toolbar_top = toolbar.offset().top;
				$(document).on('mousemove', function (ev) {
					var win = $(window)[0], win_height = win.innerHeight, win_width = win.innerWidth,
						offsetX = ev.clientX - e.clientX, offsetY = ev.clientY - e.clientY, config = { right: 'inline', bottom: 'inline' };
					config.left = toolbar_left + offsetX;
					config.top = toolbar_top + offsetY;
					if (config.left <= 0) {
						config.left = 0;
					} else if (win_width <= (config.left + toolbar[0].clientWidth)) {
						config.left = win_width - toolbar[0].clientWidth;
					}
					if (config.top <= 0) {
						config.top = 0;
					} else if (win_height <= (config.top + toolbar[0].clientHeight)) {
						config.top = win_height - toolbar[0].clientHeight;
					}
					toolbar.css(config);
				});
				$(document).on('mouseup', function (ev) {
					$(this).unbind('mousemove mouseup');
				});
				e.stopPropagation();
				e.preventDefault();
			});
			$('.mask_select_view').on('mousedown', function (ev) {
				var x = ev.clientX, y = ev.clientY, width = 0, height = 0, status = $('.toolbar span.active').index() === 1;
				select_view = $('<div class="' + (status ? 'select_area' : 'select_ban') + ' show"  style="'+(status ? 'z-index:3;' : 'z-index:9999999;')+'">' + (status ? '<canvas></canvas>' : '') + '</div>');
				if (status) select_canvas = select_view.find('canvas')[0].getContext('2d');
				$(this).append(select_view);
				$(this).on('mousemove', function (ev) {
					var move_x = ev.clientX, move_y = ev.clientY, left = (x > move_x ? move_x : null || x < move_x ? x : null), top = (y > move_y ? move_y : null || y < move_y ? y : null);
					width = Math.abs(x - move_x), height = Math.abs(y - move_y);
					if (width > 10 && height > 10) {
						select_view.css({ left: left + 'px', top: top + 'px', width: width + 4 + 'px', height: height + 4 +'px' }).data({ left: left, top: top, width: width, height: height });
						select_view.find('canvas').attr({ width: (width) + 'px', height: (height) + 'px' });
						if (status) select_canvas.drawImage(canvas, left + 2, top + 2, width, height, 0, 0, width, height); //??????????????????
					}
				});
				$(this).on('mouseup', function (ev) {
					var up_x = ev.clientX, up_y = ev.clientY;
					if (width < 10 && height < 10) select_view.remove();
					$(this).unbind('mousemove mouseup');
					select_view.append('<div class="close_area"></div>');
				});
				select_view.on('click', '.close_area', function () {
					$(this).parent().remove();
				});
				select_view.on('mousemove', function (ev) {
					ev.stopPropagation();
				});
				ev.stopPropagation();
				ev.preventDefault();
			});
			$(document).keyup(function (ev) {
				if (ev.keyCode === 27) {
					$('#mask_bgimage,.mask_view,.mask_select_view,.toolbar').remove();
					if(callback != undefined){
					    $(".feedback-border,.feedback-mask").show();
					}
				}
			});
			$(".finish").on("click", function (e) {
				$('#mask_bgimage,.mask_view,.mask_select_view,.toolbar').remove();
				e.stopPropagation();
			});
		});
	},
	/**
    * @description ????????????????????????
    */
    disconnect:function(){
		var _this =this;
		try{
			if(_this.bws&&_this.bws.readyState == 1){
				_this.bws.close();
			}
			clearInterval(_this.ping);
			_this.workorder=undefined;
		}catch(err){
			// console.log("?????????????????????");
		}

	},
	/**
    * @description ???????????????
	* @param {String} src ????????????
    */
   	thumbnail:function(src){
		var that = this
		, mask = $('<div class="preview_images_mask" style="z-index: 9999999999"><div class="preview_head"><span class="preview_title">??????</span><span class="preview_small hidden" title="????????????"><span class="glyphicon glyphicon-resize-small" aria-hidden="true"></span></span><span class="preview_full" title="???????????????"><span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span></span><span class="preview_close" title="????????????????????????"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span></div><div class="preview_body"><img id="preview_images" src="' + src + '"></div><div class="preview_toolbar"><a href="javascript:;" title="?????????"><span class="glyphicon glyphicon-repeat reverse-repeat" aria-hidden="true"></span></a><a href="javascript:;" title="?????????"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></a><a href="javascript:;" title="????????????"><span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span></a><a href="javascript:;" title="????????????"><span class="glyphicon glyphicon-zoom-out" aria-hidden="true"></span></a><a href="javascript:;" title="????????????"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></a><a href="javascript:;" title="????????????"><span class="glyphicon glyphicon-list" aria-hidden="true"></span></a></div></a></div></div>')
		, area = [window.innerWidth, window.innerHeight]
		, images_config = {
		natural_width: 0,
		natural_height: 0,
		init_width: 0,
		init_height: 0,
		preview_width: 0,
		preview_height: 0,
		current_width: 0,
		current_height: 0,
		current_left: 0,
		current_top: 0,
		rotate: 0,
		scale: 1,
		images_mouse: !1
	};
	if ($(".preview_images_mask").length > 0)
		return $("#preview_images").attr("src",src),
		!1;
	function auto_images_size(transition) {
		var rotate = Math.abs(images_config.rotate / 90)
			, preview_width = rotate % 2 == 0 ? images_config.preview_width : images_config.preview_height
			, preview_height = rotate % 2 == 0 ? images_config.preview_height : images_config.preview_width
			, preview_images = $("#preview_images")
			, css_config = {};
		images_config.init_width = images_config.natural_width,
		images_config.init_height = images_config.natural_height,
		images_config.init_width > preview_width && (images_config.init_width = preview_width,
		images_config.init_height = parseFloat((preview_width / images_config.natural_width * images_config.init_height).toFixed(2))),
		images_config.init_height > preview_height && (images_config.init_width = parseFloat((preview_height / images_config.natural_height * images_config.init_width).toFixed(2)),
		images_config.init_height = preview_height),
		images_config.current_width = parseFloat(images_config.init_width * images_config.scale),
		images_config.current_height = parseFloat(images_config.init_height * images_config.scale),
		images_config.current_left = parseFloat(((images_config.preview_width - images_config.current_width) / 2).toFixed(2)),
		images_config.current_top = parseFloat(((images_config.preview_height - images_config.current_height) / 2).toFixed(2)),
		css_config = {
			width: images_config.current_width,
			height: images_config.current_height,
			top: images_config.current_top,
			left: images_config.current_left,
			display: "inline",
			transform: "rotate(" + images_config.rotate + "deg)",
			opacity: 1,
			transition: "all 400ms"
		},
		!1 === transition && delete css_config.transition,
		preview_images.css(css_config)
	}
	$("body").css("overflow", "hidden").append(mask),
	images_config.preview_width = mask[0].clientWidth,
	images_config.preview_height = mask[0].clientHeight,
	$(".preview_body img").load((function() {
		var img = $(this)[0];
		// $(this).attr("data-index") || $(this).attr("data-index", data.images_id),
		images_config.natural_width = img.naturalWidth,
		images_config.natural_height = img.naturalHeight,
		auto_images_size(!1)
	}
	)),
	$(".preview_images_mask .preview_head").on("mousedown", (function(e) {
		e = e || window.event;
		var drag = $(this).parent();
		if ($("body").addClass("select"),
		$(this).onselectstart = $(this).ondrag = function() {
			return !1
		}
		,
		!$(e.target).hasClass("preview_close")) {
			var diffX = e.clientX - drag.offset().left
				, diffY = e.clientY - drag.offset().top;
			$(document).on("mousemove", (function(e) {
				var left = (e = e || window.event).clientX - diffX
					, top = e.clientY - diffY;
				left < 0 ? left = 0 : left > window.innerWidth - drag.width() && (left = window.innerWidth - drag.width()),
				top < 0 ? top = 0 : top > window.innerHeight - drag.height() && (top = window.innerHeight - drag.height()),
				drag.css({
					left: left,
					top: top,
					margin: 0
				})
			}
			)).on("mouseup", (function() {
				$(this).unbind("mousemove mouseup")
			}
			))
		}
	}
	)),
	$(".preview_images_mask #preview_images").on("mousedown", (function(e) {
		e = e || window.event,
		$(this).onselectstart =$(this).ondrag = function() {
			return !1
		}
		;
		var images = $(this)
			, preview = $(".preview_images_mask").offset()
			, diffX = e.clientX - preview.left
			, diffY = e.clientY - preview.top;
		$(".preview_images_mask").on("mousemove", (function(e) {
			var offsetX = (e = e || window.event).clientX - preview.left - diffX, offsetY = e.clientY - preview.top - diffY, rotate = Math.abs(images_config.rotate / 90), preview_width = rotate % 2 == 0 ? images_config.preview_width : images_config.preview_height, preview_height = rotate % 2 == 0 ? images_config.preview_height : images_config.preview_width, left, top;
			if (images_config.current_width > preview_width) {
				var max_left = preview_width - images_config.current_width;
				(left = images_config.current_left + offsetX) > 0 ? left = 0 : left < max_left && (left = max_left),
				images_config.current_left = left
			}
			if (images_config.current_height > preview_height) {
				var max_top = preview_height - images_config.current_height;
				(top = images_config.current_top + offsetY) > 0 ? top = 0 : top < max_top && (top = max_top),
				images_config.current_top = top
			}
			images_config.current_height > preview_height && images_config.current_top <= 0 && images_config.current_height - preview_height <= images_config.current_top && (images_config.current_top -= offsetY),
			images.css({
				left: images_config.current_left,
				top: images_config.current_top
			})
		}
		)).on("mouseup", (function() {
			$(this).unbind("mousemove mouseup")
		}
		)).on("dragstart", (function() {
			e.preventDefault()
		}
		))
	}
	)).on("dragstart", (function() {
		return !1
	}
	)),
	$(".preview_close").click((function(e) {
		$(".preview_images_mask").remove()
	}
	)),
	$(".preview_toolbar a").click((function() {
		var index = $(this).index()
			, images = $("#preview_images");
		switch (index) {
		case 0:
		case 1:
			images_config.rotate = index ? images_config.rotate + 90 : images_config.rotate - 90,
			auto_images_size();
			break;
		case 2:
		case 3:
			if (3 == images_config.scale && 2 == index || .2 == images_config.scale && 3 == index)
				return layer.msg(images_config.scale >= 1 ? "???????????????????????????????????????" : "???????????????????????????????????????"),
				!1;
			images_config.scale = (2 == index ? Math.round(10 * (images_config.scale + .4)) : Math.round(10 * (images_config.scale - .4))) / 10,
			auto_images_size();
			break;
		case 4:
			var scale_offset = images_config.rotate % 360;
			scale_offset >= 180 ? images_config.rotate += 360 - scale_offset : images_config.rotate -= scale_offset,
			images_config.scale = 1,
			auto_images_size()
		}
	}
	)),
	$(".preview_full,.preview_small").click((function() {
		$(this).hasClass("preview_full") ? ($(this).addClass("hidden").prev().removeClass("hidden"),
		images_config.preview_width = area[0],
		images_config.preview_height = area[1],
		mask.css({
			width: area[0],
			height: area[1],
			top: 0,
			left: 0,
			margin: 0,
			zIndex:9999999999
		}).data("type", "full"),
		auto_images_size()) : ($(this).addClass("hidden").next().removeClass("hidden"),
		$(".preview_images_mask").removeAttr("style"),
		images_config.preview_width = 750,
		images_config.preview_height = 650,
		auto_images_size())
	}
	)),
	$(".preview_cut_view a").click((function() {
		var images_src = ""
			, preview_images = $("#preview_images")
			, images_id = parseInt(preview_images.attr("data-index"));
		$(this).index() ? (images_id = images_id == that.file_images_list.length - 1 ? 0 : images_id + 1,
		images_src = that.file_images_list[images_id]) : (images_id = 0 === images_id ? that.file_images_list.length - 1 : images_id - 1,
		images_src = that.file_images_list[images_id]),
		preview_images.attr("data-index", images_id).attr("src", "/download?filename=" + images_src),
		$(".preview_title").html(that.get_path_filename(images_src))
	}
	))
	},
	/**
    * @description ??????socket????????????
	* @param {String} workorder ????????????
    */
    keepActive:function(workorder){
		var _this = this,
		interval = 15000,i=0;
		if (_this.bws==null || _this.bws.readyState == 3 || _this.bws.readyState == 2) {
			_this.connect(workorder);
			try{
				_this.send_server(_this, "ping");
			}catch(err){
				// console.log("ping-error")
			}
		}
        var _ping = setInterval(function(){
            try{
				// _this.bws.send(JSON.stringify({"id":workorder,"content":"ping","workorder":workorder,"type":5}));
				_this.send_server(_this, "ping");
            } catch(err) {
				// console.log("error.");
            }
		}, interval);
		_this.ping = _ping;
    }
}

var Snowflake = /** @class */ (function() {
	function Snowflake(_workerId, _dataCenterId, _sequence) {
		this.twepoch = Number(1288834974657);
		// this.twepoch = 0n;
		this.workerIdBits = Number(5);
		this.dataCenterIdBits = Number(5);
		this.maxWrokerId = Number(-1) ^ (Number(-1) << this.workerIdBits); // ?????????31
		this.maxDataCenterId = Number(-1) ^ (Number(-1) << this.dataCenterIdBits); // ?????????31
		this.sequenceBits = Number(12);
		this.workerIdShift = this.sequenceBits; // ?????????12
		this.dataCenterIdShift = this.sequenceBits + this.workerIdBits; // ?????????17
		this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.dataCenterIdBits; // ?????????22
		this.sequenceMask = Number(-1) ^ (Number(-1) << this.sequenceBits); // ?????????4095
		this.lastTimestamp = Number(-1);
		//???????????????,??????????????????
		this.workerId = Number(1);
		this.dataCenterId = Number(1);
		this.sequence = Number(0);
		// if(this.workerId > this.maxWrokerId || this.workerId < 0) {
		// 	thrownew Error('_workerId must max than 0 and small than maxWrokerId-[' + this.maxWrokerId + ']');
		// }
		// if(this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0) {
		// 	thrownew Error('_dataCenterId must max than 0 and small than maxDataCenterId-[' + this.maxDataCenterId + ']');
		// }

		this.workerId = Number(_workerId);
		this.dataCenterId = Number(_dataCenterId);
		this.sequence = Number(_sequence);
	}
	Snowflake.prototype.tilNextMillis = function(lastTimestamp) {
		var timestamp = this.timeGen();
		while(timestamp <= lastTimestamp) {
			timestamp = this.timeGen();
		}
		return Number(timestamp);
	};
	Snowflake.prototype.timeGen = function() {
		return Number(Date.now());
	};
	Snowflake.prototype.nextId = function() {
		var timestamp = this.timeGen();
		// if(timestamp < this.lastTimestamp) {
		// 	thrownew Error('Clock moved backwards. Refusing to generate id for ' +
		// 		(this.lastTimestamp - timestamp));
		// }
		if(this.lastTimestamp === timestamp) {
			this.sequence = (this.sequence + Number(1)) & this.sequenceMask;
			if(this.sequence === Number(0)) {
				timestamp = this.tilNextMillis(this.lastTimestamp);
			}
		} else {
			this.sequence =  Number(0);
		}
		this.lastTimestamp = timestamp;
		return((timestamp - this.twepoch) << this.timestampLeftShift) |
			(this.dataCenterId << this.dataCenterIdShift) |
			(this.workerId << this.workerIdShift) |
			this.sequence;
	};
	return Snowflake;
}());
/** workorder end **/










