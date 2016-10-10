/***
    @description: assigner.js;
    @Author: ray;
    @create date: 2016-10-10;
***/

(function($){
	$.fn.assigner = function(options){
		$.fn.assigner.defaults = {
			data: [],
			initData: [],
			lateData : [],
			lateText: '最近',
			multi: true, 	//多选	
		}
		var params = $.extend({}, $.fn.assigner.defaults, options);

		return this.each(function() {
			var input = $(this);
			var node = `<div class="assigner">
				<div class="assigner-select `+ input.attr('class') +`">
					<ul></ul>
				</div>
				<div class="assigner-body">
					<div class="assigner-body-inner">
						<div class="assigner-search">
							<input type="text" placeholder="`+ input.attr('placeholder') +`">
						</div>
						<div class="assigner-letter">
							<a class="in">a</a><a>b</a><a>c</a><a>d</a><a>e</a><a>f</a><a>g</a><a>h</a><a>i</a><a>j</a><a>k</a><a>l</a><a>m</a><a>n</a><a>o</a><a>p</a><a>q</a><a>r</a><a>s</a><a>t</a><a>u</a><a>v</a><a>w</a><a>x</a><a>y</a><a>z</a>
						</div>
						<div class="assigner-list"><ul></ul></div>
					</div>
					<div class="assigner-tabs"><ul></ul></div>
				</div>
			</div>`;
			var assigner = input.hide().after(node).next('.assigner');

			var assign = {
				input: input,
				assigner: assigner,
				selector: assigner.find('.assigner-select ul'),
				searcher: assigner.find('.assigner-search input'),
				letter: assigner.find('.assigner-letter'),
				tabs: assigner.find('.assigner-tabs ul'),
				list: assigner.find('.assigner-list ul'),
				data: params.data || [],
				lateText: params.lateText,
				lateData : params.lateData || [],
				multi: params.multi,
				depts: ['同事'],
				selected: input.val().split(',') || [],

				init: function(){
					var t = this;

					t.initDept();
					t.initMember();
					t.initSelector();
					t.initSearcher();
				},	
				// 部门初始化
				initDept: function(){
					var t = this, depts = [];

					t.lateData.length && depts.push(t.lateText);

					// 节点
					t.tabs.html('<li>'+ depts.concat(t.depts).join('</li><li>') +'</li>');

					// 事件
					t.assigner.on('click', '.assigner-tabs li', function(){
						var me = $(this), members = [];

						if(me.text() === t.lateText){
							members = t.getLateData();
						}else{
							members = t.data;
						}

						me.addClass('on').siblings().removeClass('on');
						t.deptIndex = me.index();
						t.setMember(members);
					})
					t.tabs.find('li').eq(0).click();
				},
				// 部门分组
				groupByDept: function(){
					var dept = [];
					
					if(this.lateData.length){
						dept = [this.lateText];
					}
					$.each(this.data, function(){
						dept.indexOf(this.dept)<0 && dept.push(this.dept);
					})
					return dept;
				},
				// 根据部门，获取人员信息集合
				getMembersByDept: function(dept){
					return $.map(this.data, function(v){
						return v.dept === dept ? v : null;
					})
				},
				// 根据字母，获取人员信息集合
				getMembersByKey: function(key){
					return $.map(this.data, function(v){
						return v.key.indexOf(key) === 0 ? v : null;
					})
				},
				// 根据汉字，获取人员信息集合
				getMembersByWord: function(key){
					return $.map(this.data, function(v){
						return v.name.indexOf(key) >= 0 ? v : null;
					})
				},
				// 根据id，获取人员信息
				getSelectedById: function(id){
					var member = [];
					$.each(this.data, function(i, v){
						if(v.id === id){
							member = v;
							return false;
						}
					})
					return member;
				},
				// 获取最近人员信息集合
				getLateData: function(){
					var t = this;
					return $.map(t.data, function(v){
						return t.lateData.indexOf(v.id) >= 0 ? v : null;
					})
				},
				// 人员信息初始化
				initMember: function(){
					var t = this;
					t.assigner.on('click', '.assigner-list li', function(){
						var me = $(this), id = me.attr('data-id');
						if(t.multi){
							var i = t.selected.indexOf(id);
							i < 0 ? t.selected.push(id) : t.selected.splice(i, 1);
							me.toggleClass('on');
						}else{
							t.selected = [];
							t.selected.push(id);
							me.addClass('on').siblings().removeClass('on');
						}
						t.setSelector();
					})
				},
				// 人员信息设置
				setMember: function(members){
					var t = this, className = "", memberStr = "";

					if(members.length){
						$.each(members, function(i, v){
							className = t.selected.indexOf(v.id) < 0 ? '' : 'on';
							memberStr += '<li class="'+ className +'" data-id="'+ v.id +'" data-name="'+ v.name +'"><img class="face" src="assets/images/face.png"><span class="name">'+ v.name +'</span><span class="dept">（'+ v.dept +'）</span></li>';
						})
						t.list.html(memberStr);
					}
				},
				// 选择人员初始化
				initSelector: function(){
					var t = this;
					// 删除
					t.assigner.on('click', '.option-remove', function(){
						var me = $(this), 
							id = me.attr('data-id'), 
							i = t.selected.indexOf(id);

						if(i >= 0){
							t.removeSelectItem(i);
						}
						return false;
					})
					t.selected.length&&t.setSelector();
				},
				// 选择人员设置
				setSelector: function(){
					var t = this, member = [], str = "";

					$.each(t.selected, function(i, id){
						member = t.getSelectedById(id);
						if(member.id){
							str += '<li class="option">'+ member.name +'<a data-id="'+ member.id +'" class="option-remove">×</a></li>';
						}
					})
					t.selector.html(str);
				},
				// 取消选择的人员
				removeSelectItem: function(i){
					this.selected.splice(i, 1);		// 移除
					this.tabs.find('.on').click();	// 更新人员列表
					this.setSelector();				// 重置选择人员
				},
				// 输入检索
				initSearcher: function(){
					var t = this, count = 0, timer = 0;

					t.searcher.on('keydown', function(e){
						console.log(e.keyCode);
						switch(e.keyCode){							
						  	// 左方向键
							case 13:
								_choseMove('enter');
						  		break;

						  	// 左方向键
							case 38:
								_choseMove('up');
								return false;
						  		break;
						  	// 右方向键
						  	case 40:
						  		_choseMove('down');
						  		return false;
						  		break;
						}
					});
					function _choseMove(v){
						console.log(v);
					}

					t.searcher.on('input', function(e){
						var v = this.value

						clearTimeout(timer);
						timer = setTimeout(function(){
							if(v === ""){
								t.tabs.find('li').eq(t.deptIndex).click();
							}else{
								t.tabs.find('li').removeClass('on');
								t.setMember(t.searchMatch(v));
							}
						}, 300)
						return false;
					});

					t.assigner.on('click', '.assigner-select', function(){
						t.searcher.focus();
					})
				},
				// 匹配字符，返回匹配数组
				searchMatch: function(key){
					var t = this, arr = [];

            		//字母匹配
                	if (/^[A-Za-z]+$/.test(key)){
                		arr = t.getMembersByKey(key);
					}
					//汉字匹配
					else{
						arr = t.getMembersByWord(key);
					}
	            	return arr;
	            }
			}
			assign.init();

    	})//each End

	}//scroll End

})(jQuery)